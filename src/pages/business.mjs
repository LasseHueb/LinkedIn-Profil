/* Firmen-Pakete: Landingpage „Für Unternehmen“, Admin-Bereich und Team-Link. */
import { page, esc, fill, editor, faqSection, faqJsonLd, privacyNote } from "../layout.mjs";
import { staticPages } from "../content.mjs";

const faq = [
  ["Müssen Mitarbeitende ein Konto anlegen?", "Nein. Sie öffnen den Firmen-Link, laden ihr Foto hoch und laden das fertige Bild herunter – ohne Anmeldung."],
  ["Werden Fotos unserer Mitarbeitenden gespeichert?", "Nein. Fotos verlassen nie den Browser der jeweiligen Person. Wir speichern nur die Rahmen-Einstellungen (Farben, Text, Schrift, ggf. Logo) und zählen die Downloads."],
  ["Können Mitarbeitende den Rahmen verändern?", "Das entscheidest du: Ist der Rahmen gesperrt, können Mitarbeitende nur ihr Foto hochladen. Ohne Sperre dürfen sie Text und Farben anpassen."],
  ["Wie funktioniert die Anmeldung im Admin-Bereich?", "Per Magic-Link: Du gibst deine E-Mail-Adresse ein und klickst auf den Link in der E-Mail – kein Passwort nötig."],
  ["Wie kündige ich?", "Jederzeit zum Ende der Laufzeit über das Kundenportal im Admin-Bereich. Das Paket verlängert sich sonst automatisch um ein Jahr."],
  ["Bekommen wir eine Rechnung?", "Ja, mit ausgewiesener Umsatzsteuer und auf Wunsch mit eurer USt-IdNr. – direkt über Stripe."]
];

export default function pages(ctx) {
  const c = ctx.cfg;
  const sp = staticPages.business;
  const u = ctx.u;

  const landing = `
  <div class="hero">
    <h1>Profilbild-Rahmen für Unternehmen &amp; Teams</h1>
    <p class="lead">Einmal gestalten, an alle verteilen: Ihr legt Farben, Text und Logo fest – eure Mitarbeitenden laden über einen Link nur noch ihr Foto hoch.</p>
  </div>
  ${privacyNote()}

  <section class="section" aria-labelledby="ben-h">
    <h2 id="ben-h">Warum Firmen-Rahmen?</h2>
    <ol class="steps">
      <li><strong>Reichweite fürs Recruiting</strong>Jedes Profilbild eures Teams wird zur Stellenanzeige – in Kommentaren, Nachrichten und Beiträgen.</li>
      <li><strong>Einheitlicher Auftritt</strong>Firmenfarben, eure Schrift und euer Logo – gesperrt, damit alles zur Marke passt.</li>
      <li><strong>In 30 Sekunden fertig</strong>Link öffnen, Foto wählen, herunterladen. Kein Konto, keine App, keine Schulung.</li>
      <li><strong>Datenschutzfreundlich</strong>Fotos verlassen nie den Browser. Ihr seht nur, wie oft der Rahmen genutzt wurde.</li>
    </ol>
  </section>

  <section class="section" aria-labelledby="price-h" id="preise">
    <h2 id="price-h">Preise</h2>
    <div class="pricing">
      <div class="price-card">
        <h3>Starter</h3>
        <p class="price">${esc(c.business.starterPrice)} <small>/ Jahr zzgl. USt.</small></p>
        <ul class="check-list">
          <li>1 Firmen-Rahmen mit eigenem Link</li>
          <li>Firmenfarben, Verläufe, alle Schriften</li>
          <li>Eigenes Logo im Ring</li>
          <li>Rahmen sperren</li>
          <li>Download-Zähler</li>
          <li>Unbegrenzt viele Mitarbeitende</li>
        </ul>
        <a class="btn btn-secondary" href="${u("/admin/")}">Starter wählen</a>
      </div>
      <div class="price-card featured">
        <h3>Team <span class="pro-badge" aria-hidden="true">BELIEBT</span></h3>
        <p class="price">${esc(c.business.teamPrice)} <small>/ Jahr zzgl. USt.</small></p>
        <ul class="check-list">
          <li>5 Firmen-Rahmen (z. B. je Standort oder Kampagne)</li>
          <li>Alles aus Starter</li>
          <li>Zähler je Rahmen</li>
          <li>Bevorzugter Support</li>
        </ul>
        <a class="btn btn-primary" href="${u("/admin/")}">Team wählen</a>
      </div>
      <div class="price-card">
        <h3>Individuell</h3>
        <p class="price">Auf Anfrage</p>
        <ul class="check-list">
          <li>Mehr als 5 Rahmen</li>
          <li>Agenturen &amp; Verbände</li>
          <li>Sonderkonditionen für gemeinnützige Organisationen</li>
        </ul>
        <a class="btn btn-ghost" href="#kontakt">Kontakt aufnehmen</a>
      </div>
    </div>
    <p class="small muted">Ihr könnt den Rahmen vor dem Kauf kostenlos im Admin-Bereich gestalten. Der Link für Mitarbeitende wird mit dem Paket aktiviert.</p>
  </section>

  <section class="section" aria-labelledby="how-h">
    <h2 id="how-h">So funktioniert’s</h2>
    <ol class="steps">
      <li><strong>Anmelden</strong>Im Admin-Bereich mit eurer E-Mail-Adresse – per Magic-Link, ohne Passwort.</li>
      <li><strong>Rahmen gestalten</strong>Text (z. B. „Wir stellen ein“), Farben, Schrift und Logo festlegen und sperren.</li>
      <li><strong>Link teilen</strong>Den Link <code>${esc(c.siteUrl.replace(/^https?:\/\//, ""))}${esc(c.basePath)}/team/eure-firma</code> per Mail, Intranet oder Slack verteilen.</li>
    </ol>
  </section>

  <section class="section" aria-labelledby="kontakt-h" id="kontakt">
    <h2 id="kontakt-h">Kontakt</h2>
    <p>Fragen, Angebot oder Rechnung vorab? Schreibt uns – wir melden uns in der Regel innerhalb eines Werktags.</p>
    <form class="form-grid" id="contact-form" novalidate>
      <div><label for="c-name">Name</label><input type="text" id="c-name" name="name" autocomplete="name" required maxlength="120"></div>
      <div><label for="c-email">E-Mail</label><input type="email" id="c-email" name="email" autocomplete="email" required maxlength="254"></div>
      <div><label for="c-company">Unternehmen (optional)</label><input type="text" id="c-company" name="company" autocomplete="organization" maxlength="120"></div>
      <div><label for="c-message">Nachricht</label><textarea id="c-message" name="message" required maxlength="4000"></textarea></div>
      <div class="hp-field" aria-hidden="true"><label for="c-website">Website</label><input type="text" id="c-website" name="website" tabindex="-1" autocomplete="off"></div>
      <p class="small muted">Mit dem Absenden stimmst du der Verarbeitung deiner Angaben zur Beantwortung der Anfrage zu. Details in der <a href="${u("/datenschutz/")}">Datenschutzerklärung</a>.</p>
      <div><button type="submit" class="btn btn-primary">Anfrage senden</button></div>
      <p class="status" id="contact-status" role="status" aria-live="polite"></p>
    </form>
  </section>
  ${faqSection(ctx, faq)}`;

  const admin = `
  <div class="hero">
    <h1>Admin-Bereich für Firmen</h1>
    <p class="lead">Gestalte Firmen-Rahmen, verteile den Link und behalte im Blick, wie oft er genutzt wird.</p>
  </div>
  <div class="section admin-grid" id="admin-app">
    <p class="notice" id="admin-status" role="status" aria-live="polite" hidden></p>

    <div class="card" id="login-card" hidden>
      <h2>Anmelden</h2>
      <p>Wir schicken dir einen Anmelde-Link per E-Mail – kein Passwort nötig.</p>
      <form class="inline-form" id="login-form">
        <label class="visually-hidden" for="login-email">E-Mail-Adresse</label>
        <input type="email" id="login-email" autocomplete="email" placeholder="name@firma.de" required>
        <button class="btn btn-primary" type="submit">Link senden</button>
      </form>
    </div>

    <div class="card" id="company-card" hidden>
      <h2>Firma anlegen</h2>
      <form class="inline-form" id="company-form">
        <label class="visually-hidden" for="company-name">Firmenname</label>
        <input type="text" id="company-name" placeholder="Firmenname" minlength="2" maxlength="80" required class="plain">
        <button class="btn btn-primary" type="submit">Anlegen</button>
      </form>
    </div>

    <div id="dashboard" hidden>
      <div class="card">
        <div class="field-head">
          <h2 id="company-title">Firma</h2>
          <button type="button" class="text-button" id="logout">Abmelden</button>
        </div>
        <p>Paket: <span class="badge-plan" id="plan-badge">–</span> <span class="small muted" id="plan-expiry"></span></p>
        <div class="button-row" id="plan-actions">
          <button type="button" class="btn btn-secondary" data-plan="starter">Starter buchen · ${esc(c.business.starterPrice)}/Jahr</button>
          <button type="button" class="btn btn-primary" data-plan="team">Team buchen · ${esc(c.business.teamPrice)}/Jahr</button>
        </div>
        <div class="button-row" id="portal-actions" hidden>
          <button type="button" class="btn btn-ghost" id="portal">Rechnungen &amp; Abo verwalten</button>
        </div>
      </div>

      <div class="card">
        <div class="field-head">
          <h2>Firmen-Rahmen</h2>
          <button type="button" class="btn btn-secondary" id="new-template">+ Neuer Rahmen</button>
        </div>
        <ul class="tpl-list" id="tpl-list"></ul>
        <p class="small muted" id="tpl-limit"></p>
      </div>
    </div>

    <div class="card" id="tpl-form-card" hidden>
      <h2 id="tpl-form-title">Rahmen bearbeiten</h2>
      <div class="field-row">
        <div class="field"><label for="tpl-title">Name (nur intern)</label><input type="text" id="tpl-title" maxlength="80" class="plain"></div>
        <div class="field"><label for="tpl-slug">Link</label>
          <div class="inline-form" style="margin:0"><span class="small muted" style="align-self:center">/team/</span><input type="text" id="tpl-slug" maxlength="48" pattern="[a-z0-9][a-z0-9-]{1,46}[a-z0-9]" class="plain"></div>
        </div>
      </div>
      <div class="toggles">
        <label class="switch"><input type="checkbox" id="tpl-locked" checked><span class="track" aria-hidden="true"></span><span>Rahmen sperren (Mitarbeitende laden nur ihr Foto hoch)</span></label>
      </div>
      <div class="field-row">
        <div class="field">
          <label for="tpl-logo">Logo (PNG, JPG oder WebP, max. 500 KB)</label>
          <input type="file" id="tpl-logo" accept="image/png,image/jpeg,image/webp">
          <button type="button" class="text-button" id="tpl-logo-remove" hidden>Logo entfernen</button>
        </div>
        <div class="field">
          <label for="tpl-logo-pos">Position des Logos</label>
          <select id="tpl-logo-pos"><option value="end">Nach dem Text</option><option value="start">Vor dem Text</option></select>
        </div>
      </div>
      <p class="small muted">Gestalte den Rahmen unten im Editor. Fotos werden nicht gespeichert – nur die Einstellungen.</p>
      <div class="button-row">
        <button type="button" class="btn btn-primary" id="tpl-save">Speichern</button>
        <button type="button" class="btn btn-ghost" id="tpl-cancel">Abbrechen</button>
      </div>
      <p class="status" id="tpl-status" role="status" aria-live="polite"></p>
    </div>
  </div>
  <div id="admin-editor" hidden>
    ${editor(ctx)}
  </div>`;

  const team = `
  <div class="hero">
    <h1 id="team-title">Firmen-Rahmen</h1>
    <p class="lead" id="team-lead">Lade dein Foto hoch und lade dein Profilbild mit Firmen-Rahmen herunter.</p>
  </div>
  ${privacyNote()}
  <div class="section"><p class="notice" id="team-status" role="status" aria-live="polite">Rahmen wird geladen …</p></div>
  <div id="team-editor" hidden>
    ${editor(ctx)}
  </div>`;

  return [
    {
      path: sp.path,
      priority: "0.8",
      html: page(ctx, {
        path: sp.path,
        title: fill(ctx, sp.title),
        description: fill(ctx, sp.description),
        og: "/img/og/unternehmen.jpg",
        scripts: ["/js/business-page.js"],
        jsonLd: [faqJsonLd(ctx, faq), {
          "@context": "https://schema.org",
          "@type": "Service",
          name: `${c.appName} Firmen-Rahmen`,
          serviceType: "Profilbild-Rahmen für Teams",
          provider: { "@type": "Organization", name: c.appName, url: ctx.abs("/") },
          offers: [
            { "@type": "Offer", name: "Starter (jährlich)", price: String(c.business.starterPriceValue), priceCurrency: c.premium.currency },
            { "@type": "Offer", name: "Team (jährlich)", price: String(c.business.teamPriceValue), priceCurrency: c.premium.currency }
          ]
        }],
        main: landing
      })
    },
    {
      path: "/admin/",
      sitemap: false,
      html: page(ctx, {
        path: "/admin/",
        title: "Admin-Bereich",
        description: "Firmen-Rahmen verwalten.",
        noindex: true,
        editor: true,
        mode: "admin",
        scripts: ["/vendor/supabase.js", "/js/admin.js"],
        main: admin
      })
    },
    {
      path: "/team/",
      sitemap: false,
      html: page(ctx, {
        path: "/team/",
        title: "Firmen-Rahmen",
        description: "Profilbild mit Firmen-Rahmen erstellen – dein Foto bleibt im Browser.",
        noindex: true,
        editor: true,
        mode: "team",
        scripts: ["/js/team.js"],
        main: team
      })
    }
  ];
}
