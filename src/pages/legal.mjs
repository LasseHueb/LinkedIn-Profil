/*
 * Impressum, Datenschutzerklärung, AGB, Widerrufsbelehrung.
 * WICHTIG: Vorlagen mit Platzhaltern – vor dem Livegang ausfüllen und rechtlich prüfen lassen
 * (z. B. über einen Generator wie e-recht24 oder eine Anwaltskanzlei). Keine Rechtsberatung.
 */
import { page, esc } from "../layout.mjs";

const P = (s) => `<span class="placeholder">[${s}]</span>`;

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
  const price = esc(ctx.cfg.premium.price);
  const b = ctx.cfg.business;
  const today = new Date().toLocaleDateString("de-DE", { year: "numeric", month: "long" });

  const impressum = `
    <h2>Angaben gemäß § 5 DDG</h2>
    <p>${P("Vorname Nachname / Firmenname")}<br>${P("Straße Hausnummer")}<br>${P("PLZ Ort")}<br>Deutschland</p>
    <h2>Kontakt</h2>
    <p>E-Mail: ${P("kontakt@deine-domain.de")}<br>Telefon: ${P("optional")}</p>
    <h2>Umsatzsteuer</h2>
    <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: ${P("DE123456789 – oder Hinweis auf Kleinunternehmerregelung nach § 19 UStG")}</p>
    <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
    <p>${P("Vorname Nachname, Anschrift wie oben")}</p>
    <h2>Verbraucherstreitbeilegung</h2>
    <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
    <h2>Hinweis</h2>
    <p>${app} ist ein unabhängiges Angebot und steht in keiner Verbindung zu LinkedIn, Xing, Instagram, WhatsApp oder anderen Netzwerken. Genannte Marken gehören ihren jeweiligen Inhabern.</p>`;

  const datenschutz = `
    <p><strong>Kurz gesagt:</strong> Deine Fotos verlassen nie deinen Browser. Wir setzen keine Cookies und kein Tracking ein, das dich über Websites hinweg verfolgt. Personenbezogene Daten verarbeiten wir nur, wenn du Premium kaufst, ein Firmen-Konto nutzt oder uns kontaktierst.</p>

    <h2>1. Verantwortlicher</h2>
    <p>${P("Vorname Nachname / Firmenname")}, ${P("Anschrift")}, E-Mail: ${P("datenschutz@deine-domain.de")}</p>

    <h2>2. Fotos und Bildbearbeitung</h2>
    <p>Die Bearbeitung deines Fotos (Zuschnitt, Rahmen, Export) erfolgt ausschließlich lokal in deinem Browser. Das Foto wird zu keinem Zeitpunkt an unsere oder fremde Server übertragen und nicht gespeichert. Schließt du die Seite, ist es aus dem Arbeitsspeicher entfernt.</p>

    <h2>3. Hosting und Server-Logfiles</h2>
    <p>Die Website wird bei ${P("Netlify Inc. / Vercel Inc. – Anbieter, Anschrift")} gehostet. Beim Aufruf werden technisch notwendige Daten verarbeitet (IP-Adresse, Datum/Uhrzeit, aufgerufene Seite, Browsertyp), um die Website auszuliefern und vor Missbrauch zu schützen. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. Mit dem Anbieter besteht ein Auftragsverarbeitungsvertrag; eine Übermittlung in die USA erfolgt auf Grundlage des EU-US Data Privacy Framework bzw. von Standardvertragsklauseln.</p>

    <h2>4. Lokale Speicherung im Browser (keine Cookies)</h2>
    <p>Wir speichern im <em>localStorage</em> deines Browsers nur: dein gewähltes Farbschema, ob du den Teilen-Dialog ausgeblendet hast und – falls du Premium nutzt – deinen Lizenzschlüssel. Diese Daten bleiben auf deinem Gerät, sind für die gewünschte Funktion unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG) und können jederzeit über die Browsereinstellungen gelöscht werden.</p>

    <h2>5. Reichweitenmessung ohne Cookies</h2>
    <p>Wir nutzen ${P("Plausible Analytics (Plausible Insights OÜ, Estland) / Umami (selbst gehostet)")}, um anonyme Nutzungsstatistiken zu erstellen (z. B. Seitenaufrufe, Anzahl Downloads). Es werden keine Cookies gesetzt und keine personenbezogenen Profile gebildet; IP-Adressen werden nur gekürzt bzw. gehasht verarbeitet und nicht gespeichert. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Verbesserung des Angebots).</p>

    <h2>6. Kauf von Premium und Firmen-Paketen (Stripe)</h2>
    <p>Zahlungen wickeln wir über Stripe Payments Europe Ltd., 1 Grand Canal Street Lower, Dublin, Irland, ab. Dabei verarbeitet Stripe deine Zahlungsdaten, E-Mail-Adresse und ggf. Rechnungsadresse. Wir erhalten von Stripe nur E-Mail-Adresse, Betrag und Zahlungsstatus. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und lit. c (steuerliche Aufbewahrungspflichten). Datenschutzhinweise von Stripe: <a href="https://stripe.com/de/privacy" rel="noopener">stripe.com/de/privacy</a>.</p>

    <h2>7. Lizenzen und Firmen-Konten (Supabase)</h2>
    <p>Für Premium-Lizenzen und Firmen-Konten nutzen wir Supabase (Supabase Inc.) mit Datenhaltung in der EU (${P("Region, z. B. Frankfurt")}). Gespeichert werden: Lizenzschlüssel, E-Mail-Adresse und Kaufzeitpunkt; bei Firmen-Konten zusätzlich Firmenname, Login-E-Mail, gebuchtes Paket, die Rahmen-Einstellungen (Farben, Text, Schrift, ggf. Logo) und ein Zähler, wie oft ein Firmen-Rahmen heruntergeladen wurde. <strong>Fotos von Mitarbeitenden werden nicht gespeichert.</strong> Die Anmeldung erfolgt per Einmal-Link an die E-Mail-Adresse, ohne Passwort. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>

    <h2>8. E-Mail-Versand</h2>
    <p>Lizenzschlüssel und Anmelde-Links versenden wir über ${P("Resend (Resend Inc.) bzw. den E-Mail-Dienst von Supabase")}. Verarbeitet werden E-Mail-Adresse und Inhalt der Nachricht. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>

    <h2>9. Kontaktformular</h2>
    <p>Wenn du uns über das Formular auf der Seite „Für Unternehmen“ kontaktierst, speichern wir Name, E-Mail, Firma und Nachricht, um deine Anfrage zu beantworten (Art. 6 Abs. 1 lit. b bzw. f DSGVO). Die Daten löschen wir, sobald die Anfrage erledigt ist und keine Aufbewahrungspflichten bestehen.</p>

    <h2>10. Speicherdauer</h2>
    <p>Lizenz- und Rechnungsdaten bewahren wir gemäß handels- und steuerrechtlichen Pflichten bis zu 10 Jahre auf. Firmen-Konten löschen wir auf Wunsch bzw. spätestens ${P("12 Monate")} nach Vertragsende.</p>

    <h2>11. Deine Rechte</h2>
    <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15–21 DSGVO) sowie das Recht auf Beschwerde bei einer Aufsichtsbehörde, z. B. ${P("Landesdatenschutzbehörde deines Bundeslandes")}.</p>

    <h2>12. Werbung</h2>
    <p>Derzeit wird auf dieser Website keine Werbung ausgespielt. Sollte sich das ändern, holen wir vorher deine Einwilligung ein und passen diese Erklärung an.</p>

    <p class="small muted">Stand: ${today}</p>`;

  const agb = `
    <h2>§ 1 Geltungsbereich</h2>
    <p>Diese AGB gelten für alle Verträge zwischen ${P("Firmenname, Anschrift")} („Anbieter“) und Kund:innen über die kostenpflichtigen Leistungen von ${app} („Premium“ und „Firmen-Pakete“). Die kostenlose Nutzung des Editors ist ohne Vertragsabschluss möglich.</p>

    <h2>§ 2 Leistungen</h2>
    <p><strong>Premium</strong> schaltet gegen eine Einmalzahlung von ${price} (inkl. gesetzlicher USt.) zusätzliche Funktionen im Editor frei: Export ohne Hinweis „Erstellt mit ${app}“, Farbverläufe, zusätzliche Schriftarten, Premium-Vorlagen, Symbole/Emojis und Export in 2048 × 2048 px. Die Freischaltung erfolgt über einen Lizenzschlüssel, der für die private Nutzung durch die erwerbende Person auf beliebig vielen eigenen Geräten genutzt werden darf.</p>
    <p><strong>Firmen-Pakete</strong> (Starter ${esc(b.starterPrice)}/Jahr, Team ${esc(b.teamPrice)}/Jahr, jeweils zzgl. USt.) richten sich ausschließlich an Unternehmer:innen im Sinne von § 14 BGB und umfassen einen Admin-Bereich zur Gestaltung von Firmen-Rahmen, einen Link für Mitarbeitende und einen Nutzungszähler im angegebenen Umfang.</p>

    <h2>§ 3 Vertragsschluss und Zahlung</h2>
    <p>Der Vertrag kommt mit Abschluss des Bezahlvorgangs über den Zahlungsdienstleister Stripe zustande. Premium ist sofort nach Zahlungseingang verfügbar. Firmen-Pakete verlängern sich jeweils um ein Jahr, wenn sie nicht bis zum Ende der Laufzeit gekündigt werden; die Kündigung ist jederzeit über das Kundenportal oder per E-Mail möglich.</p>

    <h2>§ 4 Pflichten der Nutzer:innen</h2>
    <p>Nutzer:innen sind für die Inhalte ihrer Rahmen (Texte, Logos) selbst verantwortlich. Untersagt sind rechtswidrige Inhalte sowie die Verwendung fremder Marken oder Logos ohne Berechtigung.</p>

    <h2>§ 5 Verfügbarkeit</h2>
    <p>Der Editor läuft im Browser der Nutzer:innen. Der Anbieter bemüht sich um eine hohe Verfügbarkeit der Online-Dienste (Lizenzprüfung, Firmen-Links), schuldet jedoch keine ununterbrochene Erreichbarkeit.</p>

    <h2>§ 6 Haftung</h2>
    <p>Der Anbieter haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit. Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten ist die Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt. Im Übrigen ist die Haftung ausgeschlossen.</p>

    <h2>§ 7 Widerrufsrecht</h2>
    <p>Verbraucher:innen steht ein Widerrufsrecht nach Maßgabe der <a href="${ctx.u("/widerruf/")}">Widerrufsbelehrung</a> zu.</p>

    <h2>§ 8 Schlussbestimmungen</h2>
    <p>Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Gegenüber Verbraucher:innen gilt diese Rechtswahl nur, soweit zwingende Verbraucherschutzvorschriften des Aufenthaltsstaats nicht entgegenstehen. Gerichtsstand für Unternehmer:innen ist ${P("Ort")}.</p>
    <p class="small muted">Stand: ${today}</p>`;

  const widerruf = `
    <h2>Widerrufsrecht</h2>
    <p>Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.</p>
    <p>Um dein Widerrufsrecht auszuüben, musst du uns (${P("Name, Anschrift, E-Mail")}) mittels einer eindeutigen Erklärung (z. B. E-Mail) über deinen Entschluss, diesen Vertrag zu widerrufen, informieren. Zur Wahrung der Widerrufsfrist reicht es aus, dass du die Mitteilung vor Ablauf der Frist absendest.</p>
    <h2>Folgen des Widerrufs</h2>
    <p>Wenn du diesen Vertrag widerrufst, erstatten wir dir alle Zahlungen unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag, an dem die Mitteilung über deinen Widerruf bei uns eingegangen ist. Für die Rückzahlung verwenden wir dasselbe Zahlungsmittel, das du bei der ursprünglichen Transaktion eingesetzt hast.</p>
    <h2>Vorzeitiges Erlöschen des Widerrufsrechts</h2>
    <p>Bei einem Vertrag über digitale Inhalte erlischt das Widerrufsrecht, wenn wir mit der Vertragserfüllung begonnen haben, nachdem du ausdrücklich zugestimmt hast, dass wir vor Ablauf der Widerrufsfrist mit der Ausführung beginnen, und du deine Kenntnis davon bestätigt hast, dass du durch deine Zustimmung dein Widerrufsrecht verlierst (§ 356 Abs. 5 BGB). Diese Zustimmung erteilst du vor dem Kauf von Premium über ein Kontrollkästchen; wir bestätigen sie dir zusammen mit dem Lizenzschlüssel.</p>
    <h2>Muster-Widerrufsformular</h2>
    <p>(Wenn du den Vertrag widerrufen willst, fülle bitte dieses Formular aus und sende es zurück.)</p>
    <p>An ${P("Name, Anschrift, E-Mail")}:<br>Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über die Freischaltung von ${app} Premium.<br>Bestellt am: ___ / Lizenzschlüssel: ___<br>Name: ___<br>Anschrift: ___<br>Datum: ___</p>`;

  return [
    legalPage(ctx, "/impressum/", "Impressum", `Impressum von ${ctx.cfg.appName}.`, impressum),
    legalPage(ctx, "/datenschutz/", "Datenschutzerklärung", "Datenschutz: Deine Fotos verlassen nie deinen Browser. Keine Cookies, cookielose Statistik.", datenschutz),
    legalPage(ctx, "/agb/", "Allgemeine Geschäftsbedingungen", `AGB für ${ctx.cfg.appName} Premium und Firmen-Pakete.`, agb),
    legalPage(ctx, "/widerruf/", "Widerrufsbelehrung", "Widerrufsbelehrung für den Kauf von Premium.", widerruf)
  ];
}
