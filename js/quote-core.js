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
      sub: "10 hours of presence · 2 shooters · drone operator · all shot by one of our team" },
    { v: "premium", name: "Premium collection", short: "Premium", price: 18500, from: true,
      sub: "10 hours of presence · 3 shooters · drone operator · with one of Chromata’s founders in the team, shooting" },
    { v: "ultimate", name: "Ultimate collection", short: "Ultimate", price: 24500, from: true,
      sub: "12 hours of presence · 3 shooters · drone operator · with one of Chromata’s founders in the team, shooting · an extra separate film of the full speeches and the full ceremony · an editorial session offered the morning of the welcome event, in the surroundings" }
  ];

  var TEAM = [
    { v: "shooter", name: "Extra shooter", sub: "", price: 2290, plus: true },
    { v: "fpv", name: "Extra drone operator", sub: "For FPV shots", price: 1290, plus: true }
  ];

  var OPTIONS = [
    { v: "feature", name: "Extra long feature film", sub: "45 minutes to 1 hour", price: 5990 },
    { v: "priority", name: "Editing priority for the feature film", sub: "Delivery time around 1 month", price: 5490 },
    { v: "hour", name: "Extra hour", sub: "", price: 1200, unit: "hour", max: 8 },
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

  /* Travel & accommodation is added to the quote automatically from where the wedding is. */
  var REGIONS = [
    { v: "fr", label: "France", price: 2000, line: "Travel & accommodation · France" },
    { v: "eu", label: "Elsewhere in Europe", price: 3500, line: "Travel & accommodation · Europe" },
    { v: "ow", label: "Outside Europe", tbc: true, line: "Travel / accommodation · TBC as outside Europe" }
  ];

  var by = function (arr, v) { for (var i = 0; i < arr.length; i++) if (arr[i].v === v) return arr[i]; return null; };

  /* ---------- the couple's answers ---------- */
  function blank() {
    return { welcome: null, wedding: null, team: [], brunch: null, options: {}, creator: null, privacy: "A",
             names: "", email: "", date: "", place: "", venue: "", region: null, nonce: "" };
  }

  /* Turns answers into priced lines. Order follows the on-screen recap. */
  function lines(a) {
    var L = [], x;
    if ((x = by(COLLECTIONS, a.wedding))) L.push({ key: "wedding", label: "Wedding day · " + x.name, price: x.price, from: true });
    (a.team || []).forEach(function (id) { var t = by(TEAM, id); if (t) L.push({ key: "team", label: t.name + (t.sub ? " · " + t.sub : ""), price: t.price }); });
    if ((x = by(REGIONS, a.region))) L.push({ key: "travel", label: x.line, price: x.price || 0, tbc: !!x.tbc });
    if ((x = by(EVENT_HOURS, a.welcome)) && x.price) L.push({ key: "welcome", label: "Welcome event · " + x.short, price: x.price });
    if ((x = by(EVENT_HOURS, a.brunch)) && x.price) L.push({ key: "brunch", label: "Brunch / farewell party · " + x.short, price: x.price });
    OPTIONS.forEach(function (o) {
      var q = a.options && a.options[o.v];
      if (!q) return;
      var n = Math.max(1, Math.min(o.max || 1, q | 0));
      L.push({ key: "option", label: o.name + (o.unit && n > 1 ? " × " + n + " " + o.unit + "s" : ""), price: o.price * n });
    });
    if (a.creator === "1") L.push({ key: "creator", label: "Content creator, same day edit", price: CREATOR[1].price });
    if ((x = by(PRIVACY, a.privacy)) && x.price) L.push({ key: "privacy", label: x.label, price: x.price });
    return L;
  }
  var total = function (a) { return lines(a).reduce(function (s, l) { return s + l.price; }, 0); };

  /* Plain-text recap (used in the email to the team). */
  function recapText(a) {
    var t = lines(a).map(function (l) { return "- " + l.label + ": " + (l.tbc ? "TBC" : eur(l.price)) + (l.from ? " (from)" : ""); });
    t.push("", "TOTAL INVESTMENT: " + eur(total(a)) + (a.region === "ow" ? " (collections are starting prices; travel / accommodation to be confirmed as outside Europe)" : " (collections are starting prices; travel and accommodation included)"));
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
    var r = by(REGIONS, a.region);
    var details = [
      "Quote request from " + a.names, "Email: " + a.email,
      "Total: " + eur(total(a)) + (r && r.tbc ? " (travel / accommodation TBC, outside Europe)" : ""),
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
    return a.region === "ow"
      ? "Collections are priced from the amounts shown. Travel and accommodation outside Europe are to be confirmed with your quote."
      : "Collections are priced from the amounts shown. Travel and accommodation are included in your quote.";
  }

  /* ---------- the proposal link ----------
     Format:  proposal.html#<names>-<nonce>.<token>
     names = the couple's names as a slug, nonce = 6 random letters/digits,
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
    var a = new Uint8Array(6), s = "";
    (w.crypto || w.msCrypto).getRandomValues(a);
    for (var i = 0; i < a.length; i++) s += "0123456789abcdefghijklmnopqrstuvwxyz"[a[i] % 36];
    return s;
  };

  function proposalUrl(a) {
    var n = a.nonce || (a.nonce = nonce());
    var p = { v: 1, pv: PRICE_VERSION, id: n, ts: Date.now(),
      n: clip(a.names, 80), e: clip(a.email, 120), d: clip(a.date, 60), l: clip(a.place, 100), u: clip(a.venue, 100),
      w: a.welcome, c: a.wedding, r: a.region, x: a.team || [], b: a.brunch, o: a.options || {}, k: a.creator, p: a.privacy,
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
      var a = blank();
      a.names = clip(raw.n, 80); a.email = clip(raw.e, 120); a.date = clip(raw.d, 60); a.place = clip(raw.l, 100); a.venue = clip(raw.u, 100);
      a.region = by(REGIONS, raw.r) ? raw.r : null;
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
    welcome: IMG + "carousel/c-06.jpg",
    wedding: IMG + "carousel/c-04.jpg",
    team: IMG + "katya-joey/kj-07.jpg",
    brunch: IMG + "four-seasons/fsb-06.jpg",
    options: IMG + "jasmiina/jt-04.jpg",
    creator: IMG + "daria/dl-05.jpg",
    privacy: IMG + "westbrook/rw-14.jpg",
    details: IMG + "jasmiina/jt-12.jpg",
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
    ["carousel/c-05.jpg", "A bride among white and lilac flowers"],
    ["daria/dl-12.jpg", "A couple under a floral arch above the Mediterranean"],
    ["carousel/c-12.jpg", "A bride on a stone balustrade"],
    ["westbrook/rw-05.jpg", "A couple in white on a yacht off Portofino"],
    ["carousel/c-20.jpg", "An aerial view of a Riva boat on turquoise water"],
    ["katya-joey/kj-07.jpg", "A bride walking a long aisle toward Lake Como"],
    ["carousel/c-24.jpg", "A bride in a tulle gown on stone steps"],
    ["jasmiina/jt-12.jpg", "A black and white bride at a mirror"],
    ["carousel/c-46.jpg", "A bride on a pair of red lips"],
    ["amalfi-zagara/az-04.jpg", "A bride and groom among palm leaves"],
    ["carousel/c-52.jpg", "A couple laughing, black and white"],
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
        '<div class="film-layer__frame"><iframe src="' + filmSrc(f) + '" title="' + esc(f.t) + '" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe></div>' +
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

  w.CQ = {
    EMAIL: EMAIL, WHATSAPP: WHATSAPP,
    eur: eur, esc: esc, clip: clip,
    fmtDate: fmtDate, calendarLink: calendarLink, todayISO: todayISO, ISO: ISO, EVENT_HOURS: EVENT_HOURS, REGIONS: REGIONS, travelNote: travelNote, COLLECTIONS: COLLECTIONS, TEAM: TEAM, OPTIONS: OPTIONS, CREATOR: CREATOR, PRIVACY: PRIVACY,
    by: by, blank: blank, lines: lines, total: total, recapText: recapText,
    proposalUrl: proposalUrl, parseProposal: parseProposal, slug: slug,
    STEP_IMG: STEP_IMG, FILMS: FILMS, filmSrc: filmSrc, PHOTOS: PHOTOS, rowHTML: rowHTML, stackHTML: stackHTML,
    initMenu: initMenu, lightbox: lightbox
  };
})(window);
