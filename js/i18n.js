/*
 * Übersetzungen. Neue Sprache ergänzen: weiteren Schlüssel (z. B. "fr") mit
 * denselben Einträgen anlegen und in index.html eine Option im Sprachwähler ergänzen.
 * Platzhalter in {geschweiften Klammern} werden zur Laufzeit ersetzt.
 */
window.PBG = window.PBG || {};

PBG.I18N = {
  de: {
    "app.title": "Profilbild-Banner-Generator",
    "app.tagline": "Gib deinem Profilbild einen runden Schriftzug-Ring – mit eigenem Text und eigenen Farben.",
    "privacy.badge": "100 % lokal",
    "privacy.text": "Dein Foto verlässt nie dein Gerät: Alles wird direkt in deinem Browser berechnet. Nichts wird hochgeladen, gespeichert oder getrackt.",
    "theme.label": "Farbschema",
    "theme.auto": "System",
    "theme.light": "Hell",
    "theme.dark": "Dunkel",
    "lang.label": "Sprache",
    "a11y.skip": "Zu den Einstellungen springen",
    "a11y.controls": "Einstellungen",

    "preview.heading": "Vorschau",
    "preview.canvasLabel": "Vorschau des Profilbilds mit Ring. Text: {text}. Mit Pfeiltasten verschieben, mit Plus und Minus zoomen.",
    "preview.hint": "Ziehen zum Verschieben · Mausrad, Pinch oder +/− zum Zoomen · Pfeiltasten verschieben",
    "preview.mini": "So wirkt es im Feed",
    "preview.miniName": "Dein Name",
    "preview.miniMeta": "Deine Position · gerade eben",

    "upload.heading": "1. Foto",
    "upload.drop": "Foto hierher ziehen oder",
    "upload.choose": "Datei auswählen",
    "upload.formats": "JPG, PNG, WebP oder HEIC",
    "upload.loading": "Foto wird geladen …",
    "upload.heicLoading": "HEIC-Foto wird umgewandelt …",
    "upload.error": "Dieses Bild konnte nicht geöffnet werden. Bitte versuche JPG, PNG oder WebP.",
    "upload.errorType": "Bitte wähle eine Bilddatei aus.",
    "upload.loaded": "Foto geladen: {name}",
    "upload.remove": "Foto entfernen",
    "crop.zoom": "Zoom",
    "crop.reset": "Ausschnitt zurücksetzen",

    "presets.heading": "2. Vorlage",
    "presets.hint": "Startpunkt wählen – danach alles frei anpassbar.",

    "text.heading": "3. Text",
    "text.label": "Text auf dem Ring",
    "text.placeholder": "#OFFENFÜRJOBS",
    "text.font": "Schriftart",
    "text.size": "Schriftgröße",
    "text.bold": "Fett",
    "text.uppercase": "Großbuchstaben",
    "text.spacing": "Buchstabenabstand",
    "text.position": "Position auf dem Bogen",
    "text.color": "Textfarbe",
    "text.shrunk": "Der Text ist lang und wurde automatisch auf {percent} % verkleinert.",
    "text.tooLong": "Der Text ist zu lang für den Ring und wird abgeschnitten wirken. Kürze ihn oder verlängere den Ring.",
    "text.lowContrast": "Geringer Kontrast zwischen Text und Ring ({ratio}:1) – der Text könnte schwer lesbar sein.",

    "ring.heading": "4. Ring",
    "ring.color": "Ringfarbe",
    "ring.gradient": "Farbverlauf",
    "ring.color2": "Zweite Farbe",
    "ring.width": "Ringbreite",
    "ring.length": "Ringlänge",
    "ring.rotation": "Drehung des Rings",
    "ring.fade": "Weicher Übergang an den Enden",
    "ring.opacity": "Deckkraft",

    "export.heading": "5. Export",
    "export.bg": "Hintergrund außerhalb des Kreises",
    "export.transparent": "Transparent",
    "export.white": "Weiß",
    "export.download": "PNG herunterladen · 1080 px",
    "export.share": "Teilen",
    "export.info": "Tipp: Die meisten Netzwerke schneiden Profilbilder automatisch rund zu.",
    "export.done": "Bild wurde erstellt.",
    "export.shareError": "Teilen ist fehlgeschlagen. Nutze stattdessen „Herunterladen“.",
    "export.filename": "profilbild-ring.png",

    "hex.label": "Hex-Code",
    "hex.invalid": "Ungültiger Hex-Code",
    "unit.deg": "°",
    "unit.pct": "%",

    "footer.text": "Ohne Login, ohne Datenbank, ohne Tracking. Schriftarten werden lokal ausgeliefert.",

    "preset.jobs": "Jobsuche",
    "preset.jobs.text": "#OFFENFÜRJOBS",
    "preset.hiring": "Recruiting",
    "preset.hiring.text": "#WIRSTELLENEIN",
    "preset.freelancer": "Freelancer",
    "preset.freelancer.text": "Freelancer",
    "preset.projects": "Verfügbar für Projekte",
    "preset.projects.text": "Verfügbar für Projekte",
    "preset.mentoring": "Mentoring",
    "preset.mentoring.text": "#MENTORING",
    "preset.speaker": "Speaker",
    "preset.speaker.text": "#SPEAKER",
    "preset.apprentice": "Ausbildung",
    "preset.apprentice.text": "#SUCHEAUSBILDUNG",
    "preset.volunteer": "Ehrenamt",
    "preset.volunteer.text": "#EHRENAMT"
  },

  en: {
    "app.title": "Profile Picture Banner Generator",
    "app.tagline": "Add a circular text ring to your profile picture – with your own text and colours.",
    "privacy.badge": "100 % local",
    "privacy.text": "Your photo never leaves your device: everything is processed in your browser. Nothing is uploaded, stored or tracked.",
    "theme.label": "Colour scheme",
    "theme.auto": "System",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "lang.label": "Language",
    "a11y.skip": "Skip to settings",
    "a11y.controls": "Settings",

    "preview.heading": "Preview",
    "preview.canvasLabel": "Preview of the profile picture with ring. Text: {text}. Use arrow keys to move, plus and minus to zoom.",
    "preview.hint": "Drag to move · scroll wheel, pinch or +/− to zoom · arrow keys move",
    "preview.mini": "How it looks in the feed",
    "preview.miniName": "Your Name",
    "preview.miniMeta": "Your position · just now",

    "upload.heading": "1. Photo",
    "upload.drop": "Drop a photo here or",
    "upload.choose": "choose a file",
    "upload.formats": "JPG, PNG, WebP or HEIC",
    "upload.loading": "Loading photo …",
    "upload.heicLoading": "Converting HEIC photo …",
    "upload.error": "This image could not be opened. Please try JPG, PNG or WebP.",
    "upload.errorType": "Please choose an image file.",
    "upload.loaded": "Photo loaded: {name}",
    "upload.remove": "Remove photo",
    "crop.zoom": "Zoom",
    "crop.reset": "Reset crop",

    "presets.heading": "2. Template",
    "presets.hint": "Pick a starting point – everything can be customised afterwards.",

    "text.heading": "3. Text",
    "text.label": "Text on the ring",
    "text.placeholder": "#OPENFORWORK",
    "text.font": "Font",
    "text.size": "Font size",
    "text.bold": "Bold",
    "text.uppercase": "Uppercase",
    "text.spacing": "Letter spacing",
    "text.position": "Position on the arc",
    "text.color": "Text colour",
    "text.shrunk": "The text is long and was automatically reduced to {percent} %.",
    "text.tooLong": "The text is too long for the ring. Shorten it or make the ring longer.",
    "text.lowContrast": "Low contrast between text and ring ({ratio}:1) – the text may be hard to read.",

    "ring.heading": "4. Ring",
    "ring.color": "Ring colour",
    "ring.gradient": "Gradient",
    "ring.color2": "Second colour",
    "ring.width": "Ring width",
    "ring.length": "Ring length",
    "ring.rotation": "Ring rotation",
    "ring.fade": "Soft fade at the ends",
    "ring.opacity": "Opacity",

    "export.heading": "5. Export",
    "export.bg": "Background outside the circle",
    "export.transparent": "Transparent",
    "export.white": "White",
    "export.download": "Download PNG · 1080 px",
    "export.share": "Share",
    "export.info": "Tip: most networks crop profile pictures to a circle automatically.",
    "export.done": "Image created.",
    "export.shareError": "Sharing failed. Please use “Download” instead.",
    "export.filename": "profile-ring.png",

    "hex.label": "Hex code",
    "hex.invalid": "Invalid hex code",
    "unit.deg": "°",
    "unit.pct": "%",

    "footer.text": "No login, no database, no tracking. Fonts are served locally.",

    "preset.jobs": "Job search",
    "preset.jobs.text": "#OPENFORWORK",
    "preset.hiring": "Recruiting",
    "preset.hiring.text": "#WEAREHIRING",
    "preset.freelancer": "Freelancer",
    "preset.freelancer.text": "Freelancer",
    "preset.projects": "Available for projects",
    "preset.projects.text": "Available for projects",
    "preset.mentoring": "Mentoring",
    "preset.mentoring.text": "#MENTORING",
    "preset.speaker": "Speaker",
    "preset.speaker.text": "#SPEAKER",
    "preset.apprentice": "Apprenticeship",
    "preset.apprentice.text": "#APPRENTICESHIP",
    "preset.volunteer": "Volunteering",
    "preset.volunteer.text": "#VOLUNTEERING"
  }
};

PBG.lang = "de";

/** Übersetzt einen Schlüssel; fällt auf Deutsch und dann auf den Schlüssel zurück. */
PBG.t = function (key, vars) {
  var dict = PBG.I18N[PBG.lang] || PBG.I18N.de;
  var str = dict[key] != null ? dict[key] : (PBG.I18N.de[key] != null ? PBG.I18N.de[key] : key);
  if (vars) {
    str = str.replace(/\{(\w+)\}/g, function (m, name) {
      return vars[name] != null ? vars[name] : m;
    });
  }
  return str;
};

/** Setzt alle Texte im DOM anhand der data-i18n*-Attribute. */
PBG.applyI18n = function (root) {
  root = root || document;
  document.documentElement.lang = PBG.lang;
  root.querySelectorAll("[data-i18n]").forEach(function (el) {
    el.textContent = PBG.t(el.getAttribute("data-i18n"));
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
    el.setAttribute("placeholder", PBG.t(el.getAttribute("data-i18n-placeholder")));
  });
  root.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
    el.setAttribute("aria-label", PBG.t(el.getAttribute("data-i18n-aria")));
  });
  root.querySelectorAll("[data-i18n-title]").forEach(function (el) {
    el.setAttribute("title", PBG.t(el.getAttribute("data-i18n-title")));
  });
  document.title = PBG.t("app.title");
};
