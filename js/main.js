/* ============================================================
   CHROMATA FILMS — shared runtime
   Lenis smooth scroll + GSAP/ScrollTrigger choreography,
   scroll-scrubbed films (lerped currentTime, mobile fallback),
   preloader, nav, cursor, particles, reveals.
   ============================================================ */
(() => {
  "use strict";

  const doc = document.documentElement;
  doc.classList.remove("no-js");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (reducedMotion) doc.classList.add("reduced-motion");

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Lenis smooth scroll ---------------- */
  let lenis = null;
  if (!reducedMotion && !isTouch && window.Lenis) {
    lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1.0 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToTarget = (target) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.4 });
    else (typeof target === "string" ? document.querySelector(target) : target)?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------- Preloader (real asset progress) ---------------- */
  const preloader = document.getElementById("preloader");
  const runIntro = () => {
    document.body.classList.add("loaded");
    const heroLines = document.querySelectorAll(".intro-rise .line-inner");
    if (!reducedMotion && heroLines.length) {
      gsap.to(heroLines, { y: 0, rotate: 0, duration: 1.1, ease: "power4.out", stagger: 0.12, delay: 0.15 });
    } else {
      gsap.set(heroLines, { y: 0, rotate: 0 });
    }
    gsap.to(".intro-fade", { opacity: 1, y: 0, duration: 0.9, ease: "power2.out", delay: reducedMotion ? 0 : 0.45 });
    const heroMedia = document.querySelector(".intro-scale");
    if (heroMedia && !reducedMotion) gsap.fromTo(heroMedia, { scale: 1.12 }, { scale: 1, duration: 2.4, ease: "power2.out" });
    ScrollTrigger.refresh();
  };

  if (preloader) {
    gsap.set(".intro-fade", { opacity: 0, y: 20 });
    const fill = preloader.querySelector(".preloader__fill");
    const pct = preloader.querySelector(".preloader__pct");
    const word = preloader.querySelector(".preloader__word");
    if (word && !reducedMotion) gsap.fromTo(word, { letterSpacing: "0.5em", opacity: 0 }, { letterSpacing: "0.06em", opacity: 1, duration: 1.2, ease: "power3.out" });

    // track real loading of eager images + video metadata (lazy images load on
    // scroll and must not hold the preloader hostage)
    const imgs = Array.from(document.images).filter((i) => i.loading !== "lazy");
    const vids = Array.from(document.querySelectorAll("video[data-preload-track]"));
    const total = imgs.length + vids.length + 1; // +1 for fonts
    let done = 0;
    const state = { p: 0 };
    const render = () => {
      const target = done / total;
      gsap.to(state, {
        p: target, duration: 0.4, ease: "power1.out", overwrite: true,
        onUpdate: () => {
          if (fill) fill.style.width = (state.p * 100).toFixed(1) + "%";
          if (pct) pct.textContent = Math.round(state.p * 100) + "%";
        },
      });
    };
    const tick = () => { done++; render(); };
    imgs.forEach((img) => { if (img.complete) tick(); else { img.addEventListener("load", tick, { once: true }); img.addEventListener("error", tick, { once: true }); } });
    vids.forEach((v) => { if (v.readyState >= 1) tick(); else { v.addEventListener("loadedmetadata", tick, { once: true }); v.addEventListener("error", tick, { once: true }); } });
    document.fonts.ready.then(tick);

    const MIN_SHOW = 1600;
    const started = performance.now();
    const tryFinish = () => {
      if (done < total) return;
      const wait = Math.max(0, MIN_SHOW - (performance.now() - started));
      setTimeout(() => {
        if (fill) fill.style.background = "var(--coral)";
        gsap.to(preloader, {
          clipPath: "inset(0 0 100% 0)", duration: reducedMotion ? 0 : 0.9, ease: "power4.inOut", delay: 0.15,
          onComplete: () => { preloader.style.display = "none"; runIntro(); },
        });
      }, wait);
    };
    const watcher = setInterval(() => { if (done >= total) { clearInterval(watcher); tryFinish(); } }, 120);
    setTimeout(() => { done = total; clearInterval(watcher); tryFinish(); }, 4500); // hard cap
  } else {
    runIntro();
  }

  /* ---------------- Navigation ---------------- */
  const nav = document.getElementById("nav");
  if (nav) {
    ScrollTrigger.create({
      start: 120, end: "max",
      onUpdate: (self) => nav.classList.toggle("nav--solid", self.scroll() > 120),
      onEnter: () => nav.classList.add("nav--solid"),
      onLeaveBack: () => nav.classList.remove("nav--solid"),
    });
    // flip nav + rail to night over dark sections
    document.querySelectorAll("[data-theme='dark']").forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec, start: "top 60px", end: "bottom 60px",
        onToggle: (self) => {
          if (self.isActive) { nav.classList.add("nav--night"); document.body.classList.add("rail-night"); }
          else if (!ScrollTrigger.getAll().some((st) => st.vars.__night && st.isActive && st !== self.__self)) {
            nav.classList.remove("nav--night"); document.body.classList.remove("rail-night");
          }
        },
        __night: true,
      });
    });

    // dropdown
    const drop = document.getElementById("navDrop");
    if (drop) {
      const toggle = drop.querySelector(".nav__drop-toggle");
      const close = (e) => { if (!drop.contains(e.target)) { drop.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); } };
      toggle.addEventListener("click", () => {
        const open = drop.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      drop.addEventListener("mouseenter", () => { if (!isTouch) { drop.classList.add("open"); toggle.setAttribute("aria-expanded", "true"); } });
      drop.addEventListener("mouseleave", () => { if (!isTouch) { drop.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); } });
      document.addEventListener("click", close);
    }

    // burger / mobile menu
    const burger = document.getElementById("navBurger");
    const mm = document.getElementById("mobileMenu");
    if (burger && mm) {
      burger.addEventListener("click", () => {
        const open = mm.classList.toggle("open");
        document.body.classList.toggle("menu-open", open);
        if (lenis) open ? lenis.stop() : lenis.start();
      });
      mm.querySelectorAll("a[href]").forEach((a) => a.addEventListener("click", () => {
        mm.classList.remove("open"); document.body.classList.remove("menu-open"); if (lenis) lenis.start();
      }));
      const mmProjects = document.getElementById("mmProjects");
      if (mmProjects) mmProjects.addEventListener("click", (e) => { e.preventDefault(); mm.querySelector(".sub").classList.toggle("open"); });
    }
  }

  /* ---------------- Progress rail ---------------- */
  const rail = document.getElementById("rail");
  if (rail) {
    const fillEl = rail.querySelector(".rail__fill");
    const idxEl = rail.querySelector(".rail__index");
    const sections = gsap.utils.toArray("[data-section]");
    const dots = rail.querySelector(".rail__dots");
    sections.forEach((s, i) => {
      const dot = document.createElement("i");
      dot.style.top = ((i + 0.5) / sections.length * 100) + "%";
      dots.appendChild(dot);
    });
    const totalLbl = String(sections.length).padStart(2, "0");
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (self) => { fillEl.style.height = (self.progress * 100).toFixed(2) + "%"; },
    });
    sections.forEach((s, i) => {
      ScrollTrigger.create({
        trigger: s, start: "top center", end: "bottom center",
        onToggle: (self) => { if (self.isActive && idxEl) idxEl.textContent = String(i + 1).padStart(2, "0") + " / " + totalLbl; },
      });
    });
  }

  /* ---------------- Custom cursor ---------------- */
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (dot && ring && !isTouch && !reducedMotion) {
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { x: pos.x, y: pos.y };
    addEventListener("mousemove", (e) => { pos.x = e.clientX; pos.y = e.clientY; dot.style.left = pos.x + "px"; dot.style.top = pos.y + "px"; });
    gsap.ticker.add(() => {
      ringPos.x += (pos.x - ringPos.x) * 0.15;
      ringPos.y += (pos.y - ringPos.y) * 0.15;
      ring.style.left = ringPos.x + "px"; ring.style.top = ringPos.y + "px";
    });
    const label = ring.querySelector(".cursor-label");
    const setMode = (mode, text) => {
      ring.classList.remove("is-link", "is-drag", "is-play");
      if (mode) ring.classList.add(mode);
      if (label) label.textContent = text || "";
    };
    document.addEventListener("mouseover", (e) => {
      const t = e.target;
      if (t.closest("[data-cursor='drag']")) setMode("is-drag", "drag");
      else if (t.closest("[data-cursor='play'], .trailer")) setMode("is-play", "play");
      else if (t.closest("a, button, select, input, textarea, label")) setMode("is-link");
      else setMode(null);
    });
  }

  /* ---------------- Generic reveals ---------------- */
  if (!reducedMotion) {
    gsap.utils.toArray(".line-mask .line-inner").forEach((el) => {
      if (el.closest(".intro-rise")) return; // hero handled by preloader
      gsap.to(el, {
        y: 0, rotate: 0, duration: 1.15, ease: "power4.out",
        scrollTrigger: { trigger: el.closest(".line-mask"), start: "top 82%", toggleActions: "play none none reverse" },
      });
    });
    gsap.utils.toArray(".img-reveal").forEach((el) => {
      const inner = el.querySelector("img, video");
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none none" } });
      tl.to(el, { clipPath: "inset(0% 0 0 0)", duration: 1.2, ease: "power4.inOut" });
      if (inner) tl.to(inner, { scale: 1, duration: 1.2, ease: "power4.inOut" }, 0);
    });
    // data-speed parallax
    gsap.utils.toArray("[data-speed]").forEach((el) => {
      const speed = parseFloat(el.dataset.speed) || 1;
      gsap.fromTo(el, { y: () => (1 - speed) * -120 }, {
        y: () => (1 - speed) * 120, ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true },
      });
    });
    // inner-image parallax on page heroes
    gsap.utils.toArray(".page-hero__bg, .feature-hero__bg").forEach((bg) => {
      gsap.fromTo(bg, { yPercent: -6 }, {
        yPercent: 6, ease: "none",
        scrollTrigger: { trigger: bg.parentElement, start: "top top", end: "bottom top", scrub: 1 },
      });
    });
    // counters
    gsap.utils.toArray("[data-count]").forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      ScrollTrigger.create({
        trigger: el, start: "top 85%", once: true,
        onEnter: () => gsap.fromTo(el, { innerText: 0 }, { innerText: target, duration: 1.8, ease: "power2.out", snap: { innerText: 1 } }),
      });
    });
  } else {
    gsap.set(".line-mask .line-inner", { y: 0, rotate: 0 });
    gsap.set(".img-reveal", { clipPath: "inset(0)" });
    document.querySelectorAll(".img-reveal img, .img-reveal video").forEach((i) => (i.style.transform = "none"));
  }

  /* ---------------- Scroll-scrubbed films ---------------- */
  // Desktop: pin + lerped currentTime scrub. Touch/reduced-motion: plain
  // autoplay loop (smoothest possible playback on mobile), chapters on scroll.
  document.querySelectorAll(".film[data-scrub]").forEach((section) => {
    const video = section.querySelector("video");
    if (!video) return;
    if (isMobile && video.dataset.srcMobile) {
      video.src = video.dataset.srcMobile;
    } else if (video.dataset.src) {
      video.src = video.dataset.src;
    }
    const chapters = section.querySelectorAll(".film__chapter");
    const numerals = section.querySelectorAll(".film__numerals span");
    const fill = section.querySelector(".film__timeline .fill");
    const tc = section.querySelector(".film__timeline .tc");
    const fmt = (s) => "00:" + String(Math.floor(s)).padStart(2, "0");

    const windows = [ [0.05, 0.3], [0.38, 0.63], [0.7, 0.95] ];
    const chapterAlpha = (p, [a, b]) => {
      const fade = 0.06;
      if (p < a || p > b) return 0;
      if (p < a + fade) return (p - a) / fade;
      if (p > b - fade) return (b - p) / fade;
      return 1;
    };
    const paintChapters = (p) => {
      chapters.forEach((ch, i) => {
        if (!windows[i]) return;
        const alpha = chapterAlpha(p, windows[i]);
        ch.style.opacity = alpha;
        ch.style.transform = `translateY(${(1 - alpha) * (p > (windows[i][0] + windows[i][1]) / 2 ? -40 : 24)}px)`;
      });
      let active = -1;
      windows.forEach((w, i) => { if (p >= w[0] && p <= w[1]) active = i; });
      numerals.forEach((n, i) => n.classList.toggle("active", i === active));
      if (fill) fill.style.width = (p * 100).toFixed(2) + "%";
      if (tc && video.duration) tc.textContent = fmt(p * video.duration) + " / " + fmt(video.duration);
    };

    if (reducedMotion) {
      video.removeAttribute("autoplay");
      video.preload = "metadata";
      paintChapters(0.5);
      chapters.forEach((c) => { c.style.opacity = ""; });
      if (chapters[0]) chapters[0].style.opacity = 1;
      return;
    }

    if (isTouch) {
      // Mobile: real-time playback — buttery, battery-friendly, no seek jank.
      video.muted = true; video.loop = true; video.playsInline = true; video.autoplay = true;
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { en.isIntersecting ? video.play().catch(() => {}) : video.pause(); });
      }, { rootMargin: "25%" });
      io.observe(section);
      video.addEventListener("timeupdate", () => { if (video.duration) paintChapters(video.currentTime / video.duration); });
      return;
    }

    // Desktop scrub
    video.preload = "auto";
    const pinLength = section.dataset.pin || "+=400%";
    const state = { current: 0, target: 0 };
    let raf = null;
    const loop = () => {
      state.current += (state.target - state.current) * 0.1;
      if (video.duration && video.readyState >= 2) {
        const t = state.current * video.duration;
        if (Math.abs(video.currentTime - t) > 0.001) video.currentTime = t;
      }
      paintChapters(state.current);
      raf = requestAnimationFrame(loop);
    };
    ScrollTrigger.create({
      trigger: section, start: "top top", end: pinLength, pin: true, scrub: true,
      anticipatePin: 1,
      onUpdate: (self) => { state.target = self.progress; },
      onToggle: (self) => {
        if (self.isActive && raf === null) raf = requestAnimationFrame(loop);
        else if (!self.isActive && raf !== null) { cancelAnimationFrame(raf); raf = null; }
      },
    });
    paintChapters(0);
  });

  /* ---------------- Hero scroll dot loop ---------------- */
  const scrollDot = document.querySelector(".hero__scroll .line i");
  if (scrollDot && !reducedMotion) {
    gsap.fromTo(scrollDot, { top: -6 }, { top: 46, duration: 1.8, ease: "power1.inOut", repeat: -1 });
  }

  /* ---------------- Logo marquee ---------------- */
  document.querySelectorAll(".marquee__track").forEach((track) => {
    track.innerHTML += track.innerHTML; // duplicate for seamless loop
    if (reducedMotion) return;
    const half = track.scrollWidth / 2;
    gsap.to(track, { x: -half, duration: half / 60, ease: "none", repeat: -1 });
  });

  /* ---------------- Horizontal gallery ---------------- */
  const hgal = document.querySelector(".hgal");
  if (hgal) {
    const track = hgal.querySelector(".hgal__track");
    const cards = hgal.querySelectorAll(".hcard");
    const fill = hgal.querySelector(".hgal__progress .fill");
    const count = hgal.querySelector(".hgal__progress .count");
    const updateCentered = () => {
      const mid = innerWidth / 2;
      let best = null, bestDist = Infinity, bestIdx = 0;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (d < bestDist) { bestDist = d; best = c; bestIdx = i; }
      });
      cards.forEach((c) => c.classList.toggle("centered", c === best));
      if (count) count.textContent = String(bestIdx + 1).padStart(2, "0") + " — " + String(cards.length).padStart(2, "0");
    };
    if (!isTouch && !reducedMotion) {
      const getDist = () => track.scrollWidth - innerWidth;
      const tween = gsap.to(track, {
        x: () => -getDist(), ease: "none",
        scrollTrigger: {
          trigger: hgal, start: "top top", end: "+=250%", pin: true, scrub: 1,
          invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => {
            if (fill) fill.style.width = (self.progress * 100).toFixed(2) + "%";
            updateCentered();
          },
        },
      });
      // inner counter-parallax
      cards.forEach((card) => {
        const img = card.querySelector("img");
        if (img) gsap.fromTo(img, { x: 0 }, { x: "-10%", ease: "none",
          scrollTrigger: { containerAnimation: tween, trigger: card, start: "left right", end: "right left", scrub: true } });
      });
    } else {
      // native swipe on touch
      const vp = hgal.querySelector(".hgal__viewport") || track.parentElement;
      vp.style.overflowX = "auto";
      vp.style.webkitOverflowScrolling = "touch";
      track.style.width = "max-content";
      vp.addEventListener("scroll", () => {
        const max = track.scrollWidth - vp.clientWidth;
        if (fill && max > 0) fill.style.width = ((vp.scrollLeft / max) * 100).toFixed(2) + "%";
        updateCentered();
      }, { passive: true });
      updateCentered();
    }
  }

  /* ---------------- Day → night metamorphosis ---------------- */
  const pivot = document.querySelector(".meta-pivot");
  if (pivot) {
    const frame = pivot.querySelector(".meta-pivot__frame");
    const copy = pivot.querySelector(".meta-pivot__copy");
    const layerB = pivot.querySelector(".layer-b");
    const dissolveCanvas = pivot.querySelector("canvas.dissolve");
    let setDissolve = null;
    if (dissolveCanvas && window.ChromataDissolve && !reducedMotion) {
      setDissolve = ChromataDissolve.init(dissolveCanvas,
        pivot.dataset.imgA, pivot.dataset.imgB);
    }
    if (!reducedMotion) {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: pivot, start: "top top", end: "+=200%", pin: true, scrub: 1, anticipatePin: 1 },
      });
      tl.fromTo(pivot, { backgroundColor: "#F8F4EE" }, { backgroundColor: "#201C18", duration: 1, ease: "none" }, 0)
        .to(frame, { clipPath: "inset(0vh 0vw round 0px)", duration: 1, ease: "none" }, 0)
        .to(copy, { opacity: 1, duration: 0.25 }, 0.45)
        .to({}, { duration: 0.2 }); // hold
      if (setDissolve) {
        tl.eventCallback("onUpdate", null);
        ScrollTrigger.create({
          trigger: pivot, start: "top top", end: "+=200%", scrub: true,
          onUpdate: (self) => setDissolve(self.progress),
        });
      } else if (layerB) {
        tl.to(layerB, { opacity: 1, duration: 0.7, ease: "none" }, 0.2);
      }
      ScrollTrigger.create({
        trigger: pivot, start: "top center", end: "bottom center",
        onToggle: (self) => document.body.classList.toggle("embers", self.isActive),
      });
    } else {
      pivot.style.backgroundColor = "#201C18";
      if (copy) copy.style.opacity = 1;
      if (layerB) layerB.style.opacity = 1;
      frame.style.clipPath = "none";
    }
  }

  /* ---------------- Particles (petals ↔ gold embers) ---------------- */
  const pcanvas = document.getElementById("particles");
  if (pcanvas && !reducedMotion) {
    const ctx = pcanvas.getContext("2d");
    const COUNT = isMobile ? 40 : 90;
    let W, H;
    const resize = () => { W = pcanvas.width = innerWidth; H = pcanvas.height = innerHeight; };
    resize(); addEventListener("resize", resize);
    const mouse = { x: -9999, y: -9999 };
    addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    const parts = Array.from({ length: COUNT }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      r: 1 + Math.random() * 2.4, s: 0.25 + Math.random() * 0.7,
      drift: Math.random() * Math.PI * 2, o: 0.15 + Math.random() * 0.4,
    }));
    gsap.ticker.add(() => {
      const night = document.body.classList.contains("embers") || document.body.classList.contains("rail-night");
      ctx.clearRect(0, 0, W, H);
      const dir = night ? -1 : 1;
      ctx.fillStyle = night ? "rgba(229,201,120," : "rgba(233,68,55,";
      for (const p of parts) {
        p.drift += 0.008;
        p.y += p.s * dir;
        p.x += Math.sin(p.drift) * 0.4;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 14400) { const f = (1 - d2 / 14400) * 1.6; p.x += (dx / Math.sqrt(d2 + 0.01)) * f; p.y += (dy / Math.sqrt(d2 + 0.01)) * f; }
        if (p.y > H + 10) p.y = -10; if (p.y < -10) p.y = H + 10;
        if (p.x > W + 10) p.x = -10; if (p.x < -10) p.x = W + 10;
        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.fillStyle = night ? `rgba(229,201,120,${p.o})` : `rgba(201,154,46,${p.o * 0.7})`;
        ctx.ellipse(p.x, p.y, p.r, p.r * 0.7, p.drift, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (!isTouch && !reducedMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 24;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(el, { x: (x / r.width) * strength * 2, y: (y / r.height) * strength * 2, duration: 0.35, ease: "power2.out" });
      });
      el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" }));
    });
  }

  /* ---------------- Footer wordmark fit ---------------- */
  const wordmark = document.getElementById("footerWordmark");
  if (wordmark) {
    const fit = () => {
      wordmark.style.fontSize = "100px";
      const w = wordmark.scrollWidth;
      wordmark.style.fontSize = Math.floor(100 * (innerWidth * 0.96) / w) + "px";
    };
    fit(); addEventListener("resize", fit);
    document.fonts.ready.then(fit);
    if (!reducedMotion) {
      gsap.fromTo(wordmark, { yPercent: 60, opacity: 0 }, {
        yPercent: 0, opacity: 1, duration: 1.3, ease: "power4.out",
        scrollTrigger: { trigger: wordmark, start: "top 96%" },
      });
    }
  }

  /* ---------------- Lazy embeds (Vimeo bg / YouTube trailers) ---------------- */
  const lazyFrames = document.querySelectorAll("iframe[data-lazy-src]");
  if (lazyFrames.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.src = en.target.dataset.lazySrc; io.unobserve(en.target); }
      });
    }, { rootMargin: "60%" });
    lazyFrames.forEach((f) => io.observe(f));
  }
  document.querySelectorAll(".trailer[data-yt]").forEach((tr) => {
    tr.addEventListener("click", () => {
      if (tr.querySelector("iframe")) return;
      const ifr = document.createElement("iframe");
      ifr.src = `https://www.youtube-nocookie.com/embed/${tr.dataset.yt}?autoplay=1&rel=0&modestbranding=1`;
      ifr.allow = "autoplay; encrypted-media; picture-in-picture";
      ifr.allowFullscreen = true;
      tr.appendChild(ifr);
    }, { once: false });
  });

  /* ---------------- Ambient videos ---------------- */
  document.querySelectorAll("video[data-ambient]").forEach((v) => {
    v.muted = true; v.loop = true; v.playsInline = true;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { en.isIntersecting ? v.play().catch(() => {}) : v.pause(); });
    }, { rootMargin: "20%" });
    io.observe(v);
  });

  /* ---------------- To top ---------------- */
  const toTop = document.getElementById("toTop");
  if (toTop) {
    ScrollTrigger.create({ start: innerHeight * 1.2, end: "max", onToggle: (self) => toTop.classList.toggle("show", self.isActive) });
    toTop.addEventListener("click", () => scrollToTarget(0));
  }

  /* ---------------- Anchor smooth scroll ---------------- */
  document.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) { e.preventDefault(); scrollToTarget(target); }
    });
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
