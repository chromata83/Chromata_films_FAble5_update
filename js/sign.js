/* Client signing page: sign.html#<secret token> */
(function () {
  "use strict";
  var C = window.CRMContract, root = document.getElementById("sg");
  var tk = decodeURIComponent((location.hash || "").replace(/^#/, ""));
  var api = tk.indexOf("demo-") === 0 ? CRMData.demo : CRMData.backend;

  function fmtDT(s) { try { return new Date(s).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" }); } catch (e) { return s || ""; } }
  function msg(h, p) { root.innerHTML = '<div class="sg-card sg-center"><h1>' + h + "</h1><p>" + p + "</p></div>"; }
  function studioSig(c) {
    return '<div class="sg-sigs"><div><span class="sg-cap">For Chromata Films SARL</span>' +
      (c.studio_signature ? '<img class="sg-sigimg" alt="Chromata Films signature" src="' + C.esc(c.studio_signature) + '">' : '<div class="sg-sigimg sg-blank"></div>') + "</div></div>";
  }

  if (!tk || tk.length < 16) { msg("Link not valid", "This signing link is incomplete. Please use the link from your email, or write to us."); return; }

  api.publicContract(tk).then(function (c) {
    if (!c) { msg("Link not valid", "We could not find this agreement. It may not have been sent yet, or the link is incorrect. Please write to us and we will send a new one."); return; }
    var head = '<div class="sg-card"><p class="sg-kicker">Wedding film agreement</p><h1>' + C.esc(c.couple_names) + "</h1>" +
      '<p class="sg-meta">' + C.esc(C.fmtDate(c.wedding_date)) + (c.venue ? " · " + C.esc(c.venue) : "") + (c.location ? ", " + C.esc(c.location) : "") + "</p></div>";

    if (c.status === "signed") {
      root.innerHTML = head + '<div class="sg-card sg-doc"><div class="sg-title">' + C.esc(c.title) + "</div>" + C.render(c.signed_body || c.body) + studioSig(c) +
        '<div class="sg-sigs"><div><span class="sg-cap">THE CLIENT</span><img class="sg-sigimg" alt="Client signature" src="' + C.esc(c.signature || "") + '"></div></div></div>' +
        '<div class="sg-card sg-done"><div class="sg-check">&#10003;</div><h2>Signed. Thank you.</h2>' +
        "<p>Signed by <strong>" + C.esc(c.signed_name) + "</strong> on " + C.esc(fmtDT(c.signed_at)) + ". The studio has been informed and your date is now confirmed. Payment details are in clause 13 of the agreement.</p>" +
        '<button class="sg-btn sg-btn--line" type="button" onclick="window.print()">Save or print a copy</button></div>';
      return;
    }

    var list = C.countries(), country = list.length
      ? '<select id="sgCountry" required><option value="">Select…</option>' + list.map(function (n) { return "<option>" + C.esc(n) + "</option>"; }).join("") + "</select>"
      : '<input id="sgCountry" type="text" autocomplete="country-name" maxlength="80" required>';

    root.innerHTML = head + '<div class="sg-card sg-doc"><div class="sg-title">' + C.esc(c.title) + "</div>" + C.render(c.body) + "</div>" +
      '<form class="sg-card sg-form" id="sgForm" novalidate><h2>THE CLIENT</h2>' +
      '<label class="sg-fld"><span>Full name(s)</span><input id="sgName" type="text" autocomplete="name" maxlength="160" placeholder="Emma Laurent &amp; James Smith" value="' + C.esc(c.couple_names || "") + '" required></label>' +
      '<label class="sg-fld"><span>Email</span><input id="sgEmail" type="email" autocomplete="email" maxlength="160" placeholder="you@email.com" value="' + C.esc(c.couple_email || "") + '" required></label>' +
      '<label class="sg-fld"><span>Address</span><textarea id="sgAddr" rows="3" autocomplete="street-address" maxlength="300" placeholder="Street, postcode, city" required></textarea></label>' +
      '<label class="sg-fld"><span>Country of residence</span>' + country + "</label>" +
      studioSig(c) +
      '<div class="sg-fld"><span>Your signature <button type="button" class="sg-link" id="sgClear">Clear</button></span><canvas id="sgPad" class="sg-pad" aria-label="Draw your signature here"></canvas><small>Draw with your finger, a pen or the mouse.</small></div>' +
      '<label class="sg-check-row"><input type="checkbox" id="sgOk"><span>I have read this agreement and accept it. I understand that my typed details and drawn signature, with the date and time, count as my electronic signature.</span></label>' +
      '<p class="sg-err" id="sgErr" role="alert"></p>' +
      '<button class="sg-btn" id="sgGo" type="submit" disabled>Sign the agreement</button></form>';

    var $ = function (s) { return document.getElementById(s); };
    var go = $("sgGo"), err = $("sgErr");
    var pad = C.signaturePad($("sgPad"), check);
    function info() { return { names: $("sgName").value, email: $("sgEmail").value, address: $("sgAddr").value, country: $("sgCountry").value }; }
    function check() {
      var i = info();
      go.disabled = !(i.names.trim().length >= 2 && /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(i.email.trim()) && i.address.trim().length >= 5 && i.country.trim().length >= 2 && $("sgOk").checked && !pad.isEmpty());
    }
    ["sgName", "sgEmail", "sgAddr", "sgCountry"].forEach(function (id) { $(id).addEventListener("input", check); $(id).addEventListener("change", check); });
    $("sgOk").addEventListener("change", check);
    $("sgClear").addEventListener("click", function () { pad.clear(); });
    $("sgForm").addEventListener("submit", function (e) {
      e.preventDefault(); if (go.disabled) return;
      go.disabled = true; go.textContent = "Signing…"; err.textContent = "";
      api.sign(tk, info(), pad.png(), navigator.userAgent).then(function () { location.reload(); })
        .catch(function (x) { err.textContent = "We could not record your signature: " + x.message + ". Please try again or write to us."; go.textContent = "Sign the agreement"; check(); });
    });
    check();
  }).catch(function () { msg("Something went wrong", "We could not load the agreement. Please check your connection and try again."); });
})();
