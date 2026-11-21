/* ============================================================
   CHROMATA FILMS — "Save as PDF" of the couple's proposal page
   The PDF is the page itself, exactly as it looks in the window it is read in: same width, same layout, photographs,
   collage illustrations, colours, fonts and prices, on ONE long page (no cuts through the middle of a photo), without the
   videos. The buttons stay real links (reply by email, WhatsApp, "Open it online", sign online once the studio validated
   the quote), and each film becomes a link to watch it.

   How: the page is tidied up here, given a sheet size equal to the width of the window and to its own height (no margin,
   so no white edge), and printed; it is then reloaded as it was. Media queries are decided once with the window, and
   every "vh" length is converted to the pixels it has in that window (browsers print vh against the sheet height).
   Works best in Chrome or Edge: choose "Save as PDF" as the destination and leave margins on "None" if asked.
   ============================================================ */
(function (w) {
  "use strict";
  var Q = w.CQ;
  /* The PDF has the width and the height of the window the page is read in (set by size() before every PDF) */
  var W = 1440, VH = 900, K = VH / 100;
  var MAX_H = 19000;   // a printed page cannot be taller than about 200 inches (19200px): a very long page continues on a second sheet of the same width
  function size() {
    var root = w.document.documentElement;
    W = Math.max(360, Math.min(2560, Math.round(root.clientWidth || w.innerWidth || 1440)));
    VH = Math.max(500, Math.round(w.innerHeight || 900));
    K = VH / 100;
  }
  var VH_RE = /(-?\d*\.?\d+)\s*(?:s|d|l)?vh\b/g;
  var toPx = function (v) { return String(v).replace(VH_RE, function (m, n) { return (Math.round(+n * K * 100) / 100) + "px"; }); };

  /* the same rules as the style sheets, but with every vh length written in pixels */
  function vhRules(rules, out) {
    Array.prototype.forEach.call(rules, function (r) {
      if (r.type === 1 && r.style) {
        var d = [];
        for (var i = 0; i < r.style.length; i++) {
          var p = r.style[i], v = r.style.getPropertyValue(p);
          if (/\d\s*(?:s|d|l)?vh\b/.test(v)) d.push(p + ":" + toPx(v) + " !important");
        }
        if (d.length) out.push(r.selectorText + "{" + d.join(";") + "}");
      } else if (r.type === 4 && r.cssRules) {
        var inner = []; vhRules(r.cssRules, inner);
        if (inner.length) out.push("@media " + r.conditionText + "{" + inner.join("") + "}");
      }
    });
  }
  function eachSheet(doc, fn) {
    Array.prototype.forEach.call(doc.styleSheets, function (s) { var rules; try { rules = s.cssRules; } catch (e) { return; } if (rules) fn(s, rules); });
  }
  function filmUrl(f) { return f.yt ? "https://www.youtube.com/watch?v=" + f.yt : "https://vimeo.com/" + f.vm; }

  /* Waits until the page is fully drawn: prices fetched, fonts and every photograph loaded. */
  function waitReady(win) {
    return new Promise(function (resolve) {
      var doc = win.document, t0 = Date.now();
      (function poll() {
        var app = doc.getElementById("app"), ok = !!(app && doc.getElementById("pxSum") && !app.classList.contains("px-wait"));
        if (ok) {
          Array.prototype.forEach.call(doc.images, function (im) { im.loading = "eager"; });
          ok = Array.prototype.every.call(doc.images, function (im) { return im.complete; }) && (!doc.fonts || doc.fonts.status === "loaded");
        }
        if (ok || Date.now() - t0 > 15000) return resolve();
        setTimeout(poll, 200);
      })();
    });
  }

  /* Turns a loaded proposal page (in a 1440 x 900 window) into its PDF form and sets the page size. Returns the height. */
  function prepare(doc, onlineUrl) {
    var root = doc.documentElement;
    ["#qxMenu", "#qxDrawer", "#qxLb", "#pxPrint", ".px-gate"].forEach(function (s) { var e = doc.querySelector(s); if (e) e.remove(); });
    root.classList.remove("px-gated-wait");
    Array.prototype.forEach.call(doc.querySelectorAll(".px-ups, .px-send"), function (e) { e.remove(); });   // the selectable upgrades and the send button are for the screen; the chosen ones are in the summary

    /* the videos: no players, a clickable list of the films instead */
    var films = doc.querySelector(".px-films");
    if (films) {
      /* the list of films is read from the players themselves (a custom quote has its own videos) */
      var list = Array.prototype.slice.call(films.querySelectorAll(".film-layer")).map(function (l) {
        var fr = l.querySelector("iframe"), src = fr ? (fr.getAttribute("data-src") || fr.getAttribute("src") || "") : "", m, h3 = l.querySelector("h3"), pp = l.querySelector("header p");
        var url = (m = /embed\/([\w-]{11})/.exec(src)) ? "https://www.youtube.com/watch?v=" + m[1] : (m = /video\/(\d+)(?:\?.*?\bh=([a-f0-9]+))?/.exec(src)) ? "https://vimeo.com/" + m[1] + (m[2] ? "/" + m[2] : "") : "";
        return { url: url, t: h3 ? h3.textContent : "", p: pp ? pp.textContent : "" };
      });
      var stack = films.querySelector(".film-stack"); if (stack) stack.remove();
      films.insertAdjacentHTML("beforeend", '<ul class="px-flist">' + list.map(function (f, i) {
        return '<li><a href="' + Q.esc(f.url) + '" target="_blank" rel="noopener"><span class="n">' + String(i + 1).padStart(2, "0") + '</span><span class="t">' + Q.esc(f.t) + "<small>" + Q.esc(f.p) + '</small></span><span class="w">Watch the film &#8599;</span></a></li>';
      }).join("") + "</ul>");
    }

    /* the photo mosaic uses CSS columns, which a printer cuts across pages; freeze the 4 columns as they are on screen */
    var mos = doc.querySelector(".px-masonry");
    if (mos) {
      var cols = {}, tiles = Array.prototype.slice.call(mos.children).map(function (t) { var r = t.getBoundingClientRect(); return { t: t, x: Math.round(r.left), y: r.top }; });
      tiles.forEach(function (o) { (cols[o.x] = cols[o.x] || []).push(o); });
      mos.innerHTML = "";
      Object.keys(cols).map(Number).sort(function (a, b) { return a - b; }).forEach(function (x) {
        var c = doc.createElement("div"); c.className = "px-mcol";
        cols[x].sort(function (a, b) { return a.y - b.y; }).forEach(function (o) { c.appendChild(o.t); });
        mos.appendChild(c);
      });
    }

    /* the buttons at the bottom stay real links */
    var sign = doc.getElementById("pxSign"), cta = doc.querySelector(".px-close .px-hero__cta");
    if (sign) {
      if (!sign.hidden) { var a = doc.createElement("a"); a.className = "btn-main"; a.href = onlineUrl; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Accept and sign online"; sign.replaceWith(a); }
      else sign.remove();
    }
    if (cta) cta.insertAdjacentHTML("beforeend", '<a class="btn-ghost" href="' + Q.esc(onlineUrl) + '" target="_blank" rel="noopener">Open it online</a>');
    Array.prototype.forEach.call(doc.querySelectorAll(".px-hero__cta [hidden]"), function (e) { e.remove(); });

    root.classList.add("px-pdf");   // (after the mosaic was read: its rules change the layout)

    /* no print-only "simplified" rules; every vh becomes the pixels it has on a desktop screen */
    var css = [];
    eachSheet(doc, function (s, rules) {
      /* The printer would evaluate every media query against the sheet (and "screen" rules do not apply when printing at all).
         So each rule group is decided here, once, with the window the page is seen in: the print-only rules go, the groups that apply
         on this screen become unconditional, the others go. The PDF is then exactly the layout of the visible page. */
      for (var i = rules.length - 1; i >= 0; i--) {
        var r = rules[i]; if (r.type !== 4) continue;
        var cond = r.conditionText || (r.media && r.media.mediaText) || "", on = false;
        if (!/(^|[\s,(])print\b/.test(cond)) { try { on = w.matchMedia(cond).matches; } catch (e) { on = false; } }
        var inner = on ? Array.prototype.map.call(r.cssRules, function (x) { return x.cssText; }).join("\n") : "";
        s.deleteRule(i);
        if (on && inner) { try { s.insertRule("@media all{" + inner + "}", i); } catch (e) {} }
      }
    });
    eachSheet(doc, function (s, rules) { vhRules(rules, css); });
    Array.prototype.forEach.call(doc.querySelectorAll('[style*="vh"]'), function (e) { e.setAttribute("style", toPx(e.getAttribute("style"))); });
    var st = doc.createElement("style");
    st.textContent = css.join("\n") + "\nhtml.px-pdf *{animation:none!important;transition:none!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}" +
      "\nhtml.px-pdf, html.px-pdf body{width:" + W + "px!important;min-width:0!important;margin:0!important;padding-left:0!important;padding-right:0!important;overflow:visible!important}";
    doc.head.appendChild(st);

    /* The PDF ends where the page's own content ends: the bottom of the company line under "Shall we make it real?" (plus the
       padding of that last section). Whatever else makes the document taller (spacers, scroll effects, leftovers) is cut off. */
    var tall = Math.ceil(Math.max(root.scrollHeight, doc.body.scrollHeight)), foot = doc.querySelector(".px-foot"), last = doc.querySelector(".px-close") || doc.getElementById("app"), H = tall;
    var endEl = foot || last;
    if (endEl) {
      var bottom = endEl.getBoundingClientRect().bottom + (w.pageYOffset || 0);
      if (foot && last && last.contains(foot)) bottom += parseFloat(w.getComputedStyle(last).paddingBottom) || 0;
      if (bottom > 200) H = Math.min(tall, Math.ceil(bottom));
    }
    st.textContent += "\nhtml.px-pdf,html.px-pdf body{height:" + H + "px!important;max-height:" + H + "px!important;overflow:hidden!important}";
    var pg = doc.createElement("style");
    /* the sheet is exactly as wide as the window the page is read in and as tall as the page: no margin, no white edge.
       The page colour is also set on the sheet itself so that not one pixel is left white. */
    var bg = (w.getComputedStyle(doc.body).backgroundColor || "").replace(/\s/g, ""), dark = !bg || bg === "rgba(0,0,0,0)" || bg === "transparent" ? "var(--panel-deep,#16130F)" : bg;
    pg.textContent = "@page{size:" + W + "px " + Math.min(H + 2, MAX_H) + "px;margin:0}\nhtml.px-pdf,html.px-pdf body{background:" + dark + "!important}";
    doc.head.appendChild(pg);
    return H;
  }

  var busy = false;
  function save(btn) {
    if (busy) return; busy = true;
    var label = btn ? btn.textContent : "";
    if (btn) { btn.disabled = true; btn.textContent = "Preparing the PDF…"; }
    /* The page itself is printed (a browser always honours the sheet size of the page being printed, not of a hidden frame):
       it is tidied up for the PDF in front of the reader, printed, then the page is reloaded as it was. */
    var online = new URL(w.location.href); online.search = "";
    size();
    try { var clean = new URL(w.location.href); clean.search = clean.search.replace(/([?&])pdf=1&?/, "$1").replace(/[?&]$/, ""); w.history.replaceState(null, "", clean.pathname + clean.search + clean.hash); } catch (e) {}   // so that the reload does not start another PDF
    var restored = false;
    var restore = function () { if (restored) return; restored = true; w.location.reload(); };
    waitReady(w).then(function () {
      w.scrollTo(0, 0);
      prepare(document, online.href);
      w.onafterprint = restore;
      setTimeout(function () { w.print(); }, 250);   // lets the new layout settle
      setTimeout(restore, 900000);
    }).catch(function () { restore(); });
  }

  w.CQPdf = { save: save, prepare: prepare, waitReady: waitReady, WIDTH: W, VH: VH };

  /* a link ending in ?pdf=1 (the "PDF" button of the back office) starts it by itself once the page is drawn */
  if (/[?&]pdf=1\b/.test(w.location.search)) {
    w.addEventListener("load", function () { setTimeout(function () { save(document.getElementById("pxPrint")); }, 900); });
  }
})(window);
