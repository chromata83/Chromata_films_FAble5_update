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
  /* The cards themselves, for any set of columns: cols = [{ v, short, name, sub, price }], rows = [{ k, on: [..], t: [..] }] (a row without `on` is included everywhere).
     Used by the three collections above and by the studio's own packages (custom quotes). */
  function cardsHTML(cols, rows, chosen, o, priceOf) {
    return cols.map(function (c, i) {
      var is = chosen === c.v;
      return '<article class="px-col' + (is ? " is-chosen" : "") + (o.pick ? " is-pick" : "") + '"' + (o.pick ? ' data-v="' + c.v + '" tabindex="0" role="button" aria-pressed="' + is + '" aria-label="' + (is ? "Your choice: " : "Choose ") + esc(c.name) + '"' : "") + '><header><span class="px-col__tag">' + (is ? "Your choice" : (o.pick ? "Choose this one" : "&nbsp;")) + "</span><h3>" + esc(c.short) + "<small>" + esc(o.word || "collection") + "</small></h3>" +
        (c.sub ? '<p class="px-col__sub">' + esc(c.sub) + "</p>" : "") + priceOf(c, i, is) + "</header><ul>" +
        rows.map(function (r) {
          var on = r.on ? !!r.on[i] : true, text = r.t ? r.t[i] : r.k;
          return '<li class="' + (on ? "on" : "off") + '"><span class="bx" aria-hidden="true"></span><span>' + esc(text) + (on ? "" : '<em class="sr-only"> (not included)</em>') + "</span></li>";
        }).join("") + "</ul></article>";
    }).join("");
  }
  function compareSection(a, o) {
    o = o || {};
    var chosen = a && a.wedding, base = o.pick ? total(a) : 0;
    var cols = cardsHTML(COLLECTIONS.map(function (c) { return { v: c.v, short: c.short, name: c.name }; }), COMPARE, chosen, o, function (c, i, is) {
      if (!o.pick) return "";
      var t = total(Object.assign({}, a, { wedding: c.v })), d = t - base;
      return '<p class="px-col__price">Your total <strong>' + eur(t) + "</strong>" + (is ? "" : "<span>" + (d > 0 ? "+" : "−") + eur(Math.abs(d)) + "</span>") + "</p>";
    });
    return '<section class="px-compare' + (o.pick ? " px-compare--cfg" : "") + '"' + (o.id ? ' id="' + o.id + '"' : "") + '><div class="px-wrap px-wrap--col"><p class="kicker">' + (o.pick ? "Compare and choose" : "Your collection") + '</p><h2 class="px-h2">' +
      (o.pick ? "Change your collection <em>at will</em>" : "What each collection <em>includes</em>") + '</h2></div><div class="px-cols">' + cols + "</div></section>";
  }

  /* ---------- custom quotes (back office > Tools) ----------
     The studio writes a quote of its own (a Christmas party, a Bar Mitzvah, a brand film...): its packages, their prices and descriptions, the comparison
     rows, extra lines, pictures. It is stored with the project (projects.quote_custom) and shown by proposal.html from the link proposal.html#<slug>-<ref>.
     Nothing in the link carries prices: the page asks the database (quote_status) for the definition and for the lines + total the studio saved. */
  var safeImg = function (u) {
    u = String(u == null ? "" : u).trim();
    return /^(https:\/\/[^\s"'<>]+|assets\/[A-Za-z0-9_.\-\/ ]+|data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+)$/.test(u) && u.length < 2000000 ? u : "";
  };
  var pkgById = function (arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; };
  var num = function (v, min, max) { v = +v; if (!isFinite(v)) v = 0; return Math.max(min, Math.min(max, Math.round(v * 100) / 100)); };
  /* "Moments we witnessed" -> Moments we <em>witnessed</em> (the last word in the italic accent, like every title of the site) */
  function emLast(s) {
    s = String(s == null ? "" : s).trim();
    var i = s.lastIndexOf(" ");
    return i < 0 ? esc(s) : esc(s.slice(0, i)) + " <em>" + esc(s.slice(i + 1)) + "</em>";
  }
  var ABOUT_GENERIC = "Chromata Films makes visual narratives, not documentation: authentic storytelling, created with premium vendors and French-inspired sophistication, in a relaxed atmosphere where you can simply be yourselves. " +
    "Our muses are Salvador Dalí and Elsa Schiaparelli, who proved that the unexpected can also be the most desirable thing in the room, so we look for the surreal detail hidden inside a real day and frame it with a couturier’s eye. " +
    "And before our own films, our co-founder and film director Kevin Lopez spent a decade in visual effects for major studios, helping craft images for some of the biggest films ever made — Star Wars, Beauty and the Beast, The Great Gatsby, Avengers — and brings the same standards and the same tools to every story we film.";

  /* the Film director video upgrade: in every new custom quote, a card of the red "Video upgrades" section the client can select (the studio's price and wording can be edited) */
  function directorLine() {
    return { name: "Film director", price: 14000, qty: 1, unit: "", on: false, band: false, card: true,
      sub: "Choose the luxury of having a film director on your event. Receiving the live streams of every camera on site, they direct the crews in real time from what they see on screen, so that every shot is the strongest and the best optimised one, planned around the other cameras and the needs of the edit, right on set.\n\nWe no longer simply cover an event: we direct it visually, the way a true production would.",
      inc: ["Film director", "Streaming gear", "Streaming console", "Day-after edit (1 min)"] };
  }
  /* the Super 16mm video upgrade: its own line under the comparison, sold per day (the client picks 1 to 5 days, 20% off from 2 days) */
  var DAYS_MAX = 5;
  function super16Line() {
    return { name: "Super 16mm film camera with dedicated camera operator", price: 5000, qty: 1, unit: "day", on: false, band: true, days: { from: 2, off: 20 },
      sub: "Real Super 16mm motion-picture film, shot by a camera operator who is dedicated to it for the day, beside the rest of the crew. A special film made on the side, with the grain, the halation and the colour that no filter reproduces, hand-developed and scanned, then layered into the edit.\n\nPrice per day of filming. Book several days and the discount follows.",
      inc: ["Super 16mm film camera", "Dedicated camera operator", "Film development and scan", "A short film made on the side"] };
  }
  /* a line sold per day: its amount (price x days, minus the multi-day discount) and the sentences that explain it */
  var money = function (n) { return Math.round(n * 100) / 100; };
  function lineAmt(l) { var a = l.price * l.qty; if (l.days && l.days.off > 0 && l.qty >= l.days.from) a = a * (100 - l.days.off) / 100; return money(a); }
  function dayInfo(l, n) {
    var v = Object.assign({}, l, { qty: Math.max(1, Math.min(DAYS_MAX, Math.round(+n) || 1)) }), disc = !!(v.days && v.days.off > 0 && v.qty >= v.days.from);
    return { amount: lineAmt(v), disc: disc, sum: v.qty + (v.qty > 1 ? " days" : " day") + " × " + eur(v.price) + (disc ? " − " + v.days.off + "%" : "") + " = " + eur(lineAmt(v)) };
  }
  /* the row where the client picks the number of days (1 to 5) */
  function daysRow(l, i) {
    if (!l.days) return "";
    var b = "";
    for (var n = 1; n <= DAYS_MAX; n++) b += '<button type="button" class="px-days__b' + (n === l.qty ? " is-on" : "") + '" role="radio" aria-checked="' + (n === l.qty) + '" data-i="' + i + '" data-n="' + n + '" aria-label="' + n + (n > 1 ? " days" : " day") + '">' + n + "</button>";
    return '<div class="px-days" data-i="' + i + '"><div class="px-days__t">Number of days' + (l.days.off > 0 ? "<small>" + l.days.off + "% off from " + l.days.from + " days</small>" : "") + '</div><div class="px-days__row" role="radiogroup" aria-label="Number of days">' + b + '</div><div class="px-days__sum">' + esc(dayInfo(l, l.qty).sum) + "</div></div>";
  }
  /* a YouTube or Vimeo link -> { yt } or { vm, h } (null when it is neither): the page then embeds the player */
  function parseVideo(u) {
    u = String(u == null ? "" : u).trim();
    var m;
    if (!/^https:\/\//i.test(u)) return null;
    if ((m = /^https:\/\/(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/i.exec(u)) || (m = /^https:\/\/youtu\.be\/([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/i.exec(u))) return { yt: m[1] };
    if ((m = /^https:\/\/player\.vimeo\.com\/video\/(\d{6,12})(?:\?[^#]*?\bh=([a-f0-9]{8,12}))?/i.exec(u))) return { vm: m[1], h: m[2] || "" };
    if ((m = /^https:\/\/(?:www\.)?vimeo\.com\/(?:[a-z]+\/)*?(\d{6,12})(?:\/([a-f0-9]{8,12}))?(?!\d)/i.exec(u))) return { vm: m[1], h: m[2] || (/[?&]h=([a-f0-9]{8,12})/i.exec(u) || [])[1] || "" };
    return null;
  }
  /* the studio's videos as the list the film players are built from */
  function customVideoList(d) {
    return d.videos.map(function (v, i) { var p = parseVideo(v.url) || {}; return { t: v.title || "Film " + (i + 1), p: v.sub, yt: p.yt, vm: p.vm, h: p.h }; });
  }
  function customBlank() {
    var on = function (a) { return a; };
    return { v: 2, kind: "", word: "package", lead: "", hero: "", photosTitle: "Moments we witnessed", chosen: "b",
      packages: [{ id: "a", name: "Essential", sub: "", price: 0 }, { id: "b", name: "Signature", sub: "", price: 0 }, { id: "c", name: "Complete", sub: "", price: 0 }],
      features: [
        { k: "Hours of presence", on: on([1, 1, 1]), d: ["3 h", "5 h", "8 h"] },
        { k: "Highlight film", on: on([1, 1, 1]), d: ["2 min", "3 min", "4 min"] },
        { k: "Drone footage", on: on([0, 1, 1]), d: ["", "", ""] },
        { k: "A short film made for social media", on: on([0, 0, 1]), d: ["", "", ""] }],
      lines: [super16Line(), directorLine()], extra: { on: false, label: "", sub: "", prices: [0, 0, 0] }, travel: { show: true }, note: "", about: { on: true, text: "" }, films: false, videos: [], videosTitle: "Stories we filmed", photos: [] };
  }
  /* a text that may keep its line breaks (the description of a video upgrade) */
  var clipML = function (s, n) { return String(s == null ? "" : s).replace(/\r/g, "").replace(/[\u0000-\u0009\u000b-\u001f]/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, n); };
  var qtyLabel = function (l) { return l.qty > 1 || l.days ? " × " + l.qty + (l.unit ? " " + l.unit + (l.qty > 1 && !/s$/i.test(l.unit) ? "s" : "") : "") : ""; };
  /* what the title of an upgrade says: a line sold per day says its days in its own row instead */
  var titleOf = function (l) { return l.days ? l.name : l.name + qtyLabel(l); };
  /* Whatever comes in (the builder's form, or the database) comes out as a safe, complete definition: bounded lengths, numbers, known pictures only. */
  function customClean(raw) {
    var r = raw && typeof raw === "object" ? raw : {}, d = {};
    d.v = 2;   // 2: the Film director is a card of the red section, the Super 16mm a line sold per day under the comparison (definitions saved as 1 are migrated below)
    d.kind = clip(r.kind, 60); d.word = clip(r.word, 20) || "package"; d.lead = clip(r.lead, 1500);
    d.hero = safeImg(r.hero); d.photosTitle = clip(r.photosTitle, 60) || "Moments we witnessed"; d.note = clip(r.note, 300);
    var seen = {};
    d.packages = (Array.isArray(r.packages) ? r.packages : []).slice(0, 4).map(function (p, i) {
      p = p || {}; var id = String(p.id || "").replace(/[^a-z0-9]/gi, "").slice(0, 12) || "p" + (i + 1);
      while (seen[id]) id += "x"; seen[id] = 1;
      return { id: id, name: clip(p.name, 60) || "Package " + (i + 1), sub: clip(p.sub, 2000), price: num(p.price, 0, 10000000) };
    });
    if (!d.packages.length) d.packages = [{ id: "a", name: "Package", sub: "", price: 0 }];
    var n = d.packages.length;
    d.chosen = pkgById(d.packages, String(r.chosen || "")) ? String(r.chosen) : d.packages[0].id;
    d.features = (Array.isArray(r.features) ? r.features : []).slice(0, 16).map(function (f) {
      f = f || {}; var on = [], dd = [];
      for (var i = 0; i < n; i++) { on.push(f.on && f.on[i] ? 1 : 0); dd.push(clip(f.d && f.d[i], 120)); }
      return { k: clip(f.k, 200), on: on, d: dd };
    }).filter(function (f) { return f.k; });
    var old = +r.v < 2;   // saved before the Film director moved to the red section and the Super 16mm was sold per day
    d.lines = (Array.isArray(r.lines) ? r.lines : []).slice(0, 24).map(function (l) {
      l = l || {};
      var nm = clip(l.name, 200), isDir = /^film director$/i.test(nm), isS16 = /super ?16 ?mm/i.test(nm);
      var isBand = l.band === true || l.band === 1 || (l.band === undefined && !!l.card && isDir);
      if (old && isDir && isBand) isBand = false;                       // the Film director is now in the red section...
      if (old && isS16 && (l.card === true || l.card === 1 || isBand)) isBand = true;   // ...and the Super 16mm line under the comparison
      var dy = l.days && typeof l.days === "object" ? l.days : (old && isS16 && isBand && l.days === undefined ? {} : null);   // a line sold per day: the client picks 1 to 5 days
      var days = dy ? { from: Math.max(2, Math.min(DAYS_MAX, Math.round(+dy.from) || 2)), off: dy.off === undefined ? 20 : num(dy.off, 0, 90) } : null;
      return { name: nm, sub: clipML(l.sub, 1500), price: num(l.price, -10000000, 10000000), qty: Math.max(1, Math.min(days ? DAYS_MAX : 99, Math.round(+l.qty) || 1)), unit: days ? "day" : clip(l.unit, 20), on: l.on !== false && l.on !== 0,   // on = validated by the client (counts in the total); older lines without the flag count
        band: isBand,   // a separate line under the comparison, its description readable at once (the Super 16mm)
        card: !isBand && (l.card === true || l.card === 1 || (old && isDir && (l.band === true || l.band === 1))),   // shown as a clickable card in the "Video upgrades" section of the quote
        days: days,
        inc: (Array.isArray(l.inc) ? l.inc : []).slice(0, 12).map(function (x) { return clip(x, 120); }).filter(Boolean) };   // what the upgrade includes
    }).filter(function (l) { return l.name; });
    /* a price per package for something every package pays differently (shown under the comparison, added to the quote by itself) */
    var ex = r.extra && typeof r.extra === "object" ? r.extra : {};
    d.extra = { on: ex.on === true || ex.on === 1, label: clip(ex.label, 160), sub: clip(ex.sub, 300), prices: d.packages.map(function (p, i) { return num(Array.isArray(ex.prices) ? ex.prices[i] : 0, 0, 10000000); }) };
    if (!d.extra.label) d.extra.on = false;
    d.travel = { show: !(r.travel && r.travel.show === false) };
    d.about = { on: !(r.about && r.about.on === false), text: clip(r.about && r.about.text, 1500) };
    d.films = r.films === true || r.films === 1;   // the wedding films (the studio's own videos below replace them)
    d.videos = (Array.isArray(r.videos) ? r.videos : []).slice(0, 8).map(function (v) {
      v = v || {}; var u = clip(v.url, 300);
      return { url: parseVideo(u) ? u : "", title: clip(v.title, 120), sub: clip(v.sub, 160) };
    }).filter(function (v) { return v.url; });
    d.videosTitle = clip(r.videosTitle, 60) || "Stories we filmed";
    d.photos = (Array.isArray(r.photos) ? r.photos : []).slice(0, 24).map(function (p) { return { src: safeImg(p && p.src), alt: clip(p && p.alt, 140) }; }).filter(function (p) { return p.src; });
    /* who it is for (written by the database from the project, not by the form) */
    d.names = clip(r.names, 160); d.date = ISO.test(r.date || "") ? r.date : ""; d.place = clip(r.place, 160); d.venue = clip(r.venue, 160); d.planner = clip(r.planner, 160);
    return d;
  }
  /* priced lines of a custom quote: the chosen package, then the studio's extra lines, then travel */
  function customLines(d) {
    var L = [], p = pkgById(d.packages, d.chosen) || d.packages[0];
    if (p) L.push({ key: "package", label: (d.kind ? d.kind + " · " : "") + p.name, sub: p.sub, price: p.price });
    var xi = d.packages.indexOf(p), xp = d.extra && d.extra.on && xi > -1 ? d.extra.prices[xi] : 0;
    if (xp > 0) L.push({ key: "line", label: d.extra.label, sub: d.extra.sub, price: xp });   // the package-dependent extra is added by itself
    d.lines.forEach(function (l) {
      /* a featured upgrade has its description on its card: the summary row stays short */
      var disc = l.days && l.days.off > 0 && l.qty >= l.days.from ? l.days.off + "% multi-day discount included" : "";
      L.push({ key: l.on ? "line" : "optional", label: l.name + qtyLabel(l), sub: (l.card || l.band) ? disc : l.sub, price: lineAmt(l) });
    });
    if (d.travel.show) L.push({ key: "travel", label: "Travel / accommodation", price: 0 });
    return L;
  }
  /* rows the client reads + total, same shape as studioQuote (no commission in custom quotes); travel / accommodation is always a line that reads "Included" */
  function customQuote(d, o) { var r = spread(customLines(d), { travel: 0 }); r.total = Math.max(0, r.total); if (o && o.client) r.rows = r.rows.filter(function (x) { return x.t !== "opt"; }); return r; }
  function customCompare(d, o) {
    o = o || {};
    var word = d.word || "package", one = d.packages.length === 1;
    var cols = d.packages.map(function (p) { return { v: p.id, short: p.name, name: p.name, sub: p.sub, price: p.price }; });
    var rows = d.features.map(function (f) { return { k: f.k, on: f.on, t: f.on.map(function (x, i) { return f.d[i] ? f.k + " · " + f.d[i] : f.k; }) }; });
    var html = cardsHTML(cols, rows, d.chosen, { word: word, pick: !!o.pick && !one }, function (c) { return c.price > 0 ? '<p class="px-col__price px-col__price--base"><strong>' + eur(c.price) + "</strong></p>" : ""; });
    return '<section class="px-compare"' + (o.id ? ' id="' + o.id + '"' : "") + '><div class="px-wrap px-wrap--col"><p class="kicker">' + (one ? "What is included" : "Your " + esc(word)) + '</p><h2 class="px-h2">' +
      (one ? "Everything that is <em>included</em>" : "What each " + esc(word) + " <em>includes</em>") + '</h2>' + (o.pick && !one ? '<p class="px-ups__p">Choose the ' + esc(word) + ' you prefer: your quote follows.</p>' : "") + '</div><div class="px-cols px-cols--' + cols.length + '">' + html + "</div>" + customExtraBand(d) + customBands(d) + "</section>";
  }
  /* the line under the comparison: "Extra as per ..." with what each package pays on top, the chosen one in yellow */
  function customExtraBand(d) {
    var x = d.extra;
    if (!x || !x.on || !x.label || !x.prices.some(function (p) { return p > 0; })) return "";
    return '<div class="px-xtra"><div class="px-xtra__t"><strong>' + esc(x.label) + "</strong>" + (x.sub ? "<span>" + esc(x.sub) + "</span>" : "") + "</div>" +
      '<div class="px-cols px-cols--' + d.packages.length + ' px-xtra__cols">' + d.packages.map(function (p, i) {
        var v = x.prices[i];
        return '<div class="px-xcell' + (p.id === d.chosen ? " is-chosen" : "") + '"><span class="px-xcell__n">' + esc(p.name) + '</span><strong class="px-xcell__p">' + (v > 0 ? "+ " + eur(v) : "Included") + "</strong></div>";
      }).join("") + "</div></div>";
  }
  /* a video upgrade shown as its own line under the comparison, exactly like the extra, its description readable at once and a box to add it to the quote */
  function customBands(d) {
    return d.lines.map(function (l, i) {
      if (!l.band) return "";
      var price = lineAmt(l), paras = String(l.sub || "").split(/\n+/).filter(Boolean);
      return '<div class="px-xtra px-xtra--dir"><div class="px-xtra__t"><strong>' + esc(titleOf(l)) + "</strong><span>Video upgrade · optional</span></div>" +
        '<div class="px-dir' + (l.on ? " is-sel" : "") + '" data-i="' + i + '"><div class="px-dir__txt">' + paras.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") + "</div>" +
        (l.inc.length ? '<div class="px-dir__inc"><p class="px-up__h">What is included</p><ul>' + l.inc.map(function (t) { return '<li><span class="bx" aria-hidden="true"></span><span>' + esc(t) + "</span></li>"; }).join("") + "</ul></div>" : "") +
        '<div class="px-dir__act"><strong class="px-dir__p">' + (price < 0 ? "− " : "+ ") + eur(Math.abs(price)) + '</strong><button type="button" class="px-up__sel" role="checkbox" aria-checked="' + !!l.on + '" data-i="' + i + '" aria-label="Add ' + esc(l.name) + ' to my quote"><span class="bx" aria-hidden="true"></span></button>' +
        '<span class="px-up__s">' + (l.on ? "Added to your quote" : "Add to my quote") + "</span></div>" + daysRow(l, i) + "</div></div>";
    }).join("");
  }
  /* the video upgrades: what the client can pick on the quote page = the featured cards and every line the studio has not validated (numbers in d.lines) */
  function customUpIdx(d) { var r = []; d.lines.forEach(function (l, i) { if (l.card || l.band || !l.on) r.push(i); }); return r; }
  /* the selection the studio saved: its package and the upgrades that count in its total */
  function customSelOf(d) {
    var days = {}; d.lines.forEach(function (l, i) { if (l.days) days[i] = l.qty; });
    return { chosen: d.chosen, ups: customUpIdx(d).filter(function (i) { return d.lines[i].on; }), days: days };
  }
  /* a selection as it comes back from the database (or from an older page) -> chosen package, upgrades, and a number of days (1 to 5) for every line sold per day */
  function customSelNorm(d, sel) {
    var base = customSelOf(d), s = sel && typeof sel === "object" ? sel : {}, okUps = customUpIdx(d), dy = s.days && typeof s.days === "object" ? s.days : {}, days = {};
    d.lines.forEach(function (l, i) { if (l.days) { var n = Math.round(+dy[i]); days[i] = n >= 1 && n <= DAYS_MAX ? n : base.days[i]; } });
    return { chosen: pkgById(d.packages, s.chosen) ? s.chosen : base.chosen, ups: (Array.isArray(s.ups) ? s.ups : []).filter(function (i) { return okUps.indexOf(i) > -1; }), days: days };
  }
  /* the definition as it reads with a client's selection { chosen, ups: [line numbers], days: { line number: 1..5 } } (without one, as the studio saved it) */
  function customView(d, sel) {
    var v = JSON.parse(JSON.stringify(d));
    if (!sel) return v;
    if (pkgById(v.packages, sel.chosen)) v.chosen = sel.chosen;
    var ups = Array.isArray(sel.ups) ? sel.ups : [], idx = customUpIdx(d), dy = sel.days && typeof sel.days === "object" ? sel.days : {};
    v.lines.forEach(function (l, i) {
      if (idx.indexOf(i) > -1) l.on = ups.indexOf(i) > -1;
      var n = Math.round(+dy[i]); if (l.days && n >= 1 && n <= DAYS_MAX) l.qty = n;
    });
    return v;
  }
  var sortedStr = function (a) { return JSON.stringify((a || []).slice().sort(function (x, y) { return x - y; })); };
  var daysStr = function (o) { o = o || {}; return JSON.stringify(Object.keys(o).sort().map(function (k) { return [k, +o[k]]; })); };
  var sameSel = function (a, b) { return a.chosen === b.chosen && sortedStr(a.ups) === sortedStr(b.ups) && daysStr(a.days) === daysStr(b.days); };
  /* "Video upgrades": a red section under the summary. Every upgrade is a card the client selects (the total follows) and can open to read what it is. */
  function customUpgrades(d, o) {
    o = o || {};
    var idx = customUpIdx(d).filter(function (i) { return !d.lines[i].band; });   // (the separate lines under the comparison are not in the red section)
    if (!idx.length) return "";
    var sel = o.sel ? o.sel.ups : customSelOf(d).ups;
    var dv = o.sel && o.sel.days ? o.sel.days : {};   // the number of days the client picked, for the lines sold per day
    return '<section class="px-ups"' + (o.id ? ' id="' + o.id + '"' : "") + '><div class="px-wrap px-wrap--col"><p class="kicker">Video upgrades</p><h2 class="px-h2">Take it <em>further</em></h2>' +
      '<p class="px-ups__p">Select the upgrades you would like: your total updates by itself. Then save your selection and send it to us for review.</p></div><div class="px-ups__list">' +
      idx.map(function (i) {
        var l = d.lines[i], n = Math.round(+dv[i]); if (l.days && n >= 1 && n <= DAYS_MAX) l = Object.assign({}, l, { qty: n });
        var on = sel.indexOf(i) > -1, price = lineAmt(l), paras = String(l.sub || "").split(/\n+/).filter(Boolean), has = paras.length || l.inc.length || l.days;
        var head = '<button type="button" class="px-up__sel" role="checkbox" aria-checked="' + on + '" data-i="' + i + '" aria-label="Select ' + esc(l.name) + '"><span class="bx" aria-hidden="true"></span></button>' +
          '<span class="px-up__t">' + esc(titleOf(l)) + '</span><span class="px-up__p">' + (price < 0 ? "− " : "+ ") + eur(Math.abs(price)) + '</span><span class="px-up__s">' + (on ? "Selected" : "Not selected") + "</span>" + (has ? '<i class="px-up__chev" aria-hidden="true"></i>' : "<i></i>");
        var body = '<div class="px-up__body">' + paras.map(function (t) { return "<p>" + esc(t) + "</p>"; }).join("") +
          daysRow(l, i) + (l.inc.length ? '<p class="px-up__h">What is included</p><ul>' + l.inc.map(function (t) { return '<li><span class="bx" aria-hidden="true"></span><span>' + esc(t) + "</span></li>"; }).join("") + "</ul>" : "") + "</div>";
        return has ? '<details class="px-up' + (on ? " is-sel" : "") + '" data-i="' + i + '"><summary>' + head + "</summary>" + body + "</details>"
          : '<div class="px-up' + (on ? " is-sel" : "") + '" data-i="' + i + '"><div class="px-up__sum">' + head + "</div></div>";
      }).join("") + "</div></section>";
  }
  var customLink = function (ref, names) { return "proposal.html#" + slug(names) + "-" + ref; };
  /* proposal.html#<slug>-<ref> (no dot, no token): the page fetches everything from the database by the reference */
  function parseCustomLink(hash) {
    var m = /^#?(?:[a-z0-9-]*-)?([a-z0-9]{12})$/.exec(String(hash || ""));
    return m ? { ref: m[1] } : null;
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
  function aboutSection(o) {
    return '<section class="px-about" id="about">' +
      '<img class="px-about__art" alt="" aria-hidden="true" draggable="false" loading="lazy" src="assets/img/quote/q-lobster.webp">' +
      '<div class="px-wrap px-about__head"><div><p class="kicker">— About Chromata</p><h2 class="px-h2">Visual narratives, not <em>documentation</em></h2>' +
      '<p class="px-about__p">' + esc(o && o.text ? o.text : ABOUT) + "</p></div>" +
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
  function studioQuote(a, ex) { return spread(lines(a), ex); }
  /* the shared maths: L = priced lines [{ key, label, price, sub? }]; a line with key "travel" is the travel / accommodation line */
  function spread(L, ex) {
    ex = ex || {};
    var travel = (ex.travel === null || ex.travel === undefined || ex.travel === "" || isNaN(+ex.travel)) ? null : Math.max(0, Math.round(+ex.travel));
    var base = 0;
    L.forEach(function (l) { if (l.key !== "travel" && l.key !== "optional") base += l.price; });
    var comm = base > 0 ? Math.max(0, Math.round(+ex.commission || 0)) : 0;
    var f = base > 0 ? (base + comm) / base : 1, big = -1, sum = 0;
    var rows = L.map(function (l, i) {
      if (l.key === "travel") return travel === null ? { l: l.label, p: 0, t: "tbc" } : { l: "Travel / accommodation", p: travel, t: "inc" };
      /* an option the client has not validated yet: listed with its price, but not counted anywhere */
      if (l.key === "optional") return l.sub ? { l: l.label, p: l.price, t: "opt", s: l.sub } : { l: l.label, p: l.price, t: "opt" };
      var p = Math.round(l.price * f);
      sum += p;
      if (l.price > 0 && (big < 0 || l.price > L[big].price)) big = i;
      return l.sub ? { l: l.label, p: p, t: "", s: l.sub } : { l: l.label, p: p, t: "" };
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
  function stackHTML(list) {
    list = list || FILMS;
    return '<div class="film-stack">' + list.map(function (f, i) {
      return '<article class="film-layer film-layer--' + (i % 2 ? "b" : "a") + '" style="z-index:' + (i + 1) + '">' +
        '<div class="film-layer__in"><header><span class="num">' + String(i + 1).padStart(2, "0") + " / " + String(list.length).padStart(2, "0") + "</span>" +
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
    ABOUT: ABOUT, ABOUT_GENERIC: ABOUT_GENERIC, safeImg: safeImg, emLast: emLast, customBlank: customBlank, customClean: customClean, customLines: customLines, customQuote: customQuote,
    customCompare: customCompare, customUpgrades: customUpgrades, parseVideo: parseVideo, customVideoList: customVideoList, directorLine: directorLine, super16Line: super16Line, dayInfo: dayInfo, DAYS_MAX: DAYS_MAX, customSelNorm: customSelNorm, customView: customView, customSelOf: customSelOf, customUpIdx: customUpIdx, sameSel: sameSel, clipML: clipML, customLink: customLink, parseCustomLink: parseCustomLink,
    studioQuote: studioQuote, VALID_DAYS: VALID_DAYS, isoOf: isoOf, addDaysISO: addDaysISO, validUntil: validUntil, validityNote: validityNote,
    proposalUrl: proposalUrl, parseProposal: parseProposal, slug: slug,
    STEP_IMG: STEP_IMG, FILMS: FILMS, filmSrc: filmSrc, PHOTOS: PHOTOS, rowHTML: rowHTML, stackHTML: stackHTML,
    initMenu: initMenu, lazyFrames: lazyFrames, lightbox: lightbox
  };
})(window);
