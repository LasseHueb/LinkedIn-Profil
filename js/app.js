/* Profilbild-Banner-Generator – UI-Logik. Alles läuft lokal im Browser. */
(function () {
  "use strict";

  var EXPORT_SIZE = 1080;
  var MAX_PHOTO_SIDE = 3200;   // größere Fotos werden beim Laden verkleinert (Speicher auf Mobilgeräten)
  var MAX_ZOOM = 4;
  var DESIGN_KEYS = ["font", "size", "bold", "uppercase", "spacing", "textPos", "textColor", "ringColor",
    "ringColor2", "gradient", "ringWidth", "ringLength", "ringRotation", "fade", "opacity"];

  var $ = function (id) { return document.getElementById(id); };
  var t = PBG.t;

  // ---------- Zustand ----------
  var state = Object.assign({}, PBG.DEFAULTS, { zoom: 1, offsetX: 0, offsetY: 0 });
  var photo = null;          // verkleinerter Canvas mit dem Foto
  var photoName = "";
  var activePreset = null;
  var lastInfo = { scale: 1, overflow: false };

  var els = {
    preview: $("preview"), stage: $("stage"), mini: $("mini"), miniXs: $("mini-xs"),
    fileInput: $("file-input"), dropzone: $("dropzone"), uploadStatus: $("upload-status"),
    zoom: $("zoom"), zoomOut: $("zoom-out"), resetCrop: $("reset-crop"), removePhoto: $("remove-photo"),
    presets: $("presets"), text: $("text"), font: $("font"), bold: $("bold"), uppercase: $("uppercase"),
    gradient: $("gradient"), ringColor2Field: $("ringColor2-field"),
    textWarning: $("text-warning"), contrastWarning: $("contrast-warning"),
    download: $("download"), share: $("share"), exportStatus: $("export-status"),
    langSelect: $("lang-select"), themeSwitch: $("theme-switch")
  };

  var RANGE_KEYS = ["size", "spacing", "textPos", "ringWidth", "ringLength", "ringRotation", "fade", "opacity"];
  var COLOR_KEYS = ["textColor", "ringColor", "ringColor2"];

  // ---------- Hilfsfunktionen ----------
  function storageGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function storageSet(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* privat/blockiert */ } }

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
    el.textContent = msg || "";
    el.classList.toggle("error", !!isError);
  }

  // ---------- Schriften ----------
  var fontPromises = {};
  var fontsLoaded = {};
  function fontKey(s) { return (s.bold ? "700 " : "400 ") + s.font; }
  function ensureFont(s) {
    var key = fontKey(s);
    if (!fontPromises[key]) {
      var p = document.fonts && document.fonts.load
        ? document.fonts.load((s.bold ? "700" : "400") + ' 40px "' + s.font + '"', "ABCÄÖÜ abc").catch(function () {})
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

  function renderAll() {
    var size = sizeCanvas(els.preview);
    lastInfo = PBG.render(els.preview.getContext("2d"), state, photo, size);
    [els.mini, els.miniXs].forEach(function (c) {
      var s = sizeCanvas(c);
      PBG.render(c.getContext("2d"), state, photo, s);
    });
    updateWarnings();
    els.preview.setAttribute("aria-label", t("preview.canvasLabel", { text: state.text || "–" }));
  }

  function updateWarnings() {
    var msg = "";
    if (lastInfo.overflow) msg = t("text.tooLong");
    else if (lastInfo.scale < 0.995) msg = t("text.shrunk", { percent: Math.round(lastInfo.scale * 100) });
    els.textWarning.textContent = msg;
    els.textWarning.hidden = !msg;

    var ratio = contrast(state.textColor, state.ringColor);
    if (state.gradient) ratio = Math.min(ratio, contrast(state.textColor, state.ringColor2));
    var low = ratio < 3 && !!state.text;
    els.contrastWarning.textContent = low ? t("text.lowContrast", { ratio: ratio.toFixed(1).replace(".", PBG.lang === "de" ? "," : ".") }) : "";
    els.contrastWarning.hidden = !low;
  }

  // ---------- Formular <-> Zustand ----------
  function syncControls() {
    els.text.value = state.text;
    els.font.value = state.font;
    els.bold.checked = state.bold;
    els.uppercase.checked = state.uppercase;
    els.gradient.checked = state.gradient;
    els.ringColor2Field.hidden = !state.gradient;
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
    requestRender();
  }

  function bindControls() {
    els.text.addEventListener("input", function () { state.text = els.text.value; changed(); });

    PBG.FONTS.forEach(function (f) {
      var o = document.createElement("option");
      o.value = f.id;
      o.textContent = f.label;
      o.style.fontFamily = '"' + f.id + '"';
      els.font.appendChild(o);
    });
    els.font.addEventListener("change", function () { state.font = els.font.value; changed(); });

    ["bold", "uppercase"].forEach(function (k) {
      els[k].addEventListener("change", function () { state[k] = els[k].checked; changed(); });
    });
    els.gradient.addEventListener("change", function () {
      state.gradient = els.gradient.checked;
      els.ringColor2Field.hidden = !state.gradient;
      changed();
    });

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
    els.presets.innerHTML = "";
    PBG.PRESETS.forEach(function (p) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "preset";
      btn.dataset.key = p.key;
      btn.setAttribute("aria-pressed", "false");
      var c = document.createElement("canvas");
      c.setAttribute("aria-hidden", "true");
      var label = document.createElement("span");
      label.textContent = t("preset." + p.key);
      btn.appendChild(c);
      btn.appendChild(label);
      btn.addEventListener("click", function () { applyPreset(p); });
      els.presets.appendChild(btn);
    });
    renderPresetThumbs();
    markPreset();
  }

  function presetState(p) {
    var s = {};
    DESIGN_KEYS.forEach(function (k) { s[k] = PBG.DEFAULTS[k]; });
    Object.assign(s, p.values, { text: t("preset." + p.key + ".text"), zoom: 1, offsetX: 0, offsetY: 0 });
    return s;
  }

  function renderPresetThumbs() {
    var btns = els.presets.querySelectorAll(".preset");
    PBG.PRESETS.forEach(function (p, i) {
      var c = btns[i].querySelector("canvas");
      c.style.width = c.style.height = "56px";
      var size = Math.round(56 * Math.min(window.devicePixelRatio || 1, 3));
      c.width = c.height = size;
      var s = presetState(p);
      ensureFont(s).then(function () {
        PBG.render(c.getContext("2d"), s, null, size);
      });
    });
  }

  function applyPreset(p) {
    var keep = { zoom: state.zoom, offsetX: state.offsetX, offsetY: state.offsetY, bg: state.bg };
    Object.assign(state, presetState(p), keep);
    activePreset = p.key;
    syncControls();
    markPreset();
    requestRender();
  }

  function markPreset() {
    els.presets.querySelectorAll(".preset").forEach(function (b) {
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
        s.src = "vendor/heic2any.min.js"; // lokal ausgeliefert, nur bei Bedarf geladen
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
      return { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5, w: r.width };
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
  function exportCanvas() {
    var c = document.createElement("canvas");
    c.width = c.height = EXPORT_SIZE;
    PBG.render(c.getContext("2d"), state, photo, EXPORT_SIZE, { background: state.bg });
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
      }).finally(function () {
        els.download.disabled = false;
      });
    });

    // Teilen nur anbieten, wo Dateien geteilt werden können (vor allem Mobilgeräte)
    var canShareFiles = false;
    try {
      canShareFiles = !!(navigator.share && navigator.canShare &&
        navigator.canShare({ files: [new File([new Blob()], "test.png", { type: "image/png" })] }));
    } catch (e) { canShareFiles = false; }
    var isTouch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    els.share.hidden = !(canShareFiles && isTouch);

    els.share.addEventListener("click", function () {
      // Synchron erzeugen, damit die Nutzergeste für navigator.share erhalten bleibt
      var blob = dataUrlToBlob(exportCanvas().toDataURL("image/png"));
      var file = new File([blob], t("export.filename"), { type: "image/png" });
      navigator.share({ files: [file], title: t("app.title") }).catch(function (err) {
        if (err && err.name === "AbortError") return;
        setStatus(els.exportStatus, t("export.shareError"), true);
      });
    });
  }

  // ---------- Farbschema & Sprache ----------
  function applyTheme(value) {
    if (value === "light" || value === "dark") document.documentElement.setAttribute("data-theme", value);
    else document.documentElement.removeAttribute("data-theme");
    els.themeSwitch.querySelectorAll("button").forEach(function (b) {
      var on = b.dataset.themeValue === value;
      b.setAttribute("aria-checked", String(on));
      b.tabIndex = on ? 0 : -1;
    });
  }

  function bindTheme() {
    var current = storageGet("pbg-theme") || "auto";
    applyTheme(current);
    var buttons = Array.from(els.themeSwitch.querySelectorAll("button"));
    buttons.forEach(function (b, i) {
      b.addEventListener("click", function () {
        storageSet("pbg-theme", b.dataset.themeValue);
        applyTheme(b.dataset.themeValue);
      });
      b.addEventListener("keydown", function (e) {
        var dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        var next = buttons[(i + dir + buttons.length) % buttons.length];
        next.click();
        next.focus();
      });
    });
  }

  function setLanguage(lang) {
    var prevPresetText = activePreset ? t("preset." + activePreset + ".text") : null;
    var defaultText = t("preset.jobs.text");
    PBG.lang = PBG.I18N[lang] ? lang : "de";
    storageSet("pbg-lang", PBG.lang);
    els.langSelect.value = PBG.lang;
    PBG.applyI18n();
    // Vorlagentext mitübersetzen, solange der Nutzer ihn nicht verändert hat
    if (activePreset && state.text === prevPresetText) state.text = t("preset." + activePreset + ".text");
    else if (state.text === defaultText) state.text = t("preset.jobs.text");
    els.text.value = state.text;
    buildPresets();
    if (photoName) setStatus(els.uploadStatus, t("upload.loaded", { name: photoName }));
    else setStatus(els.uploadStatus, "");
    setStatus(els.exportStatus, "");
    requestRender();
  }

  function detectLanguage() {
    var saved = storageGet("pbg-lang");
    if (saved && PBG.I18N[saved]) return saved;
    var nav = (navigator.language || "de").slice(0, 2).toLowerCase();
    return PBG.I18N[nav] ? nav : "de";
  }

  // ---------- Start ----------
  function init() {
    PBG.lang = detectLanguage();
    PBG.applyI18n();

    bindControls();
    bindUpload();
    bindCrop();
    bindExport();
    bindTheme();
    els.langSelect.value = PBG.lang;
    els.langSelect.addEventListener("change", function () { setLanguage(els.langSelect.value); });

    buildPresets();
    applyPreset(PBG.PRESETS[0]);

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
  }

  init();
})();
