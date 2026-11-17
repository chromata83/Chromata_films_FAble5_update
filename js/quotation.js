/* ============================================================
   CHROMATA FILMS — Quotation configurator (the couple's side)
   One decision per screen. Every choice updates the running total.
   Needs js/quote-core.js (prices, link encoding, menu, lightbox).
   ============================================================ */
(function () {
  "use strict";
  var Q = window.CQ, esc = Q.esc, eur = Q.eur;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- the journey ---------- */
  /* Each step has its own palette (design-system colours) and its own collage cutout.
     Cutouts straddle the edge of the photo; l/t/b = desktop position, h = height, rot = tilt,
     ml/mt/mrot = the same on small screens (where they sit in the picture band). */
  var cut = function (file, o) { o.src = "assets/img/quote/" + file + ".webp"; return o; };
  var TONES = { night: "#16130F", sky: "#BFD8F6", lemon: "#F6D54E", citrus: "#F78C29", porcelain: "#F8F4EE" };
  var STEPS = [
    { type: "intro", img: Q.STEP_IMG.intro, theme: "night", cut: cut("q-intro", { l: "43.5%", b: "-5vh", h: "54vh", rot: "-5deg", ml: "20vw", mt: "1vh", mrot: "-4deg" }),
      title: "Thank you for <em>considering</em> us",
      lead: "Over the next few steps, you choose your collection, your options and every wish for your celebration. Your total updates automatically as you go.",
      tagline: "Your wedding will happen once. We make sure you feel it forever." },
    { type: "single", key: "welcome", chapter: "Your welcome event", img: Q.STEP_IMG.welcome, theme: "sky",
      cut: cut("q-flute", { l: "44.5%", t: "10vh", h: "52vh", rot: "8deg", ml: "24vw", mt: "3vh", mrot: "6deg" }),
      q: "How long should we stay for your welcome event?", opts: Q.EVENT_HOURS },
    { type: "single", key: "wedding", chapter: "Your wedding day", img: Q.STEP_IMG.wedding, theme: "night",
      cut: cut("q-swan", { l: "45%", b: "-3vh", h: "36vh", rot: "-7deg", ml: "20vw", mt: "5vh", mrot: "-5deg" }),
      q: "Which collection will tell your wedding day?", note: "Starting prices. Travel and accommodation are always confirmed in your personal quote.", opts: Q.COLLECTIONS },
    { type: "multi", key: "team", chapter: "Your wedding day", img: Q.STEP_IMG.team, theme: "lemon",
      cut: cut("q-shades", { l: "45%", t: "9vh", h: "34vh", rot: "-9deg", ml: "22vw", mt: "5vh", mrot: "-8deg" }),
      q: "Would you like extra hands around you?", note: "Select as many as you like, or none at all.", opts: Q.TEAM },
    { type: "single", key: "brunch", chapter: "Your brunch or farewell party", img: Q.STEP_IMG.brunch, theme: "citrus",
      cut: cut("q-coupe", { l: "45%", b: "-6vh", h: "58vh", rot: "-6deg", ml: "26vw", mt: "2vh", mrot: "5deg" }),
      q: "And for the brunch or farewell party?", opts: Q.EVENT_HOURS },
    { type: "multi", key: "options", chapter: "Your options", img: Q.STEP_IMG.options, theme: "porcelain",
      cut: cut("q-collage", { l: "44.5%", t: "-5vh", h: "50vh", rot: "4deg", ml: "20vw", mt: "1vh", mrot: "3deg" }),
      q: "Would you like to add anything?", note: "Select as many as you like, or none at all.", opts: Q.OPTIONS },
    { type: "single", key: "creator", chapter: "Your content creator", img: Q.STEP_IMG.creator, theme: "sky",
      cut: cut("q-camera", { l: "45%", b: "-5vh", h: "52vh", rot: "-4deg", ml: "20vw", mt: "1vh", mrot: "-3deg" }),
      q: "Would you like a content creator at your side?", opts: Q.CREATOR },
    { type: "single", key: "privacy", chapter: "About privacy", img: Q.STEP_IMG.privacy, theme: "night",
      cut: cut("q-bust", { l: "45%", t: "18vh", h: "44vh", rot: "6deg", ml: "22vw", mt: "2vh", mrot: "5deg" }),
      q: "How private should your films stay?", opts: Q.PRIVACY },
    { type: "details", chapter: "Almost there", img: Q.STEP_IMG.details, theme: "lemon", q: "Who is this experience for?",
      cut: cut("q-lobster", { l: "45%", b: "-4vh", h: "58vh", rot: "8deg", ml: "26vw", mt: "2vh", mrot: "6deg" }) },
    { type: "summary", img: Q.STEP_IMG.summary, theme: "night",
      cut: cut("q-peacock", { l: "46%", b: "-6vh", h: "44vh", rot: "-4deg", ml: "24vw", mt: "3vh", mrot: "-4deg" }) }
  ];
  var QUESTION_STEPS = STEPS.filter(function (s) { return s.type === "single" || s.type === "multi" || s.type === "details"; }).length;
  var STEP_OF = { welcome: 1, wedding: 2, team: 3, brunch: 4, options: 5, creator: 6, privacy: 7, travel: 8 };

  /* ---------- state (kept for the tab session so a refresh doesn't lose it) ---------- */
  var KEY = "cq-draft-v1";
  var A = Q.blank(), cur = 0, maxStep = 0, sent = false;
  try {
    var d = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (d && d.A) {
      A = Object.assign(Q.blank(), d.A);
      if (!Array.isArray(A.team)) A.team = [];
      if (!A.options || typeof A.options !== "object") A.options = {};
      cur = Math.max(0, Math.min(d.cur | 0, STEPS.length - 1));
      maxStep = Math.max(cur, d.maxStep | 0);
      sent = !!d.sent;
      if (A.nonce && A.nonce.length < 10) A.nonce = "";
      if (A.role !== "planner") A.role = "couple";
    }
  } catch (e) {}
  var save = function () { try { sessionStorage.setItem(KEY, JSON.stringify({ A: A, cur: cur, maxStep: maxStep, sent: sent })); } catch (e) {} };

  var mid = $("#qxMid"), cont = $("#qxCont"), back = $("#qxBack");

  /* ---------- small helpers ---------- */
  var ident = function (o) { return o.label || o.name; };
  var validEmail = function (s) { return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(String(s).trim()); };
  var dateOK = function () { return Q.ISO.test(A.date || "") && A.date >= Q.todayISO(); };
  var detailsOK = function () {
    return A.names.trim().length >= 2 && validEmail(A.email) && dateOK() &&
           A.place.trim().length >= 2 && A.venue.trim().length >= 2 &&
           (A.role !== "planner" || A.planner.trim().length >= 2);
  };

  function priceLabel(step, o) {
    if (o.skip) return '<span class="cprice incl">Skip</span>';
    if (!o.price) return '<span class="cprice incl">Included</span>';
    if (o.from) return '<span class="cprice"><small>from</small>' + eur(o.price) + "</span>";
    if (o.plus || step.key === "privacy") return '<span class="cprice">+' + eur(o.price) + "</span>";
    if (o.unit) {
      var q = A.options[o.v] | 0;
      return q > 1
        ? '<span class="cprice">' + eur(o.price * q) + "<small>" + eur(o.price) + " / " + o.unit + "</small></span>"
        : '<span class="cprice">' + eur(o.price) + "<small>per " + o.unit + "</small></span>";
    }
    return '<span class="cprice">' + eur(o.price) + "</span>";
  }

  function isSel(step, o) {
    if (step.type === "single") return A[step.key] === o.v;
    if (step.key === "team") return A.team.indexOf(o.v) > -1;
    return !!A.options[o.v];
  }

  function choicesHTML(step) {
    var multi = step.type === "multi";
    var h = '<div class="choices" role="' + (multi ? "group" : "radiogroup") + '" aria-label="' + esc(step.q) + '">';
    step.opts.forEach(function (o, i) {
      var sel = isSel(step, o);
      var qty = "";
      if (multi && o.unit && sel) {
        var n = A.options[o.v] | 0;
        qty = '<span class="qty" data-qty="' + o.v + '"><button type="button" data-dir="-1" aria-label="Fewer ' + o.unit + 's"' + (n <= 1 ? " disabled" : "") + '>−</button>' +
              "<span>" + n + " " + o.unit + (n > 1 ? "s" : "") + '</span><button type="button" data-dir="1" aria-label="More ' + o.unit + 's"' + (n >= (o.max || 1) ? " disabled" : "") + ">+</button></span>";
      }
      h += '<div class="choice' + (multi ? " multi" : "") + (sel ? " sel" : "") + '" role="' + (multi ? "checkbox" : "radio") + '" aria-checked="' + sel + '" tabindex="0" data-v="' + o.v + '">' +
        '<span class="mark">' + (multi ? (sel ? "✓" : "") : String.fromCharCode(65 + i)) + "</span>" +
        '<span class="ctext">' + esc(ident(o)) + (o.sub ? "<small>" + esc(o.sub) + "</small>" : "") + qty + "</span>" +
        priceLabel(step, o) + "</div>";
    });
    return h + "</div>";
  }

  function cutHTML(c) {
    if (!c) return "";
    var st = ["l", "t", "b", "h", "rot", "ml", "mt", "mrot"].filter(function (k) { return c[k] != null; }).map(function (k) { return "--" + k + ":" + c[k]; });
    return '<img class="qx-cut" alt="" aria-hidden="true" draggable="false" src="' + c.src + '" style="' + st.join(";") + '">';
  }


  /* ---------- render ---------- */
  function render(animate) {
    var step = STEPS[cur];
    maxStep = Math.max(maxStep, cur);
    document.body.classList.toggle("is-intro", step.type === "intro");
    var theme = step.theme || "night";
    $("#qxStage").setAttribute("data-theme", theme);
    document.body.setAttribute("data-tone", theme === "night" ? "dark" : "light");
    document.body.style.setProperty("--menu-bg", TONES[theme]);
    $("#qxCut").innerHTML = cutHTML(step.cut);

    $("#qxRight").innerHTML = '<img class="hero" alt="" src="' + step.img + '">';
    var qi = STEPS.slice(0, cur + 1).filter(function (s) { return s.type === "single" || s.type === "multi" || s.type === "details"; }).length;
    var isQ = step.type === "single" || step.type === "multi" || step.type === "details";
    $("#qxNumerals").textContent = isQ ? String(qi).padStart(2, "0") + " / " + String(QUESTION_STEPS).padStart(2, "0") : "";
    $("#qxProgFill").style.width = Math.round((cur / (STEPS.length - 1)) * 100) + "%";
    back.style.visibility = cur === 0 ? "hidden" : "visible";
    $("#qxTotalWrap").style.visibility = step.type === "intro" ? "hidden" : "visible";
    $("#qxBottom").style.display = step.type === "intro" ? "none" : "";
    cont.style.display = "";
    var centered = false, html = "";

    if (step.type === "intro") {
      centered = true;
      html = '<div class="question">' + step.title + '</div><p class="lead">' + esc(step.lead) + '</p><div class="tagline">' + esc(step.tagline) + '</div>' +
             '<button class="cont intro-begin" id="qxBegin" type="button">Begin</button>';
    } else if (step.type === "single" || step.type === "multi") {
      html = '<div class="kicker">' + esc(step.chapter) + '</div><div class="question">' + esc(step.q) + "</div>";
      if (step.note) html += '<div class="subnote">' + esc(step.note) + "</div>";
      html += choicesHTML(step);
      cont.textContent = "Continue";
      cont.disabled = step.type === "single" && A[step.key] == null;
    } else if (step.type === "details") {
      var f = function (id, label, type, ph, val, extra) {
        return '<div class="fld"><label for="qx_' + id + '">' + label + ' <span class="req" aria-hidden="true">*</span></label><input id="qx_' + id + '" type="' + type + '" placeholder="' + ph + '" value="' + esc(val) + '" required aria-required="true" ' + (extra || "") + ">" +
               (id === "email" ? '<div class="hint">Please enter a valid email so we can reach you.</div>' : "") + "</div>";
      };
      var pl = A.role === "planner";
      html = '<div class="kicker">' + esc(step.chapter) + '</div><div class="question">' + esc(step.q) + '</div><div class="fields">' +
        '<div class="roles" role="radiogroup" aria-label="You are">' +
          '<button type="button" role="radio" aria-checked="' + !pl + '" class="' + (pl ? "" : "on") + '" data-role="couple">We are the couple</button>' +
          '<button type="button" role="radio" aria-checked="' + pl + '" class="' + (pl ? "on" : "") + '" data-role="planner">I am a wedding planner</button></div>' +
        (pl ? f("planner", "Your name and company", "text", "Anna, Perfect Events", A.planner, 'autocomplete="organization" maxlength="100"') : "") +
        f("names", pl ? "Couple&#39;s names" : "Names", "text", "Emma &amp; James", A.names, 'autocomplete="' + (pl ? "off" : "name") + '" maxlength="80"') +
        f("email", pl ? "Your email" : "Email", "email", "you@email.com", A.email, 'autocomplete="email" maxlength="120"') +
        f("date", "Wedding date", "date", "", A.date, 'min="' + Q.todayISO() + '"') +
        f("place", "Location", "text", "Cap d&#39;Antibes, France", A.place, 'autocomplete="off" maxlength="100"') +
        f("venue", "Venue", "text", "Villa Ephrussi de Rothschild", A.venue, 'autocomplete="off" maxlength="100"') +
        '<p class="fhint">All fields are required so we can prepare your proposal.</p></div>';
      cont.textContent = "See my experience";
      cont.disabled = !detailsOK();
    } else if (step.type === "summary") {
      centered = true;
      html = summaryHTML();
      cont.style.display = "none";
    }

    mid.className = (centered ? "center " : "") + (step.type === "summary" ? "sum " : "") + (animate === false ? "" : "qfade");
    mid.innerHTML = html;
    mid.scrollTop = 0;
    if (window.innerWidth <= 860 && animate !== false) {
      var st = $("#qxStage"); window.scrollTo({ top: st.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
    }
    $("#qxFilms").hidden = step.type !== "summary";
    cmpWrap.hidden = aboutWrap.hidden = step.type !== "summary";
    if (step.type === "summary") paintCompare();
    bind(step);
    chrome();
    save();
  }

  function summaryHTML() {
    var L = Q.lines(A), tot = Q.total(A);
    var rows = L.map(function (l) { return '<div class="srow"><span class="sl">' + esc(l.label) + '</span><span class="sr">' + (l.tbc ? "TBC" : eur(l.price)) + "</span></div>"; }).join("");
    rows += '<div class="srow grand"><span class="sl">Total investment</span><span class="sr">' + eur(tot) + "</span></div>";
    var actions;
    if (sent) {
      actions = '<div class="sentmsg"><span class="big">Thank you, ' + esc(firstNames()) + '.</span>Your selection is on its way to our team. We answer every message personally, usually within 48 hours.</div>' +
        '<div class="sumactions"><button class="btn-main" id="qxProposal" type="button">See my proposal</button><button class="back" id="qxRestart" type="button">Start over</button></div>';
    } else {
      actions = '<div class="sumactions" id="qxActions"><button class="btn-main" id="qxSend" type="button">Send to Chromata’s team</button>' +
        '<button class="btn-ghost" id="qxProposal" type="button">See my proposal</button><button class="back" id="qxRestart" type="button">Start over</button></div>';
    }
    return '<div class="kicker">Your bespoke quote</div><div class="question">' + esc(A.names || "Your experience") + '</div>' +
      '<div class="sumcard">' + rows + "</div>" +
      '<p class="snote">' + esc(Q.travelNote(A)) + " " + esc(Q.validityNote()) + '</p>' +
      '<p class="qx-cmp-link"><a class="sumlink" href="#qxCompare" id="qxToCompare">Compare the collections and change yours ↓</a></p>' +
      actions + '<div id="qxMsg" role="status"></div>' +
      '<a class="sumlink" href="#qxFilms" id="qxToFilms">Our latest work ↓</a>';
  }
  var firstNames = function () { return A.names.split(/[,&]| and /i)[0].trim().split(/\s+/)[0] || "both of you"; };

  /* ---------- bindings ---------- */
  function toggleChoice(step, el) {
    var v = el.getAttribute("data-v");
    if (step.type === "single") {
      A[step.key] = v;
    } else if (step.key === "team") {
      var i = A.team.indexOf(v); if (i > -1) A.team.splice(i, 1); else A.team.push(v);
    } else {
      if (A.options[v]) delete A.options[v]; else A.options[v] = 1;
    }
    refresh(step);
  }
  function refresh(step) {
    var c = $(".choices", mid), top = mid.scrollTop;
    c.outerHTML = choicesHTML(step);
    mid.scrollTop = top;
    bindChoices(step);
    if (step.type === "single") cont.disabled = false;
    chrome(); save();
  }
  function bindChoices(step) {
    $$(".choice", mid).forEach(function (el) {
      el.addEventListener("click", function () { toggleChoice(step, el); });
      el.addEventListener("keydown", function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); e.stopPropagation(); toggleChoice(step, el); } });
    });
    $$(".qty button", mid).forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = b.parentNode.getAttribute("data-qty"), o = Q.by(Q.OPTIONS, id);
        A.options[id] = Math.max(1, Math.min(o.max || 1, (A.options[id] | 0) + (+b.getAttribute("data-dir"))));
        refresh(step);
      });
    });
  }
  function bind(step) {
    if (step.type === "single" || step.type === "multi") bindChoices(step);
    if (step.type === "details") {
      $$(".roles button", mid).forEach(function (b) {
        b.addEventListener("click", function () { A.role = b.getAttribute("data-role") === "planner" ? "planner" : "couple"; save(); render(false); });
      });
      [["names", "names"], ["email", "email"], ["date", "date"], ["place", "place"], ["venue", "venue"], ["planner", "planner"]].forEach(function (p) {
        var el = $("#qx_" + p[0]);
        if (!el) return;
        el.addEventListener("input", function () {
          A[p[1]] = el.value; cont.disabled = !detailsOK(); save();
          if (p[0] === "email") el.removeAttribute("aria-invalid");
        });
        if (p[0] === "email") el.addEventListener("blur", function () { if (el.value && !validEmail(el.value)) el.setAttribute("aria-invalid", "true"); });
      });
    }
    if (step.type === "details") {
      var dEl = $("#qx_date");   /* the calendar opens on any click, and also reacts to "change" */
      dEl.addEventListener("change", function () { A.date = dEl.value; cont.disabled = !detailsOK(); save(); });
      dEl.addEventListener("click", function () { try { if (dEl.showPicker) dEl.showPicker(); } catch (e) {} });
    }
    if (step.type === "intro") $("#qxBegin").addEventListener("click", next);
    if (step.type === "summary") {
      $("#qxProposal").addEventListener("click", openProposal);
      $("#qxRestart").addEventListener("click", restart);
      var s = $("#qxSend"); if (s) s.addEventListener("click", send);
      $("#qxToFilms").addEventListener("click", function (e) { e.preventDefault(); $("#qxFilms").scrollIntoView({ behavior: "smooth" }); });
      $("#qxToCompare").addEventListener("click", function (e) { e.preventDefault(); cmpWrap.scrollIntoView({ behavior: "smooth" }); });
    }
  }

  function next() { if (cur < STEPS.length - 1) { cur++; render(); } }
  function prev() { if (cur > 0) { cur--; render(); } }
  function restart() {
    A = Q.blank(); cur = 0; maxStep = 0; sent = false;
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    window.scrollTo(0, 0); render();
  }
  cont.addEventListener("click", next);
  back.addEventListener("click", prev);
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" || e.defaultPrevented) return;
    var t = e.target;
    if (t && (t.closest && t.closest(".choice, button, a, .qx-lb, .qx-drawer"))) return;
    if (cont.style.display !== "none" && !cont.disabled && STEPS[cur].type !== "intro") cont.click();
  });

  /* ---------- running total + selections drawer ---------- */
  function chrome() {
    var t = Q.total(A);
    $("#qxTotalAmt").textContent = Math.round(t).toLocaleString("en-US");
    $("#qxTogCount").textContent = eur(t);
    $("#qxLedTotal").textContent = eur(t);
    $("#qxLedProposal").disabled = !A.wedding;
    ledger();
  }

  function ledger() {
    var rows = [], by = Q.by, sum = function (arr) { return arr.reduce(function (s, x) { return s + x.price; }, 0); };
    var L = Q.lines(A), of = function (k) { return L.filter(function (l) { return l.key === k; }); };
    function add(key, label, val, price) {
      if (STEP_OF[key] > maxStep) return;
      rows.push('<button class="led-row" type="button" data-goto="' + STEP_OF[key] + '"><span><span class="lr-step">' + label + '</span><br><span class="lr-val">' + esc(val) + '</span><br><span class="lr-edit">Tap to change</span></span><span class="lr-p">' + price + "</span></button>");
    }
    var hrs = function (v) { var x = by(Q.EVENT_HOURS, v); return x ? (x.skip ? "Not now" : x.short) : null; };
    if (A.welcome != null) add("welcome", "Welcome event", hrs(A.welcome), A.welcome === "0" ? "—" : eur(sum(of("welcome"))));
    var c = by(Q.COLLECTIONS, A.wedding);
    if (c) add("wedding", "Wedding day", c.name, "from " + eur(c.price));
    if (c && maxStep > STEP_OF.team) add("team", "Extra team", A.team.length ? A.team.map(function (v) { return by(Q.TEAM, v).name; }).join(", ") : "None", A.team.length ? eur(sum(of("team"))) : "—");
    if (A.brunch != null) add("brunch", "Brunch / farewell", hrs(A.brunch), A.brunch === "0" ? "—" : eur(sum(of("brunch"))));
    if (maxStep > STEP_OF.options) { var n = Object.keys(A.options).length; add("options", "Options", n ? n + " selected" : "None", n ? eur(sum(of("option"))) : "—"); }
    if (A.creator != null) add("creator", "Content creator", A.creator === "1" ? "At your side" : "Not now", A.creator === "1" ? eur(Q.CREATOR[1].price) : "—");
    if (maxStep > STEP_OF.privacy) { var p = by(Q.PRIVACY, A.privacy); add("privacy", "Privacy", p.label, p.price ? "+" + eur(p.price) : "Included"); }
    add("travel", "Travel & accommodation", Q.TRAVEL_TBC, "TBC");
    $("#qxLedList").innerHTML = rows.join("") || '<div class="led-empty">Your choices appear here as you go. You can return to any of them at any time.</div>';
    $$(".led-row", $("#qxLedList")).forEach(function (r) {
      r.addEventListener("click", function () { cur = +r.getAttribute("data-goto"); closeLedger(); render(); });
    });
  }
  function openLedger() { $("#qxLedger").classList.add("open"); $("#qxLedgerOverlay").classList.add("open"); }
  function closeLedger() { $("#qxLedger").classList.remove("open"); $("#qxLedgerOverlay").classList.remove("open"); }
  $("#qxLedgerToggle").addEventListener("click", openLedger);
  $("#qxLedClose").addEventListener("click", closeLedger);
  $("#qxLedgerOverlay").addEventListener("click", closeLedger);
  $("#qxLedProposal").addEventListener("click", function () { closeLedger(); openProposal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLedger(); });

  /* ---------- "See my proposal": the couple's own page, in a new tab ---------- */
  function openProposal() {
    var url = Q.proposalUrl(A);
    save();
    var w = window.open(url, "_blank");
    if (w) { try { w.opener = null; } catch (e) {} return; }
    var m = $("#qxMsg");
    if (m) m.innerHTML = '<p class="sentmsg">Your browser blocked the new tab. <a href="' + esc(url) + '" target="_blank" rel="noopener">Open your proposal here</a>.</p>';
  }

  /* ---------- "Send to Chromata's team": emailed, nothing opens ---------- */
  function send() {
    var btn = $("#qxSend"), msg = $("#qxMsg"), url = Q.proposalUrl(A), tot = Q.total(A);
    btn.disabled = true; var label = btn.textContent; btn.textContent = "Sending…"; msg.innerHTML = "";
    var fd = new FormData();
    fd.append("_subject", "Quotation request · " + A.names + " · " + eur(tot));
    fd.append("_template", "table"); fd.append("_captcha", "false");
    fd.append("name", A.names); fd.append("email", A.email);
    if (A.role === "planner") fd.append("Sent by wedding planner", A.planner);
    fd.append("Wedding date", Q.fmtDate(A.date) || "Not given"); fd.append("Location", A.place || "Not given"); fd.append("Venue", A.venue || "Not given");
    fd.append("Total investment", eur(tot));
    fd.append("Selections", Q.recapText(A));
    fd.append("Proposal page", url);
    var cal = Q.calendarLink(A, url);
    if (cal) fd.append("Add the date to Google Calendar", cal);
    /* Also drop the quote into the studio's back office (calendar option, contact card, project). Never blocks the email. */
    if (window.CQLink && window.CQLink.enabled) window.CQLink.submit(A, url).catch(function () {});
    fetch("https://formsubmit.co/ajax/" + Q.EMAIL, { method: "POST", headers: { Accept: "application/json" }, body: fd })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (x) {
        if (!(x.ok && x.d && (x.d.success === true || x.d.success === "true"))) throw new Error("send failed");
        sent = true; save(); render(false);
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = label;
        var body = "Hello Chromata Films,\n\nHere is my selection:\n\n" + Q.recapText(A) + "\n\nNames: " + A.names + (A.role === "planner" ? "\nWedding planner: " + A.planner : "") + "\nWedding date: " + Q.fmtDate(A.date) + "\nLocation: " + A.place + "\nVenue: " + A.venue + "\n\nMy proposal: " + url;
        msg.innerHTML = '<p class="sentmsg err"><span class="big">That didn’t go through</span>Something went wrong sending your selection. <a href="mailto:' + Q.EMAIL + "?subject=" + encodeURIComponent("Quotation request · " + A.names) + "&body=" + encodeURIComponent(body) + '">Send it from your own email</a> and we’ll take it from there.</p>';
      });
  }

  /* ---------- under the last screen: the three collections (click one to change yours, the total follows), then About ---------- */
  var cmpWrap = document.createElement("div"), aboutWrap = document.createElement("div");
  cmpWrap.hidden = aboutWrap.hidden = true;
  aboutWrap.innerHTML = Q.aboutSection();
  $("#qxFilms").parentNode.insertBefore(cmpWrap, $("#qxFilms"));
  $("#qxFilms").parentNode.insertBefore(aboutWrap, $("#qxFilms"));
  function paintCompare() {
    cmpWrap.innerHTML = Q.compareSection(A, { pick: true, id: "qxCompare" });
    $$(".px-col.is-pick", cmpWrap).forEach(function (el) {
      var choose = function () {
        var v = el.getAttribute("data-v"); if (A.wedding === v) return;
        A.wedding = v; sent = false; save();   // a change after sending means sending again
        var y = window.scrollY; render(false); window.scrollTo(0, y);
      };
      el.addEventListener("click", choose);
      el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(); } });
    });
  }

  /* ---------- our latest work: four frames, then the films one by one ---------- */
  $("#qxRow").innerHTML = '<div class="qx-films__rowwrap">' + Q.rowHTML() + "</div>";
  $("#qxStack").innerHTML = Q.stackHTML();
  Q.lazyFrames();

  Q.initMenu();
  render(false);
})();
