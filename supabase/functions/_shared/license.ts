// Lizenzschlüssel erzeugen, ausstellen (idempotent pro Stripe-Session) und per E-Mail zusenden.
import { admin } from "./db.ts";
import { sendEmail, layout, escapeHtml } from "./email.ts";
import { siteUrl } from "./http.ts";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // ohne I, O, 0, 1 (Verwechslungsgefahr)

export function generateKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `PR-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}-${chars.slice(12, 16)}`;
}

export function magicLink(key: string): string {
  return `${siteUrl()}/premium/?key=${encodeURIComponent(key)}`;
}

type Session = {
  id: string;
  payment_status: string;
  payment_intent?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  metadata?: Record<string, string> | null;
};

/** Stellt für eine bezahlte Checkout-Session genau eine Lizenz aus. */
export async function issueLicense(session: Session): Promise<{ key: string; email: string }> {
  const db = admin();
  const existing = await db.from("licenses").select("key,email").eq("stripe_session_id", session.id).maybeSingle();
  if (existing.data) return existing.data;

  const email = (session.customer_details?.email ?? session.customer_email ?? "").trim().toLowerCase();
  const row = {
    key: generateKey(),
    email,
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent ?? null,
    amount_total: session.amount_total ?? null,
    currency: session.currency ?? null,
    consent_at: session.metadata?.consent_at ?? null,
  };
  const inserted = await db.from("licenses").insert(row).select("key,email").single();
  if (inserted.error) {
    // Gleichzeitiger Aufruf (Webhook + Rückleitung): vorhandene Lizenz verwenden
    const again = await db.from("licenses").select("key,email").eq("stripe_session_id", session.id).single();
    if (again.data) return again.data;
    throw inserted.error;
  }
  if (email) await sendLicenseEmail(email, [row.key], true);
  return inserted.data;
}

export async function sendLicenseEmail(email: string, keys: string[], purchase: boolean) {
  const app = Deno.env.get("APP_NAME") ?? "ProfilRing";
  const list = keys.map((k) => `<p style="margin:14px 0"><code style="font-size:17px;background:#eef1f5;padding:6px 10px;border-radius:8px">${escapeHtml(k)}</code><br>
    <a href="${magicLink(k)}" style="display:inline-block;margin-top:10px;background:#1a5ccc;color:#fff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:700">Premium auf diesem Gerät aktivieren</a></p>`).join("");
  const consent = purchase
    ? `<p style="font-size:13px;color:#4f5d6e">Bestätigung: Du hast ausdrücklich verlangt, dass wir vor Ablauf der Widerrufsfrist mit der Freischaltung beginnen, und bestätigt, dass dein Widerrufsrecht damit erlischt (§ 356 Abs. 5 BGB). Es gelten unsere <a href="${siteUrl()}/agb/">AGB</a>.</p>`
    : "";
  const html = layout(purchase ? `Danke für deinen Kauf von ${app} Premium!` : `Dein ${app}-Premium-Zugang`, `
    <p>Mit diesem Link schaltest du Premium in jedem Browser frei – ganz ohne Passwort. Bewahre die E-Mail gut auf.</p>
    ${list}
    <p style="font-size:13px;color:#4f5d6e">Du kannst den Schlüssel auch im Editor unter „Schon gekauft? Lizenzschlüssel eingeben“ eintragen.</p>
    ${consent}`);
  const text = `${app} Premium\n\nDein Lizenzschlüssel:\n${keys.map((k) => `${k}\n${magicLink(k)}`).join("\n\n")}\n`;
  await sendEmail(email, purchase ? `Dein ${app}-Premium-Schlüssel` : `Dein ${app}-Premium-Zugang`, html, text);
}
