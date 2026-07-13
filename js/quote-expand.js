/* ============================================================
   Testimonial cards: fixed 4:5 boxes. Any quote too long to fit
   gets truncated to "... [...]" and becomes clickable — click (or
   Enter/Space) reveals the full text and grows the card; click
   again collapses it back to the original 4:5 size.
   ============================================================ */
(() => {
  "use strict";

  const cards = document.querySelectorAll(".quote-card");
  if (!cards.length) return;

  const measure = (html, width, cssText) => {
    const el = document.createElement("blockquote");
    el.className = "quote-card__measure";
    el.style.cssText = `position:absolute; left:-9999px; top:0; visibility:hidden; width:${width}px; height:auto; max-height:none; overflow:visible; ${cssText}`;
    el.innerHTML = html;
    document.body.appendChild(el);
    const h = el.scrollHeight;
    document.body.removeChild(el);
    return h;
  };

  cards.forEach((card) => {
    const inner = card.querySelector(".quote-card__inner");
    const header = card.querySelector(".quote-card__head");
    const stars = card.querySelector(".quote-card__stars");
    const bq = card.querySelector("blockquote");
    if (!inner || !bq) return;

    const fullHTML = bq.innerHTML;
    const fullText = bq.textContent.replace(/\s+/g, " ").trim();
    const bqStyle = getComputedStyle(bq);
    const bqCss = `font: ${bqStyle.font}; line-height: ${bqStyle.lineHeight};`;
    const width = bq.getBoundingClientRect().width || card.clientWidth;

    const naturalHeight = measure(fullHTML, width, bqCss);
    const rowGap = parseFloat(getComputedStyle(inner).rowGap) || 0;
    const available = inner.clientHeight - header.offsetHeight - stars.offsetHeight - rowGap * 2;

    if (naturalHeight <= available + 2) return; // fits as-is, nothing to do

    // Binary-search the longest plain-text prefix that, with " [...]"
    // appended, still fits the available space.
    let lo = 10, hi = fullText.length, best = lo;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const candidate = fullText.slice(0, mid).trim() + " [...]";
      if (measure(candidate, width, bqCss) <= available + 2) { best = mid; lo = mid + 1; }
      else hi = mid - 1;
    }
    const truncated = fullText.slice(0, best).trim() + " [...]";
    bq.textContent = truncated;

    card.classList.add("quote-card--expandable");
    card.setAttribute("role", "button");
    card.setAttribute("aria-expanded", "false");

    const collapsedHeight = card.getBoundingClientRect().height; // the fixed 4:5 size, captured before any expansion
    let expanded = false;
    let downX = 0, downY = 0;
    card.addEventListener("pointerdown", (e) => { downX = e.clientX; downY = e.clientY; });

    const toggle = () => {
      const startH = card.getBoundingClientRect().height;
      card.style.height = startH + "px";
      card.classList.add("is-expanded"); // lifts aspect-ratio so scrollHeight below reflects natural size
      void card.offsetHeight; // force reflow at the pinned height

      expanded = !expanded;
      bq.innerHTML = expanded ? fullHTML : "";
      if (!expanded) bq.textContent = truncated;
      card.setAttribute("aria-expanded", String(expanded));

      const targetH = expanded ? card.scrollHeight : collapsedHeight;
      void card.offsetHeight;
      requestAnimationFrame(() => { card.style.height = targetH + "px"; });

      const onEnd = (ev) => {
        if (ev.propertyName !== "height") return;
        card.removeEventListener("transitionend", onEnd);
        card.style.height = "";
        if (!expanded) card.classList.remove("is-expanded");
      };
      card.addEventListener("transitionend", onEnd);
    };

    card.addEventListener("click", (e) => {
      const dx = Math.abs(e.clientX - downX), dy = Math.abs(e.clientY - downY);
      if (dx > 6 || dy > 6) return; // was a carousel drag, not a click
      toggle();
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });
})();
