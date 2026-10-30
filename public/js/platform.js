/*
 * Plattform-Dienste: Konfiguration, lokaler Speicher, Farbschema.
 * Kein Backend, keine Statistik – Fotos und Logos werden hier NIE verarbeitet oder versendet.
 */
window.PBG = window.PBG || {};

(function () {
  "use strict";

  var cfg = window.PBG_CONFIG || {};
  PBG.config = cfg;

  /** Pfad relativ zur Basis-URL (wichtig, wenn die Seite in einem Unterordner läuft). */
  PBG.url = function (path) { return (cfg.basePath || "") + path; };
  PBG.absUrl = function (path) { return (cfg.siteUrl || location.origin) + (cfg.basePath || "") + path; };

  PBG.storage = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* blockiert */ } },
    remove: function (k) { try { localStorage.removeItem(k); } catch (e) { /* blockiert */ } },
    /** Wie set, meldet aber den Grund eines Fehlers: null = gespeichert, "full" = Speicher voll, "blocked" = gesperrt. */
    trySet: function (k, v) {
      try { localStorage.setItem(k, v); return null; } catch (e) {
        var full = e && (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || e.code === 22 || e.code === 1014);
        return full ? "full" : "blocked";
      }
    }
  };

  // ---------- Farbschema-Schalter (alle Seiten) ----------
  function bindThemeSwitch() {
    var sw = document.getElementById("theme-switch");
    if (!sw) return;
    var buttons = Array.from(sw.querySelectorAll("button"));
    function apply(value) {
      if (value === "light" || value === "dark") document.documentElement.setAttribute("data-theme", value);
      else document.documentElement.removeAttribute("data-theme");
      buttons.forEach(function (b) {
        var on = b.dataset.themeValue === value;
        b.setAttribute("aria-checked", String(on));
        b.tabIndex = on ? 0 : -1;
      });
    }
    apply(PBG.storage.get("pbg-theme") || "auto");
    buttons.forEach(function (b, i) {
      b.addEventListener("click", function () {
        PBG.storage.set("pbg-theme", b.dataset.themeValue);
        apply(b.dataset.themeValue);
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
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindThemeSwitch);
  else bindThemeSwitch();
})();
