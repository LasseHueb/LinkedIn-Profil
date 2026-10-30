/*
 * Übersetzungen des Editors. Die Sprache folgt dem lang-Attribut der Seite
 * (<html lang="de">). Für eine englische Version Seiten mit lang="en" erzeugen
 * (siehe scripts/build.mjs) – das Wörterbuch "en" ist bereits vollständig.
 * Platzhalter in {geschweiften Klammern} werden zur Laufzeit ersetzt.
 */
window.PBG = window.PBG || {};

PBG.I18N = {
  de: {
    "app.title": "Profilbild-Rahmen erstellen",
    "theme.label": "Farbschema",
    "theme.auto": "System",
    "theme.light": "Hell",
    "theme.dark": "Dunkel",
    "a11y.controls": "Einstellungen",

    "preview.canvasLabel": "Vorschau des Profilbilds mit Ring. Text: {text}. Mit Pfeiltasten verschieben, mit Plus und Minus zoomen.",
    "preview.hint": "Ziehen zum Verschieben · Mausrad, Pinch oder +/− zum Zoomen · Pfeiltasten verschieben",
    "preview.mini": "So wirkt es im Feed",
    "preview.miniName": "Dein Name",
    "preview.miniMeta": "Deine Position · gerade eben",

    "upload.heading": "1. Foto",
    "upload.drop": "Foto hierher ziehen oder",
    "upload.choose": "Datei auswählen",
    "upload.formats": "JPG, PNG, WebP oder HEIC – bleibt auf deinem Gerät",
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
    "presets.more": "Alle {count} Vorlagen anzeigen",
    "presets.less": "Weniger anzeigen",

    "text.heading": "3. Text",
    "text.label": "Text auf dem Ring",
    "text.placeholder": "Dein Text, z. B. Suche Job im Marketing",
    "text.font": "Schriftart",
    "text.size": "Schriftgröße",
    "text.bold": "Fett",
    "text.uppercase": "Großbuchstaben",
    "text.spacing": "Buchstabenabstand",
    "text.position": "Position auf dem Bogen",
    "text.color": "Textfarbe",
    "text.shrunk": "Der Text ist lang und wurde automatisch auf {percent} % verkleinert.",
    "text.tooLong": "Der Text ist zu lang für den Ring. Kürze ihn oder verlängere den Ring.",
    "text.lowContrast": "Geringer Kontrast zwischen Text und Ring ({ratio}:1) – der Text könnte schwer lesbar sein.",

    "icon.label": "Symbol im Ring",
    "icon.none": "Kein Symbol",
    "icon.pos": "Position des Symbols",
    "icon.start": "Vor dem Text",
    "icon.end": "Nach dem Text",
    "icon.both": "Beidseitig",
    "emoji.label": "Emoji einfügen",

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
    "export.size": "Auflösung",
    "export.download": "PNG herunterladen · {size} px",
    "export.share": "Bild teilen",
    "export.info": "Tipp: Die meisten Netzwerke schneiden Profilbilder automatisch rund zu.",
    "export.watermarkNote": "Die Bilder enthalten unten einen kleinen Hinweis „{watermark}“.",
    "export.done": "Bild wurde erstellt.",
    "export.shareError": "Teilen ist fehlgeschlagen. Nutze stattdessen „Herunterladen“.",
    "export.filename": "profilbild-rahmen.png",

    "watermark": "Erstellt mit {app}",


    "share.title": "Gefällt dir dein Rahmen?",
    "share.lead": "Teile die App mit deinem Netzwerk – das hilft uns sehr, kostenlos zu bleiben.",
    "share.text": "Ich habe meinen Profilbild-Rahmen mit {app} gestaltet – kostenlos und ohne Foto-Upload:",
    "share.copy": "Link kopieren",
    "share.copied": "Link kopiert!",
    "share.more": "Teilen …",
    "share.close": "Schließen",
    "share.dontShow": "Nicht mehr anzeigen",

    "hex.label": "Hex-Code",
    "hex.invalid": "Ungültiger Hex-Code",
    "unit.deg": "°",
    "unit.pct": "%"
  },

  en: {
    "app.title": "Create a profile picture frame",
    "theme.label": "Colour scheme",
    "theme.auto": "System",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "a11y.controls": "Settings",

    "preview.canvasLabel": "Preview of the profile picture with ring. Text: {text}. Use arrow keys to move, plus and minus to zoom.",
    "preview.hint": "Drag to move · scroll wheel, pinch or +/− to zoom · arrow keys move",
    "preview.mini": "How it looks in the feed",
    "preview.miniName": "Your Name",
    "preview.miniMeta": "Your position · just now",

    "upload.heading": "1. Photo",
    "upload.drop": "Drop a photo here or",
    "upload.choose": "choose a file",
    "upload.formats": "JPG, PNG, WebP or HEIC – stays on your device",
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
    "presets.more": "Show all {count} templates",
    "presets.less": "Show less",

    "text.heading": "3. Text",
    "text.label": "Text on the ring",
    "text.placeholder": "Your text, e.g. Looking for a marketing role",
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

    "icon.label": "Symbol on the ring",
    "icon.none": "No symbol",
    "icon.pos": "Symbol position",
    "icon.start": "Before the text",
    "icon.end": "After the text",
    "icon.both": "Both sides",
    "emoji.label": "Insert emoji",

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
    "export.size": "Resolution",
    "export.download": "Download PNG · {size} px",
    "export.share": "Share image",
    "export.info": "Tip: most networks crop profile pictures to a circle automatically.",
    "export.watermarkNote": "Images contain a small “{watermark}” note at the bottom.",
    "export.done": "Image created.",
    "export.shareError": "Sharing failed. Please use “Download” instead.",
    "export.filename": "profile-frame.png",

    "watermark": "Made with {app}",


    "share.title": "Like your frame?",
    "share.lead": "Share the app with your network – it really helps us stay free.",
    "share.text": "I made my profile picture frame with {app} – free and without uploading my photo:",
    "share.copy": "Copy link",
    "share.copied": "Link copied!",
    "share.more": "Share …",
    "share.close": "Close",
    "share.dontShow": "Don't show again",

    "hex.label": "Hex code",
    "hex.invalid": "Invalid hex code",
    "unit.deg": "°",
    "unit.pct": "%"
  }
};

PBG.lang = (document.documentElement.lang || "de").slice(0, 2);
if (!PBG.I18N[PBG.lang]) PBG.lang = "de";

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

/** Wählt den Eintrag der aktuellen Sprache aus einem {de, en}-Objekt. */
PBG.loc = function (obj) {
  if (!obj || typeof obj === "string") return obj || "";
  return obj[PBG.lang] || obj.de || "";
};

/** Setzt alle Texte im DOM anhand der data-i18n*-Attribute. */
PBG.applyI18n = function (root) {
  root = root || document;
  var vars = {
    app: (PBG.config && PBG.config.appName) || ""
  };
  root.querySelectorAll("[data-i18n]").forEach(function (el) {
    el.textContent = PBG.t(el.getAttribute("data-i18n"), vars);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
    el.setAttribute("placeholder", PBG.t(el.getAttribute("data-i18n-placeholder"), vars));
  });
  root.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
    el.setAttribute("aria-label", PBG.t(el.getAttribute("data-i18n-aria"), vars));
  });
  root.querySelectorAll("[data-i18n-title]").forEach(function (el) {
    el.setAttribute("title", PBG.t(el.getAttribute("data-i18n-title"), vars));
  });
};
