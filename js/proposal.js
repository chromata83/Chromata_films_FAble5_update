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
  var ref = "CF-" + (P.id || "PROPOSAL");
  var issued = P.ts ? new Date(P.ts).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
  var meta = [Q.fmtDate(A.date), A.place, A.venue].filter(Boolean).map(esc).join(" · ");
  document.title = "Proposal for " + A.names + " · Chromata Films";

  var subject = "Proposal " + ref + " · " + A.names;
  var mail = "mailto:" + Q.EMAIL + "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent("Hello Chromata Films,\n\nWe have seen our proposal (" + ref + ") and would love to talk about it.\n\n" + Q.recapText(A) + "\n\nNames: " + A.names + "\n");
  var wa = "https://wa.me/" + Q.WHATSAPP + "?text=" + encodeURIComponent("Hello Chromata Films, we have seen our proposal " + ref + " (" + A.names + ").");

  var rows = L.map(function (l) { return '<div class="srow"><span class="sl">' + esc(l.label) + '</span><span class="sr">' + (l.tbc ? "TBC" : eur(l.price)) + "</span></div>"; }).join("");

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
        '<div class="px-total"><span class="tl">Total investment</span><span class="tv">' + eur(tot) + '</span></div>' +
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
        '<p class="px-note">' + esc(Q.travelNote(A)) + '</p></div>' +
        '<div class="px-card"><div class="sumcard">' + rows +
          '<div class="srow grand"><span class="sl">Total investment</span><span class="sr">' + eur(tot) + "</span></div></div>" +
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
      '<p class="px-lead">Tell us what you think, or what you would change. We answer every message personally, usually within 48 hours.</p>' +
      '<div class="px-hero__cta"><a class="btn-main" href="' + mail + '">Reply by email</a><a class="btn-ghost" href="' + wa + '" target="_blank" rel="noopener">WhatsApp</a><button class="btn-ghost" id="pxPrint" type="button">Save as PDF</button></div></div>' +
      '<footer class="px-foot"><span>' + esc(ADDRESS) + '</span><span><a href="mailto:' + Q.EMAIL + '">' + Q.EMAIL + '</a> · <a href="tel:+33768533991">' + PHONE + "</a></span></footer>" +
    "</section>";

  Array.prototype.forEach.call(document.querySelectorAll(".px-tile"), function (b) {
    b.addEventListener("click", function () { Q.lightbox.photo(Q.PHOTOS, +b.getAttribute("data-i"), b); });
  });
  Q.lazyFrames();
  document.getElementById("pxPrint").addEventListener("click", function () { window.print(); });
})();
