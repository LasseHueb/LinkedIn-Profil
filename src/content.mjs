/*
 * Inhalte der SEO-Landingpages. Jede Seite bekommt eigenen Title, Description,
 * H1, Erklärtext, Beispielbilder, FAQ (inkl. strukturierter Daten) und den Editor.
 * Texte frei anpassbar – die Seiten werden mit `npm run build` neu erzeugt.
 *
 * Texte, die nur in einer Edition passen, stehen als { full: …, free: … } (siehe src/edition.mjs).
 * free: null = in der kostenlosen Edition weglassen.
 */

export const home = {
  path: "/",
  preset: "jobsuche",
  title: "Profilbild-Rahmen mit eigenem Text erstellen – kostenlos",
  description: "Runder Profilbild-Rahmen mit deinem eigenen Text, deinen Farben und deiner Schrift. Kostenlos, ohne Anmeldung, dein Foto bleibt im Browser.",
  h1: "Profilbild-Rahmen mit eigenem Text",
  lead: "Gestalte in einer Minute einen runden Rahmen für dein Profilbild – mit deinem eigenen Text, deinen Farben und deiner Schrift. Kostenlos und ohne Anmeldung.",
  examples: ["jobsuche", "recruiting", "freelancer", "projekte", "selbststaendig", "mentoring", "ehrenamt", "ausbildung"],
  intro: [
    "Mit {app} schreibst du auf den Rahmen, was du sagen möchtest: <strong>„Bereit für Neues“</strong>, <strong>„Wir suchen dich“</strong>, „Verfügbar ab Mai“ oder deinen Jobtitel. Der Text läuft gebogen am Rand deines Profilbilds entlang, Farben, Schrift und Position wählst du selbst.",
    "Das fertige Bild lädst du als PNG in 1080 × 1080 Pixeln herunter und nutzt es als Profilbild in sozialen Netzwerken, Messengern und Team-Tools."
  ],
  faq: [
    ["Ist der Profilbild-Rahmen wirklich kostenlos?", {
      full: "Ja. Du kannst unbegrenzt Rahmen gestalten und herunterladen. Kostenlose Bilder enthalten unten einen kleinen Hinweis „Erstellt mit {app}“. Mit Premium ({price} einmalig) entfällt der Hinweis und du bekommst Farbverläufe, zusätzliche Schriften, über 20 Premium-Vorlagen und den Export in 2048 px.",
      free: "Ja. Du kannst unbegrenzt Rahmen gestalten und herunterladen – ohne Anmeldung, ohne Abo und ohne versteckte Kosten. Die Bilder enthalten unten einen kleinen Hinweis „Erstellt mit {app}“."
    }],
    ["Wird mein Foto hochgeladen?", "Nein. Dein Foto verlässt nie deinen Browser. Das Bild wird direkt auf deinem Gerät berechnet – es gibt keinen Upload, keine Speicherung und kein Konto."],
    ["Wie nutze ich das Bild als Profilbild?", "Lade das PNG herunter und lade es in deinem Netzwerk oder Messenger als neues Profilbild hoch. Die meisten Plattformen schneiden das Bild automatisch rund zu – der Rahmen sitzt dann genau am Rand."],
    ["Kann ich den Text frei wählen?", "Ja, bis zu 60 Zeichen. Schriftart, Größe, Abstand, Position und Farben sind frei einstellbar. Ist der Text zu lang, wird er automatisch verkleinert und du bekommst einen Hinweis."],
    ["Gehört {app} zu einem sozialen Netzwerk?", "Nein, {app} ist ein unabhängiges Werkzeug."],
    ["Funktioniert das auch auf dem Handy?", "Ja. Der Editor läuft in jedem aktuellen Browser auf iPhone, Android, Mac und PC. Auf dem Handy kannst du das Bild direkt über „Bild teilen“ weitergeben."]
  ]
};

export const landingPages = [
  {
    slug: "jobsuche",
    navLabel: "Jobsuche-Rahmen",
    preset: "jobsuche",
    title: "Jobsuche-Rahmen fürs Profilbild mit eigenem Text",
    description: "Erstelle deinen Jobsuche-Rahmen mit eigenem Text: „Bereit für Neues“, Wunschposition oder Verfügbarkeit. Kostenlos, ohne Upload, fertig in 1 Minute.",
    h1: "Jobsuche-Rahmen mit eigenem Text",
    lead: "Zeig Recruiter:innen auf den ersten Blick, dass du eine neue Stelle suchst – mit deinem eigenen Text, deinen Farben und deiner Schrift.",
    examples: ["jobsuche", "projekte", "ausbildung", "selbststaendig"],
    intro: [
      "Mit einem eigenen Text sagst du genau, was du suchst: <strong>„Bereit für Neues“</strong>, <strong>„Suche Junior-Marketing-Job“</strong> oder <strong>„Verfügbar ab 1. Juni“</strong>. So verstehen Recruiter:innen sofort, wonach du suchst.",
      "Tipp: Kurze Texte mit 10–20 Zeichen sind auch in der kleinen Feed-Ansicht gut lesbar. Die Miniatur-Vorschau im Editor zeigt dir, wie dein Bild im Feed wirkt."
    ],
    faq: [
      ["Was schreibe ich in einen Jobsuche-Rahmen?", "Bewährt haben sich kurze, konkrete Texte: „Bereit für Neues“, deine Wunschrolle („Suche UX-Job“), deine Verfügbarkeit („Ab sofort verfügbar“) oder ein Ort („Jobsuche Hamburg“)."],
      ["Sieht mein aktueller Arbeitgeber den Rahmen?", "Ja – ein Profilbild ist öffentlich. Wenn du diskret suchen möchtest, nutze lieber die Datenschutz-Einstellungen deines Netzwerks statt eines Rahmens."],
      ["Wird mein Foto gespeichert?", "Nein. Dein Foto wird ausschließlich in deinem Browser verarbeitet und nie hochgeladen."]
    ]
  },
  {
    slug: "recruiting",
    navLabel: "Recruiting-Rahmen",
    preset: "recruiting",
    title: "Recruiting-Rahmen fürs Profilbild – „Wir suchen dich“",
    description: {
      full: "Recruiting-Rahmen fürs Profilbild erstellen: „Wir suchen dich“ oder eigener Text in Firmenfarben. Kostenlos für dich, Firmen-Pakete für ganze Teams.",
      free: "Recruiting-Rahmen fürs Profilbild erstellen: „Wir suchen dich“ oder eigener Text in Firmenfarben. Kostenlos, ohne Anmeldung – dein Foto bleibt im Browser."
    },
    h1: "Recruiting-Rahmen fürs Profilbild erstellen",
    lead: "Mach mit deinem Profilbild auf offene Stellen aufmerksam – mit „Wir suchen dich“, dem konkreten Job oder dem Namen deines Teams.",
    examples: ["recruiting", "jobsuche", "speaker", "mentoring"],
    intro: [
      "Jedes Profilbild, das in Kommentaren, Nachrichten und Beiträgen auftaucht, wird so zur kleinen Stellenanzeige. Schreib konkret, <strong>wen</strong> ihr sucht: „Wir suchen Pflegekräfte“, „Komm in unser Dev-Team“ oder „Jetzt bewerben · Berlin“.",
      {
        full: "Ihr wollt, dass das ganze Team mitmacht? Mit den <a href=\"{base}/unternehmen/\">Firmen-Paketen</a> gestaltest du einen Rahmen in euren Firmenfarben und verteilst einen Link – Mitarbeitende laden nur noch ihr Foto hoch.",
        free: "Ihr wollt, dass das ganze Team mitmacht? Legt Text, Schrift und Farben (per Hex-Code) einmal fest – dann gestaltet jede:r in einer Minute das eigene Bild, und alle Rahmen sehen einheitlich aus."
      }
    ],
    faq: [
      ["Wie wirkt ein Recruiting-Rahmen?", "Er macht offene Stellen in jedem Kontakt sichtbar, ohne dass du extra posten musst. Besonders wirksam ist er, wenn mehrere Teammitglieder ihn gleichzeitig nutzen."],
      ["Kann ich unsere Firmenfarben verwenden?", {
        full: "Ja. Ring- und Textfarbe lassen sich per Farbwähler oder Hex-Code genau einstellen. Mit Premium oder einem Firmen-Paket sind auch Farbverläufe möglich.",
        free: "Ja. Ring- und Textfarbe lassen sich per Farbwähler oder Hex-Code genau einstellen."
      }],
      {
        full: ["Kann ich den Rahmen für mein ganzes Team vorgeben?", "Ja, mit einem Firmen-Paket: Du legst Design, Text und optional euer Logo fest und sperrst den Rahmen. Mitarbeitende nutzen dann einen gemeinsamen Link."],
        free: ["Kann das ganze Team denselben Rahmen nutzen?", "Ja. Legt Text, Schrift und Farben (Hex-Codes) fest und gebt sie im Team weiter – alle stellen dieselben Werte ein und laden ihr eigenes Foto."]
      },
      ["Werden Fotos der Mitarbeitenden hochgeladen?", {
        full: "Nein, auch nicht im Firmen-Paket. Fotos bleiben immer im Browser – gespeichert werden nur die Rahmen-Einstellungen.",
        free: "Nein. Fotos bleiben immer im Browser – es gibt keinen Upload und keine Speicherung."
      }]
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
      ["Kann ich den Rahmen auch auf anderen Plattformen nutzen?", "Ja. Das PNG funktioniert überall, wo Profilbilder rund dargestellt werden – in sozialen Netzwerken, Messengern, Team-Tools oder auf Freelancer-Portalen."],
      ["Gibt es Vorlagen speziell für Freelancer?", {
        full: "Ja, kostenlos „Freelancer“ und „Verfügbar für Projekte“. Premium enthält weitere Designs wie „Freelancer kreativ“ und „Freelancer Tech“.",
        free: "Ja, „Freelancer“ und „Verfügbar für Projekte“. Text, Schrift und Farben passt du danach frei an."
      }]
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
      { full: ["Kann ich mein Logo einbinden?", "Logos sind Teil der Firmen-Pakete. Dort kannst du ein Logo hochladen, das im Ring neben dem Text erscheint."], free: null },
      { full: ["Wie bekomme ich den Rahmen ohne Hinweis „Erstellt mit …“?", "Mit Premium für {price} einmalig – ohne Abo und ohne Konto."], free: null }
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
      {
        full: "Perfekt auch für Mentoring-Programme von Hochschulen, Verbänden und Unternehmen – mit einem Firmen-Paket bekommen alle Teilnehmenden denselben Rahmen.",
        free: "Perfekt auch für Mentoring-Programme von Hochschulen, Verbänden und Firmen – legt Text und Farben einmal fest, dann sehen alle Rahmen einheitlich aus."
      }
    ],
    faq: [
      ["Welche Texte passen für Mentoring?", "„#MENTORING“, „Offen für Mentoring“, „Frag mich zu …“ oder der Name eures Programms."],
      ["Können wir den Rahmen für ein ganzes Programm bereitstellen?", {
        full: "Ja, mit einem Firmen-Paket: einmal gestalten, Link teilen, fertig. Ein Zähler zeigt, wie viele Bilder erstellt wurden.",
        free: "Ja: Legt Text, Schrift und Farben (Hex-Codes) fest und gebt sie an alle Teilnehmenden weiter – jede:r gestaltet das eigene Bild in einer Minute."
      }],
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
      {
        full: "Vereine können einen gemeinsamen Rahmen gestalten und den Link an alle Mitglieder schicken – Fotos werden dabei nie hochgeladen.",
        free: "Vereine können Text und Farben gemeinsam festlegen – so sehen alle Profilbilder einheitlich aus. Fotos werden dabei nie hochgeladen."
      }
    ],
    faq: [
      ["Ist das Tool für Vereine kostenlos?", {
        full: "Der Editor ist kostenlos. Für einen gemeinsamen, gesperrten Vereins-Rahmen mit Link gibt es die Firmen-Pakete – sprich uns für gemeinnützige Organisationen gerne an.",
        free: "Ja, der Editor ist komplett kostenlos – für Vereine genauso wie für Einzelpersonen."
      }],
      { full: ["Darf ich das Vereinslogo verwenden?", "Ja, sofern ihr die Rechte daran habt. Logos können in den Firmen-Paketen hochgeladen werden."], free: null },
      ["Welche Bildgröße hat der Export?", {
        full: "1080 × 1080 Pixel (mit Premium 2048 × 2048) – ideal für alle gängigen Netzwerke.",
        free: "1080 × 1080 Pixel – ideal für alle gängigen Netzwerke."
      }]
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
