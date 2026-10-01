window.PBG = window.PBG || {};

/*
 * Zeichnet das komplette Profilbild (Foto + Ring + Text) auf einen Canvas beliebiger Größe.
 * Alle Größen sind relativ zur Kantenlänge, damit Vorschau, Miniatur und Export
 * pixelgenau gleich aussehen.
 */
(function () {
  var DEG = Math.PI / 180;
  var MIN_TEXT_SCALE = 0.55; // weiter wird nicht verkleinert – stattdessen Warnung

  /** Zerlegt Text in sichtbare Zeichen (Emoji, Umlaute mit Kombinationszeichen …). */
  function splitGraphemes(str) {
    if (window.Intl && Intl.Segmenter) {
      var seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      return Array.from(seg.segment(str), function (s) { return s.segment; });
    }
    return Array.from(str);
  }

  function prepareText(state) {
    var text = (state.text || "").replace(/\s+/g, " ").trim();
    if (state.uppercase) text = text.toLocaleUpperCase(PBG.lang || "de");
    return text;
  }

  function fontString(state, px) {
    return (state.bold ? "700 " : "400 ") + px.toFixed(2) + 'px "' + state.font + '", system-ui, sans-serif';
  }

  /** Berechnet Ring- und Textgeometrie (wird auch für die Längenwarnung genutzt). */
  function layout(ctx, state, size) {
    var R = size / 2;
    var ringW = R * state.ringWidth / 100;
    var rText = R - ringW / 2;
    var arcLen = state.ringLength * DEG;
    var center = Math.PI / 2 + state.ringRotation * DEG; // 90° = unten, positiv = nach links
    var fade = Math.min(state.fade * DEG, arcLen / 2.5);

    var text = prepareText(state);
    var chars = splitGraphemes(text);
    var baseFont = ringW * state.size / 100;

    // Platz für den Text: Ring ohne die ausgeblendeten Enden, mit etwas Rand.
    var available = Math.max(arcLen - 2 * fade * 0.85 - 6 * DEG, 10 * DEG);

    function measure(fontPx) {
      ctx.font = fontString(state, fontPx);
      var spacing = fontPx * state.spacing / 100;
      var offsets = [];
      var widths = [];
      var x = 0;
      for (var i = 0; i < chars.length; i++) {
        // Breite über Präfixe messen, damit Kerning erhalten bleibt
        var prefix = ctx.measureText(chars.slice(0, i + 1).join("")).width;
        var w = ctx.measureText(chars[i]).width;
        var start = prefix - w;
        offsets.push(start + i * spacing);
        widths.push(w);
        x = prefix + i * spacing;
      }
      return { offsets: offsets, widths: widths, total: x, angle: x / rText };
    }

    var scale = 1;
    var m = measure(baseFont);
    if (chars.length && m.angle > available) {
      scale = Math.max(available / m.angle, MIN_TEXT_SCALE);
      m = measure(baseFont * scale);
    }

    return {
      R: R, ringW: ringW, rText: rText, arcLen: arcLen, center: center, fade: fade,
      chars: chars, fontPx: baseFont * scale, scale: scale, metrics: m,
      available: available, overflow: chars.length > 0 && m.angle > available + 0.5 * DEG
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
        var mix = state.gradient ? Math.abs(tm * 2 - 1) : 0;
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

  /** Setzt den Text Zeichen für Zeichen entlang des unteren Bogens (aufrecht lesbar). */
  function drawText(ctx, state, L, size) {
    if (!L.chars.length) return;
    var cx = size / 2, cy = size / 2;
    var m = L.metrics;
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

    for (var i = 0; i < L.chars.length; i++) {
      var mid = m.offsets[i] + m.widths[i] / 2;
      var theta = startAngle - mid / L.rText;
      ctx.save();
      ctx.translate(cx + L.rText * Math.cos(theta), cy + L.rText * Math.sin(theta));
      ctx.rotate(theta - Math.PI / 2);
      ctx.fillText(L.chars[i], 0, nudge);
      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Hauptfunktion. Gibt Infos zur Textskalierung zurück (für Warnhinweise).
   * @param {CanvasRenderingContext2D} ctx
   * @param {object} state  Einstellungen inkl. zoom/offsetX/offsetY
   * @param {CanvasImageSource|null} photo
   * @param {number} size   Kantenlänge in Gerätepixeln
   * @param {{background?: string}} opts
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
    var L = layout(lc, state, size);
    drawRing(lc, state, L, size);
    drawText(lc, state, L, size);

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
})();
