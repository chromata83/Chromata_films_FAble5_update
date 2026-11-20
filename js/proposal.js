/* ============================================================
   CHROMATA FILMS — the couple's private proposal page
   Rendered entirely from the link (#names-nonce.token): the token only holds
   the couple's CHOICES, prices are recomputed from js/quote-core.js.
   ============================================================ */
(function () {
  "use strict";
  var Q = window.CQ, esc = Q.esc, eur = Q.eur;
  var app = document.getElementById("app");
  var ADDRESS = "Chromata Films SARL · 27 Rue de Montchoisy, 1207 Geneva, Switzerland";
  var PHONE = "+33 7 68 53 39 91";

  /* Two kinds of link:
       proposal.html#<names>-<ref>.<token>   the website quotation: the choices travel in the link, prices are recomputed from js/quote-core.js
       proposal.html#<names>-<ref>           a custom quote made by the studio (back office > Tools): everything (packages, prices, pictures) is read from the database */
  var P = Q.parseProposal(location.hash), CU = P ? null : Q.parseCustomLink(location.hash);
  Q.initMenu();
  Q.lightbox.init();

  function incomplete() {
    document.title = "Your proposal · Chromata Films";
    app.innerHTML = '<section class="px-error"><div><p class="kicker">Your proposal</p><h1>This link looks <em>incomplete</em></h1>' +
      '<p>Part of the address may have been cut when it was copied. Please open the link from your email again, or write to us and we will send it right away.</p>' +
      '<a class="btn-main" href="mailto:' + Q.EMAIL + '">' + Q.EMAIL + "</a></div></section>";
  }
  if (P) start(P, null, null);
  else if (CU && window.CQLink && window.CQLink.enabled) {
    app.innerHTML = '<p class="px-loading" role="status">Opening your proposal…</p>';
    window.CQLink.status({ nonce: CU.ref }).then(function (st) {
      var d = st && st.found && st.custom ? Q.customClean(st.custom) : null;
      if (!d) { incomplete(); return; }
      var a = Q.blank();
      a.names = d.names || "Your proposal"; a.date = d.date; a.place = d.place; a.venue = d.venue; a.nonce = CU.ref;
      a.role = d.planner ? "planner" : "couple"; a.planner = d.planner;
      start({ answers: a, id: CU.ref.toUpperCase(), ts: st.issued ? new Date(st.issued + "T12:00:00").getTime() : 0 }, d, st);
    }).catch(incomplete);
  } else incomplete();

  function start(P, C, st0) {
    var A = P.answers;
    /* a custom quote starts from the studio's saved definition, the website quotation from the couple's own choices */
    /* a custom quote is interactive: the client picks a package and video upgrades, the total follows, and "Save and send for review" sends the choice to the studio */
    var snapOf = function (s) { return { chosen: s.chosen, ups: s.ups.slice(), days: Object.assign({}, s.days) }; };   // chosen package, upgrades, and the number of days of the lines sold per day
    var base = C ? Q.customSelOf(C) : null, sel = base ? snapOf(base) : null, sent = null, signOK = false, locked = false;
    if (C && st0 && st0.selection && typeof st0.selection === "object") {
      var cs = Q.customSelNorm(C, st0.selection);
      sent = cs; sel = snapOf(cs);
    }
    var cq = C ? Q.customQuote(Q.customView(C, sel), { client: true }) : null;
    var L = cq ? [] : Q.lines(A), tot = cq ? cq.total : Q.total(A);
    var ref = "CF-" + (P.id ? P.id.slice(0, 6) : "PROPOSAL");
    var issued = P.ts ? new Date(P.ts).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
    var meta = [C && C.kind, Q.fmtDate(A.date), A.place, A.venue].filter(Boolean).map(esc).join(" · ");
    document.title = "Proposal for " + A.names + " · Chromata Films";

    var subject = "Proposal " + ref + " · " + A.names;
    /* the reply email quotes what the page shows right now (the studio's version once it exists) */
    function mailHref() {
      var recap = model.rows.map(function (r) { return "- " + r.l + ": " + (r.t === "tbc" ? "TBC" : r.t === "inc" ? "Included" : r.t === "opt" ? "Video upgrade, not in the total: " + eur(r.p) : eur(r.p)); }).join("\n") + "\n\nTOTAL INVESTMENT: " + eur(model.total) + (model.inc ? " (all travel and accommodation fees included)" : "");
      return "mailto:" + Q.EMAIL + "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent("Hello Chromata Films,\n\nWe have seen our proposal (" + ref + ") and would love to talk about it.\n\n" + recap + "\n\nNames: " + A.names + "\n");
    }
    var wa = "https://wa.me/" + Q.WHATSAPP + "?text=" + encodeURIComponent("Hello Chromata Films, we have seen our proposal " + ref + " (" + A.names + ").");

    /* The signing button is only shown once the studio has reviewed and validated this quote in its back office
       (the database refuses the signature otherwise). Until then the page simply invites the couple to write to us. */
    var canAsk = !!(window.CQLink && window.CQLink.enabled && A.nonce && A.nonce.length >= 10 && (C || Q.ISO.test(A.date || "")));

    /* What the page shows is a small model: priced rows + a total. It starts from the couple's own choices (the link), then,
       when the studio has built its own version of the quote in the back office, that version replaces it (see paint()). */
    var model = cq ? { rows: cq.rows, total: cq.total, inc: C ? C.travel.show : cq.travel !== null }
      : { rows: L.map(function (l) { return { l: l.label, p: l.price, t: l.tbc ? "tbc" : "" }; }), total: tot, inc: false };
    function sumHTML(m) {
      return m.rows.map(function (r) {
        return '<div class="srow"><span class="sl">' + esc(r.l) + (r.s ? "<small>" + esc(r.s) + "</small>" : "") + '</span><span class="sr">' + (r.t === "tbc" ? "TBC" : r.t === "inc" ? "Included" : r.t === "opt" ? "<em>Video upgrade</em> " + eur(r.p) : eur(r.p)) + "</span></div>";
      }).join("") + '<div class="srow grand"><span class="sl">Total investment' + (m.inc ? " · all travel and accommodation fees included" : "") + '</span><span class="sr">' + eur(m.total) + "</span></div>";
    }

    /* Validity: 14 days from the day of issue. Known from the link at first, then from the database (the studio can issue again). */
    var validity = { until: Q.validUntil(P.ts ? Q.isoOf(new Date(P.ts)) : ""), expired: false };
    function validityText() {
      if (!validity.until) return "";
      return validity.expired
        ? "This proposal was valid until " + Q.fmtDate(validity.until) + ". Write to us and we will refresh it right away."
        : "Valid for " + Q.VALID_DAYS + " days · until " + Q.fmtDate(validity.until) + ".";
    }

    var PH = C ? C.photos : Q.PHOTOS;   // a custom quote only shows the pictures the studio chose
    var photos = PH.map(function (p, i) {
      return '<button class="px-tile" type="button" data-i="' + i + '" aria-label="View photograph ' + (i + 1) + '"><img src="' + p.src + '" alt="' + esc(p.alt) + '" loading="lazy"></button>';
    }).join("");

    /* Dali x Schiaparelli collage cutouts, the same ones as the configurator (decorative). */
    function cutHTML(file, o) {
      var st = ["l", "rt", "t", "b", "h", "rot", "ml", "mt", "mh", "mrot"].filter(function (k) { return o[k] != null; }).map(function (k) { return "--" + k + ":" + o[k]; }).join(";");
      return '<img class="qx-cut px-cut' + (o.hm ? " px-hide-m" : "") + '" alt="" aria-hidden="true" draggable="false" src="assets/img/quote/' + file + '.webp" style="' + st + '">';
    }

    app.innerHTML =
      '<section class="px-hero">' +
        '<div class="px-hero__txt">' +
          '<p class="kicker">Your proposal</p>' +
          '<p class="px-for">Prepared for</p>' +
          '<h1 class="px-title">' + esc(A.names) + "</h1>" +
          (meta ? '<p class="px-meta">' + meta + "</p>" : "") +
          '<p class="px-lead">' + esc(C && C.lead ? C.lead : "Thank you for thinking of us. Everything you chose is gathered below, exactly as you composed it.") + '</p>' +
          '<div class="px-total"><span class="tl" id="pxHeroL">Total investment</span><span class="tv" id="pxHeroV">' + eur(tot) + '</span></div>' +
          '<p class="px-valid" id="pxValid">' + esc(validityText()) + "</p>" +
          '<div class="px-hero__cta"><a class="btn-main" href="#selections">Your selections</a>' + (PH.length ? '<a class="btn-ghost" href="#photographs">Our work</a>' : "") + '</div>' +
          '<p class="px-ref">' + esc(ref) + (issued ? " · " + esc(issued) : "") + "</p>" +
        "</div>" +
        '<div class="px-hero__img"><img class="hero" alt="" src="' + esc(C && C.hero ? C.hero : Q.STEP_IMG.proposal) + '"></div>' +
        cutHTML("q-intro", { l: "43.5%", b: "-5vh", h: "54vh", rot: "-5deg", ml: "3vw", mt: "2vh", mh: "24vh", mrot: "-4deg" }) +
      "</section>" +

      (C ? Q.customCompare(Q.customView(C, sel), { id: "collection", pick: true }) + Q.customUpgrades(C, { id: "upgrades", sel: sel }) : Q.compareSection(A, { id: "collection" })) +

      '<section class="px-sel" id="selections">' +
        cutHTML("q-swan", { l: "3vw", b: "-5vh", h: "28vh", rot: "-8deg", ml: "62vw", mt: "-4vh", mh: "14vh", mrot: "-6deg" }) +
        '<div class="px-wrap">' +
          '<div><p class="kicker">Your selections</p><h2 class="px-h2">Your day, <em>composed</em></h2>' +
          '<p class="px-note" id="pxTravelNote">' + esc(C ? C.note : Q.travelNote(A)) + '</p></div>' +
          '<div class="px-card"><div class="sumcard" id="pxSum">' + sumHTML(model) + '</div>' +
          (C && canAsk ? '<div class="px-send"><button class="btn-main" id="pxSend" type="button">Save and send for review to Chromata Films</button><p class="px-sendmsg" id="pxSendMsg" role="status"></p></div>' : "") +
          '<p class="px-note px-note--valid" id="pxValid2">' + esc(validityText()) + "</p>" +
          "</div>" +
        "</div>" +
      "</section>" +

      (PH.length ? '<section class="px-photos" id="photographs">' +
        cutHTML("q-collage", { rt: "5vw", t: "-3vh", h: "23vh", rot: "6deg", hm: true }) +
        '<div class="px-wrap px-wrap--col"><p class="kicker">— A selection of our frames</p><h2 class="px-h2">' + (C ? Q.emLast(C.photosTitle) : "Moments we <em>witnessed</em>") + '</h2></div>' +
        '<div class="px-masonry">' + photos + "</div>" +
      "</section>" : "") +

      (!C ? Q.aboutSection() : C.about.on ? Q.aboutSection({ text: C.about.text || Q.ABOUT_GENERIC }) : "") +

      (!C || C.films || C.videos.length ? '<section class="px-films" id="films">' +
        '<div class="px-wrap px-wrap--col px-films__head"><p class="kicker">— A selection of our films</p><h2 class="px-h2">' + (C && C.videos.length ? Q.emLast(C.videosTitle) : "Stories we <em>filmed</em>") + '</h2>' +
          cutHTML("q-camera", { rt: "4vw", t: "-6vh", h: "26vh", rot: "-5deg", ml: "66vw", mt: "-14vh", mh: "12vh", mrot: "-4deg" }) + '</div>' +
        Q.stackHTML(C && C.videos.length ? Q.customVideoList(C) : null) +
      "</section>" : "") +

      '<section class="px-close">' +
        cutHTML("q-flute", { l: "1vw", b: "13vh", h: "30vh", rot: "7deg", hm: true }) +
        cutHTML("q-coupe", { rt: "1vw", b: "13vh", h: "30vh", rot: "-6deg", ml: "68vw", mt: "-6vh", mh: "15vh", mrot: "-5deg" }) +
        '<div class="px-wrap px-wrap--col px-wrap--center"><p class="kicker">Next step</p><h2 class="px-h2">Shall we make it <em>real</em>?</h2>' +
        '<p class="px-lead" id="pxLead">Tell us what you think, or what you would change. We answer every message personally, usually within 48 hours.</p>' +
        '<div class="px-hero__cta"><button class="btn-main" id="pxSign" type="button" hidden>Accept and sign online</button>' +
          '<a class="btn-main" id="pxReply" href="' + mailHref() + '">Reply by email</a><a class="btn-ghost" href="' + wa + '" target="_blank" rel="noopener">WhatsApp</a><button class="btn-ghost" id="pxPrint" type="button">Save as PDF</button></div>' +
        '<p class="px-signmsg" id="pxMsg" role="status"></p><p class="px-signnote" id="pxNote" hidden>You read the full agreement before signing. Your date is reserved once the first payment has been received.</p></div>' +
        '<footer class="px-foot"><span>' + esc(ADDRESS) + '</span><span><a href="mailto:' + Q.EMAIL + '">' + Q.EMAIL + '</a> · <a href="tel:+33768533991">' + PHONE + "</a></span></footer>" +
      "</section>";

    Array.prototype.forEach.call(document.querySelectorAll(".px-tile"), function (b) {
      b.addEventListener("click", function () { Q.lightbox.photo(PH, +b.getAttribute("data-i"), b); });
    });
    Q.lazyFrames();
    var pb = document.getElementById("pxPrint");
    pb.textContent = "Save as PDF";
    pb.addEventListener("click", function () { if (window.CQPdf) window.CQPdf.save(pb); else window.print(); });

    var sb = document.getElementById("pxSign");
    var set = function (id, t) { var e = document.getElementById(id); if (e) e.textContent = t; };
    /* Redraws the summary, the hero total and the validity line from the model. */
    function paint() {
      document.getElementById("pxSum").innerHTML = sumHTML(model);
      set("pxHeroL", "Total investment" + (model.inc ? " · all travel and accommodation fees included" : "")); set("pxHeroV", eur(model.total));
      set("pxTravelNote", model.inc ? "All travel and accommodation fees are included." : C ? C.note : Q.travelNote(A));
      set("pxValid", validityText()); set("pxValid2", validityText());
      var r = document.getElementById("pxReply"); if (r) r.setAttribute("href", mailHref());
    }
    /* The studio's current version of the quote (built in its back office) replaces the one in the link: same page, same link,
       so every change the studio saves shows up here by itself. Without it, once the studio has only filled in the travel fees,
       the TBC line reads "Included" and the total becomes the final amount. */
    function applyStatus(st) {
      if (!st || !st.found) return;
      if (st.valid_until) { validity.until = st.valid_until; validity.expired = !!st.expired; }
      if (C) { paint(); return; }
      if (Array.isArray(st.lines) && st.lines.length && st.total != null) {
        model = { rows: st.lines.map(function (r) { return { l: String(r.l || ""), p: +r.p || 0, t: r.t === "tbc" || r.t === "inc" || r.t === "opt" ? r.t : "", s: r.s ? String(r.s) : "" }; }), total: +st.total, inc: st.lines.some(function (r) { return r.t === "inc"; }) };
      } else if (st.travel_fees != null && st.total != null) {
        model = { rows: model.rows.map(function (r) { return r.t === "tbc" ? { l: "Travel / accommodation", p: 0, t: "inc" } : r; }), total: +st.total, inc: true };
      }
      paint();
    }
    /* ---------- custom quote: pick a package and video upgrades, send the choice for review ---------- */
    var sendBusy = false;
    function refresh() {
      var q = Q.customQuote(Q.customView(C, sel), { client: true });
      model = { rows: q.rows, total: q.total, inc: C.travel.show };
      paint(); sendUI(); setSign();
    }
    function drawCompare() { var h = document.getElementById("collection"); if (h) h.outerHTML = Q.customCompare(Q.customView(C, sel), { id: "collection", pick: true }); }
    function syncUps() {
      Array.prototype.forEach.call(document.querySelectorAll(".px-up, .px-dir"), function (el) {
        var i = +el.getAttribute("data-i"), on = sel.ups.indexOf(i) > -1, b = el.querySelector(".px-up__sel"), t = el.querySelector(".px-up__s");
        el.classList.toggle("is-sel", on);
        if (b) b.setAttribute("aria-checked", String(on));
        if (t) t.textContent = el.classList.contains("px-dir") ? (on ? "Added to your quote" : "Add to my quote") : (on ? "Selected" : "Not selected");
        /* a line sold per day: the day buttons, the sentence under them and the price follow the number of days picked */
        var l = C.lines[i];
        if (l && l.days) {
          var n = sel.days[i] || l.qty, info = Q.dayInfo(l, n), sum = el.querySelector(".px-days__sum"), pr = el.querySelector(".px-dir__p, .px-up__p");
          Array.prototype.forEach.call(el.querySelectorAll(".px-days__b"), function (d) { var is = +d.getAttribute("data-n") === n; d.classList.toggle("is-on", is); d.setAttribute("aria-checked", String(is)); });
          if (sum) sum.textContent = info.sum;
          if (pr) pr.textContent = (info.amount < 0 ? "− " : "+ ") + eur(Math.abs(info.amount));
        }
      });
    }
    var SEND_LABEL = "Save and send for review to Chromata Films";
    function sendUI() {
      var btn = document.getElementById("pxSend"), msg = document.getElementById("pxSendMsg");
      if (!C || !btn || !msg || sendBusy) return;
      var isSent = !!sent && Q.sameSel(sel, sent), dirty = !Q.sameSel(sel, base);
      btn.disabled = isSent || locked; btn.textContent = isSent ? "Sent for review" : SEND_LABEL;
      msg.textContent = locked ? "" : isSent ? "Your selection was sent to Chromata Films. We will come back to you shortly, and you will then be able to accept and sign." : (dirty || sent) ? "Your changes are not sent yet: press the button to send them to us for review." : "";
    }
    /* the signing button is only there when the quote is validated, and (custom quote) when the client's selection is the one the studio holds */
    function setSign() {
      var show = signOK && !locked && (!C || (!sent && Q.sameSel(sel, base)));
      sb.hidden = !show; var n = document.getElementById("pxNote"); if (n) n.hidden = !show;
    }
    function lockUI() { locked = true; app.classList.add("px-locked"); sendUI(); setSign(); }
    function alertSelection(email, res) {
      var fd = new FormData(), v = Q.customView(C, sel), pk = v.packages.filter(function (p) { return p.id === v.chosen; })[0];
      var ups = Q.customUpIdx(C).filter(function (i) { return sel.ups.indexOf(i) > -1; }).map(function (i) { var l = C.lines[i]; return l.days ? l.name + " × " + sel.days[i] + (sel.days[i] > 1 ? " days" : " day") : l.name; });
      fd.append("_subject", "Selection sent for review · " + A.names); fd.append("_template", "table"); fd.append("_captcha", "false");
      fd.append("name", email || A.names); if (email) fd.append("email", email);
      fd.append("Proposal", ref + " · " + A.names);
      fd.append("Package", pk ? pk.name : "");
      fd.append("Video upgrades", ups.length ? ups.join(", ") : "None");
      fd.append("Total", eur(model.total));
      if (res && res.project) fd.append("Back office", location.origin + location.pathname.replace(/[^/]*$/, "") + "crm.html#/project/" + res.project);
      return fetch("https://formsubmit.co/ajax/" + Q.EMAIL, { method: "POST", headers: { Accept: "application/json" }, body: fd });
    }
    if (C) {
      app.addEventListener("click", function (e) {
        if (locked || !e.target.closest) return;
        var col = e.target.closest(".px-col.is-pick");
        if (col) {
          sel.chosen = col.getAttribute("data-v"); drawCompare(); refresh();
          var nc = document.querySelector('.px-col[data-v="' + sel.chosen + '"]'); if (nc && nc.focus) nc.focus({ preventScroll: true });
          return;
        }
        var db = e.target.closest(".px-days__b");
        if (db) {   // the number of days of a line sold per day (1 to 5): picking one also adds the upgrade to the quote
          e.preventDefault();
          var di = +db.getAttribute("data-i"); sel.days[di] = +db.getAttribute("data-n");
          if (sel.ups.indexOf(di) < 0) sel.ups = Q.customToggle(C, sel.ups, di, true);   // (an upgrade that comes with another one also picks it)
          syncUps(); refresh();
          var nb = document.querySelector('.px-days__b[data-i="' + di + '"][data-n="' + sel.days[di] + '"]'); if (nb && nb.focus) nb.focus({ preventScroll: true });
          return;
        }
        var ub = e.target.closest(".px-up__sel");
        if (ub) {
          e.preventDefault();
          var i = +ub.getAttribute("data-i"), k = sel.ups.indexOf(i);
          sel.ups = Q.customToggle(C, sel.ups, i, k < 0);
          syncUps(); refresh();
        }
      });
      app.addEventListener("keydown", function (e) {
        if (locked || (e.key !== "Enter" && e.key !== " ") || !e.target.closest) return;
        var col = e.target.closest(".px-col.is-pick");
        if (col && e.target === col) { e.preventDefault(); col.click(); }
      });
      var sendBtn = document.getElementById("pxSend");
      if (sendBtn) sendBtn.addEventListener("click", function () {
        if (locked || sendBusy) return;
        sendBusy = true; sendBtn.disabled = true; sendBtn.textContent = "Sending…";
        var msg = document.getElementById("pxSendMsg"); msg.textContent = "";
        var email = ""; try { email = localStorage.getItem("cq-visitor-email") || ""; } catch (x) {}
        var snap = snapOf(sel);
        window.CQLink.selection(A.nonce, { chosen: snap.chosen, ups: snap.ups, days: snap.days, email: email }).then(function (res) {
          sent = snap; sendBusy = false;
          alertSelection(email, res).catch(function () {});
          sendUI(); setSign();
        }).catch(function (e) {
          sendBusy = false; sendBtn.disabled = false; sendBtn.textContent = SEND_LABEL;
          msg.textContent = e && e.message && !/fetch|network|load failed/i.test(e.message) ? e.message : "We could not send your selection just now. Please try again, or reply by email.";
        });
      });
      sendUI();
    }
    var ready = function () { app.classList.remove("px-wait"); };

    /* ---------- email gate ----------
       When the studio has it switched on (back office > Settings, on by default), nothing of the proposal is shown until the visitor types an email.
       The opening is logged in the back office and an alert email (who, when, how many times) is sent to the studio. This is a way to know who opens a link,
       not a lock: the studio's own browser (signed in to the back office) and a tab that already passed the gate are let through. */
    var GATE_KEY = "cq-open-" + (A.nonce || "x"), root = document.documentElement;
    function passed() { try { return sessionStorage.getItem(GATE_KEY) === "1" || localStorage.getItem("cq-studio") === "1"; } catch (e) { return false; } }
    var needsCheck = canAsk && !passed();
    var release = function () { root.classList.remove("px-gated-wait"); };
    var gaveUp = false;
    if (needsCheck) { root.classList.add("px-gated-wait"); setTimeout(function () { if (!document.querySelector(".px-gate")) { gaveUp = true; release(); } }, 5000); }   // never lock a visitor out because the database is slow

    function timeout(p, ms) { return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error("timeout")); }, ms); })]); }
    function alertStudio(email, res) {
      var fd = new FormData(), when = new Date().toLocaleString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
      fd.append("_subject", "Proposal opened · " + A.names + " · " + email);
      fd.append("_template", "table"); fd.append("_captcha", "false");
      fd.append("name", email); fd.append("email", email);
      fd.append("Opened by", email);
      fd.append("Proposal", ref + " · " + A.names + (A.role === "planner" && A.planner ? " (sent by wedding planner " + A.planner + ")" : ""));
      fd.append("Wedding date", Q.fmtDate(A.date) || "Not given");
      fd.append("Opened on", when);
      fd.append("Times opened", res && res.opens ? String(res.opens) : "unknown");
      fd.append("Device", String(navigator.userAgent || "").slice(0, 160));
      if (res && res.project) fd.append("Back office", location.origin + location.pathname.replace(/[^/]*$/, "") + "crm.html#/project/" + res.project);
      return fetch("https://formsubmit.co/ajax/" + Q.EMAIL, { method: "POST", headers: { Accept: "application/json" }, body: fd });
    }
    function showGate() {
      var saved = ""; try { saved = localStorage.getItem("cq-visitor-email") || ""; } catch (e) {}
      var g = document.createElement("div"); g.className = "px-gate"; g.setAttribute("role", "dialog"); g.setAttribute("aria-modal", "true"); g.setAttribute("aria-labelledby", "pxGateT");
      g.innerHTML = '<form class="px-gate__card" novalidate><img class="px-gate__mark" src="assets/img/logo-mark.png" alt="" width="34" height="68">' +
        '<p class="kicker">Your private proposal</p><h1 class="px-gate__t" id="pxGateT">Prepared for <em>' + esc(A.names) + "</em></h1>" +
        '<p class="px-gate__p">Please tell us who is opening this proposal. We only use your email to follow up with you personally.</p>' +
        '<label class="px-gate__f"><span>Your email</span><input type="email" name="email" autocomplete="email" required placeholder="you@email.com" value="' + esc(saved) + '"></label>' +
        '<p class="px-gate__err" role="alert"></p><button class="btn-main" type="submit">Open my proposal</button></form>';
      document.body.appendChild(g);
      var form = g.querySelector("form"), input = form.elements.email, err = g.querySelector(".px-gate__err"), btn = g.querySelector("button");
      input.focus();
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = input.value.trim();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) { err.textContent = "Please enter a valid email address."; input.setAttribute("aria-invalid", "true"); input.focus(); return; }
        err.textContent = ""; input.removeAttribute("aria-invalid"); btn.disabled = true; btn.textContent = "Opening…";
        /* both the log and the alert are best effort: a slow network never keeps the visitor out once they have given their email */
        timeout(window.CQLink.open(A, email), 5000).catch(function () { return null; }).then(function (res) {
          return timeout(alertStudio(email, res), 5000).catch(function () {});
        }).then(function () {
          try { sessionStorage.setItem(GATE_KEY, "1"); localStorage.setItem("cq-visitor-email", email); } catch (x) {}
          g.remove(); release(); window.scrollTo(0, 0);
        });
      });
    }

    if (canAsk && !st0) {
      /* the prices stay hidden for a split second until the studio's latest version has been fetched (never longer than 3 s) */
      app.classList.add("px-wait"); setTimeout(ready, 3000);
    }
    if (canAsk) (st0 ? Promise.resolve(st0) : window.CQLink.status(A)).then(function (st) {
      if (needsCheck && !gaveUp) { if (st && st.found && st.gate) showGate(); else release(); }
      applyStatus(st); ready();
      if (C) { sendUI(); }
      if (st && st.signed) { lockUI(); document.getElementById("pxMsg").textContent = "This proposal has already been signed. Thank you, we are delighted!"; return; }
      if (st && st.expired) {
        lockUI();
        document.getElementById("pxMsg").textContent = validityText();
        return;
      }
      if (!(st && st.validated)) return;
      signOK = true; setSign();
      document.getElementById("pxReply").className = "btn-ghost";
      document.getElementById("pxLead").textContent = "Your proposal has been reviewed by our team. If you are happy with it, accept it and sign the agreement online, it takes about two minutes. Or tell us what you would change: we answer every message personally.";
    }).catch(function () { ready(); release(); });
    sb.addEventListener("click", function () {
      var msg = document.getElementById("pxMsg"), label = sb.textContent;
      sb.disabled = true; sb.textContent = "Preparing your agreement…"; msg.textContent = "";
      window.CQLink.accept(A).then(function (r) {
        if (r && r.token) { location.href = "sign.html#" + r.token; return; }
        if (r && r.signed) { sb.textContent = label; msg.textContent = "This proposal has already been signed. Thank you, we are delighted!"; return; }
        throw new Error("");
      }).catch(function (e) {
        sb.disabled = false; sb.textContent = label;
        var m = e && e.message && !/fetch|network|load failed/i.test(e.message) ? e.message : "We could not open the agreement just now.";
        msg.textContent = m + (/reply to us by email|write to us|reply by email/i.test(m) ? "" : " You can also reply by email and we will send it to you.");
      });
    });
  }
})();
