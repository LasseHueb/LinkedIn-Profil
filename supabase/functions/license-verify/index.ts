// Prüft einen Lizenzschlüssel. Antwortet nur mit gültig/ungültig.
import { preflight, json, readJson } from "../_shared/http.ts";
import { admin } from "../_shared/db.ts";

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  const { key } = await readJson<{ key?: string }>(req);
  const k = typeof key === "string" ? key.trim().toUpperCase() : "";
  if (!/^PR-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(k)) return json(req, { valid: false });
  const { data, error } = await admin().from("licenses").select("revoked").eq("key", k).maybeSingle();
  if (error) return json(req, { error: "lookup-failed" }, 500);
  return json(req, { valid: !!data && !data.revoked });
});
