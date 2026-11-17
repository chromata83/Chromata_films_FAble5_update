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

  var P = Q.parseProposal(location.hash);
  Q.initMenu();
  Q.lightbox.init();

  if (!P) {
    document.title = "Your proposal · Chromata Films";
    app.innerHTML = '<section class="px-error"><div><p class="kicker">Your proposal</p><h1>This link looks <em>incomplete</em></h1>' +
      '<p>Part of the address may have been cut when it was copied. Please open the link from your email again, or write to us and we will send it right away.</p>' +
      '<a class="btn-main" href="mailto:' + Q.EMAIL + '">' + Q.EMAIL + "</a></div></section>";
    return;
  }

  var A = P.answers, L = Q.lines(A), tot = Q.total(A);
  var ref = "CF-" + (P.id ? P.id.slice(0, 6) : "PROPOSAL");
  var issued = P.ts ? new Date(P.ts).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
  var meta = [Q.fmtDate(A.date), A.place, A.venue].filter(Boolean).map(esc).join(" · ");
  document.title = "Proposal for " + A.names + " · Chromata Films";

  var subject = "Proposal " + ref + " · " + A.names;
  /* the reply email quotes what the page shows right now (the studio's version once it exists) */
  function mailHref() {
    var recap = model.rows.map(function (r) { return "- " + r.l + ": " + (r.t === "tbc" ? "TBC" : r.t === "inc" ? "Included" : eur(r.p)); }).join("\n") + "\n\nTOTAL INVESTMENT: " + eur(model.total) + (model.inc ? " (all travel and accommodation fees included)" : "");
    return "mailto:" + Q.EMAIL + "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent("Hello Chromata Films,\n\nWe have seen our proposal (" + ref + ") and would love to talk about it.\n\n" + recap + "\n\nNames: " + A.names + "\n");
  }
  var wa = "https://wa.me/" + Q.WHATSAPP + "?text=" + encodeURIComponent("Hello Chromata Films, we have seen our proposal " + ref + " (" + A.names + ").");

  /* The signing button is only shown once the studio has reviewed and validated this quote in its back office
     (the database refuses the signature otherwise). Until then the page simply invites the couple to write to us. */
  var canAsk = !!(window.CQLink && window.CQLink.enabled && A.nonce && A.nonce.length >= 10 && Q.ISO.test(A.date || ""));

  /* What the page shows is a small model: priced rows + a total. It starts from the couple's own choices (the link), then,
     when the studio has built its own version of the quote in the back office, that version replaces it (see paint()). */
  var model = { rows: L.map(function (l) { return { l: l.label, p: l.price, t: l.tbc ? "tbc" : "" }; }), total: tot, inc: false };
  function sumHTML(m) {
    return m.rows.map(function (r) {
      return '<div class="srow"><span class="sl">' + esc(r.l) + '</span><span class="sr">' + (r.t === "tbc" ? "TBC" : r.t === "inc" ? "Included" : eur(r.p)) + "</span></div>";
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

  var photos = Q.PHOTOS.map(function (p, i) {
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
        '<p class="px-lead">Thank you for thinking of us. Everything you chose is gathered below, exactly as you composed it.</p>' +
        '<div class="px-total"><span class="tl" id="pxHeroL">Total investment</span><span class="tv" id="pxHeroV">' + eur(tot) + '</span></div>' +
        '<p class="px-valid" id="pxValid">' + esc(validityText()) + "</p>" +
        '<div class="px-hero__cta"><a class="btn-main" href="#selections">Your selections</a><a class="btn-ghost" href="#photographs">Our work</a></div>' +
        '<p class="px-ref">' + esc(ref) + (issued ? " · " + esc(issued) : "") + "</p>" +
      "</div>" +
      '<div class="px-hero__img"><img class="hero" alt="" src="' + Q.STEP_IMG.proposal + '"></div>' +
      cutHTML("q-intro", { l: "43.5%", b: "-5vh", h: "54vh", rot: "-5deg", ml: "3vw", mt: "2vh", mh: "24vh", mrot: "-4deg" }) +
    "</section>" +

    '<section class="px-sel" id="selections">' +
      cutHTML("q-swan", { l: "3vw", b: "-5vh", h: "28vh", rot: "-8deg", ml: "62vw", mt: "-4vh", mh: "14vh", mrot: "-6deg" }) +
      '<div class="px-wrap">' +
        '<div><p class="kicker">Your selections</p><h2 class="px-h2">Your day, <em>composed</em></h2>' +
        '<p class="px-note" id="pxTravelNote">' + esc(Q.travelNote(A)) + '</p></div>' +
        '<div class="px-card"><div class="sumcard" id="pxSum">' + sumHTML(model) + '</div><p class="px-note px-note--valid" id="pxValid2">' + esc(validityText()) + "</p>" +
        "</div>" +
      "</div>" +
    "</section>" +

    '<section class="px-photos" id="photographs">' +
      cutHTML("q-collage", { rt: "5vw", t: "-3vh", h: "23vh", rot: "6deg", hm: true }) +
      '<div class="px-wrap px-wrap--col"><p class="kicker">— A selection of our photographs</p><h2 class="px-h2">Moments we <em>kept</em></h2></div>' +
      '<div class="px-masonry">' + photos + "</div>" +
    "</section>" +

    '<section class="px-films" id="films">' +
      '<div class="px-wrap px-wrap--col px-films__head"><p class="kicker">— A selection of our films</p><h2 class="px-h2">Stories we <em>filmed</em></h2>' +
        cutHTML("q-camera", { rt: "4vw", t: "-6vh", h: "26vh", rot: "-5deg", ml: "66vw", mt: "-14vh", mh: "12vh", mrot: "-4deg" }) + '</div>' +
      Q.stackHTML() +
    "</section>" +

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
    b.addEventListener("click", function () { Q.lightbox.photo(Q.PHOTOS, +b.getAttribute("data-i"), b); });
  });
  Q.lazyFrames();
  document.getElementById("pxPrint").addEventListener("click", function () { window.print(); });

  var sb = document.getElementById("pxSign");
  var set = function (id, t) { var e = document.getElementById(id); if (e) e.textContent = t; };
  /* Redraws the summary, the hero total and the validity line from the model. */
  function paint() {
    document.getElementById("pxSum").innerHTML = sumHTML(model);
    set("pxHeroL", "Total investment" + (model.inc ? " · all travel and accommodation fees included" : "")); set("pxHeroV", eur(model.total));
    set("pxTravelNote", model.inc ? "All travel and accommodation fees are included." : Q.travelNote(A));
    set("pxValid", validityText()); set("pxValid2", validityText());
    var r = document.getElementById("pxReply"); if (r) r.setAttribute("href", mailHref());
  }
  /* The studio's current version of the quote (built in its back office) replaces the one in the link: same page, same link,
     so every change the studio saves shows up here by itself. Without it, once the studio has only filled in the travel fees,
     the TBC line reads "Included" and the total becomes the final amount. */
  function applyStatus(st) {
    if (!st || !st.found) return;
    if (st.valid_until) { validity.until = st.valid_until; validity.expired = !!st.expired; }
    if (Array.isArray(st.lines) && st.lines.length && st.total != null) {
      model = { rows: st.lines.map(function (r) { return { l: String(r.l || ""), p: +r.p || 0, t: r.t === "tbc" || r.t === "inc" ? r.t : "" }; }), total: +st.total, inc: st.lines.some(function (r) { return r.t === "inc"; }) };
    } else if (st.travel_fees != null && st.total != null) {
      model = { rows: model.rows.map(function (r) { return r.t === "tbc" ? { l: "Travel / accommodation", p: 0, t: "inc" } : r; }), total: +st.total, inc: true };
    }
    paint();
  }
  var ready = function () { app.classList.remove("px-wait"); };
  if (canAsk) {
    /* the prices stay hidden for a split second until the studio's latest version has been fetched (never longer than 3 s) */
    app.classList.add("px-wait"); setTimeout(ready, 3000);
  }
  if (canAsk) window.CQLink.status(A).then(function (st) {
    applyStatus(st); ready();
    if (st && st.signed) { document.getElementById("pxMsg").textContent = "This proposal has already been signed. Thank you, we are delighted!"; return; }
    if (st && st.expired) {
      document.getElementById("pxMsg").textContent = validityText();
      return;
    }
    if (!(st && st.validated)) return;
    sb.hidden = false; document.getElementById("pxNote").hidden = false;
    document.getElementById("pxReply").className = "btn-ghost";
    document.getElementById("pxLead").textContent = "Your proposal has been reviewed by our team. If you are happy with it, accept it and sign the agreement online, it takes about two minutes. Or tell us what you would change: we answer every message personally.";
  }).catch(ready);
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
})();
