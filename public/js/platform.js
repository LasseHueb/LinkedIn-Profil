/*
 * Plattform-Dienste: Konfiguration, cookielose Statistik, Backend-Aufrufe, Premium-Status.
 * Fotos werden hier NIE verarbeitet oder versendet.
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
    remove: function (k) { try { localStorage.removeItem(k); } catch (e) { /* blockiert */ } }
  };

  // ---------- Statistik (cookieless: Plausible oder Umami) ----------
  PBG.track = function (name, props) {
    try {
      if (window.plausible) window.plausible(name, props ? { props: props } : undefined);
      else if (window.umami && window.umami.track) window.umami.track(name, props);
    } catch (e) { /* Statistik darf nie die App stören */ }
  };

  // ---------- Backend (Supabase Edge Functions) ----------
  var sb = cfg.supabase || {};
  PBG.api = {
    enabled: !!(sb.url && sb.anonKey),
    call: function (fn, body, accessToken) {
      if (!PBG.api.enabled) return Promise.reject(new Error("backend-disabled"));
      return fetch(sb.url + "/functions/v1/" + fn, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: sb.anonKey,
          Authorization: "Bearer " + (accessToken || sb.anonKey)
        },
        body: JSON.stringify(body || {})
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok) {
            var err = new Error(data.error || "http-" + res.status);
            err.status = res.status;
            throw err;
          }
          return data;
        });
      });
    },
    /** Öffentliche URL einer Datei im Supabase Storage. */
    storageUrl: function (bucket, path) {
      return sb.url + "/storage/v1/object/public/" + bucket + "/" + String(path).split("/").map(encodeURIComponent).join("/");
    },
    /** Öffentliche Datenbankfunktion (RPC) aufrufen. */
    rpc: function (fn, args) {
      if (!PBG.api.enabled) return Promise.reject(new Error("backend-disabled"));
      return fetch(sb.url + "/rest/v1/rpc/" + fn, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: sb.anonKey, Authorization: "Bearer " + sb.anonKey },
        body: JSON.stringify(args || {})
      }).then(function (res) {
        if (!res.ok) throw new Error("http-" + res.status);
        return res.status === 204 ? null : res.json();
      });
    }
  };

  // ---------- Premium ----------
  var LICENSE_KEY = "pbg-license";
  var REVERIFY_MS = 7 * 24 * 3600 * 1000;

  function readLicense() {
    try { return JSON.parse(PBG.storage.get(LICENSE_KEY) || "null"); } catch (e) { return null; }
  }

  function isLocalDev() {
    return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  }

  var premium = {
    active: false,
    key: null,
    /** Lokale Testfreischaltung: http://localhost:8080/?premium=dev */
    dev: false,

    init: function () {
      var params = new URLSearchParams(location.search);
      if (isLocalDev() && params.get("premium") === "dev") PBG.storage.set("pbg-dev-premium", "1");
      if (isLocalDev() && params.get("premium") === "off") PBG.storage.remove("pbg-dev-premium");
      premium.dev = isLocalDev() && PBG.storage.get("pbg-dev-premium") === "1";

      var lic = readLicense();
      if (lic && lic.key && lic.valid) {
        premium.active = true;
        premium.key = lic.key;
        // Im Hintergrund regelmäßig prüfen (z. B. erstattete Käufe). Netzwerkfehler = Lizenz bleibt gültig.
        if (Date.now() - (lic.verifiedAt || 0) > REVERIFY_MS) {
          premium.verify(lic.key).catch(function () { /* offline: Kulanz */ });
        }
      }
      if (premium.dev) premium.active = true;
    },

    verify: function (key) {
      return PBG.api.call("license-verify", { key: key }).then(function (res) {
        if (res.valid) premium._store(key, res.email);
        else premium.clear();
        return !!res.valid;
      });
    },

    /** Lizenzschlüssel eingeben / per Magic-Link aktivieren. */
    activate: function (key) {
      key = String(key || "").trim().toUpperCase();
      if (!/^PR-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key)) return Promise.resolve(false);
      return premium.verify(key).then(function (ok) {
        if (ok) PBG.track("Premium aktiviert");
        return ok;
      });
    },

    /** Nach dem Stripe-Checkout: Lizenz anhand der Session abholen. */
    claim: function (sessionId) {
      return PBG.api.call("license-claim", { session_id: sessionId }).then(function (res) {
        if (res.key) {
          premium._store(res.key, res.email);
          PBG.track("Premium gekauft");
        }
        return res;
      });
    },

    checkout: function () {
      PBG.track("Upgrade Checkout");
      return PBG.api.call("create-checkout", { product: "premium", consent: true, locale: PBG.lang || "de" }).then(function (res) {
        if (res.url) location.href = res.url;
        return res;
      });
    },

    recover: function (email) {
      return PBG.api.call("license-recover", { email: email, origin: PBG.absUrl("") });
    },

    clear: function () {
      PBG.storage.remove(LICENSE_KEY);
      premium.active = premium.dev;
      premium.key = null;
      premium._emit();
    },

    _store: function (key, email) {
      PBG.storage.set(LICENSE_KEY, JSON.stringify({ key: key, email: email || "", valid: true, verifiedAt: Date.now() }));
      premium.active = true;
      premium.key = key;
      premium._emit();
    },

    _emit: function () {
      try { window.dispatchEvent(new CustomEvent("pbg:premium", { detail: { active: premium.active } })); } catch (e) { /* alt */ }
    }
  };

  PBG.premium = premium;
  premium.init();

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
