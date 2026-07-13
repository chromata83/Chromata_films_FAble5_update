// Chromata Films — generates all sub-pages from a shared shell.
// Run: node scripts/build-pages.mjs
import { writeFileSync } from "node:fs";

const EMAIL = "contact@chromatafilms.com";
const ADDRESS = "27 Rue de Montchoisy, 1207 Geneva, Switzerland";

const nav = (current) => `<header class="nav nav--night" id="nav">
  <a class="nav__brand" href="index.html" aria-label="Chromata Films — home">
    <img class="nav__logo" src="assets/img/logo-mark.png" alt="" />
    <span class="nav__wordmark">Chromata Films</span>
  </a>
  <nav class="nav__links" aria-label="Primary">
    <a class="nav__link" href="index.html">Home</a>
    <div class="nav__drop" id="navDrop">
      <button class="nav__drop-toggle" aria-haspopup="true" aria-expanded="false">
        Real Weddings
        <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 3l4 4 4-4"/></svg>
      </button>
      <div class="nav__drop-menu" role="menu">
        <a class="nav__drop-item" role="menuitem" href="domantas-sabonis.html"${current === "domantas" ? ' aria-current="page"' : ""}><span class="t">Domantas &amp; Shashana</span><span class="tag">NBA All-Star</span></a>
        <a class="nav__drop-item" role="menuitem" href="jacqueline-gordon.html"${current === "jacky" ? ' aria-current="page"' : ""}><span class="t">Jacqueline &amp; Gordon</span><span class="tag">St-Tropez</span></a>
        <a class="nav__drop-item" role="menuitem" href="anna-andres.html"${current === "anna" ? ' aria-current="page"' : ""}><span class="t">Anna Andres</span><span class="tag">Miss Universe UA</span></a>
        <a class="nav__drop-item" role="menuitem" href="russell-westbrook.html"${current === "westbrook" ? ' aria-current="page"' : ""}><span class="t">Russell &amp; Nina Westbrook</span><span class="tag">Positano</span></a>
        <a class="nav__drop-item" role="menuitem" href="vaux-le-vicomte.html"${current === "vaux" ? ' aria-current="page"' : ""}><span class="t">Vaux-le-Vicomte</span><span class="tag">Private Wedding</span></a>
      </div>
    </div>
    <a class="nav__link" href="the-studio.html"${current === "studio" ? ' aria-current="page"' : ""}>The Studio</a>
    <a class="nav__link" href="journal.html"${current === "journal" ? ' aria-current="page"' : ""}>Journal</a>
    <a class="nav__link" href="gallery.html"${current === "gallery" ? ' aria-current="page"' : ""}>Gallery</a>
    <a class="nav__cta" href="contact.html">Contact Us</a>
  </nav>
  <button class="nav__burger" id="navBurger" aria-label="Open menu"><span></span><span></span><span></span></button>
</header>

<div class="mobile-menu" id="mobileMenu">
  <a class="big" href="index.html">Home</a>
  <a class="big" href="#" id="mmProjects">Real Weddings <em>↓</em></a>
  <div class="sub">
    <a href="domantas-sabonis.html">Domantas &amp; Shashana — NBA All-Star</a>
    <a href="jacqueline-gordon.html">Jacqueline &amp; Gordon — St-Tropez</a>
    <a href="anna-andres.html">Anna Andres — Miss Universe</a>
    <a href="russell-westbrook.html">Russell &amp; Nina Westbrook — Positano</a>
    <a href="vaux-le-vicomte.html">Vaux-le-Vicomte — Private Wedding</a>
  </div>
  <a class="big" href="the-studio.html">The <em>Studio</em></a>
  <a class="big" href="journal.html">Journal</a>
  <a class="big" href="gallery.html">Gallery</a>
  <a class="big" href="contact.html">Contact <em>Us</em></a>
  <div class="mm-footer">Chromata Films — Where the French Touch meets Modern Elegance</div>
</div>`;

const PRELOADER = `<div class="preloader" id="preloader">
  <img class="preloader__mark" src="assets/img/logo-mark.png" alt="Chromata Films — golden peacock" />
  <div class="preloader__word">CHROMATA FILMS</div>
  <div class="preloader__sub">Wedding Cinematography</div>
  <div class="preloader__bar"><div class="preloader__fill"></div></div>
  <div class="preloader__pct">0%</div>
</div>`;

const FOOTER = (withCta = true) => `${withCta ? `<section class="begin" data-theme="dark" data-section>
  <div>
    <p class="kicker">— Begin Your Journey</p>
    <h2 class="display-lg footer__cta-title" style="margin-top:2.5vh">
      <span class="line-mask"><span class="line-inner">Come see your</span></span>
      <span class="line-mask"><span class="line-inner">story <em>bloom</em></span></span>
    </h2>
  </div>
  <a class="footer__begin" href="contact.html" data-magnetic>Begin →</a>
</section>

` : ""}<footer class="footer">
  <div class="footer__cols">
    <div>
      <h4>Real Weddings</h4>
      <a href="domantas-sabonis.html">Domantas &amp; Shashana</a>
      <a href="jacqueline-gordon.html">Jacqueline &amp; Gordon</a>
      <a href="anna-andres.html">Anna Andres</a>
      <a href="russell-westbrook.html">Russell &amp; Nina Westbrook</a>
      <a href="vaux-le-vicomte.html">Vaux-le-Vicomte</a>
      <a href="gallery.html">Gallery</a>
    </div>
    <div>
      <h4>Studio</h4>
      <a href="the-studio.html">The Studio</a>
      <a href="journal.html">Journal</a>
      <a href="contact.html">Contact Us</a>
    </div>
    <div>
      <h4>Follow</h4>
      <a href="https://www.instagram.com/chromata_films_weddings/" target="_blank" rel="noopener">Instagram</a>
      <a href="https://vimeo.com/chromatafilms" target="_blank" rel="noopener">Vimeo</a>
      <a href="https://www.youtube.com/@chromatafilms" target="_blank" rel="noopener">YouTube</a>
      <a href="mailto:${EMAIL}">${EMAIL}</a>
    </div>
  </div>
  <a class="footer__wordmark" id="footerWordmark" href="index.html" aria-label="Chromata Films — home">CHROMATA FILMS</a>
  <div class="footer__legal">
    <span>© 2026 Chromata Films — Wedding Film Cinematography</span>
    <span>${ADDRESS} · <a href="mailto:${EMAIL}">${EMAIL}</a></span>
  </div>
</footer>`;

const shell = ({ page, title, description, main, footerCta = true, noindex = false }) => `<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${description}" />
${noindex ? '<meta name="robots" content="noindex, nofollow" />\n' : ""}<link rel="icon" type="image/png" href="assets/img/logo-mark.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Space+Grotesk:wght@400;500&display=swap" rel="stylesheet" />
<link rel="preload" href="assets/fonts/GermanySans.ttf" as="font" type="font/ttf" crossorigin />
<link rel="stylesheet" href="css/main.css?v=36" />
</head>
<body data-page="${page}">

${PRELOADER}

${nav(page)}

<div class="cursor-dot" id="cursorDot"></div>
<div class="cursor-ring" id="cursorRing"><span class="cursor-label"></span></div>

<main>
${main}

${FOOTER(footerCta)}
</main>

<button class="totop" id="toTop" aria-label="Back to top">
  <svg viewBox="0 0 16 16" fill="none" stroke-width="1.5"><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5"/></svg>
</button>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
<script src="js/main.js?v=30" defer></script>
</body>
</html>
`;

const next = (href, label) => `  <a class="nextproject" href="${href}" data-theme="dark">
    <p class="kicker">— Next wedding</p>
    <div class="np-title">${label} <em>→</em></div>
  </a>`;

const g = (folder, n, cls = "", alt = "") =>
  `<figure class="gitem ${cls} mat img-reveal"><img src="assets/img/${folder}/${n}" alt="${alt}" loading="lazy"></figure>`;

const pages = {};

/* ============================== DOMANTAS ============================== */
pages["domantas-sabonis.html"] = shell({
  page: "domantas",
  title: "Domantas Sabonis & Shashana — Villa Ephrussi Wedding, French Riviera | Chromata Films",
  description: "The wedding of NBA All-Star Domantas Sabonis and Shashana at Villa Ephrussi, St-Jean-Cap-Ferrat ... three days on the French Riviera, planned by Mindy Weiss, filmed by Chromata Films.",
  main: `  <section class="page-hero" data-theme="dark">
    <div class="page-hero__bg">
      <img src="assets/img/landing/domantas-cover.jpg" alt="Domantas Sabonis and Shashana on their wedding day" fetchpriority="high" />
    </div>
    <div class="page-hero__content">
      <p class="kicker line-mask"><span class="line-inner">Real Wedding · NBA All-Star</span></p>
      <h1 class="page-hero__title">
        <span class="line-mask"><span class="line-inner">Domantas <em>&amp;</em> Shashana</span></span>
      </h1>
      <div class="page-hero__sub">
        <span>Villa Ephrussi · St-Jean-Cap-Ferrat</span>
        <span>Planning — Mindy Weiss</span>
        <span>Film — Chromata Films</span>
      </div>
    </div>
  </section>

  <section class="pad-section" style="padding-bottom:0" data-section>
    <div class="container">
      <p class="kicker">— The Film</p>
      <div class="mat img-reveal trailer" data-yt="4yQBjrSI1hI" data-cursor="play" style="margin-top:4vh">
        <img class="thumb" src="https://img.youtube.com/vi/4yQBjrSI1hI/maxresdefault.jpg" alt="Shashana and Domantas Sabonis — wedding film highlight" loading="lazy">
        <div class="trailer__play"><div class="disc"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></div></div>
        <span class="trailer__label">Wedding film highlight ... play</span>
      </div>
    </div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <p class="kicker">— The Story</p>
      <div class="feature__grid" style="margin-top:5vh">
        <div class="prose">
          <p class="lead">Three days at Villa Ephrussi, St-Jean-Cap-Ferrat ... when an NBA All-Star marries the love of his life, the celebration has to hit different. And it did.</p>
          <p>The prestigious Villa Ephrussi on the French Riviera was the perfect setting for this grand celebration. Despite the intense summer heat, Domantas and Shashana carried an effortless elegance through every moment of the festivities ... dancing, singing, and even jet skiing off the Cap between the celebrations.</p>
          <p><a class="text-link" href="https://www.mindyweiss.com" target="_blank" rel="noopener">Mindy Weiss</a> and her team orchestrated a flawless three-day production, with a cohesive palette and décor carried through every corner of the venue ... florals by Roni Floral Design, décor by Deco Flamme, and our friends at the <a class="text-link" href="https://www.fourseasons.com/capferrat/" target="_blank" rel="noopener">Four Seasons Grand-Hôtel du Cap-Ferrat</a> hosting the couple and their guests.</p>
          <p>The evening party was, in the words of everyone present, wild and crazy ... the Vogue Live Band and Kurioza Events kept the dance floor alive deep into the Riviera night, while our cameras and <a class="text-link" href="https://www.maddychristina.com" target="_blank" rel="noopener">Maddy Christina</a>'s photography caught every second of it.</p>
        </div>
        <div class="feature__meta">
          <div class="row"><span>Couple</span><span class="val">Domantas Sabonis &amp; Shashana</span></div>
          <div class="row"><span>Venue</span><span class="val">Villa Ephrussi, St-Jean-Cap-Ferrat</span></div>
          <div class="row"><span>Planning</span><span class="val"><a class="text-link" href="https://www.mindyweiss.com" target="_blank" rel="noopener">Mindy Weiss</a></span></div>
          <div class="row"><span>Hotel</span><span class="val"><a class="text-link" href="https://www.fourseasons.com/capferrat/" target="_blank" rel="noopener">Four Seasons Cap-Ferrat</a></span></div>
          <div class="row"><span>Florals</span><span class="val">Roni Floral Design</span></div>
          <div class="row"><span>Décor</span><span class="val">Deco Flamme</span></div>
          <div class="row"><span>Entertainment</span><span class="val">Vogue Live Band · Kurioza Events</span></div>
          <div class="row"><span>Photography</span><span class="val"><a class="text-link" href="https://www.maddychristina.com" target="_blank" rel="noopener">Maddy Christina</a></span></div>
          <div class="row"><span>Film</span><span class="val">Chromata Films</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="pad-section" style="padding-top:0" data-section>
    <div class="container">
      <p class="kicker">— The Day</p>
      <div class="gallery-grid" style="margin-top:5vh">
        ${g("domantas", "ds-05.jpg", "w12 wide", "The bride's gown, prepared for the ceremony")}
        ${g("domantas", "ds-02.jpg", "", "Wedding preparations")}
        ${g("domantas", "ds-08.jpg", "", "Details of the day")}
        ${g("domantas", "ds-11.jpg", "w4", "Portrait of the couple")}
        ${g("domantas", "ds-13.jpg", "w4", "The ceremony")}
        ${g("domantas", "ds-15.jpg", "w4", "Celebration moments")}
        ${g("domantas", "ds-16.jpg", "w8", "The first dance")}
        ${g("domantas", "ds-19.jpg", "w4", "Guests celebrating")}
        ${g("domantas", "ds-22.jpg", "", "Golden hour portraits")}
        ${g("domantas", "ds-25.jpg", "", "The reception")}
        ${g("domantas", "ds-28.jpg", "w12 wide", "The party at full tilt")}
        ${g("domantas", "ds-31.jpg", "w4", "Evening celebration")}
        ${g("domantas", "ds-34.jpg", "w4", "Details at night")}
        ${g("domantas", "ds-37.jpg", "w4", "The last dance")}
      </div>
    </div>
  </section>

${next("jacqueline-gordon.html", "Jacqueline &amp; Gordon")}`,
});

/* ============================== JACQUELINE & GORDON ============================== */
pages["jacqueline-gordon.html"] = shell({
  page: "jacky",
  title: "Jacqueline & Gordon — A St-Tropez Wedding Unlike Any Other | Chromata Films",
  description: "Five days on the French Riviera: fashion shows, drone spectacles, fireworks and a sunrise after-party. Jacqueline and Gordon's St-Tropez wedding, filmed by Chromata Films.",
  main: `  <section class="page-hero" data-theme="dark">
    <div class="page-hero__bg">
      <img src="assets/img/jacky/jacky-header.jpg" alt="Jacqueline and Gordon — wedding celebration in St-Tropez" fetchpriority="high" />
    </div>
    <div class="page-hero__content">
      <p class="kicker line-mask"><span class="line-inner">Real Wedding · French Riviera</span></p>
      <h1 class="page-hero__title">
        <span class="line-mask"><span class="line-inner">Jacqueline <em>&amp;</em> Gordon</span></span>
      </h1>
      <div class="page-hero__sub">
        <span>Le Beauvallon · St-Tropez</span>
        <span>Five days · June 2025</span>
        <span>One word: WOW</span>
      </div>
    </div>
  </section>

  <section class="pad-section" style="padding-bottom:0" data-section>
    <div class="container">
      <p class="kicker">— The Film</p>
      <div class="mat" style="position:relative; aspect-ratio:16/9; background:#000; margin-top:4vh">
        <iframe data-lazy-src="https://player.vimeo.com/video/1117935629" title="Jacqueline &amp; Gordon — Wedding Film Highlight" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute; inset:0; width:100%; height:100%; border:0"></iframe>
      </div>
    </div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <p class="kicker">— The Story</p>
      <div class="feature__grid" style="margin-top:5vh">
        <div class="prose">
          <p class="lead">Jacqueline and Gordon's wedding in St-Tropez could be summarized in one simple word: WOW.</p>
          <p>Five days of celebration at Le Beauvallon, overlooking the bay of St-Tropez. Day one opened with a seaside dinner and a fashion show of designer collections, crowned by a drone light spectacle over the water. Day two honored Gordon's heritage with a traditional tea ceremony before flipping into a Bridgerton-meets-1980s party ... neon, vintage styling, and a dance floor with no mercy.</p>
          <p>Day three: rare wines and spirits tasted poolside, then a late night in a St-Tropez restaurant. Day four, the main event ... vows on the Beauvallon terrace above the sea, fireworks, a private concert, and an after-party that only surrendered at sunrise. Day five ended the only way it could: a foam party at the pool.</p>
          <p>Alongside the planning of <a class="text-link" href="https://rendezvousinparis.com" target="_blank" rel="noopener">Rendez-vous in Paris</a>, the florals and décor of Reverie d'Azur, entertainment by Black Rabbit Project and our friends at <a class="text-link" href="https://www.maddychristina.com" target="_blank" rel="noopener">Maddy Christina</a>, we filmed a celebration that refused to repeat itself for five straight days.</p>
        </div>
        <div class="feature__meta">
          <div class="row"><span>Venue</span><span class="val">Le Beauvallon, St-Tropez</span></div>
          <div class="row"><span>Duration</span><span class="val">Five days, June 2025</span></div>
          <div class="row"><span>Planning</span><span class="val"><a class="text-link" href="https://rendezvousinparis.com" target="_blank" rel="noopener">Rendez-vous in Paris</a></span></div>
          <div class="row"><span>Florals &amp; décor</span><span class="val">Reverie d'Azur</span></div>
          <div class="row"><span>Entertainment</span><span class="val">Black Rabbit Project</span></div>
          <div class="row"><span>Photography</span><span class="val"><a class="text-link" href="https://www.maddychristina.com" target="_blank" rel="noopener">Maddy Christina</a></span></div>
          <div class="row"><span>Film</span><span class="val">Chromata Films</span></div>
        </div>
      </div>
      <div class="feature__actions" style="margin-top:6vh">
        <a class="text-link" href="journal-jacqueline-gordon.html">Read the full story in the Journal →</a>
      </div>
    </div>
  </section>

  <section class="pad-section" style="padding-top:0" data-section>
    <div class="container">
      <p class="kicker">— The Wedding Day</p>
      <div class="gallery-grid" style="margin-top:5vh">
        ${g("jacky", "jg-01.jpg", "w12 wide", "The ceremony terrace above the bay of St-Tropez")}
        ${g("jacky", "jg-03.jpg", "", "The bride's entrance")}
        ${g("jacky", "jg-05.jpg", "", "Vows above the sea")}
        ${g("jacky", "jg-07.jpg", "w4", "Celebration details")}
        ${g("jacky", "jg-09.jpg", "w4", "The couple")}
        ${g("jacky", "jg-11.jpg", "w4", "Golden hour on the Riviera")}
        ${g("jacky", "jg-13.jpg", "w8", "The reception")}
        ${g("jacky", "jg-15.jpg", "w4", "Evening celebration")}
        ${g("jacky", "jg-18.jpg", "", "The party")}
        ${g("jacky", "jg-20.jpg", "", "Fireworks over Le Beauvallon")}
        ${g("jacky", "jg-23.jpg", "w12 wide", "The dance floor at full tilt")}
        ${g("jacky", "jg-25.jpg", "w4", "Into the night")}
        ${g("jacky", "jg-27.jpg", "w4", "The after-party")}
        ${g("jacky", "jg-29.jpg", "w4", "Until sunrise")}
      </div>
    </div>
  </section>

${next("anna-andres.html", "Anna Andres")}`,
});

/* ============================== ANNA ANDRES ============================== */
pages["anna-andres.html"] = shell({
  page: "anna",
  title: "Anna Andres — A Wedding Shot Like an Editorial | Chromata Films",
  description: "The wedding of Anna Andres, Miss Universe Ukraine 2014 — filmed by Chromata Films with the pace of a fashion editorial and the heart of a love story.",
  main: `  <section class="page-hero" data-theme="dark">
    <div class="page-hero__bg">
      <img src="assets/img/anna/anna-header.jpg" alt="Anna Andres wedding — editorial bridal portrait" fetchpriority="high" />
    </div>
    <div class="page-hero__content">
      <p class="kicker line-mask"><span class="line-inner">Real Wedding · Miss Universe Ukraine</span></p>
      <h1 class="page-hero__title">
        <span class="line-mask"><span class="line-inner">Anna <em>Andres</em></span></span>
      </h1>
      <div class="page-hero__sub">
        <span>Miss Universe Ukraine 2014</span>
        <span>Editorial cinematography</span>
        <span>Film — Chromata Films</span>
      </div>
    </div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <p class="kicker">— The Story</p>
      <div class="feature__grid" style="margin-top:5vh">
        <div class="prose">
          <p class="lead">When a Miss Universe titleholder plans her wedding, the bar is not "beautiful". The bar is "cover story".</p>
          <p>Anna Andres ... Miss Universe Ukraine 2014, model and actress ... trusted us to film her wedding with the same visual intelligence as the editorials she has graced. We treated every setup like a page of a magazine: composed, lit, and directed ... then we let the day breathe and caught what no director could stage.</p>
          <p>With the planning of <a class="text-link" href="https://www.palazzoeventi.com" target="_blank" rel="noopener">Palazzo Eventi</a>, the result is a film that moves between fashion and feeling: couture in golden light, a ceremony that stopped the room, and a celebration carried long into the night. It remains one of the projects that best defines what we mean by the French touch ... editorial polish wrapped around raw, real emotion.</p>
        </div>
        <div class="feature__meta">
          <div class="row"><span>Bride</span><span class="val">Anna Andres</span></div>
          <div class="row"><span>Title</span><span class="val">Miss Universe Ukraine 2014</span></div>
          <div class="row"><span>Planning</span><span class="val"><a class="text-link" href="https://www.palazzoeventi.com" target="_blank" rel="noopener">Palazzo Eventi</a></span></div>
          <div class="row"><span>Style</span><span class="val">Editorial · fashion film</span></div>
          <div class="row"><span>Film</span><span class="val">Chromata Films</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="pad-section" style="padding-top:0" data-section>
    <div class="container">
      <p class="kicker">— Frames</p>
      <div class="gallery-grid" style="margin-top:5vh">
${Array.from({ length: 12 }, (_, i) => `        ${g("anna", "an-" + String(i + 1).padStart(2, "0") + ".jpg", "", "Anna Andres wedding — Hôtel du Cap-Eden-Roc")}`).join("\n")}
      </div>
    </div>
  </section>

${next("russell-westbrook.html", "Russell &amp; Nina Westbrook")}`,
});

/* ============================== THE STUDIO ============================== */
pages["the-studio.html"] = shell({
  page: "studio",
  title: "The Studio — Chromata Films | Award-Winning Wedding Cinematography Team",
  description: "Meet the Chromata Films team: Kevin Lopez, Laura Lopez, Stephane Maurin and Michael Bod — Hollywood VFX pedigree in service of your wedding film.",
  main: `  <section class="film film--header vignette" data-theme="dark" aria-label="The Studio — cinematic header">
    <video src="assets/video/studio-header.mp4" poster="assets/video/studio-header-poster.jpg"
           muted loop playsinline autoplay data-ambient data-preload-track></video>
    <div class="film__shade"></div>
    <div class="hero__head">
      <p class="kicker" style="color:var(--coral)">— The Studio</p>
      <h1 class="hero__title hero__title--page">
        <span class="line-mask intro-rise"><span class="line-inner">Where the French Touch</span></span>
        <span class="line-mask intro-rise"><span class="line-inner">meets <em>Modern Elegance</em></span></span>
      </h1>
      <p class="intro-fade" style="font-size:12px; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,249,240,0.8)">Cinematography · VFX · 16mm film · Aerial</p>
    </div>
    <div class="hero__scroll intro-fade"><span class="lbl">Scroll</span><span class="line"><i></i></span></div>
  </section>

  <section class="on-sky pad-section" data-section>
    <div class="container">
      <p class="kicker">— The Philosophy</p>
      <h2 class="display-lg" style="margin-top:3vh; max-width:14em; color:var(--citrus)">
        <span class="line-mask"><span class="line-inner">Visual narratives,</span></span>
        <span class="line-mask"><span class="line-inner">not <em>documentation</em></span></span>
      </h2>
      <div class="manifesto__row">
        <div class="manifesto__row-inner">
          <p class="body-copy">Chromata Films collaborates with premium vendors to create unforgettable wedding experiences. We produce films that transcend ordinary wedding videography through meticulous craftsmanship and French-inspired sophistication ... authentic storytelling that captures raw emotion and genuine interaction, in a relaxed environment where you can simply be yourselves.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <p class="kicker">— The Team</p>
      <div class="team" style="margin-top:6vh">
        <article class="team__card">
          <figure class="portrait mat img-reveal"><img src="assets/img/studio/studio-01.jpg" alt="Kevin Lopez — Co-founder and Film Director" loading="lazy" style="object-position:50% 20%"></figure>
          <span class="role">Co-Founder · Film Director</span>
          <h3>Kevin Lopez</h3>
          <p>Director, cinematographer and VFX artist. Vancouver Film School graduate with a decade of visual-effects expertise from major studios, and nine years documenting some of the world's most extraordinary weddings across five continents. Kevin leads complex, multi-day productions and guides the team through every frame. Father of two.</p>
        </article>
        <article class="team__card">
          <figure class="portrait mat img-reveal"><img src="assets/img/studio/studio-02.jpg" alt="Laura Lopez — Co-founder and Marketing Manager" loading="lazy" style="object-position:50% 15%"></figure>
          <span class="role">Co-Founder · Operations &amp; Marketing</span>
          <h3>Laura Lopez</h3>
          <p>Master in Communication and Finance, formerly at Publicis and Mediacom ... planning promotional campaigns and driving client decisions. Wife, mother, children's book author, and the person who keeps every Chromata production (and vendor relationship) running with elegance and warmth, from first inquiry to final delivery.</p>
        </article>
        <article class="team__card">
          <figure class="portrait mat img-reveal"><img src="assets/img/studio/stephane.jpg" alt="Stephane Maurin — licensed drone pilot" loading="lazy"></figure>
          <span class="role">Aerial Cinematography · FPV Pilot</span>
          <h3>Stephane Maurin</h3>
          <p>Licensed aerial cinematographer with permits to fly across international locations including France, Italy, Croatia and the French Riviera. Stephane's FPV work threads through villas, over coastlines and into ballrooms ... the shots that make audiences ask "how?"</p>
        </article>
        <article class="team__card">
          <figure class="portrait mat img-reveal"><img src="assets/img/studio/michael.jpg" alt="Michael Bod — 16mm film and portrait expert" loading="lazy"></figure>
          <span class="role">16mm Film · Portraiture</span>
          <h3>Michael Bod</h3>
          <p>Our 16mm film and portrait expert. Michael shoots true analog motion picture film ... grain, halation and all ... giving Chromata couples the option of a wedding film that looks and feels like it was pulled from a cinema archive, alongside portrait work with a painter's patience.</p>
        </article>
      </div>
    </div>
  </section>

  <!-- full-bleed ambient film band (3:1) between the team and the blockbusters -->
  <section class="videoband" data-theme="dark" data-section aria-label="Chromata Films — studio banner film">
    <iframe data-lazy-src="https://www.youtube-nocookie.com/embed/TvG8udATApo?autoplay=1&mute=1&loop=1&playlist=TvG8udATApo&controls=0&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3&disablekb=1"
            title="Chromata Films — studio banner film" loading="lazy" allow="autoplay; encrypted-media"></iframe>
  </section>

  <section class="on-citrus pad-section" data-theme="dark" data-section>
    <div class="container">
      <p class="kicker">— The VFX Pedigree</p>
      <h2 class="display-lg" style="margin-top:3vh; max-width:14em; color:var(--ink)">
        <span class="line-mask"><span class="line-inner">From blockbusters</span></span>
        <span class="line-mask"><span class="line-inner">to your <em>first dance</em></span></span>
      </h2>
      <div class="feature__grid" style="margin-top:7vh">
        <div class="prose">
          <p>Before weddings, our team helped craft images for some of the biggest films ever made ... Star Wars, Beauty and the Beast, The Great Gatsby, Avengers. That training ... in light, composition, and invisible perfectionism ... is exactly what we bring to your wedding day. The same standards. The same tools. A far better leading couple.</p>
        </div>
        <div class="feature__meta">
          <div class="row"><span>01</span><span class="val">Star Wars — The Last Jedi</span></div>
          <div class="row"><span>02</span><span class="val">Beauty and the Beast</span></div>
          <div class="row"><span>03</span><span class="val">The Great Gatsby</span></div>
          <div class="row"><span>04</span><span class="val">Avengers — Infinity War</span></div>
          <div class="row"><span>05</span><span class="val">Fantastic Four</span></div>
          <div class="row"><span>06</span><span class="val">Solo: A Star Wars Story</span></div>
        </div>
      </div>
      <div class="posters" style="margin-top:9vh">
        <figure class="mat img-reveal"><img src="assets/img/blockbusters/star-wars.jpg" alt="Star Wars: The Last Jedi — poster" loading="lazy"></figure>
        <figure class="mat img-reveal"><img src="assets/img/blockbusters/beauty-beast.jpg" alt="Beauty and the Beast — poster" loading="lazy"></figure>
        <figure class="mat img-reveal"><img src="assets/img/blockbusters/gatsby.jpg" alt="The Great Gatsby — poster" loading="lazy"></figure>
        <figure class="mat img-reveal"><img src="assets/img/blockbusters/avengers.jpg" alt="Avengers: Infinity War — poster" loading="lazy"></figure>
        <figure class="mat img-reveal"><img src="assets/img/blockbusters/fantastic-four.jpg" alt="Fantastic Four — poster" loading="lazy"></figure>
        <figure class="mat img-reveal"><img src="assets/img/blockbusters/still.jpg" alt="Solo: A Star Wars Story — poster" loading="lazy"></figure>
      </div>
      <div style="display:flex; gap:clamp(30px,8vw,120px); flex-wrap:wrap; margin-top:10vh">
        <div><div style="font-family:var(--font-display); font-size:var(--display-md)"><span data-count="10">0</span>+</div><div style="font-size:11px; letter-spacing:0.26em; text-transform:uppercase; color:rgba(255,249,240,0.75)">Years of VFX expertise</div></div>
        <div><div style="font-family:var(--font-display); font-size:var(--display-md)"><span data-count="9">0</span></div><div style="font-size:11px; letter-spacing:0.26em; text-transform:uppercase; color:rgba(255,249,240,0.75)">Years of weddings</div></div>
        <div><div style="font-family:var(--font-display); font-size:var(--display-md)"><span data-count="5">0</span></div><div style="font-size:11px; letter-spacing:0.26em; text-transform:uppercase; color:rgba(255,249,240,0.75)">Continents</div></div>
        <div><div style="font-family:var(--font-display); font-size:var(--display-md)"><span data-count="22">0</span></div><div style="font-size:11px; letter-spacing:0.26em; text-transform:uppercase; color:rgba(255,249,240,0.75)">Years together, Kevin &amp; Laura</div></div>
      </div>
    </div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <p class="kicker">— Beyond the Frame</p>
      <h2 class="display-lg" style="margin-top:3vh; max-width:13em">
        <span class="line-mask"><span class="line-inner">We don't just film.</span></span>
        <span class="line-mask"><span class="line-inner">We <em>tell your story</em>.</span></span>
      </h2>
      <div class="prose" style="max-width:44em; margin-top:5vh">
        <p>Our vision goes beyond aesthetics. We believe in fostering genuine connections with our couples, ensuring you feel relaxed and comfortable throughout the filming process. This connection is what allows us to capture the raw emotions and authentic interactions that make your wedding day so special.</p>
        <p>Chromata Films goes beyond capturing moments ... we tell stories. We meticulously craft a narrative that reflects your unique journey, leaving you with a lasting visual memory you'll cherish for years to come.</p>
      </div>
      <div class="gallery-grid" style="margin-top:8vh">
${Array.from({ length: 6 }, (_, i) => `        ${g("studio", "illus-" + String(i + 1).padStart(2, "0") + ".jpg", "", "Chromata Films — behind the craft")}`).join("\n")}
      </div>
    </div>
  </section>`,
});

/* ============================== JOURNAL ============================== */
const posts = [
  {
    file: "journal-ai-masterclass.html", slug: "ai-masterclass",
    title: "AI Wedding Masterclass for Planners and Designers",
    date: "September 29, 2025", tag: "Masterclass",
    excerpt: "The wedding industry is experiencing a creative revolution through artificial intelligence ... and the professionals who embrace these tools are gaining a serious competitive advantage.",
    body: [
      "The wedding industry is experiencing a creative revolution through artificial intelligence, and the professionals who embrace these powerful tools are gaining a significant competitive advantage. After a decade in visual effects and nine years filming luxury weddings, we've watched AI move from novelty to genuine production tool ... and we believe planners and designers deserve to be in front of that curve, not behind it.",
      "In our masterclass, we show wedding professionals how to use AI imagery to sell a vision before a single flower is ordered: photoreal mood boards of a specific ballroom dressed three different ways, tablescape variations rendered in your client's actual venue, and lighting studies that let a couple see their reception at golden hour versus candlelight.",
      "The point is not to replace craft ... it is to communicate it. A planner who can show a client a believable image of the design in the actual space closes faster, aligns vendors sooner, and avoids the expensive misunderstandings that turn production weeks into fire drills.",
      "We also cover the boundaries: what AI is genuinely good at (concept, mood, iteration speed) and where it must never be used in our industry (representing another vendor's real work, or replacing real coverage of a real day). The couples hire us for truth, beautifully told ... AI helps us plan the telling.",
      "If you are a planner or designer curious about adding these tools to your studio, reach out ... we run sessions for teams and share the exact workflows we use at Chromata Films.",
    ],
  },
  {
    file: "journal-jacqueline-gordon.html", slug: "jacqueline-gordon",
    title: "Jacqueline and Gordon — A St-Tropez Experience Unlike Any Other",
    date: "September 17, 2025", tag: "Real Wedding",
    video: "1117935629",
    galleryDir: "jg-blog",
    gallery: Array.from({ length: 20 }, (_, i) => `jgb-${String(i + 1).padStart(2, "0")}.jpg`),
    excerpt: "Jacqueline and Gordon's wedding in St-Tropez could be summarized in one simple word: WOW.",
    body: [
      "Jacqueline and Gordon's wedding in St-Tropez could be summarized in one simple word: WOW. Five days of celebration at Le Beauvallon, each one designed to top the last.",
      "Day one began with a seaside dinner at the hotel, followed by a fashion show of designer collections and a drone light spectacle over the bay ... a welcome party that would have served most couples as a finale.",
      "Day two honored Gordon's Asian heritage with a traditional tea ceremony, before the evening flipped the register entirely: a party blending Bridgerton aesthetics with 1980s energy ... neon color, vintage styling, and dancing that did not pause for breath.",
      "Day three slowed the pace with tastings of rare wines and spirits from around the world, enjoyed poolside, before late-night celebrations took over a St-Tropez restaurant. Day four was the main event: the ceremony on the Beauvallon terrace overlooking the sea, then fireworks, a private concert, and an after-party that extended until sunrise. Day five closed the week the only way it could ... a foam party at the pool.",
      "That private concert was the best-kept secret of the whole week. Gordon surprised Jacqueline with a live performance by Bobby Brown and his group ... her favourite group of all time ... turning the special night into a moment neither of them, nor their guests, will ever forget.",
      "Enormous thanks to the creative team: planning and coordination by Heather, floral and décor design by Reverie d'Azur, entertainment by Black Rabbit Project, and our friends at Maddy Christina on the welcome event. Filming five days of this magnitude is a production in the fullest sense ... and exactly what this studio was built for.",
    ],
  },
  {
    file: "journal-westbrook-anniversary.html", slug: "westbrook",
    title: "Russell Westbrook and Nina Westbrook — Wedding Anniversary",
    date: "September 17, 2025", tag: "Celebration",
    excerpt: "Filming an anniversary celebration for Russell and Nina Westbrook ... proof that the best love stories deserve a sequel.",
    body: [
      "Some love stories deserve a sequel. When Russell and Nina Westbrook celebrated their wedding anniversary, we had the privilege of filming a party that carried all the emotion of a wedding day with the ease of a couple who have already proven everything to each other.",
      "Anniversary films are a different craft. There is no ceremony structure to lean on, no schedule of traditions ... just a family, their closest people, and an atmosphere that has to be caught rather than staged. It is pure documentary cinematography, elevated with the same fashion-film language we bring to our weddings.",
      "Working with athletes of Russell's stature means understanding both worlds: the public figure whose image is managed frame by frame, and the private man celebrating with his wife. The film lives in the second world ... and that trust is the real luxury of this work.",
      "To Russell and Nina: thank you for letting our cameras into a night that belonged entirely to you.",
    ],
  },
  {
    file: "journal-alexa-wilton.html", slug: "alexa-wilton",
    title: "A Riviera Fairytale: Alexa and Wilton's Extravagant St-Tropez Wedding",
    date: "July 20, 2024", tag: "Real Wedding",
    video: "1039575157",
    galleryDir: "aw-blog",
    gallery: Array.from({ length: 45 }, (_, i) => `aw-${String(i + 1).padStart(2, "0")}.jpg`),
    excerpt: "Dreaming of a destination wedding bathed in sunshine and luxury? Look no further than Alexa and Wilton's magical St-Tropez celebration by House of Kirschner.",
    body: [
      "Dreaming of a destination wedding bathed in sunshine and luxury? Look no further than Alexa and Wilton's magical St-Tropez celebration, designed by House of Kirschner ... a wedding that treated the Riviera itself as a set piece.",
      "From the first welcome aperitivo to the final sparkler exit, every element was composed like a page from a fashion editorial: couture gowns catching the Mediterranean light, tablescapes that could hang in a gallery, and a color story that moved from daylight ivory and champagne into the saturated golds and ambers of the Riviera night.",
      "For our cameras, St-Tropez is a gift that never repeats itself. The same bay reads differently at noon, at golden hour, and under fireworks ... and a multi-day celebration lets a film breathe through all of those temperatures.",
      "A wedding of this scale is always a team achievement. To House of Kirschner and every vendor who built this fairytale: bravo. Films like this one are why we call the French Riviera home ground.",
    ],
  },
  {
    file: "journal-parisian-dream.html", slug: "parisian-dream",
    title: "A Parisian Dream Tour: The Luxurious Wedding of J & A",
    date: "May 21, 2024", tag: "Real Wedding",
    excerpt: "Dreaming of a Parisian wedding overflowing with elegance, romance, and a touch of cinematic magic? Versailles and the Musée Rodin, in one unforgettable celebration.",
    body: [
      "Dreaming of a Parisian wedding overflowing with elegance, romance, and a touch of cinematic magic? J & A's celebration, orchestrated by Sumptuous Events, delivered exactly that ... a dream tour through the most storied venues in France.",
      "The celebration moved from the gardens of Versailles to the Musée Rodin in Paris, where the couple exchanged vows surrounded by sculpture and centuries of art. Filming in spaces like these demands the discretion of a documentary crew and the eye of a period drama ... nothing can be moved, everything must be honored, and the light does whatever the light wants.",
      "That constraint is precisely what makes Paris films extraordinary. When the ceremony backdrop is The Thinker and the reception glows under gilded boiserie, our work is to frame what is already perfect and wait for the human moments that make it personal: a father's hand tightening on a shoulder, a bride laughing mid-vow.",
      "To Sumptuous Events and the entire team: merci. This film sits among our favorite Parisian chapters ... and there have been many.",
    ],
  },
  {
    file: "journal-olympics-ai.html", slug: "olympics-ai",
    title: "Paris 2024 Olympics: A Wedding-Themed Extravaganza Brought to Life by AI",
    date: "April 29, 2024", tag: "AI · Editorial",
    excerpt: "The 2024 Olympics in Paris gearing up to be an extraordinary affair ... reimagined by Chromata Films as a wedding-themed visual extravaganza, entirely through AI.",
    body: [
      "The 2024 Olympics in Paris were gearing up to be an extraordinary affair, blending athleticism with a whimsical twist. As a studio obsessed with both Paris and spectacle, we asked ourselves a ridiculous question: what would the Games look like if they were a wedding?",
      "Using AI image generation, we built a full visual editorial: brides carrying the Olympic torch down the Champs-Élysées, grooms fencing in black tie, synchronized swimmers in tulle, and a stadium dressed like the world's largest ballroom. Absurd? Completely. Gorgeous? We think so too.",
      "Beyond the fun, this project was a serious technical exercise. Art-directing AI at editorial quality demands the same disciplines as a real shoot: consistent lighting logic, a coherent color story, wardrobe continuity, and ruthless curation. Of the thousands of frames generated, only a handful survived our edit ... the same ratio, honestly, as a real wedding day.",
      "This experiment became the seed of our AI masterclass for planners and designers. The tools are here; the taste is the differentiator. And taste, after a decade of film and VFX, is the one thing we never outsource.",
    ],
  },
];

/* ---- Historical journal archive (migrated from the original blog) ---- */
const archive = [
  /* ===================== Page 2 ===================== */
  {
    file: "journal-france-venues.html", page: 2, tag: "Guide",
    title: "Our Favourite Venues in the South of France", date: "April 22, 2024",
    excerpt: "Dreaming of a fairytale wedding bathed in the golden light of the French Riviera, or nestled amidst the lavender fields of Provence? A tour of our most enchanting venues to celebrate your love story.",
    body: [
      "Dreaming of a fairytale wedding bathed in the golden light of the French Riviera, or nestled amidst the lavender fields of Provence? This breathtaking region offers a symphony of romance, from sun-drenched coastlines to charming, rustic estates. Choosing the perfect venue can be overwhelming, so here are some of the most enchanting locations to celebrate your love story.",
      "Villa Ephrussi de Rothschild is a fairytale on the Côte d'Azur ... nine thematic gardens, each a masterpiece of colour and design, provide a magical backdrop for your ceremony. The Grand-Hôtel du Cap-Ferrat, a Four Seasons Hotel, answers with timeless elegance: a ceremony held in the central aisle with the sea beyond, and a party at the Club Dauphin around the pool that is very hard to top.",
      "Perched atop a hilltop village, the Bastide de Gordes offers panoramic views of the Luberon valley and the rustic elegance of a restored 17th-century farmhouse. Château Saint-Martin & Spa sits amid the rolling vineyards of Provence, its 12th-century courtyard opening onto a marquee built for the occasion. And for a truly grand affair, Château d'Estoublon, surrounded by olive groves and vineyards, offers a chapel, a garden reception, fireworks and a live band.",
      "Villa La Vigie brings Art Deco charm and panoramic views over the Baie des Anges, once home to Winston Churchill and Karl Lagerfeld ... the chic French Riviera style at its purest. And at the Hôtel du Cap-Eden-Roc, the famous aisle runs from the hotel down to the ceremony spot, the same setting Dior chose for its campaign with Natalie Portman.",
      "With its stunning scenery, exquisite venues and rich culture, Provence and the French Riviera offer the perfect setting for a wedding you and your guests will cherish forever. And if you need help planning your destination wedding, we know a few wedding planners who would be delighted to help.",
    ],
  },
  {
    file: "journal-sandra-pedro.html", page: 2, tag: "Real Wedding",
    title: "Sandra and Pedro — A Mixed-Religion Ceremony at Château d'Estoublon", date: "February 21, 2024",
    excerpt: "Sandra and Pedro's wedding at Château d'Estoublon, Provence ... vineyards, olive groves and a ceremony of exquisite taste.",
    body: [
      "Imagine exchanging vows amidst the sun-drenched vineyards of Provence, with olive tree fields stretching towards a horizon painted in vibrant hues. This captivating setting played host to Sandra and Pedro's unforgettable wedding celebration, a testament to exquisite taste and timeless elegance.",
      "Their journey began with a whimsical prelude at the breathtaking Les Carrières de Lumières in the Vaucluse, a former quarry turned immersive art exhibit, where guests were dazzled by projection shows and the magic of their story. The main celebration then unfolded at the majestic Château d'Estoublon, a renowned winery steeped in history and nestled amidst rolling hills.",
      "The team at Lavender and Rose, led by Kerry and Jennifer, orchestrated every aspect of the day with flawless precision. Bottega 53 photographed alongside our cameras, Floresie dressed the ceremony arches and reception tables in soft blooms, and Inspiration Live Music kept the bride and groom dancing among their closest friends all night.",
      "Sandra and Pedro's celebration at Château d'Estoublon was not just a luxurious event ... it was a symphony of love, laughter and breathtaking beauty, every detail chosen to create a day that will forever be etched in the memories of everyone present.",
    ],
  },
  {
    file: "journal-four-seasons-buyout.html", page: 2, tag: "Real Wedding",
    title: "A Four Seasons Buyout Wedding for the Most Amazing Celebrations", date: "November 4, 2023",
    excerpt: "S & A took over the entire Grand-Hôtel du Cap-Ferrat for a private celebration ... including a drone flight straight through the fireworks.",
    body: [
      "Last September, love took centre stage on the French Riviera as S & A exchanged vows at the Grand-Hôtel du Cap-Ferrat. This wasn't just any wedding ... the entire venue was exclusively theirs, transforming the luxurious gardens into a private haven for the couple and their guests.",
      "Planned by the talented team at Lavender and Rose, the buyout meant every moment was shared only with their closest ones. Our dear friends at Roni Floral and Deco Flamme transformed the venue into a fairytale dreamscape, every detail speaking to the couple's wish to create something truly unique.",
      "Capturing the day alongside us was the dynamic duo of Danilo and Sharon Studio, whose collaboration made everything easy to handle despite the weather. Drone06 added an aerial perspective with the Inspire 3 ... and yes, we flew a machine worth some 25k straight inside the fireworks.",
      "Out of respect for the couple's privacy, the visuals shared with the world are limited to the mesmerising decor and animations. That deliberate choice leaves an air of mystery ... a glimpse into a world of opulence, elegance and once-in-a-lifetime celebration.",
    ],
  },
  {
    file: "journal-daria-levin.html", page: 2, tag: "Real Wedding",
    title: "Daria Levin — A Crazy Circus Wedding in Èze, French Riviera", date: "October 17, 2023",
    excerpt: "Daria Levin turned an Èze villa into an incredible Jewish circus celebration ... acrobats, carnival games and non-stop music, by Cocoon Events.",
    body: [
      "Last summer, the French Riviera hosted an extraordinary celebration. Daria Levin chose an Èze villa for her special day and transformed it into an incredible Jewish circus celebration, filled with magic and memorable moments.",
      "Photographer German Larkin captured the event's vibrant atmosphere, documenting the bride's joy and her guests' celebrations throughout the evening. Cocoon Events, led by creative director Fabrice Orlando, managed every aspect of the planning and execution, with Deco Flamme handling the venue decor and Roni Floral Design creating elaborate installations throughout the space.",
      "Entertainment turned the night into an immersive experience ... Nuarts brought acrobatic and juggling performances, carnival games added a whimsical touch, and Inspiration Live Music energised the guests all evening. The result merged creative vision with floral design, entertainment and music into a distinctive celebration. A highlight film will follow.",
    ],
  },
  {
    file: "journal-natalia-montenegro.html", page: 2, tag: "Celebration",
    title: "Natalia's 50th Birthday Celebration in Montenegro", date: "September 27, 2023",
    excerpt: "A three-day 50th birthday celebration in Tivat, Montenegro ... luxury, Montenegrin hospitality and the Adriatic Sea as a backdrop.",
    body: [
      "Celebrating a milestone as significant as turning 50 deserves nothing less than an extravagant celebration, and that is exactly what Natalia experienced in Tivat, Montenegro. This picturesque coastal town, along the stunning Adriatic Sea, set the stage for an unforgettable three-day celebration that blended luxury, Montenegrin hospitality and a breathtaking backdrop.",
      "Under the expert guidance of Fabrice Orlando from Cocoon Events, no detail was spared. Guests indulged in a culinary journey showcasing Montenegro's finest cuisine and wines, all served in a spectacular setting. Roni Floral, who need no introduction, transformed the venue into a floral wonderland that harmonised perfectly with the Adriatic backdrop.",
      "Inspiration Live Music brought the party to life, and photographer Ettore Franceschi captured the joy, laughter and love that filled the air throughout. For those seeking the pinnacle of luxury celebrations and memories that last a lifetime, Tivat is an unparalleled destination. Not convinced? Have a look at the teaser ... and tell us that this was not the party of the year.",
    ],
  },
  {
    file: "journal-film-award.html", page: 2, tag: "Award",
    title: "Wedding Film Award Winner", date: "September 12, 2023",
    excerpt: "Chromata Films won Best Destination Wedding Film at the Love StoryTV Wedding Film Awards ... for a film shot at Lake Como.",
    body: [
      "Chromata Films won the prestigious Wedding Film Award for Best Destination Wedding Film on the Love StoryTV website. The recognition reflects our commitment to capturing couples' love stories around the world and creating lasting memories. The award-winning film was shot at Lake Como, Italy, featuring a couple celebrating their love with real elegance.",
      "The film's success came from the collaboration of an incredible team of vendors who helped realise the couple's vision. Winning this award speaks to excellence in cinematography, editing, storytelling, lighting, music and emotion ... every discipline that makes a wedding film resonate.",
      "For international couples, the award is a signal: that Chromata Films is a trusted partner for capturing the moments that matter. By investing time, creativity and genuine care into each project, we make films that authentically reflect a couple's love ... and set new standards in the destination wedding film industry.",
    ],
  },

  /* ===================== Page 3 ===================== */
  {
    file: "journal-puglia-princess.html", page: 3, tag: "Real Wedding",
    title: "A True Princess Wedding in Puglia", date: "September 9, 2023",
    excerpt: "Nadine and Albert's fairytale wedding in Puglia ... the Cathedral of Monopoli, the Rocco Forte Hotel, and a gown set with 500 Swarovski crystals.",
    body: [
      "The picturesque region of Puglia, Italy, has always been known for its captivating landscapes, charming villages and warm hospitality. On one beautiful summer's day it became the backdrop for something even more enchanting: the wedding of Nadine and Albert, from the luxurious Rocco Forte Hotel to the breathtaking Cathedral of Monopoli, planned by Event Boutique.",
      "The festivities began with a welcome event that transported guests straight to the Amalfi Coast. Sabine Koenigsberger turned the evening into a coastal paradise, with lemon trees and white flowers by Chiara Sperti setting a mood of romance and serenity as the sun dipped below the horizon.",
      "Then the wedding day arrived. Nadine was a vision of elegance in a gown adorned with 500 Swarovski crystals, the same shimmer gracing her 6-metre-long veil. The couple exchanged vows in the Cathedral of Monopoli, a historic gem, and the whole town seemed to come alive to celebrate their union.",
      "An opulent reception followed at the Rocco Forte Hotel, where Chiara Sperti's florals turned the space into a blooming garden. The live band Festival Mibely filled the air with energy, blending contemporary hits with timeless classics and keeping guests of all ages on their feet. In the heart of Puglia, love found its perfect stage.",
    ],
  },
  {
    file: "journal-katya-joey.html", page: 3, tag: "Real Wedding",
    title: "Katya and Joey — An Incredible Wedding at Villa Erba, Lake Como", date: "September 8, 2023",
    excerpt: "Katya and Joey's wedding at Villa Erba, Lake Como ... planned by Sacks Productions and Alejandra Poupel, filmed in anamorphic.",
    body: [
      "When it comes to capturing unforgettable moments of love and luxury, we have witnessed some of the most breathtaking weddings around the world. Katya and Joey's celebration at Villa Erba on Lake Como stands out as particularly special, a visual masterpiece made possible by an extraordinary team of vendors.",
      "It began with a welcome day at Lido di Lenno, where guests arrived by boat across the lake for an afternoon orchestrated by Alejandra Poupel and Sacks Productions. The welcome dinner at Villa Gastel followed, where floral designer Vincenzo Dascanio created lush arrangements beneath fairy lights, complemented by Italian cuisine and the villa's historic charm.",
      "Throughout the weekend our cameras captured the emotional moments while photographers from Bottega53 worked alongside us, and Gabriele Rizzi Lab provided captivating entertainment. To achieve a cinematic, anamorphic look we shot on the Kinefinity LF2 with Aivascope adapters and Mamiya lenses, while a DJI Inspire 3 drone captured Villa Erba from above.",
    ],
  },
  {
    file: "journal-angela-allister-brides.html", page: 3, tag: "Real Wedding · Press",
    title: "Angela and Allister — Featured in Brides", date: "May 10, 2023",
    excerpt: "Angela and Allister travelled from Vancouver to marry at the Ritz in Paris ... a luxurious affair featured in Brides.",
    body: [
      "Imagine a warm summer day in Paris, the city of love, where two souls from Vancouver, Angela and Allister, decided to celebrate their love in the most romantic way possible. Their wedding, featured in Brides, was a luxurious affair that left everyone in awe.",
      "The couple began their weekend with a trip on the Seine, followed by an editorial photo session near the Louvre, where Angela wore a stunning Berta dress, and a welcome dinner at Trocadéro with a view of the Eiffel Tower. The main event was their dream wedding at the Ritz, where Angela's exquisite Rime Arodaky gown perfectly complemented the elegant setting.",
      "Oliver Fly captured every magical moment. Loli Events planned the day flawlessly, Floraison Paris created breathtaking florals, Sublimes Paris brought lively can-can performances, and Bouchra Paris delivered a cake that looked as stunning as it tasted. As the sun set on their magical day, Angela and Allister's love story continued to unfold in the city of lights ... a true fairytale come to life.",
    ],
  },
  {
    file: "journal-anastasia-denis.html", page: 3, tag: "Real Wedding",
    title: "Anastasia and Denis — An Intimate Wedding on the French Riviera", date: "May 1, 2023",
    excerpt: "An intimate wedding on the sun-kissed shores of Cap-Ferrat ... the Four Seasons, a fireworks display, and a season opener to remember.",
    body: [
      "The sun-kissed shores of Cap-Ferrat provided the backdrop for an enchanting wedding celebration. Anastasia and Denis's intimate event took place at the luxurious Four Seasons Cap-Ferrat, with portions filmed in Monaco, and their love story was beautifully documented in collaboration with photographer Roman Ivanov. The hotel's Carolina and Margot delivered exceptional support throughout.",
      "As evening arrived, a fireworks display illuminated the night sky, adding a touch of glamour to the celebration. Anastasia and Denis showed gracious hospitality toward their guests, and their joy and devotion to one another created an infectious atmosphere throughout the event.",
      "The wedding marked a memorable beginning to the season, highlighting the French Riviera's scenic appeal and the Four Seasons' service standards ... proof of the power of love and the beauty of intimate celebrations, where two people united in commitment can create lasting memories against such a picturesque setting.",
    ],
  },
  {
    file: "journal-planning-europe.html", page: 3, tag: "Guide",
    title: "Planning Your Destination Wedding in Europe", date: "January 27, 2023",
    excerpt: "A short guide to planning your European destination wedding ... Italy, France and Spain, and why the film is the one souvenir that remains.",
    body: [
      "Are you and your partner searching for the perfect European destination to exchange your vows? Look no further than the charming, romantic countries of Italy, France and Spain. Each offers luxurious venues ... grand palaces, picturesque castles, beachfront villas ... alongside breathtaking landscapes, rich culture and ideal weather for a destination wedding.",
      "Italy offers the perfect blend of romance and grandeur, from the canals of Venice to a Tuscan villa overlooking the vineyards. France brings glamour and sophistication, whether in Paris or the coastal town of Nice. And Spain is ideal for a beach wedding, from the Costa del Sol to the Balearic Islands.",
      "While we specialise in high-end cinematography, we know that finding the right planner is crucial, which is why we work closely with a network of experienced and reputable wedding planners who can turn your dream into reality. The only thing that remains as a souvenir of your special day is the film and photography that capture those precious moments ... so surround yourself with true professionals.",
      "So what are the next steps? Start by researching the destinations and venues that fit your style, then reach out to us. We can help with the documentation of your big day and connect you with the right planner to bring your dream wedding to life.",
    ],
  },
  {
    file: "journal-ai-wedding-industry.html", page: 3, tag: "AI · Editorial",
    title: "Artificial Intelligence and Why It Will Change the Wedding Industry", date: "January 19, 2023",
    excerpt: "Why artificial intelligence will change the wedding industry ... an early look, written back in 2023, at the tools now reshaping planning and design.",
    body: [
      "If you are a wedding planner or designer (or both), it is essential to stay ahead of the curve and informed about the latest trends and technologies. One technology quickly gaining traction, and set to revolutionise the field, is artificial intelligence.",
      "One of the primary ways AI can help luxury planners and designers is by streamlining the planning and design process. AI-powered tools can automate many of the tedious, time-consuming tasks ... data entry, scheduling, budget management ... freeing up more time for creative work like designing custom themes and decor.",
      "AI can also help create truly personalised experiences. With virtual and augmented reality, planners can build immersive, interactive mock-ups of venues and designs, letting clients envision their day in a way that was previously impossible. And with the ability to analyse large amounts of data, AI can surface patterns and insights that are difficult to spot manually, from pricing to marketing.",
      "From virtual dress try-ons to AI-generated decor, customised lighting and virtual venues for remote celebrations, the applications keep growing. But the conclusion is simple: AI will only ever be a tool to propose something new in a more efficient way ... it still takes human professionals to execute a creative vision authentically.",
    ],
  },

  /* ===================== Page 4 ===================== */
  {
    file: "journal-jasmiina-tuukka.html", page: 4, tag: "Real Wedding",
    title: "Jasmiina and Tuukka Rask — The Most Elegant Wedding at Villa Balbiano, Lake Como", date: "December 9, 2022",
    excerpt: "Jasmiina and Tuukka Rask's most elegant wedding at Villa Balbiano, Lake Como ... fashion, glamour and a storybook garden ceremony.",
    body: [
      "We had the privilege of capturing an exceptionally luxurious wedding at Villa Balbiano on Lake Como. From the moment we arrived it was clear that meticulous attention had been devoted to creating an elegant event, one that reflected the couple's shared love of fashion and glamour.",
      "The ceremony took place in the villa's gardens, redesigned by Roni Floral Design into a storybook setting of flower-adorned archways. Guests then moved to the reception for an upscale dinner coordinated by Eventoile under planner Leandra's direction, with Inspiration Live Music keeping the dance floor alive all evening.",
      "Photographer Audrey from Les Secrets d'Audrey documented the day's most significant moments. Villa Balbiano and its vendor team are a wholehearted recommendation for any couple planning a grand celebration ... the kind of event guests will remember for a very long time. The full highlight film is in production, but a teaser is already out.",
    ],
  },
  {
    file: "journal-angela-allister-paris.html", page: 4, tag: "Real Wedding",
    title: "Angela and Allister — A Modern Wedding in Paris", date: "December 8, 2022",
    excerpt: "The same Vancouver couple, seen up close ... a modern Paris wedding at the Ritz, from a Seine cruise to a French cancan finale.",
    body: [
      "Have you ever imagined what Paris looks like in the summer, bathed in warmth and surrounded by the people you love, celebrating your love in the most romantic city in the world? That was exactly what Angela and Allister had in mind for their big day at the Ritz.",
      "Surrounded by their loved ones, they had the best time of their lives. They began the weekend with a trip on the Seine, an editorial photo session near the Louvre where Angela wore a stunning Berta dress, and a welcome dinner at Trocadéro with a view of the Eiffel Tower.",
      "They finished with the wedding of their dreams at the Ritz. With outstanding vendors such as Loli Events, Floraison Paris and Bouchra Sugar Design, plus makeup by Reina Kim, the day went off without a hitch. Jazz Around Midnight and a French cancan performance by Sublime Paris left everyone amazed, as did the breathtaking Ines Di Santo gown. But enough talking ... it's time to see it for yourself.",
    ],
  },
  {
    file: "journal-vaux-le-vicomte-royal.html", page: 4, tag: "Real Wedding",
    title: "A Royal Wedding at Vaux-le-Vicomte, Paris", date: "November 9, 2022",
    excerpt: "A royal wedding at Vaux-le-Vicomte, the little Versailles ... video-mapped walls, a secret VIP singer and a cake by Bastien Blanc Tailleur.",
    body: [
      "France is renowned for its culture and gastronomy, and for a wide range of spectacular venues ... museums, castles, palaces and more ... where some of the finest chefs will cook for you and your guests. We had the privilege of covering one such event.",
      "Working with Alejandra Poupel and Alexandra Juan from Artego Luxury Events sets a high standard from the start, and teaming up with our dear friend Maddy Christina for photography was the icing on the cake. Speaking of cake, the one by Bastien Blanc Tailleur was incredible on so many levels.",
      "The entertainment, decor, flowers by Roni Florals Design, VIP singers whose names we cannot disclose, an orchestra and video-mapping projected onto the walls all made the event exceptional. Everyone, from the bride to the oldest uncle, was impressed by what was accomplished in such an extraordinary venue.",
      "Vaux-le-Vicomte, known as the little Versailles, is one of the few places with so much history that can be privatised. If you are looking for the wow factor for your wedding, this is the place to go.",
    ],
  },
  {
    file: "journal-alexandra-raphael-marrakech.html", page: 4, tag: "Real Wedding",
    title: "Alexandra and Raphael — A Luxury Jewish Wedding in Marrakech", date: "October 31, 2022",
    excerpt: "Alexandra and Raphael's luxury Jewish wedding in Marrakech ... the Agafay desert, the Selman hotel, royal stallions and a pool party to remember.",
    body: [
      "Party would capture the essence of Alexandra and Raphael's wedding, held last summer in Morocco. The couple chose Marrakech, using both the Agafay desert and the luxurious Selman hotel for their events.",
      "A standout was the hotel's poolside gathering, where guests relaxed to panoramic views ... the venue lending a distinctive elegance through its collection of royal stallions, owned by Morocco's king.",
      "Fabrice Orlando from Cocoon Events directed the overall planning, while Roni Flora Design and Deco Flamme created elaborate floral and decorative installations, and Belathee Photography documented the occasion. Inspiration Live Music kept guests dancing throughout the reception.",
      "The production tested the whole team, but the effort was more than validated by the couple's enthusiasm and the value they placed on preserving these memories through the film we created for them.",
    ],
  },
  {
    file: "journal-jessica-benjamin.html", page: 4, tag: "Real Wedding",
    title: "Jessica and Benjamin — A Stylish Jewish Wedding at Hôtel Beauvallon", date: "October 15, 2022",
    excerpt: "Jessica and Benjamin's stylish Jewish wedding at Hôtel Beauvallon, near St-Tropez ... a two-day celebration and a Brazilian pool party.",
    body: [
      "This was the type of event everyone would have loved to be part of, whether as a guest or a vendor. Jessica and Benjamin were an absolute pleasure to work with, and their kindness did not go unnoticed. As bride and groom they knew they were in great hands with such an incredible team covering their day.",
      "More than anything, being surrounded by vendors you can count on is a must for your big day, and this team delivered. Imene from The Wedding Planners Monaco planned it like no one else: a two-day celebration in one of the seven palaces, with a gorgeous Jewish ceremony under a floral huppah beside the pool.",
      "From artistic performances by Artistes Kurioza Events to live music from the Vogue Live Band, stunning photography by Claire Morris and flowers and decor by Roni Florals Design and Deco Flamme, the bar was set very high. The first-day pool party, complete with Brazilian vibes, was the perfect way to welcome everyone.",
      "If you are considering St-Tropez for your wedding, take a look at the Beauvallon Hotel, with its luxurious accommodations and beautiful Belle Époque architecture.",
    ],
  },
  {
    file: "journal-ali-bakhtiar.html", page: 4, tag: "Celebration",
    title: "A Persian Wedding Anniversary at the Four Seasons, French Riviera", date: "October 9, 2022",
    excerpt: "A private Persian wedding anniversary at the Grand-Hôtel du Cap-Ferrat ... ultra-luxury on the French Riviera, closing at the Monaco Yacht Club.",
    body: [
      "We were immensely proud to document this event. Collaborating with Ali Bakhtiar's team to capture a wedding anniversary celebration was an honour that not many people can relate to. It was ultra-luxury at its finest, set at one of the most prestigious venues on the French Riviera ... the Grand-Hôtel du Cap-Ferrat, with its perfect location and breathtaking views over the Mediterranean.",
      "The celebration maintained strict privacy, with only limited behind-the-scenes content shared publicly. Photographer David Bastianoni and event organiser Nuart Events assembled a professional team for the production.",
      "The festivities extended across two days, with the second day's farewell lunch taking place at the Monaco Yacht Club. We invite you to watch the film to see the design execution and the work accomplished for this anniversary celebration.",
    ],
  },

  /* ===================== Page 5 ===================== */
  {
    file: "journal-elisa-thomas.html", page: 5, tag: "Real Wedding",
    title: "Elisa and Thomas — A Château Wedding on the French Riviera", date: "October 1, 2022",
    excerpt: "Three days at Château St Georges in Grasse ... Elisa and Thomas's French Riviera wedding, filmed with a team we know by heart.",
    body: [
      "Three days of celebration at Château St Georges in Grasse, near Cannes, where Elisa Meliani and Thomas exchanged vows. We captured the event ... and according to the bride, the resulting film exceeded her expectations.",
      "The production succeeded through collaboration with a seasoned team of vendors. Roni Florals handled the floral design, Deco Flamme managed the decor, and Aava Weddings coordinated the planning. When you work with teams you know by heart, things get even easier right away.",
      "The couple's willingness to participate authentically in the filming process contributed enormously to the quality of the footage, and Lost in Love Photography travelled from Australia to add their coverage of the celebration. We invite you to watch the wedding film.",
    ],
  },
  {
    file: "journal-hannah-lucas.html", page: 5, tag: "Real Wedding",
    title: "Hannah and Lucas — A British Wedding on the French Riviera", date: "October 1, 2022",
    excerpt: "The first wedding of the season ... Hannah and Lucas's British celebration at Villa Ephrussi, from a Monaco yacht to a farewell brunch.",
    body: [
      "When these two married on the French Riviera, it was our first wedding of the season. The opening event set such a high standard that keeping that level all summer would prove a challenge.",
      "Hannah and Lucas proved to be wonderful clients, and their generosity, along with that of their friends and families, made the whole experience delightful. Wedding planner Aava Weddings did exceptional work, and their partnerships with Roni Florals Design and Deco Flamme elevated the event considerably. Villa Ephrussi, combined with such sophisticated design, created an unforgettable setting.",
      "Over three days, our team, alongside photographer Cedric Klein, documented the celebration ... beginning at a private family yacht moored in Monaco and extending through a brunch at an exclusive Monaco location. We can't wait to share the final film.",
    ],
  },
  {
    file: "journal-alexandra-raphael-teaser.html", page: 5, tag: "Teaser",
    title: "Alexandra and Raphael — Wedding Teaser, Marrakech", date: "July 13, 2022",
    excerpt: "A first look at Alexandra and Raphael's Marrakech wedding ... a crazy adventure from France to Morocco, condensed into one teaser.",
    body: [
      "We guess the title says it all. Follow us on one crazy adventure from France to Morocco, from the desert of Agafay to the luxurious Selman Hotel, with amazing design by Fabrice Orlando from Cocoon Events, flowers by Roni Florals and technical production by Deco Flamme.",
      "What a three-day experience this was. We can't wait to show you more ... but for now, you will have to stick with this little teaser.",
    ],
  },
  {
    file: "journal-lauren-jonathan.html", page: 5, tag: "Real Wedding",
    title: "Lauren and Jonathan — A Wedding in the Dominican Republic, Altos de Chavón", date: "May 3, 2022",
    excerpt: "A transatlantic wedding at Altos de Chavón in the Dominican Republic ... Lauren and Jonathan's unforgettable start to the 2022 season.",
    body: [
      "Boom. If you had one word to remember from this wedding, that would be it. The couple invited us across the Atlantic to document their Dominican Republic celebration ... an exceptional start to the 2022 season.",
      "Beyond the visual beauty, we were struck by the genuine warmth of their loved ones and the affection that filled the event. The planning team at LS Planning, along with decorator Sarah from SMTroncoso, transformed the Altos de Chavón amphitheatre into an elegant setting for dining and dancing.",
      "We're grateful to photographer Tali for her collaborative spirit throughout the weekend, and to the newlyweds for their confidence, their friendship and the memorable celebration they created. All the best to you two ... enjoy the full wedding film.",
    ],
  },
  {
    file: "journal-giulietta-villa-cortine.html", page: 5, tag: "Editorial",
    title: "Giulietta Dreams — A Villa Cortine Story", date: "February 4, 2022",
    excerpt: "Four seasons in one day ... a dramatic styled shoot at Villa Cortine Palace Hotel, pulled off through sheer teamwork.",
    body: [
      "This was a wedding film shoot at the Villa Cortine Palace Hotel, where we faced four seasons happening in one day ... from cold and rainy to sunny and hot, and finally sunny with a storm rolling towards us.",
      "We're grateful to the venue for their hospitality and to their staff for the support throughout the production, and to the director and the whole team who made the day work despite the unpredictable weather.",
      "Photographer Maddy Christina, wedding planner Eleonora from Palazzo Eventi, our makeup artist, florist and entertainment by Visionairevents all contributed. Between us we managed to pull some incredible images out of that day ... and this film is the result of everyone's combined effort.",
    ],
  },
  {
    file: "journal-nida-sunny-highlight.html", page: 5, tag: "Real Wedding",
    title: "Nida and Sunny — Villa Erba, Lake Como, Highlight Film", date: "January 28, 2022",
    excerpt: "A wedding you could never forget ... Nida and Sunny at Villa Bonomi and Villa Erba, Lake Como, from Sangeet to a wild party night.",
    body: [
      "There are some weddings you could never forget, and Nida and Sunny's is clearly one of them. Their love, their families and friends, their kindness ... it was all perfect, as if it were meant to be.",
      "From the start of the weekend at Villa Bonomi, to a Bollywood-style Sangeet overlooking Lake Como, to a crazy party night at Villa Erba the day after, it was the wedding to be. Andrea from Italian Weddings and Events did fantastic work planning everything, while Thierry Joubert photographed the whole event beautifully. We didn't just enjoy working together ... we became friends, as if we'd known each other for years. That doesn't happen often.",
      "As always, Blunotte Eventi did a lovely job on the technical side, and Rattiflora delivered gorgeous flowers. So yes, it was incredible ... and the ride you'll get watching the highlight film only accentuates the story. Be prepared, because you are not ready for it.",
    ],
  },

  /* ===================== Page 6 ===================== */
  {
    file: "journal-sabonis-wedding.html", page: 6, tag: "Real Wedding",
    title: "Shashana and Domantas Sabonis — A Sensational Wedding in St-Jean-Cap-Ferrat", date: "January 28, 2022",
    excerpt: "Three days of magic in St-Jean-Cap-Ferrat ... the wedding of Shashana and NBA All-Star Domantas Sabonis, planned by Mindy Weiss.",
    body: [
      "The headline says it all ... the enchanting wedding of Shashana and Domantas Sabonis, the NBA All-Star, left us all in awe. Over three days the couple filled the air with love, beauty and unparalleled taste, looking remarkably fresh and elegant despite the scorching heat.",
      "Their guests, families and friends were pivotal in making it unforgettable, always ready to dance, sing and even jet ski. The wedding was meticulously planned and executed by the incredibly talented Mindy Weiss and her team, with special mentions to Meg and Melissa, and a huge shout-out to the Four Seasons Cap-Ferrat for their warm hospitality.",
      "Villa Ephrussi, a venue that needs no introduction, was the perfect setting. The colour palette by Roni Floral Design matched the stunning decor they built with Deco Flamme, and Maddy Christina saved the day on photography. The grand finale was a wild party by the Vogue Live band, with entertainment by Artiste Kurioza Events.",
      "If you are looking for the perfect destination wedding in France, and especially on the French Riviera, this might be your best source of inspiration yet. Grab your TV, set the sound to max, and let the magic unfold.",
    ],
  },
  {
    file: "journal-michal-steve.html", page: 6, tag: "Real Wedding",
    title: "Michal and Steve — A St-Tropez Love Story", date: "November 29, 2021",
    excerpt: "A full weekend in St-Tropez ... Michal and Steve's love story at Le Beauvallon, and a party that had to be seen to be believed.",
    body: [
      "What could be more enjoyable than celebrating a wedding over a full weekend in St-Tropez? We struggle to find anything comparable. This was an exceptional wedding with an outstanding venue.",
      "Moments like this are exactly why we do what we do ... spending quality time with incredible people at meaningful events. We stayed in St-Tropez, that iconic French Riviera destination, collaborating with KBY Designs and planner Muriel Saldalamacchia, alongside photographer David Bastianoni, and we loved the architecture of Le Beauvallon.",
      "Jewish weddings are known for great parties, but this one ... well, you'll just have to see for yourselves. It was mindblowing, with remarkable energy, mood and colour, enhanced by a performance from Festival Band Paris. An absolute blast. Better be prepared, because this is going to be quite a ride.",
    ],
  },
  {
    file: "journal-nida-sunny-teaser.html", page: 6, tag: "Teaser",
    title: "Nida and Sunny — Villa Erba, Lake Como, Teaser", date: "November 2, 2021",
    excerpt: "Party. A first taste of Nida and Sunny's Lake Como wedding ... dance competitions, vibrant decor and non-stop celebration.",
    body: [
      "Party. That would be the headline of the amazing celebration we witnessed and captured in Como last September. Guests of all ages threw themselves into the dancing, from dance competitions to group performances, amid vibrant decorations throughout.",
      "Our thanks go to Andrea from Italian Weddings and Events for the organisation, to Villa Bonomi and Villa Erba for their hospitality, to the couple for their cooperation during filming, and to photographer Thierry Joubert for his expertise and friendship.",
      "Enjoy the teaser while we finish the full highlight film ... it's coming soon.",
    ],
  },
  {
    file: "journal-sabonis-teaser.html", page: 6, tag: "Teaser",
    title: "Shashana and Domantas Sabonis — Wedding Teaser, Cap-Ferrat", date: "October 21, 2021",
    excerpt: "If you're an NBA fan, you don't need to read further ... a first clip from Shashana and Domantas Sabonis's Cap-Ferrat wedding.",
    body: [
      "If you are an NBA fan, you probably don't need to read any further ... just go straight to the video.",
      "But if you want to know a bit more about Shashana and Domantas's wedding in the south of France, you are in the right place. This wedding is clearly one of the highlights of our season, and with Mindy Weiss responsible for the planning and design, we could not have been in better hands.",
      "That three-day weekend will be remembered for a long time, not only because it was absolutely beautiful, but because of everything that happened: the couple's kindness, the craziness of their guests, the different venues, the behind-the-scenes moments. It's a complete package ... and you'll understand why just by watching this clip.",
    ],
  },
  {
    file: "journal-d-a-villa-bonomi.html", page: 6, tag: "Real Wedding",
    title: "D and A — A Wedding at Villa Bonomi, Lake Como", date: "July 13, 2021",
    excerpt: "One of the best ways to start a season ... D and A's intimate wedding at the newly renovated Villa Bonomi, Lake Como.",
    body: [
      "This was certainly one of the best ways to start the wedding season. Going to Como to celebrate D and A's love, surrounded by their families and friends, was nothing short of a blessing after such a long period of Covid.",
      "The organisation and design by Das Hochzeitswerk was on point, with beautiful greenery for both the ceremonies and the reception under the tent, and Weds4U did great work putting that design in place. The result was a very intimate cocoon in which to celebrate love across a beautiful weekend, all despite the weather.",
      "The newly renovated Villa Bonomi is a gem hidden on the lake, and shooting the first wedding held there was a great opportunity. Inspiration Live Music killed the game once again with fantastic performers and lighting, and Nuart Events brought a show that is always a feast for the eyes. We can't wait to see what Bottega53 came up with on photography. So sit back, relax, and enjoy this destination wedding film.",
    ],
  },

  /* ===================== Page 7 ===================== */
  {
    file: "journal-anna-andres-eden-roc.html", page: 7, tag: "Real Wedding",
    title: "Anna Andres and David — A French Riviera Escapade at Hôtel du Cap-Eden-Roc", date: "October 9, 2020",
    excerpt: "Anna Andres and David's intimate August wedding at Hôtel du Cap-Eden-Roc ... a Riviera escapade that made international headlines.",
    body: [
      "Anna Andres and David had originally planned to marry at Château St Martin in May, but the pandemic restrictions forced a change. Instead, they celebrated with an intimate August ceremony at the Hôtel du Cap-Eden-Roc on the French Riviera.",
      "The venue offered distinctive scenery and ambiance, enhanced by beautiful floral design. Event planner Viktoria coordinated the celebration, while our cameras and the photographers documented the day.",
      "The wedding went on to attract significant media attention, appearing in several prestigious international publications. And the bigger wedding coming the following year promised to be just as fantastic ... with a lot of fun to be had along the way.",
    ],
  },
  {
    file: "journal-samantha-edoardo.html", page: 7, tag: "Real Wedding",
    title: "Samantha and Edoardo — From Switzerland to Provence", date: "October 7, 2020",
    excerpt: "A bit of light in a difficult year ... Samantha and Edoardo's wedding at Château de Berne, from Switzerland to Provence.",
    body: [
      "Let's be honest: 2020 was one of the toughest years in memory. And yet, even then, there was still a bit of light somewhere ... something to make you smile and bring back some hope. Samantha and Edoardo's wedding was clearly one of those moments.",
      "They had been through so much, from a delayed wedding to sanitary restrictions and the possibility of not having everyone they love attend. But it finally happened, and it was absolutely worth it. So much fun, so much love. For several days, nobody thought about the situation outside ... it was only them and their guests, celebrating love.",
      "Under the planning of White Label Events, everything happened just as it should, with Liz rising above every difficulty. Sandra Aberg documented the day with fantastic imagery, Benjamin from Selecktive created a ceiling full of stars for the dinner reception and DJed the party, and Vogue Live Band brought everyone onto the dance floor. That wedding at Château de Berne stands as a highlight of the year, reminding us exactly why we film weddings.",
    ],
  },
  {
    file: "journal-private-shooting-cap-ferrat.html", page: 7, tag: "Experience",
    title: "Private Shooting Exclusivity in St-Jean-Cap-Ferrat", date: "September 3, 2020",
    excerpt: "A new kind of shoot ... documenting a couple's private stay at the Grand-Hôtel du Cap-Ferrat, with photography and cinematography together.",
    body: [
      "As you may know, we've become quite used to going to the Grand-Hôtel in Cap-Ferrat. From that experience we realised there was a real demand to document people's stays in this incredible palace on the French Riviera.",
      "While most people reach for their phone to capture these moments, the quality will never match a real photography and cinematography team. That's why we partnered with Maddy Christina to propose something unique in the region: documenting your stay at the hotel while you enjoy its finest moments.",
      "From a massage to waking up in front of the gardens, from visiting the small villages nearby to a proposal over dinner facing the sea, you can have it all. With exclusive packages built around the hotel's activities, you not only enjoy it to the fullest ... you keep the perfect images to remember it. This is the result of our first shoots with real couples during their stay.",
    ],
  },
  {
    file: "journal-mozzafiato.html", page: 7, tag: "Campaign",
    title: "Mozzafiato — A Grand-Hôtel du Cap-Ferrat Story with Dolce &amp; Gabbana", date: "August 13, 2020",
    excerpt: "Mozzafiato ... a Grand-Hôtel du Cap-Ferrat campaign with Dolce & Gabbana, six weeks in the making for a story of palace, yacht and couture.",
    body: [
      "This is the story of a couple deciding to formalise their long-term relationship with marriage, celebrating in Cap-Ferrat. The location offers everything ... palatial accommodation, quaint villages, yacht excursions and private pool moments.",
      "The production was a collaborative campaign with the Grand-Hôtel du Cap-Ferrat, a Four Seasons Hotel, and Dolce & Gabbana. The France director visited during filming, underscoring how significant the project was. What began as a two-day shoot grew into six weeks of planning, from art direction and location scouting to yacht coordination and early editing.",
      "This was a small-crew production where meticulous planning preceded execution. Collaborating with photographer Emmanuelle Marty was seamless, and support from the Four Seasons team, especially Aurélien Guery, kept everything running smoothly. We shot on the Sony FX9. Our thanks to all who contributed ... models, stylists, florists, decorators, hair and makeup artists and crew. Enjoy the film and the photography gallery.",
    ],
  },
  {
    file: "journal-dolce-gabbana-teaser.html", page: 7, tag: "Teaser",
    title: "Grand-Hôtel du Cap-Ferrat × Dolce &amp; Gabbana — Teaser", date: "August 7, 2020",
    excerpt: "Think French Riviera, palace, yacht, Dolce & Gabbana ... a short teaser before the full Mozzafiato film.",
    body: [
      "It's always a good time to get teased a little, to think about what's coming next. Think French Riviera, palace, yacht, Dolce & Gabbana. Starting to see the bigger picture?",
      "Well, to make sure you do, enjoy this little teaser ... before we show you the final film, coming soon.",
    ],
  },
  {
    file: "journal-o-my-gaude.html", page: 7, tag: "Editorial",
    title: "Ô My Gaude — A Couture Shooting in Provence", date: "August 7, 2020",
    excerpt: "Ô My Gaude ... a distinctive couture shooting at Château de la Gaude in Provence, with two gorgeous Ziad Nakad gowns.",
    body: [
      "Ô My Gaude is something truly distinctive. This project brought real joy after the challenging pandemic period, and it proved intriguing, revealing all sorts of happenings orchestrated at the venue.",
      "Stephanie from WEP coordinated the shoot masterfully, while Les Secrets d'Audrey and our team captured the moments. Our thanks go to Château de la Gaude for their hospitality and for transforming the space into an enchanting setting, and to Benjamin from Selecktive, who made the celebration in the wine cellar possible.",
      "We're also grateful to designer Ziad Nakad for two of the most gorgeous couture gowns, showcased throughout the shoot. There's an intriguing surprise waiting in the final film ... and a long list of collaborators, from organisation and photography to floristry, makeup, catering and technical production, who made this couture editorial in Provence come to life.",
    ],
  },
];

/* Page 1 = the six current posts; pages 2–7 = the migrated archive. */
const allPosts = [...posts.map((p) => ({ ...p, page: 1 })), ...archive];

const JOURNAL_PAGES = 7;
const journalHref = (n) => (n === 1 ? "journal.html" : `journal-${n}.html`);

const pagination = (cur) => {
  const nums = [];
  for (let i = 1; i <= JOURNAL_PAGES; i++) {
    nums.push(i === cur
      ? `<span class="jpage jpage--current" aria-current="page">${i}</span>`
      : `<a class="jpage" href="${journalHref(i)}">${i}</a>`);
  }
  const prev = cur > 1
    ? `<a class="jpage jpage--edge" href="${journalHref(cur - 1)}" rel="prev">← Newer</a>`
    : `<span class="jpage jpage--edge is-disabled">← Newer</span>`;
  const nextL = cur < JOURNAL_PAGES
    ? `<a class="jpage jpage--edge" href="${journalHref(cur + 1)}" rel="next">Older →</a>`
    : `<span class="jpage jpage--edge is-disabled">Older →</span>`;
  return `      <nav class="pagination" aria-label="Journal pages">
        ${prev}
        <div class="pagination__nums">${nums.join("")}</div>
        ${nextL}
      </nav>`;
};

for (let pg = 1; pg <= JOURNAL_PAGES; pg++) {
  const pagePosts = allPosts.filter((p) => p.page === pg);
  const first = pg === 1;
  pages[journalHref(pg)] = shell({
    page: "journal",
    title: first
      ? "Journal — Chromata Films | Latest News & Real Weddings"
      : `Journal (Page ${pg}) — Chromata Films | Real Weddings & Stories`,
    description: first
      ? "Latest news from Chromata Films: real weddings in St-Tropez and Paris, AI masterclasses for planners, and stories from the world of luxury wedding cinematography."
      : "From the archives of Chromata Films: real weddings, celebrations and stories across the French Riviera, Paris, Lake Como and beyond.",
    main: `  <section class="film film--header vignette" data-theme="dark" aria-label="Journal — cinematic header">
    <video src="assets/video/journal-header.mp4" poster="assets/video/journal-header-poster.jpg"
           muted loop playsinline autoplay data-ambient data-preload-track></video>
    <div class="film__shade"></div>
    <div class="hero__head">
      <p class="kicker" style="color:var(--coral)">${first ? "— Latest News" : "— The Archives"}</p>
      <h1 class="hero__title hero__title--page">
        <span class="line-mask intro-rise"><span class="line-inner">The <em>Journal</em></span></span>
      </h1>
    </div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <div class="journal-list">
${pagePosts.map((p) => `        <a class="jitem" href="${p.file}">
          <span class="jdate">${p.date}</span>
          <h2>${p.title}</h2>
          <span class="jarrow">→</span>
          <p class="jexcerpt">${p.excerpt}</p>
          <span class="jtag">${p.tag}</span>
        </a>`).join("\n")}
      </div>
${pagination(pg)}
    </div>
  </section>${first ? `

  <!-- full-bleed ambient film band (3:1) at the foot of the journal -->
  <section class="videoband" data-theme="dark" data-section aria-label="Chromata Films — Mozzafiato banner film">
    <iframe data-lazy-src="https://www.youtube-nocookie.com/embed/brZ8vlqwOVY?autoplay=1&mute=1&loop=1&playlist=brZ8vlqwOVY&controls=0&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3&disablekb=1"
            title="Chromata Films — banner film" loading="lazy" allow="autoplay; encrypted-media"></iframe>
  </section>` : ""}`,
  });
}

for (const p of allPosts) {
  pages[p.file] = shell({
    page: "journal",
    title: `${p.title} — Journal | Chromata Films`,
    description: p.excerpt,
    main: `  <section class="pad-section" style="padding-top:calc(var(--nav-h) + 8vh)" data-section>
    <div class="container">
      <article class="article">
        <p class="kicker">— Journal · ${p.tag}</p>
        <h1 class="display-md" style="margin-top:3vh">
          <span class="line-mask"><span class="line-inner">${p.title}</span></span>
        </h1>
        <div class="article__meta"><span>${p.date}</span><span>By Kevin Lopez</span></div>
      </article>
${p.video ? `      <figure class="article__film mat">
        <div class="article__film-frame">
          <iframe data-lazy-src="https://player.vimeo.com/video/${p.video}" title="${p.title} — wedding film" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
        </div>
      </figure>
` : ""}      <article class="article">
        <div class="prose">
${p.body.map((par) => `          <p>${par}</p>`).join("\n")}
        </div>
        <div style="margin-top:8vh; display:flex; gap:30px; flex-wrap:wrap">
          <a class="text-link" href="${journalHref(p.page)}">← Back to the Journal</a>
          <a class="text-link" href="contact.html">Begin your journey →</a>
        </div>
      </article>
${p.gallery ? `      <div class="gallery-grid article__gallery">
${p.gallery.map((f) => "        " + g(p.galleryDir, f, "", p.title + " — Chromata Films")).join("\n")}
      </div>
` : ""}    </div>
  </section>`,
  });
}

/* ============================== GALLERY ============================== */
const galleryImgs = [
  ["c-01.jpg", "w12 wide"], ["c-03.jpg", ""], ["c-05.jpg", ""], ["c-06.jpg", "w4"], ["c-08.jpg", "w4"], ["c-09.jpg", "w4"],
  ["c-11.jpg", "w8"], ["c-12.jpg", "w4"], ["c-14.jpg", ""], ["c-15.jpg", ""], ["c-17.jpg", "w12 wide"],
  ["c-18.jpg", "w4"], ["c-20.jpg", "w4"], ["c-22.jpg", "w4"], ["c-23.jpg", ""], ["c-25.jpg", ""],
  ["c-27.jpg", "w4"], ["c-29.jpg", "w4"], ["c-30.jpg", "w4"], ["c-32.jpg", "w12 wide"],
  ["c-34.jpg", ""], ["c-35.jpg", ""], ["c-38.jpg", "w4"], ["c-39.jpg", "w4"], ["c-40.jpg", "w4"],
  ["c-42.jpg", "w8"], ["c-44.jpg", "w4"], ["c-46.jpg", ""], ["c-49.jpg", ""], ["c-51.jpg", "w12 wide"],
];
pages["gallery.html"] = shell({
  page: "gallery",
  title: "Gallery — Chromata Films | Luxury Wedding Cinematography Worldwide",
  description: "A gallery of films and frames from Chromata Films weddings across the French Riviera, Lake Como, St Moritz, Santorini and beyond.",
  main: `  <section class="page-hero page-hero--full" data-theme="dark">
    <div class="page-hero__bg">
      <video src="assets/video/gallery-header.mp4" poster="assets/video/gallery-header-poster.jpg"
             muted loop playsinline autoplay data-ambient data-preload-track></video>
    </div>
    <div class="page-hero__content">
      <p class="kicker line-mask"><span class="line-inner">Portfolio</span></p>
      <h1 class="page-hero__title"><span class="line-mask"><span class="line-inner">The <em>Gallery</em></span></span></h1>
      <div class="page-hero__sub"><span>French Riviera</span><span>Lake Como</span><span>St Moritz</span><span>Santorini</span><span>Worldwide</span></div>
    </div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <p class="kicker">— The Films</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:clamp(20px,2.4vw,34px) clamp(14px,2vw,28px); margin-top:5vh" class="films-grid">
${[
  ["1039575157", "Alex &amp; Wilton — Wedding Film Highlight"],
  ["1117935629", "Jacqueline &amp; Gordon — Wedding Film Highlight"],
  ["1078314523", "Marcella &amp; Dan — Engagement Party Teaser"],
  ["764060129", "Alexandra &amp; Raphael — Wedding Film Highlight"],
  ["788687357", "Jasmiina &amp; Tuukka — Wedding Film Highlights"],
  ["453536410", "Mozzafiato — Grand-Hôtel du Cap-Ferrat, A Four Seasons Hotel Story"],
  ["645329394", "Nida &amp; Sunny — Wedding Film Highlight"],
  ["948291710", "Joseph &amp; Ally — Teaser"],
  ["1159256501", "Henna &amp; Ben — Highlight Film"],
  ["1129422393", "Narumi &amp; Alonso — Wedding Film Highlight"],
].map(([id, title]) => `        <div>
          <div class="mat" style="position:relative; aspect-ratio:16/9; background:#000">
            <iframe data-lazy-src="https://player.vimeo.com/video/${id}" title="${title}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute; inset:0; width:100%; height:100%; border:0"></iframe>
          </div>
          <p class="kicker" style="margin-top:2vh">— ${title}</p>
        </div>`).join("\n")}
      </div>
      <style>@media (max-width:900px){ .films-grid { grid-template-columns:1fr !important; } }</style>
    </div>
  </section>

  <!-- scroll-scrubbed film band (3:1) between the films and the frames -->
  <section class="film film--band vignette" data-scrub data-film-nopin data-theme="dark" data-section aria-label="Chromata Films — gallery film">
    <video data-src="assets/video/gallery-film.mp4" data-src-mobile="assets/video/gallery-film-mobile.mp4"
           poster="assets/video/gallery-film-poster.jpg" muted playsinline preload="metadata"></video>
    <div class="film__shade"></div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <p class="kicker">— The Frames</p>
      <div class="gallery-grid" style="margin-top:5vh">
${galleryImgs.map(([f, cls]) => `        ${g("carousel", f, cls, "Chromata Films wedding frame")}`).join("\n")}
      </div>
    </div>
  </section>`,
});

/* ============================== RUSSELL WESTBROOK ============================== */
pages["russell-westbrook.html"] = shell({
  page: "westbrook",
  title: "Russell & Nina Westbrook — Wedding Anniversary in Positano | Chromata Films",
  description: "Russell and Nina Westbrook celebrated their wedding anniversary on the Amalfi Coast — filmed by Chromata Films in Positano, photographed by Greg Finck.",
  main: `  <section class="page-hero" data-theme="dark">
    <div class="page-hero__bg">
      <img src="assets/img/westbrook/rw-01.jpg" alt="Russell and Nina Westbrook — anniversary celebration in Positano" fetchpriority="high" />
    </div>
    <div class="page-hero__content">
      <p class="kicker line-mask"><span class="line-inner">Celebration · Amalfi Coast</span></p>
      <h1 class="page-hero__title">
        <span class="line-mask"><span class="line-inner">Russell <em>&amp;</em> Nina</span></span>
        <span class="line-mask"><span class="line-inner">Westbrook</span></span>
      </h1>
      <div class="page-hero__sub">
        <span>Positano, Italy · September 2025</span>
        <span>Photography — Greg Finck</span>
        <span>Film — Chromata Films</span>
      </div>
    </div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <p class="kicker">— The Story</p>
      <div class="feature__grid" style="margin-top:5vh">
        <div class="prose">
          <p class="lead">Some love stories deserve a sequel ... and Positano wrote this one in gold and sea-blue.</p>
          <p>When Russell and Nina Westbrook chose the Amalfi Coast to celebrate their wedding anniversary, the brief was simple: all the emotion of a wedding day, none of the script. A family, their closest people, and a cliffside village that photographs like a film set from every angle.</p>
          <p>Anniversary films are a different craft. There is no ceremony structure to lean on ... just an atmosphere that has to be caught rather than staged. With <a class="text-link" href="https://www.mindyweiss.com" target="_blank" rel="noopener">Mindy Weiss</a> orchestrating the celebration, we brought pure documentary cinematography elevated with the fashion-film language of our weddings, alongside the beautiful stills of <a class="text-link" href="https://www.gregfinck.com" target="_blank" rel="noopener">Greg Finck</a>.</p>
          <p>To Russell and Nina: thank you for letting our cameras into a celebration that belonged entirely to you.</p>
        </div>
        <div class="feature__meta">
          <div class="row"><span>Couple</span><span class="val">Russell &amp; Nina Westbrook</span></div>
          <div class="row"><span>Setting</span><span class="val">Positano, Amalfi Coast</span></div>
          <div class="row"><span>Date</span><span class="val">September 2025</span></div>
          <div class="row"><span>Planning</span><span class="val"><a class="text-link" href="https://www.mindyweiss.com" target="_blank" rel="noopener">Mindy Weiss</a></span></div>
          <div class="row"><span>Photography</span><span class="val"><a class="text-link" href="https://www.gregfinck.com" target="_blank" rel="noopener">Greg Finck</a></span></div>
          <div class="row"><span>Film</span><span class="val">Chromata Films</span></div>
        </div>
      </div>
      <div class="feature__actions" style="margin-top:6vh">
        <a class="text-link" href="journal-westbrook-anniversary.html">Read the story in the Journal →</a>
      </div>
    </div>
  </section>

  <section class="pad-section" style="padding-top:0" data-section>
    <div class="container">
      <p class="kicker">— Positano</p>
      <div class="gallery-grid gallery-grid--even" style="margin-top:5vh">
        ${["rw-02.jpg","rw-03.jpg","rw-04.jpg","rw-05.jpg","rw-06.jpg","rw-07.jpg","rw-08.jpg","rw-09.jpg","rw-10.jpg","rw-11.jpg","rw-12.jpg","rw-13.jpg","rw-14.jpg"].map((f) => g("westbrook", f, "", "Russell and Nina Westbrook anniversary — Positano")).join("\n        ")}
      </div>
    </div>
  </section>

${next("vaux-le-vicomte.html", "Vaux-le-Vicomte")}`,
});

/* ============================== VAUX-LE-VICOMTE ============================== */
pages["vaux-le-vicomte.html"] = shell({
  page: "vaux",
  title: "Vaux-le-Vicomte — A Private Wedding at the Château | Chromata Films",
  description: "A private wedding at the Château de Vaux-le-Vicomte ... grand-siècle splendor for VIP clients, filmed by Chromata Films with florals by Roni Floral Design and photography by Maddy Christina.",
  main: `  <section class="page-hero" data-theme="dark">
    <div class="page-hero__bg">
      <img src="assets/img/vaux/vlv-01.jpg" alt="A private wedding at the Château de Vaux-le-Vicomte" fetchpriority="high" />
    </div>
    <div class="page-hero__content">
      <p class="kicker line-mask"><span class="line-inner">Real Wedding · Private</span></p>
      <h1 class="page-hero__title">
        <span class="line-mask"><span class="line-inner">Vaux-le-Vicomte</span></span>
      </h1>
      <div class="page-hero__sub">
        <span>Château de Vaux-le-Vicomte, France</span>
        <span>Private wedding · VIP clients</span>
        <span>Film — Chromata Films</span>
      </div>
    </div>
  </section>

  <section class="pad-section" style="padding-bottom:0" data-section>
    <div class="container">
      <p class="kicker">— The Film</p>
      <div class="mat img-reveal trailer" data-yt="t7_JRwa1oDM" data-cursor="play" style="margin-top:4vh">
        <img class="thumb" src="https://img.youtube.com/vi/t7_JRwa1oDM/maxresdefault.jpg" alt="Vaux-le-Vicomte wedding teaser by Chromata Films" loading="lazy">
        <div class="trailer__play"><div class="disc"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></div></div>
        <span class="trailer__label">Wedding teaser ... play</span>
      </div>
    </div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <p class="kicker">— The Story</p>
      <div class="feature__grid" style="margin-top:5vh">
        <div class="prose">
          <p class="lead">The château that inspired Versailles, an evening of grand-siècle splendor, and a couple whose names we'll keep to ourselves.</p>
          <p>Some celebrations ask for discretion as much as they ask for grandeur. For this private wedding at the Château de Vaux-le-Vicomte, our VIP clients gathered their closest circle beneath Le Nôtre's gardens and Le Brun's painted ceilings ... a setting that has humbled kings, dressed for one unforgettable night.</p>
          <p>With florals by Roni Floral Design and the photography of <a class="text-link" href="https://www.maddychristina.com" target="_blank" rel="noopener">Maddy Christina</a>, we filmed candlelit vows, a dinner beneath the painted salons, and dancing that carried through the château until the small hours ... all with the quiet footprint this couple asked of us.</p>
        </div>
        <div class="feature__meta">
          <div class="row"><span>Venue</span><span class="val"><a class="text-link" href="https://vaux-le-vicomte.com/en/" target="_blank" rel="noopener">Château de Vaux-le-Vicomte</a></span></div>
          <div class="row"><span>Setting</span><span class="val">Private wedding · France</span></div>
          <div class="row"><span>Florals</span><span class="val">Roni Floral Design</span></div>
          <div class="row"><span>Photography</span><span class="val"><a class="text-link" href="https://www.maddychristina.com" target="_blank" rel="noopener">Maddy Christina</a></span></div>
          <div class="row"><span>Film</span><span class="val">Chromata Films</span></div>
        </div>
      </div>
    </div>
  </section>

  <section class="pad-section" style="padding-top:0" data-section>
    <div class="container">
      <p class="kicker">— The Château</p>
      <div class="gallery-grid" style="margin-top:5vh">
        ${["vlv-02.jpg","vlv-03.jpg","vlv-04.jpg","vlv-05.jpg","vlv-06.jpg","vlv-07.jpg","vlv-08.jpg","vlv-09.jpg","vlv-10.jpg","vlv-11.jpg"].map((f) => g("vaux", f, "", "Private wedding at the Château de Vaux-le-Vicomte")).join("\n        ")}
      </div>
    </div>
  </section>

${next("domantas-sabonis.html", "Domantas &amp; Shashana")}`,
});

/* ============================== CONTACT ============================== */
const budgetOptions = ["15,000 – 25,000", "25,000 – 35,000", "35,000 – 45,000", "45,000 – 55,000", "55,000 – 65,000", "65,000 – 75,000", "75,000 +"]
  .map((b) => `<option>${b}</option>`).join("");

pages["contact.html"] = shell({
  page: "contact",
  footerCta: false,
  title: "Contact Us — Chromata Films | Global Luxury Destination Wedding Cinematographers",
  description: "Check your date with Chromata Films — global luxury destination wedding cinematographers. Tell us about your wedding and let's begin your journey.",
  main: `  <section class="film film--header vignette" data-theme="dark" aria-label="Contact — cinematic header">
    <video src="assets/video/contact-header.mp4" poster="assets/video/contact-header-poster.jpg"
           muted loop playsinline autoplay data-ambient data-preload-track></video>
    <div class="film__shade"></div>
    <div class="hero__head">
      <p class="kicker" style="color:var(--coral)">— Contact Us</p>
      <h1 class="hero__title hero__title--page">
        <span class="line-mask intro-rise"><span class="line-inner">Global luxury</span></span>
        <span class="line-mask intro-rise"><span class="line-inner">destination wedding <em>cinematographers</em></span></span>
      </h1>
    </div>
    <div class="hero__scroll intro-fade"><span class="lbl">Scroll</span><span class="line"><i></i></span></div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <div class="contact-wrap">
        <aside class="contact-side">
          <figure class="mat img-reveal">
            <img src="assets/img/contact/contact-side.jpg" alt="Bridal portrait — Chromata Films" loading="lazy">
          </figure>
          <p class="photo-credit">Photography by German Larkin</p>
          <div class="feature__meta">
            <div class="row"><span>Email</span><span class="val"><a class="text-link" href="mailto:${EMAIL}">${EMAIL}</a></span></div>
            <div class="row"><span>Studio</span><span class="val">${ADDRESS}</span></div>
            <div class="row"><span>Coverage</span><span class="val">Worldwide — five continents</span></div>
          </div>
        </aside>
        <div>
          <p class="kicker">— Tell us everything</p>
          <h2 class="display-md" style="margin:3vh 0 5vh">
            <span class="line-mask"><span class="line-inner">Your wedding will happen once.</span></span>
            <span class="line-mask"><span class="line-inner">Let's make sure you <em>feel it forever</em>.</span></span>
          </h2>
          <form class="contact-form" action="https://formsubmit.co/${EMAIL}" method="POST">
            <input type="hidden" name="_subject" value="New wedding inquiry — chromatafilms.com">
            <input type="hidden" name="_captcha" value="false">
            <div class="field">
              <label for="cf-name">Your name is <span class="req">*</span></label>
              <input id="cf-name" name="name" type="text" required autocomplete="name" placeholder="Both of you, ideally">
            </div>
            <div class="field split">
              <div class="field">
                <label for="cf-type">And you are planning a <span class="req">*</span></label>
                <select id="cf-type" name="event_type" required>
                  <option>Wedding</option>
                  <option>Multi-day destination wedding</option>
                  <option>Elopement</option>
                  <option>Engagement / proposal</option>
                  <option>Anniversary celebration</option>
                  <option>Private event</option>
                </select>
              </div>
              <div class="field">
                <label for="cf-date">On the date of <span class="req">*</span></label>
                <input id="cf-date" name="date" type="date" required>
              </div>
            </div>
            <div class="field">
              <label for="cf-venue">In the venue of <span class="req">*</span></label>
              <input id="cf-venue" name="venue" type="text" required placeholder="Venue name, city, country">
            </div>
            <div class="field split">
              <div class="field">
                <label for="cf-planner">With my wedding planner <span class="req">*</span></label>
                <input id="cf-planner" name="planner" type="text" required placeholder="Planner or planning studio">
              </div>
              <div class="field">
                <label for="cf-guests">And with about — attending guests <span class="req">*</span></label>
                <input id="cf-guests" name="guests" type="number" min="2" max="2000" required placeholder="120">
              </div>
            </div>
            <div class="field">
              <label for="cf-photo">Also my photographer will (or might) be</label>
              <input id="cf-photo" name="photographer" type="text" placeholder="If you already know">
            </div>
            <div class="field">
              <label for="cf-budget">And my budget for cinematography is <span class="req">*</span></label>
              <select id="cf-budget" name="cinematography_budget" required>${budgetOptions}</select>
            </div>
            <div class="field">
              <label for="cf-msg">Anything else to say to your wedding film maker? <span class="req">*</span></label>
              <textarea id="cf-msg" name="message" rows="5" required placeholder="Your story, your vision, the moments that matter most…"></textarea>
            </div>
            <div class="field">
              <label for="cf-email">Email address <span class="req">*</span></label>
              <input id="cf-email" name="email" type="email" required autocomplete="email">
            </div>
            <button class="btn btn--coral" type="submit" style="align-self:flex-start">Check your date →</button>
            <p class="form-note">We answer every inquiry personally, usually within 48 hours. Planners: mention your studio ... we love working with you.</p>
          </form>
        </div>
      </div>
    </div>
  </section>`,
});

/* ============================== GET TO KNOW US MORE (unlisted — not in nav, not linked from any page, noindex) ============================== */
pages["gettoknowusmore.html"] = shell({
  page: "gtkum",
  noindex: true,
  footerCta: false,
  title: "Get to Know Us More — Chromata Films",
  description: "Chromata Films — collections, options and the Red Carpet Slow-Mo experience.",
  main: `  <section class="film film--header vignette" data-theme="dark" aria-label="Get to know us more — cinematic header">
    <video src="assets/video/gtkum-header.mp4" poster="assets/video/gtkum-header-poster.jpg"
           muted loop playsinline autoplay data-ambient data-preload-track></video>
    <div class="film__shade"></div>
    <div class="hero__head">
      <p class="kicker" style="color:var(--coral)">— Get to Know Us More</p>
      <h1 class="hero__title hero__title--page">
        <span class="line-mask intro-rise"><span class="line-inner">The <em>time has come</em></span></span>
        <span class="line-mask intro-rise"><span class="line-inner">to stand out</span></span>
      </h1>
    </div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <p class="kicker">— Where We Shine</p>
      <h2 class="display-lg" style="margin-top:3vh; max-width:16em">
        <span class="line-mask"><span class="line-inner">Featured <em>everywhere</em>,</span></span>
        <span class="line-mask"><span class="line-inner">trusted by icons</span></span>
      </h2>
      <p class="body-copy" style="max-width:46em; margin-top:4vh">Our dedication to artistic excellence shines through in publications like People, Vogue, Over The Moon, Brides and The Wed. Under Kevin's visionary leadership, our team has earned the trust of prestigious event planners and garnered recognition from the industry's most respected publications.</p>
    </div>
  </section>

  <section class="pad-section" style="padding-top:0" data-section>
    <div class="container">
      <p class="kicker">— What We Offer</p>
      <p class="body-copy" style="max-width:46em; margin-top:3vh">We understand every wedding is unique, just like your client's story. That's why we customize every quote, considering their specific venue, dreams and celebration length, to capture their once-in-a-lifetime moment perfectly.</p>
    </div>
  </section>

  <!-- GASP scrub film — dissolves straight into the offers section's blue -->
  <section class="film film--offers vignette" data-scrub data-pin="+=300%" data-theme="dark" data-section aria-label="Chromata Films — cinematic film">
    <video data-src="assets/video/contact.mp4" data-src-mobile="assets/video/contact-mobile.mp4"
           poster="assets/video/contact-poster.jpg" muted playsinline preload="metadata"></video>
    <div class="film__shade"></div>
    <div class="film__fadeout" aria-hidden="true"></div>
  </section>

  <section class="offers pad-section" data-section>
    <div class="container">
      <p class="kicker">— The Collection Example</p>
      <h2 class="display-lg" style="margin-top:3vh; max-width:16em">
        <span class="line-mask"><span class="line-inner">A collection built</span></span>
        <span class="line-mask"><span class="line-inner">around <em>your day</em></span></span>
      </h2>
      <div class="offers__grid">
        <div class="offers__col">
          <h3>Collection Example — Includes</h3>
          <ul class="offers__list">
            <li>Event coverage (up to 10 hours)</li>
            <li>Pre- and post-wedding days (3 hours coverage each)</li>
            <li>Drone coverage with a dedicated drone pilot</li>
            <li>Edited films in various formats — a 4-minute film + a 20/25-minute film</li>
            <li>Audio recorded on external high-resolution audio recorders</li>
            <li>Three cinematographers</li>
          </ul>
          <p class="offers__price">Pricing — on demand</p>
        </div>
        <div class="offers__col">
          <h3>Available Options</h3>
          <ul class="offers__list">
            <li>Instagram special cuts ×3</li>
            <li>Cinema drone camera</li>
            <li>Extra-long film (45 min – 1 hour)</li>
            <li>Shorter editing time (~4 weeks)</li>
            <li>Editorial session</li>
            <li>Live streaming</li>
            <li>Complete films for ceremony and speeches</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- ==================== EXTRAS — split screen: DOP (white) | Red Carpet (coral) ==================== -->
  <section class="extras" data-section>
    <div class="extras__col extras__col--dop">
      <div class="extras__copy">
        <p class="kicker">— The Extras You Won't Get Anywhere Else</p>
        <h2 class="display-md" style="margin-top:2.5vh">
          <span class="line-mask"><span class="line-inner">Working with a</span></span>
          <span class="line-mask"><span class="line-inner">DOP <em>/ Film Director</em></span></span>
        </h2>
        <p class="body-copy" style="margin-top:3vh">Enter cinematic mastery. Adding a dedicated Director of Photography and film director to our team elevates your wedding film beyond the ordinary ... composition, lighting and camera movement considered with the same rigor as a feature production. It's an industry first for destination weddings, bringing genuine Hollywood expertise to your love story: a second creative eye devoted entirely to the visual language of your day, so every frame feels directed, not simply documented.</p>
      </div>
      <div class="extras__media">
        <figure class="mat img-reveal"><img src="assets/img/gtkum/dop-01.jpg" alt="Director of Photography — cinematic lighting" loading="lazy"></figure>
        <figure class="mat img-reveal"><img src="assets/img/gtkum/dop-02.jpg" alt="Chromata Films — wedding film award" loading="lazy"></figure>
      </div>
    </div>
    <div class="extras__col extras__col--redcarpet">
      <div class="extras__copy">
        <p class="kicker">— The Red Carpet Slow-Mo Experience</p>
        <h2 class="display-md" style="margin-top:2.5vh">
          <span class="line-mask"><span class="line-inner">Step onto the</span></span>
          <span class="line-mask"><span class="line-inner"><em>red carpet</em></span></span>
        </h2>
        <p class="body-copy" style="margin-top:3vh">Forget the photo booth, step onto a real red carpet! Our slow-motion video booth brings Hollywood glam to your wedding. Imagine: dazzling lighting, playful poses, infectious laughter, all captured in stunning slow-mo. This isn't just a booth, it's a portal to unforgettable fun, adding luxury and spectacle to your extraordinary day.</p>
        <p class="body-copy" style="margin-top:2vh">Embrace the magic ... give your wedding the ultimate slow-mo robot extravaganza!</p>
      </div>
      <div class="extras__media">
        <figure class="mat img-reveal"><img src="assets/img/gtkum/red-01.jpg" alt="The Red Carpet Slow-Mo Experience" loading="lazy"></figure>
        <figure class="mat img-reveal"><img src="assets/img/gtkum/red-02.jpg" alt="The Red Carpet Slow-Mo Experience" loading="lazy"></figure>
        <figure class="mat img-reveal extras__media--sm"><img src="assets/img/gtkum/red-03.jpg" alt="The Red Carpet Slow-Mo Experience — slow-mo robot camera" loading="lazy"></figure>
      </div>
    </div>
  </section>

  <!-- full-bleed ambient video band (3:1) between the extras and the founders -->
  <section class="videoband" data-theme="dark" data-section aria-label="Chromata Films — film">
    <iframe data-lazy-src="https://www.youtube-nocookie.com/embed/Mu79zqgmV5M?autoplay=1&mute=1&loop=1&playlist=Mu79zqgmV5M&controls=0&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3&disablekb=1"
            title="Chromata Films" loading="lazy" allow="autoplay; encrypted-media"></iframe>
  </section>

  <section class="pad-section" data-theme="dark" data-section style="background:var(--night-deep); color:var(--cream)">
    <div class="container">
      <div class="feature__grid">
        <div>
          <p class="kicker" style="color:var(--gold-light)">— From Kevin &amp; Laura</p>
          <div class="prose" style="max-width:46em; margin-top:3vh">
            <p>As it is important to know your suppliers and understand why we love what we do, we have decided to write a short article about ourselves. Having been together for 19 years, we know each other well and work as an excellent team. We have surrounded ourselves with exceptional cinematographers to provide the highest quality to our clients. We direct them and work closely with them based on our experiences in the film and commercial industry.</p>
            <p>We love what we do for several reasons, and sharing our experience in the cinema industry and project management with the wedding industry is important to us. We had difficulty finding someone with similar visions when we got married, so bringing our vision to our clients has been the best decision we have made in years. It is a unique feeling to know that our couples will proudly show their films to their families, children, and maybe even grandchildren for decades to come.</p>
            <p>We always strive for the best possible results, continuously improve our skillset, and push boundaries by going further, making you and your guests feel unique. The films we produce will always make you feel that way, forever.</p>
          </div>
        </div>
        <figure class="mat img-reveal"><img src="assets/img/gtkum/founders.jpg" alt="Kevin and Laura Lopez — founders of Chromata Films" loading="lazy"></figure>
      </div>
    </div>
  </section>

  <section class="pad-section" data-section style="text-align:center">
    <div class="container">
      <p class="kicker" style="justify-content:center">— Begin</p>
      <h2 class="display-md" style="margin-top:3vh">
        <span class="line-mask"><span class="line-inner">Want to hear <em>more</em>?</span></span>
      </h2>
      <p class="body-copy" style="max-width:40em; margin:3vh auto 0">Our curated collection serves as a muse to spark your imagination. To craft a truly personalized selection that reflects your unique vision, don't hesitate to reach out to us at <a class="text-link" href="mailto:${EMAIL}">${EMAIL}</a>. Your dream experience awaits!</p>
      <a class="btn btn--coral" href="mailto:${EMAIL}" style="margin-top:4vh">${EMAIL}</a>
    </div>
  </section>`,
});

for (const [file, html] of Object.entries(pages)) {
  writeFileSync(new URL("../" + file, import.meta.url), html);
  console.log("wrote", file);
}
