window.PBG = window.PBG || {};

/** Verfügbare Schriftarten (lokal in /fonts, siehe css/fonts.css). */
PBG.FONTS = [
  { id: "Montserrat", label: "Montserrat" },
  { id: "Poppins", label: "Poppins" },
  { id: "Oswald", label: "Oswald (schmal)" },
  { id: "Raleway", label: "Raleway" },
  { id: "Nunito", label: "Nunito (rund)" },
  { id: "Roboto Slab", label: "Roboto Slab (Serife)" }
];

/** Standardwerte – alle Maße relativ zur Bildgröße, damit Vorschau und Export identisch sind. */
PBG.DEFAULTS = {
  text: "",
  font: "Montserrat",
  size: 70,          // Schriftgröße in % der Ringbreite
  bold: true,
  uppercase: true,
  spacing: 8,        // Buchstabenabstand in % der Schriftgröße
  textPos: 0,        // Verschiebung des Texts entlang des Rings in Grad
  textColor: "#ffffff",
  ringColor: "#2e7d32",
  ringColor2: "#81c784",
  gradient: false,
  ringWidth: 17,     // in % des Radius
  ringLength: 250,   // Bogenlänge in Grad (180 = Halbkreis, 350 = fast voll)
  ringRotation: 35,  // Drehung des Bogens in Grad (0 = mittig unten, positiv = nach links)
  fade: 30,          // Länge des weichen Übergangs an den Enden in Grad
  opacity: 100,      // Deckkraft des Rings in %
  bg: "transparent"
};

/**
 * Vorlagen. "key" verweist auf i18n-Schlüssel preset.<key> (Name) und preset.<key>.text (Ringtext).
 * Bewusst ohne Logos, Markennamen oder Original-Farbtöne fremder Plattformen.
 */
PBG.PRESETS = [
  { key: "jobs", values: { ringColor: "#2e7d32", ringColor2: "#66bb6a", gradient: false, textColor: "#ffffff", font: "Montserrat", ringRotation: 35, ringLength: 250 } },
  { key: "hiring", values: { ringColor: "#5b2a86", ringColor2: "#9c4dcc", gradient: true, textColor: "#ffffff", font: "Montserrat", ringRotation: 35, ringLength: 250 } },
  { key: "freelancer", values: { ringColor: "#e65100", ringColor2: "#ffb300", gradient: true, textColor: "#ffffff", font: "Poppins", ringRotation: 0, ringLength: 220, uppercase: true } },
  { key: "projects", values: { ringColor: "#00695c", ringColor2: "#26a69a", gradient: true, textColor: "#ffffff", font: "Oswald", ringRotation: 0, ringLength: 290, spacing: 6 } },
  { key: "mentoring", values: { ringColor: "#1546a0", ringColor2: "#3d7fe0", gradient: true, textColor: "#ffffff", font: "Nunito", ringRotation: 35, ringLength: 240 } },
  { key: "speaker", values: { ringColor: "#b71c1c", ringColor2: "#e53935", gradient: false, textColor: "#ffffff", font: "Raleway", ringRotation: -35, ringLength: 230 } },
  { key: "apprentice", values: { ringColor: "#1a237e", ringColor2: "#3949ab", gradient: false, textColor: "#ffd54f", font: "Roboto Slab", ringRotation: 0, ringLength: 270 } },
  { key: "volunteer", values: { ringColor: "#ad1457", ringColor2: "#7b1fa2", gradient: true, textColor: "#ffffff", font: "Poppins", ringRotation: 35, ringLength: 240 } }
];
