// Kontaktformular "Für Unternehmen": speichert die Anfrage und benachrichtigt per E-Mail.
import { preflight, json, readJson, isEmail } from "../_shared/http.ts";
import { admin } from "../_shared/db.ts";
import { sendEmail, escapeHtml, layout } from "../_shared/email.ts";

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  const b = await readJson<{ name?: string; email?: string; company?: string; message?: string; website?: string }>(req);

  // Honeypot: Bots füllen das versteckte Feld "website" aus → still verwerfen
  if (b.website) return json(req, { ok: true });

  const name = String(b.name ?? "").trim().slice(0, 120);
  const company = String(b.company ?? "").trim().slice(0, 120);
  const message = String(b.message ?? "").trim().slice(0, 4000);
  if (!name || !isEmail(b.email) || message.length < 5) return json(req, { error: "invalid-input" }, 400);
  const email = b.email.trim();

  const { error } = await admin().from("contact_requests").insert({ name, email, company, message });
  if (error) {
    console.error(error);
    return json(req, { error: "save-failed" }, 500);
  }

  const to = Deno.env.get("CONTACT_EMAIL");
  if (to) {
    await sendEmail(to, `Neue Firmen-Anfrage: ${company || name}`,
      layout("Neue Anfrage über „Für Unternehmen“", `<p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)})<br>${escapeHtml(company)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`),
      `${name} <${email}>\n${company}\n\n${message}`);
  }
  return json(req, { ok: true });
});
