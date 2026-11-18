/* ============================================================
   CHROMATA FILMS — "Save as PDF" of the couple's proposal page
   The PDF is the page itself, as seen on a desktop screen: same photographs, collage illustrations, colours, fonts and
   prices, on ONE long page (no cuts through the middle of a photo), without the videos. The buttons stay real links
   (reply by email, WhatsApp, "Open it online", sign online once the studio validated the quote), and each film becomes
   a link to watch it.

   How: the page is loaded once more in an invisible 1440 x 900 frame (a desktop screen), tidied up here, given a page
   size equal to its own height, and printed. Browsers print "vh" lengths against the page height, so every vh in the
   style sheets is first converted to the pixels it has on a 900px-high screen. Works best in Chrome or Edge:
   choose "Save as PDF" as the destination.
   ============================================================ */
(function (w) {
  "use strict";
  var Q = w.CQ;
  var W = 1440, VH = 900, K = VH / 100;
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
    ["#qxMenu", "#qxDrawer", "#qxLb", "#pxPrint"].forEach(function (s) { var e = doc.querySelector(s); if (e) e.remove(); });
    Array.prototype.forEach.call(doc.querySelectorAll(".px-ups, .px-send"), function (e) { e.remove(); });   // the selectable upgrades and the send button are for the screen; the chosen ones are in the summary

    /* the videos: no players, a clickable list of the films instead */
    var films = doc.querySelector(".px-films");
    if (films) {
      var stack = films.querySelector(".film-stack"); if (stack) stack.remove();
      films.insertAdjacentHTML("beforeend", '<ul class="px-flist">' + Q.FILMS.map(function (f, i) {
        return '<li><a href="' + Q.esc(filmUrl(f)) + '" target="_blank" rel="noopener"><span class="n">' + String(i + 1).padStart(2, "0") + '</span><span class="t">' + Q.esc(f.t) + "<small>" + Q.esc(f.p) + '</small></span><span class="w">Watch the film &#8599;</span></a></li>';
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
      /* A printer evaluates "max-width" queries against a letter-size sheet (about 816px), which would give the PHONE layout.
         This page is 1440px wide, so every "max-width" rule (phone and tablet layouts) is dropped, and so is the print-only sheet. */
      for (var i = rules.length - 1; i >= 0; i--) { var r = rules[i]; if (r.type === 4 && /(^|\s)print\b|max-width/.test(r.conditionText || "")) s.deleteRule(i); }
    });
    eachSheet(doc, function (s, rules) { vhRules(rules, css); });
    Array.prototype.forEach.call(doc.querySelectorAll('[style*="vh"]'), function (e) { e.setAttribute("style", toPx(e.getAttribute("style"))); });
    var st = doc.createElement("style");
    st.textContent = css.join("\n") + "\nhtml.px-pdf *{animation:none!important;transition:none!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}" +
      "\nhtml.px-pdf, html.px-pdf body{width:" + W + "px!important;margin:0!important}";
    doc.head.appendChild(st);

    var H = Math.ceil(Math.max(root.scrollHeight, doc.body.scrollHeight));
    var pg = doc.createElement("style");
    /* the sheet is a few pixels taller than the content, and the content is clipped to its own height: no blank second page */
    pg.textContent = "@page{size:" + W + "px " + (H + 6) + "px;margin:0}\nhtml.px-pdf{background:var(--panel-deep,#16130F)!important}";
    doc.head.appendChild(pg);
    return H;
  }

  var busy = false;
  function save(btn) {
    if (busy) return; busy = true;
    var label = btn ? btn.textContent : "";
    if (btn) { btn.disabled = true; btn.textContent = "Preparing the PDF…"; }
    var online = new URL(w.location.href); online.search = "";
    var src = new URL(w.location.href); src.search = "?frame=1";
    var f = document.createElement("iframe");
    f.setAttribute("aria-hidden", "true"); f.tabIndex = -1; f.title = "PDF";
    f.style.cssText = "position:fixed;left:-30000px;top:0;width:" + W + "px;height:" + VH + "px;border:0;pointer-events:none";
    var done = function () { busy = false; if (btn) { btn.disabled = false; btn.textContent = label; } if (f.parentNode) f.remove(); };
    f.addEventListener("load", function () {
      var win = f.contentWindow;
      waitReady(win).then(function () {
        prepare(win.document, online.href);
        win.onafterprint = done;
        win.focus(); win.print();
        setTimeout(function () { if (btn && btn.disabled) { btn.disabled = false; btn.textContent = label; busy = false; } }, 1500);
        setTimeout(done, 600000);
      }).catch(function () { done(); w.print(); });
    });
    f.src = src.href;
    document.body.appendChild(f);
  }

  w.CQPdf = { save: save, prepare: prepare, waitReady: waitReady, WIDTH: W, VH: VH };

  /* a link ending in ?pdf=1 (the "PDF" button of the back office) starts it by itself once the page is drawn */
  if (/[?&]pdf=1\b/.test(w.location.search)) {
    w.addEventListener("load", function () { setTimeout(function () { save(document.getElementById("pxPrint")); }, 900); });
  }
})(window);
