// Öffnet das Stripe-Kundenportal (Rechnungen, Zahlungsmittel, Kündigung) für Firmen-Admins.
import { preflight, json, siteUrl } from "../_shared/http.ts";
import { stripe } from "../_shared/stripe.ts";
import { admin, userFromRequest } from "../_shared/db.ts";

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  const user = await userFromRequest(req);
  if (!user) return json(req, { error: "unauthorized" }, 401);
  const { data: company } = await admin().from("companies").select("stripe_customer_id").eq("owner_id", user.id).maybeSingle();
  if (!company?.stripe_customer_id) return json(req, { error: "no-customer" }, 400);
  try {
    const session = await stripe("POST", "/billing_portal/sessions", {
      customer: company.stripe_customer_id,
      return_url: `${siteUrl()}/admin/`,
    });
    return json(req, { url: session.url });
  } catch (e) {
    console.error(e);
    return json(req, { error: "portal-failed" }, 500);
  }
});
