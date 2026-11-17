/* ============================================================
   CHROMATA FILMS — quotation core
   Shared by quotation.html (the couple's configurator) and proposal.html
   (the private page that opens from "See my proposal").

   Everything price-related lives HERE and nowhere else: change a number in
   this file and the configurator, the recap, the email and every proposal
   page follow. A proposal link only carries the couple's CHOICES (codes like
   "premium" or "redcarpet"), never prices — prices are always recomputed from
   the tables below.
   ============================================================ */
(function (w) {
  "use strict";

  var EMAIL = "contact@chromatafilms.com";
  var WHATSAPP = "33768533991";
  var PRICE_VERSION = 1;
  /* A quotation is valid for 14 days after the day it was issued. The same number is in docs/crm/schema.sql. */
  var VALID_DAYS = 14;

  /* ---------- helpers ---------- */
  var eur = function (n) { return "€" + Math.round(n).toLocaleString("en-US"); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var clip = function (s, n) { return String(s == null ? "" : s).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n); };

  /* ---------- price tables (EUR) ---------- */
  var EVENT_HOURS = [
    { v: "0", label: "Not now, maybe later", skip: true },
    { v: "3", label: "Three hours", short: "3 hours", price: 4450 },
    { v: "4", label: "Four hours", short: "4 hours", price: 5000 },
    { v: "5", label: "Five hours", short: "5 hours", price: 6200 }
  ];

  var COLLECTIONS = [
    { v: "classic", name: "Classic collection", short: "Classic", price: 14500, from: true,
      sub: "10 hours of presence · 2 shooters · drone operator · all shot by one of our team · one highlight film 3/4 min · one feature film around 18 min" },
    { v: "premium", name: "Premium collection", short: "Premium", price: 18500, from: true,
      sub: "10 hours of presence · 3 shooters · drone operator, also on the extra days for the entire event · with one of Chromata’s founders in the team, shooting · one highlight film 4/5 min · one feature film around 25 min · one 1 min IG reel" },
    { v: "ultimate", name: "Ultimate collection", short: "Ultimate", price: 24500, from: true,
      sub: "12 hours of presence · 3 shooters · drone operator, also on the extra days for the entire event · with one of Chromata’s founders in the team, shooting · one highlight film 4/5 min · one feature film around 25 min · three 1 min IG reels · one little surprise on the wedding day · an extra separate film of the full speeches and the full ceremony · an editorial session offered the morning of the welcome event, in the surroundings" }
  ];

  /* The three collections side by side (columns: Classic, Premium, Ultimate). k = the row's name, v = the value shown in the table,
     t = the phrase shown in a card, on = [1, 0, ...] a tick where it is included. Shown on the configurators' last screen and on the proposal page. */
  var COMPARE = [
    { k: "Hours of presence", v: ["10 h", "10 h", "12 h"], t: ["10 hours of presence", "10 hours of presence", "12 hours of presence"] },
    { k: "Shooters", v: ["2", "3", "3"], t: ["2 shooters", "3 shooters", "3 shooters"] },
    { k: "Highlight film", v: ["3/4 min", "4/5 min", "4/5 min"], t: ["One highlight film, 3/4 min", "One highlight film, 4/5 min", "One highlight film, 4/5 min"] },
    { k: "Feature film", v: ["~18 min", "~25 min", "~25 min"], t: ["One feature film, around 18 min", "One feature film, around 25 min", "One feature film, around 25 min"] },
    { k: "1 min Instagram reel", on: [0, 1, 1], v: ["", "× 1", "× 3"], t: ["One 1 min IG reel", "One 1 min IG reel", "One 1 min IG reel × 3"] },
    { k: "A drone operator on the wedding day", on: [1, 1, 1] },
    { k: "The drone operator also on the extra days, for the entire event", on: [0, 1, 1] },
    { k: "One of Chromata’s founders in the team, shooting", on: [0, 1, 1] },
    { k: "One little surprise on the wedding day", on: [0, 0, 1] },
    { k: "An extra separate film of the full speeches and the full ceremony", on: [0, 0, 1] },
    { k: "An editorial session, offered the morning of the welcome event", on: [0, 0, 1] }
  ];
  /* The three collections as three columns (cards). On the proposal page they are a static summary; on the configurators (pick: true) a card is a
     button: choosing it changes the collection and the total follows. The chosen collection is yellow, the others white. */
  function compareSection(a, o) {
    o = o || {};
    var chosen = a && a.wedding, base = o.pick ? total(a) : 0;
    var cols = COLLECTIONS.map(function (c, i) {
      var is = chosen === c.v, price = "";
      if (o.pick) {
        var t = total(Object.assign({}, a, { wedding: c.v })), d = t - base;
        price = '<p class="px-col__price">Your total <strong>' + eur(t) + "</strong>" + (is ? "" : "<span>" + (d > 0 ? "+" : "−") + eur(Math.abs(d)) + "</span>") + "</p>";
      }
      return '<article class="px-col' + (is ? " is-chosen" : "") + (o.pick ? " is-pick" : "") + '"' + (o.pick ? ' data-v="' + c.v + '" tabindex="0" role="button" aria-pressed="' + is + '" aria-label="' + (is ? "Your choice: " : "Choose ") + esc(c.name) + '"' : "") + '><header><span class="px-col__tag">' + (is ? "Your choice" : (o.pick ? "Choose this one" : "&nbsp;")) + "</span><h3>" + esc(c.short) + "<small>collection</small></h3>" + price + "</header><ul>" +
        COMPARE.map(function (r) {
          var on = r.on ? !!r.on[i] : true, text = r.t ? r.t[i] : r.k;
          return '<li class="' + (on ? "on" : "off") + '"><span class="bx" aria-hidden="true"></span><span>' + esc(text) + (on ? "" : '<em class="sr-only"> (not included)</em>') + "</span></li>";
        }).join("") + "</ul></article>";
    }).join("");
    return '<section class="px-compare' + (o.pick ? " px-compare--cfg" : "") + '"' + (o.id ? ' id="' + o.id + '"' : "") + '><div class="px-wrap px-wrap--col"><p class="kicker">' + (o.pick ? "Compare and choose" : "Your collection") + '</p><h2 class="px-h2">' +
      (o.pick ? "Change your collection <em>at will</em>" : "What each collection <em>includes</em>") + '</h2></div><div class="px-cols">' + cols + "</div></section>";
  }

  /* "Moments we witnessed": the same mosaic of photographs as on the proposal page (Q.PHOTOS). On the configurators the tiles are plain pictures. */
  function photosSection() {
    return '<section class="px-photos px-photos--cfg" id="qxPhotos"><div class="px-wrap px-wrap--col"><p class="kicker">— A selection of our frames</p><h2 class="px-h2">Moments we <em>witnessed</em></h2></div>' +
      '<div class="px-masonry">' + PHOTOS.map(function (p) { return '<div class="px-tile"><img src="' + p.src + '" alt="' + esc(p.alt) + '" loading="lazy"></div>'; }).join("") + "</div></section>";
  }

  /* "About": one paragraph from the Studio page (The Philosophy, The Inspiration, and the VFX pedigree of Kevin Lopez, co-founder), with Kevin and Laura's portrait
     and the posters of the films Kevin worked on. Same on the configurators' last screen and on the proposal page, for couples and planners. */
  var ABOUT = "Chromata Films makes visual narratives, not documentation: authentic storytelling, created with premium vendors and French-inspired sophistication, in a relaxed atmosphere where you can simply be yourselves. " +
    "Our muses are Salvador Dalí and Elsa Schiaparelli, who proved that the unexpected can also be the most desirable thing in the room, so we look for the surreal detail hidden inside a real day and frame it with a couturier’s eye. " +
    "And before weddings, our co-founder and film director Kevin Lopez spent a decade in visual effects for major studios, helping craft images for some of the biggest films ever made — Star Wars, Beauty and the Beast, The Great Gatsby, Avengers — which is exactly what he brings to your wedding day: the same standards, the same tools, and a far better leading couple.";
  var POSTERS = [["star-wars", "Star Wars: The Last Jedi"], ["beauty-beast", "Beauty and the Beast"], ["gatsby", "The Great Gatsby"], ["avengers", "Avengers: Infinity War"], ["fantastic-four", "Fantastic Four"], ["still", "Solo: A Star Wars Story"]];
  function aboutSection() {
    return '<section class="px-about" id="about">' +
      '<img class="px-about__art" alt="" aria-hidden="true" draggable="false" loading="lazy" src="assets/img/quote/q-lobster.webp">' +
      '<div class="px-wrap px-about__head"><div><p class="kicker">— About Chromata</p><h2 class="px-h2">Visual narratives, not <em>documentation</em></h2>' +
      '<p class="px-about__p">' + esc(ABOUT) + "</p></div>" +
      '<figure class="px-about__who"><img src="assets/img/quote/n-kevin.jpg" alt="Kevin and Laura Lopez, co-founders of Chromata Films, at the RSVP Awards gala night" loading="lazy" width="1400" height="1866"><figcaption>Kevin &amp; Laura Lopez<small>Co-founders · RSVP Awards gala night</small></figcaption></figure></div>' +
      '<div class="px-posters">' + POSTERS.map(function (p) { return '<figure><img src="assets/img/blockbusters/' + p[0] + '.jpg" alt="' + esc(p[1]) + ' — poster" loading="lazy"></figure>'; }).join("") + "</div>" +
    "</section>";
  }

  var TEAM = [
    { v: "shooter", name: "Extra shooter", sub: "", price: 2290, plus: true },
    { v: "fpv", name: "Extra drone operator", sub: "For FPV shots", price: 1290, plus: true }
  ];

  var OPTIONS = [
    { v: "feature", name: "Extra long feature film", sub: "45 minutes to 1 hour", price: 5990 },
    { v: "priority", name: "Editing priority for the feature film", sub: "Delivery time around 1 month", price: 5490 },
    { v: "hour", name: "Extra hour", sub: "", price: 1200, unit: "hour", max: 8, nomk: true },
    { v: "redcarpet", name: "The Red Carpet experience", sub: "A video booth for extra slow-mo portraits, cinema camera at 800 frames per second, with operator", price: 6990, unit: "day", max: 5 },
    { v: "vintage", name: "The 8mm or 16mm vintage camera", sub: "With operator, to create a special short film on the side", price: 7490, unit: "day", max: 5 },
    { v: "music", name: "Unique music for your highlight film", sub: "Created by a film musician", price: 3200 },
    { v: "ai", name: "Some AI augmented visuals", sub: "In your Instagram and highlight films", price: 2990 }
  ];

  var CREATOR = [
    { v: "0", label: "Not now, maybe later", skip: true },
    { v: "1", label: "A content creator at your disposal", sub: "Shoots run and gun for same day edit delivery · Excl. travel / accommodation", price: 3445 }
  ];

  var PRIVACY = [
    { v: "A", label: "You can share everything", price: 0 },
    { v: "B", label: "Only decor, no humans", price: 2000 },
    { v: "C", label: "Nothing at all, keep it private", price: 3000 }
  ];

  /* Travel & accommodation is never priced here: it is always confirmed in the personal quote. */
  var TRAVEL_TBC = "TBC depending on location and number of days to cover";

  var by = function (arr, v) { for (var i = 0; i < arr.length; i++) if (arr[i].v === v) return arr[i]; return null; };

  /* ---------- wedding planner rates (quotation-WP.html only) ----------
     A quote made on the planner page carries mk = "wp". Then, in percent:
       +10%  the wedding day collection, the welcome event, the brunch / farewell party
       +5%   the options (except extra hours), the content creator, the privacy level
       +0%   extra shooter, extra drone operator, extra hours
     (the keys are the same letters as in the selection and in the database price table). The couple's page never sets mk. */
  var MARKUP = { c: 10, w: 10, b: 10, o: 5, k: 5, p: 5 };
  /* With one of these collections AND both extra days (welcome event + brunch), the planner's +10% is waived on those two lines. */
  var EV_WAIVE = ["premium", "ultimate"];
  function evWaived(a) {
    if (!a || a.mk !== "wp" || EV_WAIVE.indexOf(a.wedding) < 0) return false;
    var w = by(EVENT_HOURS, a.welcome), b = by(EVENT_HOURS, a.brunch);
    return !!(w && w.price && b && b.price);
  }
  /* price after the planner rate, in whole euros; integer maths so it equals the database to the euro */
  function up(price, key, a) {
    return a && a.mk === "wp" && MARKUP[key] ? Math.round(price * (100 + MARKUP[key]) / 100) : price;
  }

  /* ---------- the couple's answers ---------- */
  function blank() {
    return { welcome: null, wedding: null, team: [], brunch: null, options: {}, creator: null, privacy: "A",
             names: "", email: "", date: "", place: "", venue: "", role: "couple", planner: "", nonce: "", mk: "" };
  }

  /* Turns answers into priced lines. Order follows the on-screen recap. */
  function lines(a) {
    var L = [], x;
    if ((x = by(COLLECTIONS, a.wedding))) L.push({ key: "wedding", label: "Wedding day · " + x.name, price: up(x.price, "c", a), from: true });
    (a.team || []).forEach(function (id) { var t = by(TEAM, id); if (t) L.push({ key: "team", label: t.name + (t.sub ? " · " + t.sub : ""), price: t.price }); });
    L.push({ key: "travel", label: "Travel / accommodation \u00B7 " + TRAVEL_TBC, price: 0, tbc: true });
    /* No percentage is ever written on a line: planners often forward their quote to the couple. */
    var waived = evWaived(a);
    if ((x = by(EVENT_HOURS, a.welcome)) && x.price) L.push({ key: "welcome", label: "Welcome event · " + x.short, price: waived ? x.price : up(x.price, "w", a) });
    if ((x = by(EVENT_HOURS, a.brunch)) && x.price) L.push({ key: "brunch", label: "Brunch / farewell party · " + x.short, price: waived ? x.price : up(x.price, "b", a) });
    OPTIONS.forEach(function (o) {
      var q = a.options && a.options[o.v];
      if (!q) return;
      var n = Math.max(1, Math.min(o.max || 1, q | 0));
      L.push({ key: "option", label: o.name + (o.unit && n > 1 ? " × " + n + " " + o.unit + "s" : ""), price: (o.nomk ? o.price : up(o.price, "o", a)) * n });
    });
    if (a.creator === "1") L.push({ key: "creator", label: "Content creator, same day edit", price: up(CREATOR[1].price, "k", a) });
    if ((x = by(PRIVACY, a.privacy)) && x.price) L.push({ key: "privacy", label: x.label, price: up(x.price, "p", a) });
    return L;
  }
  var total = function (a) { return lines(a).reduce(function (s, l) { return s + l.price; }, 0); };

  /* The choices only (codes, never prices): what the proposal link and the back office receive. */
  function selection(a) {
    var s = { w: a.welcome, c: a.wedding, x: a.team || [], b: a.brunch, o: a.options || {}, k: a.creator, p: a.privacy };
    if (a.mk === "wp") s.m = "wp";   // planner rates: the database applies the same percentages
    return s;
  }
  /* The other way round: a stored selection (or a link's content) back into answers. Only real options survive. */
  function fromSel(raw) {
    var a = blank(); raw = raw || {};
    a.welcome = by(EVENT_HOURS, raw.w) ? raw.w : null;
    a.wedding = by(COLLECTIONS, raw.c) ? raw.c : null;
    a.team = (Array.isArray(raw.x) ? raw.x : []).filter(function (v, i, r) { return by(TEAM, v) && r.indexOf(v) === i; });
    a.brunch = by(EVENT_HOURS, raw.b) ? raw.b : null;
    a.options = {};
    OPTIONS.forEach(function (o) {
      var q = raw.o && raw.o[o.v] | 0;
      if (q > 0) a.options[o.v] = Math.min(o.max || 1, q);
    });
    a.creator = raw.k === "1" ? "1" : (raw.k === "0" ? "0" : null);
    a.privacy = by(PRIVACY, raw.p) ? raw.p : "A";
    a.mk = raw.m === "wp" ? "wp" : "";
    return a;
  }

  /* The quote as the STUDIO finalises it in the back office. Same priced lines as the configurator, plus:
     - travel / accommodation: a number once confirmed (the couple then reads "Included" and the total contains it),
       or empty while it is still to be confirmed;
     - the wedding planner's commission: a private amount. It is spread over the priced lines in proportion, so the
       couple only ever sees ordinary prices that add up to the total. There is never a commission line.
     Returns { rows: [{ l: label, p: price, t: "" | "tbc" | "inc" }], total, base, commission, travel }. */
  function studioQuote(a, ex) {
    ex = ex || {};
    var travel = (ex.travel === null || ex.travel === undefined || ex.travel === "" || isNaN(+ex.travel)) ? null : Math.max(0, Math.round(+ex.travel));
    var L = lines(a), base = 0;
    L.forEach(function (l) { if (l.key !== "travel") base += l.price; });
    var comm = base > 0 ? Math.max(0, Math.round(+ex.commission || 0)) : 0;
    var f = base > 0 ? (base + comm) / base : 1, big = -1, sum = 0;
    var rows = L.map(function (l, i) {
      if (l.key === "travel") return travel === null ? { l: l.label, p: 0, t: "tbc" } : { l: "Travel / accommodation", p: travel, t: "inc" };
      var p = Math.round(l.price * f);
      sum += p;
      if (l.price > 0 && (big < 0 || l.price > L[big].price)) big = i;
      return { l: l.label, p: p, t: "" };
    });
    if (big > -1) rows[big].p += (base + comm) - sum;   // rounding leftovers go to the biggest line, so the lines add up exactly
    return { rows: rows, total: base + comm + (travel || 0), base: base, commission: comm, travel: travel };
  }

  /* ---------- validity: 14 days from the day of issue ---------- */
  var pad2 = function (n) { return (n < 10 ? "0" : "") + n; };
  function isoOf(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function addDaysISO(iso, n) { var d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return isoOf(d); }
  function validUntil(issuedISO) { return ISO.test(issuedISO || "") ? addDaysISO(issuedISO, VALID_DAYS) : ""; }
  function validityNote() { return "This quotation is valid for " + VALID_DAYS + " days from the date of issue."; }
  /* The price list in a form the back office database can use to RE-COMPUTE every total itself, so a quote or a
     contract can never carry a price edited in the browser. The back office keeps a copy (Settings table) each time
     it is opened, so changing a number in this file is all it takes. */
  function priceTable() {
    var t = { w: {}, b: {}, c: {}, n: {}, x: {}, o: {}, k: {}, p: {}, mk: Object.assign({}, MARKUP, { ev: EV_WAIVE }) };   // mk = planner rates (percent per key)
    EVENT_HOURS.forEach(function (e) { t.w[e.v] = e.price || 0; t.b[e.v] = e.price || 0; });
    COLLECTIONS.forEach(function (c) { t.c[c.v] = c.price; t.n[c.v] = c.name; });
    TEAM.forEach(function (x) { t.x[x.v] = x.price; });
    OPTIONS.forEach(function (o) { t.o[o.v] = { p: o.price, m: o.max || 1, x: o.nomk ? 1 : 0 }; });
    CREATOR.forEach(function (c) { t.k[c.v] = c.price || 0; });
    PRIVACY.forEach(function (p) { t.p[p.v] = p.price || 0; });
    return t;
  }

  /* Plain-text recap (used in the email to the team). */
  function recapText(a) {
    var t = lines(a).map(function (l) { return "- " + l.label + ": " + (l.tbc ? "TBC" : eur(l.price)) + (l.from ? " (from)" : ""); });
    t.push("", "TOTAL INVESTMENT: " + eur(total(a)) + " (collections are starting prices; travel / accommodation " + TRAVEL_TBC + ")", validityNote());
    /* (no percentage in this text either: it can end up in an email the planner writes, or forwards) */
    if (a.mk === "wp") t.push("Wedding planner rates applied." + (evWaived(a) ? " Welcome event and brunch at the standard rate with the " + by(COLLECTIONS, a.wedding).name + "." : ""));
    return t.join("\n");
  }

  /* Wedding dates are picked on a calendar (stored as YYYY-MM-DD) and shown as "14 June 2027". */
  var ISO = /^\d{4}-\d{2}-\d{2}$/;
  function fmtDate(s) {
    if (!ISO.test(s || "")) return s || "";
    var d = new Date(s + "T12:00:00");
    return isNaN(d) ? s : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }
  function todayISO() {
    var d = new Date(), m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }

  /* One-click "Add to Google Calendar" link for the team email: an all-day OPTION on the wedding date,
     opened in the studio's own Google account (authuser). The static site cannot write to a calendar
     by itself, so the email carries this link and one click adds the hold. */
  function calendarLink(a, proposalUrl) {
    if (!ISO.test(a.date || "")) return "";
    var start = a.date.replace(/-/g, "");
    var nx = new Date(a.date + "T12:00:00"); nx.setDate(nx.getDate() + 1);
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    var end = nx.getFullYear() + pad(nx.getMonth() + 1) + pad(nx.getDate());
    var details = [
      "Quote request from " + a.names, "Email: " + a.email,
      "Total: " + eur(total(a)) + " (travel / accommodation " + TRAVEL_TBC + ")",
      "Venue: " + a.venue + ", " + a.place, "", "Proposal: " + proposalUrl
    ].join("\n");
    var q = function (k, v) { return k + "=" + encodeURIComponent(v); };
    return "https://calendar.google.com/calendar/render?action=TEMPLATE&" + [
      q("text", "OPTION \u00B7 " + a.names + " \u00B7 " + a.venue),
      "dates=" + start + "/" + end,
      q("location", a.venue + ", " + a.place),
      q("details", details),
      q("authuser", EMAIL)
    ].join("&");
  }

  /* One sentence under every total about travel, depending on the wedding's location. */
  function travelNote(a) {
    return "Collections are priced from the amounts shown. Travel and accommodation: " + TRAVEL_TBC + ".";
  }

  /* ---------- the proposal link ----------
     Format:  proposal.html#<names>-<nonce>.<token>
     names = the couple's names as a slug, nonce = 12 random letters/digits (also the private reference of the quote),
     token = their choices as base64url. The hash never reaches the server. */
  function b64uEnc(str) {
    var bytes = new TextEncoder().encode(str), s = "";
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function b64uDec(tok) {
    var s = tok.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  var slug = function (s) {
    var out = String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 28).replace(/-+$/, "");
    return out || "your-proposal";
  };
  var nonce = function () {
    var a = new Uint8Array(12), s = "";
    (w.crypto || w.msCrypto).getRandomValues(a);
    for (var i = 0; i < a.length; i++) s += "0123456789abcdefghijklmnopqrstuvwxyz"[a[i] % 36];
    return s;
  };

  function proposalUrl(a, ts) {
    var n = a.nonce || (a.nonce = nonce());
    var p = { v: 1, pv: PRICE_VERSION, id: n, ts: ts || Date.now(),
      n: clip(a.names, 80), e: clip(a.email, 120), d: clip(a.date, 60), l: clip(a.place, 100), u: clip(a.venue, 100),
      r: a.role === "planner" ? "planner" : "couple", pn: clip(a.planner, 100), m: a.mk === "wp" ? "wp" : undefined,
      w: a.welcome, c: a.wedding, x: a.team || [], b: a.brunch, o: a.options || {}, k: a.creator, p: a.privacy,
      t: total(a) };
    var base = new URL("proposal.html", w.location.href);
    base.search = ""; base.hash = "";
    return base.href + "#" + slug(a.names) + "-" + n + "." + b64uEnc(JSON.stringify(p));
  }

  /* Reads a proposal hash back into answers. Everything is validated against
     the tables above, so a hand-edited link can only ever select real options. */
  function parseProposal(hash) {
    try {
      var h = String(hash || "").replace(/^#/, "");
      var dot = h.indexOf(".");
      if (dot < 1) return null;
      var raw = JSON.parse(b64uDec(h.slice(dot + 1)));
      if (!raw || raw.v !== 1) return null;
      var a = fromSel(raw);
      a.names = clip(raw.n, 80); a.email = clip(raw.e, 120); a.date = clip(raw.d, 60); a.place = clip(raw.l, 100); a.venue = clip(raw.u, 100);
      a.role = raw.r === "planner" ? "planner" : "couple"; a.planner = clip(raw.pn, 100);
      a.nonce = clip(raw.id, 16).toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!a.wedding) return null;
      if (!a.names) a.names = "Your experience";
      return { answers: a, id: clip(raw.id, 12).toUpperCase(), ts: +raw.ts || 0 };
    } catch (e) { return null; }
  }

  /* ---------- images & films ---------- */
  var IMG = "assets/img/";
  var STEP_IMG = {
    intro: IMG + "carousel/c-37.jpg",
    proposal: IMG + "wed-europe/we-50.jpg",
    welcome: IMG + "quote/n-flash.jpg",
    wedding: IMG + "carousel/c-04.jpg",
    team: IMG + "katya-joey/kj-07.jpg",
    brunch: IMG + "quote/n-alexa-216.jpg",
    options: IMG + "quote/n-alexa-1134.jpg",
    creator: IMG + "quote/n-serrano.jpg",
    privacy: IMG + "westbrook/rw-14.jpg",
    details: IMG + "quote/n-villa-erba.jpg",
    summary: IMG + "contact/contact-side.jpg"
  };

  /* Selected films, shown one by one, full width. vm = Vimeo id, yt = YouTube id. */
  var FILMS = [
    { t: "Jacqueline & Gordon", p: "Le Beauvallon, St-Tropez", vm: "1117935629" },
    { t: "Shashana & Domantas Sabonis", p: "Villa Ephrussi, St-Jean-Cap-Ferrat", yt: "4yQBjrSI1hI" },
    { t: "Emy & Alessandro", p: "Wedding film teaser", yt: "eBPDWWr74vs" },
    { t: "Marcella & Dan", p: "Engagement party teaser", vm: "1078314523" },
    { t: "Alexandra & Raphael", p: "Marrakech, Morocco", vm: "764060129" },
    { t: "Jasmiina & Tuukka", p: "Villa Balbiano, Lake Como", vm: "788687357" }
  ];
  var filmSrc = function (f) {
    return f.yt
      ? "https://www.youtube-nocookie.com/embed/" + f.yt + "?rel=0&modestbranding=1&playsinline=1"
      : "https://player.vimeo.com/video/" + f.vm + "?dnt=1" + (f.h ? "&h=" + f.h : "");
  };

  /* Photographs: a first row of four for the recap page, and the proposal page's
     selection (our own wedding shoots mixed with frames from the gallery page).
     ar = width / height, so the row fills its width without cropping anything. */
  var ROW4 = [
    { src: IMG + "carousel/c-17.jpg", alt: "A couple on a grand staircase", ar: 0.8 },
    { src: IMG + "carousel/c-31.jpg", alt: "A pink celebration by the pool", ar: 0.8 },
    { src: IMG + "carousel/c-43.jpg", alt: "A couple on a Riva boat on Lake Como", ar: 0.801 },
    { src: IMG + "carousel/c-52.jpg", alt: "A couple laughing, black and white", ar: 0.667 }
  ];
  var PHOTOS = [
    ["quote/n-villa-erba.jpg", "A bride in a lace veil in a gilded room"],
    ["daria/dl-12.jpg", "A couple under a floral arch above the Mediterranean"],
    ["quote/n-flash.jpg", "A couple walking hand in hand through a villa garden at dusk"],
    ["westbrook/rw-05.jpg", "A couple in white on a yacht off Portofino"],
    ["carousel/c-20.jpg", "An aerial view of a Riva boat on turquoise water"],
    ["katya-joey/kj-07.jpg", "A bride walking a long aisle toward Lake Como"],
    ["quote/n-alexa-1134.jpg", "Two aerial dancers on giant white flowers above the ceremony"],
    ["quote/n-jg-272.jpg", "A couple in pink and powder-blue period costume at a long table"],
    ["carousel/c-46.jpg", "A bride on a pair of red lips"],
    ["quote/n-alexa-216.jpg", "A bride and groom among their bridesmaids"],
    ["quote/n-serrano.jpg", "A guest in a white powdered wig and a gold embroidered coat"],
    ["carousel/c-31.jpg", "A pink celebration by the pool"]
  ].map(function (p) { return { src: IMG + p[0], alt: p[1] }; });

  /* Portfolio blocks shared by the recap page and the proposal page. */
  function rowHTML() {
    return '<div class="qx-row4">' + ROW4.map(function (p) {
      return '<figure style="--ar:' + p.ar + '"><img src="' + p.src + '" alt="' + esc(p.alt) + '" loading="lazy"></figure>';
    }).join("") + "</div>";
  }
  function stackHTML() {
    return '<div class="film-stack">' + FILMS.map(function (f, i) {
      return '<article class="film-layer film-layer--' + (i % 2 ? "b" : "a") + '" style="z-index:' + (i + 1) + '">' +
        '<div class="film-layer__in"><header><span class="num">' + String(i + 1).padStart(2, "0") + " / " + String(FILMS.length).padStart(2, "0") + "</span>" +
        "<h3>" + esc(f.t) + "</h3><p>" + esc(f.p) + "</p></header>" +
        '<div class="film-layer__frame"><iframe data-src="' + filmSrc(f) + '" title="' + esc(f.t) + '" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe></div>' +
        "</div></article>";
    }).join("") + "</div>";
  }

  /* ---------- shared UI: site menu drawer + lightbox ---------- */
  function initMenu() {
    var d = document.getElementById("qxDrawer"), b = document.getElementById("qxMenu"), c = document.getElementById("qxClose");
    if (!d || !b) return;
    var set = function (o) {
      d.classList.toggle("open", o); d.setAttribute("aria-hidden", o ? "false" : "true"); b.setAttribute("aria-expanded", o ? "true" : "false");
      if (o) c.focus(); else b.focus();
    };
    b.addEventListener("click", function () { set(true); });
    c.addEventListener("click", function () { set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && d.classList.contains("open")) set(false); });
  }

  var lightbox = (function () {
    var el, frame, prevB, nextB, items = [], idx = 0, opener = null;
    function close() {
      if (!el) return;
      el.classList.remove("open"); el.setAttribute("aria-hidden", "true");
      frame.innerHTML = ""; frame.className = "frame";   /* empties the player so the film stops */
      if (opener && opener.focus) opener.focus();
    }
    function show() {
      var it = items[idx];
      frame.className = "frame photo";
      frame.innerHTML = '<img src="' + esc(it.src) + '" alt="' + esc(it.alt || "") + '">';
      prevB.hidden = nextB.hidden = items.length < 2;
    }
    function open(from) { opener = from || null; el.classList.add("open"); el.setAttribute("aria-hidden", "false"); document.getElementById("qxLbClose").focus(); }
    return {
      init: function () {
        el = document.getElementById("qxLb"); if (!el) return;
        frame = document.getElementById("qxLbFrame"); prevB = document.getElementById("qxLbPrev") || { hidden: true }; nextB = document.getElementById("qxLbNext") || { hidden: true };
        document.getElementById("qxLbClose").addEventListener("click", close);
        el.addEventListener("click", function (e) { if (e.target === el) close(); });
        if (prevB.addEventListener) {
          prevB.addEventListener("click", function () { idx = (idx - 1 + items.length) % items.length; show(); });
          nextB.addEventListener("click", function () { idx = (idx + 1) % items.length; show(); });
        }
        document.addEventListener("keydown", function (e) {
          if (!el.classList.contains("open")) return;
          if (e.key === "Escape") close();
          else if (items.length > 1 && frame.classList.contains("photo")) {
            if (e.key === "ArrowLeft") { idx = (idx - 1 + items.length) % items.length; show(); }
            if (e.key === "ArrowRight") { idx = (idx + 1) % items.length; show(); }
          }
        });
      },
      photo: function (list, i, from) { items = list; idx = i; show(); open(from); },
      close: close
    };
  })();

  /* Film players only receive their address once they are close to the screen and actually laid out.
     A player started inside a hidden (0x0) box can fail with YouTube error 153. */
  function lazyFrames() {
    var frames = Array.prototype.slice.call(document.querySelectorAll("iframe[data-src]"));
    var load = function (f) { if (f.getAttribute("data-src")) { f.src = f.getAttribute("data-src"); f.removeAttribute("data-src"); } };
    if (!("IntersectionObserver" in w)) { frames.forEach(load); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && e.target.offsetWidth > 0) { load(e.target); io.unobserve(e.target); } });
    }, { rootMargin: "400px 0px" });
    frames.forEach(function (f) { io.observe(f); });
  }

  w.CQ = {
    EMAIL: EMAIL, WHATSAPP: WHATSAPP,
    eur: eur, esc: esc, clip: clip,
    fmtDate: fmtDate, calendarLink: calendarLink, todayISO: todayISO, ISO: ISO, EVENT_HOURS: EVENT_HOURS, TRAVEL_TBC: TRAVEL_TBC, travelNote: travelNote, COLLECTIONS: COLLECTIONS, TEAM: TEAM, OPTIONS: OPTIONS, CREATOR: CREATOR, PRIVACY: PRIVACY,
    by: by, blank: blank, lines: lines, total: total, recapText: recapText, selection: selection, fromSel: fromSel, priceTable: priceTable,
    up: up, MARKUP: MARKUP, evWaived: evWaived, COMPARE: COMPARE, compareSection: compareSection, aboutSection: aboutSection, photosSection: photosSection,
    studioQuote: studioQuote, VALID_DAYS: VALID_DAYS, isoOf: isoOf, addDaysISO: addDaysISO, validUntil: validUntil, validityNote: validityNote,
    proposalUrl: proposalUrl, parseProposal: parseProposal, slug: slug,
    STEP_IMG: STEP_IMG, FILMS: FILMS, filmSrc: filmSrc, PHOTOS: PHOTOS, rowHTML: rowHTML, stackHTML: stackHTML,
    initMenu: initMenu, lazyFrames: lazyFrames, lightbox: lightbox
  };
})(window);
