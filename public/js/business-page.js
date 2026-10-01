/* Kontaktformular auf „Für Unternehmen“. */
(function () {
  "use strict";
  var form = document.getElementById("contact-form");
  var status = document.getElementById("contact-status");
  if (!form) return;

  function set(msg, err) { status.textContent = msg; status.classList.toggle("error", !!err); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = {
      name: form.elements["name"].value.trim(),
      email: form.elements["email"].value.trim(),
      company: form.elements["company"].value.trim(),
      message: form.elements["message"].value.trim(),
      website: form.elements["website"].value // Honeypot
    };
    if (!data.name || !form.elements["email"].checkValidity() || !data.email || data.message.length < 5) {
      set("Bitte fülle Name, E-Mail und Nachricht aus.", true);
      return;
    }
    if (!PBG.api.enabled) { set("Das Formular ist noch nicht eingerichtet. Bitte schreib uns per E-Mail (siehe Impressum).", true); return; }
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    set("Wird gesendet …");
    PBG.api.call("contact", data).then(function () {
      form.reset();
      set("Danke! Wir melden uns in Kürze.");
      PBG.track("Firmen-Anfrage");
    }).catch(function () {
      set("Senden fehlgeschlagen. Bitte versuche es später erneut oder schreib uns per E-Mail.", true);
    }).finally(function () { btn.disabled = false; });
  });
})();
