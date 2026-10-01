/* Premium-Seite: Kauf starten, Rückkehr von Stripe verarbeiten, Schlüssel/Magic-Link aktivieren. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var statusBox = $("premium-status");
  var params = new URLSearchParams(location.search);

  function status(html, ok) {
    statusBox.hidden = !html;
    statusBox.innerHTML = html || "";
    statusBox.className = ok ? "team-note" : "notice";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  function cleanUrl() {
    if (history.replaceState) history.replaceState(null, "", location.pathname);
  }

  function showActive() {
    var active = PBG.premium.active;
    $("buy-box").hidden = active;
    $("active-box").hidden = !active;
    if (active) {
      $("active-box").innerHTML = "Premium ist in diesem Browser aktiv. " +
        '<a href="' + PBG.url("/") + '">Zum Editor</a>' +
        (PBG.premium.key ? ' · <button type="button" class="text-button" id="logout">Hier abmelden</button>' : "");
      var lo = $("logout");
      if (lo) lo.onclick = function () { PBG.premium.clear(); showActive(); };
    }
  }

  var noBackend = "Der Kauf ist noch nicht eingerichtet (Backend nicht konfiguriert).";

  // Kauf
  $("buy-consent").addEventListener("change", function () { $("buy").disabled = !this.checked; });
  $("buy").addEventListener("click", function () {
    if (!PBG.api.enabled) { status(noBackend); return; }
    var btn = this;
    btn.disabled = true;
    status("Weiterleitung zu Stripe …", true);
    PBG.premium.checkout().catch(function () {
      status("Der Kauf ist gerade nicht möglich. Bitte versuche es später erneut.");
      btn.disabled = !$("buy-consent").checked;
    });
  });

  // Schlüssel eingeben
  $("key-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!PBG.api.enabled) { status(noBackend); return; }
    PBG.premium.activate($("key-input").value).then(function (ok) {
      status(ok ? "Premium ist aktiv. Viel Spaß! <a href=\"" + PBG.url("/") + "\">Zum Editor</a>" : "Dieser Lizenzschlüssel ist ungültig.", ok);
      showActive();
    }).catch(function () { status("Prüfung gerade nicht möglich. Bitte später erneut versuchen."); });
  });

  // Magic-Link erneut senden
  $("recover-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!PBG.api.enabled) { status(noBackend); return; }
    PBG.premium.recover($("recover-email").value).then(function () {
      status("Wenn zu dieser Adresse ein Kauf existiert, ist der Link in wenigen Minuten in deinem Postfach.", true);
    }).catch(function () { status("Bitte gib eine gültige E-Mail-Adresse ein."); });
  });

  // Rückkehr von Stripe
  var sessionId = params.get("session_id");
  if (sessionId && PBG.api.enabled) {
    status("Zahlung wird bestätigt …", true);
    var tries = 0;
    (function claim() {
      PBG.premium.claim(sessionId).then(function (res) {
        if (res.key) {
          cleanUrl();
          status("<strong>Danke! Premium ist aktiv.</strong> Dein Lizenzschlüssel: <code>" + escapeHtml(res.key) + "</code><br>" +
            "Wir haben ihn dir zusätzlich per E-Mail geschickt. <a href=\"" + PBG.url("/") + "\">Jetzt gestalten</a>", true);
          showActive();
        } else if (tries++ < 8) {
          setTimeout(claim, 2500); // z. B. Zahlung noch in Bearbeitung
        } else {
          status("Deine Zahlung wird noch bearbeitet. Du bekommst den Schlüssel per E-Mail, sobald sie bestätigt ist.");
        }
      }).catch(function () {
        status("Die Zahlung konnte nicht bestätigt werden. Prüfe dein E-Mail-Postfach oder kontaktiere uns.");
      });
    })();
  }

  // Magic-Link aus der E-Mail
  var key = params.get("key");
  if (key) {
    cleanUrl();
    if (!PBG.api.enabled) status(noBackend);
    else PBG.premium.activate(key).then(function (ok) {
      status(ok ? "<strong>Premium ist in diesem Browser aktiv.</strong> <a href=\"" + PBG.url("/") + "\">Zum Editor</a>" : "Dieser Link ist ungültig oder abgelaufen.", ok);
      showActive();
    }).catch(function () { status("Prüfung gerade nicht möglich. Bitte später erneut versuchen."); });
  }

  if (params.get("abgebrochen")) { cleanUrl(); status("Der Kauf wurde abgebrochen – es wurde nichts berechnet."); }

  window.addEventListener("pbg:premium", showActive);
  showActive();
})();
