window.PBG = window.PBG || {};

/**
 * Schriftarten (lokal in /fonts, siehe css/fonts.css).
 * weights: verfügbare Schriftschnitte – Schriften ohne 700 ignorieren "Fett".
 * premium: nur mit Premium wählbar.
 */
PBG.FONTS = [
  { id: "Montserrat", label: "Montserrat", weights: [400, 700] },
  { id: "Poppins", label: "Poppins", weights: [400, 700] },
  { id: "Oswald", label: "Oswald (schmal)", weights: [400, 700] },
  { id: "Raleway", label: "Raleway", weights: [400, 700] },
  { id: "Nunito", label: "Nunito (rund)", weights: [400, 700] },
  { id: "Roboto Slab", label: "Roboto Slab (Serife)", weights: [400, 700] },
  { id: "Playfair Display", label: "Playfair Display (elegant)", weights: [400, 700], premium: true },
  { id: "Space Grotesk", label: "Space Grotesk (Tech)", weights: [400, 700], premium: true },
  { id: "Caveat", label: "Caveat (Handschrift)", weights: [400, 700], premium: true },
  { id: "Bebas Neue", label: "Bebas Neue (Plakat)", weights: [400], premium: true },
  { id: "Archivo Black", label: "Archivo Black (kräftig)", weights: [400], premium: true }
];

PBG.fontById = function (id) {
  for (var i = 0; i < PBG.FONTS.length; i++) if (PBG.FONTS[i].id === id) return PBG.FONTS[i];
  return PBG.FONTS[0];
};

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
  gradient: false,   // Premium
  ringWidth: 17,     // in % des Radius
  ringLength: 250,   // Bogenlänge in Grad (180 = Halbkreis, 350 = fast voll)
  ringRotation: 35,  // Drehung des Bogens in Grad (0 = mittig unten, positiv = nach links)
  fade: 30,          // Länge des weichen Übergangs an den Enden in Grad
  opacity: 100,      // Deckkraft des Rings in %
  icon: "",          // Premium: Symbol-ID aus PBG.ICONS
  iconPos: "start",  // start | end | both
  logoPos: "end",    // Firmen-Logo: start | end
  bg: "transparent"
};

/** Einstellungen, die eine Vorlage ausmachen (werden gespeichert / geteilt). */
PBG.DESIGN_KEYS = ["text", "font", "size", "bold", "uppercase", "spacing", "textPos", "textColor", "ringColor",
  "ringColor2", "gradient", "ringWidth", "ringLength", "ringRotation", "fade", "opacity", "icon", "iconPos", "logoPos"];

/**
 * Vorlagen. key = URL-Slug (/vorlage/<key>/). name/text je Sprache.
 * Kostenlose Vorlagen bewusst ohne Premium-Funktionen (kein Verlauf, Standardschriften, keine Symbole).
 * Keine Logos, Markennamen oder Original-Farbtöne fremder Plattformen.
 */
PBG.PRESETS = [
  // ---------- kostenlos ----------
  { key: "jobsuche", name: { de: "Jobsuche", en: "Job search" }, text: { de: "#OFFENFÜRJOBS", en: "#OPENFORWORK" },
    values: { ringColor: "#2e7d32", font: "Montserrat", ringRotation: 35, ringLength: 250 } },
  { key: "recruiting", name: { de: "Recruiting", en: "Recruiting" }, text: { de: "#WIRSTELLENEIN", en: "#WEAREHIRING" },
    values: { ringColor: "#5b2a86", font: "Montserrat", ringRotation: 35, ringLength: 250 } },
  { key: "freelancer", name: { de: "Freelancer", en: "Freelancer" }, text: { de: "Freelancer", en: "Freelancer" },
    values: { ringColor: "#e65100", font: "Poppins", ringRotation: 0, ringLength: 220 } },
  { key: "projekte", name: { de: "Verfügbar für Projekte", en: "Available for projects" }, text: { de: "Verfügbar für Projekte", en: "Available for projects" },
    values: { ringColor: "#00695c", font: "Oswald", ringRotation: 0, ringLength: 290, spacing: 6 } },
  { key: "selbststaendig", name: { de: "Selbstständig", en: "Self-employed" }, text: { de: "#SELBSTSTÄNDIG", en: "#SELFEMPLOYED" },
    values: { ringColor: "#37474f", textColor: "#ffd54f", font: "Montserrat", ringRotation: 30, ringLength: 250 } },
  { key: "mentoring", name: { de: "Mentoring", en: "Mentoring" }, text: { de: "#MENTORING", en: "#MENTORING" },
    values: { ringColor: "#1546a0", font: "Nunito", ringRotation: 35, ringLength: 240 } },
  { key: "speaker", name: { de: "Speaker", en: "Speaker" }, text: { de: "#SPEAKER", en: "#SPEAKER" },
    values: { ringColor: "#b71c1c", font: "Raleway", ringRotation: -35, ringLength: 230 } },
  { key: "ausbildung", name: { de: "Ausbildung", en: "Apprenticeship" }, text: { de: "#SUCHEAUSBILDUNG", en: "#APPRENTICESHIP" },
    values: { ringColor: "#1a237e", textColor: "#ffd54f", font: "Roboto Slab", ringRotation: 0, ringLength: 270 } },
  { key: "ehrenamt", name: { de: "Ehrenamt", en: "Volunteering" }, text: { de: "#EHRENAMT", en: "#VOLUNTEERING" },
    values: { ringColor: "#ad1457", font: "Poppins", ringRotation: 35, ringLength: 240 } },

  // ---------- Premium ----------
  { key: "jobsuche-sonnenuntergang", premium: true, name: { de: "Jobsuche Sunset", en: "Job search sunset" }, text: { de: "#OFFENFÜRJOBS", en: "#OPENFORWORK" },
    values: { gradient: true, ringColor: "#f4511e", ringColor2: "#d81b60", font: "Montserrat", icon: "sparkle", iconPos: "start" } },
  { key: "jobsuche-ozean", premium: true, name: { de: "Jobsuche Ozean", en: "Job search ocean" }, text: { de: "Offen für neue Jobs", en: "Open to new roles" },
    values: { gradient: true, ringColor: "#0277bd", ringColor2: "#00bfa5", font: "Space Grotesk", uppercase: false, ringLength: 270 } },
  { key: "hiring-neon", premium: true, name: { de: "Hiring Neon", en: "Hiring neon" }, text: { de: "#WIRSTELLENEIN", en: "#WEAREHIRING" },
    values: { gradient: true, ringColor: "#6a1b9a", ringColor2: "#ff4081", font: "Space Grotesk", icon: "rocket", iconPos: "end" } },
  { key: "hiring-gold", premium: true, name: { de: "Hiring Gold", en: "Hiring gold" }, text: { de: "Wir stellen ein", en: "We are hiring" },
    values: { ringColor: "#0d1b3e", textColor: "#f5c451", font: "Playfair Display", uppercase: false, spacing: 4, icon: "star", iconPos: "both" } },
  { key: "team-gesucht", premium: true, name: { de: "Komm ins Team", en: "Join the team" }, text: { de: "Komm in unser Team", en: "Join our team" },
    values: { gradient: true, ringColor: "#00897b", ringColor2: "#43a047", font: "Poppins", uppercase: false, icon: "rocket", iconPos: "start", ringLength: 260 } },
  { key: "freelancer-kreativ", premium: true, name: { de: "Freelancer kreativ", en: "Creative freelancer" }, text: { de: "Freelancerin · Design", en: "Freelance · Design" },
    values: { gradient: true, ringColor: "#ff6f00", ringColor2: "#ec407a", font: "Caveat", uppercase: false, size: 85, spacing: 2, ringLength: 260 } },
  { key: "freelancer-tech", premium: true, name: { de: "Freelancer Tech", en: "Freelancer tech" }, text: { de: "Freelance Developer", en: "Freelance Developer" },
    values: { gradient: true, ringColor: "#102027", ringColor2: "#00c853", font: "Space Grotesk", icon: "code", iconPos: "start", ringLength: 270 } },
  { key: "ab-sofort-verfuegbar", premium: true, name: { de: "Ab sofort verfügbar", en: "Available now" }, text: { de: "Ab sofort verfügbar", en: "Available now" },
    values: { gradient: true, ringColor: "#2e7d32", ringColor2: "#9ccc65", font: "Poppins", icon: "check", iconPos: "start", ringLength: 260 } },
  { key: "gruendung", premium: true, name: { de: "Gründer:in", en: "Founder" }, text: { de: "GRÜNDER:IN", en: "FOUNDER" },
    values: { gradient: true, ringColor: "#311b92", ringColor2: "#00b0ff", font: "Bebas Neue", size: 85, spacing: 12, icon: "rocket", iconPos: "end" } },
  { key: "mentoring-ideen", premium: true, name: { de: "Mentoring Ideen", en: "Mentoring ideas" }, text: { de: "Mentor:in für Einsteiger", en: "Mentor for juniors" },
    values: { gradient: true, ringColor: "#f9a825", ringColor2: "#ef6c00", textColor: "#1b1b1b", font: "Nunito", uppercase: false, icon: "bulb", iconPos: "start", ringLength: 270 } },
  { key: "speaker-buehne", premium: true, name: { de: "Speaker Bühne", en: "Speaker stage" }, text: { de: "Speaker & Trainer", en: "Speaker & Trainer" },
    values: { gradient: true, ringColor: "#b71c1c", ringColor2: "#4a148c", font: "Archivo Black", uppercase: true, size: 62, icon: "mic", iconPos: "start", ringLength: 260 } },
  { key: "coach", premium: true, name: { de: "Business Coach", en: "Business coach" }, text: { de: "Business Coach", en: "Business Coach" },
    values: { ringColor: "#263238", textColor: "#80cbc4", font: "Playfair Display", uppercase: false, icon: "sparkle", iconPos: "both" } },
  { key: "ehrenamt-herz", premium: true, name: { de: "Ehrenamt Herz", en: "Volunteer heart" }, text: { de: "Ehrenamtlich aktiv", en: "Volunteering" },
    values: { gradient: true, ringColor: "#c2185b", ringColor2: "#ff7043", font: "Poppins", uppercase: false, icon: "heart", iconPos: "both", ringLength: 260 } },
  { key: "nachhaltigkeit", premium: true, name: { de: "Nachhaltigkeit", en: "Sustainability" }, text: { de: "#NACHHALTIG", en: "#SUSTAINABLE" },
    values: { gradient: true, ringColor: "#1b5e20", ringColor2: "#8bc34a", font: "Montserrat", icon: "leaf", iconPos: "start" } },
  { key: "werkstudent", premium: true, name: { de: "Werkstudent:in", en: "Working student" }, text: { de: "Suche Werkstudentenjob", en: "Looking for student job" },
    values: { gradient: true, ringColor: "#0d47a1", ringColor2: "#7c4dff", font: "Poppins", uppercase: false, icon: "briefcase", iconPos: "start", ringLength: 280 } },
  { key: "praktikum", premium: true, name: { de: "Praktikum", en: "Internship" }, text: { de: "#SUCHEPRAKTIKUM", en: "#OPENTOINTERNSHIP" },
    values: { gradient: true, ringColor: "#006064", ringColor2: "#26c6da", font: "Montserrat", icon: "star", iconPos: "end" } },
  { key: "elternzeit", premium: true, name: { de: "Elternzeit", en: "Parental leave" }, text: { de: "Gerade in Elternzeit", en: "On parental leave" },
    values: { gradient: true, ringColor: "#8e24aa", ringColor2: "#f48fb1", font: "Nunito", uppercase: false, icon: "heart", iconPos: "end", ringLength: 260 } },
  { key: "remote", premium: true, name: { de: "Remote", en: "Remote" }, text: { de: "#REMOTE", en: "#REMOTE" },
    values: { gradient: true, ringColor: "#283593", ringColor2: "#00acc1", font: "Space Grotesk", icon: "globe", iconPos: "start" } },
  { key: "vernetzen", premium: true, name: { de: "Lass uns vernetzen", en: "Let's connect" }, text: { de: "Lass uns vernetzen", en: "Let's connect" },
    values: { gradient: true, ringColor: "#3949ab", ringColor2: "#1e88e5", font: "Poppins", uppercase: false, icon: "link", iconPos: "end", ringLength: 260 } },
  { key: "jubilaeum", premium: true, name: { de: "Jubiläum", en: "Anniversary" }, text: { de: "10 Jahre dabei", en: "10 years on board" },
    values: { ringColor: "#3e2723", textColor: "#ffd54f", font: "Playfair Display", uppercase: false, icon: "star", iconPos: "both" } },
  { key: "neuer-job", premium: true, name: { de: "Neuer Job", en: "New job" }, text: { de: "#NEUERJOB", en: "#NEWJOB" },
    values: { gradient: true, ringColor: "#ff6d00", ringColor2: "#ffd600", textColor: "#1b1b1b", font: "Archivo Black", size: 62, icon: "sparkle", iconPos: "both" } },
  { key: "messe", premium: true, name: { de: "Messe & Events", en: "Trade fair" }, text: { de: "Triff mich auf der Messe", en: "Meet me at the fair" },
    values: { gradient: true, ringColor: "#004d40", ringColor2: "#1565c0", font: "Raleway", uppercase: false, icon: "calendar", iconPos: "start", ringLength: 280 } },
  { key: "ruhestand", premium: true, name: { de: "Ruhestand", en: "Retired" }, text: { de: "Im Ruhestand", en: "Retired" },
    values: { gradient: true, ringColor: "#5d4037", ringColor2: "#a1887f", font: "Playfair Display", uppercase: false, icon: "leaf", iconPos: "end" } }
];

PBG.presetByKey = function (key) {
  for (var i = 0; i < PBG.PRESETS.length; i++) if (PBG.PRESETS[i].key === key) return PBG.PRESETS[i];
  return null;
};
