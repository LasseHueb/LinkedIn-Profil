window.PBG = window.PBG || {};

/*
 * Zeichnet das komplette Profilbild (Foto + Ring + Text) auf einen Canvas beliebiger Größe.
 * Alle Größen sind relativ zur Kantenlänge, damit Vorschau, Miniatur und Export
 * pixelgenau gleich aussehen.
 */
(function () {
  var DEG = Math.PI / 180;
  var MIN_TEXT_SCALE = 0.55; // weiter wird nicht verkleinert – stattdessen Warnung
  var KEEP_SYMBOLS = "©®™";

  /** Zerlegt Text in sichtbare Zeichen (Emoji, Umlaute mit Kombinationszeichen …). */
  function splitGraphemes(str) {
    if (window.Intl && Intl.Segmenter) {
      var seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      return Array.from(seg.segment(str), function (s) { return s.segment; });
    }
    return Array.from(str);
  }

  var EMOJI_RE = null;
  try { EMOJI_RE = new RegExp("[\\p{Extended_Pictographic}\\u{1F1E6}-\\u{1F1FF}\\u{1F3FB}-\\u{1F3FF}\\uFE0F\\u200D\\u20E3]", "gu"); } catch (e) { /* sehr alte Browser */ }

  function hasEmoji(str) {
    if (!EMOJI_RE) return false;
    EMOJI_RE.lastIndex = 0;
    var m;
    while ((m = EMOJI_RE.exec(str))) if (KEEP_SYMBOLS.indexOf(m[0]) < 0) return true;
    return false;
  }

  function stripEmoji(str) {
    if (!EMOJI_RE) return str;
    return str.replace(EMOJI_RE, function (c) { return KEEP_SYMBOLS.indexOf(c) >= 0 ? c : ""; });
  }

  function prepareText(state) {
    var text = state.text || "";
    if (state.noEmoji) text = stripEmoji(text);
    text = text.replace(/\s+/g, " ").trim();
    if (state.uppercase) text = text.toLocaleUpperCase(PBG.lang || "de");
    return text;
  }

  function weightFor(state) {
    var f = PBG.fontById ? PBG.fontById(state.font) : null;
    var weights = f ? f.weights : [400, 700];
    return state.bold && weights.indexOf(700) >= 0 ? 700 : 400;
  }

  function fontString(state, px) {
    return weightFor(state) + " " + px.toFixed(2) + 'px "' + state.font + '", system-ui, sans-serif';
  }

  /** Baut die Abfolge aus Zeichen, Symbolen und Logo. */
  function buildItems(state, text, hasLogo) {
    var items = splitGraphemes(text).map(function (c) { return { type: "char", value: c }; });
    var icon = state.icon && PBG.iconById ? PBG.iconById(state.icon) : null;
    if (icon && items.length) {
      if (state.iconPos === "start" || state.iconPos === "both") items.unshift({ type: "gap" }, { type: "icon", icon: icon });
      if (state.iconPos === "end" || state.iconPos === "both") items.push({ type: "gap" }, { type: "icon", icon: icon });
      // Lücke vor/nach dem Symbol an die richtige Seite schieben
      if (items[0].type === "gap") items.splice(0, 2, items[1], items[0]);
    }
    if (hasLogo) {
      if (state.logoPos === "start") items.unshift({ type: "logo" }, { type: "gap" });
      else items.push({ type: "gap" }, { type: "logo" });
    }
    return items;
  }

  /** Berechnet Ring- und Textgeometrie (wird auch für die Längenwarnung genutzt). */
  function layout(ctx, state, size, hasLogo) {
    var R = size / 2;
    var ringW = R * state.ringWidth / 100;
    var rText = R - ringW / 2;
    var arcLen = state.ringLength * DEG;
    var center = Math.PI / 2 + state.ringRotation * DEG; // 90° = unten, positiv = nach links
    var fade = Math.min(state.fade * DEG, arcLen / 2.5);

    var text = prepareText(state);
    var items = buildItems(state, text, hasLogo);
    var baseFont = ringW * state.size / 100;

    // Platz für den Text: Ring ohne die ausgeblendeten Enden, mit etwas Rand.
    var available = Math.max(arcLen - 2 * fade * 0.85 - 6 * DEG, 10 * DEG);

    function measure(fontPx) {
      ctx.font = fontString(state, fontPx);
      var spacing = fontPx * state.spacing / 100;
      var symbolW = fontPx * 0.95;
      var logoW = Math.min(ringW * 0.82, fontPx * 1.3);
      var out = [];
      var x = 0, end = 0;
      var run = "", runStart = 0, runIdx = 0;
      items.forEach(function (it) {
        var w, start;
        if (it.type === "char") {
          // Breite über Präfixe messen, damit Kerning erhalten bleibt
          run += it.value;
          var prefix = ctx.measureText(run).width;
          w = ctx.measureText(it.value).width;
          start = runStart + prefix - w + runIdx * spacing;
          runIdx++;
        } else {
          w = it.type === "icon" ? symbolW : it.type === "logo" ? logoW : fontPx * 0.25;
          start = x;
          run = ""; runIdx = 0;
          runStart = start + w + spacing;
        }
        out.push({ item: it, offset: start, width: w });
        end = start + w;
        x = end + spacing;
        if (it.type !== "char") runStart = x;
      });
      return { glyphs: out, total: end, angle: end / rText, symbolW: symbolW, logoW: logoW };
    }

    var scale = 1;
    var m = measure(baseFont);
    if (items.length && m.angle > available) {
      scale = Math.max(available / m.angle, MIN_TEXT_SCALE);
      m = measure(baseFont * scale);
    }

    return {
      R: R, ringW: ringW, rText: rText, arcLen: arcLen, center: center, fade: fade,
      fontPx: baseFont * scale, scale: scale, metrics: m, available: available,
      overflow: items.length > 0 && m.angle > available + 0.5 * DEG
    };
  }

  function drawPlaceholder(ctx, size) {
    var g = ctx.createLinearGradient(0, 0, 0, size);
    g.addColorStop(0, "#cfd8e3");
    g.addColorStop(1, "#9aa8b9");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.arc(size / 2, size * 0.4, size * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(size / 2, size * 0.92, size * 0.33, size * 0.3, 0, Math.PI, 0);
    ctx.fill();
  }

  /** Zeichnet das Foto im Kreis mit Zoom und Verschiebung. */
  function drawPhoto(ctx, state, photo, size) {
    if (!photo) { drawPlaceholder(ctx, size); return; }
    var iw = photo.width, ih = photo.height;
    var base = size / Math.min(iw, ih);
    var s = base * state.zoom;
    var dw = iw * s, dh = ih * s;
    var x = size / 2 - dw / 2 + state.offsetX * size;
    var y = size / 2 - dh / 2 + state.offsetY * size;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(photo, x, y, dw, dh);
  }

  function hexToRgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rgba(hex, a) {
    var c = hexToRgb(hex);
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }

  /** Normiert einen Winkel auf [0, 2π). */
  function norm(a) {
    a = a % (Math.PI * 2);
    return a < 0 ? a + Math.PI * 2 : a;
  }

  /**
   * Zeichnet den Ring. Die weichen Enden werden über einen kegelförmigen Verlauf
   * (Conic Gradient) als Alpha-Maske umgesetzt; ältere Browser fallen auf
   * viele schmale Segmente zurück.
   */
  function drawRing(ctx, state, L, size) {
    var cx = size / 2, cy = size / 2;
    var a0 = L.center - L.arcLen / 2;
    var a1 = L.center + L.arcLen / 2;
    var rOut = L.R + 1; // leicht überstehend, damit am Rand kein Foto-Saum bleibt
    var rIn = L.R - L.ringW;
    var opacity = state.opacity / 100;
    var frac = L.arcLen / (Math.PI * 2);
    var fadeFrac = L.fade / (Math.PI * 2);

    var layer = document.createElement("canvas");
    layer.width = layer.height = size;
    var lc = layer.getContext("2d");

    lc.beginPath();
    lc.arc(cx, cy, rOut, a0, a1, false);
    lc.arc(cx, cy, rIn, a1, a0, true);
    lc.closePath();

    var hasConic = typeof lc.createConicGradient === "function";

    if (hasConic) {
      // Farbe (einfarbig oder Verlauf entlang des Bogens; Verlauf läuft vom
      // linken Ende über unten zum rechten Ende, also gegen die Zeichenrichtung)
      var fill = lc.createConicGradient(norm(a0), cx, cy);
      if (state.gradient) {
        fill.addColorStop(0, state.ringColor2);
        fill.addColorStop(frac, state.ringColor);
        fill.addColorStop(Math.min(frac + 0.0001, 1), state.ringColor);
        fill.addColorStop(1, state.ringColor2);
      } else {
        fill.addColorStop(0, state.ringColor);
        fill.addColorStop(1, state.ringColor);
      }
      lc.fillStyle = fill;
      lc.fill();

      // Alpha-Maske für weiche Enden
      lc.globalCompositeOperation = "destination-in";
      var mask = lc.createConicGradient(norm(a0), cx, cy);
      if (fadeFrac > 0) {
        mask.addColorStop(0, "rgba(0,0,0,0)");
        // sanfte S-Kurve statt linearem Übergang
        for (var i = 1; i <= 6; i++) {
          var t = i / 6;
          var eased = t * t * (3 - 2 * t);
          mask.addColorStop(fadeFrac * t, "rgba(0,0,0," + (eased * opacity).toFixed(3) + ")");
          mask.addColorStop(frac - fadeFrac * t, "rgba(0,0,0," + (eased * opacity).toFixed(3) + ")");
        }
        mask.addColorStop(frac, "rgba(0,0,0,0)");
      } else {
        mask.addColorStop(0, "rgba(0,0,0," + opacity + ")");
        mask.addColorStop(frac, "rgba(0,0,0," + opacity + ")");
      }
      mask.addColorStop(Math.min(frac + 0.0001, 1), "rgba(0,0,0,0)");
      mask.addColorStop(1, "rgba(0,0,0,0)");
      lc.fillStyle = mask;
      lc.fillRect(0, 0, size, size);
    } else {
      // Fallback ohne Conic Gradient: in Segmenten zeichnen
      var steps = Math.max(60, Math.round(state.ringLength * 1.5));
      var c1 = hexToRgb(state.ringColor), c2 = hexToRgb(state.ringColor2);
      for (var s = 0; s < steps; s++) {
        var ta = s / steps, tb = (s + 1) / steps, tm = (ta + tb) / 2;
        var pos = tm * L.arcLen;
        var alpha = 1;
        if (L.fade > 0) {
          var e = Math.min(pos, L.arcLen - pos) / L.fade;
          if (e < 1) alpha = e * e * (3 - 2 * e);
        }
        var mix = state.gradient ? 1 - tm : 0;
        var col = [0, 1, 2].map(function (k) { return Math.round(c1[k] + (c2[k] - c1[k]) * mix); });
        var sa = a0 + ta * L.arcLen - 0.002, sb = a0 + tb * L.arcLen + 0.002;
        lc.beginPath();
        lc.arc(cx, cy, rOut, sa, sb, false);
        lc.arc(cx, cy, rIn, sb, sa, true);
        lc.closePath();
        lc.fillStyle = "rgba(" + col.join(",") + "," + (alpha * opacity).toFixed(3) + ")";
        lc.fill();
      }
    }

    ctx.drawImage(layer, 0, 0);
  }

  function drawIcon(ctx, icon, w, color) {
    var path = PBG.iconPath(icon);
    if (!path) return;
    var s = w / 24;
    ctx.save();
    ctx.scale(s, s);
    ctx.translate(-12, -12);
    if (icon.stroke) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke(path);
    } else {
      ctx.fillStyle = color;
      ctx.fill(path, icon.evenodd ? "evenodd" : "nonzero");
    }
    ctx.restore();
  }

  function drawLogo(ctx, logo, w) {
    var iw = logo.naturalWidth || logo.width, ih = logo.naturalHeight || logo.height;
    if (!iw || !ih) return;
    var s = Math.min(w / iw, w / ih);
    var dw = iw * s, dh = ih * s;
    ctx.drawImage(logo, -dw / 2, -dh / 2, dw, dh);
  }

  /** Setzt Text, Symbole und Logo entlang des unteren Bogens (aufrecht lesbar). */
  function drawText(ctx, state, L, size, logo) {
    var m = L.metrics;
    if (!m.glyphs.length) return;
    var cx = size / 2, cy = size / 2;
    var textCenter = L.center + state.textPos * DEG;
    // Unten läuft Lesrichtung (links → rechts) mit abnehmendem Winkel
    var startAngle = textCenter + m.angle / 2;

    ctx.save();
    ctx.font = fontString(state, L.fontPx);
    ctx.fillStyle = state.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Großbuchstaben optisch mittig setzen: "middle" sitzt etwas zu tief
    var nudge = state.uppercase ? L.fontPx * 0.04 : 0;

    m.glyphs.forEach(function (g) {
      if (g.item.type === "gap") return;
      var mid = g.offset + g.width / 2;
      var theta = startAngle - mid / L.rText;
      ctx.save();
      ctx.translate(cx + L.rText * Math.cos(theta), cy + L.rText * Math.sin(theta));
      ctx.rotate(theta - Math.PI / 2);
      if (g.item.type === "char") ctx.fillText(g.item.value, 0, nudge);
      else if (g.item.type === "icon") drawIcon(ctx, g.item.icon, g.width * 0.95, state.textColor);
      else if (g.item.type === "logo" && logo) drawLogo(ctx, logo, g.width);
      ctx.restore();
    });
    ctx.restore();
  }

  /** Dezenter Hinweis „Erstellt mit …“ am unteren Bildrand (innerhalb des Kreises). */
  function drawWatermark(ctx, text, L, size) {
    var px = Math.max(8, size * 0.024);
    ctx.save();
    ctx.font = "600 " + px.toFixed(2) + 'px "Nunito", system-ui, sans-serif';
    var w = ctx.measureText(text).width + px * 1.2;
    var h = px * 1.7;
    var x = size / 2 - w / 2;
    var y = size / 2 + (L.R - L.ringW) - h - size * 0.012;
    ctx.fillStyle = "rgba(0,0,0,0.38)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, h / 2); else ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size / 2, y + h / 2 + px * 0.05);
    ctx.restore();
  }

  /**
   * Hauptfunktion. Gibt Infos zur Textskalierung zurück (für Warnhinweise).
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} state  Einstellungen inkl. zoom/offsetX/offsetY
   * @param {CanvasImageSource|null} photo
   * @param {number} size   Kantenlänge in Gerätepixeln
   * @param {{background?: string, watermark?: string, logo?: CanvasImageSource}} opts
   */
  PBG.render = function (ctx, state, photo, size, opts) {
    opts = opts || {};
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, size, size);
    if (opts.background && opts.background !== "transparent") {
      ctx.fillStyle = opts.background;
      ctx.fillRect(0, 0, size, size);
    }

    // Foto + Ring auf eigener Ebene, dann rund ausschneiden
    var layer = document.createElement("canvas");
    layer.width = layer.height = size;
    var lc = layer.getContext("2d");
    drawPhoto(lc, state, photo, size);
    var L = layout(lc, state, size, !!opts.logo);
    drawRing(lc, state, L, size);
    drawText(lc, state, L, size, opts.logo);
    if (opts.watermark) drawWatermark(lc, opts.watermark, L, size);

    lc.globalCompositeOperation = "destination-in";
    lc.beginPath();
    lc.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    lc.fillStyle = "#000";
    lc.fill();

    ctx.drawImage(layer, 0, 0);
    ctx.restore();
    return { scale: L.scale, overflow: L.overflow };
  };

  PBG.color = { hexToRgb: hexToRgb, rgba: rgba };
  PBG.text = { hasEmoji: hasEmoji, stripEmoji: stripEmoji };
})();
