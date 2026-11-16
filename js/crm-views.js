/* Chromata CRM — contacts, tracker, accounting and settings (+2FA). Loaded after crm.js. */
(function () {
  "use strict";
  var A = window.CRMApp, S = A.S, api = A.api, C = A.C, T = A.T, esc = A.esc, eur = A.eur, $ = A.$, $$ = A.$$, shell = A.shell, toast = A.toast, fail = A.fail, byId = A.byId, iso = A.iso;
  var views = A.views;
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var KINDS = { planner: "Wedding planner", venue: "Venue", supplier: "Supplier", other: "Other" };
  var TAGS = { key: "Key contact", interesting: "Interesting", polite: "Keep polite", blacklist: "Blacklist" };
  var again = function () { return A.reload().then(A.render); };

  /* =================== contacts (little black book) =================== */
  var CF = { kind: "all", tag: "all", fu: false, q: "" };
  function tagPill(t) { return '<span class="pill ' + (t === "key" ? "signed" : t === "blacklist" ? "declined" : t === "polite" ? "pay" : "quote") + '">' + (TAGS[t] || t) + "</span>"; }

  views.contacts = function (arg) {
    if (arg) return contactForm(arg === "new" ? {} : byId(S.contacts, arg));
    var q = CF.q.toLowerCase();
    var rows = S.contacts.filter(function (c) {
      return (CF.kind === "all" || c.kind === CF.kind) && (CF.tag === "all" || c.tag === CF.tag) && (!CF.fu || c.follow_up) && (!q || [c.name, c.company, c.email, c.notes].join(" ").toLowerCase().indexOf(q) > -1);
    });
    var opts = function (obj, cur, all) { return '<option value="all">' + all + "</option>" + Object.keys(obj).map(function (k) { return '<option value="' + k + '"' + (cur === k ? " selected" : "") + ">" + obj[k] + "</option>"; }).join(""); };
    shell("contacts", '<header class="top"><h1>Contacts</h1><div class="acts" style="margin:0"><a class="btn" href="#/contacts/new">Add a contact</a><button class="btn ghost" id="ctExp" type="button">Export CSV</button><label class="btn ghost filebtn">Import CSV<input id="ctImp" type="file" accept=".csv,text/csv" hidden></label></div></header>' +
      '<p class="hint">Wedding planners, venues and suppliers: tag each contact, filter the book, and pick a planner directly in a project.</p>' +
      '<div class="bar"><div class="tabs"><select id="ctKind">' + opts(KINDS, CF.kind, "All types") + '</select><select id="ctTag">' + opts(TAGS, CF.tag, "All tags") + '</select><label class="auto"><input type="checkbox" id="ctFu"' + (CF.fu ? " checked" : "") + '> to follow up only</label></div><input id="q" type="search" placeholder="Search…" value="' + esc(CF.q) + '"></div>' +
      '<section class="cr-card tbl">' + (rows.length ? rows.map(function (c) {
        var ps = S.projects.filter(function (p) { return p.planner_id === c.id; }), rev = ps.filter(function (p) { return A.isSigned(p.status); }).reduce(function (s, p) { return s + (+p.total || 0); }, 0);
        return '<a class="row" href="#/contacts/' + c.id + '"><span class="d">' + esc(KINDS[c.kind] || "") + '</span><span class="t">' + esc(c.name) + "<small>" + esc([c.company, c.email, c.phone].filter(Boolean).join(" · ")) + "</small></span><span class=\"pl\">" + (ps.length ? ps.length + " project" + (ps.length > 1 ? "s" : "") + (rev ? " · " + eur(rev) : "") : "") + "</span>" + (c.follow_up ? '<span class="pill quote">To follow up</span>' : "") + tagPill(c.tag) + "</a>";
      }).join("") : '<p class="empty">No contact yet. Add your wedding planners and favourite venues here.</p>') + "</section>");
    $("#ctKind").onchange = function (e) { CF.kind = e.target.value; views.contacts(); };
    $("#ctTag").onchange = function (e) { CF.tag = e.target.value; views.contacts(); };
    $("#ctFu").onchange = function (e) { CF.fu = e.target.checked; views.contacts(); };
    $("#q").oninput = function (e) { CF.q = e.target.value; var pos = e.target.selectionStart; views.contacts(); var el = $("#q"); el.focus(); el.setSelectionRange(pos, pos); };
    $("#ctExp").onclick = function () { T.download("contacts.csv", T.toCSV(S.contacts, ["name", "company", "kind", "tag", "email", "phone", "website", "follow_up", "next_step_date", "notes"])); };
    $("#ctImp").onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      f.text().then(function (txt) {
        var rows = T.parseCSV(txt).filter(function (r) { return (r.name || "").trim(); });
        if (!rows.length) throw new Error("No contact found: the file needs a header row with at least a “name” column.");
        var exists = {}; S.contacts.forEach(function (c) { exists[(c.name + "|" + (c.email || "")).toLowerCase()] = 1; });
        var fresh = rows.filter(function (r) { return !exists[(r.name + "|" + (r.email || "")).toLowerCase()]; });
        return fresh.reduce(function (pr, r) {
          return pr.then(function () { return api.saveContact({ name: r.name, company: r.company || null, email: r.email || null, phone: r.phone || null, website: r.website || null, notes: r.notes || null,
            kind: KINDS[(r.kind || "").toLowerCase()] ? r.kind.toLowerCase() : "planner", tag: TAGS[(r.tag || "").toLowerCase()] ? r.tag.toLowerCase() : "interesting", follow_up: /^(true|yes|1|x)$/i.test(r.follow_up || "") }); });
        }, Promise.resolve()).then(function () { toast(fresh.length + " contact" + (fresh.length === 1 ? "" : "s") + " imported" + (rows.length - fresh.length ? " (" + (rows.length - fresh.length) + " already there)" : "")); });
      }).then(again).catch(fail);
    };
  };

  function contactForm(c) {
    if (!c) { location.hash = "#/contacts"; return; }
    var isNew = !c.id, ps = isNew ? [] : S.projects.filter(function (p) { return p.planner_id === c.id; });
    var inp = function (n, l, t, v) { return '<label class="fld"><span>' + l + '</span><input name="' + n + '" type="' + (t || "text") + '" value="' + esc(v == null ? (c[n] == null ? "" : c[n]) : v) + '"' + (n === "name" ? " required" : "") + "></label>"; };
    var sel = function (n, l, obj) { return '<label class="fld"><span>' + l + '</span><select name="' + n + '">' + Object.keys(obj).map(function (k) { return '<option value="' + k + '"' + ((c[n] || (n === "kind" ? "planner" : "interesting")) === k ? " selected" : "") + ">" + obj[k] + "</option>"; }).join("") + "</select></label>"; };
    shell("contacts", '<header class="top"><h1>' + (isNew ? "New contact" : esc(c.name)) + "</h1>" + (isNew ? "" : tagPill(c.tag)) + '</header><form id="cf" class="cr-card"><div class="grid2">' +
      inp("name", "Name") + inp("company", "Company") + sel("kind", "Type", KINDS) + sel("tag", "Tag", TAGS) + inp("email", "Email", "email") + inp("phone", "Phone", "tel") + inp("website", "Website", "url") + inp("next_step_date", "Next step date", "date") + "</div>" +
      '<label class="auto" style="margin-top:14px"><input type="checkbox" name="follow_up"' + (c.follow_up ? " checked" : "") + '> To follow up</label>' +
      '<label class="fld" style="margin-top:14px"><span>Notes</span><textarea name="notes" rows="4">' + esc(c.notes || "") + '</textarea></label>' +
      '<div class="acts"><button class="btn" type="submit">' + (isNew ? "Add contact" : "Save") + '</button><a class="btn ghost" href="#/contacts">Back</a>' + (isNew ? "" : '<button class="btn danger" id="cdel" type="button">Delete</button>') + "</div></form>" +
      (ps.length ? '<section class="cr-card"><h2>Projects with this contact</h2>' + ps.map(function (p) { return '<a class="row" href="#/project/' + p.id + '"><span class="d">' + esc(p.wedding_date ? C.fmtDate(p.wedding_date) : "No date") + '</span><span class="t">' + esc(p.couple_names) + "<small>" + esc(p.venue || "") + "</small></span>" + A.pill(p.status) + "</a>"; }).join("") + "</section>" : ""));
    $("#cf").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target.elements, o = { name: f.name.value.trim(), company: f.company.value.trim() || null, kind: f.kind.value, tag: f.tag.value, email: f.email.value.trim() || null, phone: f.phone.value.trim() || null,
        website: f.website.value.trim() || null, next_step_date: f.next_step_date.value || null, follow_up: f.follow_up.checked, notes: f.notes.value.trim() || null };
      if (c.id) o.id = c.id;
      api.saveContact(o).then(A.reload).then(function () { toast("Saved"); location.hash = "#/contacts"; }).catch(fail);
    });
    var d = $("#cdel"); if (d) d.onclick = function () { if (confirm("Delete this contact? Projects keep the planner details they already contain.")) api.deleteContact(c.id).then(A.reload).then(function () { location.hash = "#/contacts"; }).catch(fail); };
  }

  /* =================== tracker =================== */
  views.tracker = function () {
    var items = A.checklistItems();
    var ps = S.projects.filter(function (p) { return p.status !== "declined" && p.status !== "delivered"; }).sort(function (a, b) { return (a.wedding_date || "9999") < (b.wedding_date || "9999") ? -1 : 1; });
    var table = !ps.length ? '<p class="empty">Add a project first, then track it here.</p>' :
      '<div class="trk"><table><thead><tr><th></th>' + ps.map(function (p) { return '<th><a href="#/project/' + p.id + '">' + esc(p.couple_names) + "</a><small>" + esc(p.wedding_date ? C.fmtDate(p.wedding_date) : "No date") + "</small></th>"; }).join("") + "</tr></thead><tbody>" +
      items.map(function (it, i) {
        return "<tr><th>" + esc(it) + "</th>" + ps.map(function (p) { var c = A.cellOf(p, it); return '<td><button type="button" class="tc ' + c.s + '" data-p="' + p.id + '" data-i="' + i + '" title="' + esc(c.n || A.TS[c.s]) + '">' + A.TS[c.s] + (c.n ? " ·" : "") + "</button></td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>";
    shell("tracker", '<header class="top"><h1>Production tracker</h1></header><p class="hint">Your projects across the top, your own checklist down the side. Click a cell to change its status. Edit the checklist in Settings.</p>' +
      '<div class="legend"><span class="chip tcl todo">To do</span><span class="chip tcl pending">In progress</span><span class="chip tcl done">Done</span></div><section class="cr-card" style="padding:0">' + table + "</section>");
    $$(".tc").forEach(function (b) {
      b.onclick = function () { var p = byId(S.projects, b.getAttribute("data-p")); A.cycle(p, items[+b.getAttribute("data-i")]).then(function () { views.tracker(); }).catch(fail); };
    });
  };

  /* =================== accounting =================== */
  var AY = new Date().getFullYear();
  function sum(a, f) { return a.reduce(function (s, x) { return s + (+f(x) || 0); }, 0); }
  views.accounting = function () {
    var inYear = function (d, y) { return (d || "").slice(0, 4) === String(y); };
    var pays = S.payments.filter(function (x) { return x.paid_at; }), exps = S.expenses;
    var revY = pays.filter(function (x) { return inYear(x.paid_at, AY); }), expY = exps.filter(function (x) { return inYear(x.spent_on, AY); });
    var rev = sum(revY, function (x) { return x.amount; }), exp = sum(expY, function (x) { return x.amount; });
    var monthly = function (list, dateKey, y) { var m = []; for (var i = 0; i < 12; i++) m.push(0); list.forEach(function (x) { if (inYear(x[dateKey], y)) m[+x[dateKey].slice(5, 7) - 1] += +x.amount || 0; }); return m; };
    var cur = monthly(pays, "paid_at", AY), prev = monthly(pays, "paid_at", AY - 1), max = Math.max(1, Math.max.apply(null, cur.concat(prev)));
    var bars = MONTHS.map(function (m, i) { return '<div class="mb"><div class="bars"><i class="b prev" style="height:' + Math.round(prev[i] / max * 100) + '%" title="' + (AY - 1) + " " + m + ": " + eur(prev[i]) + '"></i><i class="b cur" style="height:' + Math.round(cur[i] / max * 100) + '%" title="' + AY + " " + m + ": " + eur(cur[i]) + '"></i></div><span>' + m + "</span></div>"; }).join("");
    var years = {}; years[AY] = 1; pays.forEach(function (x) { years[x.paid_at.slice(0, 4)] = 1; }); exps.forEach(function (x) { years[(x.spent_on || "").slice(0, 4)] = 1; });
    var cats = ["Travel", "Equipment", "Software", "Music licences", "Crew / freelance", "Insurance", "Marketing", "Other"];
    shell("accounting", '<header class="top"><h1>Accounting</h1><label class="fld" style="flex-direction:row;align-items:center;gap:10px"><span>Year</span><select id="acY" style="width:auto">' + Object.keys(years).sort().reverse().map(function (y) { return '<option' + (+y === AY ? " selected" : "") + ">" + y + "</option>"; }).join("") + "</select></label></header>" +
      '<div class="stats s3"><div><b>' + eur(rev) + "</b><span>Revenue " + AY + "</span></div><div><b>" + eur(exp) + "</b><span>Expenses " + AY + "</span></div><div><b>" + eur(rev - exp) + "</b><span>Profit " + AY + "</span></div></div>" +
      '<section class="cr-card"><h2>Revenue by month, year on year</h2><p class="hint">Revenue is the exact payments you mark as received on each project. <span class="lg prev"></span>' + (AY - 1) + ' <span class="lg cur"></span>' + AY + '</p><div class="mchart">' + bars + "</div></section>" +
      '<section class="cr-card"><h2>Expenses · ' + AY + '</h2><form id="exf" class="exf"><label class="fld"><span>Date</span><input name="spent_on" type="date" value="' + iso(new Date()) + '" required></label><label class="fld"><span>What</span><input name="label" required placeholder="Flight to Como"></label>' +
      '<label class="fld"><span>Category</span><input name="category" list="cats" placeholder="Travel"><datalist id="cats">' + cats.map(function (c) { return "<option>" + c + "</option>"; }).join("") + '</datalist></label><label class="fld"><span>Amount (€)</span><input name="amount" type="number" step="any" min="0" required></label>' +
      '<label class="fld"><span>Receipt link (optional)</span><input name="receipt_url" type="url" placeholder="https://drive.google.com/…"></label><label class="fld"><span>Project (optional)</span><select name="project_id"><option value="">None</option>' + S.projects.map(function (p) { return '<option value="' + p.id + '">' + esc(p.couple_names) + "</option>"; }).join("") + '</select></label><button class="btn" type="submit">Add expense</button></form>' +
      (expY.length ? expY.slice().sort(function (a, b) { return a.spent_on < b.spent_on ? 1 : -1; }).map(function (x) { return '<div class="crow" data-eid="' + x.id + '"><div class="ct"><strong>' + esc(x.label) + "</strong><small>" + esc(C.fmtDate(x.spent_on)) + (x.category ? " · " + esc(x.category) : "") + (x.receipt_url ? ' · <a target="_blank" rel="noopener" href="' + esc(x.receipt_url) + '">receipt</a>' : "") + '</small></div><div class="ca"><b>' + eur(x.amount) + '</b><button class="btn danger sm" data-del="1" type="button">Delete</button></div></div>'; }).join("") : '<p class="empty">No expense for ' + AY + " yet.</p>") + "</section>" +
      '<section class="cr-card"><h2>Export for your accountant</h2><p class="hint">Three CSV files for ' + AY + ': income, expenses and a month by month summary.</p><div class="acts"><button class="btn ghost" id="exInc" type="button">Income CSV</button><button class="btn ghost" id="exExp" type="button">Expenses CSV</button><button class="btn" id="exSum" type="button">Summary CSV</button></div></section>');
    $("#acY").onchange = function (e) { AY = +e.target.value; views.accounting(); };
    $("#exf").addEventListener("submit", function (e) {
      e.preventDefault(); var f = e.target.elements;
      api.saveExpense({ spent_on: f.spent_on.value, label: f.label.value.trim(), category: f.category.value.trim() || null, amount: +f.amount.value, receipt_url: f.receipt_url.value.trim() || null, project_id: f.project_id.value || null })
        .then(A.reload).then(function () { toast("Expense added"); views.accounting(); }).catch(fail);
    });
    $$("[data-eid] [data-del]").forEach(function (b) { b.onclick = function () { if (confirm("Delete this expense?")) api.deleteExpense(b.closest("[data-eid]").getAttribute("data-eid")).then(A.reload).then(function () { views.accounting(); }).catch(fail); }; });
    $("#exInc").onclick = function () { T.download("income-" + AY + ".csv", T.toCSV(revY.map(function (x) { var p = byId(S.projects, x.project_id) || {}; return { date: x.paid_at.slice(0, 10), couple: p.couple_names || "", description: x.label, amount_eur: x.amount }; }), ["date", "couple", "description", "amount_eur"])); };
    $("#exExp").onclick = function () { T.download("expenses-" + AY + ".csv", T.toCSV(expY.map(function (x) { return { date: x.spent_on, description: x.label, category: x.category || "", amount_eur: x.amount, receipt: x.receipt_url || "" }; }), ["date", "description", "category", "amount_eur", "receipt"])); };
    $("#exSum").onclick = function () { var ce = monthly(exps, "spent_on", AY); T.download("summary-" + AY + ".csv", T.toCSV(MONTHS.map(function (m, i) { return { month: m + " " + AY, revenue_eur: cur[i], expenses_eur: ce[i], profit_eur: cur[i] - ce[i] }; }).concat([{ month: "TOTAL", revenue_eur: rev, expenses_eur: exp, profit_eur: rev - exp }]), ["month", "revenue_eur", "expenses_eur", "profit_eur"])); };
  };

  /* =================== settings =================== */
  var EMAIL_TPLS = [["email_tpl_followup", "Quote follow-up (automatic, if the quote is not answered)"], ["email_tpl_before", "Countdown (automatic, 90 / 60 / 30 days before the wedding)"], ["email_tpl_thanks", "Thank-you (automatic, the day after the wedding)"]];
  views.settings = function () {
    var tpl = S.settings.contract_template || C.DEFAULT_TEMPLATE, mfa = S.mfa || { factors: [] };
    var mfaHTML = !api.mfa || !api.mfa.available ? '<p class="hint">Available once the database is connected (docs/crm/SETUP.md).</p>' :
      '<p class="hint">Asks for a 6-digit code from an authenticator app (Google Authenticator, Authy, 1Password…) after your password. ' + (mfa.enrolled ? '<strong>2FA is ON.</strong>' : '<strong>2FA is OFF.</strong>') + '</p>' +
      (mfa.factors || []).map(function (f) { return '<div class="crow"><div class="ct"><strong>' + esc(f.friendly_name || "Authenticator") + "</strong><small>Added " + esc(C.fmtDate((f.created_at || "").slice(0, 10))) + '</small></div><div class="ca"><button class="btn danger sm" data-mfa-rm="' + f.id + '" type="button">Remove</button></div></div>'; }).join("") +
      '<div id="mfaBox"></div><div class="acts"><button class="btn" id="mfaAdd" type="button">' + (mfa.enrolled ? "Add a backup authenticator" : "Turn on 2FA") + '</button></div>' +
      '<p class="hint" style="margin-top:12px"><strong>Safety net:</strong> scan the same QR code on two devices (or keep the secret key in a safe place). If you ever lose access, tell Claude in this project and it will give you the one-line reset (<code>docs/crm/disable-2fa.sql</code>).</p>';
    shell("settings", '<header class="top"><h1>Settings</h1></header>' +
      '<section class="cr-card"><h2>Two-factor authentication</h2>' + mfaHTML + "</section>" +
      '<section class="cr-card"><h2>Bank details</h2><p class="hint">Printed in clause 13 of every contract and in payment reminders. Kept in the private database, never in the public site files.</p><label class="fld"><textarea id="sBank" rows="6" placeholder="Account holder: ...&#10;IBAN: ...&#10;Swift/BIC: ...&#10;Address: ...">' + esc(S.settings.bank_details || "") + '</textarea></label></section>' +
      '<section class="cr-card"><h2>Studio signature</h2><p class="hint">Drawn once, then added to every contract you send. Draw it with the mouse or your finger.</p><div class="sigset">' + (S.settings.studio_signature ? '<img alt="Current signature" src="' + esc(S.settings.studio_signature) + '">' : "") +
      '<canvas id="sPad" class="sg-pad" aria-label="Draw the studio signature"></canvas></div><div class="acts"><button class="btn ghost" id="sClear" type="button">Clear drawing</button><button class="btn ghost" id="sRemove" type="button">Remove saved signature</button></div></section>' +
      '<section class="cr-card"><h2>Production checklist</h2><p class="hint">One step per line. It is the list of the Tracker page and of each project.</p><label class="fld"><textarea id="sCheck" rows="9">' + esc(S.settings.checklist || T.DEFAULT_CHECKLIST) + "</textarea></label></section>" +
      '<section class="cr-card"><h2>Automatic emails to couples</h2><p class="hint">Sent by the daily job (docs/crm/SETUP.md, step 5). First line <code>Subject: …</code>, then a blank line, then the message. Tags: <code>{{name}}</code> <code>{{date}}</code> <code>{{venue}}</code> <code>{{days}}</code>. You can switch them off project by project.</p>' +
      EMAIL_TPLS.map(function (t) { return '<label class="fld" style="margin-top:12px"><span>' + t[1] + '</span><textarea data-tpl="' + t[0] + '" rows="7">' + esc(S.settings[t[0]] || T.DEFAULT_EMAILS[t[0]]) + "</textarea></label>"; }).join("") + "</section>" +
      '<section class="cr-card"><h2>Contract template</h2><p class="hint">Used for each new contract. Words in double braces are filled in from the project: <code>{{couple}}</code> <code>{{collection}}</code> <code>{{date}}</code> <code>{{venue}}</code> <code>{{location}}</code> <code>{{total}}</code> <code>{{deposit}}</code> <code>{{balance}}</code> <code>{{balance_due}}</code> <code>{{bank_details}}</code>. Lines starting with <code>## </code> are headings.</p>' +
      '<label class="fld"><textarea id="sTpl" rows="24">' + esc(tpl) + '</textarea></label><div class="acts"><button class="btn ghost" id="sReset" type="button">Restore the default template</button></div></section>' +
      '<section class="cr-card"><h2>Your data</h2><p class="hint">Your data is yours. Export everything as CSV files at any time.</p><div class="acts"><button class="btn ghost" id="sExport" type="button">Export all my data</button></div></section>' +
      '<div class="acts"><button class="btn" id="sSave" type="button">Save settings</button></div>');
    var pad = C.signaturePad($("#sPad"), function () {}), cleared = false;
    $("#sClear").onclick = function () { pad.clear(); };
    $("#sRemove").onclick = function () { cleared = true; var i = $(".sigset img"); if (i) i.remove(); toast("Will be removed when you save"); };
    $("#sReset").onclick = function () { if (confirm("Replace the text below with the default template?")) $("#sTpl").value = C.DEFAULT_TEMPLATE; };
    $("#sSave").onclick = function () {
      var o = { bank_details: $("#sBank").value.trim(), contract_template: $("#sTpl").value === C.DEFAULT_TEMPLATE ? "" : $("#sTpl").value,
        checklist: $("#sCheck").value.trim() === T.DEFAULT_CHECKLIST ? "" : $("#sCheck").value.trim() };
      $$("[data-tpl]").forEach(function (t) { var k = t.getAttribute("data-tpl"); o[k] = t.value.trim() === T.DEFAULT_EMAILS[k] ? "" : t.value.trim(); });
      if (!pad.isEmpty()) o.studio_signature = pad.png(); else if (cleared) o.studio_signature = "";
      api.saveSettings(o).then(A.reload).then(function () { toast("Settings saved"); views.settings(); }).catch(fail);
    };
    $("#sExport").onclick = function () {
      var P = S.projects;
      T.download("projects.csv", T.toCSV(P, ["couple_names", "couple_email", "couple_phone", "wedding_date", "venue", "location", "status", "collection", "total", "planner_name", "planner_company", "planner_email", "planner_phone", "notes"]));
      T.download("contacts.csv", T.toCSV(S.contacts, ["name", "company", "kind", "tag", "email", "phone", "website", "follow_up", "next_step_date", "notes"]));
      T.download("payments.csv", T.toCSV(S.payments.map(function (x) { var p = byId(P, x.project_id) || {}; return { couple: p.couple_names || "", label: x.label, amount_eur: x.amount, due_date: x.due_date, paid_at: x.paid_at || "" }; }), ["couple", "label", "amount_eur", "due_date", "paid_at"]));
      T.download("expenses.csv", T.toCSV(S.expenses, ["spent_on", "label", "category", "amount", "receipt_url"]));
      T.download("contracts.csv", T.toCSV(S.contracts.map(function (c) { var p = byId(P, c.project_id) || {}; return { couple: p.couple_names || "", title: c.title, status: c.status, amount_eur: c.amount, signed_at: c.signed_at || "", signed_by: c.signed_name || "", sha256: c.body_sha256 || "" }; }), ["couple", "title", "status", "amount_eur", "signed_at", "signed_by", "sha256"]));
    };
    wireMfa();
  };

  function wireMfa() {
    var add = $("#mfaAdd"); if (!add) return;
    $$("[data-mfa-rm]").forEach(function (b) {
      b.onclick = function () {
        var last = S.mfa.factors.length === 1;
        if (!confirm(last ? "This turns two-factor authentication OFF. Continue?" : "Remove this authenticator?")) return;
        api.mfa.remove(b.getAttribute("data-mfa-rm")).then(function () { return api.mfa.status(); }).then(function (st) { S.mfa = st; toast("Removed"); views.settings(); }).catch(fail);
      };
    });
    add.onclick = function () {
      api.mfa.enroll().then(function (d) {
        var box = $("#mfaBox");
        box.innerHTML = '<div class="mfa"><img class="qr" alt="QR code to scan" src="' + esc(d.totp.qr_code) + '"><div><p class="hint">1. Scan this QR code with your authenticator app.<br>2. Or type this secret key in the app, and keep a copy somewhere safe:</p><code class="secret">' + esc(d.totp.secret) + '</code>' +
          '<p class="hint" style="margin-top:12px">3. Type the 6-digit code it shows:</p><div class="inl"><input id="mfaCode" inputmode="numeric" maxlength="8" placeholder="123456"><button class="btn" id="mfaOk" type="button">Confirm</button><button class="btn ghost" id="mfaNo" type="button">Cancel</button></div></div></div>';
        add.style.display = "none";
        $("#mfaNo").onclick = function () { api.mfa.remove(d.id).catch(function () {}).then(function () { views.settings(); }); };
        $("#mfaOk").onclick = function () {
          api.mfa.confirm(d.id, $("#mfaCode").value).then(function () { return api.mfa.status(); }).then(function (st) { S.mfa = st; toast("Two-factor authentication is on"); views.settings(); }).catch(fail);
        };
      }).catch(fail);
    };
  }

  A.boot();
})();
