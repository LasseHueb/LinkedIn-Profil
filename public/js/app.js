/*
 * Profilbild-Rahmen-Editor – UI-Logik. Fotos werden ausschließlich lokal im Browser verarbeitet.
 *
 * Modi (über <body data-mode="…">):
 *   public – öffentlicher Editor (Premium-Funktionen gesperrt, Hinweis im Bild ohne Premium)
 *   admin  – Firmen-Admin gestaltet einen Firmen-Rahmen (alles freigeschaltet, kein Hinweis)
 *   team   – Mitarbeitende nutzen einen Firmen-Rahmen (ggf. gesperrt)
 * Startvorlage über <body data-preset="jobsuche"> oder ?vorlage=jobsuche.
 */
(function () {
  "use strict";

  var MAX_PHOTO_SIDE = 3200;   // größere Fotos werden beim Laden verkleinert (Speicher auf Mobilgeräten)
  var MAX_ZOOM = 4;
  var RANGE_KEYS = ["size", "spacing", "textPos", "ringWidth", "ringLength", "ringRotation", "fade", "opacity"];
  var COLOR_KEYS = ["textColor", "ringColor", "ringColor2"];

  var $ = function (id) { return document.getElementById(id); };
  var t = PBG.t;
  var cfg = PBG.config || {};
  var body = document.body;
  var mode = body.dataset.mode || "public";

  if (!$("editor")) return; // Seite ohne Editor

  // ---------- Zustand ----------
  var state = Object.assign({}, PBG.DEFAULTS, { zoom: 1, offsetX: 0, offsetY: 0, exportSize: 1080 });
  var photo = null;          // verkleinerter Canvas mit dem Foto (nur im Arbeitsspeicher)
  var photoName = "";
  var logo = null;           // Firmen-Logo (nur admin/team)
  var activePreset = null;
  var lastInfo = { scale: 1, overflow: false };
  var team = { locked: false, company: "", watermark: false };
  var listeners = { download: [], change: [] };

  var els = {
    preview: $("preview"), stage: $("stage"), mini: $("mini"), miniXs: $("mini-xs"),
    fileInput: $("file-input"), dropzone: $("dropzone"), uploadStatus: $("upload-status"),
    zoom: $("zoom"), resetCrop: $("reset-crop"), removePhoto: $("remove-photo"),
    presetsFree: $("presets-free"), presetsPremium: $("presets-premium"),
    text: $("text"), font: $("font"), bold: $("bold"), uppercase: $("uppercase"),
    icon: $("icon"), iconPos: $("iconPos"), emojiRow: $("emoji-row"),
    gradient: $("gradient"), ringColor2Field: $("ringColor2-field"),
    textWarning: $("text-warning"), contrastWarning: $("contrast-warning"),
    download: $("download"), downloadLabel: $("download-label"), share: $("share"), exportStatus: $("export-status"),
    watermarkNote: $("watermark-note"), watermarkNoteText: $("watermark-note-text"), watermarkUpgrade: $("watermark-upgrade"),
    teamNote: $("team-note"),
    upgradeDialog: $("upgrade-dialog"), upgradeReason: $("upgrade-reason"), upgradeConsent: $("upgrade-consent"),
    upgradeBuy: $("upgrade-buy"), upgradeStatus: $("upgrade-status"), licenseInput: $("license-input"), licenseActivate: $("license-activate"),
    shareDialog: $("share-dialog"), shareStatus: $("share-status"), shareDontShow: $("share-dont-show")
  };

  // ---------- Hilfsfunktionen ----------
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

  function normalizeHex(v) {
    v = String(v || "").trim().replace(/^#/, "");
    if (/^[0-9a-f]{3}$/i.test(v)) v = v.replace(/(.)/g, "$1$1");
    return /^[0-9a-f]{6}$/i.test(v) ? "#" + v.toLowerCase() : null;
  }

  function luminance(hex) {
    return PBG.color.hexToRgb(hex).reduce(function (sum, c, i) {
      c /= 255;
      c = c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      return sum + c * [0.2126, 0.7152, 0.0722][i];
    }, 0);
  }

  function contrast(a, b) {
    var la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  function formatValue(key, v) {
    var el = $(key);
    var unit = el && el.dataset.unit;
    if (key === "zoom") return Math.round(v * 100) + " %";
    if (unit === "deg") return Math.round(v) + "°";
    if (unit === "pct") return Math.round(v) + " %";
    return String(v);
  }

  function setStatus(el, msg, isError) {
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("error", !!isError);
  }

  function emit(type, data) {
    listeners[type].forEach(function (fn) { try { fn(data); } catch (e) { console.error(e); } });
  }

  // ---------- Premium ----------
  /** Sind Premium-Funktionen nutzbar? Firmen-Rahmen (admin/team) sind immer voll ausgestattet. */
  function unlocked() { return mode !== "public" || PBG.premium.active; }

  function watermarkText() {
    if (mode === "admin") return "";
    if (mode === "team") return team.watermark ? t("watermark", { app: cfg.appName }) : "";
    return PBG.premium.active ? "" : t("watermark", { app: cfg.appName });
  }

  /** Entfernt Premium-Einstellungen, falls Premium (nicht mehr) aktiv ist. */
  function sanitizeForFree() {
    if (unlocked()) return;
    state.gradient = false;
    if (PBG.fontById(state.font).premium || PBG.fontById(state.font).id !== state.font) state.font = PBG.DEFAULTS.font;
    state.icon = "";
    state.exportSize = 1080;
    if (activePreset && PBG.presetByKey(activePreset) && PBG.presetByKey(activePreset).premium) activePreset = null;
  }

  function updatePremiumUI() {
    document.documentElement.classList.toggle("premium-active", unlocked());
    buildFontOptions();
    buildIconOptions();
    var free = !unlocked() && mode === "public";
    if (els.watermarkNote) els.watermarkNote.hidden = !free;
    if (els.watermarkNoteText) els.watermarkNoteText.textContent = t("export.watermarkNote", { watermark: t("watermark", { app: cfg.appName }) });
    document.querySelectorAll("[data-premium-feature]").forEach(function (el) {
      el.classList.toggle("is-locked", !unlocked());
    });
    document.querySelectorAll(".preset[data-premium]").forEach(function (b) {
      b.classList.toggle("is-locked", !unlocked());
      b.setAttribute("aria-label", b.dataset.name + (unlocked() ? "" : " – " + t("premium.locked")));
    });
  }

  var upgradeReturnFocus = null;
  function openUpgrade(reason, vars) {
    if (!els.upgradeDialog) return;
    els.upgradeReason.textContent = reason ? t("upgrade.reason." + reason, vars) : "";
    els.upgradeReason.hidden = !reason;
    setStatus(els.upgradeStatus, "");
    upgradeReturnFocus = document.activeElement;
    PBG.track("Upgrade Dialog", { grund: reason || "allgemein" });
    showDialog(els.upgradeDialog);
  }
  PBG.openUpgrade = openUpgrade;

  function showDialog(d) {
    if (d.showModal) { if (!d.open) d.showModal(); }
    else d.setAttribute("open", "");
  }

  function closeDialog(d) {
    if (d.close) d.close(); else d.removeAttribute("open");
  }

  function bindUpgradeDialog() {
    if (!els.upgradeDialog) return;
    els.upgradeDialog.addEventListener("close", function () {
      if (upgradeReturnFocus && upgradeReturnFocus.focus) upgradeReturnFocus.focus();
    });
    els.upgradeConsent.addEventListener("change", function () {
      els.upgradeBuy.disabled = !els.upgradeConsent.checked;
    });
    els.upgradeBuy.addEventListener("click", function () {
      if (!PBG.api.enabled) { setStatus(els.upgradeStatus, t("upgrade.unavailable"), true); return; }
      els.upgradeBuy.disabled = true;
      setStatus(els.upgradeStatus, t("upgrade.redirecting"));
      PBG.premium.checkout().catch(function () {
        setStatus(els.upgradeStatus, t("upgrade.unavailable"), true);
        els.upgradeBuy.disabled = !els.upgradeConsent.checked;
      });
    });
    els.licenseActivate.addEventListener("click", function () {
      if (!PBG.api.enabled) { setStatus(els.upgradeStatus, t("upgrade.unavailable"), true); return; }
      els.licenseActivate.disabled = true;
      PBG.premium.activate(els.licenseInput.value).then(function (ok) {
        setStatus(els.upgradeStatus, ok ? t("upgrade.success") : t("upgrade.invalid"), !ok);
        if (ok) setTimeout(function () { closeDialog(els.upgradeDialog); }, 1200);
      }).catch(function () {
        setStatus(els.upgradeStatus, t("upgrade.unavailable"), true);
      }).finally(function () { els.licenseActivate.disabled = false; });
    });
    if (els.watermarkUpgrade) els.watermarkUpgrade.addEventListener("click", function () { openUpgrade("watermark"); });

    window.addEventListener("pbg:premium", function () {
      sanitizeForFree();
      updatePremiumUI();
      syncControls();
      requestRender();
    });
  }

  // ---------- Schriften ----------
  var fontPromises = {};
  var fontsLoaded = {};
  function fontKey(s) { return (s.bold ? "700 " : "400 ") + s.font; }
  function ensureFont(s) {
    var key = fontKey(s);
    if (!fontPromises[key]) {
      var f = PBG.fontById(s.font);
      var w = s.bold && f.weights.indexOf(700) >= 0 ? "700" : "400";
      var p = document.fonts && document.fonts.load
        ? document.fonts.load(w + ' 40px "' + s.font + '"', "ABCÄÖÜ abc").catch(function () {})
        : Promise.resolve();
      fontPromises[key] = p.then(function () { fontsLoaded[key] = true; });
    }
    return fontPromises[key];
  }

  // ---------- Rendern ----------
  var rafPending = false;
  function requestRender() {
    // Schrift noch nicht geladen: nach dem Laden erneut zeichnen
    if (!fontsLoaded[fontKey(state)]) ensureFont(state).then(requestRender);
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      renderAll();
    });
  }

  function sizeCanvas(canvas) {
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    var cssW = canvas.clientWidth || canvas.width;
    var px = Math.max(16, Math.round(cssW * dpr));
    if (canvas.width !== px) { canvas.width = px; canvas.height = px; }
    return px;
  }

  function renderState() {
    return Object.assign({}, state, { noEmoji: !unlocked() });
  }

  function renderOpts(extra) {
    return Object.assign({ watermark: watermarkText(), logo: logo }, extra || {});
  }

  function renderAll() {
    var s = renderState();
    var size = sizeCanvas(els.preview);
    lastInfo = PBG.render(els.preview.getContext("2d"), s, photo, size, renderOpts());
    [els.mini, els.miniXs].forEach(function (c) {
      PBG.render(c.getContext("2d"), s, photo, sizeCanvas(c), renderOpts({ watermark: "" }));
    });
    updateWarnings();
    els.preview.setAttribute("aria-label", t("preview.canvasLabel", { text: state.text || "–" }));
  }

  function updateWarnings() {
    var msgs = [];
    if (lastInfo.overflow) msgs.push(t("text.tooLong"));
    else if (lastInfo.scale < 0.995) msgs.push(t("text.shrunk", { percent: Math.round(lastInfo.scale * 100) }));
    if (!unlocked() && PBG.text.hasEmoji(state.text)) msgs.push(t("text.emojiPremium"));
    els.textWarning.textContent = msgs.join(" ");
    els.textWarning.hidden = !msgs.length;

    var ratio = contrast(state.textColor, state.ringColor);
    if (state.gradient) ratio = Math.min(ratio, contrast(state.textColor, state.ringColor2));
    var low = ratio < 3 && !!state.text;
    els.contrastWarning.textContent = low ? t("text.lowContrast", { ratio: ratio.toFixed(1).replace(".", PBG.lang === "de" ? "," : ".") }) : "";
    els.contrastWarning.hidden = !low;
  }

  // ---------- Formular <-> Zustand ----------
  function buildFontOptions() {
    var current = state.font;
    els.font.innerHTML = "";
    PBG.FONTS.forEach(function (f) {
      var o = document.createElement("option");
      o.value = f.id;
      o.textContent = f.label + (f.premium && !unlocked() ? "  🔒 PRO" : f.premium ? "  ★" : "");
      els.font.appendChild(o);
    });
    els.font.value = current;
  }

  function buildIconOptions() {
    if (!els.icon) return;
    var current = state.icon;
    els.icon.innerHTML = "";
    var none = document.createElement("option");
    none.value = "";
    none.textContent = t("icon.none");
    els.icon.appendChild(none);
    PBG.ICONS.forEach(function (ic) {
      var o = document.createElement("option");
      o.value = ic.id;
      o.textContent = PBG.loc(ic.label) + (unlocked() ? "" : "  🔒 PRO");
      els.icon.appendChild(o);
    });
    els.icon.value = current;
  }

  function buildEmojiRow() {
    if (!els.emojiRow) return;
    els.emojiRow.innerHTML = "";
    PBG.EMOJIS.forEach(function (e) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "emoji-btn";
      b.textContent = e;
      b.setAttribute("aria-label", t("emoji.label") + " " + e);
      b.addEventListener("click", function () {
        if (!unlocked()) { openUpgrade("icon"); return; }
        var el = els.text;
        var pos = el.selectionStart != null ? el.selectionStart : el.value.length;
        var end = el.selectionEnd != null ? el.selectionEnd : pos;
        var v = el.value.slice(0, pos) + e + el.value.slice(end);
        if (v.length > Number(el.maxLength || 60)) return;
        el.value = v;
        state.text = v;
        el.focus();
        try { el.setSelectionRange(pos + e.length, pos + e.length); } catch (err) { /* alt */ }
        changed();
      });
      els.emojiRow.appendChild(b);
    });
  }

  function syncControls() {
    els.text.value = state.text;
    els.font.value = state.font;
    els.bold.checked = state.bold;
    els.bold.disabled = PBG.fontById(state.font).weights.indexOf(700) < 0;
    els.uppercase.checked = state.uppercase;
    els.gradient.checked = state.gradient;
    els.ringColor2Field.hidden = !state.gradient;
    if (els.icon) { els.icon.value = state.icon; els.iconPos.value = state.iconPos; els.iconPos.disabled = !state.icon; }
    RANGE_KEYS.forEach(function (k) {
      $(k).value = state[k];
      updateOutput(k);
    });
    COLOR_KEYS.forEach(function (k) {
      $(k).value = state[k];
      $(k + "-hex").value = state[k].toUpperCase();
      $(k + "-hex").removeAttribute("aria-invalid");
    });
    els.zoom.value = state.zoom;
    updateOutput("zoom");
    document.querySelectorAll('input[name="bg"]').forEach(function (r) { r.checked = r.value === state.bg; });
    document.querySelectorAll('input[name="exportSize"]').forEach(function (r) { r.checked = Number(r.value) === state.exportSize; });
    els.downloadLabel.textContent = t("export.download", { size: state.exportSize });
  }

  function updateOutput(key) {
    var out = $(key + "-out");
    var text = formatValue(key, state[key]);
    if (out) out.textContent = text;
    $(key).setAttribute("aria-valuetext", text);
  }

  function changed() {
    if (activePreset) {
      activePreset = null;
      markPreset();
    }
    emit("change", getDesign());
    requestRender();
  }

  function bindControls() {
    els.text.addEventListener("input", function () { state.text = els.text.value; changed(); });

    els.font.addEventListener("change", function () {
      var f = PBG.fontById(els.font.value);
      if (f.premium && !unlocked()) {
        els.font.value = state.font;
        openUpgrade("font");
        return;
      }
      state.font = f.id;
      els.bold.disabled = f.weights.indexOf(700) < 0;
      changed();
    });

    ["bold", "uppercase"].forEach(function (k) {
      els[k].addEventListener("change", function () { state[k] = els[k].checked; changed(); });
    });

    els.gradient.addEventListener("change", function () {
      if (els.gradient.checked && !unlocked()) {
        els.gradient.checked = false;
        openUpgrade("gradient");
        return;
      }
      state.gradient = els.gradient.checked;
      els.ringColor2Field.hidden = !state.gradient;
      changed();
    });

    if (els.icon) {
      els.icon.addEventListener("change", function () {
        if (els.icon.value && !unlocked()) {
          els.icon.value = state.icon;
          openUpgrade("icon");
          return;
        }
        state.icon = els.icon.value;
        els.iconPos.disabled = !state.icon;
        changed();
      });
      els.iconPos.addEventListener("change", function () { state.iconPos = els.iconPos.value; changed(); });
    }

    RANGE_KEYS.forEach(function (k) {
      $(k).addEventListener("input", function () {
        state[k] = parseFloat($(k).value);
        updateOutput(k);
        changed();
      });
    });

    COLOR_KEYS.forEach(function (k) {
      var picker = $(k), hex = $(k + "-hex");
      picker.addEventListener("input", function () {
        state[k] = picker.value.toLowerCase();
        hex.value = state[k].toUpperCase();
        hex.removeAttribute("aria-invalid");
        changed();
      });
      hex.addEventListener("input", function () {
        var v = normalizeHex(hex.value);
        if (v) {
          state[k] = v;
          picker.value = v;
          hex.removeAttribute("aria-invalid");
          hex.removeAttribute("title");
          changed();
        } else {
          hex.setAttribute("aria-invalid", "true");
          hex.setAttribute("title", t("hex.invalid"));
        }
      });
      hex.addEventListener("blur", function () {
        hex.value = state[k].toUpperCase();
        hex.removeAttribute("aria-invalid");
      });
    });

    els.zoom.addEventListener("input", function () { setZoom(parseFloat(els.zoom.value)); });

    document.querySelectorAll('input[name="bg"]').forEach(function (r) {
      r.addEventListener("change", function () { if (r.checked) state.bg = r.value; });
    });
    document.querySelectorAll('input[name="exportSize"]').forEach(function (r) {
      r.addEventListener("change", function () {
        if (!r.checked) return;
        var v = Number(r.value);
        if (v > 1080 && !unlocked()) {
          syncControls();
          openUpgrade("size");
          return;
        }
        state.exportSize = v;
        els.downloadLabel.textContent = t("export.download", { size: v });
      });
    });

    els.resetCrop.addEventListener("click", function () {
      state.zoom = 1; state.offsetX = 0; state.offsetY = 0;
      els.zoom.value = 1; updateOutput("zoom");
      requestRender();
    });
    els.removePhoto.addEventListener("click", function () {
      photo = null; photoName = "";
      state.zoom = 1; state.offsetX = 0; state.offsetY = 0;
      els.zoom.value = 1; updateOutput("zoom");
      els.removePhoto.hidden = true;
      els.fileInput.value = "";
      setStatus(els.uploadStatus, "");
      requestRender();
    });
  }

  // ---------- Vorlagen ----------
  function buildPresets() {
    if (!els.presetsFree) return;
    els.presetsFree.innerHTML = "";
    els.presetsPremium.innerHTML = "";
    PBG.PRESETS.forEach(function (p) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "preset";
      btn.dataset.key = p.key;
      btn.dataset.name = PBG.loc(p.name);
      if (p.premium) btn.dataset.premium = "1";
      btn.setAttribute("aria-pressed", "false");
      var c = document.createElement("canvas");
      c.setAttribute("aria-hidden", "true");
      var label = document.createElement("span");
      label.textContent = PBG.loc(p.name);
      btn.appendChild(c);
      btn.appendChild(label);
      if (p.premium) {
        var lock = document.createElement("span");
        lock.className = "preset-lock";
        lock.setAttribute("aria-hidden", "true");
        lock.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm-7-2a2 2 0 0 1 4 0v2h-4V7z"/></svg>';
        btn.appendChild(lock);
      }
      btn.addEventListener("click", function () {
        if (p.premium && !unlocked()) {
          openUpgrade("preset", { name: PBG.loc(p.name) });
          return;
        }
        applyPreset(p);
        PBG.track("Vorlage gewählt", { vorlage: p.key });
      });
      (p.premium ? els.presetsPremium : els.presetsFree).appendChild(btn);
    });
    var more = $("more-presets");
    if (more) {
      var count = els.presetsPremium.children.length;
      var setLabel = function () {
        var open = !els.presetsPremium.classList.contains("collapsed");
        more.textContent = open ? t("presets.less") : t("presets.more", { count: count });
        more.setAttribute("aria-expanded", String(open));
      };
      more.onclick = function () { els.presetsPremium.classList.toggle("collapsed"); setLabel(); };
      more.hidden = count <= 8;
      setLabel();
    }
    renderPresetThumbs();
    markPreset();
  }

  function presetState(p) {
    var s = {};
    PBG.DESIGN_KEYS.forEach(function (k) { s[k] = PBG.DEFAULTS[k]; });
    Object.assign(s, p.values, { text: PBG.loc(p.text) });
    return s;
  }

  var thumbObserver = null;
  function renderPresetThumbs() {
    if (!els.presetsFree) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    var size = Math.round(56 * dpr);
    function draw(btn) {
      var p = PBG.presetByKey(btn.dataset.key);
      var c = btn.querySelector("canvas");
      c.width = c.height = size;
      var s = Object.assign({ zoom: 1, offsetX: 0, offsetY: 0 }, presetState(p));
      ensureFont(s).then(function () { PBG.render(c.getContext("2d"), s, null, size); });
    }
    var btns = document.querySelectorAll(".preset");
    // Vorschaubilder erst zeichnen, wenn sie sichtbar werden (schnellerer Seitenaufbau)
    if (window.IntersectionObserver) {
      if (thumbObserver) thumbObserver.disconnect();
      thumbObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { draw(e.target); thumbObserver.unobserve(e.target); }
        });
      }, { rootMargin: "200px" });
      btns.forEach(function (b) { thumbObserver.observe(b); });
    } else {
      btns.forEach(draw);
    }
  }

  function applyPreset(p) {
    var keep = { zoom: state.zoom, offsetX: state.offsetX, offsetY: state.offsetY, bg: state.bg, exportSize: state.exportSize };
    Object.assign(state, presetState(p), keep);
    activePreset = p.key;
    syncControls();
    markPreset();
    emit("change", getDesign());
    requestRender();
  }

  function markPreset() {
    document.querySelectorAll(".preset").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.key === activePreset));
    });
  }

  // ---------- Foto laden ----------
  function isHeic(file) {
    return /hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name || "");
  }

  function decodeImage(blob) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(blob);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        if (img.naturalWidth && img.naturalHeight) resolve(img); else reject(new Error("empty"));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("decode")); };
      img.src = url;
    });
  }

  var heicLib = null;
  function loadHeicLib() {
    if (window.heic2any) return Promise.resolve(window.heic2any);
    if (!heicLib) {
      heicLib = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = PBG.url("/vendor/heic2any.min.js"); // lokal ausgeliefert, nur bei Bedarf geladen
        s.onload = function () { resolve(window.heic2any); };
        s.onerror = function () { heicLib = null; reject(new Error("heic lib")); };
        document.head.appendChild(s);
      });
    }
    return heicLib;
  }

  function toPhotoCanvas(img) {
    // Ausrichtung (EXIF) wenden aktuelle Browser beim Zeichnen automatisch an
    var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    var scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(w, h));
    var c = document.createElement("canvas");
    c.width = Math.round(w * scale);
    c.height = Math.round(h * scale);
    var ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  function loadFile(file) {
    if (!file) return;
    var heic = isHeic(file);
    if (!heic && file.type && !/^image\//.test(file.type)) {
      setStatus(els.uploadStatus, t("upload.errorType"), true);
      return;
    }
    setStatus(els.uploadStatus, t("upload.loading"));

    decodeImage(file)
      .catch(function (err) {
        // Safari kann HEIC selbst öffnen; andere Browser brauchen die Umwandlung
        if (!heic) throw err;
        setStatus(els.uploadStatus, t("upload.heicLoading"));
        return loadHeicLib()
          .then(function (heic2any) { return heic2any({ blob: file, toType: "image/jpeg", quality: 0.95 }); })
          .then(function (out) { return decodeImage(Array.isArray(out) ? out[0] : out); });
      })
      .then(function (img) {
        photo = toPhotoCanvas(img);
        photoName = file.name || "";
        state.zoom = 1; state.offsetX = 0; state.offsetY = 0;
        els.zoom.value = 1; updateOutput("zoom");
        els.removePhoto.hidden = false;
        setStatus(els.uploadStatus, t("upload.loaded", { name: photoName }));
        PBG.track("Foto geladen");
        requestRender();
      })
      .catch(function () {
        setStatus(els.uploadStatus, t("upload.error"), true);
      });
  }

  function bindUpload() {
    els.fileInput.addEventListener("change", function () {
      loadFile(els.fileInput.files && els.fileInput.files[0]);
    });

    [els.dropzone, els.stage].forEach(function (zone) {
      var depth = 0;
      zone.addEventListener("dragenter", function (e) { e.preventDefault(); depth++; zone.classList.add("drag-over"); });
      zone.addEventListener("dragover", function (e) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; });
      zone.addEventListener("dragleave", function () { if (--depth <= 0) { depth = 0; zone.classList.remove("drag-over"); } });
      zone.addEventListener("drop", function (e) {
        e.preventDefault();
        depth = 0;
        zone.classList.remove("drag-over");
        var f = e.dataTransfer.files && e.dataTransfer.files[0];
        loadFile(f);
      });
    });
    // Verhindert, dass der Browser ein danebengeworfenes Bild öffnet
    window.addEventListener("dragover", function (e) { e.preventDefault(); });
    window.addEventListener("drop", function (e) { e.preventDefault(); });

    // Einfügen aus der Zwischenablage
    window.addEventListener("paste", function (e) {
      if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
      var items = (e.clipboardData && e.clipboardData.files) || [];
      if (items.length) loadFile(items[0]);
    });
  }

  // ---------- Zuschneiden: Ziehen, Zoomen, Tastatur ----------
  function clampOffsets() {
    if (!photo) { state.offsetX = 0; state.offsetY = 0; return; }
    var m = Math.min(photo.width, photo.height);
    var maxX = Math.max(0, (photo.width / m * state.zoom - 1) / 2);
    var maxY = Math.max(0, (photo.height / m * state.zoom - 1) / 2);
    state.offsetX = clamp(state.offsetX, -maxX, maxX);
    state.offsetY = clamp(state.offsetY, -maxY, maxY);
  }

  function setZoom(z, anchor) {
    var old = state.zoom;
    z = clamp(z, 1, MAX_ZOOM);
    if (anchor) {
      // Um den Zeiger herum zoomen
      var f = z / old;
      state.offsetX = anchor.x - (anchor.x - state.offsetX) * f;
      state.offsetY = anchor.y - (anchor.y - state.offsetY) * f;
    } else {
      state.offsetX *= z / old;
      state.offsetY *= z / old;
    }
    state.zoom = z;
    clampOffsets();
    els.zoom.value = z;
    updateOutput("zoom");
    requestRender();
  }

  function bindCrop() {
    var c = els.preview;
    var pointers = new Map();
    var pinchStart = null;

    function rel(e) {
      var r = c.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 };
    }

    c.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      c.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      c.classList.add("dragging");
      if (pointers.size === 2) {
        var p = Array.from(pointers.values());
        pinchStart = { dist: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), zoom: state.zoom };
      }
    });

    c.addEventListener("pointermove", function (e) {
      if (!pointers.has(e.pointerId)) return;
      var prev = pointers.get(e.pointerId);
      var cur = { x: e.clientX, y: e.clientY };
      pointers.set(e.pointerId, cur);
      var w = c.getBoundingClientRect().width;
      if (pointers.size === 1) {
        state.offsetX += (cur.x - prev.x) / w;
        state.offsetY += (cur.y - prev.y) / w;
        clampOffsets();
        requestRender();
      } else if (pointers.size === 2 && pinchStart) {
        var p = Array.from(pointers.values());
        var d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
        setZoom(pinchStart.zoom * d / pinchStart.dist);
      }
    });

    function end(e) {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchStart = null;
      if (!pointers.size) c.classList.remove("dragging");
    }
    c.addEventListener("pointerup", end);
    c.addEventListener("pointercancel", end);

    c.addEventListener("wheel", function (e) {
      if (!photo) return;
      e.preventDefault();
      var a = rel(e);
      setZoom(state.zoom * Math.exp(-e.deltaY * 0.0015), { x: a.x, y: a.y });
    }, { passive: false });

    c.addEventListener("keydown", function (e) {
      var step = e.shiftKey ? 0.05 : 0.01;
      var handled = true;
      switch (e.key) {
        case "ArrowLeft": state.offsetX -= step; break;
        case "ArrowRight": state.offsetX += step; break;
        case "ArrowUp": state.offsetY -= step; break;
        case "ArrowDown": state.offsetY += step; break;
        case "+": case "=": setZoom(state.zoom * 1.08); return e.preventDefault();
        case "-": case "_": setZoom(state.zoom / 1.08); return e.preventDefault();
        case "0": setZoom(1); state.offsetX = 0; state.offsetY = 0; break;
        default: handled = false;
      }
      if (handled) {
        e.preventDefault();
        clampOffsets();
        requestRender();
      }
    });
  }

  // ---------- Export ----------
  function exportSize() {
    return unlocked() ? state.exportSize : 1080;
  }

  function exportCanvas() {
    var size = exportSize();
    var c = document.createElement("canvas");
    c.width = c.height = size;
    PBG.render(c.getContext("2d"), renderState(), photo, size, renderOpts({ background: state.bg }));
    return c;
  }

  function dataUrlToBlob(url) {
    var parts = url.split(",");
    var bin = atob(parts[1]);
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: "image/png" });
  }

  function canvasToBlob(c) {
    return new Promise(function (resolve) {
      if (c.toBlob) c.toBlob(function (b) { resolve(b || dataUrlToBlob(c.toDataURL("image/png"))); }, "image/png");
      else resolve(dataUrlToBlob(c.toDataURL("image/png")));
    });
  }

  function exportMeta() {
    return { vorlage: activePreset || "eigene", groesse: String(exportSize()), premium: unlocked() ? "ja" : "nein", modus: mode };
  }

  function bindExport() {
    els.download.addEventListener("click", function () {
      els.download.disabled = true;
      ensureFont(state).then(function () {
        return canvasToBlob(exportCanvas());
      }).then(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = t("export.filename");
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        setStatus(els.exportStatus, t("export.done"));
        PBG.track("Download", exportMeta());
        emit("download", exportMeta());
        setTimeout(maybeShowShareDialog, 600);
      }).finally(function () {
        els.download.disabled = false;
      });
    });

    // Bild teilen nur anbieten, wo Dateien geteilt werden können (vor allem Mobilgeräte)
    var canShareFiles = false;
    try {
      canShareFiles = !!(navigator.share && navigator.canShare &&
        navigator.canShare({ files: [new File([new Blob()], "test.png", { type: "image/png" })] }));
    } catch (e) { canShareFiles = false; }
    els.share.hidden = !(canShareFiles && isTouch());

    els.share.addEventListener("click", function () {
      // Synchron erzeugen, damit die Nutzergeste für navigator.share erhalten bleibt
      var blob = dataUrlToBlob(exportCanvas().toDataURL("image/png"));
      var file = new File([blob], t("export.filename"), { type: "image/png" });
      navigator.share({ files: [file] }).then(function () {
        PBG.track("Bild geteilt", exportMeta());
        emit("download", exportMeta());
      }).catch(function (err) {
        if (err && err.name === "AbortError") return;
        setStatus(els.exportStatus, t("export.shareError"), true);
      });
    });
  }

  function isTouch() {
    return !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  }

  // ---------- Teilen-Dialog (virale Verbreitung) ----------
  function appShareUrl(channel) {
    var p = activePreset && PBG.presetByKey(activePreset);
    var path = mode === "public" && p && !p.premium ? "/vorlage/" + p.key + "/" : "/";
    return PBG.absUrl(path) + "?utm_source=" + channel + "&utm_medium=share&utm_campaign=app-teilen";
  }

  function maybeShowShareDialog() {
    if (!els.shareDialog || mode === "admin") return;
    if (PBG.storage.get("pbg-share-dismissed") === "1") return;
    setStatus(els.shareStatus, "");
    showDialog(els.shareDialog);
  }

  function bindShareDialog() {
    if (!els.shareDialog) return;
    var text = function () { return t("share.text", { app: cfg.appName }); };
    function setLinks() {
      $("share-linkedin").href = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(appShareUrl("linkedin"));
      $("share-whatsapp").href = "https://wa.me/?text=" + encodeURIComponent(text() + " " + appShareUrl("whatsapp"));
      $("share-x").href = "https://x.com/intent/post?text=" + encodeURIComponent(text()) + "&url=" + encodeURIComponent(appShareUrl("x"));
    }
    els.shareDialog.addEventListener("click", function (e) {
      // Klick auf den Hintergrund schließt den Dialog
      if (e.target === els.shareDialog) closeDialog(els.shareDialog);
    });
    // Links vor dem Öffnen aktualisieren (Vorlage kann sich geändert haben)
    var origShow = els.shareDialog.showModal;
    if (origShow) els.shareDialog.showModal = function () { setLinks(); return origShow.call(els.shareDialog); };
    setLinks();

    ["linkedin", "whatsapp", "x"].forEach(function (ch) {
      $("share-" + ch).addEventListener("click", function () { PBG.track("App geteilt", { kanal: ch }); });
    });

    $("share-copy").addEventListener("click", function () {
      var url = appShareUrl("link");
      var done = function () { setStatus(els.shareStatus, t("share.copied")); PBG.track("App geteilt", { kanal: "link" }); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { fallbackCopy(url); done(); });
      } else { fallbackCopy(url); done(); }
    });

    var nativeBtn = $("share-native");
    nativeBtn.hidden = !(navigator.share && isTouch());
    nativeBtn.addEventListener("click", function () {
      navigator.share({ title: cfg.appName, text: text(), url: appShareUrl("native") }).then(function () {
        PBG.track("App geteilt", { kanal: "nativ" });
      }).catch(function () { /* abgebrochen */ });
    });

    els.shareDontShow.addEventListener("change", function () {
      if (els.shareDontShow.checked) PBG.storage.set("pbg-share-dismissed", "1");
      else PBG.storage.remove("pbg-share-dismissed");
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignorieren */ }
    ta.remove();
  }

  // ---------- Öffentliche Schnittstelle (Admin- und Team-Seite) ----------
  function getDesign() {
    var d = {};
    PBG.DESIGN_KEYS.forEach(function (k) { d[k] = state[k]; });
    return d;
  }

  /** Übernimmt gespeicherte Einstellungen; unbekannte oder ungültige Werte werden ignoriert. */
  function setDesign(design) {
    design = design || {};
    PBG.DESIGN_KEYS.forEach(function (k) {
      if (!(k in design)) return;
      var v = design[k], def = PBG.DEFAULTS[k];
      if (typeof def === "number") { v = Number(v); if (!isFinite(v)) return; }
      else if (typeof def === "boolean") v = !!v;
      else v = String(v);
      if (COLOR_KEYS.indexOf(k) >= 0 && !normalizeHex(v)) return;
      state[k] = v;
    });
    var range = { size: [35, 95], spacing: [-5, 50], textPos: [-90, 90], ringWidth: [8, 32], ringLength: [180, 350], ringRotation: [-90, 90], fade: [0, 70], opacity: [40, 100] };
    Object.keys(range).forEach(function (k) { state[k] = clamp(state[k], range[k][0], range[k][1]); });
    state.text = state.text.slice(0, 60);
    if (PBG.fontById(state.font).id !== state.font) state.font = PBG.DEFAULTS.font;
    activePreset = null;
    sanitizeForFree();
    syncControls();
    markPreset();
    requestRender();
  }

  PBG.editor = {
    getDesign: getDesign,
    setDesign: setDesign,
    /** Firmen-Logo setzen (HTMLImageElement oder null). */
    setLogo: function (img) { logo = img || null; requestRender(); },
    /** Team-Modus: Rahmen gesperrt → nur Foto & Export sichtbar. */
    setTeam: function (opts) {
      team.locked = !!opts.locked;
      team.company = opts.company || "";
      team.watermark = !!opts.watermark;
      ["presets", "text", "ring"].forEach(function (name) {
        var panel = document.querySelector('[data-panel="' + name + '"]');
        if (panel) panel.hidden = team.locked || name === "presets";
      });
      if (els.teamNote) {
        els.teamNote.hidden = !team.locked;
        els.teamNote.textContent = t("team.locked", { company: team.company });
      }
      requestRender();
    },
    on: function (type, fn) { listeners[type].push(fn); },
    render: requestRender
  };

  // ---------- Start ----------
  function initialPreset() {
    var params = new URLSearchParams(location.search);
    var key = params.get("vorlage") || body.dataset.preset || "jobsuche";
    var p = PBG.presetByKey(key) || PBG.PRESETS[0];
    if (p.premium && !unlocked()) {
      // Premium-Vorlage über Link geöffnet: Vorschau-Hinweis statt stiller Änderung
      setTimeout(function () { openUpgrade("preset", { name: PBG.loc(p.name) }); }, 400);
      p = PBG.PRESETS[0];
    }
    return p;
  }

  function init() {
    PBG.applyI18n();
    if (els.upgradeBuy) els.upgradeBuy.textContent = t("upgrade.buy", { price: (cfg.premium || {}).price || "" });

    buildFontOptions();
    buildIconOptions();
    buildEmojiRow();
    bindControls();
    bindUpload();
    bindCrop();
    bindExport();
    bindUpgradeDialog();
    bindShareDialog();

    if (mode === "public" || mode === "admin") {
      buildPresets();
      applyPreset(initialPreset());
    } else {
      var presetsPanel = document.querySelector('[data-panel="presets"]');
      if (presetsPanel) presetsPanel.hidden = true;
      syncControls();
    }
    updatePremiumUI();

    // Neu zeichnen, wenn sich Größe oder Pixeldichte ändern
    if (window.ResizeObserver) new ResizeObserver(requestRender).observe(els.preview);
    else window.addEventListener("resize", requestRender);
    if (window.matchMedia) {
      var mq = function () {
        var m = window.matchMedia("(resolution: " + (window.devicePixelRatio || 1) + "dppx)");
        var onChange = function () { requestRender(); renderPresetThumbs(); mq(); };
        if (m.addEventListener) m.addEventListener("change", onChange, { once: true });
      };
      mq();
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(requestRender);
    requestRender();
  }

  init();
})();
