/* Chromata CRM — the quote editor (inside a project). Loaded after crm.js and BEFORE crm-views.js (which starts the app).

   The studio changes what is in a quote here: collection, team, options, travel / accommodation, the wedding planner's
   commission and the issue date. "Save" writes the studio's version into the project (quote_sel, quote_lines, total...),
   and the couple's proposal page asks the database for it each time it opens, so the SAME link shows the new quote by itself.

   The planner commission is private: it is spread inside the prices the couple sees (CQ.studioQuote), there is never a
   separate commission line, and the public database function never returns it. */
(function () {
  "use strict";
  var A = window.CRMApp, S = A.S, api = A.api, C = A.C, esc = A.esc, eur = A.eur, $ = A.$, $$ = A.$$, toast = A.toast, fail = A.fail, byId = A.byId, iso = A.iso;
  var Q = window.CQ;

  var dayOf = function (ts) { return ts ? String(ts).slice(0, 10) : ""; };
  /* The day the quote was issued: the editor's own date, else the day the website sent it. */
  function issuedISO(p) { return dayOf(p.quote_issued_at || p.quote_sent_at || p.created_at) || iso(new Date()); }
  function untilISO(p) { return Q.validUntil(issuedISO(p)); }
  function expired(p) { return untilISO(p) < iso(new Date()); }

  /* the choices currently in the quote: the studio's saved ones, else what the couple's link holds, else nothing yet */
  function startAnswers(p) {
    if (p.quote_sel) return Q.fromSel(p.quote_sel);
    if (p.proposal_url && p.proposal_url.indexOf("#") > -1) { var r = Q.parseProposal(p.proposal_url.slice(p.proposal_url.indexOf("#"))); if (r) return r.answers; }
    return Q.blank();
  }
  /* planner commission, shown back as an amount in euros */
  function startCommission(p) { return p.quote_commission == null ? "" : String(p.quote_commission); }

  function opts(list, cur, skipLabel) {
    return (skipLabel ? '<option value="">' + skipLabel + "</option>" : "") + list.map(function (x) {
      return '<option value="' + x.v + '"' + (String(cur) === x.v ? " selected" : "") + ">" + esc(x.label || x.name) + (x.price ? " · " + eur(x.price) : "") + "</option>";
    }).join("");
  }

  function html(p) {
    var a = startAnswers(p), linked = !!p.quote_ref;
    var team = Q.TEAM.map(function (t) {
      return '<label class="qe-chk"><input type="checkbox" data-team="' + t.v + '"' + (a.team.indexOf(t.v) > -1 ? " checked" : "") + "> " + esc(t.name) + " · " + eur(t.price) + "</label>";
    }).join("");
    var optRows = Q.OPTIONS.map(function (o) {
      var q = a.options[o.v] || 0;
      return '<div class="qe-opt"><label class="qe-chk"><input type="checkbox" data-opt="' + o.v + '"' + (q ? " checked" : "") + "> " + esc(o.name) + " · " + eur(o.price) + (o.unit ? " / " + o.unit : "") + "</label>" +
        (o.max ? '<input class="qe-qty" type="number" min="1" max="' + o.max + '" data-qty="' + o.v + '" value="' + (q || 1) + '" aria-label="Quantity"' + (q ? "" : " disabled") + ">" : "") + "</div>";
    }).join("");
    var hours = function (id, cur) { return '<select id="' + id + '">' + Q.EVENT_HOURS.map(function (h) { return '<option value="' + h.v + '"' + ((cur || "0") === h.v ? " selected" : "") + ">" + esc(h.label) + (h.price ? " · " + eur(h.price) : "") + "</option>"; }).join("") + "</select>"; };
    var cmt = startCommission(p), until = untilISO(p);
    return '<section class="cr-card" id="qe"><div class="sh"><h2>Quote editor</h2><span class="pill ' + (linked ? "signed" : "quote") + '">' + (linked ? "Linked to the couple’s page" : "No couple page yet") + "</span></div>" +
      '<p class="hint">' + (linked
        ? "Change anything here, then save: <strong>the couple’s link updates by itself</strong>, there is nothing to resend."
        : "Build the quote here. Saving also creates the couple’s private link (the wedding date and the couple’s email must be filled in below and saved first).") + "</p>" +
      '<div class="qe-grid"><div class="qe-form">' +
        '<label class="fld"><span>Wedding day collection</span><select id="qeColl">' + opts(Q.COLLECTIONS, a.wedding || "", "Choose a collection") + "</select></label>" +
        '<div class="fld"><span>Team</span>' + team + "</div>" +
        '<div class="grid2"><label class="fld"><span>Welcome event</span>' + hours("qeWelcome", a.welcome) + '</label><label class="fld"><span>Brunch / farewell party</span>' + hours("qeBrunch", a.brunch) + "</label></div>" +
        '<div class="fld"><span>Options</span>' + optRows + "</div>" +
        '<label class="qe-chk"><input type="checkbox" id="qeCreator"' + (a.creator === "1" ? " checked" : "") + "> Content creator, same day edit · " + eur(Q.CREATOR[1].price) + "</label>" +
        '<label class="fld"><span>Privacy</span><select id="qePrivacy">' + opts(Q.PRIVACY, a.privacy || "A") + "</select></label>" +
        '<div class="grid2"><label class="fld"><span>Travel / accommodation (€)</span><input id="qeTravel" type="number" min="0" step="any" value="' + (p.travel_fees == null ? "" : esc(p.travel_fees)) + '" placeholder="Empty = still to be confirmed"></label>' +
        '<div class="fld"><span>Planner commission <small>(private)</small></span><div class="inl"><input id="qeCmt" type="number" min="0" step="any" value="' + esc(cmt) + '" placeholder="0" aria-label="Planner commission"><select id="qeCmtU" aria-label="Commission unit" style="max-width:72px"><option value="eur">€</option><option value="pct">%</option></select></div></div></div>' +
        '<p class="hint" style="margin:-4px 0 0">Travel: once filled, the couple reads “Included” and the total contains it. Commission: added into the prices the couple sees, never shown as a line. A % applies to the quote including travel.</p>' +
        '<div class="grid2"><label class="fld"><span>Issued on</span><input id="qeIssued" type="date" value="' + esc(issuedISO(p)) + '"></label><div class="fld"><span>&nbsp;</span><button class="btn ghost" id="qeToday" type="button">Issue again today</button></div></div>' +
        '<p class="hint" id="qeValid" style="margin:-4px 0 0"></p>' +
      '</div><aside class="qe-prev" aria-live="polite"><h3>What the couple sees</h3><div id="qePrev"></div><div id="qePriv"></div></aside></div>' +
      '<div class="acts"><button class="btn" id="qeSave" type="button">Save the quote' + (linked ? " and update the link" : " and create the link") + "</button>" +
      (linked && p.proposal_url ? '<a class="btn ghost" target="_blank" rel="noopener" href="' + esc(p.proposal_url) + '">View the couple’s page</a>' : "") + "</div></section>";
  }

  /* what the form says right now */
  function read() {
    var a = Q.blank();
    a.wedding = $("#qeColl").value || null;
    a.team = $$("#qe [data-team]").filter(function (c) { return c.checked; }).map(function (c) { return c.getAttribute("data-team"); });
    a.welcome = $("#qeWelcome").value; a.brunch = $("#qeBrunch").value;
    $$("#qe [data-opt]").forEach(function (c) {
      var id = c.getAttribute("data-opt"), qty = $('#qe [data-qty="' + id + '"]');
      if (qty) qty.disabled = !c.checked;
      if (c.checked) a.options[id] = qty ? Math.max(1, Math.min(+qty.max || 1, +qty.value | 0 || 1)) : 1;
    });
    a.creator = $("#qeCreator").checked ? "1" : null;
    a.privacy = $("#qePrivacy").value;
    var travel = $("#qeTravel").value.trim() === "" ? null : +$("#qeTravel").value;
    var c = +$("#qeCmt").value || 0, base = Q.total(a);
    var amount = $("#qeCmtU").value === "pct" ? Math.round(c / 100 * (base + (travel || 0))) : Math.round(c);
    return { a: a, travel: travel, commission: Math.max(0, amount), quote: Q.studioQuote(a, { travel: travel, commission: Math.max(0, amount) }) };
  }

  function paint() {
    var r = read(), q = r.quote, el = $("#qePrev");
    if (!el) return;
    if (!r.a.wedding) { el.innerHTML = '<p class="hint">Choose a collection to start the quote.</p>'; $("#qePriv").innerHTML = ""; return; }
    el.innerHTML = '<div class="sumcard">' + q.rows.map(function (x) { return '<div class="srow"><span class="sl">' + esc(x.l) + '</span><span class="sr">' + (x.t === "tbc" ? "TBC" : x.t === "inc" ? "Included" : eur(x.p)) + "</span></div>"; }).join("") +
      '<div class="srow grand"><span class="sl">Total' + (q.travel !== null ? " · travel included" : "") + '</span><span class="sr">' + eur(q.total) + "</span></div></div>";
    $("#qePriv").innerHTML = '<div class="qe-priv"><strong>Private, never shown to the couple</strong>' +
      (q.commission > 0 ? "Planner commission: " + eur(q.commission) + "<br>Left for the studio: <b>" + eur(q.total - q.commission) + "</b>" : "No planner commission.") + "</div>";
    var d = $("#qeIssued").value, until = Q.validUntil(d);
    $("#qeValid").textContent = until ? "Valid for " + Q.VALID_DAYS + " days: until " + C.fmtDate(until) + (until < iso(new Date()) ? " (already expired: the couple cannot sign online until you issue it again)" : ".") : "";
  }

  function wire(p) {
    var root = $("#qe"); if (!root) return;
    root.addEventListener("input", paint); root.addEventListener("change", paint);
    $("#qeToday").onclick = function () { $("#qeIssued").value = iso(new Date()); paint(); };
    paint();
    $("#qeSave").onclick = function () { save(p); };
  }

  function nonce() {
    var a = new Uint8Array(12), s = "";
    crypto.getRandomValues(a);
    for (var i = 0; i < a.length; i++) s += "0123456789abcdefghijklmnopqrstuvwxyz"[a[i] % 36];
    return s;
  }

  function save(p) {
    var r = read(), q = r.quote, a = r.a;
    if (!a.wedding) { toast("Choose a collection first", true); return; }
    var coll = Q.by(Q.COLLECTIONS, a.wedding);
    var contracts = S.contracts.filter(function (c) { return c.project_id === p.id && (c.status === "sent" || c.status === "signed"); });
    if (contracts.length && !confirm("A contract was already " + (contracts.some(function (c) { return c.status === "signed"; }) ? "signed" : "sent") + " for this project. It keeps its own amount (" + C.money(contracts[0].amount) + "); only the quote changes. Save anyway?")) return;
    var d = $("#qeIssued").value;
    var row = { id: p.id, quote_sel: Q.selection(a), quote_lines: q.rows, quote_commission: q.commission > 0 ? q.commission : null, travel_fees: q.travel, total: q.total,
      collection: coll ? coll.name : p.collection, quote_verified: true };
    if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d !== issuedISO(p)) row.quote_issued_at = d + "T12:00:00Z";
    else if (!p.quote_issued_at) row.quote_issued_at = p.quote_sent_at || p.created_at || (d + "T12:00:00Z");
    if (!p.quote_ref) {
      /* a quote made by the studio: create the couple's private link (same format as the website quotation) */
      if (!/^\d{4}-\d{2}-\d{2}$/.test(p.wedding_date || "") || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(p.couple_email || "")) { toast("Fill in and save the wedding date and the couple’s email first", true); return; }
      var L = Q.blank(); Object.assign(L, a);
      L.names = p.couple_names || ""; L.email = p.couple_email; L.date = p.wedding_date; L.place = p.location || ""; L.venue = p.venue || "";
      L.role = p.planner_name ? "planner" : "couple"; L.planner = p.planner_name || ""; L.nonce = nonce();
      row.quote_ref = L.nonce; row.proposal_url = Q.proposalUrl(L, d ? new Date(d + "T12:00:00").getTime() : Date.now());
      if (p.status === "lead") { row.status = "quote"; row.quote_sent_at = new Date().toISOString(); }
    }
    var btn = $("#qeSave"); btn.disabled = true;
    api.saveProject(row).then(A.reload).then(function () {
      toast(p.quote_ref ? "Quote saved: the couple’s link is up to date" : "Quote saved: the couple’s link is ready (Copy proposal link)");
      A.render();
    }).catch(function (e) {
      btn.disabled = false;
      if (/column|schema cache/i.test(e && e.message || "")) toast("Run the updated docs/crm/schema.sql in Supabase first (new quote columns)", true); else fail(e);
    });
  }

  /* one line for the validation panel: issue date and validity */
  function validityLine(p) {
    var until = untilISO(p);
    return expired(p)
      ? '<p class="hint" style="color:var(--bad)"><strong>Expired on ' + esc(C.fmtDate(until)) + ".</strong> Quotes are valid " + Q.VALID_DAYS + " days: the couple can no longer sign online. Set a new issue date in the quote editor below to reopen it.</p>"
      : '<p class="hint">Issued ' + esc(C.fmtDate(issuedISO(p))) + " · valid until <strong>" + esc(C.fmtDate(until)) + "</strong> (" + Q.VALID_DAYS + " days).</p>";
  }

  A.quoteEditor = { html: html, wire: wire, validityLine: validityLine, expired: expired };
})();
