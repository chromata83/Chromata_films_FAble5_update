/* Chromata CRM — helpers: default emails + checklist, CSV import/export, calendar (.ics) builder. */
(function (w) {
  "use strict";

  /* Email templates. First line "Subject: ..." then a blank line then the body.
     Tags: {{name}} {{date}} {{venue}} {{days}}. The same defaults live in docs/crm/daily-jobs/index.ts. */
  var DEFAULT_EMAILS = {
    email_tpl_followup: "Subject: Your wedding film with Chromata Films\n\nHello {{name}},\n\nI wanted to follow up on the proposal we sent for your wedding on {{date}} at {{venue}}. Do you have any questions, or would you like us to adjust anything? We would love to reserve your date for you.\n\nWarmly,\nChromata Films",
    email_tpl_before: "Subject: {{days}} days until your wedding\n\nHello {{name}},\n\nYour wedding at {{venue}} is only {{days}} days away. To prepare the filming perfectly, could you send us your final timeline, the list of key moments you do not want us to miss, and the contacts of your planner and venue?\n\nWarmly,\nChromata Films"
  };
  var DEFAULT_CHECKLIST = ["Venue and timeline confirmed", "Call with the planner", "Music and special requests", "Travel and accommodation booked", "Shoot", "Rushes backed up", "Highlight film edited", "Feature film edited", "Delivery to the couple"].join("\n");

  /* ---------- CSV ---------- */
  function csvCell(v) { v = v == null ? "" : String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function toCSV(rows, cols) { return [cols.join(",")].concat(rows.map(function (r) { return cols.map(function (c) { return csvCell(r[c]); }).join(","); })).join("\r\n"); }
  function parseCSV(text) {
    var rows = [], row = [], cell = "", q = false, i = 0, c;
    text = String(text).replace(/^\uFEFF/, "");
    var sep = (text.split("\n")[0].match(/;/g) || []).length > (text.split("\n")[0].match(/,/g) || []).length ? ";" : ",";
    for (; i < text.length; i++) {
      c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
      else if (c === '"') q = true;
      else if (c === sep) { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); cell = ""; if (row.some(function (x) { return x !== ""; })) rows.push(row); row = []; }
      else cell += c;
    }
    row.push(cell); if (row.some(function (x) { return x !== ""; })) rows.push(row);
    if (!rows.length) return [];
    var head = rows[0].map(function (h) { return h.trim().toLowerCase().replace(/\s+/g, "_"); });
    return rows.slice(1).map(function (r) { var o = {}; head.forEach(function (h, k) { o[h] = (r[k] || "").trim(); }); return o; });
  }
  function download(name, text, type) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type || "text/csv;charset=utf-8" }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- calendar (.ics) ---------- */
  function icsEsc(s) { return String(s == null ? "" : s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;"); }
  function fold(line) { var out = [], b = line; while (b.length > 74) { out.push(b.slice(0, 74)); b = " " + b.slice(74); } out.push(b); return out.join("\r\n"); }
  function ymd(iso) { return iso.slice(0, 10).replace(/-/g, ""); }
  function nextDay(iso) { var d = new Date(iso.slice(0, 10) + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10).replace(/-/g, ""); }
  var SIGNED = { payment: 1, booked: 1, delivered: 1 }, OPEN = { lead: 1, quote: 1, signature: 1 };
  /* events: [{uid, date:'YYYY-MM-DD', title, location, description, tentative}] */
  function projectEvents(projects, payments, followupDays) {
    var ev = [], today = new Date().toISOString().slice(0, 10);
    projects.forEach(function (p) {
      var where = [p.venue, p.location].filter(Boolean).join(", ");
      if (p.wedding_date) {
        var tag = SIGNED[p.status] ? "SIGNED" : (p.status === "declined" ? "DECLINED" : "OPTION");
        ev.push({ uid: "p-" + p.id, date: p.wedding_date, title: tag + " \u00B7 " + p.couple_names + (p.venue ? " \u00B7 " + p.venue : ""), location: where, description: [p.collection, p.total ? "Total " + p.total + " EUR" : "", p.planner_name ? "Planner: " + p.planner_name : ""].filter(Boolean).join("\n"), tentative: !!OPEN[p.status], free: p.status === "declined" });
      }
      if (p.status === "quote" && p.quote_sent_at) {
        var d = new Date(p.quote_sent_at); d.setUTCDate(d.getUTCDate() + (followupDays || 5));
        ev.push({ uid: "f-" + p.id, date: d.toISOString().slice(0, 10), title: "FOLLOW-UP \u00B7 " + p.couple_names, description: "Quote sent, no answer yet.", free: true });
      }
    });
    payments.forEach(function (x) {
      if (x.paid_at) return;
      var p = projects.filter(function (q) { return q.id === x.project_id; })[0] || {};
      ev.push({ uid: "pay-" + x.id, date: x.due_date, title: (x.due_date < today ? "OVERDUE \u00B7 " : "PAYMENT \u00B7 ") + (p.couple_names || "") + " \u00B7 " + Math.round(x.amount) + " EUR", description: x.label, free: true });
    });
    return ev;
  }
  function buildICS(events, name) {
    var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    var L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Chromata Films//CRM//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:" + icsEsc(name || "Chromata CRM"), "REFRESH-INTERVAL;VALUE=DURATION:PT6H", "X-PUBLISHED-TTL:PT6H"];
    events.forEach(function (e) {
      L.push("BEGIN:VEVENT", "UID:" + e.uid + "@chromatafilms.com", "DTSTAMP:" + stamp, "DTSTART;VALUE=DATE:" + ymd(e.date), "DTEND;VALUE=DATE:" + nextDay(e.date), "SUMMARY:" + icsEsc(e.title));
      if (e.location) L.push("LOCATION:" + icsEsc(e.location));
      if (e.description) L.push("DESCRIPTION:" + icsEsc(e.description));
      L.push("STATUS:" + (e.tentative ? "TENTATIVE" : "CONFIRMED"), "TRANSP:" + (e.free ? "TRANSPARENT" : "OPAQUE"), "END:VEVENT");
    });
    L.push("END:VCALENDAR");
    return L.map(fold).join("\r\n") + "\r\n";
  }

  w.CRMTools = { DEFAULT_EMAILS: DEFAULT_EMAILS, DEFAULT_CHECKLIST: DEFAULT_CHECKLIST, toCSV: toCSV, parseCSV: parseCSV, download: download, projectEvents: projectEvents, buildICS: buildICS };
})(window);
