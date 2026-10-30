/*
 * Impressum und Datenschutzerklärung eines privaten, nicht-kommerziellen Projekts.
 * Angaben (Name, Anschrift, E-Mail, Aufsichtsbehörde) stehen in config/site.json → legal.
 * Keine Rechtsberatung – Änderungen an der Technik hier mitziehen (Speicher, Anfragen, Cookies).
 */
import { page, esc, independenceNote } from "../layout.mjs";

function legalPage(ctx, path, title, description, body) {
  return {
    path,
    priority: "0.3",
    html: page(ctx, {
      path, title, description,
      main: `<div class="section prose legal">
    <h1>${esc(title)}</h1>
    ${body}
  </div>`
    })
  };
}

export default function pages(ctx) {
  const app = esc(ctx.cfg.appName);
  const L = ctx.cfg.legal || {};
  const owner = `${esc(L.name)}<br>${esc(L.street)}<br>${esc(L.city)}<br>${esc(L.country)}`;
  const mail = `<a href="mailto:${esc(L.email)}">${esc(L.email)}</a>`;

  const impressum = `
    <h2>Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)</h2>
    <p>${owner}</p>
    <h2>Kontakt</h2>
    <p>E-Mail: ${mail}</p>
    <h2>Hinweis</h2>
    <p>${app} ist ein privates, nicht-kommerzielles Projekt. Die Nutzung ist kostenlos, es werden keine Waren oder Dienstleistungen verkauft.</p>
    <p>${independenceNote(ctx)}</p>
    <h2>Haftung für Links</h2>
    <p>Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Für diese Inhalte ist der jeweilige Anbieter verantwortlich. Bei Bekanntwerden von Rechtsverletzungen entferne ich solche Links umgehend.</p>`;

  // Muss zur Technik passen: localStorage-Schlüssel siehe public/js/platform.js (pbg-theme) und app.js (pbg-share-dismissed);
  // keine Cookies, keine Anfragen an fremde Server (prüft scripts/check-dist.mjs).
  const datenschutz = `
    <h2>Das Wichtigste in Kürze</h2>
    <p>Deine Fotos verlassen nie deinen Browser. Die Bearbeitung und der Export finden vollständig auf deinem Gerät statt. Es gibt keine Benutzerkonten, keine Cookies, kein Tracking und keine Werbung.</p>

    <h2>1. Verantwortlicher</h2>
    <p>${esc(L.name)}, ${esc(L.street)}, ${esc(L.city)}, ${esc(L.country)}<br>E-Mail: ${mail}</p>

    <h2>2. Hosting über GitHub Pages</h2>
    <p>Diese Website wird über GitHub Pages bereitgestellt, einen Dienst der GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA. Beim Aufruf der Seite verarbeitet GitHub technisch notwendige Daten wie deine IP-Adresse, Datum und Uhrzeit des Zugriffs, die aufgerufene Seite sowie Browser- und Betriebssystem-Informationen, um die Seite auszuliefern und vor Missbrauch zu schützen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; mein berechtigtes Interesse liegt in der sicheren und zuverlässigen Bereitstellung der Website.</p>
    <p>Dabei können Daten in die USA übermittelt werden. GitHub ist unter dem EU-US Data Privacy Framework zertifiziert; ergänzend gelten die EU-Standardvertragsklauseln. Weitere Informationen: <a href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement</a></p>

    <h2>3. Verarbeitung deiner Fotos</h2>
    <p>Hochgeladene Fotos werden ausschließlich lokal in deinem Browser verarbeitet. Sie werden weder an mich noch an GitHub oder andere Dritte übertragen und nicht gespeichert. Sobald du die Seite schließt, sind sie aus dem Speicher entfernt.</p>

    <h2>4. Lokaler Speicher im Browser</h2>
    <p>Damit die App sich bestimmte Einstellungen merken kann (z. B. „Nicht mehr anzeigen“ beim Teilen-Hinweis), speichert sie kleine Werte im lokalen Speicher deines Browsers (localStorage). Diese Daten bleiben auf deinem Gerät und werden nicht übertragen. Die Speicherung ist für die von dir gewünschte Funktion unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG). Du kannst sie jederzeit über die Einstellungen deines Browsers löschen.</p>
    <p>Genutzt werden genau zwei Einträge, und zwar erst, wenn du die jeweilige Einstellung änderst:</p>
    <ul>
      <li><code>pbg-theme</code>: dein gewähltes Farbschema (System, Hell oder Dunkel)</li>
      <li><code>pbg-share-dismissed</code>: dass du „Nicht mehr anzeigen“ beim Teilen-Hinweis angehakt hast</li>
    </ul>

    <h2>5. Keine Cookies, kein Tracking</h2>
    <p>Diese Website setzt keine Cookies und verwendet keine Analyse- oder Tracking-Dienste. Alle Schriftarten und Skripte werden direkt von dieser Website geladen, nicht von Drittanbietern.</p>

    <h2>6. Teilen-Funktion</h2>
    <p>Nach dem Download kannst du die App mit „Link kopieren“ oder über die Teilen-Funktion deines Geräts weiterempfehlen. Beides arbeitet lokal: Der Link wird in deine Zwischenablage kopiert bzw. an das Teilen-Menü deines Geräts übergeben. Dabei werden keine Daten an mich oder an Dritte übertragen.</p>

    <h2>7. Kontakt per E-Mail</h2>
    <p>Wenn du mir eine E-Mail schreibst, verarbeite ich deine Angaben nur, um deine Anfrage zu beantworten (Art. 6 Abs. 1 lit. f DSGVO). Die E-Mail lösche ich, sobald sie erledigt ist und keine gesetzlichen Aufbewahrungspflichten bestehen.</p>

    <h2>8. Deine Rechte</h2>
    <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit (Art. 15–20 DSGVO) sowie das Recht, der Verarbeitung zu widersprechen (Art. 21 DSGVO). Wende dich dazu einfach per E-Mail an mich.</p>
    <p>Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei: ${esc(L.authority)}, <a href="https://${esc(L.authorityUrl)}" rel="noopener">${esc(L.authorityUrl)}</a></p>

    <p class="small muted">Stand: ${esc(L.privacyDate)}</p>`;

  return [
    legalPage(ctx, "/impressum/", "Impressum", `Impressum von ${ctx.cfg.appName}.`, impressum),
    legalPage(ctx, "/datenschutz/", "Datenschutzerklärung", "Datenschutz: Deine Fotos verlassen nie deinen Browser. Keine Cookies, keine Konten, kein Tracking.", datenschutz)
  ];
}
