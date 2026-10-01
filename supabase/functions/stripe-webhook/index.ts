// Stripe-Webhook: schaltet Premium nach Zahlung frei und sperrt Lizenzen bei Erstattung.
// In Stripe als Endpoint eintragen: https://<projekt>.supabase.co/functions/v1/stripe-webhook
import { env } from "../_shared/http.ts";
import { verifyWebhook } from "../_shared/stripe.ts";
import { issueLicense } from "../_shared/license.ts";
import { admin } from "../_shared/db.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });
  const raw = await req.text();
  const ok = await verifyWebhook(raw, req.headers.get("stripe-signature"), env("STRIPE_WEBHOOK_SECRET"));
  if (!ok) return new Response("invalid signature", { status: 400 });

  const event = JSON.parse(raw);
  const obj = event.data?.object ?? {};

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        if (obj.payment_status !== "paid") break; // z. B. SEPA: erst bei async_payment_succeeded
        if (obj.metadata?.product === "premium") await issueLicense(obj);
        break;
      }
      case "charge.refunded": {
        // Vollständige Erstattung → Lizenz sperren
        if (obj.refunded && obj.payment_intent) {
          await admin().from("licenses").update({ revoked: true, revoked_reason: "refund" }).eq("stripe_payment_intent", obj.payment_intent);
        }
        break;
      }
      case "charge.dispute.created": {
        if (obj.payment_intent) {
          await admin().from("licenses").update({ revoked: true, revoked_reason: "dispute" }).eq("stripe_payment_intent", obj.payment_intent);
        }
        break;
      }
    }
  } catch (e) {
    console.error("Webhook-Verarbeitung fehlgeschlagen", event.type, e);
    return new Response("error", { status: 500 }); // Stripe versucht es später erneut
  }
  return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } });
});
