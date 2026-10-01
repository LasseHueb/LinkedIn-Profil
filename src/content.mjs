/*
 * Inhalte der SEO-Landingpages. Jede Seite bekommt eigenen Title, Description,
 * H1, Erklärtext, Beispielbilder, FAQ (inkl. strukturierter Daten) und den Editor.
 * Texte frei anpassbar – die Seiten werden mit `npm run build` neu erzeugt.
 */

export const home = {
  path: "/",
  preset: "jobsuche",
  title: "LinkedIn-Rahmen erstellen – kostenlos & mit eigenem Text",
  description: "Profilbild-Rahmen wie „Open to Work“ oder „Hiring“ – aber mit eigenem Text und eigenen Farben. Kostenlos, ohne Anmeldung, dein Foto bleibt im Browser.",
  h1: "LinkedIn-Rahmen erstellen – mit eigenem Text",
  lead: "Gestalte in einer Minute einen runden Profilbild-Rahmen wie „Open to Work“ oder „Hiring“ – mit deinem eigenen Text, deinen Farben und deiner Schrift. Kostenlos und ohne Anmeldung.",
  examples: ["jobsuche", "recruiting", "freelancer", "projekte", "selbststaendig", "mentoring", "ehrenamt", "ausbildung"],
  intro: [
    "Die bekannten Rahmen der Karriere-Netzwerke kennen nur wenige feste Texte. Mit {app} schreibst du, was du willst: <strong>#OFFENFÜRJOBS</strong>, <strong>#WIRSTELLENEIN</strong>, „Verfügbar ab Mai“ oder deinen Jobtitel. Der Text läuft gebogen am unteren Rand deines Profilbilds entlang – genau wie beim Original.",
    "Das fertige Bild lädst du als PNG in 1080 × 1080 Pixeln herunter und nutzt es als Profilbild auf LinkedIn, Xing, Instagram, WhatsApp, Slack oder Teams."
  ],
  faq: [
    ["Ist der Profilbild-Rahmen wirklich kostenlos?", "Ja. Du kannst unbegrenzt Rahmen gestalten und herunterladen. Kostenlose Bilder enthalten unten einen kleinen Hinweis „Erstellt mit {app}“. Mit Premium ({price} einmalig) entfällt der Hinweis und du bekommst Farbverläufe, zusätzliche Schriften, über 20 Premium-Vorlagen und den Export in 2048 px."],
    ["Wird mein Foto hochgeladen?", "Nein. Dein Foto verlässt nie deinen Browser. Das Bild wird direkt auf deinem Gerät berechnet – es gibt keinen Upload, keine Speicherung und kein Konto."],
    ["Wie lade ich den Rahmen auf LinkedIn hoch?", "Lade das PNG herunter, öffne dein LinkedIn-Profil, tippe auf dein Profilbild und wähle „Foto ändern“ bzw. „Hochladen“. LinkedIn schneidet das Bild automatisch rund zu – der Rahmen sitzt dann genau am Rand."],
    ["Kann ich den Text frei wählen?", "Ja, bis zu 60 Zeichen. Schriftart, Größe, Abstand, Position und Farben sind frei einstellbar. Ist der Text zu lang, wird er automatisch verkleinert und du bekommst einen Hinweis."],
    ["Ist das der offizielle „Open to Work“-Rahmen?", "Nein. {app} ist ein unabhängiges Werkzeug und steht in keiner Verbindung zu LinkedIn, Xing oder anderen Netzwerken. Den offiziellen Rahmen aktivierst du direkt in deinem Netzwerk – unser Rahmen ist eine frei gestaltbare Alternative."],
    ["Funktioniert das auch auf dem Handy?", "Ja. Der Editor läuft in jedem aktuellen Browser auf iPhone, Android, Mac und PC. Auf dem Handy kannst du das Bild direkt über „Bild teilen“ weitergeben."]
  ]
};

export const landingPages = [
  {
    slug: "jobsuche",
    navLabel: "Open-to-Work-Rahmen",
    preset: "jobsuche",
    title: "Open-to-Work-Rahmen mit eigenem Text erstellen",
    description: "Erstelle deinen Open-to-Work-Rahmen mit eigenem Text: #OFFENFÜRJOBS, Wunschposition oder Verfügbarkeit. Kostenlos, ohne Upload, fertig in 1 Minute.",
    h1: "Open-to-Work-Rahmen mit eigenem Text",
    lead: "Zeig Recruiter:innen auf den ersten Blick, dass du offen für neue Jobs bist – mit deinem eigenen Text statt dem Standard-Schriftzug.",
    examples: ["jobsuche", "projekte", "ausbildung", "selbststaendig"],
    intro: [
      "Der klassische Jobsuche-Rahmen sagt nur „offen für Jobs“. Mit einem eigenen Text wirst du konkreter: <strong>„Suche Junior-Marketing-Job“</strong>, <strong>„Verfügbar ab 1. Juni“</strong> oder <strong>„#OFFENFÜRJOBS · Remote“</strong>. So verstehen Recruiter:innen sofort, wonach du suchst.",
      "Tipp: Kurze Texte mit 10–20 Zeichen sind auch in der kleinen Feed-Ansicht gut lesbar. Die Miniatur-Vorschau im Editor zeigt dir, wie dein Bild im Feed wirkt."
    ],
    faq: [
      ["Was schreibe ich in einen Open-to-Work-Rahmen?", "Bewährt haben sich kurze, konkrete Texte: #OFFENFÜRJOBS, deine Wunschrolle („Suche UX-Job“), deine Verfügbarkeit („Ab sofort verfügbar“) oder ein Ort („Jobsuche Hamburg“)."],
      ["Ist ein eigener Rahmen besser als der offizielle?", "Der offizielle Rahmen ist sofort erkennbar, aber im Text festgelegt. Ein eigener Rahmen fällt auf und transportiert mehr Information. Viele nutzen den offiziellen Status zusätzlich in den Profileinstellungen."],
      ["Sieht mein aktueller Arbeitgeber den Rahmen?", "Ja – ein Profilbild ist öffentlich. Wenn du diskret suchen möchtest, nutze lieber die Einstellung „nur für Recruiter sichtbar“ deines Netzwerks statt eines Rahmens."],
      ["Wird mein Foto gespeichert?", "Nein. Dein Foto wird ausschließlich in deinem Browser verarbeitet und nie hochgeladen."]
    ]
  },
  {
    slug: "recruiting",
    navLabel: "Hiring-Rahmen",
    preset: "recruiting",
    title: "Hiring-Rahmen fürs Profilbild – „Wir stellen ein“",
    description: "Hiring-Rahmen fürs Profilbild erstellen: #WIRSTELLENEIN oder eigener Text in Firmenfarben. Kostenlos für dich, Firmen-Pakete für ganze Teams.",
    h1: "Hiring-Rahmen fürs Profilbild erstellen",
    lead: "Mach mit deinem Profilbild auf offene Stellen aufmerksam – mit „Wir stellen ein“, dem konkreten Job oder dem Namen deines Teams.",
    examples: ["recruiting", "jobsuche", "speaker", "mentoring"],
    intro: [
      "Jedes Profilbild, das in Kommentaren, Nachrichten und Beiträgen auftaucht, wird so zur kleinen Stellenanzeige. Statt nur „Hiring“ kannst du schreiben, <strong>wen</strong> ihr sucht: „Wir suchen Pflegekräfte“, „Join our Dev-Team“ oder „#WIRSTELLENEIN · Berlin“.",
      "Ihr wollt, dass das ganze Team mitmacht? Mit den <a href=\"{base}/unternehmen/\">Firmen-Paketen</a> gestaltest du einen Rahmen in euren Firmenfarben und verteilst einen Link – Mitarbeitende laden nur noch ihr Foto hoch."
    ],
    faq: [
      ["Wie wirkt ein Hiring-Rahmen?", "Er macht offene Stellen in jedem Kontakt sichtbar, ohne dass du extra posten musst. Besonders wirksam ist er, wenn mehrere Teammitglieder ihn gleichzeitig nutzen."],
      ["Kann ich unsere Firmenfarben verwenden?", "Ja. Ring- und Textfarbe lassen sich per Farbwähler oder Hex-Code genau einstellen. Mit Premium oder einem Firmen-Paket sind auch Farbverläufe möglich."],
      ["Kann ich den Rahmen für mein ganzes Team vorgeben?", "Ja, mit einem Firmen-Paket: Du legst Design, Text und optional euer Logo fest und sperrst den Rahmen. Mitarbeitende nutzen dann einen gemeinsamen Link."],
      ["Werden Fotos der Mitarbeitenden hochgeladen?", "Nein, auch nicht im Firmen-Paket. Fotos bleiben immer im Browser – gespeichert werden nur die Rahmen-Einstellungen."]
    ]
  },
  {
    slug: "freelancer",
    navLabel: "Freelancer-Rahmen",
    preset: "freelancer",
    title: "Freelancer-Rahmen fürs Profilbild – verfügbar für Projekte",
    description: "Profilbild-Rahmen für Freelancer: „Verfügbar für Projekte“, deine Spezialisierung oder dein Angebot. Kostenlos erstellen, ohne Foto-Upload.",
    h1: "Profilbild-Rahmen für Freelancer",
    lead: "Zeig potenziellen Kund:innen, dass du Kapazität hast – und wofür. Ein Rahmen mit deinem Angebot macht jedes Profilbild zum Aushängeschild.",
    examples: ["freelancer", "projekte", "selbststaendig", "speaker"],
    intro: [
      "Als Freelancer:in zählt Sichtbarkeit. Ein Rahmen mit <strong>„Verfügbar für Projekte“</strong>, <strong>„Freelance Designerin“</strong> oder <strong>„Webentwicklung · ab Juli frei“</strong> beantwortet die wichtigste Frage, bevor sie gestellt wird.",
      "Ändert sich deine Auslastung, passt du den Text in Sekunden an und lädst das neue Bild hoch."
    ],
    faq: [
      ["Welcher Text eignet sich für Freelancer?", "Kombiniere Rolle und Status, z. B. „Freelance Texterin · verfügbar“ oder „SAP-Berater · Projekte ab Q3“. Kurz bleibt besser lesbar."],
      ["Kann ich den Rahmen auch auf anderen Plattformen nutzen?", "Ja. Das PNG funktioniert überall, wo Profilbilder rund dargestellt werden – z. B. Xing, Instagram, WhatsApp, Slack oder Freelancer-Portale."],
      ["Gibt es Vorlagen speziell für Freelancer?", "Ja, kostenlos „Freelancer“ und „Verfügbar für Projekte“. Premium enthält weitere Designs wie „Freelancer kreativ“ und „Freelancer Tech“."]
    ]
  },
  {
    slug: "selbststaendig",
    navLabel: "Rahmen für Selbstständige",
    preset: "selbststaendig",
    title: "Profilbild-Rahmen für Selbstständige & Gründer:innen",
    description: "Rahmen fürs Profilbild für Selbstständige, Gründer:innen und Unternehmer:innen – mit eigenem Text, Farben und Schrift. Kostenlos & datenschutzfreundlich.",
    h1: "Profilbild-Rahmen für Selbstständige",
    lead: "Ob frisch gegründet oder seit Jahren selbstständig: Mit einem eigenen Rahmen zeigst du, wofür du stehst.",
    examples: ["selbststaendig", "freelancer", "speaker", "mentoring"],
    intro: [
      "Ein Rahmen mit <strong>#SELBSTSTÄNDIG</strong>, deinem Firmennamen oder deinem Angebot („Steuerberatung für Kreative“) sorgt dafür, dass dein Netzwerk weiß, was du machst – in jedem Kommentar und jeder Nachricht.",
      "Für ein einheitliches Auftreten wählst du einfach deine Markenfarben per Hex-Code."
    ],
    faq: [
      ["Darf ich meinen Firmennamen in den Rahmen schreiben?", "Ja, der Text ist frei wählbar. Achte nur darauf, keine fremden Marken- oder Plattformnamen zu verwenden."],
      ["Kann ich mein Logo einbinden?", "Logos sind Teil der Firmen-Pakete. Dort kannst du ein Logo hochladen, das im Ring neben dem Text erscheint."],
      ["Wie bekomme ich den Rahmen ohne Hinweis „Erstellt mit …“?", "Mit Premium für {price} einmalig – ohne Abo und ohne Konto."]
    ]
  },
  {
    slug: "mentoring",
    navLabel: "Mentoring-Rahmen",
    preset: "mentoring",
    title: "Mentoring-Rahmen fürs Profilbild erstellen",
    description: "Zeig mit einem Profilbild-Rahmen, dass du als Mentor:in ansprechbar bist – #MENTORING oder eigener Text. Kostenlos, ohne Anmeldung.",
    h1: "Mentoring-Rahmen fürs Profilbild",
    lead: "Du möchtest Wissen weitergeben? Ein Rahmen signalisiert Einsteiger:innen, dass sie dich ansprechen dürfen.",
    examples: ["mentoring", "speaker", "ehrenamt", "recruiting"],
    intro: [
      "Viele trauen sich nicht, erfahrene Menschen um Rat zu fragen. Ein Rahmen wie <strong>#MENTORING</strong>, <strong>„Frag mich zu UX“</strong> oder <strong>„Mentorin für Gründerinnen“</strong> senkt die Hemmschwelle.",
      "Perfekt auch für Mentoring-Programme von Hochschulen, Verbänden und Unternehmen – mit einem Firmen-Paket bekommen alle Teilnehmenden denselben Rahmen."
    ],
    faq: [
      ["Welche Texte passen für Mentoring?", "„#MENTORING“, „Offen für Mentoring“, „Frag mich zu …“ oder der Name eures Programms."],
      ["Können wir den Rahmen für ein ganzes Programm bereitstellen?", "Ja, mit einem Firmen-Paket: einmal gestalten, Link teilen, fertig. Ein Zähler zeigt, wie viele Bilder erstellt wurden."],
      ["Ist das Tool barrierefrei?", "Alle Regler haben Beschriftungen, der Editor ist per Tastatur bedienbar und unterstützt Hell- und Dunkelmodus."]
    ]
  },
  {
    slug: "ehrenamt",
    navLabel: "Ehrenamt-Rahmen",
    preset: "ehrenamt",
    title: "Ehrenamt-Rahmen fürs Profilbild – zeig dein Engagement",
    description: "Profilbild-Rahmen fürs Ehrenamt: #EHRENAMT, deinen Verein oder deine Aktion. Kostenlos für Vereine & Engagierte – Fotos bleiben im Browser.",
    h1: "Ehrenamt-Rahmen fürs Profilbild",
    lead: "Engagement verdient Sichtbarkeit. Zeig mit einem Rahmen, wofür du dich einsetzt – und motiviere andere, mitzumachen.",
    examples: ["ehrenamt", "mentoring", "ausbildung", "speaker"],
    intro: [
      "Ob Feuerwehr, Tafel, Sportverein oder Nachhilfe: Mit <strong>#EHRENAMT</strong>, dem Namen deines Vereins oder einer Aktion („Blutspende am 12.5.“) wird dein Profilbild zur Einladung.",
      "Vereine können einen gemeinsamen Rahmen gestalten und den Link an alle Mitglieder schicken – Fotos werden dabei nie hochgeladen."
    ],
    faq: [
      ["Ist das Tool für Vereine kostenlos?", "Der Editor ist kostenlos. Für einen gemeinsamen, gesperrten Vereins-Rahmen mit Link gibt es die Firmen-Pakete – sprich uns für gemeinnützige Organisationen gerne an."],
      ["Darf ich das Vereinslogo verwenden?", "Ja, sofern ihr die Rechte daran habt. Logos können in den Firmen-Paketen hochgeladen werden."],
      ["Welche Bildgröße hat der Export?", "1080 × 1080 Pixel (mit Premium 2048 × 2048) – ideal für alle gängigen Netzwerke."]
    ]
  }
];

/** Zusätzliche, statische Seiten (Navigation, Sitemap). */
export const staticPages = {
  premium: { path: "/premium/", title: "Premium – Profilbild-Rahmen ohne Hinweis", description: "Premium für {price} einmalig: kein Hinweis im Bild, Farbverläufe, 5 extra Schriften, 20+ Vorlagen, Symbole & Emojis, Export in 2048 px. Kein Abo." },
  business: { path: "/unternehmen/", title: "Profilbild-Rahmen für Unternehmen & Teams", description: "Firmen-Rahmen fürs ganze Team: in Firmenfarben gestalten, Text & Logo festlegen, Link teilen. Ab {starter}/Jahr. Fotos bleiben im Browser." },
  impressum: { path: "/impressum/", title: "Impressum", description: "Impressum und Anbieterkennzeichnung." },
  datenschutz: { path: "/datenschutz/", title: "Datenschutzerklärung", description: "Datenschutzerklärung: Fotos verlassen nie deinen Browser, keine Cookies, cookielose Statistik." },
  agb: { path: "/agb/", title: "AGB", description: "Allgemeine Geschäftsbedingungen für Premium und Firmen-Pakete." },
  widerruf: { path: "/widerruf/", title: "Widerrufsbelehrung", description: "Widerrufsbelehrung für digitale Inhalte (Premium)." }
};
