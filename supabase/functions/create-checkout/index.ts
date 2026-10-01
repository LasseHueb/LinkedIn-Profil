// Erstellt eine Stripe-Checkout-Session und gibt die Weiterleitungs-URL zurück.
import { preflight, json, readJson, env, siteUrl } from "../_shared/http.ts";
import { stripe } from "../_shared/stripe.ts";
import { admin, userFromRequest } from "../_shared/db.ts";

const PLAN_PRICES: Record<string, string> = { starter: "STRIPE_PRICE_STARTER", team: "STRIPE_PRICE_TEAM" };

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  try {
    const body = await readJson<{ product?: string; locale?: string; consent?: boolean }>(req);
    const locale = body.locale === "en" ? "en" : "de";

    if (body.product === "premium") {
      // Zustimmung zum vorzeitigen Erlöschen des Widerrufsrechts (Checkbox im Dialog) ist Pflicht
      if (body.consent !== true) return json(req, { error: "consent-required" }, 400);
      const session = await stripe("POST", "/checkout/sessions", {
        mode: "payment",
        line_items: [{ price: env("STRIPE_PRICE_PREMIUM"), quantity: 1 }],
        success_url: `${siteUrl()}/premium/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl()}/premium/?abgebrochen=1`,
        locale,
        allow_promotion_codes: "true",
        invoice_creation: Deno.env.get("STRIPE_INVOICES") === "true" ? { enabled: "true" } : undefined,
        automatic_tax: Deno.env.get("STRIPE_AUTOMATIC_TAX") === "true" ? { enabled: "true" } : undefined,
        metadata: { product: "premium", consent_at: new Date().toISOString() },
        payment_intent_data: { metadata: { product: "premium" } },
      });
      return json(req, { url: session.url });
    }

    if (body.product && body.product in PLAN_PRICES) {
      // Firmen-Paket: nur für angemeldete Firmen-Admins (Magic-Link-Login)
      const user = await userFromRequest(req);
      if (!user) return json(req, { error: "unauthorized" }, 401);
      const { data: company } = await admin().from("companies").select("id,name,stripe_customer_id,plan,plan_expires_at").eq("owner_id", user.id).maybeSingle();
      if (!company) return json(req, { error: "no-company" }, 400);
      const session = await stripe("POST", "/checkout/sessions", {
        mode: "subscription",
        line_items: [{ price: env(PLAN_PRICES[body.product]), quantity: 1 }],
        success_url: `${siteUrl()}/admin/?checkout=success`,
        cancel_url: `${siteUrl()}/admin/?checkout=cancel`,
        locale,
        client_reference_id: company.id,
        customer: company.stripe_customer_id ?? undefined,
        customer_email: company.stripe_customer_id ? undefined : user.email,
        billing_address_collection: "required",
        tax_id_collection: { enabled: "true" },
        allow_promotion_codes: "true",
        automatic_tax: Deno.env.get("STRIPE_AUTOMATIC_TAX") === "true" ? { enabled: "true" } : undefined,
        metadata: { product: body.product, company_id: company.id },
        subscription_data: { metadata: { product: body.product, company_id: company.id } },
      });
      return json(req, { url: session.url });
    }

    return json(req, { error: "unknown-product" }, 400);
  } catch (e) {
    console.error(e);
    return json(req, { error: "checkout-failed" }, 500);
  }
});
