/*
 * Gemeinsames Seitenlayout für alle generierten Seiten.
 * Reines Node.js, keine Abhängigkeiten.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const editorHtml = readFileSync(join(here, "partials/editor.html"), "utf8");

/** HTML-Escaping für Text in Attributen und Inhalten. */
export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Ersetzt {app}, {price}, {base} … in Inhaltstexten. */
export function fill(ctx, s) {
  return String(s ?? "")
    .replaceAll("{app}", ctx.cfg.appName)
    .replaceAll("{price}", ctx.cfg.premium.price)
    .replaceAll("{starter}", ctx.cfg.business.starterPrice)
    .replaceAll("{team}", ctx.cfg.business.teamPrice)
    .replaceAll("{base}", ctx.cfg.basePath);
}

export function editor(ctx) {
  return editorHtml.replaceAll("{{base}}", ctx.cfg.basePath);
}

const ICON_SHIELD = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3z" fill="currentColor"/></svg>';

export function privacyNote() {
  return `<p class="privacy-note" role="note">
    <span class="badge">${ICON_SHIELD}<strong>Deine Fotos verlassen nie deinen Browser.</strong></span>
    <span>Alles wird direkt auf deinem Gerät berechnet – kein Upload, keine Speicherung, keine Cookies.</span>
  </p>`;
}

export function trustRow() {
  const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return `<ul class="trust-row">
    <li>${check}Kostenlos</li><li>${check}Ohne Anmeldung</li><li>${check}Kein Foto-Upload</li><li>${check}PNG in 1080 px</li>
  </ul>`;
}

export function faqSection(ctx, faq, heading = "Häufige Fragen") {
  return `<section class="section faq narrow" aria-labelledby="faq-h">
    <h2 id="faq-h">${esc(heading)}</h2>
    ${faq.map(([q, a]) => `<details><summary>${esc(fill(ctx, q))}</summary><p>${fill(ctx, a)}</p></details>`).join("\n    ")}
  </section>`;
}

export function faqJsonLd(ctx, faq) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({
      "@type": "Question",
      name: fill(ctx, q),
      acceptedAnswer: { "@type": "Answer", text: fill(ctx, a).replace(/<[^>]+>/g, "") }
    }))
  };
}

export function webAppJsonLd(ctx, url) {
  const c = ctx.cfg;
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: c.appName,
    url,
    applicationCategory: "DesignApplication",
    operatingSystem: "Alle (Webbrowser)",
    browserRequirements: "Benötigt JavaScript und einen aktuellen Browser",
    inLanguage: "de",
    isAccessibleForFree: true,
    offers: [
      { "@type": "Offer", name: "Kostenlos", price: "0", priceCurrency: c.premium.currency },
      { "@type": "Offer", name: "Premium (einmalig)", price: String(c.premium.priceValue), priceCurrency: c.premium.currency }
    ],
    featureList: ["Eigener Text auf dem Profilbild-Ring", "Farben und Schriftarten frei wählbar", "PNG-Export 1080 × 1080 px", "Fotos bleiben im Browser"]
  };
}

export function breadcrumbJsonLd(ctx, items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: ctx.abs(path) }))
  };
}

function header(ctx, path) {
  const u = ctx.u;
  const nav = [
    ["/", "Rahmen erstellen"],
    ["/rahmen/jobsuche/", "Jobsuche"],
    ["/rahmen/recruiting/", "Recruiting"],
    ...(ctx.hasPage("/premium/") ? [["/premium/", 'Premium <span class="pro-badge" aria-hidden="true">PRO</span>']] : []),
    ...(ctx.hasPage("/unternehmen/") ? [["/unternehmen/", "Für Unternehmen"]] : [])
  ];
  return `<header class="site-header">
    <a class="brand" href="${u("/")}" aria-label="${esc(ctx.cfg.appName)} – Startseite">
      <svg class="brand-logo" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" stroke-width="2" opacity=".35"/><path d="M3.5 21A13.5 13.5 0 0 0 28.5 21" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg>
      <span class="brand-name">${esc(ctx.cfg.appName)}</span>
    </a>
    <nav class="site-nav" aria-label="Hauptnavigation">
      ${nav.map(([p, label]) => `<a href="${u(p)}"${p === path ? ' aria-current="page"' : ""}${p === "/premium/" ? ' class="nav-premium"' : ""}>${label}</a>`).join("\n      ")}
    </nav>
    <div class="segmented" role="radiogroup" aria-label="Farbschema" id="theme-switch">
      <button type="button" role="radio" data-theme-value="auto" title="System" aria-checked="true">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18V3z" fill="currentColor"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/></svg>
        <span class="visually-hidden">System</span>
      </button>
      <button type="button" role="radio" data-theme-value="light" title="Hell" aria-checked="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></g></svg>
        <span class="visually-hidden">Hell</span>
      </button>
      <button type="button" role="radio" data-theme-value="dark" title="Dunkel" aria-checked="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor"/></svg>
        <span class="visually-hidden">Dunkel</span>
      </button>
    </div>
  </header>`;
}

function footer(ctx) {
  const u = ctx.u;
  const links = [
    ...ctx.landing.map((l) => [`/rahmen/${l.slug}/`, l.navLabel || l.h1]),
  ];
  const legal = [
    ...(ctx.hasPage("/premium/") ? [["/premium/", "Premium"]] : []),
    ...(ctx.hasPage("/unternehmen/") ? [["/unternehmen/", "Für Unternehmen"]] : []),
    ["/impressum/", "Impressum"], ["/datenschutz/", "Datenschutz"], ["/agb/", "AGB"], ["/widerruf/", "Widerruf"]
  ];
  return `<footer class="site-footer">
    <ul class="footer-nav" aria-label="Anwendungsfälle">${links.map(([p, l]) => `<li><a href="${u(p)}">${esc(l)}</a></li>`).join("")}</ul>
    <ul class="footer-nav" aria-label="Rechtliches">${legal.map(([p, l]) => `<li><a href="${u(p)}">${esc(l)}</a></li>`).join("")}</ul>
    <p>Deine Fotos verlassen nie deinen Browser · Keine Cookies · © ${new Date().getFullYear()} ${esc(ctx.cfg.appName)}</p>
    <p class="small">${esc(ctx.cfg.appName)} ist ein unabhängiges Angebot und steht in keiner Verbindung zu LinkedIn, Xing oder anderen Netzwerken.</p>
  </footer>`;
}

function analyticsTag(cfg) {
  const a = cfg.analytics || {};
  if (a.provider === "plausible" && a.src && a.domain) {
    return `<script defer data-domain="${esc(a.domain)}" src="${esc(a.src)}"></script>
  <script>window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}</script>`;
  }
  if (a.provider === "umami" && a.src && a.websiteId) {
    return `<script defer src="${esc(a.src)}" data-website-id="${esc(a.websiteId)}"></script>`;
  }
  return "";
}

/**
 * Vollständige HTML-Seite.
 * opts: path, title, description, main (HTML), mode, preset, noindex, canonical, og, jsonLd[], scripts[], editor(bool), bodyClass
 */
export function page(ctx, opts) {
  const c = ctx.cfg;
  const u = ctx.u;
  const title = opts.titleFull || `${opts.title} | ${c.appName}`;
  const canonical = ctx.abs(opts.canonical || opts.path);
  const og = ctx.abs(opts.og || "/img/og/default.jpg");
  const ld = (opts.jsonLd || []).map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, "\\u003c")}</script>`).join("\n  ");
  const editorScripts = opts.editor
    ? ["/js/i18n.js", "/js/presets.js", "/js/icons.js", "/js/renderer.js", "/js/platform.js", "/js/app.js"]
    : ["/js/i18n.js", "/js/platform.js"];
  const scripts = ["/js/config.js", ...editorScripts, ...(opts.scripts || [])];
  const ver = ctx.version;

  return `<!doctype html>
<html lang="de"${c.ads.enabled ? ' class="ads-enabled"' : ""}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(opts.description)}">
  <link rel="canonical" href="${esc(canonical)}">
  ${opts.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#f5f7fa" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#0f1419" media="(prefers-color-scheme: dark)">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(c.appName)}">
  <meta property="og:locale" content="de_DE">
  <meta property="og:title" content="${esc(opts.ogTitle || opts.title)}">
  <meta property="og:description" content="${esc(opts.description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${esc(og)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(opts.ogTitle || opts.title)}">
  <meta name="twitter:card" content="summary_large_image">
  ${c.twitterHandle ? `<meta name="twitter:site" content="${esc(c.twitterHandle)}">` : ""}
  <link rel="icon" href="${u("/favicon.svg")}" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${u("/img/apple-touch-icon.png")}">
  <link rel="manifest" href="${u("/manifest.webmanifest")}">
  <link rel="preload" href="${u("/fonts/montserrat-latin-700-normal.woff2")}" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="${u("/fonts/nunito-latin-400-normal.woff2")}" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${u("/css/fonts.css")}?v=${ver}">
  <link rel="stylesheet" href="${u("/css/styles.css")}?v=${ver}">
  <script>try{var t=localStorage.getItem("pbg-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
  ${scripts.map((s) => `<script defer src="${u(s)}?v=${ver}"></script>`).join("\n  ")}
  ${analyticsTag(c)}
  ${ld}
</head>
<body data-mode="${esc(opts.mode || "public")}"${opts.preset ? ` data-preset="${esc(opts.preset)}"` : ""}${opts.bodyClass ? ` class="${esc(opts.bodyClass)}"` : ""}>
  ${opts.editor ? '<a class="skip-link" href="#controls">Zu den Einstellungen springen</a>' : ""}
  ${header(ctx, opts.path)}
  <main id="main">
  ${opts.main}
  </main>
  ${footer(ctx)}
</body>
</html>
`;
}
