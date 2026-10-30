/*
 * Inhalte der Startseite: Title, Description, H1, Einleitung, Text-Ideen und FAQ (inkl. strukturierter Daten).
 * Texte frei anpassbar – die Seite wird mit `npm run build` neu erzeugt. {app} wird durch den App-Namen ersetzt.
 */

export const home = {
  path: "/",
  preset: "jobsuche",
  title: "Profilbild-Rahmen mit eigenem Text und Logo – kostenlos",
  description: "Runder Profilbild-Rahmen mit deinem eigenen Text, Logo, Farben und Schrift. Komplett kostenlos, ohne Anmeldung – dein Foto bleibt im Browser.",
  h1: "Profilbild-Rahmen mit eigenem Text",
  lead: "Gestalte in einer Minute einen runden Rahmen für dein Profilbild – mit deinem eigenen Text, deinem Logo, deinen Farben und deiner Schrift. Komplett kostenlos und ohne Anmeldung.",

  /** Text-Ideen: preset = Vorlage, die der Button „Vorlage übernehmen“ in den Editor lädt. */
  ideas: [
    {
      title: "Jobsuche",
      preset: "jobsuche",
      text: "Sag Recruiter:innen auf den ersten Blick, was du suchst. Kurze Texte mit 10–20 Zeichen bleiben auch klein gut lesbar.",
      examples: ["Bereit für Neues", "Suche Junior-Marketing-Job", "Verfügbar ab 1. Juni"]
    },
    {
      title: "Recruiting",
      preset: "recruiting",
      text: "Jedes Profilbild in Kommentaren und Nachrichten wird zur kleinen Stellenanzeige. Schreib konkret, wen ihr sucht.",
      examples: ["Wir suchen dich", "Wir suchen Pflegekräfte", "Jetzt bewerben · Berlin"]
    },
    {
      title: "Selbstständige",
      preset: "freelancer",
      text: "Zeig, was du anbietest und ob du Kapazität hast. Ändert sich deine Auslastung, passt du den Text in Sekunden an.",
      examples: ["Verfügbar für Projekte", "Freelance Designerin", "Steuerberatung für Kreative"]
    },
    {
      title: "Firmen und Teams",
      preset: "team-gesucht",
      text: "Mit eurem Logo und euren Farben sehen alle Profilbilder einheitlich aus. Speichert das Design als eigene Vorlage und gebt die Datei im Team weiter.",
      examples: ["Komm in unser Team", "Logo statt Text", "Wir sind dabei: Messe 2027"]
    }
  ],

  faq: [
    ["Ist {app} wirklich kostenlos?", "Ja, komplett. Alle Vorlagen, Schriften, Farbverläufe, Symbole, das eigene Logo und der Export bis 2048 × 2048 Pixel stehen allen zur Verfügung – ohne Anmeldung, ohne Abo und ohne versteckte Kosten."],
    ["Werden mein Foto oder mein Logo hochgeladen?", "Nein. Foto und Logo verlassen nie deinen Browser. Das Bild wird direkt auf deinem Gerät berechnet – es gibt keinen Upload, keine Speicherung auf einem Server und kein Konto."],
    ["Wie nutze ich das Bild als Profilbild?", "Lade das PNG herunter und lade es in deinem Netzwerk oder Messenger als neues Profilbild hoch. Die meisten Plattformen schneiden das Bild automatisch rund zu – der Rahmen sitzt dann genau am Rand."],
    ["Was schreibe ich auf den Rahmen?", "Bewährt haben sich kurze, konkrete Texte: deine Wunschrolle („Suche UX-Job“), deine Verfügbarkeit („Ab sofort verfügbar“), wen ihr sucht („Wir suchen Pflegekräfte“) oder dein Angebot. Bis zu 60 Zeichen sind möglich; ist der Text zu lang, wird er automatisch verkleinert."],
    ["Kann ich unser Firmenlogo einbinden?", "Ja. Lade dein Logo als PNG, JPG, WebP oder SVG hoch und setze es links oder rechts vom Text oder statt des Texts auf den Ring. Am besten wirkt ein Logo mit transparentem Hintergrund."],
    ["Kann das ganze Team denselben Rahmen nutzen?", "Ja. Speichere das Design als eigene Vorlage und exportiere sie als Datei. Kolleg:innen importieren die Datei, laden ihr eigenes Foto und erhalten denselben Rahmen – inklusive Logo."],
    ["Funktioniert das auch auf dem Handy?", "Ja. Der Editor läuft in jedem aktuellen Browser auf iPhone, Android, Mac und PC. Auf dem Handy kannst du das Bild direkt über „Bild teilen“ weitergeben."],
    ["Gehört {app} zu einem sozialen Netzwerk?", "Nein, {app} ist ein unabhängiges Werkzeug."]
  ]
};
