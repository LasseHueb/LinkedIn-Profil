#!/usr/bin/env node
/*
 * Prüft den fertigen Build in dist/ (nach node scripts/build.mjs):
 *   - alle internen Links und Ressourcen (href, src, content, Sitemap, Manifest, CSS-url()) zeigen auf existierende Dateien
 *   - alle internen URLs beginnen mit BASE_PATH (wichtig für GitHub Pages unter /<repo>/)
 *   - nirgends der alte Name „ProfilRing“ bzw. „profilring“
 *   - Edition "free": nirgends „Premium“, „PRO“, „Unternehmen“ oder „Stripe“; kein supabase.js;
 *     Impressum und Datenschutz ohne Platzhalter oder [eckige Klammern];
 *     keine Skripte, Styles, Schriften oder Bilder von fremden Servern (die Datenschutzerklärung schließt das aus)
 * Aufruf: node scripts/check-dist.mjs   (Exit-Code 1 bei Fehlern)
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const sandbox = {};
sandbox.window = sandbox;
vm.runInNewContext(readFileSync(join(dist, "js/config.js"), "utf8"), sandbox);
const { siteUrl, basePath = "", edition } = sandbox.PBG_CONFIG;

const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p); else files.push(p);
  }
})(dist);

const errors = [];
const rel = (f) => relative(dist, f);

// ---------- Links ----------
function exists(url, from) {
  url = url.split("#")[0].split("?")[0];
  if (!url) return true;
  if (!url.startsWith("/")) url = "/" + relative(dist, join(dirname(from), url)).replaceAll("\\", "/");
  else if (basePath && url !== basePath && !url.startsWith(basePath + "/")) return false;
  else url = url.slice(basePath.length);
  const p = join(dist, decodeURIComponent(url));
  return url.endsWith("/") ? existsSync(join(p, "index.html")) : existsSync(p);
}

let checked = 0;
for (const f of files.filter((f) => /\.(html|xml|webmanifest|txt|css)$/.test(f))) {
  const s = readFileSync(f, "utf8");
  const urls = [
    ...s.matchAll(/(?:href|src|content)="([^"]+)"/g),
    ...s.matchAll(/<loc>([^<]+)<\/loc>/g),
    ...s.matchAll(/"(?:src|start_url)":\s*"([^"]+)"/g),
    ...s.matchAll(/^Sitemap: (\S+)/gm),
    ...s.matchAll(/url\(["']?([^"')]+)["']?\)/g)
  ].map((m) => m[1].replace(/&amp;/g, "&"));
  for (let u of urls) {
    if (u.startsWith(siteUrl + "/")) u = u.slice(siteUrl.length);
    else if (/^[a-z]+:/i.test(u) || u.startsWith("//")) continue; // extern, data:, mailto: …
    else if (!/\.css$/.test(f) && !u.startsWith("/")) continue; // Meta-Inhalte wie content="width=…"
    checked++;
    if (!exists(u, f)) errors.push(`Toter Link in ${rel(f)}: ${u}`);
  }
}

// ---------- Alter Name ----------
const binary = (f) => /\.(woff2|png|jpe?g|webp|ico)$/.test(f);
for (const f of files.filter((f) => !binary(f))) {
  readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    const m = line.match(/profilring/i);
    if (m) errors.push(`Alter Name „${m[0]}“ in ${rel(f)}:${i + 1}`);
  });
}

// ---------- Edition "free": keine Hinweise auf kostenpflichtige Angebote ----------
if (edition === "free") {
  const words = /\b(Premium|PRO|Unternehmen|Stripe)\b/;
  for (const f of files) {
    if (binary(f) || /(^|\/)LICENSE-[^/]+\.txt$/.test(rel(f))) continue;
    readFileSync(f, "utf8").split("\n").forEach((line, i) => {
      const m = line.match(words);
      if (m) errors.push(`„${m[1]}“ in ${rel(f)}:${i + 1}`);
    });
  }
  if (existsSync(join(dist, "vendor/supabase.js"))) errors.push("vendor/supabase.js ist in der kostenlosen Edition enthalten");

  // Rechtstexte müssen vollständig ausgefüllt sein
  for (const page of ["impressum/index.html", "datenschutz/index.html"]) {
    const f = join(dist, page);
    if (!existsSync(f)) { errors.push(`${page} fehlt`); continue; }
    const main = (readFileSync(f, "utf8").match(/<main[\s\S]*<\/main>/) || [""])[0];
    if (/class="placeholder"/.test(main)) errors.push(`Gelb markierter Platzhalter in ${page}`);
    const text = main.replace(/<[^>]+>/g, " ");
    for (const m of text.matchAll(/\[[^\]]*\]/g)) errors.push(`Platzhalter ${m[0].trim()} in ${page}`);
  }

  // Keine Ressourcen von fremden Servern (Links zum Anklicken sind erlaubt)
  for (const f of files.filter((f) => /\.(html|css)$/.test(f))) {
    const s = readFileSync(f, "utf8");
    const res = [
      ...[...s.matchAll(/<(?:script|img|iframe|source|video|audio)\b[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]),
      ...[...s.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]).filter((t) => !/rel="canonical"/.test(t)).map((t) => (t.match(/href="([^"]+)"/) || [])[1]),
      ...[...s.matchAll(/(?:url\(|@import\s+)["']?([^"')\s;]+)/g)].map((m) => m[1])
    ].filter(Boolean);
    for (const u of res) {
      if ((/^(https?:)?\/\//.test(u)) && !u.startsWith(siteUrl + "/")) errors.push(`Ressource von fremdem Server in ${rel(f)}: ${u}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`✗ ${errors.length} Fehler (Edition ${edition}, ${checked} URLs geprüft).`);
  process.exit(1);
}
console.log(`✓ dist/ in Ordnung: Edition ${edition}, ${checked} interne URLs geprüft, keine toten Links.`);
