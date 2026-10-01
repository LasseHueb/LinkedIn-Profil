// Nach der Rückleitung von Stripe: Lizenz für die bezahlte Session abholen.
// Funktioniert auch, wenn der Webhook noch nicht angekommen ist (idempotent).
import { preflight, json, readJson } from "../_shared/http.ts";
import { stripe } from "../_shared/stripe.ts";
import { issueLicense } from "../_shared/license.ts";

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  const { session_id } = await readJson<{ session_id?: string }>(req);
  if (typeof session_id !== "string" || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(session_id)) {
    return json(req, { error: "invalid-session" }, 400);
  }
  try {
    const session = await stripe("GET", `/checkout/sessions/${session_id}`);
    if (session.metadata?.product !== "premium") return json(req, { error: "wrong-product" }, 400);
    if (session.payment_status !== "paid") return json(req, { status: "pending" }, 202);
    const lic = await issueLicense(session as any);
    return json(req, { key: lic.key, email: lic.email });
  } catch (e) {
    console.error(e);
    return json(req, { error: "claim-failed" }, 500);
  }
});
