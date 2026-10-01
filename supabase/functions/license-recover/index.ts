// Magic-Link per E-Mail: schickt alle gültigen Lizenzschlüssel an die Kauf-E-Mail-Adresse.
// Antwortet immer gleich, damit nicht herausgefunden werden kann, wer gekauft hat.
import { preflight, json, readJson, isEmail } from "../_shared/http.ts";
import { admin } from "../_shared/db.ts";
import { sendLicenseEmail } from "../_shared/license.ts";

const THROTTLE_MS = 5 * 60 * 1000;

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  const { email } = await readJson<{ email?: string }>(req);
  if (!isEmail(email)) return json(req, { error: "invalid-email" }, 400);

  try {
    const db = admin();
    const { data } = await db.from("licenses")
      .select("id,key,last_email_at")
      .eq("email", email.trim().toLowerCase())
      .eq("revoked", false);
    const rows = data ?? [];
    const recent = rows.some((r) => r.last_email_at && Date.now() - new Date(r.last_email_at).getTime() < THROTTLE_MS);
    if (rows.length && !recent) {
      await sendLicenseEmail(email.trim(), rows.map((r) => r.key), false);
      await db.from("licenses").update({ last_email_at: new Date().toISOString() }).in("id", rows.map((r) => r.id));
    }
  } catch (e) {
    console.error(e);
  }
  return json(req, { ok: true });
});
