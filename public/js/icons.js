window.PBG = window.PBG || {};

/*
 * Symbole für den Ring (Premium). 24×24-Pfade; "stroke" = als Linie zeichnen.
 * Teilweise angelehnt an Material Icons (Apache License 2.0).
 */
PBG.ICONS = [
  { id: "star", label: { de: "Stern", en: "Star" }, d: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" },
  { id: "sparkle", label: { de: "Funkeln", en: "Sparkle" }, d: "M12 1.5l2.4 8.1L22.5 12l-8.1 2.4L12 22.5l-2.4-8.1L1.5 12l8.1-2.4z" },
  { id: "heart", label: { de: "Herz", en: "Heart" }, d: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" },
  { id: "check", label: { de: "Haken", en: "Check" }, d: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" },
  { id: "rocket", label: { de: "Rakete", en: "Rocket" }, evenodd: true,
    d: "M12 1.5c3.2 2.6 4.8 6.3 4.8 10.6V16H7.2v-3.9C7.2 7.8 8.8 4.1 12 1.5zM12 6.6a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 1 0 0-3.8zM7.2 12.5L4 15.7v3.6l3.2-1.6zM16.8 12.5l3.2 3.2v3.6l-3.2-1.6zM9.6 17h4.8L12 22.5z" },
  { id: "bulb", label: { de: "Idee", en: "Idea" }, d: "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" },
  { id: "leaf", label: { de: "Blatt", en: "Leaf" }, d: "M21 3C9.5 3 3.5 8.6 3.5 15.6c0 1.5.4 2.9 1 4.1L2.8 21.4l1.1 1.1 1.7-1.7c1.3.8 2.9 1.2 4.6 1.2C17.8 22 21 13.6 21 3zM7.4 18.3c2.2-4.7 5.3-7.9 9.6-10.3-3.2 3.2-5.6 6.6-7.3 11z" },
  { id: "briefcase", label: { de: "Koffer", en: "Briefcase" }, d: "M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" },
  { id: "mic", label: { de: "Mikrofon", en: "Microphone" }, d: "M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" },
  { id: "globe", label: { de: "Globus", en: "Globe" }, stroke: true,
    d: "M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 1 0 0-19zM12 2.5c-2.6 2.6-3.9 5.8-3.9 9.5s1.3 6.9 3.9 9.5M12 2.5c2.6 2.6 3.9 5.8 3.9 9.5s-1.3 6.9-3.9 9.5M3 9h18M3 15h18" },
  { id: "calendar", label: { de: "Kalender", en: "Calendar" }, d: "M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" },
  { id: "link", label: { de: "Verbindung", en: "Link" }, stroke: true,
    d: "M10 13.5a4.5 4.5 0 0 0 6.4.4l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.5 1.5M14 10.5a4.5 4.5 0 0 0-6.4-.4l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.5-1.5" },
  { id: "code", label: { de: "Code", en: "Code" }, stroke: true, d: "M8 6l-6 6 6 6M16 6l6 6-6 6M14 3.5l-4 17" }
];

/** Emojis für die Schnellauswahl (Premium). */
PBG.EMOJIS = ["⭐", "✨", "🚀", "💼", "💡", "🎯", "🤝", "❤️", "🌱", "🌍", "🎓", "📣", "✅", "🔥", "👋", "🏳️‍🌈"];

PBG.iconById = function (id) {
  for (var i = 0; i < PBG.ICONS.length; i++) if (PBG.ICONS[i].id === id) return PBG.ICONS[i];
  return null;
};

PBG._iconPaths = {};
PBG.iconPath = function (icon) {
  if (!window.Path2D) return null;
  if (!PBG._iconPaths[icon.id]) PBG._iconPaths[icon.id] = new Path2D(icon.d);
  return PBG._iconPaths[icon.id];
};
