/* Chromata CRM — back office core: state, login (+2FA), dashboard, calendar, projects, contracts, payments.
   Contacts, tracker, accounting and settings live in crm-views.js (they register themselves on CRMApp.views). */
(function () {
  "use strict";
  var C = window.CRMContract, T = window.CRMTools, D = window.CRMData, api = D.backend;
  var esc = C.esc, eur = C.eur;
  var app = document.getElementById("app");
  var S = { projects: [], contracts: [], payments: [], contacts: [], expenses: [], settings: {}, user: null, mfa: null, month: new Date(), q: "", filter: "all", editingContract: null };

  /* project pipeline: lead > quote sent > awaiting signature > awaiting payment > booked > delivered (or declined) */
  var ST = {
    lead: { label: "Lead", g: "quote", cal: "quote" }, quote: { label: "Quote sent", g: "quote", cal: "quote" }, signature: { label: "Awaiting signature", g: "quote", cal: "quote" },
    payment: { label: "Awaiting payment", g: "pay", cal: "signed" }, booked: { label: "Booked", g: "signed", cal: "signed" }, delivered: { label: "Delivered", g: "signed", cal: "signed" },
    declined: { label: "Declined", g: "declined", cal: "declined" }
  };
  var CSTATUS = { draft: "Draft", sent: "Sent, awaiting signature", signed: "Signed" };
  var FOLLOWUP_DAYS = 5;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function iso(d) { var m = d.getMonth() + 1, x = d.getDate(); return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (x < 10 ? "0" : "") + x; }
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function toast(t, bad) { var el = document.createElement("div"); el.className = "cr-toast" + (bad ? " bad" : ""); el.textContent = t; document.body.appendChild(el); setTimeout(function () { el.remove(); }, 3200); }
  function fail(e) { toast(e && e.message ? e.message : "Something went wrong", true); }
  function pill(st) { var s = ST[st] || ST.lead; return '<span class="pill ' + s.g + '">' + s.label + "</span>"; }
  var isSigned = function (st) { return st === "payment" || st === "booked" || st === "delivered"; };
  function signLink(c) { return location.origin + location.pathname.replace(/[^/]*$/, "") + "sign.html#" + c.token; }
  function daysAgo(ts) { return ts ? Math.floor((Date.now() - new Date(ts).getTime()) / 864e5) : 0; }

  function reload() {
    return Promise.all([api.projects(), api.contracts(), api.payments(), api.settings(), api.contacts(), api.expenses()]).then(function (r) {
      S.projects = r[0]; S.contracts = r[1]; S.payments = r[2]; S.settings = r[3] || {}; S.contacts = r[4]; S.expenses = r[5];
    });
  }

  /* ---------------- login / 2FA ---------------- */
  function loginView() {
    var demo = api.kind === "demo";
    app.innerHTML = '<div class="cr-login"><form id="lg" class="cr-card"><img src="assets/img/logo-mark.png" alt="" width="34" height="68"><h1>Back office</h1>' +
      (demo ? '<p class="note"><strong>Demo mode.</strong> The database is not connected yet, so everything you enter stays in this browser only. See <code>docs/crm/SETUP.md</code> to connect it.</p>'
            : '<label class="fld"><span>Email</span><input id="lgE" type="email" autocomplete="username" required></label><label class="fld"><span>Password</span><input id="lgP" type="password" autocomplete="current-password" required></label>') +
      '<p class="err" id="lgErr" role="alert"></p><button class="btn" type="submit">' + (demo ? "Open the demo" : "Sign in") + "</button></form></div>";
    $("#lg").addEventListener("submit", function (e) {
      e.preventDefault();
      api.signIn(demo ? "" : $("#lgE").value.trim(), demo ? "" : $("#lgP").value).then(boot).catch(function (x) { $("#lgErr").textContent = x.message; });
    });
  }
  function mfaView() {
    app.innerHTML = '<div class="cr-login"><form id="mf" class="cr-card"><img src="assets/img/logo-mark.png" alt="" width="34" height="68"><h1>Two-step check</h1>' +
      '<p class="hint">Open your authenticator app and type the 6-digit code for Chromata.</p><label class="fld"><span>Code</span><input id="mfC" inputmode="numeric" autocomplete="one-time-code" maxlength="8" required autofocus></label>' +
      '<p class="err" id="mfErr" role="alert"></p><button class="btn" type="submit">Verify</button><button class="btn ghost" id="mfOut" type="button">Sign out</button></form></div>';
    $("#mfOut").onclick = function () { api.signOut().then(boot); };
    $("#mf").addEventListener("submit", function (e) {
      e.preventDefault();
      api.mfa.challenge($("#mfC").value).then(boot).catch(function (x) { $("#mfErr").textContent = x.message; });
    });
  }

  /* ---------------- shell ---------------- */
  var NAV = [["dashboard", "Dashboard"], ["calendar", "Calendar"], ["projects", "Projects"], ["tracker", "Tracker"], ["contacts", "Contacts"], ["contracts", "Contracts"], ["accounting", "Accounting"], ["settings", "Settings"]];
  function shell(active, inner) {
    var nav = NAV.map(function (n) { return '<a href="#/' + n[0] + '" class="' + (active === n[0] ? "on" : "") + '">' + n[1] + "</a>"; }).join("");
    app.innerHTML = '<div class="cr-shell"><aside class="cr-side"><div class="brand"><img src="assets/img/logo-mark.png" alt="" width="22" height="44"><span>Chromata<br>back office</span></div><nav>' + nav +
      '</nav><div class="who"><span>' + esc(S.user.email) + '</span><button id="out" type="button">Sign out</button></div></aside><main class="cr-main">' +
      (api.kind === "demo" ? '<div class="demo-bar">Demo mode: data stays in this browser only.</div>' : "") + inner + "</main></div>";
    $("#out").addEventListener("click", function () { api.signOut().then(boot); });
  }

  /* ---------------- dashboard ---------------- */
  function dashboard() {
    var today = iso(new Date()), P = S.projects, year = String(new Date().getFullYear());
    var open = P.filter(function (p) { return ST[p.status] && ST[p.status].g === "quote"; }).length;
    var booked = P.filter(function (p) { return isSigned(p.status); });
    var val = booked.reduce(function (s, p) { return s + (+p.total || 0); }, 0);
    var upcoming = P.filter(function (p) { return p.wedding_date && p.wedding_date >= today && p.status !== "declined"; }).sort(function (a, b) { return a.wedding_date < b.wedding_date ? -1 : 1; }).slice(0, 8);
    var row = function (href, d, t, sub, right) { return '<a class="row" href="' + href + '"><span class="d">' + d + '</span><span class="t">' + esc(t) + "<small>" + esc(sub || "") + "</small></span>" + right + "</a>"; };
    var list = upcoming.length ? upcoming.map(function (p) { return row("#/project/" + p.id, esc(C.fmtDate(p.wedding_date)), p.couple_names, p.venue || p.location, pill(p.status)); }).join("") : '<p class="empty">No upcoming dates yet.</p>';
    var waiting = S.contracts.filter(function (c) { return c.status === "sent"; });
    var wl = waiting.length ? waiting.map(function (c) { var p = byId(S.projects, c.project_id) || {}; return row("#/project/" + c.project_id, "", p.couple_names || "", c.title, '<span class="pill quote">Awaiting signature</span>'); }).join("") : '<p class="empty">No contract is waiting for a signature.</p>';
    var fu = P.filter(function (p) { return p.status === "quote" && daysAgo(p.quote_sent_at) >= FOLLOWUP_DAYS; });
    var fl = fu.length ? fu.map(function (p) { return row("#/project/" + p.id, daysAgo(p.quote_sent_at) + " days", p.couple_names, "Quote sent " + C.fmtDate(p.quote_sent_at.slice(0, 10)), '<span class="pill quote">Chase</span>'); }).join("") : '<p class="empty">No quote is waiting for an answer.</p>';
    var od = S.payments.filter(function (x) { return !x.paid_at && x.due_date < today; });
    var odl = od.length ? od.map(function (x) { var p = byId(S.projects, x.project_id) || {}; return row("#/project/" + x.project_id, "Due " + esc(C.fmtDate(x.due_date)), p.couple_names || "", x.label, '<span class="am">' + eur(x.amount) + '</span><span class="pill declined">Overdue</span>'); }).join("") : '<p class="empty">No overdue payment.</p>';
    var web = P.filter(function (p) { return p.quote_ref && p.status === "quote" && daysAgo(p.created_at) <= 14; }).sort(function (a, b) { return a.created_at < b.created_at ? 1 : -1; });
    var wl2 = web.length ? web.map(function (p) { return row("#/project/" + p.id, daysAgo(p.created_at) === 0 ? "Today" : daysAgo(p.created_at) + " d ago", p.couple_names, [p.wedding_date ? C.fmtDate(p.wedding_date) : "No date", p.venue].filter(Boolean).join(" · "), '<span class="am">' + (p.total ? eur(p.total) : "") + '</span><span class="pill ' + (p.quote_validated_at ? "signed" : "quote") + '">' + (p.quote_validated_at ? "Validated" : "To validate") + "</span>"); }).join("") : '<p class="empty">No quote received from the website in the last two weeks.</p>';
    var rev = S.payments.filter(function (x) { return x.paid_at && x.paid_at.slice(0, 4) === year; }).reduce(function (s, x) { return s + (+x.amount || 0); }, 0);
    var exp = S.expenses.filter(function (x) { return (x.spent_on || "").slice(0, 4) === year; }).reduce(function (s, x) { return s + (+x.amount || 0); }, 0);
    shell("dashboard", '<header class="top"><h1>Dashboard</h1><a class="btn" href="#/new">New project</a></header>' +
      '<div class="stats"><div><b>' + open + "</b><span>Open leads and quotes</span></div><div><b>" + booked.length + "</b><span>Signed dates</span></div><div><b>" + eur(val) + "</b><span>Signed value</span></div><div><b>" + P.filter(function (p) { return p.status === "declined"; }).length + "</b><span>Declined</span></div></div>" +
      '<div class="stats s3"><div><b>' + eur(rev) + "</b><span>Revenue " + year + "</span></div><div><b>" + eur(exp) + "</b><span>Expenses " + year + "</span></div><div><b>" + eur(rev - exp) + "</b><span>Profit " + year + "</span></div></div>" +
      '<section class="cr-card"><h2>New quotes from the website</h2>' + wl2 + "</section>" +
      '<div class="two"><section class="cr-card"><h2>Next dates</h2>' + list + '</section><section class="cr-card"><h2>Waiting for a signature</h2>' + wl + "</section></div>" +
      '<div class="two"><section class="cr-card"><h2>Follow-ups · quotes awaiting an answer</h2>' + fl + '</section><section class="cr-card"><h2>Overdue payments</h2>' + odl + "</section></div>");
  }

  /* ---------------- calendar ---------------- */
  function calendar() {
    var m = new Date(S.month.getFullYear(), S.month.getMonth(), 1), first = (m.getDay() + 6) % 7, days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    var cells = "", today = iso(new Date());
    var fuByDay = {}; S.projects.forEach(function (p) { if (p.status === "quote" && p.quote_sent_at) { var d = new Date(p.quote_sent_at); d.setDate(d.getDate() + FOLLOWUP_DAYS); (fuByDay[iso(d)] = fuByDay[iso(d)] || []).push(p); } });
    for (var i = 0; i < first; i++) cells += '<div class="cell off"></div>';
    for (var d = 1; d <= days; d++) {
      var key = m.getFullYear() + "-" + ("0" + (m.getMonth() + 1)).slice(-2) + "-" + ("0" + d).slice(-2);
      var ps = S.projects.filter(function (p) { return p.wedding_date === key; });
      var pays = S.payments.filter(function (x) { return !x.paid_at && x.due_date === key; });
      var clash = ps.filter(function (p) { return p.status !== "declined"; }).length > 1;
      cells += '<div class="cell' + (key === today ? " today" : "") + (clash ? " clash" : "") + '"><i>' + d + "</i>" +
        ps.map(function (p) { return '<a class="chip ' + ST[p.status].cal + '" href="#/project/' + p.id + '" title="' + esc(ST[p.status].label + " · " + p.couple_names) + '">' + esc(p.couple_names) + "</a>"; }).join("") +
        pays.map(function (x) { var p = byId(S.projects, x.project_id) || {}; return '<a class="chip due" href="#/project/' + x.project_id + '" title="' + esc(x.label) + '">&euro; ' + esc(p.couple_names || "") + "</a>"; }).join("") +
        (fuByDay[key] || []).map(function (p) { return '<a class="chip fu" href="#/project/' + p.id + '" title="Follow up on the quote">&#8635; ' + esc(p.couple_names) + "</a>"; }).join("") +
        (clash ? '<em title="Two live projects on the same date">Date clash</em>' : "") + "</div>";
    }
    var label = m.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    var feed = api.kind === "supabase" && S.settings.calendar_token ? CRM_CONFIG.url.replace(/\/$/, "") + "/functions/v1/calendar-feed?token=" + S.settings.calendar_token : "";
    shell("calendar", '<header class="top"><h1>Calendar</h1><div class="mnav"><button id="pm" type="button" aria-label="Previous month">&lsaquo;</button><strong>' + label + '</strong><button id="nm" type="button" aria-label="Next month">&rsaquo;</button><button id="tm" type="button" class="ghost">Today</button></div></header>' +
      '<div class="legend"><span class="chip quote">Option: lead, quote, awaiting signature</span><span class="chip signed">Signed</span><span class="chip declined">Declined</span><span class="chip due">Payment due</span><span class="chip fu">Follow-up</span></div>' +
      '<div class="cal"><div class="dow">' + ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(function (x) { return "<b>" + x + "</b>"; }).join("") + "</div><div class=\"grid\">" + cells + "</div></div>" +
      '<section class="cr-card" style="margin-top:18px"><h2>Your Google or Apple calendar</h2>' +
      (api.kind === "supabase" ? (feed ? '<p class="hint">Subscribe once and every option, signed date, payment due and follow-up appears in your own calendar, kept up to date. Google Calendar: <em>Other calendars &gt; From URL</em>, paste the link. Apple Calendar: <em>File &gt; New Calendar Subscription</em>. Keep this link private.</p><div class="inl"><input id="feedUrl" readonly value="' + esc(feed) + '"><button class="btn ghost" id="feedCopy" type="button">Copy link</button></div>'
        : '<p class="hint">Create your private subscription link (it needs the calendar function from docs/crm/SETUP.md, step 6).</p>') +
        '<div class="acts"><button class="btn ghost" id="feedGen" type="button">' + (feed ? "Make a new link (the old one stops working)" : "Create my private link") + "</button>" : '<p class="hint">Available once the database is connected.</p><div class="acts">') +
      '<button class="btn ghost" id="icsDl" type="button">Download .ics</button></div></section>');
    $("#pm").onclick = function () { S.month = new Date(m.getFullYear(), m.getMonth() - 1, 1); calendar(); };
    $("#nm").onclick = function () { S.month = new Date(m.getFullYear(), m.getMonth() + 1, 1); calendar(); };
    $("#tm").onclick = function () { S.month = new Date(); calendar(); };
    $("#icsDl").onclick = function () { T.download("chromata-calendar.ics", T.buildICS(T.projectEvents(S.projects, S.payments, FOLLOWUP_DAYS), "Chromata CRM"), "text/calendar;charset=utf-8"); };
    var g = $("#feedGen"); if (g) g.onclick = function () {
      if (feed && !confirm("The previous link will stop working. Continue?")) return;
      api.saveSettings({ calendar_token: D.token("") }).then(reload).then(calendar).then(function () { toast("New calendar link created"); }).catch(fail);
    };
    var cp = $("#feedCopy"); if (cp) cp.onclick = function () { (navigator.clipboard ? navigator.clipboard.writeText(feed) : Promise.reject()).then(function () { toast("Link copied"); }, function () { $("#feedUrl").select(); }); };
  }

  /* ---------------- projects list ---------------- */
  function projects() {
    var q = S.q.toLowerCase();
    var groups = { open: function (p) { return ST[p.status].g === "quote"; }, signed: function (p) { return isSigned(p.status); }, declined: function (p) { return p.status === "declined"; } };
    var rows = S.projects.filter(function (p) {
      return (S.filter === "all" || groups[S.filter](p)) && (!q || [p.couple_names, p.venue, p.location, p.planner_name, p.planner_company].join(" ").toLowerCase().indexOf(q) > -1);
    }).sort(function (a, b) { return (a.wedding_date || "9999") < (b.wedding_date || "9999") ? -1 : 1; });
    var tabs = [["all", "All"], ["open", "Leads & quotes"], ["signed", "Signed"], ["declined", "Declined"]].map(function (t) { return '<button type="button" data-f="' + t[0] + '" class="' + (S.filter === t[0] ? "on" : "") + '">' + t[1] + "</button>"; }).join("");
    shell("projects", '<header class="top"><h1>Projects</h1><a class="btn" href="#/new">New project</a></header><div class="bar"><div class="tabs">' + tabs +
      '</div><input id="q" type="search" placeholder="Search couple, venue, planner…" value="' + esc(S.q) + '"></div><section class="cr-card tbl">' +
      (rows.length ? rows.map(function (p) {
        return '<a class="row" href="#/project/' + p.id + '"><span class="d">' + esc(p.wedding_date ? C.fmtDate(p.wedding_date) : "No date") + '</span><span class="t">' + esc(p.couple_names) + "<small>" + esc([p.venue, p.location].filter(Boolean).join(", ") + (p.quote_ref ? " · from the website" : "")) + "</small></span><span class=\"pl\">" + esc(p.planner_name || "") + "</span><span class=\"am\">" + (p.total ? eur(p.total) : "") + "</span>" + pill(p.status) + "</a>";
      }).join("") : '<p class="empty">No project matches. Create one with “New project”.</p>') + "</section>");
    $$(".tabs button").forEach(function (b) { b.onclick = function () { S.filter = b.getAttribute("data-f"); projects(); }; });
    $("#q").oninput = function (e) { S.q = e.target.value; var pos = e.target.selectionStart; projects(); var el = $("#q"); el.focus(); el.setSelectionRange(pos, pos); };
  }

  /* ---------------- all contracts ---------------- */
  function contractsView() {
    shell("contracts", '<header class="top"><h1>Contracts</h1></header><section class="cr-card tbl">' + (S.contracts.length ? S.contracts.map(function (c) {
      var p = byId(S.projects, c.project_id) || {};
      return '<a class="row" href="#/project/' + c.project_id + '"><span class="d">' + esc(c.signed_at ? C.fmtDate(c.signed_at.slice(0, 10)) : C.fmtDate((c.created_at || "").slice(0, 10))) + '</span><span class="t">' + esc(p.couple_names || "") + "<small>" + esc(c.title) + "</small></span><span class=\"am\">" + (c.amount ? eur(c.amount) : "") + '</span><span class="pill ' + (c.status === "signed" ? "signed" : "quote") + '">' + CSTATUS[c.status] + "</span></a>";
    }).join("") : '<p class="empty">No contract yet. Open a project and create one.</p>') + "</section>");
  }

  /* ---------------- project form (new / edit) ---------------- */
  var F = [["couple_names", "Couple", "text", 1], ["couple_email", "Couple email", "email"], ["couple_phone", "Couple phone", "tel"], ["wedding_date", "Wedding date", "date"],
    ["venue", "Venue", "text"], ["location", "Location", "text"], ["collection", "Collection", "text"], ["total", "Quote total excl. travel (€)", "number"], ["travel_fees", "Travel / accommodation fees (€)", "number"]];
  var PL = [["planner_name", "Wedding planner", "text"], ["planner_company", "Company", "text"], ["planner_email", "Planner email", "email"], ["planner_phone", "Planner phone", "tel"]];
  /* "total" is stored all-in (travel included); the form shows it without travel and adds the travel fees on save. */
  function fieldValue(f, p) {
    if (f[0] === "total") return p.total == null ? "" : Math.round((+p.total - (+p.travel_fees || 0)) * 100) / 100;
    return p[f[0]] == null ? "" : p[f[0]];
  }
  function fld(f, p) { return '<label class="fld"><span>' + f[1] + '</span><input name="' + f[0] + '" type="' + f[2] + '" value="' + esc(fieldValue(f, p)) + '"' + (f[3] ? " required" : "") + (f[2] === "number" ? ' step="any" min="0"' : "") + "></label>"; }

  function readForm(form) {
    var o = {};
    F.concat(PL).forEach(function (f) { var v = form.elements[f[0]].value.trim(); o[f[0]] = f[2] === "number" ? (v === "" ? null : +v) : (v === "" ? null : v); });
    if (o.total != null || o.travel_fees != null) o.total = Math.round(((+o.total || 0) + (+o.travel_fees || 0)) * 100) / 100;   // stored all-in
    o.status = form.elements.status.value; o.notes = form.elements.notes.value.trim() || null; o.proposal_url = form.elements.proposal_url.value.trim() || null;
    o.planner_id = form.elements.planner_id.value || null; o.auto_emails = form.elements.auto_emails.checked; o.bank_account = form.elements.bank_account.value || "EUR";
    return o;
  }
  function fromProposal(url) {
    var h = (url.indexOf("#") > -1 ? url.slice(url.indexOf("#")) : url), r = CQ.parseProposal(h);
    if (!r) return null;
    var a = r.answers, col = CQ.by(CQ.COLLECTIONS, a.wedding);
    return { couple_names: a.names, couple_email: a.email, wedding_date: /^\d{4}-\d{2}-\d{2}$/.test(a.date) ? a.date : null, venue: a.venue, location: a.place, collection: col ? col.name : "", total: CQ.total(a), proposal_url: url };
  }

  /* checklist (same data as the Tracker page): projects.tracker = { "Item": { s: todo|pending|done, n: note } } */
  var TS = { todo: "To do", pending: "In progress", done: "Done" };
  function checklistItems() { return (S.settings.checklist || T.DEFAULT_CHECKLIST).split("\n").map(function (x) { return x.trim(); }).filter(Boolean); }
  function cellOf(p, item) { return (p.tracker && p.tracker[item]) || { s: "todo", n: "" }; }
  function cycle(p, item) {
    var order = ["todo", "pending", "done"], c = cellOf(p, item), t = Object.assign({}, p.tracker || {});
    t[item] = { s: order[(order.indexOf(c.s) + 1) % 3], n: c.n || "" };
    return api.saveProject({ id: p.id, tracker: t }).then(reload);
  }
  function checklistPanel(p) {
    return '<section class="cr-card"><h2>Checklist</h2>' + checklistItems().map(function (it, i) {
      var c = cellOf(p, it);
      return '<div class="crow" data-ci="' + i + '"><div class="ct"><strong>' + esc(it) + '</strong></div><div class="ca"><input class="cnote" placeholder="Note" value="' + esc(c.n || "") + '"><select class="cstate">' +
        Object.keys(TS).map(function (k) { return '<option value="' + k + '"' + (c.s === k ? " selected" : "") + ">" + TS[k] + "</option>"; }).join("") + "</select></div></div>";
    }).join("") + "</section>";
  }
  function wireChecklist(p) {
    var items = checklistItems();
    $$("[data-ci]").forEach(function (row) {
      var it = items[+row.getAttribute("data-ci")];
      var save = function () {
        var t = Object.assign({}, p.tracker || {}); t[it] = { s: $(".cstate", row).value, n: $(".cnote", row).value.trim() };
        api.saveProject({ id: p.id, tracker: t }).then(reload).then(function () { p = byId(S.projects, p.id) || p; }).catch(fail);
      };
      $(".cstate", row).onchange = save; $(".cnote", row).onchange = save;
    });
  }

  function projectForm(p) {
    var isNew = !p.id;
    var planners = S.contacts.filter(function (c) { return c.kind === "planner"; });
    shell("projects", '<header class="top"><h1>' + (isNew ? "New project" : esc(p.couple_names)) + '</h1>' + (isNew ? "" : pill(p.status)) + "</header>" +
      (isNew ? '<section class="cr-card"><h2>Start from a quotation</h2><p class="hint">Paste the “See my proposal” link of a couple: their names, date, venue and total are filled in for you.</p><div class="inl"><input id="imp" type="url" placeholder="https://www.chromatafilms.com/proposal.html#…"><button class="btn ghost" id="impGo" type="button">Fill from link</button></div></section>' : "") +
      (p.quote_ref ? validationPanel(p) : "") +
      '<form id="pf" class="cr-card"><h2>Wedding</h2><div class="grid2">' + F.map(function (f) { return fld(f, p); }).join("") + '<label class="fld"><span>Status</span><select name="status">' +
      Object.keys(ST).map(function (k) { return '<option value="' + k + '"' + ((p.status || "lead") === k ? " selected" : "") + ">" + ST[k].label + "</option>"; }).join("") + "</select></label>" +
      '<label class="fld"><span>Bank account to give the couple</span><select name="bank_account">' + ["EUR", "CHF", "USD"].map(function (a) { return '<option value="' + a + '"' + ((p.bank_account || "EUR") === a ? " selected" : "") + ">" + a + " account" + (C.bankFor(S.settings, a) ? "" : " (not filled in Settings)") + "</option>"; }).join("") + "</select></label></div>" +
      '<p class="hint" id="totAll" style="margin-top:10px"></p>' +
      '<h2>Wedding planner</h2><div class="grid2"><label class="fld" style="grid-column:1/-1"><span>Pick from your contacts</span><select name="planner_id"><option value="">None / not in my contacts</option>' +
      planners.map(function (c) { return '<option value="' + c.id + '"' + (p.planner_id === c.id ? " selected" : "") + ">" + esc(c.name + (c.company ? " · " + c.company : "")) + "</option>"; }).join("") + "</select></label>" + PL.map(function (f) { return fld(f, p); }).join("") + "</div>" +
      '<h2>Notes</h2><label class="fld"><textarea name="notes" rows="4" placeholder="Anything useful: dress code, timeline, contacts on the day…">' + esc(p.notes || "") + '</textarea></label>' +
      '<label class="auto" style="margin-top:14px"><input type="checkbox" name="auto_emails"' + (p.auto_emails === false ? "" : " checked") + '> Send the automatic emails to this couple (quote follow-up and countdown)</label>' +
      '<input type="hidden" name="proposal_url" value="' + esc(p.proposal_url || "") + '">' +
      '<div class="acts"><button class="btn" type="submit">' + (isNew ? "Create project" : "Save") + "</button>" + (isNew ? "" : '<button class="btn danger" id="del" type="button">Delete project</button>') +
      (p.proposal_url ? '<a class="btn ghost" target="_blank" rel="noopener" href="' + esc(p.proposal_url) + '">View proposal</a>' : "") +
      (isNew ? "" : '<a class="btn ghost" href="' + esc(selfMail(p)) + '">Email me this quote</a>') + "</div></form>" +
      (isNew ? "" : contractsPanel(p) + paymentsPanel(p) + checklistPanel(p) + '<section class="cr-card soon"><h2>Film delivery</h2><p class="hint">Coming in version 2: add the private streaming link and the download links for each film, and share one page with the couple after the wedding.</p></section>'));
    var pf = $("#pf");
    var showAll = function () {
      var b = pf.elements.total.value, t = pf.elements.travel_fees.value, el = $("#totAll"); if (!el) return;
      el.innerHTML = b === "" && t === "" ? "" : "Total including travel and accommodation: <strong>" + eur((+b || 0) + (+t || 0)) + "</strong>" + (t === "" ? " (travel and accommodation still to be confirmed with the couple)" : " (shown to the couple as the final amount, “all travel and accommodation fees included”)");
    };
    pf.elements.total.addEventListener("input", showAll); pf.elements.travel_fees.addEventListener("input", showAll); showAll();
    if (isNew) $("#impGo").onclick = function () {
      var d = fromProposal($("#imp").value.trim());
      if (!d) { toast("That link is not a valid proposal link", true); return; }
      Object.keys(d).forEach(function (k) { var el = pf.elements[k]; if (el && d[k] != null) el.value = d[k]; });
      toast("Filled in from the proposal");
    };
    pf.elements.planner_id.addEventListener("change", function () {
      var c = byId(S.contacts, pf.elements.planner_id.value); if (!c) return;
      pf.elements.planner_name.value = c.name || ""; pf.elements.planner_company.value = c.company || ""; pf.elements.planner_email.value = c.email || ""; pf.elements.planner_phone.value = c.phone || "";
    });
    pf.addEventListener("submit", function (e) {
      e.preventDefault();
      var row = readForm(pf); if (!row.couple_names) return;
      if (p.id) row.id = p.id;
      if (row.status === "quote" && !p.quote_sent_at) row.quote_sent_at = new Date().toISOString();
      if (row.wedding_date && row.status !== "declined") {
        var clash = S.projects.filter(function (x) { return x.id !== p.id && x.wedding_date === row.wedding_date && isSigned(x.status); })[0];
        if (clash && !confirm("A signed project already exists on this date (" + clash.couple_names + "). Save anyway?")) return;
      }
      api.saveProject(row).then(function (saved) { return reload().then(function () { toast("Saved"); location.hash = "#/project/" + saved.id; if (p.id) render(); }); }).catch(fail);
    });
    var del = $("#del"); if (del) del.onclick = function () {
      if (confirm("Delete this project and its contracts? This cannot be undone.")) api.deleteProject(p.id).then(reload).then(function () { location.hash = "#/projects"; }).catch(fail);
    };
    if (!isNew) { wireContracts(p); wirePayments(p); wireChecklist(p); }
    wireValidation(p);
  }

  /* ---------------- website quote: the studio validates before the couple can sign ---------------- */
  function selfMail(p) {
    var me = (S.user && S.user.email && S.user.email.indexOf("@") > 0 && S.user.email.indexOf("demo") !== 0) ? S.user.email : "contact@chromatafilms.com";
    var L = ["Quote for " + (p.couple_names || ""), "", "Status: " + (ST[p.status] || ST.lead).label, "Wedding date: " + (p.wedding_date ? C.fmtDate(p.wedding_date) : "not set"),
      "Venue: " + [p.venue, p.location].filter(Boolean).join(", "), "Collection: " + (p.collection || ""), "Total: " + (p.total ? C.money(p.total) : "not set") + (p.travel_fees != null ? " (travel and accommodation included: " + C.money(p.travel_fees) + ")" : " (travel and accommodation still to be confirmed)"),
      "Couple email: " + (p.couple_email || ""), "Couple phone: " + (p.couple_phone || ""),
      p.planner_name ? "Wedding planner: " + [p.planner_name, p.planner_company, p.planner_email, p.planner_phone].filter(Boolean).join(" · ") : "",
      p.proposal_url ? "Proposal: " + p.proposal_url : "", p.notes ? "\nNotes:\n" + p.notes : "", "", "Back office: " + location.origin + location.pathname + "#/project/" + p.id].filter(function (x) { return x !== ""; });
    return "mailto:" + encodeURIComponent(me) + "?subject=" + encodeURIComponent("Quote · " + (p.couple_names || "") + (p.wedding_date ? " · " + C.fmtDate(p.wedding_date) : "")) + "&body=" + encodeURIComponent(L.join("\n"));
  }
  function proposalMail(p) {
    var b = "Hello " + (p.couple_names || "") + ",\n\nThank you for your request. Your personal proposal is ready:\n" + (p.proposal_url || "") + "\n\nIf you are happy with it, you can accept it there and sign the agreement online, in about two minutes. We will confirm your date as soon as the first payment is received. Do not hesitate to write back if you would like to adjust anything.\n\nWarmly,\nChromata Films";
    return "mailto:" + encodeURIComponent(p.couple_email || "") + "?subject=" + encodeURIComponent("Your Chromata Films proposal") + "&body=" + encodeURIComponent(b);
  }
  function validationPanel(p) {
    var v = p.quote_validated_at, ref = esc(p.quote_ref.slice(0, 6).toUpperCase());
    return '<section class="cr-card" id="qv"><div class="sh"><h2>Website quote · ' + (v ? "validated" : "to validate") + '</h2><span class="pill ' + (v ? "signed" : "quote") + '">' + (v ? "Validated" : "Not validated") + "</span></div>" +
      '<p class="hint">Created automatically from the website quotation (ref <strong>' + ref + "</strong>)." + (p.contact_id && byId(S.contacts, p.contact_id) ? ' <a href="#/contacts/' + p.contact_id + '">Open the contact card</a>.' : "") + "</p>" +
      (v ? '<p class="hint"><strong>Validated on ' + esc(C.fmtDate(v.slice(0, 10))) + ".</strong> The signing button now shows on their proposal page. Email them the proposal, or create and send the contract yourself below.</p>"
         : '<p class="hint"><strong>The couple cannot sign yet.</strong> Check the details and the total (add travel or accommodation if needed, then Save), pick the bank account, and validate. Only then does the signing button appear on their proposal page.</p>') +
      (p.quote_verified === false ? '<p class="hint" style="color:var(--bad)">The database could not re-check the total of this quote yet (open the back office once after updating it), so online signing stays closed for it.</p>' : "") +
      '<div class="acts">' + (v ? '<a class="btn" href="' + esc(proposalMail(p)) + '">Email the proposal to the couple</a><button class="btn ghost" id="qWithdraw" type="button">Withdraw validation</button>' : '<button class="btn" id="qValidate" type="button">Validate the quote</button>') +
      (p.proposal_url ? '<button class="btn ghost" id="qCopy" type="button">Copy proposal link</button>' : "") + "</div></section>";
  }
  function wireValidation(p) {
    var go = $("#qValidate"), wd = $("#qWithdraw"), cp = $("#qCopy");
    if (go) go.onclick = function () {
      var acct = p.bank_account || "EUR", msg = "Validate this quote at " + (p.total ? C.money(p.total) : "an unset total") + (p.travel_fees == null ? ", travel and accommodation NOT filled in yet" : ", travel and accommodation included") + " (bank account: " + acct + ")? The couple will then be able to sign online.";
      if (!C.bankFor(S.settings, acct)) msg += "\n\nWarning: the " + acct + " bank details are empty in Settings, so they still cannot sign until you add them.";
      if (!confirm(msg)) return;
      api.saveProject({ id: p.id, quote_validated_at: new Date().toISOString() }).then(reload).then(function () { toast("Quote validated"); render(); }).catch(fail);
    };
    if (wd) wd.onclick = function () { if (confirm("Withdraw the validation? The signing button disappears from their proposal page.")) api.saveProject({ id: p.id, quote_validated_at: null }).then(reload).then(function () { toast("Validation withdrawn"); render(); }).catch(fail); };
    if (cp) cp.onclick = function () { (navigator.clipboard ? navigator.clipboard.writeText(p.proposal_url) : Promise.reject()).then(function () { toast("Proposal link copied"); }, function () { prompt("Copy this link:", p.proposal_url); }); };
  }

  /* ---------------- contracts inside a project ---------------- */
  function contractsPanel(p) {
    var list = S.contracts.filter(function (c) { return c.project_id === p.id; });
    var ed = S.editingContract && byId(list, S.editingContract);
    var rows = list.map(function (c) {
      var link = signLink(c);
      return '<div class="crow" data-id="' + c.id + '"><div class="ct"><strong>' + esc(c.title) + "</strong><small>" + CSTATUS[c.status] + (c.signed_at ? " · " + esc(C.fmtDate(c.signed_at.slice(0, 10))) + " by " + esc(c.signed_name) : "") + "</small></div><div class=\"ca\">" +
        (c.status === "draft" ? '<button class="btn ghost sm" data-a="edit">Edit</button><button class="btn sm" data-a="send">Send for signature</button><button class="btn danger sm" data-a="del">Delete</button>' : "") +
        (c.status === "sent" ? '<button class="btn ghost sm" data-a="copy" data-l="' + esc(link) + '">Copy link</button><a class="btn ghost sm" href="' + esc(mailto(p, c, link)) + '">Email it</a><a class="btn ghost sm" target="_blank" rel="noopener" href="' + esc(link) + '">Open as client</a>' : "") +
        (c.status === "signed" ? '<button class="btn ghost sm" data-a="view">View signed copy</button>' : "") + "</div></div>";
    }).join("");
    var editor = ed ? '<div class="editor"><label class="fld"><span>Title</span><input id="cTitle" value="' + esc(ed.title) + '"></label><label class="fld"><span>Amount (€)</span><input id="cAmt" type="number" step="any" value="' + esc(ed.amount || "") + '"></label><label class="fld"><span>Contract text <small>(lines starting with ## are headings)</small></span><textarea id="cBody" rows="18">' + esc(ed.body) + '</textarea></label><div class="acts"><button class="btn" id="cSave" type="button">Save contract</button><button class="btn ghost" id="cCancel" type="button">Close</button></div></div>' : "";
    return '<section class="cr-card" id="cs"><div class="sh"><h2>Contracts</h2><button class="btn" id="cNew" type="button">Create contract</button></div>' + (rows || '<p class="empty">No contract for this project yet.</p>') + editor + '<div id="signed"></div></section>';
  }
  function mailto(p, c, link) {
    var s = "Your Chromata Films agreement to sign", b = "Hello " + (p.couple_names || "") + ",\n\nHere is your wedding film agreement. You can read it and sign it online, from your phone or computer:\n" + link + "\n\nWe will confirm your date as soon as it is signed.\n\nWarmly,\nChromata Films";
    return "mailto:" + encodeURIComponent(p.couple_email || "") + "?subject=" + encodeURIComponent(s) + "&body=" + encodeURIComponent(b);
  }
  function wireContracts(p) {
    $("#cNew").onclick = function () {
      var t = C.build(p, p.total, S.settings);
      api.saveContract({ project_id: p.id, title: t.title, body: t.body, amount: p.total || null }).then(function (c) { S.editingContract = c.id; return reload(); }).then(render).catch(fail);
    };
    $$(".crow [data-a]").forEach(function (b) {
      b.onclick = function () {
        var id = b.closest(".crow").getAttribute("data-id"), c = byId(S.contracts, id), a = b.getAttribute("data-a");
        if (a === "edit") { S.editingContract = id; render(); }
        else if (a === "del") { if (confirm("Delete this draft?")) api.deleteContract(id).then(reload).then(render).catch(fail); }
        else if (a === "send") {
          var warn = (!S.settings.studio_signature ? "\n\nNote: the studio signature is not set yet (Settings)." : "");
          if (/\[Bank details/.test(c.body) && !confirm("The contract still contains the placeholder for bank details (Settings). Send anyway?")) return;
          if (confirm("Once sent, the text can no longer be changed. Send it for signature?" + warn)) {
            api.saveContract({ id: id, status: "sent", sent_at: new Date().toISOString(), studio_signature: S.settings.studio_signature || null })
              .then(function () { return (p.status === "lead" || p.status === "quote") ? api.saveProject({ id: p.id, status: "signature" }) : null; })
              .then(reload).then(function () { toast("Ready: copy the link or email it"); render(); }).catch(fail);
          }
        }
        else if (a === "copy") { (navigator.clipboard ? navigator.clipboard.writeText(b.getAttribute("data-l")) : Promise.reject()).then(function () { toast("Signing link copied"); }, function () { prompt("Copy this link:", b.getAttribute("data-l")); }); }
        else if (a === "view") { showSigned(c); }
      };
    });
    var save = $("#cSave");
    if (save) {
      save.onclick = function () {
        api.saveContract({ id: S.editingContract, title: $("#cTitle").value.trim(), body: $("#cBody").value, amount: $("#cAmt").value === "" ? null : +$("#cAmt").value }).then(reload).then(function () { toast("Contract saved"); render(); }).catch(fail);
      };
      $("#cCancel").onclick = function () { S.editingContract = null; render(); };
    }
  }
  function showSigned(c) {
    $("#signed").innerHTML = '<div class="signed-copy"><div class="sg-title">' + esc(c.title) + "</div>" + C.render(c.signed_body || c.body) +
      '<div class="sigbox">' + (c.studio_signature ? '<div><small>For Chromata Films SARL</small><img alt="Studio signature" src="' + esc(c.studio_signature) + '"></div>' : "") + '<div><small>THE CLIENT</small><img alt="Signature" src="' + esc(c.signature) + '"></div><div><strong>' + esc(c.signed_name) + "</strong><small>Signed " + esc(new Date(c.signed_at).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })) + "</small><small>Fingerprint (SHA-256): " + esc(c.body_sha256 || "") + '</small></div></div><div class="acts"><button class="btn ghost" onclick="window.print()">Print / save as PDF</button></div></div>';
    $("#signed").scrollIntoView({ behavior: "smooth" });
  }

  /* ---------------- payments ---------------- */
  function payState(x) { return x.paid_at ? "paid" : (x.due_date < iso(new Date()) ? "overdue" : "due"); }
  function paymentsPanel(p) {
    var list = S.payments.filter(function (x) { return x.project_id === p.id; }).sort(function (a, b) { return a.due_date < b.due_date ? -1 : 1; });
    if (!list.length) return '<section class="cr-card"><h2>Payments</h2><p class="hint">The payment schedule (50% on signature, 50% six weeks before the event) appears here as soon as the contract is signed.</p></section>';
    return '<section class="cr-card"><h2>Payments</h2>' + list.map(function (x) {
      var st = payState(x), cls = st === "paid" ? "signed" : (st === "overdue" ? "declined" : "quote");
      return '<div class="crow" data-pid="' + x.id + '"><div class="ct"><strong>' + esc(x.label) + "</strong><small>" + eur(x.amount) + " · due " + esc(C.fmtDate(x.due_date)) + (x.paid_at ? " · paid " + esc(C.fmtDate(x.paid_at.slice(0, 10))) : "") +
        (x.reminders_count ? " · " + x.reminders_count + " reminder" + (x.reminders_count > 1 ? "s" : "") + " sent" : "") + '</small></div><div class="ca"><span class="pill ' + cls + '">' + (st === "paid" ? "Paid" : (st === "overdue" ? "Overdue" : "Upcoming")) + "</span>" +
        (x.paid_at ? '<button class="btn ghost sm" data-p="unpay">Undo</button>' : '<button class="btn sm" data-p="pay">Mark as paid</button><a class="btn ghost sm" href="' + esc(reminderMail(p, x)) + '">Remind by email</a><label class="auto"><input type="checkbox" data-p="auto"' + (x.remind ? " checked" : "") + "> auto reminders</label>") + "</div></div>";
    }).join("") + '<p class="hint" style="margin-top:12px">Automatic reminders go to the client by email when a payment is late (see docs/crm/SETUP.md, step 5).</p></section>';
  }
  function reminderMail(p, x) {
    var c = byId(S.contracts, x.contract_id) || {}, to = c.client_email || p.couple_email || "";
    var b = "Hello " + (c.client_names || p.couple_names || "") + ",\n\nA friendly reminder: the payment below is now due for your wedding film.\n\n" + x.label + "\nAmount: " + C.money(x.amount) + "\nDue date: " + C.fmtDate(x.due_date) + "\n\nBank details:\n" + (C.bankFor(S.settings, p.bank_account) || "[see clause 13 of your agreement]") + "\n\nPlease note that, as per clause 11 of the agreement, interest of 5% per annum applies to late payments. If you have already paid, thank you and please ignore this message.\n\nWarmly,\nChromata Films";
    return "mailto:" + encodeURIComponent(to) + "?subject=" + encodeURIComponent("Payment reminder · " + (p.couple_names || "")) + "&body=" + encodeURIComponent(b);
  }
  function wirePayments(p) {
    $$("[data-pid] [data-p]").forEach(function (el) {
      var id = el.closest("[data-pid]").getAttribute("data-pid"), a = el.getAttribute("data-p");
      el[a === "auto" ? "onchange" : "onclick"] = function () {
        var f = a === "pay" ? { paid_at: new Date().toISOString() } : a === "unpay" ? { paid_at: null } : { remind: el.checked };
        var next = api.savePayment(id, f);
        // the first payment received turns "awaiting payment" into "booked"
        if (a === "pay" && p.status === "payment") next = next.then(function () { return api.saveProject({ id: p.id, status: "booked" }); });
        next.then(reload).then(function () { toast("Updated"); render(); }).catch(fail);
      };
    });
  }

  /* ---------------- router ---------------- */
  var views = { dashboard: dashboard, calendar: calendar, projects: projects, contracts: contractsView };
  function render() {
    var parts = location.hash.replace(/^#\/?/, "").split("/");
    if (parts[0] === "project" && parts[1]) {
      var p = byId(S.projects, parts[1]);
      if (p) { projectForm(p); return; }
      location.hash = "#/projects"; return;
    }
    if (parts[0] === "new") { projectForm({ status: "lead" }); return; }
    (views[parts[0]] || dashboard)(parts[1]);
    window.scrollTo(0, 0);
  }

  /* The database re-computes every website quote and builds contracts itself, so it needs a copy of the price list
     (js/quote-core.js) and of the default contract text. Refreshed here each time the studio opens the back office. */
  function syncQuoteSettings() {
    if (api.kind !== "supabase" || !window.CQ || !CQ.priceTable) return;
    var want = { quote_prices: JSON.stringify(CQ.priceTable()), contract_template_default: C.DEFAULT_TEMPLATE }, diff = {};
    Object.keys(want).forEach(function (k) { if (S.settings[k] !== want[k]) diff[k] = want[k]; });
    if (!Object.keys(diff).length) return;
    api.saveSettings(diff).then(function () { Object.assign(S.settings, diff); }).catch(function () {});
  }

  function boot() {
    api.session().then(function (u) {
      S.user = u;
      if (!u) { loginView(); return; }
      var m = api.mfa && api.mfa.status ? api.mfa.status() : Promise.resolve({ enrolled: false, needsChallenge: false, factors: [] });
      return m.then(function (st) {
        S.mfa = st;
        if (st.needsChallenge) { mfaView(); return; }
        return reload().then(function () { render(); syncQuoteSettings(); });
      });
    }).catch(function (e) { app.innerHTML = '<div class="cr-login"><div class="cr-card"><h1>Connection problem</h1><p class="err">' + esc(e.message) + "</p></div></div>"; });
  }
  window.addEventListener("hashchange", function () { if (S.user && !(S.mfa && S.mfa.needsChallenge)) { S.editingContract = null; render(); } });

  window.CRMApp = { S: S, api: api, C: C, T: T, D: D, esc: esc, eur: eur, $: $, $$: $$, iso: iso, byId: byId, toast: toast, fail: fail, pill: pill, ST: ST, isSigned: isSigned, shell: shell, reload: reload, render: render, boot: boot,
    views: views, checklistItems: checklistItems, cellOf: cellOf, cycle: cycle, TS: TS, FOLLOWUP_DAYS: FOLLOWUP_DAYS };
})();
