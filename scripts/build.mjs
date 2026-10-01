#!/usr/bin/env node
/*
 * Statischer Build ohne Abhängigkeiten:
 *   public/  → wird 1:1 nach dist/ kopiert (CSS, JS, Schriften, Bilder)
 *   src/pages/*.mjs → erzeugen HTML-Seiten (Landingpages, Vorlagen-Links, Rechtliches …)
 *   dazu: js/config.js, sitemap.xml, robots.txt, 404.html, manifest, Redirects
 *
 * Aufruf: node scripts/build.mjs   (oder npm run build)
 * Umgebungsvariablen überschreiben config/site.json (siehe README).
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

// ---------- Konfiguration ----------
const cfg = JSON.parse(readFileSync(join(root, "config/site.json"), "utf8"));
const env = process.env;
const set = (obj, key, val) => { if (val !== undefined && val !== "") obj[key] = val; };
set(cfg, "appName", env.APP_NAME);
set(cfg, "siteUrl", env.SITE_URL || (env.CONTEXT === "deploy-preview" ? env.DEPLOY_PRIME_URL : undefined) || (env.VERCEL_ENV === "preview" && env.VERCEL_URL ? `https://${env.VERCEL_URL}` : undefined));
set(cfg, "basePath", env.BASE_PATH);
set(cfg.supabase, "url", env.SUPABASE_URL);
set(cfg.supabase, "anonKey", env.SUPABASE_ANON_KEY);
set(cfg.analytics, "provider", env.ANALYTICS_PROVIDER);
set(cfg.analytics, "src", env.ANALYTICS_SRC);
set(cfg.analytics, "domain", env.ANALYTICS_DOMAIN);
set(cfg.analytics, "websiteId", env.ANALYTICS_WEBSITE_ID);
if (env.ADS_ENABLED) cfg.ads.enabled = env.ADS_ENABLED === "true";
cfg.siteUrl = cfg.siteUrl.replace(/\/+$/, "");
cfg.basePath = (cfg.basePath || "").replace(/\/+$/, "");

// ---------- Vorlagen aus dem Browser-Code lesen (eine Quelle der Wahrheit) ----------
const sandbox = {};
sandbox.window = sandbox;
vm.runInNewContext(readFileSync(join(root, "public/js/presets.js"), "utf8"), sandbox);
const presets = sandbox.PBG.PRESETS;

const { landingPages } = await import(pathToFileURL(join(root, "src/content.mjs")).href);

// Cache-Busting: Hash über alle CSS/JS-Dateien
const hash = createHash("sha1");
for (const dir of ["public/css", "public/js"]) {
  for (const f of readdirSync(join(root, dir)).sort()) hash.update(readFileSync(join(root, dir, f)));
}
hash.update(JSON.stringify(cfg));

const pageModules = readdirSync(join(root, "src/pages")).filter((f) => f.endsWith(".mjs")).sort();
const knownPages = new Set(["/"]);
if (pageModules.includes("premium.mjs")) knownPages.add("/premium/");
if (pageModules.includes("business.mjs")) knownPages.add("/unternehmen/");

const ctx = {
  cfg,
  presets,
  landing: landingPages,
  version: hash.digest("hex").slice(0, 10),
  u: (p) => cfg.basePath + p,
  abs: (p) => cfg.siteUrl + cfg.basePath + p,
  hasPage: (p) => knownPages.has(p)
};

// ---------- Ausgabe ----------
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
cpSync(join(root, "public"), dist, { recursive: true });

// Öffentliche Laufzeit-Konfiguration (nur öffentliche Werte!)
const publicCfg = {
  appName: cfg.appName,
  siteUrl: cfg.siteUrl,
  basePath: cfg.basePath,
  premium: cfg.premium,
  business: cfg.business,
  supabase: { url: cfg.supabase.url, anonKey: cfg.supabase.anonKey }
};
writeFileSync(join(dist, "js/config.js"), `window.PBG_CONFIG = ${JSON.stringify(publicCfg, null, 2)};\n`);

const allPages = [];
for (const file of pageModules) {
  const mod = await import(pathToFileURL(join(root, "src/pages", file)).href);
  for (const p of mod.default(ctx)) {
    const target = p.file ? join(dist, p.file) : join(dist, p.path, "index.html");
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, p.html);
    allPages.push(p);
  }
}

// Sitemap: nur indexierbare Seiten
const today = new Date().toISOString().slice(0, 10);
const sitemapPages = allPages.filter((p) => p.sitemap !== false && !/noindex/.test(p.html.slice(0, 2000)));
writeFileSync(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPages.map((p) => `  <url><loc>${ctx.abs(p.path)}</loc><lastmod>${today}</lastmod>${p.priority ? `<priority>${p.priority}</priority>` : ""}</url>`).join("\n")}
</urlset>
`);

writeFileSync(join(dist, "robots.txt"), `User-agent: *
Allow: /
Disallow: ${cfg.basePath}/admin/
Disallow: ${cfg.basePath}/team/

Sitemap: ${ctx.abs("/sitemap.xml")}
`);

writeFileSync(join(dist, "manifest.webmanifest"), JSON.stringify({
  name: `${cfg.appName} – Profilbild-Rahmen`,
  short_name: cfg.appName,
  start_url: `${cfg.basePath}/`,
  display: "standalone",
  background_color: "#f5f7fa",
  theme_color: "#1f6feb",
  lang: "de",
  icons: [
    { src: `${cfg.basePath}/img/icon-192.png`, sizes: "192x192", type: "image/png" },
    { src: `${cfg.basePath}/img/icon-512.png`, sizes: "512x512", type: "image/png" }
  ]
}, null, 2));

// 404-Seite; leitet außerdem /team/<slug> auf /team/?s=<slug> um (für Hoster ohne Rewrites, z. B. GitHub Pages)
writeFileSync(join(dist, "404.html"), `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Seite nicht gefunden | ${cfg.appName}</title><meta name="robots" content="noindex">
<link rel="stylesheet" href="${ctx.u("/css/styles.css")}?v=${ctx.version}">
<script>
  (function () {
    var base = ${JSON.stringify(cfg.basePath)};
    var m = location.pathname.slice(base.length).match(/^\\/team\\/([a-z0-9-]+)\\/?$/);
    if (m) location.replace(base + "/team/?s=" + m[1]);
  })();
</script></head>
<body><main class="section prose"><h1>Seite nicht gefunden</h1>
<p>Diese Seite gibt es leider nicht (mehr). <a href="${ctx.u("/")}">Zum Rahmen-Editor</a></p></main></body></html>
`);

// Netlify: Rewrites & Header (Vercel: vercel.json im Projektordner)
writeFileSync(join(dist, "_redirects"), `${cfg.basePath}/team/*  ${cfg.basePath}/team/index.html  200\n`);
writeFileSync(join(dist, "_headers"), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  X-Frame-Options: SAMEORIGIN
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
/img/*
  Cache-Control: public, max-age=604800
/css/*
  Cache-Control: public, max-age=31536000, immutable
/js/*
  Cache-Control: public, max-age=31536000, immutable
/js/config.js
  Cache-Control: public, max-age=300
/vendor/*
  Cache-Control: public, max-age=31536000, immutable
`);
writeFileSync(join(dist, ".nojekyll"), "");

const missingImages = presets.filter((p) => !existsSync(join(dist, "img/examples", `${p.key}.webp`)));
console.log(`✓ ${allPages.length} Seiten nach dist/ geschrieben (Version ${ctx.version}).`);
if (missingImages.length) console.log(`! Beispielbilder fehlen für: ${missingImages.map((p) => p.key).join(", ")} → npm run images`);
