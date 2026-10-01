/*
 * Team-Link (/team/<slug>): lädt den Firmen-Rahmen und zählt Downloads.
 * Das Foto der Mitarbeitenden bleibt – wie immer – nur im Browser.
 */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var cfg = PBG.config || {};
  var status = $("team-status");

  function fail(msg) { status.hidden = false; status.textContent = msg; }

  function slugFromUrl() {
    var path = location.pathname.slice((cfg.basePath || "").length);
    var m = path.match(/^\/team\/([a-z0-9-]+)\/?$/i);
    if (m) return m[1].toLowerCase();
    return (new URLSearchParams(location.search).get("s") || "").toLowerCase();
  }

  function loadImage(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = "anonymous"; // nötig, damit der Canvas exportierbar bleibt
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = url;
    });
  }

  var slug = slugFromUrl();
  if (!/^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$/.test(slug)) { fail("Dieser Firmen-Link ist ungültig."); return; }
  if (!PBG.api.enabled) { fail("Firmen-Links sind auf dieser Installation noch nicht eingerichtet."); return; }

  PBG.api.rpc("get_team_template", { p_slug: slug }).then(function (rows) {
    var tpl = rows && rows[0];
    if (!tpl) { fail("Diesen Firmen-Link gibt es nicht (mehr). Bitte frag bei deinem Unternehmen nach dem aktuellen Link."); return; }
    if (!tpl.active) { fail("Dieser Firmen-Link ist noch nicht aktiviert. Bitte wende dich an " + tpl.company_name + "."); return; }

    var heading = "Profilbild-Rahmen von " + tpl.company_name;
    document.title = heading + " | " + cfg.appName;
    $("team-title").textContent = heading;

    PBG.editor.setDesign(tpl.settings || {});
    PBG.editor.setTeam({ locked: !!tpl.locked, company: tpl.company_name, watermark: false });
    if (tpl.logo_path) {
      loadImage(PBG.api.storageUrl("logos", tpl.logo_path)).then(PBG.editor.setLogo).catch(function () { /* ohne Logo weiter */ });
    }
    status.hidden = true;
    $("team-editor").hidden = false;
    PBG.editor.render();

    PBG.editor.on("download", function () {
      PBG.api.rpc("increment_template_download", { p_slug: slug }).catch(function () { /* Zähler ist nicht kritisch */ });
      PBG.track("Team-Download", { rahmen: slug });
    });
  }).catch(function () {
    fail("Der Rahmen konnte gerade nicht geladen werden. Bitte versuche es später erneut.");
  });
})();
