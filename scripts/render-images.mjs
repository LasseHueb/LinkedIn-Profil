#!/usr/bin/env node
/*
 * Erzeugt Beispielbilder (WebP), Open-Graph-Bilder (PNG 1200×630) und App-Icons
 * mit dem echten Renderer im Browser. Ergebnis landet in public/img/ und wird eingecheckt.
 *
 * Voraussetzung (einmalig, nur lokal):  npm i --no-save playwright && npx playwright install chromium
 * Aufruf:                               npm run images
 * Die Beispiel-„Fotos“ sind gezeichnete Illustrationen – keine echten Personen.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let chromium;
try { ({ chromium } = await import("playwright")); } catch {
  console.error("Playwright fehlt. Installieren mit: npm i --no-save playwright && npx playwright install chromium");
  process.exit(1);
}
const { home, landingPages, staticPages } = await import(pathToFileURL(join(root, "src/content.mjs")).href);

const port = 8791;
const server = spawn(process.execPath, [join(root, "scripts/serve.mjs")], { env: { ...process.env, PORT: String(port) }, stdio: "ignore" });
await new Promise((r) => setTimeout(r, 600));

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();
await page.goto(`http://localhost:${port}/vorlage/jobsuche/`);
await page.waitForFunction(() => window.PBG && window.PBG.render);
await page.evaluate(() => document.fonts.ready);

const out = (p) => { const f = join(root, "public/img", p); mkdirSync(dirname(f), { recursive: true }); return f; };
const save = (p, dataUrl) => writeFileSync(out(p), Buffer.from(dataUrl.split(",")[1], "base64"));

// Hilfsfunktionen im Browser registrieren
await page.evaluate(() => {
  const AV = [
    { bg: ["#c9dcf0", "#8fb3d9"], skin: "#f1c7a5", hair: "#3b2a20", shirt: "#2c3e50", style: "short" },
    { bg: ["#f3d9c8", "#e0a98a"], skin: "#c98d66", hair: "#1d1512", shirt: "#f5f5f5", style: "long" },
    { bg: ["#d8ecd9", "#9fcfa4"], skin: "#8d5a3c", hair: "#16100c", shirt: "#3949ab", style: "bun" },
    { bg: ["#e4dcf3", "#b9a7e0"], skin: "#f6d3b8", hair: "#c58b3c", shirt: "#00796b", style: "long" },
    { bg: ["#f6e7b8", "#e6c66a"], skin: "#e0ac85", hair: "#5a3a26", shirt: "#37474f", style: "short" },
    { bg: ["#cfe7ef", "#7fbfd2"], skin: "#6b4430", hair: "#0f0b09", shirt: "#c62828", style: "curly" }
  ];
  window.__avatar = (size, i) => {
    const v = AV[i % AV.length];
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const x = c.getContext("2d");
    const s = size;
    const g = x.createLinearGradient(0, 0, s, s);
    g.addColorStop(0, v.bg[0]); g.addColorStop(1, v.bg[1]);
    x.fillStyle = g; x.fillRect(0, 0, s, s);
    // Haare hinten (lang)
    x.fillStyle = v.hair;
    if (v.style === "long") { x.beginPath(); x.ellipse(s * .5, s * .5, s * .2, s * .26, 0, 0, Math.PI * 2); x.fill(); x.fillRect(s * .3, s * .5, s * .4, s * .22); }
    // Oberkörper
    x.fillStyle = v.shirt;
    x.beginPath(); x.ellipse(s * .5, s * 1.02, s * .36, s * .3, 0, Math.PI, 0); x.fill();
    // Hals
    x.fillStyle = v.skin;
    x.fillRect(s * .44, s * .55, s * .12, s * .2);
    x.fillStyle = "rgba(0,0,0,.08)"; x.fillRect(s * .44, s * .62, s * .12, s * .04);
    // Kopf
    x.fillStyle = v.skin;
    x.beginPath(); x.ellipse(s * .5, s * .45, s * .15, s * .18, 0, 0, Math.PI * 2); x.fill();
    // Haare vorne
    x.fillStyle = v.hair;
    x.beginPath();
    if (v.style === "curly") {
      for (let k = 0; k < 9; k++) { const a = Math.PI + k * Math.PI / 8; x.moveTo(s * .5 + Math.cos(a) * s * .15, s * .38 + Math.sin(a) * s * .13); x.arc(s * .5 + Math.cos(a) * s * .15, s * .38 + Math.sin(a) * s * .13, s * .06, 0, Math.PI * 2); }
      x.fill(); x.beginPath(); x.ellipse(s * .5, s * .34, s * .15, s * .09, 0, 0, Math.PI * 2);
    } else {
      x.ellipse(s * .5, s * .36, s * .162, s * .12, 0, Math.PI, 0);
      x.ellipse(s * .44, s * .34, s * .12, s * .06, -.4, 0, Math.PI * 2);
    }
    x.fill();
    if (v.style === "bun") { x.beginPath(); x.arc(s * .5, s * .22, s * .07, 0, Math.PI * 2); x.fill(); }
    return c;
  };
  window.__presetState = (key) => {
    const p = PBG.presetByKey(key);
    const s = {};
    PBG.DESIGN_KEYS.forEach((k) => { s[k] = PBG.DEFAULTS[k]; });
    return Object.assign(s, p.values, { text: p.text.de, zoom: 1, offsetX: 0, offsetY: 0 });
  };
  window.__ensureFonts = async (state) => {
    const f = PBG.fontById(state.font);
    const w = state.bold && f.weights.includes(700) ? 700 : 400;
    await document.fonts.load(`${w} 40px "${state.font}"`, "ABCÄÖÜ");
  };
  window.__example = async (key, size, i) => {
    const s = window.__presetState(key);
    await window.__ensureFonts(s);
    const c = document.createElement("canvas");
    c.width = c.height = size;
    PBG.render(c.getContext("2d"), s, window.__avatar(size * 2, i), size, {});
    return c;
  };
  window.__wrap = (ctx, text, maxW) => {
    const words = text.split(" "); const lines = []; let line = "";
    for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
    if (line) lines.push(line);
    return lines;
  };
  window.__og = async (key, title, subtitle, i) => {
    const s = window.__presetState(key);
    const W = 1200, H = 630;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d");
    const g = x.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#0f1419"); g.addColorStop(1, s.ringColor);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // dekorativer Ring
    x.strokeStyle = "rgba(255,255,255,.06)"; x.lineWidth = 60;
    x.beginPath(); x.arc(W * .8, H * .5, 380, 0, Math.PI * 2); x.stroke();
    const ex = await window.__example(key, 440, i);
    x.save(); x.shadowColor = "rgba(0,0,0,.35)"; x.shadowBlur = 40; x.drawImage(ex, W - 440 - 70, (H - 440) / 2); x.restore();
    await document.fonts.load('700 60px "Montserrat"'); await document.fonts.load('600 30px "Nunito"');
    x.fillStyle = "#fff";
    x.font = '700 30px "Montserrat"'; x.globalAlpha = .85;
    x.fillText(PBG_CONFIG.appName, 70, 100); x.globalAlpha = 1;
    x.font = '700 56px "Montserrat"';
    const lines = window.__wrap(x, title, 600).slice(0, 4);
    lines.forEach((l, k) => x.fillText(l, 70, 190 + k * 68));
    x.font = '600 28px "Nunito"'; x.fillStyle = "rgba(255,255,255,.85)";
    x.fillText(subtitle, 70, 190 + lines.length * 68 + 40);
    // Datenschutz-Badge
    x.font = '700 22px "Nunito"';
    const badge = "Dein Foto bleibt im Browser";
    const bw = x.measureText(badge).width + 36;
    x.fillStyle = "rgba(255,255,255,.14)";
    x.beginPath(); x.roundRect(70, H - 110, bw, 48, 24); x.fill();
    x.fillStyle = "#fff"; x.fillText(badge, 88, H - 78);
    return c;
  };
});

const presets = await page.evaluate(() => PBG.PRESETS.map((p) => ({ key: p.key, premium: !!p.premium, name: p.name.de, text: p.text.de })));
let i = 0;
for (const p of presets) {
  save(`examples/${p.key}.webp`, await page.evaluate(async ([k, n]) => (await window.__example(k, 320, n)).toDataURL("image/webp", 0.86), [p.key, i]));
  save(`og/vorlage-${p.key}.jpg`, await page.evaluate(async ([k, t, n]) => (await window.__og(k, `Profilbild-Rahmen „${t}“`, "Jetzt selbst gestalten – kostenlos", n)).toDataURL("image/jpeg", 0.86), [p.key, p.text, i]));
  i++;
}
const og = async (name, key, title, sub, n) =>
  save(`og/${name}.jpg`, await page.evaluate(async ([k, t, s, n]) => (await window.__og(k, t, s, n)).toDataURL("image/jpeg", 0.86), [key, title, sub, n]));

const sub = "Eigener Text · Kostenlos · Ohne Upload";
await og("default", "jobsuche", "Profilbild-Rahmen mit eigenem Text", sub, 0);
await og("home", home.preset, home.h1.replace("{app}", ""), sub, 0);
for (const [n, l] of landingPages.entries()) await og(l.slug, l.preset, l.h1, sub, n + 1);
await og("premium", "hiring-neon", "Premium: Rahmen ohne Hinweis, mit Verläufen & 20+ Vorlagen", "Einmalig – kein Abo", 2);
await og("unternehmen", "recruiting", "Firmen-Rahmen fürs ganze Team", "Firmenfarben · Logo · ein Link für alle", 4);

// App-Icons
for (const [name, size] of [["icon-192.png", 192], ["icon-512.png", 512], ["apple-touch-icon.png", 180]]) {
  save(name, await page.evaluate((size) => {
    const c = document.createElement("canvas"); c.width = c.height = size;
    const x = c.getContext("2d");
    x.fillStyle = "#1f6feb"; x.fillRect(0, 0, size, size);
    x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = size * .06;
    x.beginPath(); x.arc(size / 2, size / 2, size * .32, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = "#fff"; x.lineWidth = size * .14; x.lineCap = "round";
    x.beginPath(); x.arc(size / 2, size / 2, size * .32, Math.PI * .15, Math.PI * .85); x.stroke();
    return c.toDataURL("image/png");
  }, size));
}

await browser.close();
server.kill();
console.log(`✓ ${presets.length} Beispielbilder, ${presets.length + 4 + landingPages.length} OG-Bilder und Icons erzeugt.`);
