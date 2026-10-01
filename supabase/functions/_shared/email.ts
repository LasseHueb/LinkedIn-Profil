// E-Mail-Versand über Resend (optional). Ohne RESEND_API_KEY wird nichts versendet.
import { env } from "./http.ts";

export async function sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    console.warn("RESEND_API_KEY fehlt – E-Mail nicht versendet:", subject);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env("EMAIL_FROM"), to: [to], subject, html, text }),
  });
  if (!res.ok) console.error("E-Mail-Versand fehlgeschlagen", res.status, await res.text());
  return res.ok;
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

/** Schlichtes, gut lesbares Mail-Layout. */
export function layout(title: string, bodyHtml: string): string {
  const app = escapeHtml(Deno.env.get("APP_NAME") ?? "ProfilRing");
  return `<!doctype html><html lang="de"><body style="margin:0;background:#f5f7fa;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#16202c">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    <p style="font-weight:700;font-size:18px;margin:0 0 20px">${app}</p>
    <div style="background:#fff;border:1px solid #d5dbe3;border-radius:14px;padding:24px">
      <h1 style="font-size:20px;margin:0 0 12px">${escapeHtml(title)}</h1>
      ${bodyHtml}
    </div>
    <p style="font-size:12px;color:#4f5d6e;margin-top:16px">Deine Fotos verlassen nie deinen Browser.</p>
  </div></body></html>`;
}
