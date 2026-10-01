// Unit-Tests ohne Netzwerk: deno test supabase/functions/tests/
import { assert, assertEquals, assertMatch } from "jsr:@std/assert@1";
import { verifyWebhook, encode } from "../_shared/stripe.ts";
import { generateKey } from "../_shared/license.ts";

async function sign(secret: string, t: number, body: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${t}.${body}`));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.test("Webhook-Signatur: gültig, manipuliert, abgelaufen", async () => {
  const secret = "whsec_test";
  const body = JSON.stringify({ type: "checkout.session.completed" });
  const t = Math.floor(Date.now() / 1000);
  const v1 = await sign(secret, t, body);
  assert(await verifyWebhook(body, `t=${t},v1=${v1}`, secret));
  assert(await verifyWebhook(body, `t=${t},v1=deadbeef,v1=${v1}`, secret), "mehrere Signaturen");
  assert(!(await verifyWebhook(body + " ", `t=${t},v1=${v1}`, secret)), "veränderter Body");
  assert(!(await verifyWebhook(body, `t=${t},v1=${v1}`, "whsec_other")), "falsches Secret");
  const old = t - 3600;
  assert(!(await verifyWebhook(body, `t=${old},v1=${await sign(secret, old, body)}`, secret)), "zu alt");
  assert(!(await verifyWebhook(body, null, secret)), "ohne Header");
});

Deno.test("Lizenzschlüssel-Format", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 500; i++) {
    const k = generateKey();
    assertMatch(k, /^PR-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
    seen.add(k);
  }
  assertEquals(seen.size, 500);
});

Deno.test("Stripe-Formularkodierung verschachtelter Parameter", () => {
  const p = encode({ mode: "payment", line_items: [{ price: "price_1", quantity: 1 }], metadata: { product: "premium" }, skip: undefined });
  assertEquals(p.get("line_items[0][price]"), "price_1");
  assertEquals(p.get("line_items[0][quantity]"), "1");
  assertEquals(p.get("metadata[product]"), "premium");
  assertEquals(p.has("skip"), false);
});
