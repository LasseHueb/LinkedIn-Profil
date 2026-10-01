// Stripe-Webhook: schaltet Premium nach Zahlung frei und sperrt Lizenzen bei Erstattung.
// In Stripe als Endpoint eintragen: https://<projekt>.supabase.co/functions/v1/stripe-webhook
import { env } from "../_shared/http.ts";
import { verifyWebhook } from "../_shared/stripe.ts";
import { issueLicense } from "../_shared/license.ts";
import { admin } from "../_shared/db.ts";
import { stripe } from "../_shared/stripe.ts";

const GRACE_DAYS = 3; // Kulanz nach Ablauf der Abrechnungsperiode (z. B. verspätete Zahlung)
const PLANS = ["starter", "team"];

/** Überträgt den Status eines Stripe-Abos auf die Firma. */
async function syncSubscription(sub: any, companyId?: string) {
  const product = sub.metadata?.product;
  const id = companyId ?? sub.metadata?.company_id;
  // Ab Stripe-API 2025-03 liegt current_period_end am Abo-Posten
  const periodEnd = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end;
  const ended = ["canceled", "unpaid", "incomplete_expired"].includes(sub.status);
  const update = {
    plan: ended || !PLANS.includes(product) ? "none" : product,
    plan_status: sub.status,
    plan_expires_at: periodEnd ? new Date((periodEnd + GRACE_DAYS * 86400) * 1000).toISOString() : null,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer?.id,
    stripe_subscription_id: sub.id,
  };
  const q = admin().from("companies").update(update);
  const { error } = id ? await q.eq("id", id) : await q.eq("stripe_subscription_id", sub.id);
  if (error) throw error;
}

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
        if (PLANS.includes(obj.metadata?.product) && obj.subscription) {
          const sub = await stripe("GET", `/subscriptions/${obj.subscription}`);
          await syncSubscription(sub, obj.metadata.company_id ?? obj.client_reference_id);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        if (PLANS.includes(obj.metadata?.product)) await syncSubscription(obj);
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
