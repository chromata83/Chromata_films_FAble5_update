/* Chromata CRM — data layer. Two interchangeable backends with the same API:
   - Supabase (real, when js/crm-config.js is filled in)
   - Demo (this browser's localStorage only, to try the tool before the database exists) */
(function (w) {
  "use strict";
  var cfg = w.CRM_CONFIG || {};
  var configured = !!(cfg.url && cfg.anonKey);
  var DEMO_KEY = "crm-demo-v3";
  var F = {
    projects: ["status", "couple_names", "couple_email", "couple_phone", "wedding_date", "venue", "location", "collection", "total", "planner_id",
      "planner_name", "planner_company", "planner_email", "planner_phone", "proposal_url", "notes", "quote_sent_at", "auto_emails", "tracker", "films"],
    contracts: ["project_id", "title", "body", "amount", "status", "sent_at", "studio_signature"],
    payments: ["paid_at", "remind"],
    contacts: ["kind", "name", "company", "email", "phone", "website", "tag", "follow_up", "next_step_date", "notes"],
    expenses: ["spent_on", "label", "category", "amount", "receipt_url", "project_id"]
  };
  var DEFAULTS = {
    projects: function () { return { status: "lead", films: [], tracker: {}, auto_emails: true }; },
    contacts: function () { return { kind: "planner", tag: "interesting", follow_up: false }; },
    expenses: function () { return {}; }
  };

  function pick(o, keys) { var r = {}; keys.forEach(function (k) { if (o[k] !== undefined) r[k] = o[k]; }); return r; }
  function uid() { return (w.crypto && crypto.randomUUID) ? crypto.randomUUID() : "id" + Date.now() + Math.random().toString(16).slice(2); }
  function token(prefix) { var a = new Uint8Array(24); crypto.getRandomValues(a); return (prefix || "") + Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function sha256(text) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    });
  }
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function isoDay(d) { return d.toISOString().slice(0, 10); }
  function addDays(iso, n) { var d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return isoDay(d); }
  /* same wording as the sign_contract() database function */
  function clientBlock(i, now) {
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return "\n\n## The Client\nName(s): " + i.names.trim() + "\nEmail: " + i.email.trim() + "\nAddress: " + i.address.trim().replace(/\n/g, ", ") +
      "\nCountry of residence: " + i.country.trim() + "\nSigned electronically on " + p(now.getUTCDate()) + " " + MON[now.getUTCMonth()] + " " + now.getUTCFullYear() + " " + p(now.getUTCHours()) + ":" + p(now.getUTCMinutes()) + " UTC";
  }
  function validInfo(i) {
    if (!i || (i.names || "").trim().length < 2) throw new Error("Name required");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test((i.email || "").trim())) throw new Error("A valid email is required");
    if ((i.address || "").trim().length < 5) throw new Error("Address required");
    if ((i.country || "").trim().length < 2) throw new Error("Country of residence required");
  }

  /* ---------------- demo backend ---------------- */
  var TABLES = ["projects", "contracts", "payments", "contacts", "expenses", "email_log"];
  function load() {
    var d; try { d = JSON.parse(localStorage.getItem(DEMO_KEY)) || {}; } catch (e) { d = {}; }
    TABLES.forEach(function (t) { d[t] = d[t] || []; }); d.settings = d.settings || {}; return d;
  }
  function store(d) { localStorage.setItem(DEMO_KEY, JSON.stringify(d)); }
  function demoTable(name) {
    return {
      list: function () { return Promise.resolve(load()[name]); },
      save: function (p) {
        var d = load(), row;
        if (p.id) { row = d[name].filter(function (x) { return x.id === p.id; })[0]; Object.assign(row, pick(p, F[name])); if (name === "projects") row.updated_at = new Date().toISOString(); }
        else { row = Object.assign({ id: uid(), created_at: new Date().toISOString() }, DEFAULTS[name](), pick(p, F[name])); d[name].push(row); }
        store(d); return Promise.resolve(row);
      },
      del: function (id) {
        var d = load(); d[name] = d[name].filter(function (x) { return x.id !== id; });
        if (name === "projects") ["contracts", "payments", "email_log"].forEach(function (t) { d[t] = d[t].filter(function (x) { return x.project_id !== id; }); });
        store(d); return Promise.resolve();
      }
    };
  }
  var dProjects = demoTable("projects"), dContacts = demoTable("contacts"), dExpenses = demoTable("expenses");
  var demo = {
    kind: "demo",
    session: function () { return Promise.resolve(localStorage.getItem("crm-demo-on") ? { email: "demo (this browser only)" } : null); },
    signIn: function () { localStorage.setItem("crm-demo-on", "1"); return Promise.resolve(); },
    signOut: function () { localStorage.removeItem("crm-demo-on"); return Promise.resolve(); },
    mfa: { available: false },
    settings: function () { return Promise.resolve(load().settings); },
    saveSettings: function (obj) { var d = load(); Object.assign(d.settings, obj); store(d); return Promise.resolve(d.settings); },
    projects: dProjects.list, saveProject: dProjects.save, deleteProject: dProjects.del,
    contacts: dContacts.list, saveContact: dContacts.save, deleteContact: dContacts.del,
    expenses: dExpenses.list, saveExpense: dExpenses.save, deleteExpense: dExpenses.del,
    emailLog: function () { return Promise.resolve(load().email_log); },
    contracts: function () { return Promise.resolve(load().contracts); },
    saveContract: function (c) {
      var d = load(), row;
      if (c.id) {
        row = d.contracts.filter(function (x) { return x.id === c.id; })[0];
        if (row.status === "signed") return Promise.reject(new Error("A signed contract cannot be modified"));
        Object.assign(row, pick(c, F.contracts));
      } else { row = Object.assign({ id: uid(), created_at: new Date().toISOString(), status: "draft", token: token("demo-") }, pick(c, F.contracts)); d.contracts.push(row); }
      store(d); return Promise.resolve(row);
    },
    deleteContract: function (id) { var d = load(); d.contracts = d.contracts.filter(function (x) { return x.id !== id; }); store(d); return Promise.resolve(); },
    payments: function () { return Promise.resolve(load().payments); },
    savePayment: function (id, f) { var d = load(), row = d.payments.filter(function (x) { return x.id === id; })[0]; Object.assign(row, pick(f, F.payments)); store(d); return Promise.resolve(row); },
    publicContract: function (tk) {
      var d = load(), c = d.contracts.filter(function (x) { return x.token === tk && (x.status === "sent" || x.status === "signed"); })[0];
      if (!c) return Promise.resolve(null);
      var p = d.projects.filter(function (x) { return x.id === c.project_id; })[0] || {};
      return Promise.resolve({ title: c.title, body: c.body, amount: c.amount, status: c.status, studio_signature: c.studio_signature, signed_name: c.signed_name, signed_at: c.signed_at, signed_body: c.signed_body, signature: c.signature,
        couple_names: p.couple_names, couple_email: p.couple_email, wedding_date: p.wedding_date, venue: p.venue, location: p.location });
    },
    sign: function (tk, info, sig, agent) {
      var d = load(), c = d.contracts.filter(function (x) { return x.token === tk; })[0];
      try { validInfo(info); } catch (e) { return Promise.reject(e); }
      if (!c || c.status !== "sent") return Promise.reject(new Error("This contract is not open for signature"));
      var now = new Date(), full = c.body + clientBlock(info, now);
      return sha256(full).then(function (h) {
        Object.assign(c, { status: "signed", signed_at: now.toISOString(), signed_name: info.names.trim(), client_names: info.names.trim(), client_email: info.email.trim(), client_address: info.address.trim(), client_country: info.country.trim(),
          signature: sig, signed_body: full, body_sha256: h, signer_agent: agent });
        var p = d.projects.filter(function (x) { return x.id === c.project_id; })[0];
        if (p && p.status !== "booked" && p.status !== "delivered") p.status = "payment";
        if (+c.amount > 0) {
          var first = Math.round(c.amount * 50) / 100, today = isoDay(now);
          d.payments.push({ id: uid(), contract_id: c.id, project_id: c.project_id, label: "Reservation payment (50%) · due on signature", amount: first, due_date: today, paid_at: null, remind: true, reminders_count: 0, last_reminder_at: null });
          if (p && p.wedding_date) {
            var due = addDays(p.wedding_date, -42); if (due < today) due = today;
            d.payments.push({ id: uid(), contract_id: c.id, project_id: c.project_id, label: "Balance (50%) · due 6 weeks before the event", amount: Math.round((c.amount - first) * 100) / 100, due_date: due, paid_at: null, remind: true, reminders_count: 0, last_reminder_at: null });
          }
        }
        store(d);
      });
    }
  };

  /* ---------------- supabase backend ---------------- */
  var supa = null;
  function client() { if (!supa) supa = w.supabase.createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, autoRefreshToken: true } }); return supa; }
  var ck = function (r) { if (r.error) throw new Error(r.error.message); return r.data; };
  function sbTable(name, order) {
    return {
      list: function () { var q = client().from(name).select("*"); if (order) q = q.order(order[0], { ascending: order[1] !== false }); return q.then(ck); },
      save: function (p) { var row = pick(p, F[name]); return (p.id ? client().from(name).update(row).eq("id", p.id) : client().from(name).insert(row)).select().single().then(ck); },
      del: function (id) { return client().from(name).delete().eq("id", id).then(ck); }
    };
  }
  var sProjects = sbTable("projects", ["wedding_date"]), sContacts = sbTable("contacts", ["name"]), sExpenses = sbTable("expenses", ["spent_on", false]), sContracts = sbTable("contracts", ["created_at", false]);
  var mfa = {
    available: true,
    /* { enrolled, needsChallenge, factors:[{id,friendly_name}] } */
    status: function () {
      var a = client().auth;
      return Promise.all([a.mfa.getAuthenticatorAssuranceLevel(), a.mfa.listFactors()]).then(function (r) {
        var lvl = ck(r[0]), fs = ck(r[1]), verified = (fs.totp || []).filter(function (f) { return f.status === "verified"; });
        return { enrolled: verified.length > 0, needsChallenge: lvl.nextLevel === "aal2" && lvl.currentLevel !== "aal2", factors: verified };
      });
    },
    challenge: function (code) {
      var a = client().auth;
      return a.mfa.listFactors().then(ck).then(function (fs) {
        var f = (fs.totp || []).filter(function (x) { return x.status === "verified"; });
        if (!f.length) throw new Error("No authenticator is set up");
        // try each registered authenticator (phone + backup device)
        var tryNext = function (i) {
          return a.mfa.challengeAndVerify({ factorId: f[i].id, code: String(code).replace(/\s/g, "") }).then(function (r) {
            if (r.error) { if (i + 1 < f.length) return tryNext(i + 1); throw new Error("That code is not valid. Check the time on your phone and try the next code."); }
          });
        };
        return tryNext(0);
      });
    },
    enroll: function (name) { return client().auth.mfa.enroll({ factorType: "totp", friendlyName: name || ("Authenticator " + new Date().toISOString().slice(0, 16).replace("T", " ")) }).then(ck); },
    confirm: function (factorId, code) { return client().auth.mfa.challengeAndVerify({ factorId: factorId, code: String(code).replace(/\s/g, "") }).then(function (r) { if (r.error) throw new Error("That code is not valid, try the next one."); }); },
    remove: function (factorId) { return client().auth.mfa.unenroll({ factorId: factorId }).then(ck); }
  };
  var sb = {
    kind: "supabase",
    mfa: mfa,
    session: function () { return client().auth.getSession().then(function (r) { return r.data.session ? { email: r.data.session.user.email } : null; }); },
    signIn: function (email, pw) { return client().auth.signInWithPassword({ email: email, password: pw }).then(function (r) { if (r.error) throw new Error(r.error.message); }); },
    signOut: function () { return client().auth.signOut(); },
    settings: function () { return client().from("settings").select("key,value").then(ck).then(function (rows) { var o = {}; rows.forEach(function (r) { o[r.key] = r.value; }); return o; }); },
    saveSettings: function (obj) {
      var rows = Object.keys(obj).map(function (k) { return { key: k, value: obj[k] == null ? "" : String(obj[k]), updated_at: new Date().toISOString() }; });
      return client().from("settings").upsert(rows).then(ck);
    },
    projects: sProjects.list, saveProject: sProjects.save, deleteProject: sProjects.del,
    contacts: sContacts.list, saveContact: sContacts.save, deleteContact: sContacts.del,
    expenses: sExpenses.list, saveExpense: sExpenses.save, deleteExpense: sExpenses.del,
    emailLog: function () { return client().from("email_log").select("*").order("sent_at", { ascending: false }).then(ck); },
    contracts: sContracts.list,
    saveContract: sContracts.save,
    deleteContract: sContracts.del,
    payments: function () { return client().from("payments").select("*").order("due_date", { ascending: true }).then(ck); },
    savePayment: function (id, f) { return client().from("payments").update(pick(f, F.payments)).eq("id", id).select().single().then(ck); },
    publicContract: function (tk) { return client().rpc("get_contract", { p_token: tk }).then(ck); },
    sign: function (tk, info, sig, agent) {
      try { validInfo(info); } catch (e) { return Promise.reject(e); }
      return client().rpc("sign_contract", { p_token: tk, p_names: info.names, p_email: info.email, p_address: info.address, p_country: info.country, p_signature: sig, p_agent: agent }).then(ck);
    }
  };

  w.CRMData = { configured: configured, backend: configured ? sb : demo, demo: demo, supabase: sb, token: token, sha256: sha256, addDays: addDays };
})(window);
