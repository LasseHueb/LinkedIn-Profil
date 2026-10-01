# Profilbild-Banner-Generator

Web-App, mit der du dein Profilbild mit einem runden Schriftzug-Ring versiehst – ähnlich den bekannten „Open to Work“-Rahmen, aber mit freiem Text und eigenem Design. Export als PNG (1080 × 1080 px) für LinkedIn, Xing, Instagram, WhatsApp & Co.

**Datenschutz:** Fotos werden ausschließlich lokal im Browser verarbeitet. Kein Upload, kein Login, keine Datenbank, kein Tracking, keine externen Requests. Auch die Schriftarten werden lokal ausgeliefert, also nicht von Google-Servern geladen.

## Funktionen

- Foto per Drag & Drop, Dateiauswahl oder Einfügen (Strg+V); JPG, PNG, WebP, HEIC
- Zuschnitt: Zoom-Regler, Mausrad, Pinch-Geste, Verschieben per Maus/Touch/Pfeiltasten
- Gebogener Text am unteren Bogen: 6 Schriftarten, Größe, Fett, Großbuchstaben, Buchstabenabstand, Position
- Ring: Farbe (Farbwähler + Hex), optionaler Verlauf, Breite, Länge (180–350°), Drehung, weiche Enden, Deckkraft
- 8 Vorlagen (Jobsuche, Recruiting, Freelancer, Verfügbar für Projekte, Mentoring, Speaker, Ausbildung, Ehrenamt)
- Live-Vorschau plus Feed-Miniatur, automatische Textverkleinerung mit Hinweis, Kontrastwarnung
- Export als PNG in 1080 × 1080, transparenter oder weißer Hintergrund; „Teilen“ (Web Share API) auf Mobilgeräten
- Hell-/Dunkelmodus, Deutsch/Englisch, tastaturbedienbar, Labels an allen Reglern

## Starten

Es gibt keinen Build-Schritt. Du brauchst nur einen beliebigen statischen Webserver:

```bash
# im Projektordner
python3 -m http.server 8080
# oder
npx serve .
```

Danach <http://localhost:8080> öffnen. (Ein Doppelklick auf `index.html` funktioniert meist auch, aber ein lokaler Server ist zuverlässiger.)

## Kostenlos hosten

**GitHub Pages:** Der Workflow `.github/workflows/pages.yml` ist schon enthalten.
1. Code in den Branch `main` mergen bzw. pushen.
2. Im Repository: *Settings → Pages → Build and deployment → Source: „GitHub Actions“*.
3. Nach dem nächsten Push auf `main` läuft die Seite unter `https://<benutzer>.github.io/<repo>/`.

**Netlify:** Auf <https://app.netlify.com> „Add new site → Import from Git“ wählen und das Repo auswählen. Build-Befehl bleibt leer, das Publish-Verzeichnis ist `.` (siehe `netlify.toml`). Alternativ kannst du den Ordner per Drag & Drop auf <https://app.netlify.com/drop> ziehen.

**Vercel:** „Add New → Project“, Repo importieren, Framework „Other“ wählen, Build-Befehl leer lassen und deployen.

## Projektstruktur

```
index.html          Markup (alle Texte über data-i18n-Attribute)
css/styles.css      Layout, Hell-/Dunkelmodus
css/fonts.css       @font-face für die lokalen Schriften
fonts/              WOFF2-Dateien (SIL Open Font License, siehe LICENSE-*.txt)
js/i18n.js          Übersetzungen DE/EN + Hilfsfunktionen
js/presets.js       Schriftarten, Standardwerte, Vorlagen
js/renderer.js      Canvas-Rendering (Foto, Ring, gebogener Text)
js/app.js           UI-Logik: Upload, Zuschnitt, Regler, Export, Teilen
vendor/heic2any     HEIC-Umwandlung; wird nur bei Bedarf lokal nachgeladen (MIT)
```

### Weitere Sprache ergänzen

In `js/i18n.js` einen neuen Block (z. B. `fr: { … }`) mit denselben Schlüsseln anlegen und in `index.html` eine `<option>` im Sprachwähler hinzufügen.

### Eigene Vorlage ergänzen

In `js/presets.js` einen Eintrag in `PBG.PRESETS` anlegen und in `js/i18n.js` die Schlüssel `preset.<key>` (Name) und `preset.<key>.text` (Ringtext) ergänzen.

## Browser

Aktuelle Versionen von Chrome, Edge, Safari (macOS/iOS), Firefox und Chrome auf Android. Die weichen Ring-Enden nutzen `createConicGradient`; ältere Browser fallen automatisch auf eine segmentierte Darstellung zurück. HEIC öffnet Safari nativ, in den anderen Browsern wandelt `heic2any` die Datei lokal um.
