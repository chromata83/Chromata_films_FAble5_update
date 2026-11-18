/* Chromata CRM — Tools: the custom quote builder. Loaded after crm.js and BEFORE crm-views.js (which starts the app).

   For events that are not weddings (a Christmas party, a Bar Mitzvah, a brand film...) the studio composes a quote of its own in the same look as the
   website quotation: its own packages (names, prices, descriptions), a comparison table that reads them, video upgrades, travel, and the pictures it wants.
   Saving creates (or updates) a project with a private link, proposal.html#<slug>-<ref>. The page behind that link reads everything from the database
   (quote_status), so a change saved here shows on the same link by itself. Nothing in the link carries a price. */
(function () {
  "use strict";
  var A = window.CRMApp, S = A.S, api = A.api, C = A.C, esc = A.esc, eur = A.eur, $ = A.$, $$ = A.$$, toast = A.toast, fail = A.fail, byId = A.byId, iso = A.iso, shell = A.shell;
  var Q = window.CQ;
  var MAX_PHOTOS = 24, MAX_PKG = 4, MAX_ROWS = 16, MAX_LINES = 24;
  var KINDS = ["Wedding", "Christmas party", "Bar Mitzvah", "Bat Mitzvah", "Birthday", "Anniversary", "Baptism", "Corporate event", "Brand film"];
  var DEFAULT_NOTE = "Travel and accommodation: " + Q.TRAVEL_TBC + ".";

  var W = null;            // the quote being built (what the form says)
  var libTarget = "";      // where a picture picked in the library goes: "hero" | "gallery" | "" (closed)
  var busy = false;

  var dayOf = function (ts) { return ts ? String(ts).slice(0, 10) : ""; };
  var issuedOf = function (p) { return dayOf(p.quote_issued_at || p.quote_sent_at || p.created_at) || iso(new Date()); };
  var copy = function (x) { return JSON.parse(JSON.stringify(x)); };
  var customList = function () { return S.projects.filter(function (p) { return p.quote_custom; }).sort(function (a, b) { return (b.created_at || "") < (a.created_at || "") ? -1 : 1; }); };

  /* ---------------- Tools home ---------------- */
  A.views.tools = function (sub, id) { if (sub === "quote") builder(id); else home(); };

  function home() {
    var list = customList();
    var rows = list.map(function (p) {
      var d = p.quote_custom || {}, link = p.proposal_url || "";
      return '<div class="crow"><div class="ct"><strong>' + esc(p.couple_names) + "</strong><small>" + esc([d.kind, p.wedding_date ? C.fmtDate(p.wedding_date) : "No date", p.collection, p.total ? eur(p.total) : ""].filter(Boolean).join(" · ")) + "</small></div>" +
        '<div class="ca">' + A.pill(p.status) + (p.client_selection ? '<span class="pill quote">Selection to review</span>' : "") + '<a class="btn sm" href="#/tools/quote/' + p.id + '">Edit</a><a class="btn ghost sm" href="#/tools/quote/copy-' + p.id + '">Duplicate</a>' +
        (link ? '<a class="btn ghost sm" target="_blank" rel="noopener" href="' + esc(link) + '">Open the page</a>' : "") + '<a class="btn ghost sm" href="#/project/' + p.id + '">Project</a></div></div>';
    }).join("");
    shell("tools", '<header class="top"><h1>Tools</h1></header>' +
      '<section class="cr-card"><div class="sh"><h2>Custom quote</h2><a class="btn" href="#/tools/quote/new">New custom quote</a></div>' +
      '<p class="hint">Make a quote of your own, in the same look as the website quotation, for events that are not weddings (Christmas party, Bar Mitzvah, a brand film…). ' +
      "You choose the names of the packages, their prices and descriptions, what each one includes (the comparison follows), video upgrades, and the pictures. " +
      "It becomes a project with a private link, exactly like a quote from the website.</p>" +
      (rows || '<p class="empty">No custom quote yet.</p>') + "</section>");
  }

  /* ---------------- the working copy ---------------- */
  function fromDef(d, p) {
    return { id: p.id || "", ref: p.quote_ref || "", url: p.proposal_url || "", names: p.couple_names || "", email: p.couple_email || "", date: p.wedding_date || "", venue: p.venue || "", place: p.location || "",
      kind: d.kind, word: d.word, lead: d.lead, hero: d.hero, photosTitle: d.photosTitle, chosen: d.chosen, packages: copy(d.packages), features: copy(d.features), lines: d.lines.map(function (l) { var c = copy(l); c.incText = l.inc.join("\n"); return c; }), extra: copy(d.extra), photos: copy(d.photos),
      travelShow: d.travel.show, note: d.note, aboutOn: d.about.on, aboutText: d.about.text, films: d.films, videos: copy(d.videos), videosTitle: d.videosTitle,
      issued: p.id ? issuedOf(p) : iso(new Date()), status: p.status || "" };
  }
  function fresh() { var w = fromDef(Q.customClean(Q.customBlank()), {}); w.note = DEFAULT_NOTE; return w; }
  /* the form -> a clean definition (what is stored with the project) */
  function toDef() {
    var d = Q.customClean({ kind: W.kind, word: W.word, lead: W.lead, hero: W.hero, photosTitle: W.photosTitle, chosen: W.chosen, packages: W.packages, features: W.features, lines: W.lines.map(function (l) { return Object.assign({}, l, { inc: String(l.incText || "").split("\n") }); }), extra: W.extra, photos: W.photos,
      travel: { show: W.travelShow }, note: W.note, about: { on: W.aboutOn, text: W.aboutText === Q.ABOUT_GENERIC ? "" : W.aboutText }, films: W.films, videos: W.videos, videosTitle: W.videosTitle });
    delete d.names; delete d.date; delete d.place; delete d.venue; delete d.planner;   // who it is for lives in the project columns
    return d;
  }
  function pkgById(id) { for (var i = 0; i < W.packages.length; i++) if (W.packages[i].id === id) return W.packages[i]; return null; }
  function newPkgId() { var n = "abcdefghijklmnopqrstuvwxyz"; for (var i = 0; i < n.length; i++) if (!pkgById(n[i])) return n[i]; return "p" + Date.now(); }

  /* "features.2.on.1" -> W.features[2].on[1] */
  function setPath(path, v) {
    var k = path.split("."), o = W;
    for (var i = 0; i < k.length - 1; i++) o = o[k[i]];
    o[k[k.length - 1]] = v;
  }

  /* ---------------- builder ---------------- */
  function builder(id) {
    var p = null;
    if (!id || id === "new") W = fresh();
    else if (id.indexOf("copy-") === 0 && (p = byId(S.projects, id.slice(5))) && p.quote_custom) {
      W = fromDef(Q.customClean(p.quote_custom), Object.assign({}, p, { id: "", quote_ref: "", proposal_url: "" }));
      W.names = p.couple_names + " (copy)"; W.id = ""; W.ref = ""; W.url = ""; W.date = ""; W.issued = iso(new Date());
    } else if ((p = byId(S.projects, id)) && p.quote_custom) W = fromDef(Q.customClean(p.quote_custom), p);
    else { location.hash = "#/tools"; return; }
    libTarget = "";
    draw();
  }

  var tr = function (b, key, extra) { return ' data-b="' + b + '"' + (extra || ""); };
  function thumb(src) { return '<img class="qb-img" alt="" src="' + esc(src) + '">'; }

  function packagesHTML() {
    var n = W.packages.length;
    return W.packages.map(function (p, i) {
      return '<div class="qb-pkg' + (W.chosen === p.id ? " on" : "") + '"><label class="qe-chk"><input type="radio" name="qbChosen" data-chosen="' + i + '"' + (W.chosen === p.id ? " checked" : "") + "> <strong>For this client</strong> <small>(the one in the quote, shown in yellow)</small></label>" +
        '<div class="grid2"><label class="fld"><span>Name</span><input type="text"' + tr("packages." + i + ".name") + ' maxlength="60" value="' + esc(p.name) + '"></label>' +
        '<label class="fld"><span>Price (€)</span><input type="number" min="0" step="any"' + tr("packages." + i + ".price") + ' value="' + (p.price || "") + '" placeholder="0"></label></div>' +
        '<label class="fld"><span>Description <small>(as long as you like, up to 2000 characters: under the name, in the comparison and on the quote line)</small></span><textarea rows="5" maxlength="2000"' + tr("packages." + i + ".sub") + ">" + esc(p.sub) + "</textarea></label>" +
        '<div class="qb-act">' + (i > 0 ? '<button class="btn ghost sm" type="button" data-act="pkg-left" data-i="' + i + '" aria-label="Move left">&larr; Left</button>' : "") +
        (i < n - 1 ? '<button class="btn ghost sm" type="button" data-act="pkg-right" data-i="' + i + '" aria-label="Move right">Right &rarr;</button>' : "") +
        (n > 1 ? '<button class="btn danger sm" type="button" data-act="pkg-del" data-i="' + i + '">Remove</button>' : "") + "</div></div>";
    }).join("");
  }
  function featuresHTML() {
    var head = '<tr><th scope="col">What is included</th>' + W.packages.map(function (p, i) { return '<th scope="col" data-th="' + i + '">' + esc(p.name) + "</th>"; }).join("") + "<th></th></tr>";
    var body = W.features.map(function (f, j) {
      return "<tr><td><input type=\"text\"" + tr("features." + j + ".k") + ' maxlength="200" value="' + esc(f.k) + '" placeholder="e.g. Drone footage" aria-label="Row label"></td>' +
        W.packages.map(function (p, i) {
          return '<td><div class="qb-cell"><input type="checkbox"' + tr("features." + j + ".on." + i) + (f.on[i] ? " checked" : "") + ' aria-label="Included in ' + esc(p.name) + '"><input type="text"' + tr("features." + j + ".d." + i) + ' maxlength="120" value="' + esc(f.d[i] || "") + '" placeholder="detail" aria-label="Detail for ' + esc(p.name) + '"></div></td>';
        }).join("") +
        '<td class="qb-rowact"><button class="btn ghost sm" type="button" data-act="row-up" data-j="' + j + '" aria-label="Move up"' + (j === 0 ? " disabled" : "") + '>&uarr;</button><button class="btn ghost sm" type="button" data-act="row-down" data-j="' + j + '" aria-label="Move down"' + (j === W.features.length - 1 ? " disabled" : "") + '>&darr;</button><button class="btn danger sm" type="button" data-act="row-del" data-j="' + j + '" aria-label="Remove the row">&times;</button></td></tr>';
    }).join("");
    return '<div class="qb-tblwrap"><table class="qb-tbl"><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>";
  }
  function linesHTML() {
    return W.lines.map(function (l, j) {
      return '<div class="qb-line' + (l.on ? " on" : "") + '"><label class="qe-chk qb-ok"><input type="checkbox"' + tr("lines." + j + ".on") + (l.on ? " checked" : "") + '> <strong>Validated by the client</strong> <small>(ticked: counts in the total · unticked: only listed as a video upgrade, the total does not move)</small></label><div class="qb-line__a"><label class="fld"><span>Line</span><input type="text"' + tr("lines." + j + ".name") + ' maxlength="200" value="' + esc(l.name) + '" placeholder="e.g. Extra hour of filming"></label>' +
        '<label class="fld"><span>Price (€)</span><input type="number" step="any"' + tr("lines." + j + ".price") + ' value="' + (l.price === 0 ? "" : l.price) + '" placeholder="0"></label>' +
        '<label class="fld"><span>Qty</span><input type="number" min="1" max="99" step="1"' + tr("lines." + j + ".qty") + ' value="' + (l.qty || 1) + '"></label>' +
        '<label class="fld"><span>Unit <small>(optional)</small></span><input type="text"' + tr("lines." + j + ".unit") + ' maxlength="20" value="' + esc(l.unit) + '" placeholder="hour"></label></div>' +
        '<label class="fld"><span>Description <small>(optional · a blank line starts a new paragraph)</small></span><textarea rows="' + (l.card || l.band ? 7 : 3) + '" maxlength="1500"' + tr("lines." + j + ".sub") + '>' + esc(l.sub) + '</textarea></label>' +
        '<label class="qe-chk" style="margin:4px 0 4px"><input type="checkbox"' + tr("lines." + j + ".band") + (l.band ? " checked" : "") + '> <strong>Show as a separate line under the comparison</strong> <small>(like the extra: the description and what is included are readable at once, with a box to add it to the quote)</small></label>' +
        (l.band ? "" : '<label class="qe-chk" style="margin:4px 0 8px"><input type="checkbox"' + tr("lines." + j + ".card") + (l.card ? " checked" : "") + '> <strong>Show as a clickable card</strong> <small>(in the “Video upgrades” section of the quote: the client opens it to read the description and what is included)</small></label>') +
        (l.card || l.band ? '<label class="fld"><span>What is included <small>(one item per line, 12 at most)</small></span><textarea rows="5" maxlength="1500"' + tr("lines." + j + ".incText") + '>' + esc(l.incText || "") + '</textarea></label>' : "") +
        '<div class="qb-act"><button class="btn ghost sm" type="button" data-act="line-up" data-j="' + j + '"' + (j === 0 ? " disabled" : "") + '>&uarr; Up</button><button class="btn ghost sm" type="button" data-act="line-down" data-j="' + j + '"' + (j === W.lines.length - 1 ? " disabled" : "") + '>&darr; Down</button><button class="btn danger sm" type="button" data-act="line-del" data-j="' + j + '">Remove</button></div></div>';
    }).join("");
  }
  /* the "Extra as per ..." line: a price for every package, added to the quote by itself for the package chosen */
  function extraHTML() {
    var x = W.extra;
    return '<section class="cr-card"><h2>Extra under the comparison</h2><p class="hint">A clearly visible line under the comparison for something that costs more depending on the package (for example “Extra as per Christmas day coverage”). The amount of the package chosen for this client is added to the quote by itself.</p>' +
      '<label class="qe-chk"><input type="checkbox"' + tr("extra.on") + (x.on ? " checked" : "") + "> Show this extra</label>" +
      (x.on ? '<label class="fld" style="margin-top:10px"><span>Text of the line</span><input type="text"' + tr("extra.label") + ' maxlength="160" value="' + esc(x.label) + '" placeholder="Extra as per Christmas day coverage"></label>' +
        '<label class="fld"><span>Small text <small>(optional)</small></span><input type="text"' + tr("extra.sub") + ' maxlength="300" value="' + esc(x.sub) + '" placeholder="Added to the quote for the package you choose"></label>' +
        '<div class="grid2">' + W.packages.map(function (p, i) { return '<label class="fld"><span>Extra for ' + esc(p.name) + ' (€)</span><input type="number" min="0" step="any"' + tr("extra.prices." + i) + ' value="' + (x.prices[i] || "") + '" placeholder="0"></label>'; }).join("") + "</div>" : "") + "</section>";
  }
  /* the film director upgrade, ready to use (price and wording can be edited afterwards) */
  function directorLine() {
    var l = Q.directorLine(); l.incText = l.inc.join("\n"); return l;
  }
  /* the videos of the quote: a box per YouTube / Vimeo link, they replace the wedding films */
  function videoStatus(u) { var p = String(u || "").trim() ? Q.parseVideo(u) : null; return !String(u || "").trim() ? "" : p ? (p.yt ? "✓ YouTube video" : "✓ Vimeo video") : "✗ link not recognised (paste the address of a YouTube or Vimeo video)"; }
  function videosHTML() {
    var rows = W.videos.map(function (v, k) {
      var st = videoStatus(v.url);
      return '<div class="qb-vid"><label class="fld"><span>Link <small data-vs="' + k + '" class="' + (st.charAt(0) === "✗" ? "bad" : "good") + '">' + esc(st) + '</small></span><input type="url"' + tr("videos." + k + ".url") + ' maxlength="300" value="' + esc(v.url) + '" placeholder="https://vimeo.com/123456789 or https://youtu.be/…"></label>' +
        '<div class="grid2"><label class="fld"><span>Title <small>(optional)</small></span><input type="text"' + tr("videos." + k + ".title") + ' maxlength="120" value="' + esc(v.title) + '" placeholder="e.g. Christmas 2025, Villa Ephrussi"></label>' +
        '<label class="fld"><span>Small text <small>(optional)</small></span><input type="text"' + tr("videos." + k + ".sub") + ' maxlength="160" value="' + esc(v.sub) + '" placeholder="e.g. Highlight film"></label></div>' +
        '<div class="qb-act"><button class="btn ghost sm" type="button" data-act="vid-up" data-j="' + k + '"' + (k === 0 ? " disabled" : "") + '>&uarr; Up</button><button class="btn ghost sm" type="button" data-act="vid-down" data-j="' + k + '"' + (k === W.videos.length - 1 ? " disabled" : "") + '>&darr; Down</button><button class="btn danger sm" type="button" data-act="vid-del" data-j="' + k + '">Remove</button></div></div>';
    }).join("");
    return '<section class="cr-card"><h2>Videos</h2><p class="hint">Paste a YouTube or Vimeo link in each box: the quote shows the films you chose, in this order, in place of the wedding films. No video, no section.</p>' +
      '<label class="fld" style="max-width:420px;margin-bottom:12px"><span>Title of the section</span><input type="text"' + tr("videosTitle") + ' maxlength="60" value="' + esc(W.videosTitle) + '"></label>' +
      (rows || '<p class="empty">No video yet.</p>') + '<div class="acts"><button class="btn ghost" type="button" data-act="vid-add"' + (W.videos.length >= 8 ? " disabled" : "") + ">Add a video</button></div></section>";
  }
  function photosHTML() {
    return W.photos.map(function (p, i) {
      return '<figure class="qb-ph">' + thumb(p.src) + '<input type="text"' + tr("photos." + i + ".alt") + ' maxlength="140" value="' + esc(p.alt) + '" placeholder="Description (optional)" aria-label="Description of picture ' + (i + 1) + '">' +
        '<div class="qb-act"><button class="btn ghost sm" type="button" data-act="ph-cover" data-i="' + i + '" title="Use as cover photo">Cover</button><button class="btn ghost sm" type="button" data-act="ph-left" data-i="' + i + '" aria-label="Move earlier"' + (i === 0 ? " disabled" : "") + '>&larr;</button><button class="btn ghost sm" type="button" data-act="ph-right" data-i="' + i + '" aria-label="Move later"' + (i === W.photos.length - 1 ? " disabled" : "") + '>&rarr;</button><button class="btn danger sm" type="button" data-act="ph-del" data-i="' + i + '" aria-label="Remove">&times;</button></div></figure>';
    }).join("");
  }
  function libraryHTML() {
    var lib = window.CQ_LIBRARY; if (!lib || !libTarget) return "";
    var folders = Object.keys(lib), cur = W._folder && lib[W._folder] ? W._folder : folders[0];
    return '<div class="qb-lib"><div class="sh"><h3>' + (libTarget === "hero" ? "Pick the cover photo" : "Pick pictures for the mosaic") + '</h3><button class="btn ghost sm" type="button" data-act="lib-close">Done</button></div>' +
      '<label class="fld"><span>Folder of the site</span><select id="qbFolder">' + folders.map(function (f) { return '<option value="' + f + '"' + (f === cur ? " selected" : "") + ">" + esc(f) + " (" + lib[f].length + ")</option>"; }).join("") + "</select></label>" +
      '<div class="qb-libgrid">' + lib[cur].map(function (f) { var src = "assets/img/" + cur + "/" + f; return '<button type="button" class="qb-lt" data-act="lib-pick" data-src="' + esc(src) + '" title="' + esc(f) + '"><img loading="lazy" alt="' + esc(f) + '" src="' + esc(src) + '"></button>'; }).join("") + "</div></div>";
  }

  function formHTML() {
    var kinds = KINDS.map(function (k) { return '<option value="' + esc(k) + '"></option>'; }).join("");
    var heroBlock = W.hero ? '<div class="qb-hero">' + thumb(W.hero) + '<button class="btn danger sm" type="button" data-act="hero-del">Remove</button></div>' : '<p class="hint">No cover photo chosen: the standard photograph of the quotation is used.</p>';
    return '<div class="qb-main">' +
      '<section class="cr-card"><h2>The event</h2><div class="grid2">' +
        '<label class="fld"><span>Kind of event <small>(shown under the title)</small></span><input type="text" list="qbKinds"' + tr("kind") + ' maxlength="60" value="' + esc(W.kind) + '" placeholder="Christmas party, Bar Mitzvah…"><datalist id="qbKinds">' + kinds + "</datalist></label>" +
        '<label class="fld"><span>Prepared for <small>(name at the top of the page)</small></span><input type="text"' + tr("names") + ' maxlength="160" value="' + esc(W.names) + '" placeholder="e.g. Famille Cohen" required></label>' +
        '<label class="fld"><span>Client email</span><input type="email"' + tr("email") + ' value="' + esc(W.email) + '" placeholder="optional"></label>' +
        '<label class="fld"><span>Date of the event</span><input type="date"' + tr("date") + ' value="' + esc(W.date) + '"></label>' +
        '<label class="fld"><span>Venue</span><input type="text"' + tr("venue") + ' value="' + esc(W.venue) + '"></label>' +
        '<label class="fld"><span>Location</span><input type="text"' + tr("place") + ' value="' + esc(W.place) + '"></label></div>' +
      '<label class="fld" style="margin-top:14px"><span>Introduction <small>(under the title; empty = the usual thank-you sentence)</small></span><textarea rows="3" maxlength="1500"' + tr("lead") + ">" + esc(W.lead) + "</textarea></label></section>" +

      '<section class="cr-card"><h2>Packages</h2><p class="hint">Up to ' + MAX_PKG + ". Each one has a name, a price and a description. The package marked <strong>For this client</strong> is the one that is charged in this quote; it is shown in yellow in the comparison, the others in white.</p>" +
      '<label class="fld" style="max-width:340px;margin-bottom:14px"><span>What do you call them? <small>(package, collection, formula, option…)</small></span><input type="text"' + tr("word") + ' maxlength="20" value="' + esc(W.word) + '"></label>' +
      '<div class="qb-pkgs">' + packagesHTML() + '</div><div class="acts"><button class="btn ghost" type="button" data-act="pkg-add"' + (W.packages.length >= MAX_PKG ? " disabled" : "") + ">Add a package</button></div></section>" +

      '<section class="cr-card"><h2>Comparison</h2><p class="hint">One row per thing included. Tick it in each package that has it; the small text next to the tick adds a detail (“3 h”, “× 3”…). The cards of the quote are built from these rows.</p>' +
      featuresHTML() + '<div class="acts"><button class="btn ghost" type="button" data-act="row-add"' + (W.features.length >= MAX_ROWS ? " disabled" : "") + ">Add a row</button></div></section>" +

      extraHTML() +

      '<section class="cr-card"><h2>Video upgrades</h2><p class="hint">Everything the client can add to the chosen package: extra hours, a second shooter, a drone, a discount (negative price)… Each line is price × quantity. A new line is only <strong>listed as an option</strong>: tick <strong>Validated by the client</strong> once they have agreed, and only then does it count in the total.</p>' +
      (linesHTML() || '<p class="empty">No video upgrade yet.</p>') + '<div class="acts"><button class="btn ghost" type="button" data-act="line-add"' + (W.lines.length >= MAX_LINES ? " disabled" : "") + ">Add a video upgrade</button>" + '<button class="btn ghost" type="button" data-act="line-director"' + (W.lines.length >= MAX_LINES ? " disabled" : "") + ">Add the Film director upgrade</button></div></section>" +

      '<section class="cr-card"><h2>Travel and accommodation</h2><label class="qe-chk"><input type="checkbox"' + tr("travelShow") + (W.travelShow ? " checked" : "") + "> Show a line saying travel / accommodation is included</label>" +
      '<label class="fld" style="margin-top:10px"><span>Note under the title of the lines</span><textarea rows="2" maxlength="300"' + tr("note") + ">" + esc(W.note) + "</textarea></label>" +
      '<p class="hint" style="margin:8px 0 0">No cost: the quote simply shows a line “Travel / accommodation · Included”.</p></section>' +

      '<section class="cr-card"><h2>Pictures</h2><div id="qbUp" class="hint" role="status"></div>' +
      '<h3 class="qb-h3">Cover photo <small>(the big picture at the top of the quote)</small></h3>' + heroBlock +
      '<div class="qb-add"><label class="btn ghost sm qb-file">Upload from my computer<input type="file" accept="image/jpeg,image/png,image/webp" data-up="hero" hidden></label>' + (window.CQ_LIBRARY ? '<button class="btn ghost sm" type="button" data-act="lib-hero">Pick from the site</button>' : "") + "</div>" +
      '<h3 class="qb-h3">Mosaic of pictures</h3><label class="fld" style="max-width:420px;margin-bottom:12px"><span>Title of the mosaic</span><input type="text"' + tr("photosTitle") + ' maxlength="60" value="' + esc(W.photosTitle) + '"></label>' +
      '<div class="qb-phs">' + photosHTML() + "</div>" + (W.photos.length ? "" : '<p class="empty">No picture: the mosaic is not shown on the quote.</p>') +
      '<div class="qb-add"><label class="btn ghost sm qb-file">Upload pictures<input type="file" accept="image/jpeg,image/png,image/webp" multiple data-up="gallery" hidden></label>' + (window.CQ_LIBRARY ? '<button class="btn ghost sm" type="button" data-act="lib-gallery">Pick from the site</button>' : "") +
      '<span class="qb-url"><input type="url" id="qbUrl" placeholder="or paste an https:// picture link" aria-label="Picture link"><button class="btn ghost sm" type="button" data-act="url-add">Add</button></span></div>' +
      '<p class="hint" style="margin:8px 0 0">' + W.photos.length + " / " + MAX_PHOTOS + " pictures. Pictures you upload are resized (2000 px) and stored in your Supabase storage; they are visible to anyone who has the quote link.</p>" + libraryHTML() + "</section>" +

      '<section class="cr-card"><h2>Other sections</h2><label class="qe-chk"><input type="checkbox"' + tr("aboutOn") + (W.aboutOn ? " checked" : "") + "> Show the “About Chromata” section (Kevin and Laura, the film posters)</label>" +
      '<label class="fld" style="margin:10px 0 14px"><span>Text of the About section</span><textarea rows="6" maxlength="1500"' + tr("aboutText") + ">" + esc(W.aboutText || Q.ABOUT_GENERIC) + "</textarea></label>" +
      '<label class="qe-chk"><input type="checkbox"' + tr("films") + (W.films ? " checked" : "") + "> Also show the wedding films “Stories we filmed” (only used when you have not added a video below)</label></section>" +

      videosHTML() +

      '<section class="cr-card"><h2>Issue date</h2><div class="grid2"><label class="fld"><span>Issued on</span><input type="date" id="qbIssued"' + tr("issued") + ' value="' + esc(W.issued) + '"></label><div class="fld"><span>&nbsp;</span><button class="btn ghost" type="button" data-act="today">Issue again today</button></div></div>' +
      '<p class="hint" id="qbValid" style="margin:8px 0 0"></p></section></div>';
  }

  function asideHTML() {
    var saved = !!W.id;
    return '<aside class="qb-side qe-prev" aria-live="polite"><h3>What the client sees</h3><div id="qbPrev"></div>' +
      '<div class="acts" style="margin-top:16px"><button class="btn" type="button" id="qbSave">' + (saved ? "Save and update the link" : "Save and create the link") + "</button></div>" +
      (saved && W.url ? '<div class="qb-links"><input id="qbLink" readonly value="' + esc(W.url) + '" aria-label="Client link"><div class="acts" style="margin-top:8px"><button class="btn ghost sm" type="button" data-act="copy">Copy link</button><a class="btn ghost sm" target="_blank" rel="noopener" href="' + esc(W.url) + '">Open the page</a>' +
        '<a class="btn ghost sm" target="_blank" rel="noopener" title="Opens the page and starts the PDF (choose Save as PDF)" href="' + esc(W.url.replace("#", "?pdf=1#")) + '">PDF</a><a class="btn ghost sm" href="#/project/' + W.id + '">Project</a></div></div>'
        : '<p class="hint" style="margin-top:14px">Saving creates the project and its private link. Nothing is sent to the client until you send them the link.</p>') + "</aside>";
  }

  function draw() {
    var y = window.scrollY;
    shell("tools", '<header class="top"><h1>' + (W.id ? "Custom quote" : "New custom quote") + '</h1><a class="btn ghost" href="#/tools">Back to Tools</a></header>' + (W.id ? selBox(byId(S.projects, W.id)) : "") + '<div class="qb-grid">' + formHTML() + asideHTML() + "</div>");
    wire(); paintPrev();
    window.scrollTo(0, y);
  }

  /* the live summary: the client's lines and total, and the validity */
  function paintPrev() {
    var el = $("#qbPrev"); if (!el) return;
    var d = toDef(), q = Q.customQuote(d), pk = (d.packages.filter(function (x) { return x.id === d.chosen; })[0]) || {};
    el.innerHTML = '<div class="sumcard">' + q.rows.map(function (x) { return '<div class="srow"><span class="sl">' + esc(x.l) + (x.s ? "<small>" + esc(x.s) + "</small>" : "") + '</span><span class="sr">' + (x.t === "tbc" ? "TBC" : x.t === "inc" ? "Included" : x.t === "opt" ? "Video upgrade · " + eur(x.p) : eur(x.p)) + "</span></div>"; }).join("") +
      '<div class="srow grand"><span class="sl">Total' + (d.travel.show ? " · travel included" : "") + '</span><span class="sr">' + eur(q.total) + "</span></div></div>" +
      '<p class="hint" style="margin:10px 0 0">' + esc(d.word) + " in this quote: <strong>" + esc(pk.name || "—") + "</strong></p>";
    var v = $("#qbValid"), until = Q.validUntil(W.issued);
    if (v) v.textContent = until ? "Valid for " + Q.VALID_DAYS + " days: until " + C.fmtDate(until) + (until < iso(new Date()) ? " (already expired: the client cannot sign online until you issue it again)" : ".") : "";
  }

  /* ---------------- pictures ---------------- */
  var upMsg = function (t, bad) { var e = $("#qbUp"); if (e) { e.textContent = t || ""; e.style.color = bad ? "var(--bad)" : ""; } };
  /* reads a picture, scales it down to 2000 px on its longest side, returns a JPEG (or PNG when it has transparency is not needed: photographs only) */
  function shrink(file, max) {
    return new Promise(function (res, rej) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { rej(new Error("“" + file.name + "”: only JPG, PNG or WebP pictures")); return; }
      if (file.size > 40 * 1024 * 1024) { rej(new Error("“" + file.name + "” is too large (40 MB max)")); return; }
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var s = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(im.naturalWidth * s)); c.height = Math.max(1, Math.round(im.naturalHeight * s));
        var cx = c.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, c.width, c.height); cx.drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { if (b) res(b); else rej(new Error("“" + file.name + "” could not be converted")); }, "image/jpeg", 0.86);
      };
      im.onerror = function () { URL.revokeObjectURL(url); rej(new Error("“" + file.name + "” could not be read as a picture")); };
      im.src = url;
    });
  }
  /* uploads the chosen files one after the other; target "hero" keeps only the first */
  function upload(files, target) {
    files = Array.prototype.slice.call(files);
    if (target === "hero") files = files.slice(0, 1);
    else files = files.slice(0, Math.max(0, MAX_PHOTOS - W.photos.length));
    if (!files.length) { upMsg(target === "hero" ? "" : "The mosaic already holds " + MAX_PHOTOS + " pictures.", true); return; }
    if (busy) return; busy = true;
    var n = 0, done = function () { busy = false; draw(); }, fails = [];
    (function next() {
      if (n >= files.length) {
        if (fails.length) toast(fails[0] + (fails.length > 1 ? " (and " + (fails.length - 1) + " more)" : ""), true);
        done(); return;
      }
      var f = files[n++];
      upMsg("Uploading " + n + " of " + files.length + "…");
      shrink(f, api.kind === "demo" ? 1400 : 2000).then(function (b) { return api.uploadImage(b); }).then(function (src) {
        if (target === "hero") W.hero = src; else W.photos.push({ src: src, alt: "" });
      }).catch(function (e) { fails.push(e && e.message ? e.message : "Upload failed"); }).then(next);
    })();
  }

  /* ---------------- events ---------------- */
  function wire() {
    var root = $(".qb-grid"); if (!root) return;
    root.addEventListener("input", onField); root.addEventListener("change", onField);
    root.addEventListener("click", onClick);
    $$("[data-up]", root).forEach(function (inp) { inp.addEventListener("change", function () { if (inp.files && inp.files.length) upload(inp.files, inp.getAttribute("data-up")); inp.value = ""; }); });
    var fo = $("#qbFolder"); if (fo) fo.onchange = function () { W._folder = fo.value; draw(); };
    var sv = $("#qbSave"); if (sv) sv.onclick = save;
  }
  function onField(e) {
    var t = e.target;
    if (t.hasAttribute("data-chosen")) { W.packages.forEach(function (p, i) { if (i === +t.getAttribute("data-chosen")) W.chosen = p.id; }); $$(".qb-pkg").forEach(function (b, i) { b.classList.toggle("on", W.packages[i].id === W.chosen); }); paintPrev(); return; }
    var path = t.getAttribute("data-b"); if (!path) return;
    var v = t.type === "checkbox" ? t.checked : t.value;
    if (t.type === "checkbox" && /\.on\.\d+$/.test(path)) v = t.checked ? 1 : 0;
    if ((/\.(price|qty)$/.test(path) || /^extra\.prices\.\d+$/.test(path)) && t.type === "number") v = t.value === "" ? 0 : +t.value;
    if (/\.(card|band)$/.test(path) || path === "extra.on") { setPath(path, v); draw(); return; }
    setPath(path, v);
    var mv = /^videos\.(\d+)\.url$/.exec(path);
    if (mv) { var vs = $('[data-vs="' + mv[1] + '"]'); if (vs) { var stt = videoStatus(v); vs.textContent = stt; vs.className = stt.charAt(0) === "✗" ? "bad" : "good"; } }
    var m = /^packages\.(\d+)\.name$/.exec(path);
    if (m) { var th = $('[data-th="' + m[1] + '"]'); if (th) th.textContent = v; }
    paintPrev();
  }
  function move(arr, i, d) { var j = i + d; if (j < 0 || j >= arr.length) return; var x = arr[i]; arr[i] = arr[j]; arr[j] = x; }
  function onClick(e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var act = b.getAttribute("data-act"), i = +b.getAttribute("data-i"), j = +b.getAttribute("data-j");
    var P = W.packages, F = W.features;
    switch (act) {
      case "pkg-add": if (P.length >= MAX_PKG) return; P.push({ id: newPkgId(), name: "Package " + (P.length + 1), sub: "", price: 0 }); W.extra.prices.push(0); F.forEach(function (f) { f.on.push(0); f.d.push(""); }); break;
      case "pkg-del":
        if (P.length < 2) return;
        if (!confirm("Remove the package “" + P[i].name + "”? Its column disappears from the comparison.")) return;
        if (W.chosen === P[i].id) W.chosen = P[i === 0 ? 1 : 0].id;
        P.splice(i, 1); W.extra.prices.splice(i, 1); F.forEach(function (f) { f.on.splice(i, 1); f.d.splice(i, 1); }); break;
      case "pkg-left": case "pkg-right": var dd = act === "pkg-left" ? -1 : 1; move(P, i, dd); move(W.extra.prices, i, dd); F.forEach(function (f) { move(f.on, i, dd); move(f.d, i, dd); }); break;
      case "row-add": if (F.length >= MAX_ROWS) return; F.push({ k: "", on: P.map(function () { return 1; }), d: P.map(function () { return ""; }) }); break;
      case "row-del": F.splice(j, 1); break;
      case "row-up": move(F, j, -1); break;
      case "row-down": move(F, j, 1); break;
      case "line-director": if (W.lines.length >= MAX_LINES) return; W.lines.push(directorLine()); break;
      case "vid-add": if (W.videos.length >= 8) return; W.videos.push({ url: "", title: "", sub: "" }); break;
      case "vid-del": W.videos.splice(j, 1); break;
      case "vid-up": move(W.videos, j, -1); break;
      case "vid-down": move(W.videos, j, 1); break;
      case "line-add": if (W.lines.length >= MAX_LINES) return; W.lines.push({ name: "", sub: "", price: 0, qty: 1, unit: "", on: false }); break;
      case "line-del": W.lines.splice(j, 1); break;
      case "line-up": move(W.lines, j, -1); break;
      case "line-down": move(W.lines, j, 1); break;
      case "ph-cover": W.hero = W.photos[i].src; break;
      case "ph-left": move(W.photos, i, -1); break;
      case "ph-right": move(W.photos, i, 1); break;
      case "ph-del": W.photos.splice(i, 1); break;
      case "hero-del": W.hero = ""; break;
      case "lib-hero": libTarget = "hero"; break;
      case "lib-gallery": libTarget = "gallery"; break;
      case "lib-close": libTarget = ""; break;
      case "lib-pick":
        var src = b.getAttribute("data-src");
        if (libTarget === "hero") { W.hero = src; libTarget = ""; }
        else if (W.photos.length < MAX_PHOTOS && !W.photos.some(function (p) { return p.src === src; })) { W.photos.push({ src: src, alt: "" }); b.classList.add("picked"); upMsg(W.photos.length + " / " + MAX_PHOTOS + " pictures in the mosaic"); paintPhotosOnly(); return; }
        else { upMsg(W.photos.length >= MAX_PHOTOS ? "The mosaic is full." : "This picture is already in the mosaic.", true); return; }
        break;
      case "url-add":
        var u = Q.safeImg(($("#qbUrl").value || "").trim());
        if (!u) { toast("Paste a picture link that starts with https://", true); return; }
        if (W.photos.length >= MAX_PHOTOS) { toast("The mosaic is full", true); return; }
        W.photos.push({ src: u, alt: "" }); break;
      case "today": W.issued = iso(new Date()); break;
      case "copy": (navigator.clipboard ? navigator.clipboard.writeText(W.url) : Promise.reject()).then(function () { toast("Link copied"); }, function () { prompt("Copy this link:", W.url); }); return;
      default: return;
    }
    draw();
  }
  /* picking several pictures in the library keeps the panel open: only refresh the mosaic below it */
  function paintPhotosOnly() { var box = $(".qb-phs"); if (box) box.innerHTML = photosHTML(); var e = $(".qb-phs + .empty"); if (e) e.remove(); }

  /* ---------------- save ---------------- */
  function nonce() {
    var a = new Uint8Array(12), s = "";
    crypto.getRandomValues(a);
    for (var i = 0; i < a.length; i++) s += "0123456789abcdefghijklmnopqrstuvwxyz"[a[i] % 36];
    return s;
  }
  /* ---------------- what the client sent back for review (package + video upgrades picked on the quote page) ---------------- */
  function selInfo(p) {
    if (!p || !p.quote_custom || !p.client_selection || typeof p.client_selection !== "object") return null;
    var d = Q.customClean(p.quote_custom), s = p.client_selection, ups = Array.isArray(s.ups) ? s.ups : [], idx = Q.customUpIdx(d);
    var v = Q.customView(d, { chosen: s.chosen, ups: ups }), q = Q.customQuote(v), before = Q.customQuote(d);
    var after = { chosen: v.chosen, ups: idx.filter(function (i) { return v.lines[i].on; }) };
    return { d: d, v: v, q: q, before: before, same: Q.sameSel(Q.customSelOf(d), after),
      pk: v.packages.filter(function (x) { return x.id === v.chosen; })[0] || {}, pk0: d.packages.filter(function (x) { return x.id === d.chosen; })[0] || {},
      ups: after.ups.map(function (i) { return d.lines[i].name; }), ups0: Q.customSelOf(d).ups.map(function (i) { return d.lines[i].name; }) };
  }
  function selBox(p) {
    var i = selInfo(p); if (!i) return "";
    var when = p.client_selection_at ? new Date(p.client_selection_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "", who = p.client_selection.email ? " by " + esc(p.client_selection.email) : "";
    return '<section class="cr-card qb-selbox"><div class="sh"><h2>The client sent a selection</h2><span class="pill quote">To review</span></div>' +
      '<p class="hint">Sent' + (when ? " on " + esc(when) : "") + who + ". Nothing changes in the quote until you apply it.</p>" +
      '<ul class="qb-sel"><li><span>' + esc(i.d.word || "Package") + '</span><strong>' + esc(i.pk.name || "") + "</strong>" + (i.pk.id !== i.pk0.id ? "<small>was " + esc(i.pk0.name || "") + "</small>" : "<small>unchanged</small>") + "</li>" +
      "<li><span>Video upgrades</span><strong>" + (i.ups.length ? esc(i.ups.join(", ")) : "none") + "</strong><small>" + (JSON.stringify(i.ups) === JSON.stringify(i.ups0) ? "unchanged" : "was " + (i.ups0.length ? esc(i.ups0.join(", ")) : "none")) + "</small></li>" +
      "<li><span>Total</span><strong>" + eur(i.q.total) + "</strong><small>" + (i.q.total === i.before.total ? "unchanged" : "was " + eur(i.before.total)) + "</small></li></ul>" +
      '<div class="acts"><button class="btn" type="button" data-selact="apply" data-id="' + p.id + '">Apply to the quote</button><button class="btn ghost" type="button" data-selact="dismiss" data-id="' + p.id + '">Dismiss</button></div></section>';
  }
  function applySel(p, dismiss) {
    var i = selInfo(p); if (!i) return;
    var contracts = S.contracts.filter(function (c) { return c.project_id === p.id && (c.status === "sent" || c.status === "signed"); });
    if (!dismiss && contracts.length && !confirm("A contract was already " + (contracts.some(function (c) { return c.status === "signed"; }) ? "signed" : "sent") + " for this project. It keeps its own amount (" + C.money(contracts[0].amount) + "); only the quote changes. Apply anyway?")) return;
    if (dismiss && !confirm("Dismiss the client’s selection without applying it?")) return;
    var row = { id: p.id, client_selection: null, client_selection_at: null };
    if (!dismiss) {
      var d = i.v; delete d.names; delete d.date; delete d.place; delete d.venue; delete d.planner;
      row.quote_custom = d; row.total = i.q.total; row.travel_fees = i.q.travel; row.quote_lines = i.q.rows; row.collection = i.pk.name || null; row.quote_verified = true;
    }
    api.saveProject(row).then(function () {
      return A.reload().then(function () { toast(dismiss ? "Selection dismissed" : "Selection applied: the client’s link shows it and they can now sign"); A.render(); });
    }).catch(fail);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-selact]"); if (!b) return;
    var p = byId(S.projects, b.getAttribute("data-id")); if (p) applySel(p, b.getAttribute("data-selact") === "dismiss");
  });
  A.selBox = selBox;

  function save() {
    var names = String(W.names).trim();
    if (names.length < 2) { toast("Fill in “Prepared for” (the name shown at the top)", true); return; }
    var d = toDef(), q = Q.customQuote(d), pk = d.packages.filter(function (x) { return x.id === d.chosen; })[0];
    if (!(q.total > 0)) { toast("Enter a price for the package of this client", true); return; }
    if (W.email && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(W.email.trim())) { toast("The client’s email does not look right", true); return; }
    var p = W.id ? byId(S.projects, W.id) : null;
    var contracts = p ? S.contracts.filter(function (c) { return c.project_id === p.id && (c.status === "sent" || c.status === "signed"); }) : [];
    if (contracts.length && !confirm("A contract was already " + (contracts.some(function (c) { return c.status === "signed"; }) ? "signed" : "sent") + " for this project. It keeps its own amount (" + C.money(contracts[0].amount) + "); only the quote changes. Save anyway?")) return;
    var row = { couple_names: names, couple_email: String(W.email).trim() || null, wedding_date: W.date || null, venue: String(W.venue).trim() || null, location: String(W.place).trim() || null,
      collection: pk ? pk.name : null, total: q.total, travel_fees: q.travel, quote_lines: q.rows, quote_custom: d, quote_verified: true };
    var day = /^\d{4}-\d{2}-\d{2}$/.test(W.issued) ? W.issued : iso(new Date());
    if (!p || day !== issuedOf(p)) row.quote_issued_at = day + "T12:00:00Z";
    if (p) row.id = p.id;
    var ref = (p && p.quote_ref) || nonce();
    if (!p || !p.quote_ref) { row.quote_ref = ref; row.proposal_url = new URL(Q.customLink(ref, names), location.href).href; }
    if (!p) { row.status = "quote"; row.quote_sent_at = new Date().toISOString(); }
    var btn = $("#qbSave"); btn.disabled = true;
    api.saveProject(row).then(function (saved) {
      return A.reload().then(function () {
        toast(p ? "Quote saved: the client’s link is up to date" : "Quote saved: the client’s link is ready");
        var h = "#/tools/quote/" + saved.id;
        if (location.hash === h) A.render(); else location.hash = h;
      });
    }).catch(function (e) {
      btn.disabled = false;
      if (/column|schema cache/i.test(e && e.message || "")) toast("Run the updated docs/crm/schema.sql in Supabase first (new column for custom quotes)", true); else fail(e);
    });
  }
})();
