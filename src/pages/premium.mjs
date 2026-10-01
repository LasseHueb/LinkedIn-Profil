/* Premium-Seite: Vorteile, Kauf (Stripe Checkout), Aktivierung per Schlüssel oder Magic-Link. */
import { page, esc, fill, faqSection, faqJsonLd, privacyNote } from "../layout.mjs";
import { staticPages } from "../content.mjs";

const faq = [
  ["Ist Premium ein Abo?", "Nein. Du zahlst einmalig {price} und behältst Premium dauerhaft – ohne Kündigung, ohne versteckte Kosten."],
  ["Brauche ich ein Konto oder Passwort?", "Nein. Nach dem Kauf bekommst du einen Lizenzschlüssel und einen Magic-Link per E-Mail. Ein Klick darauf schaltet Premium im jeweiligen Browser frei."],
  ["Kann ich Premium auf mehreren Geräten nutzen?", "Ja. Öffne einfach den Magic-Link aus der E-Mail auf jedem deiner Geräte oder gib dort den Lizenzschlüssel ein."],
  ["Ich habe meinen Schlüssel verloren – was nun?", "Gib unten die E-Mail-Adresse ein, mit der du bezahlt hast. Wir schicken dir den Magic-Link erneut zu."],
  ["Werden meine Fotos mit Premium hochgeladen?", "Nein, auch mit Premium bleibt dein Foto ausschließlich in deinem Browser."],
  ["Welche Zahlungsarten gibt es?", "Die Zahlung läuft sicher über Stripe – je nach Land z. B. Kreditkarte, Apple Pay, Google Pay, PayPal, Klarna oder SEPA-Lastschrift."]
];

export default function pages(ctx) {
  const sp = staticPages.premium;
  const premiumExamples = ctx.presets.filter((p) => p.premium).slice(0, 8);
  const rows = [
    ["Eigener Text, Farben, Größe, Position", true, true],
    ["Kostenlose Vorlagen", true, true],
    ["Export 1080 × 1080 px", true, true],
    ["Kein Hinweis „Erstellt mit …“ im Bild", false, true],
    ["Farbverläufe", false, true],
    ["5 zusätzliche Schriftarten", false, true],
    [`${ctx.presets.filter((p) => p.premium).length} Premium-Vorlagen`, false, true],
    ["Symbole & Emojis im Ring", false, true],
    ["Export 2048 × 2048 px", false, true]
  ];
  const yes = '<span aria-label="ja">✓</span>', no = '<span aria-label="nein" class="muted">–</span>';

  const main = `
  <div class="hero">
    <h1>Premium: dein Rahmen ohne Hinweis – einmalig ${esc(ctx.cfg.premium.price).replace(" ", "&nbsp;")}</h1>
    <p class="lead">Mehr Gestaltung, mehr Vorlagen, schärferer Export. Kein Abo, kein Konto, kein Passwort.</p>
  </div>
  <div class="section" style="padding-top:8px">
    <div class="notice" id="premium-status" role="status" aria-live="polite" hidden></div>
  </div>

  <section class="section" aria-labelledby="cmp-h" style="padding-top:0">
    <div class="pricing">
      <div class="price-card">
        <h2 id="cmp-h" class="visually-hidden">Vergleich</h2>
        <h3>Kostenlos</h3>
        <p class="price">0 €</p>
        <table class="compare">
          <tbody>${rows.map(([f, a]) => `<tr><td>${esc(f)}</td><td>${a ? yes : no}</td></tr>`).join("")}</tbody>
        </table>
        <a class="btn btn-ghost" href="${ctx.u("/")}">Kostenlos loslegen</a>
      </div>
      <div class="price-card featured" id="kaufen">
        <h3>Premium <span class="pro-badge" aria-hidden="true">PRO</span></h3>
        <p class="price">${esc(ctx.cfg.premium.price)} <small>einmalig</small></p>
        <table class="compare">
          <tbody>${rows.map(([f, , b]) => `<tr><td>${esc(f)}</td><td>${b ? yes : no}</td></tr>`).join("")}</tbody>
        </table>
        <div id="buy-box">
          <label class="consent"><input type="checkbox" id="buy-consent"> <span>Ich verlange ausdrücklich, dass mit der Freischaltung sofort begonnen wird, und weiß, dass ich dadurch mein <a href="${ctx.u("/widerruf/")}">Widerrufsrecht</a> verliere. Es gelten die <a href="${ctx.u("/agb/")}">AGB</a>.</span></label>
          <button type="button" class="btn btn-primary btn-block" id="buy" disabled>Jetzt für ${esc(ctx.cfg.premium.price)} freischalten</button>
          <p class="small muted center">Sichere Zahlung über Stripe</p>
        </div>
        <p class="team-note" id="active-box" hidden></p>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="act-h">
    <div class="pricing">
      <div class="card">
        <h2 id="act-h">Schon gekauft?</h2>
        <form class="inline-form" id="key-form">
          <label class="visually-hidden" for="key-input">Lizenzschlüssel</label>
          <input type="text" id="key-input" placeholder="PR-XXXX-XXXX-XXXX-XXXX" autocomplete="off" spellcheck="false" required>
          <button class="btn btn-secondary" type="submit">Aktivieren</button>
        </form>
      </div>
      <div class="card">
        <h2>Schlüssel verloren?</h2>
        <form class="inline-form" id="recover-form">
          <label class="visually-hidden" for="recover-email">E-Mail-Adresse vom Kauf</label>
          <input type="email" id="recover-email" placeholder="deine@email.de" autocomplete="email" required>
          <button class="btn btn-secondary" type="submit">Link senden</button>
        </form>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="pex-h">
    <h2 id="pex-h">Einige der Premium-Vorlagen</h2>
    <div class="examples">
      ${premiumExamples.map((p) => `<a class="example" href="${ctx.u(`/vorlage/${p.key}/`)}"><img src="${ctx.u(`/img/examples/${p.key}.webp`)}" width="320" height="320" loading="lazy" decoding="async" alt="Premium-Vorlage „${esc(p.name.de)}“">${esc(p.name.de)}</a>`).join("\n      ")}
    </div>
  </section>
  ${privacyNote()}
  ${faqSection(ctx, faq)}`;

  return [{
    path: sp.path,
    priority: "0.8",
    html: page(ctx, {
      path: sp.path,
      title: fill(ctx, sp.title),
      description: fill(ctx, sp.description),
      og: "/img/og/premium.jpg",
      scripts: ["/js/premium-page.js"],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Product",
          name: `${ctx.cfg.appName} Premium`,
          description: fill(ctx, sp.description),
          image: ctx.abs("/img/og/premium.jpg"),
          brand: { "@type": "Brand", name: ctx.cfg.appName },
          offers: { "@type": "Offer", price: String(ctx.cfg.premium.priceValue), priceCurrency: ctx.cfg.premium.currency, availability: "https://schema.org/InStock", url: ctx.abs(sp.path) }
        },
        faqJsonLd(ctx, faq)
      ],
      main
    })
  }];
}
