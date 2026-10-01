/* Startseite, Landingpages (SEO) und Vorlagen-Links (/vorlage/<key>/). */
import { home, landingPages } from "../content.mjs";
import { esc, fill, editor, page, privacyNote, trustRow, faqSection, faqJsonLd, webAppJsonLd, breadcrumbJsonLd } from "../layout.mjs";

function examplesSection(ctx, keys, heading) {
  const items = keys.map((k) => {
    const p = ctx.presets.find((x) => x.key === k);
    if (!p) return "";
    return `<a class="example" href="${ctx.u(`/vorlage/${k}/`)}">
        <img src="${ctx.u(`/img/examples/${k}.webp`)}" width="320" height="320" loading="lazy" decoding="async" alt="Beispiel: Profilbild mit Rahmen „${esc(p.text.de)}“">
        ${esc(p.name.de)}
      </a>`;
  }).join("\n      ");
  return `<section class="section" id="beispiele" aria-labelledby="ex-h">
    <h2 id="ex-h">${esc(heading)}</h2>
    <div class="examples">
      ${items}
    </div>
  </section>`;
}

function howTo() {
  return `<section class="section" aria-labelledby="how-h">
    <h2 id="how-h">So einfach geht’s</h2>
    <ol class="steps">
      <li><strong>Foto wählen</strong>Ziehe dein Foto in den Editor oder wähle es aus. Es bleibt auf deinem Gerät.</li>
      <li><strong>Text &amp; Farben</strong>Schreib deinen Text, wähle Vorlage, Schrift und Farben – die Vorschau zeigt sofort das Ergebnis.</li>
      <li><strong>Herunterladen</strong>PNG in 1080 × 1080 px speichern und als Profilbild hochladen.</li>
    </ol>
  </section>`;
}

function introSection(ctx, paragraphs, heading) {
  return `<section class="section prose" aria-labelledby="intro-h">
    <h2 id="intro-h">${esc(heading)}</h2>
    ${paragraphs.map((p) => `<p>${fill(ctx, p)}</p>`).join("\n    ")}
  </section>`;
}

function relatedLinks(ctx, currentSlug) {
  const links = ctx.landing.filter((l) => l.slug !== currentSlug)
    .map((l) => `<li><a href="${ctx.u(`/rahmen/${l.slug}/`)}">${esc(l.navLabel)}</a></li>`).join("");
  return `<section class="section" aria-labelledby="rel-h">
    <h2 id="rel-h">Weitere Rahmen-Ideen</h2>
    <ul class="link-grid">${links}</ul>
  </section>`;
}

const adSlot = '<aside class="ad-slot" aria-label="Anzeige" data-ad-slot="content"></aside>';

export default function pages(ctx) {
  const out = [];

  // ---------- Startseite ----------
  out.push({
    path: "/",
    priority: "1.0",
    html: page(ctx, {
      path: "/",
      titleFull: `${fill(ctx, home.title)} | ${ctx.cfg.appName}`,
      title: fill(ctx, home.title),
      description: fill(ctx, home.description),
      og: "/img/og/home.jpg",
      editor: true,
      preset: home.preset,
      jsonLd: [webAppJsonLd(ctx, ctx.abs("/")), faqJsonLd(ctx, home.faq)],
      main: `
  <div class="hero">
    <h1>${esc(fill(ctx, home.h1))}</h1>
    <p class="lead">${esc(fill(ctx, home.lead))}</p>
    ${trustRow()}
  </div>
  ${privacyNote()}
  ${editor(ctx)}
  ${adSlot}
  ${examplesSection(ctx, home.examples, "Vorlagen zum Loslegen")}
  ${howTo()}
  ${introSection(ctx, home.intro, "Dein Profilbild-Rahmen – nicht nur „Open to Work“")}
  ${faqSection(ctx, home.faq)}
  ${relatedLinks(ctx, null)}`
    })
  });

  // ---------- Landingpages ----------
  for (const l of landingPages) {
    const path = `/rahmen/${l.slug}/`;
    out.push({
      path,
      priority: "0.9",
      html: page(ctx, {
        path,
        title: fill(ctx, l.title),
        description: fill(ctx, l.description),
        og: `/img/og/${l.slug}.jpg`,
        editor: true,
        preset: l.preset,
        jsonLd: [
          webAppJsonLd(ctx, ctx.abs(path)),
          faqJsonLd(ctx, l.faq),
          breadcrumbJsonLd(ctx, [["Startseite", "/"], [l.navLabel, path]])
        ],
        main: `
  <div class="hero">
    <h1>${esc(fill(ctx, l.h1))}</h1>
    <p class="lead">${esc(fill(ctx, l.lead))}</p>
    ${trustRow()}
  </div>
  ${privacyNote()}
  ${editor(ctx)}
  ${adSlot}
  ${introSection(ctx, l.intro, "Worauf es ankommt")}
  ${examplesSection(ctx, l.examples, "Beispiele")}
  ${howTo()}
  ${faqSection(ctx, l.faq)}
  ${relatedLinks(ctx, l.slug)}`
      })
    });
  }

  // ---------- Vorlagen-Links: öffnen den Editor direkt mit der Vorlage ----------
  for (const p of ctx.presets) {
    const path = `/vorlage/${p.key}/`;
    const landing = landingPages.find((l) => l.preset === p.key);
    out.push({
      path,
      sitemap: false,
      html: page(ctx, {
        path,
        canonical: landing ? `/rahmen/${landing.slug}/` : "/",
        noindex: true,
        title: `Vorlage „${p.name.de}“ – Profilbild-Rahmen`,
        ogTitle: `Profilbild-Rahmen „${p.text.de}“ – jetzt selbst gestalten`,
        description: `Profilbild-Rahmen mit „${p.text.de}“ in einer Minute selbst gestalten – Text und Farben frei anpassbar. Dein Foto bleibt im Browser.`,
        og: `/img/og/vorlage-${p.key}.jpg`,
        editor: true,
        preset: p.key,
        main: `
  <div class="hero">
    <h1>Vorlage „${esc(p.name.de)}“${p.premium ? ' <span class="pro-badge">PRO</span>' : ""}</h1>
    <p class="lead">Lade dein Foto hoch – Text, Farben und Schrift kannst du frei anpassen.</p>
  </div>
  ${privacyNote()}
  ${editor(ctx)}
  ${relatedLinks(ctx, null)}`
      })
    });
  }

  return out;
}
