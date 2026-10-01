/*
 * Admin-Bereich für Firmen: Login per Magic-Link, Firma anlegen, Paket buchen,
 * Firmen-Rahmen gestalten (mit dem normalen Editor), Logo hochladen, Zähler ansehen.
 * Gespeichert werden nur Rahmen-Einstellungen – niemals Fotos.
 */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var cfg = PBG.config || {};
  var LIMITS = { none: 1, starter: 1, team: 5 };
  var PLAN_NAMES = { none: "Kein Paket", starter: "Starter", team: "Team" };
  var SLUG_RE = /^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$/;
  var MAX_LOGO = 512 * 1024;

  var statusEl = $("admin-status");
  function status(msg, ok) {
    statusEl.hidden = !msg;
    statusEl.textContent = msg || "";
    statusEl.className = ok ? "team-note" : "notice";
  }
  function tplStatus(msg, err) {
    $("tpl-status").textContent = msg || "";
    $("tpl-status").classList.toggle("error", !!err);
  }

  if (!PBG.api.enabled || !window.supabase) {
    status("Der Admin-Bereich ist noch nicht eingerichtet: Bitte Supabase-URL und Anon-Key in config/site.json bzw. als Umgebungsvariablen setzen.");
    return;
  }

  var sb = window.supabase.createClient(cfg.supabase.url, cfg.supabase.anonKey, {
    // "implicit": Der Magic-Link funktioniert auch, wenn er in einem anderen Browser geöffnet wird
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit" }
  });

  var session = null, company = null, templates = [];
  var editing = null;      // aktuell bearbeiteter Rahmen
  var logo = { file: null, img: null, removed: false };

  function show(id, visible) { $(id).hidden = !visible; }

  function slugify(s) {
    return String(s).toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .normalize("NFKD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "firma";
  }

  function isActive(c) {
    return c.plan !== "none" && (!c.plan_expires_at || new Date(c.plan_expires_at) > new Date());
  }

  function teamUrl(slug) { return PBG.absUrl("/team/" + slug); }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return Promise.reject(new Error("clipboard"));
  }

  // ---------- Laden & Anzeigen ----------
  function loadCompany() {
    return sb.from("companies").select("*").maybeSingle().then(function (res) {
      if (res.error) throw res.error;
      company = res.data;
      if (!company) return [];
      return sb.from("company_templates").select("id,slug,title,settings,locked,logo_path,download_count,updated_at")
        .order("created_at").then(function (r) {
          if (r.error) throw r.error;
          templates = r.data || [];
        });
    });
  }

  function render() {
    show("login-card", !session);
    show("company-card", !!session && !company);
    show("dashboard", !!session && !!company);
    if (!session || !company) { closeEditor(); return; }

    $("company-title").textContent = company.name;
    var active = isActive(company);
    var badge = $("plan-badge");
    badge.textContent = PLAN_NAMES[company.plan] + (active ? " · aktiv" : "");
    badge.classList.toggle("active", active);
    $("plan-expiry").textContent = active && company.plan_expires_at
      ? (company.plan_status === "active" || company.plan_status === "trialing" ? "verlängert sich am " : "gültig bis ") +
        new Date(company.plan_expires_at).toLocaleDateString("de-DE")
      : company.plan_status === "past_due" ? "Zahlung offen – bitte Zahlungsmittel prüfen" : "";
    show("plan-actions", !active);
    show("portal-actions", !!company.stripe_customer_id);

    var list = $("tpl-list");
    list.innerHTML = "";
    templates.forEach(function (t) { list.appendChild(templateItem(t, active)); });
    if (!templates.length) {
      var li = document.createElement("li");
      li.className = "small muted";
      li.textContent = "Noch kein Rahmen angelegt.";
      list.appendChild(li);
    }
    var limit = LIMITS[company.plan] || 1;
    $("tpl-limit").textContent = templates.length + " von " + limit + " Rahmen" +
      (active ? "" : " · Ohne Paket kannst du einen Entwurf gestalten; der Link für Mitarbeitende wird mit dem Paket aktiviert.");
    $("new-template").disabled = templates.length >= limit;
  }

  function templateItem(t, active) {
    var li = document.createElement("li");
    li.className = "tpl-item";
    var info = document.createElement("div");
    var name = document.createElement("strong");
    name.textContent = t.title;
    var link = document.createElement("a");
    link.href = teamUrl(t.slug);
    link.target = "_blank";
    link.rel = "noopener";
    link.className = "small";
    link.textContent = teamUrl(t.slug).replace(/^https?:\/\//, "");
    var meta = document.createElement("span");
    meta.className = "small muted";
    meta.textContent = " · " + (t.locked ? "gesperrt" : "anpassbar") + (active ? "" : " · noch nicht aktiv");
    info.appendChild(name);
    info.appendChild(link);
    info.appendChild(meta);

    var stat = document.createElement("div");
    stat.innerHTML = '<span class="stat"></span> <span class="small muted">Bilder erstellt</span>';
    stat.querySelector(".stat").textContent = String(t.download_count);

    var actions = document.createElement("div");
    actions.className = "button-row";
    actions.style.marginTop = "0";
    [["Link kopieren", function (b) {
      copy(teamUrl(t.slug)).then(function () { b.textContent = "Kopiert!"; setTimeout(function () { b.textContent = "Link kopieren"; }, 1500); },
        function () { window.prompt("Link kopieren:", teamUrl(t.slug)); });
    }], ["Bearbeiten", function () { openEditor(t); }], ["Löschen", function () { removeTemplate(t); }]].forEach(function (a) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn btn-ghost";
      b.textContent = a[0];
      b.addEventListener("click", function () { a[1](b); });
      actions.appendChild(b);
    });

    li.appendChild(info);
    li.appendChild(stat);
    li.appendChild(actions);
    return li;
  }

  function refresh() {
    return loadCompany().then(render).catch(function (e) {
      console.error(e);
      status("Daten konnten nicht geladen werden. Bitte Seite neu laden.");
    });
  }

  // ---------- Rahmen bearbeiten ----------
  function loadImage(src, cors) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      if (cors) img.crossOrigin = "anonymous";
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  function openEditor(t) {
    var isNew = !t;
    var n = templates.length;
    editing = t || {
      id: null,
      title: "Firmen-Rahmen",
      slug: slugify(company.name) + (n ? "-" + (n + 1) : ""),
      locked: true,
      logo_path: null,
      settings: { text: "Wir stellen ein", ringColor: "#1a5ccc", ringColor2: "#00acc1", gradient: false, font: "Montserrat", uppercase: true }
    };
    logo = { file: null, img: null, removed: false };
    $("tpl-form-title").textContent = isNew ? "Neuer Firmen-Rahmen" : "Rahmen bearbeiten";
    $("tpl-title").value = editing.title;
    $("tpl-slug").value = editing.slug;
    $("tpl-locked").checked = editing.locked;
    $("tpl-logo").value = "";
    $("tpl-logo-pos").value = (editing.settings && editing.settings.logoPos) || "end";
    show("tpl-logo-remove", !!editing.logo_path);
    tplStatus("");
    show("tpl-form-card", true);
    show("admin-editor", true);
    PBG.editor.setDesign(editing.settings || {});
    PBG.editor.setLogo(null);
    if (editing.logo_path) {
      loadImage(PBG.api.storageUrl("logos", editing.logo_path), true).then(function (img) {
        logo.img = img;
        PBG.editor.setLogo(img);
      }).catch(function () { /* Logo nicht ladbar */ });
    }
    $("tpl-form-card").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeEditor() {
    editing = null;
    show("tpl-form-card", false);
    show("admin-editor", false);
  }

  $("tpl-logo").addEventListener("change", function () {
    var f = this.files && this.files[0];
    if (!f) return;
    if (!/^image\/(png|jpeg|webp)$/.test(f.type)) { tplStatus("Bitte PNG, JPG oder WebP verwenden.", true); this.value = ""; return; }
    if (f.size > MAX_LOGO) { tplStatus("Das Logo ist größer als 500 KB.", true); this.value = ""; return; }
    var url = URL.createObjectURL(f);
    loadImage(url).then(function (img) {
      logo = { file: f, img: img, removed: false };
      PBG.editor.setLogo(img);
      show("tpl-logo-remove", true);
      tplStatus("");
    }).catch(function () { tplStatus("Das Logo konnte nicht gelesen werden.", true); });
  });

  $("tpl-logo-remove").addEventListener("click", function () {
    logo = { file: null, img: null, removed: true };
    $("tpl-logo").value = "";
    PBG.editor.setLogo(null);
    show("tpl-logo-remove", false);
  });

  $("tpl-logo-pos").addEventListener("change", function () {
    PBG.editor.setDesign({ logoPos: this.value });
  });

  $("tpl-cancel").addEventListener("click", closeEditor);

  $("tpl-save").addEventListener("click", function () {
    if (!editing) return;
    var slug = $("tpl-slug").value.trim().toLowerCase();
    var title = $("tpl-title").value.trim() || "Firmen-Rahmen";
    if (!SLUG_RE.test(slug)) { tplStatus("Der Link darf nur Kleinbuchstaben, Ziffern und Bindestriche enthalten (3–48 Zeichen).", true); return; }

    var btn = this;
    btn.disabled = true;
    tplStatus("Wird gespeichert …");
    var oldLogo = editing.logo_path;
    var logoPath = logo.removed ? null : oldLogo;
    var upload = Promise.resolve();
    if (logo.file) {
      var ext = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" }[logo.file.type];
      logoPath = company.id + "/" + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())) + "." + ext;
      upload = sb.storage.from("logos").upload(logoPath, logo.file, { contentType: logo.file.type, upsert: false, cacheControl: "31536000" })
        .then(function (r) { if (r.error) throw r.error; });
    }

    var settings = PBG.editor.getDesign();
    settings.logoPos = $("tpl-logo-pos").value;
    var row = { slug: slug, title: title, locked: $("tpl-locked").checked, settings: settings, logo_path: logoPath };

    upload.then(function () {
      return editing.id
        ? sb.from("company_templates").update(row).eq("id", editing.id)
        : sb.from("company_templates").insert(Object.assign({ company_id: company.id }, row));
    }).then(function (r) {
      if (r.error) throw r.error;
      // Altes Logo aufräumen
      if (oldLogo && oldLogo !== logoPath) sb.storage.from("logos").remove([oldLogo]);
      tplStatus("Gespeichert.");
      closeEditor();
      return refresh();
    }).catch(function (e) {
      console.error(e);
      if (logo.file && logoPath) sb.storage.from("logos").remove([logoPath]);
      var msg = String((e && (e.message || e.code)) || "");
      if (e && e.code === "23505") tplStatus("Dieser Link ist schon vergeben. Bitte wähle einen anderen.", true);
      else if (/template-limit-reached/.test(msg)) tplStatus("Das Rahmen-Limit deines Pakets ist erreicht.", true);
      else tplStatus("Speichern fehlgeschlagen. Bitte versuche es erneut.", true);
    }).finally(function () { btn.disabled = false; });
  });

  function removeTemplate(t) {
    if (!window.confirm("Rahmen „" + t.title + "“ wirklich löschen? Der Link funktioniert danach nicht mehr.")) return;
    sb.from("company_templates").delete().eq("id", t.id).then(function (r) {
      if (r.error) throw r.error;
      if (t.logo_path) sb.storage.from("logos").remove([t.logo_path]);
      if (editing && editing.id === t.id) closeEditor();
      return refresh();
    }).catch(function () { status("Löschen fehlgeschlagen."); });
  }

  $("new-template").addEventListener("click", function () { openEditor(null); });

  // ---------- Paket & Abrechnung ----------
  document.querySelectorAll("[data-plan]").forEach(function (b) {
    b.addEventListener("click", function () {
      b.disabled = true;
      status("Weiterleitung zu Stripe …", true);
      PBG.track("Firmen-Checkout", { paket: b.dataset.plan });
      PBG.api.call("create-checkout", { product: b.dataset.plan, locale: "de" }, session.access_token).then(function (res) {
        if (res.url) location.href = res.url;
      }).catch(function () {
        status("Der Checkout ist gerade nicht möglich. Bitte später erneut versuchen.");
        b.disabled = false;
      });
    });
  });

  $("portal").addEventListener("click", function () {
    PBG.api.call("billing-portal", {}, session.access_token).then(function (res) {
      if (res.url) location.href = res.url;
    }).catch(function () { status("Das Kundenportal ist gerade nicht erreichbar."); });
  });

  // ---------- Anmeldung ----------
  $("login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var email = $("login-email").value.trim();
    sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: PBG.absUrl("/admin/"), shouldCreateUser: true } }).then(function (r) {
      if (r.error) throw r.error;
      status("Fast geschafft: Wir haben dir einen Anmelde-Link an " + email + " geschickt.", true);
    }).catch(function () { status("Der Link konnte nicht gesendet werden. Bitte prüfe die Adresse oder versuche es gleich noch einmal."); });
  });

  $("company-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("company-name").value.trim();
    if (name.length < 2) return;
    sb.from("companies").insert({ owner_id: session.user.id, name: name }).then(function (r) {
      if (r.error) throw r.error;
      return refresh();
    }).catch(function () { status("Die Firma konnte nicht angelegt werden."); });
  });

  $("logout").addEventListener("click", function () {
    sb.auth.signOut().then(function () { session = null; company = null; templates = []; render(); status(""); });
  });

  // ---------- Start ----------
  var params = new URLSearchParams(location.search);
  if (params.get("checkout") === "success") status("Danke für deine Buchung! Das Paket wird in wenigen Sekunden aktiviert.", true);
  if (params.get("checkout") === "cancel") status("Die Buchung wurde abgebrochen – es wurde nichts berechnet.");
  if (params.get("checkout") && history.replaceState) history.replaceState(null, "", location.pathname);

  sb.auth.onAuthStateChange(function (_event, s) {
    var changed = (s && s.user && s.user.id) !== (session && session.user && session.user.id);
    session = s;
    if (changed) refresh();
  });

  sb.auth.getSession().then(function (r) {
    session = r.data.session;
    return refresh();
  }).then(function () {
    // Nach der Zahlung kann der Webhook ein paar Sekunden brauchen
    if (params.get("checkout") === "success" && company && !isActive(company)) {
      var tries = 0;
      var poll = setInterval(function () {
        refresh().then(function () {
          if ((company && isActive(company)) || ++tries > 10) {
            clearInterval(poll);
            if (company && isActive(company)) status("Dein Paket ist aktiv. Die Firmen-Links funktionieren jetzt.", true);
          }
        });
      }, 3000);
    }
  });
})();
