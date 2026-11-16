/* ============================================================
   CHROMATA FILMS — quotation <-> back office link
   Sends a quote to the studio's private database so it appears in the CRM by itself
   (calendar option, project, contact card), and lets a couple accept a proposal and
   go straight to the signing page.

   It only calls two narrow database functions (submit_quote, accept_quote, see docs/crm/schema.sql).
   Prices are NOT trusted from the browser: the database recomputes every total from the choices.
   Without js/crm-config.js filled in, everything here quietly does nothing.
   ============================================================ */
(function (w) {
  "use strict";
  var cfg = w.CRM_CONFIG || {}, Q = w.CQ;
  var enabled = !!(cfg.url && cfg.anonKey);

  function rpc(name, body) {
    return fetch(String(cfg.url).replace(/\/$/, "") + "/rest/v1/rpc/" + name, {
      method: "POST", headers: { "Content-Type": "application/json", apikey: cfg.anonKey }, body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) throw new Error((d && d.message) || "Request failed");
        return d;
      });
    });
  }

  /* Sends (or refreshes) the quote. Safe to call several times: the same reference is updated, never duplicated. */
  function submit(A, proposalUrl) {
    if (!enabled) return Promise.reject(new Error("not connected"));
    if (!A.nonce || A.nonce.length < 10) return Promise.reject(new Error("no reference"));
    var d = Q.ISO.test(A.date || "") ? A.date : "";
    return rpc("submit_quote", {
      p_ref: A.nonce, p_names: A.names, p_email: A.email, p_date: d, p_place: A.place, p_venue: A.venue,
      p_role: A.role === "planner" ? "planner" : "couple", p_planner: A.planner || "",
      p_sel: Q.selection(A), p_total: Q.total(A), p_recap: Q.recapText(A), p_url: proposalUrl
    });
  }

  /* Has the studio validated this quote? Resolves { found, validated, signed }. The signing button only shows when validated. */
  function status(A) {
    if (!enabled || !A.nonce || A.nonce.length < 10) return Promise.resolve({ found: false, validated: false, signed: false });
    return rpc("quote_status", { p_ref: A.nonce });
  }

  /* "Accept and sign": only works after the studio validated the quote in the back office (the database refuses otherwise).
     Resolves { token } or { signed: true }. */
  function accept(A) {
    return rpc("accept_quote", { p_ref: A.nonce });
  }

  w.CQLink = { enabled: enabled, submit: submit, status: status, accept: accept };
})(window);
