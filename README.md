# ProfilRing – Profilbild-Rahmen mit eigenem Text

Web-App für runde Profilbild-Rahmen wie „Open to Work“ oder „Hiring“, aber mit freiem Text und Design. Dazu kommen virale Verbreitung, SEO-Landingpages, Premium (Einmalkauf) und Firmen-Pakete.

**Grundprinzip:** Fotos werden ausschließlich im Browser verarbeitet und **nie** hochgeladen. Das Backend speichert nur Lizenzen, Firmen-Konten und Rahmen-Einstellungen.

> „ProfilRing“ und `profilring.de` sind Platzhalter. Name, Domain und Preise änderst du zentral in `config/site.json`.

> **Edition:** Standardmäßig wird die **kostenlose Version** gebaut (`"edition": "free"`): nur der Editor, ohne Backend, ohne Premium und ohne Firmen-Pakete. Mit `EDITION=full` ist alles wieder da – siehe [Editionen: free und full](#editionen-free-und-full).

---

## Inhalt

1. [Funktionen](#funktionen)
2. [Projektstruktur](#projektstruktur)
3. [Lokal starten](#lokal-starten)
4. [Editionen: free und full](#editionen-free-und-full)
5. [Konfiguration](#konfiguration)
6. [Supabase einrichten](#supabase-einrichten)
7. [Stripe einrichten](#stripe-einrichten)
8. [E-Mail (Resend) einrichten](#e-mail-resend-einrichten)
9. [Statistik ohne Cookies](#statistik-ohne-cookies)
10. [Deployment (Netlify oder Vercel)](#deployment)
11. [Eigene Domain](#eigene-domain)
12. [Checkliste vor dem Livegang](#checkliste-vor-dem-livegang)
13. [Hinweise & Grenzen](#hinweise--grenzen)

---

## Funktionen

| Bereich | Was es gibt |
|---|---|
| **Editor** | Upload (JPG/PNG/WebP/HEIC), Zuschnitt, gebogener Text, Farben, Ring-Form, Live-Vorschau + Feed-Miniatur, PNG-Export |
| **Verbreitung** | Kleiner Hinweis „Erstellt mit …“ im Gratis-Export · Teilen-Dialog nach dem Download (LinkedIn, WhatsApp, X, Link kopieren, Web-Share-API) · eigener Link je Vorlage (`/vorlage/jobsuche/`) mit eigenem Vorschaubild |
| **SEO** | Startseite + 6 Landingpages (`/rahmen/jobsuche/`, `/rahmen/recruiting/`, `/rahmen/freelancer/`, `/rahmen/selbststaendig/`, `/rahmen/mentoring/`, `/rahmen/ehrenamt/`) mit H1, Text, Beispielbildern, FAQ, eingebettetem Editor · Meta-Titles/-Descriptions · Open-Graph-Bilder · `sitemap.xml` · `robots.txt` · strukturierte Daten (WebApplication, FAQPage, Breadcrumb, Product, Service) |
| **Premium** (einmalig) | Kein Hinweis im Bild · Farbverläufe · 5 zusätzliche Schriften · 23 Premium-Vorlagen · Symbole & Emojis im Ring · Export 2048 px. Gesperrte Elemente sind sichtbar und tragen ein „PRO“-Schild bzw. Schloss mit Upgrade-Dialog. Kauf über Stripe Checkout, Freischaltung per Lizenzschlüssel oder Magic-Link, ohne Passwort |
| **Firmen-Pakete** | Seite „Für Unternehmen“ mit Preisen & Kontaktformular · Admin-Bereich (`/admin/`, Login per Magic-Link) · Rahmen in Firmenfarben, Text, Logo, Sperre · Team-Link `/team/<name>` · Download-Zähler · Stripe-Abo + Kundenportal |
| **Recht & Vertrauen** | Impressum, Datenschutz, AGB, Widerrufsbelehrung (mit Platzhaltern) · gut sichtbarer Hinweis „Deine Fotos verlassen nie deinen Browser“ · keine Cookies · Platz für Werbung vorbereitet, aber deaktiviert |

Lighthouse (mobil, lokal ohne Kompression gemessen): Startseite Performance 93 · Barrierefreiheit 100 · Best Practices 100 · SEO 100. Auf Netlify/Vercel kommen Kompression und Caching noch hinzu.

## Projektstruktur

```
config/site.json          Zentrale Einstellungen (Edition, Name, Domain, Preise, Supabase, Statistik, Werbung)
public/                   Statische Dateien, werden 1:1 ausgeliefert
  js/renderer.js          Canvas-Rendering (Foto, Ring, gebogener Text, Symbole, Logo, Hinweis)
  js/app.js               Editor-Logik (Modi: public / admin / team), Premium-Sperren, Teilen-Dialog
  js/platform.js          Konfiguration, Statistik-Events, Backend-Aufrufe, Premium-Status, Farbschema
  js/presets.js           Schriften, Standardwerte, kostenlose + Premium-Vorlagen
  js/icons.js             Symbole und Emojis für den Ring
  js/i18n.js              Texte (Deutsch + Englisch)
  js/premium-page.js      Premium-Seite (Kauf, Aktivierung)
  js/admin.js / team.js   Firmen-Admin und Team-Link
  js/business-page.js     Kontaktformular
  img/                    Beispielbilder, Open-Graph-Bilder, Icons (erzeugt mit npm run images)
  fonts/ vendor/          Lokale Schriften (OFL), heic2any, supabase-js
src/
  content.mjs             Texte der Landingpages (Title, Description, H1, FAQ …)
  edition.mjs             Editionen free/full: Markierungen im Code, Texte je Edition
  layout.mjs              Seitenlayout, Meta-Tags, strukturierte Daten
  partials/editor.html    Editor-Markup (wird in jede Editor-Seite eingebettet)
  pages/*.mjs             Seiten-Generatoren (core, legal, premium, business)
scripts/
  build.mjs               Statischer Build nach dist/ (ohne Abhängigkeiten, Edition free/full)
  check-dist.mjs          Prüft dist/ auf tote Links und (bei free) Bezahl-Hinweise
  serve.mjs               Lokaler Webserver
  render-images.mjs       Erzeugt Beispiel- und OG-Bilder mit dem echten Renderer
supabase/
  migrations/             Datenbankschema inkl. Zugriffsrechten (RLS)
  functions/              Edge Functions (Stripe, Lizenzen, Firmen, Kontakt) + Tests
```

## Lokal starten

Voraussetzung: [Node.js](https://nodejs.org) ab Version 20. Weitere Pakete werden nicht benötigt.

```bash
npm run dev          # kostenlose Edition bauen und http://localhost:8080 starten
npm run dev:full     # dasselbe mit Premium und Firmen-Paketen
npm run check        # dist/ prüfen: tote Links, BASE_PATH, bei "free" keine Bezahl-Hinweise
```

- Premium testen ohne Kauf (nur `dev:full`): `http://localhost:8080/?premium=dev` (funktioniert nur auf localhost; mit `?premium=off` wieder aus)
- Nach Änderungen an Texten in `src/` oder an `public/`: `npm run build` (bzw. `npm run dev` neu starten)
- Beispiel- und OG-Bilder neu erzeugen (z. B. nach neuen Vorlagen):
  ```bash
  npm i --no-save playwright && npx playwright install chromium
  npm run images
  ```
- Tests der Edge Functions (benötigt [Deno](https://deno.com)): `deno test --allow-env supabase/functions/tests/`

## Editionen: free und full

| | `free` (Standard) | `full` |
|---|---|---|
| Editor, Vorlagen, PNG-Export 1080 px, Hinweis „Erstellt mit …“, Teilen-Dialog | ✓ | ✓ |
| Premium (Verläufe, Zusatzschriften, Premium-Vorlagen, Symbole, 2048 px, Upgrade-Dialog) | – | ✓ |
| Seiten `/premium/`, `/unternehmen/`, `/admin/`, `/team/` | – | ✓ |
| AGB und Widerruf | – | ✓ |
| Backend (Supabase, Stripe) | – | ✓ |

**Umschalten:**
- dauerhaft: `"edition": "free"` bzw. `"full"` in `config/site.json`
- pro Build: `EDITION=full node scripts/build.mjs` (oder `npm run build:full`). Die Umgebungsvariable gewinnt gegenüber `config/site.json`.
- GitHub Pages: Repository-Variable `EDITION` auf `full` setzen (ohne Variable wird `free` gebaut)

**Wie es funktioniert:** Der Premium- und Firmen-Code bleibt vollständig im Repo. Teile, die nur zu einer Edition gehören, stehen zwischen Markierungen (`/* @full-start */ … /* @full-end */` in JS/CSS, `<!-- @full-start --> … <!-- @full-end -->` in HTML; Gegenstück `@free-start`/`@free-end`). Der Build entfernt die Blöcke der anderen Edition. Texte der Landingpages können als `{ full: "…", free: "…" }` in `src/content.mjs` stehen (`free: null` = weglassen). Details: `src/edition.mjs`.

In der kostenlosen Edition lädt keine Seite `supabase.js`, es gibt keine Aufrufe an ein Backend und keine Lizenzprüfung; Premium-Vorlagen bekommen weder eine `/vorlage/…`-Seite noch ein Vorschaubild. Die Datenschutzerklärung ist eine eigene, kürzere Fassung (keine Zahlungen, keine Konten, keine Cookies).

## Konfiguration

`config/site.json` enthält nur **öffentliche** Werte. Jeder Wert lässt sich beim Build auch per Umgebungsvariable setzen, was für Netlify/Vercel praktisch ist:

| Variable | Bedeutung |
|---|---|
| `SITE_URL` | z. B. `https://www.deine-domain.de` (für Canonical-URLs, Sitemap, OG-Bilder, Teilen-Links) |
| `EDITION` | `free` (Standard) oder `full`, siehe oben |
| `APP_NAME` | Name der App (auch im Hinweis „Erstellt mit …“) |
| `BASE_PATH` | nur bei Hosting in einem Unterordner, z. B. `/repo` |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Projekt-URL und **Publishable/Anon-Key**, niemals den Service-Role-Key (nur `full`) |
| `ANALYTICS_PROVIDER`, `ANALYTICS_SRC`, `ANALYTICS_DOMAIN`, `ANALYTICS_WEBSITE_ID` | cookielose Statistik (siehe unten) |
| `ADS_ENABLED` | `true` zeigt die vorbereiteten Werbeplätze (vorher Consent-Banner + Datenschutz ergänzen!) |

Ohne Supabase-Werte läuft auch die Vollversion als Editor. Kauf, Admin-Bereich und Team-Links zeigen dann einen Hinweis, dass sie noch nicht eingerichtet sind. Für einen Start ganz ohne Backend ist die Edition `free` gedacht.

## Supabase einrichten

1. **Projekt anlegen** auf [supabase.com](https://supabase.com): Region **Frankfurt (eu-central-1)** wählen. Das ist wichtig für die DSGVO.
2. **CLI verbinden** (im Projektordner):
   ```bash
   npx supabase login
   npx supabase link --project-ref <deine-projekt-ref>
   ```
3. **Datenbank anlegen:** `npx supabase db push`. Das spielt `supabase/migrations/` ein: Tabellen, Zugriffsrechte, Zähler-Funktionen und den Storage-Bucket `logos`.
4. **Secrets setzen:** `supabase/functions/.env.example` nach `supabase/functions/.env` kopieren, ausfüllen (Werte aus den Abschnitten Stripe/Resend) und hochladen:
   ```bash
   npx supabase secrets set --env-file supabase/functions/.env
   ```
5. **Edge Functions deployen:**
   ```bash
   npx supabase functions deploy
   ```
   Die Datei `supabase/config.toml` sorgt dafür, dass die Funktionen ohne JWT aufrufbar sind. Wo ein Login nötig ist (Firmen-Checkout, Kundenportal), prüfen die Funktionen den Benutzer selbst.
6. **Auth für den Admin-Login** (Dashboard → Authentication):
   - *URL Configuration*: **Site URL** = `https://www.deine-domain.de`, unter **Redirect URLs** `https://www.deine-domain.de/admin/` und `http://localhost:8080/admin/` eintragen
   - *Providers → Email*: aktiviert lassen, „Confirm email“ an
   - *SMTP Settings*: eigenen SMTP (z. B. Resend) eintragen. Der eingebaute Versand ist stark limitiert.
   - Optional: E-Mail-Vorlage „Magic Link“ auf Deutsch übersetzen
7. **Keys in die Website eintragen:** Dashboard → *Project Settings → API Keys*. Die Projekt-URL und den **Publishable Key** als `SUPABASE_URL` / `SUPABASE_ANON_KEY` beim Hoster hinterlegen (oder in `config/site.json`).

## Stripe einrichten

Alles zuerst im **Testmodus** einrichten und durchspielen (Testkarte `4242 4242 4242 4242`, beliebiges Datum/CVC). Erst danach dieselben Schritte im Live-Modus wiederholen.

1. **Produkte anlegen** (Produktkatalog → Produkt hinzufügen):
   | Produkt | Preis | Abrechnung |
   |---|---|---|
   | ProfilRing Premium | 4,99 € **inkl.** USt. | einmalig |
   | Firmen-Paket Starter | 49 € **zzgl.** USt. | wiederkehrend, jährlich |
   | Firmen-Paket Team | 149 € **zzgl.** USt. | wiederkehrend, jährlich |
   
   Die drei **Preis-IDs** (`price_…`) als `STRIPE_PRICE_PREMIUM`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_TEAM` in die Secrets eintragen.
2. **API-Key:** Entwickler → API-Schlüssel → *Geheimer Schlüssel* als `STRIPE_SECRET_KEY`. Empfehlung: einen *eingeschränkten Schlüssel* mit Schreibrechten auf Checkout Sessions, Customer Portal und Lesen von Subscriptions verwenden.
3. **Webhook:** Entwickler → Webhooks → Endpoint hinzufügen
   - URL: `https://<projekt-ref>.supabase.co/functions/v1/stripe-webhook`
   - Ereignisse: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`, `charge.dispute.created`
   - *Signing secret* (`whsec_…`) als `STRIPE_WEBHOOK_SECRET`
4. **Kundenportal aktivieren** (Einstellungen → Billing → Kundenportal): Kündigung, Rechnungen und Zahlungsmittel erlauben. Firmen öffnen das Portal über „Rechnungen & Abo verwalten“ im Admin-Bereich.
5. **Zahlungsmethoden** (Einstellungen → Zahlungsmethoden): z. B. Karte, Apple/Google Pay, PayPal, Klarna, SEPA aktivieren.
6. **Steuern & Rechnungen:** Kleinunternehmer:innen nach § 19 UStG weisen keine USt. aus. Andernfalls Stripe Tax aktivieren und `STRIPE_AUTOMATIC_TAX=true` setzen. Mit `STRIPE_INVOICES=true` erhalten auch Premium-Käufer:innen eine Rechnung.
7. **Ablauf zum Testen:** Premium-Seite → Kauf → Rückleitung auf `/premium/?session_id=…` → Schlüssel wird angezeigt und per E-Mail verschickt. Erstattest du die Zahlung in Stripe, wird die Lizenz automatisch gesperrt.

## E-Mail (Resend) einrichten

Wird für Lizenz-Mails, den Magic-Link „Schlüssel verloren?“ und die Benachrichtigung zum Kontaktformular gebraucht.

1. Konto auf [resend.com](https://resend.com) anlegen, **Domain verifizieren** (DNS-Einträge SPF/DKIM bei deinem Domain-Anbieter setzen)
2. API-Key erzeugen → `RESEND_API_KEY`; Absender `EMAIL_FROM` z. B. `ProfilRing <hallo@deine-domain.de>`; Empfänger für Anfragen `CONTACT_EMAIL`
3. Dieselben Zugangsdaten als SMTP in Supabase Auth eintragen (Host `smtp.resend.com`, Port 465, Benutzer `resend`, Passwort = API-Key)

## Statistik ohne Cookies

Ohne Cookies ist kein Cookie-Banner nötig. Gezählt werden Seitenaufrufe sowie die Ereignisse `Download`, `App geteilt`, `Vorlage gewählt`, `Upgrade Dialog`, `Premium gekauft`, `Firmen-Anfrage` usw.

- **Plausible** (EU-Hosting): `ANALYTICS_PROVIDER=plausible`, `ANALYTICS_SRC=https://plausible.io/js/script.js`, `ANALYTICS_DOMAIN=deine-domain.de`. In Plausible unter *Goals* die Ereignisnamen als Custom Events anlegen.
- **Umami** (selbst gehostet oder Cloud): `ANALYTICS_PROVIDER=umami`, `ANALYTICS_SRC=https://<dein-umami>/script.js`, `ANALYTICS_WEBSITE_ID=<id>`

Die UTM-Parameter der Teilen-Links (`utm_source=linkedin|whatsapp|x|link`) zeigen dir, welcher Kanal Besucher:innen bringt.

## Deployment

### Netlify (empfohlen)
1. [app.netlify.com](https://app.netlify.com) → *Add new site → Import an existing project* → GitHub-Repo wählen
2. Build-Befehl und Publish-Ordner kommen automatisch aus `netlify.toml` (`node scripts/build.mjs` → `dist`)
3. *Site configuration → Environment variables*: `SITE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` und ggf. die Statistik-Variablen setzen
4. Deploy auslösen. Rewrites (`/team/*`) und Sicherheits-/Cache-Header erzeugt der Build als `_redirects`/`_headers`.

### Vercel
1. [vercel.com/new](https://vercel.com/new) → Repo importieren, Framework „Other“
2. Build-Befehl und Ausgabeordner stehen in `vercel.json`
3. Umgebungsvariablen wie oben setzen → *Deploy*

### GitHub Pages (kostenlose Version ohne Backend)
Der Workflow `.github/workflows/pages.yml` baut bei jedem Push auf `main`, prüft das Ergebnis mit `scripts/check-dist.mjs` und veröffentlicht es.

1. *Settings → Pages → Source: GitHub Actions*
2. Fertig – ohne weitere Variablen läuft die **kostenlose Edition** unter `https://<name>.github.io/LinkedIn-Profil/`. Der Unterordner wird automatisch als `BASE_PATH` gesetzt (Links, Bilder, Canonical, OG-Bilder, Sitemap).
3. Optional unter *Settings → Secrets and variables → Actions → Variables*:
   - `SITE_URL` mit eigener Domain (z. B. `https://www.deine-domain.de`): dann bleibt `BASE_PATH` leer. Die Domain zusätzlich unter *Settings → Pages → Custom domain* eintragen.
   - `EDITION=full` plus `SUPABASE_URL`, `SUPABASE_ANON_KEY` für die Vollversion. Team-Links funktionieren dort über eine Weiterleitung in der `404.html`.
   - Statistik-Variablen (`ANALYTICS_*`). Dann erwähnt die Datenschutzerklärung den Dienst automatisch.

Hinweis: Unter `/<repo>/` liegt die `robots.txt` nicht im Domain-Stamm und wird von Suchmaschinen ignoriert; die Sitemap bei Bedarf direkt in der Search Console einreichen. Mit eigener Domain entfällt das.

## Eigene Domain

1. Domain kaufen, z. B. bei INWX, IONOS, Strato oder Cloudflare (`.de` ab ca. 5 €/Jahr)
2. **Netlify:** *Domain management → Add a domain*. Dann entweder die Netlify-Nameserver beim Registrar eintragen oder per DNS: `www` als CNAME auf `<deine-seite>.netlify.app` und die Apex-Domain als A-Record auf `75.2.60.5`
3. **Vercel:** *Settings → Domains → Add*. Apex-Domain als A-Record auf `76.76.21.21`, `www` als CNAME auf `cname.vercel-dns.com`
4. Das HTTPS-Zertifikat stellen Netlify/Vercel automatisch aus
5. Die neue Adresse überall nachziehen:
   - `SITE_URL` beim Hoster (oder in `config/site.json`) und neu deployen
   - Supabase-Secrets `SITE_URL` + `ALLOWED_ORIGINS`, Supabase Auth *Site URL* + *Redirect URLs*
   - Stripe: Webhook-URL bleibt gleich (Supabase), Branding/Kundenportal-Link prüfen
6. In der [Google Search Console](https://search.google.com/search-console) die Domain bestätigen und `https://www.deine-domain.de/sitemap.xml` einreichen

## Checkliste vor dem Livegang

- [ ] App-Name, Domain und Preise in `config/site.json` angepasst, Bilder neu erzeugt (`npm run images`)
- [ ] **Impressum, Datenschutzerklärung** (bei `full` zusätzlich **AGB, Widerruf**): alle gelb markierten Platzhalter ausgefüllt und rechtlich prüfen lassen (die Texte sind Vorlagen, keine Rechtsberatung)
- [ ] nur `full`: Umsatzsteuer-Status geklärt (Kleinunternehmer oder Stripe Tax)
- [ ] nur `full`: Testkauf Premium + Firmen-Paket im Stripe-Testmodus, Erstattung testen, danach Live-Schlüssel eintragen
- [ ] nur `full`: Magic-Link-Login und Lizenz-E-Mail kommen an (Spam-Ordner prüfen)
- [ ] Statistik zählt Downloads
- [ ] Prüfen, dass die Marke/der App-Name keine fremden Markenrechte verletzt

## Hinweise & Grenzen

- **Premium wird im Browser geprüft.** Technisch versierte Personen könnten die Sperre umgehen. Bei einem Preis von 4,99 € ist das ein bewusster Kompromiss für ein Produkt ohne Login und ohne Foto-Upload. Lizenzen werden alle 7 Tage im Hintergrund neu geprüft; erstattete Käufe werden gesperrt.
- **Der Download-Zähler** der Firmen-Links ist öffentlich aufrufbar und daher nicht fälschungssicher. Für „wie viele Bilder wurden erstellt“ reicht das.
- **Paket-Downgrade:** Wechselt eine Firma von Team zu Starter, bleiben vorhandene Rahmen nutzbar; neue lassen sich erst unter dem Limit anlegen.
- **Werbung:** Platzhalter (`.ad-slot`) sind auf Startseite und Landingpages vorbereitet. Vor dem Einbau von AdSense brauchst du ein Consent-Banner und eine angepasste Datenschutzerklärung.
- **Englische Version:** Das Wörterbuch in `public/js/i18n.js` ist vollständig. Für englische Seiten in `src/` Seiten mit `lang="en"` erzeugen.
