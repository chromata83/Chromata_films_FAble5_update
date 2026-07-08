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
        Projects
        <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 3l4 4 4-4"/></svg>
      </button>
      <div class="nav__drop-menu" role="menu">
        <a class="nav__drop-item" role="menuitem" href="domantas-sabonis.html"${current === "domantas" ? ' aria-current="page"' : ""}><span class="t">Domantas &amp; Shashana</span><span class="tag">NBA All-Star</span></a>
        <a class="nav__drop-item" role="menuitem" href="jacqueline-gordon.html"${current === "jacky" ? ' aria-current="page"' : ""}><span class="t">Jacqueline &amp; Gordon</span><span class="tag">St-Tropez</span></a>
        <a class="nav__drop-item" role="menuitem" href="anna-andres.html"${current === "anna" ? ' aria-current="page"' : ""}><span class="t">Anna Andres</span><span class="tag">Miss Universe UA</span></a>
        <a class="nav__drop-item" role="menuitem" href="russell-westbrook.html"${current === "westbrook" ? ' aria-current="page"' : ""}><span class="t">Russell &amp; Nina Westbrook</span><span class="tag">Positano</span></a>
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
  <a class="big" href="#" id="mmProjects">Projects <em>↓</em></a>
  <div class="sub">
    <a href="domantas-sabonis.html">Domantas &amp; Shashana — NBA All-Star</a>
    <a href="jacqueline-gordon.html">Jacqueline &amp; Gordon — St-Tropez</a>
    <a href="anna-andres.html">Anna Andres — Miss Universe</a>
    <a href="russell-westbrook.html">Russell &amp; Nina Westbrook — Positano</a>
  </div>
  <a class="big" href="the-studio.html">The <em>Studio</em></a>
  <a class="big" href="journal.html">Journal</a>
  <a class="big" href="gallery.html">Gallery</a>
  <a class="big" href="contact.html">Contact <em>Us</em></a>
  <div class="mm-footer">Chromata Films — Where the French Touch meets Modern Elegance</div>
</div>`;

const PRELOADER = `<div class="preloader" id="preloader">
  <img class="preloader__mark" src="assets/img/logo-mark.png" alt="Chromata Films — golden peacock" />
  <div class="preloader__word">CHROMATA</div>
  <div class="preloader__sub">Films — Wedding Cinematography</div>
  <div class="preloader__bar"><div class="preloader__fill"></div></div>
  <div class="preloader__pct">0%</div>
</div>`;

const FOOTER = `<footer class="footer">
  <div class="footer__cta">
    <div>
      <p class="kicker">— Begin Your Journey</p>
      <h2 class="display-lg footer__cta-title" style="margin-top:2.5vh">
        <span class="line-mask"><span class="line-inner">Come see your</span></span>
        <span class="line-mask"><span class="line-inner">story <em>bloom</em></span></span>
      </h2>
    </div>
    <a class="footer__begin" href="contact.html" data-magnetic>Begin →</a>
  </div>
  <div class="footer__cols">
    <div>
      <h4>Projects</h4>
      <a href="domantas-sabonis.html">Domantas &amp; Shashana</a>
      <a href="jacqueline-gordon.html">Jacqueline &amp; Gordon</a>
      <a href="anna-andres.html">Anna Andres</a>
      <a href="russell-westbrook.html">Russell &amp; Nina Westbrook</a>
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
  <span class="footer__wordmark" id="footerWordmark" aria-hidden="true">CHROMATA FILMS</span>
  <div class="footer__legal">
    <span>© 2026 Chromata Films — Wedding Film Cinematography</span>
    <span>${ADDRESS} · <a href="mailto:${EMAIL}">${EMAIL}</a></span>
  </div>
</footer>`;

const shell = ({ page, title, description, main }) => `<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="icon" type="image/png" href="assets/img/logo-mark.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Space+Grotesk:wght@400;500&display=swap" rel="stylesheet" />
<link rel="preload" href="assets/fonts/GermanySans.ttf" as="font" type="font/ttf" crossorigin />
<link rel="stylesheet" href="css/main.css" />
</head>
<body data-page="${page}">

${PRELOADER}

${nav(page)}

<div class="cursor-dot" id="cursorDot"></div>
<div class="cursor-ring" id="cursorRing"><span class="cursor-label"></span></div>

<main>
${main}

${FOOTER}
</main>

<button class="totop" id="toTop" aria-label="Back to top">
  <svg viewBox="0 0 16 16" fill="none" stroke-width="1.5"><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5"/></svg>
</button>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>
<script src="js/webgl.js" defer></script>
<script src="js/main.js" defer></script>
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
  title: "Domantas Sabonis & Shashana — NBA All-Star Wedding | Chromata Films",
  description: "The wedding of NBA All-Star Domantas Sabonis and Shashana, filmed by Chromata Films — a celebration written for the record books.",
  main: `  <section class="page-hero" data-theme="dark">
    <div class="page-hero__bg">
      <img src="assets/img/landing/domantas-cover.png" alt="Domantas Sabonis and Shashana on their wedding day" fetchpriority="high" />
    </div>
    <div class="page-hero__content">
      <p class="kicker line-mask"><span class="line-inner">Real Wedding · NBA All-Star</span></p>
      <h1 class="page-hero__title">
        <span class="line-mask"><span class="line-inner">Domantas <em>&amp;</em> Shashana</span></span>
      </h1>
      <div class="page-hero__sub">
        <span>France · 15.08.2021</span>
        <span>Photography — Maddy Christina</span>
        <span>Film — Chromata Films</span>
      </div>
    </div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <p class="kicker">— The Story</p>
      <div class="feature__grid" style="margin-top:5vh">
        <div class="prose">
          <p class="lead">When an NBA All-Star marries the love of his life, the celebration has to hit different — and it did.</p>
          <p>Domantas Sabonis and Shashana gathered their closest family and friends for a wedding that balanced grandeur with genuine intimacy. Between the towering emotion of the ceremony and a dance floor that refused to close, our cameras chased laughter, tears, and the kind of unscripted moments that make a film feel alive years later.</p>
          <p>Working alongside photographer Maddy Christina and a world-class team of vendors, we shot the day the way we shoot everything — like a feature film with two leading roles and several hundred supporting actors who all happened to be crying at the same time.</p>
        </div>
        <div class="feature__meta">
          <div class="row"><span>Couple</span><span class="val">Domantas Sabonis &amp; Shashana</span></div>
          <div class="row"><span>Setting</span><span class="val">Private estate, France</span></div>
          <div class="row"><span>Date</span><span class="val">15 August 2021</span></div>
          <div class="row"><span>Photography</span><span class="val">Maddy Christina</span></div>
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
      <img src="assets/img/jacky/jg-04.jpg" alt="Jacqueline and Gordon — wedding celebration in St-Tropez" fetchpriority="high" />
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

  <section class="pad-section" data-section>
    <div class="container">
      <p class="kicker">— The Story</p>
      <div class="feature__grid" style="margin-top:5vh">
        <div class="prose">
          <p class="lead">Jacqueline and Gordon's wedding in St-Tropez could be summarized in one simple word: WOW.</p>
          <p>Five days of celebration at Le Beauvallon, overlooking the bay of St-Tropez. Day one opened with a seaside dinner and a fashion show of designer collections, crowned by a drone light spectacle over the water. Day two honored Gordon's heritage with a traditional tea ceremony before flipping into a Bridgerton-meets-1980s party — neon, vintage styling, and a dance floor with no mercy.</p>
          <p>Day three: rare wines and spirits tasted poolside, then a late night in a St-Tropez restaurant. Day four, the main event — vows on the Beauvallon terrace above the sea, fireworks, a private concert, and an after-party that only surrendered at sunrise. Day five ended the only way it could: a foam party at the pool.</p>
          <p>Alongside planner Heather, the florals and décor of Reverie d'Azur, entertainment by Black Rabbit Project and our friends at Maddy Christina, we filmed a celebration that refused to repeat itself for five straight days.</p>
        </div>
        <div class="feature__meta">
          <div class="row"><span>Venue</span><span class="val">Le Beauvallon, St-Tropez</span></div>
          <div class="row"><span>Duration</span><span class="val">Five days, June 2025</span></div>
          <div class="row"><span>Florals &amp; décor</span><span class="val">Reverie d'Azur</span></div>
          <div class="row"><span>Entertainment</span><span class="val">Black Rabbit Project</span></div>
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
      <img src="assets/img/carousel/c-10.jpg" alt="Anna Andres wedding — editorial bridal portrait" fetchpriority="high" />
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
          <p>Anna Andres — Miss Universe Ukraine 2014, model and actress — trusted us to film her wedding with the same visual intelligence as the editorials she has graced. We treated every setup like a page of a magazine: composed, lit, and directed — then we let the day breathe and caught what no director could stage.</p>
          <p>The result is a film that moves between fashion and feeling: couture in golden light, a ceremony that stopped the room, and a celebration carried long into the night. It remains one of the projects that best defines what we mean by the French touch — editorial polish wrapped around raw, real emotion.</p>
        </div>
        <div class="feature__meta">
          <div class="row"><span>Bride</span><span class="val">Anna Andres</span></div>
          <div class="row"><span>Title</span><span class="val">Miss Universe Ukraine 2014</span></div>
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
        ${g("carousel", "c-10.jpg", "w12 wide", "Editorial bridal portrait")}
        ${g("carousel", "c-04.jpg", "", "Bridal preparations")}
        ${g("carousel", "c-16.jpg", "", "The gown")}
        ${g("carousel", "c-19.jpg", "w4", "Portrait of the bride")}
        ${g("carousel", "c-26.jpg", "w4", "The ceremony")}
        ${g("carousel", "c-31.jpg", "w4", "Details")}
        ${g("carousel", "c-36.jpg", "w8", "The celebration")}
        ${g("carousel", "c-43.jpg", "w4", "Golden hour")}
        ${g("carousel", "c-47.jpg", "w12 wide", "Into the evening")}
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
  main: `  <section class="page-hero" data-theme="dark">
    <div class="page-hero__bg">
      <img src="assets/img/studio/studio-01.jpg" alt="Kevin Lopez in black tie, camera rig in hand, at a Dior event" fetchpriority="high" style="object-position: 50% 25%" />
    </div>
    <div class="page-hero__content">
      <p class="kicker line-mask"><span class="line-inner">The Studio</span></p>
      <h1 class="page-hero__title">
        <span class="line-mask"><span class="line-inner">Where the French Touch</span></span>
        <span class="line-mask"><span class="line-inner">meets <em>Modern Elegance</em></span></span>
      </h1>
      <div class="page-hero__sub">
        <span>Cinematography</span><span>VFX</span><span>16mm film</span><span>Aerial</span>
      </div>
    </div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <p class="kicker">— The Philosophy</p>
      <h2 class="display-lg" style="margin-top:3vh; max-width:14em">
        <span class="line-mask"><span class="line-inner">Visual narratives,</span></span>
        <span class="line-mask"><span class="line-inner">not <em>documentation</em></span></span>
      </h2>
      <div class="manifesto__row">
        <div class="manifesto__row-inner">
          <p class="body-copy">Chromata Films collaborates with premium vendors to create unforgettable wedding experiences. We produce films that transcend ordinary wedding videography through meticulous craftsmanship and French-inspired sophistication — authentic storytelling that captures raw emotion and genuine interaction, in a relaxed environment where you can simply be yourselves.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="pad-section" style="padding-top:0" data-section>
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
          <p>Master in Communication and Finance, formerly at Publicis and Mediacom — planning promotional campaigns and driving client decisions. Wife, mother, children's book author, and the person who keeps every Chromata production (and vendor relationship) running with elegance and warmth, from first inquiry to final delivery.</p>
        </article>
        <article class="team__card">
          <figure class="portrait mat img-reveal"><img src="assets/img/studio/stephane.jpg" alt="Stephane Maurin — licensed drone pilot" loading="lazy"></figure>
          <span class="role">Aerial Cinematography · FPV Pilot</span>
          <h3>Stephane Maurin</h3>
          <p>Licensed aerial cinematographer with permits to fly across international locations including France, Italy, Croatia and the French Riviera. Stephane's FPV work threads through villas, over coastlines and into ballrooms — the shots that make audiences ask "how?"</p>
        </article>
        <article class="team__card">
          <figure class="portrait mat img-reveal"><img src="assets/img/studio/michael.jpg" alt="Michael Bod — 16mm film and portrait expert" loading="lazy"></figure>
          <span class="role">16mm Film · Portraiture</span>
          <h3>Michael Bod</h3>
          <p>Our 16mm film and portrait expert. Michael shoots true analog motion picture film — grain, halation and all — giving Chromata couples the option of a wedding film that looks and feels like it was pulled from a cinema archive, alongside portrait work with a painter's patience.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="on-sunset pad-section" data-theme="dark" data-section>
    <div class="container">
      <p class="kicker">— The VFX Pedigree</p>
      <h2 class="display-lg" style="margin-top:3vh; max-width:14em">
        <span class="line-mask"><span class="line-inner">From blockbusters</span></span>
        <span class="line-mask"><span class="line-inner">to your <em>first dance</em></span></span>
      </h2>
      <div class="feature__grid" style="margin-top:7vh">
        <div class="prose">
          <p>Before weddings, our team helped craft images for some of the biggest films ever made — Star Wars, Beauty and the Beast, The Great Gatsby, Avengers. That training — in light, composition, and invisible perfectionism — is exactly what we bring to your wedding day. The same standards. The same tools. A far better leading couple.</p>
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

${next("contact.html", "Begin your journey")}`,
});

/* ============================== JOURNAL ============================== */
const posts = [
  {
    file: "journal-ai-masterclass.html", slug: "ai-masterclass",
    title: "AI Wedding Masterclass for Planners and Designers",
    date: "September 29, 2025", tag: "Masterclass",
    excerpt: "The wedding industry is experiencing a creative revolution through artificial intelligence — and the professionals who embrace these tools are gaining a serious competitive advantage.",
    body: [
      "The wedding industry is experiencing a creative revolution through artificial intelligence, and the professionals who embrace these powerful tools are gaining a significant competitive advantage. After a decade in visual effects and nine years filming luxury weddings, we've watched AI move from novelty to genuine production tool — and we believe planners and designers deserve to be in front of that curve, not behind it.",
      "In our masterclass, we show wedding professionals how to use AI imagery to sell a vision before a single flower is ordered: photoreal mood boards of a specific ballroom dressed three different ways, tablescape variations rendered in your client's actual venue, and lighting studies that let a couple see their reception at golden hour versus candlelight.",
      "The point is not to replace craft — it is to communicate it. A planner who can show a client a believable image of the design in the actual space closes faster, aligns vendors sooner, and avoids the expensive misunderstandings that turn production weeks into fire drills.",
      "We also cover the boundaries: what AI is genuinely good at (concept, mood, iteration speed) and where it must never be used in our industry (representing another vendor's real work, or replacing real coverage of a real day). The couples hire us for truth, beautifully told — AI helps us plan the telling.",
      "If you are a planner or designer curious about adding these tools to your studio, reach out — we run sessions for teams and share the exact workflows we use at Chromata Films.",
    ],
  },
  {
    file: "journal-jacqueline-gordon.html", slug: "jacqueline-gordon",
    title: "Jacqueline and Gordon — A St-Tropez Experience Unlike Any Other",
    date: "September 17, 2025", tag: "Real Wedding",
    excerpt: "Jacqueline and Gordon's wedding in St-Tropez could be summarized in one simple word: WOW.",
    body: [
      "Jacqueline and Gordon's wedding in St-Tropez could be summarized in one simple word: WOW. Five days of celebration at Le Beauvallon, each one designed to top the last.",
      "Day one began with a seaside dinner at the hotel, followed by a fashion show of designer collections and a drone light spectacle over the bay — a welcome party that would have served most couples as a finale.",
      "Day two honored Gordon's Asian heritage with a traditional tea ceremony, before the evening flipped the register entirely: a party blending Bridgerton aesthetics with 1980s energy — neon color, vintage styling, and dancing that did not pause for breath.",
      "Day three slowed the pace with tastings of rare wines and spirits from around the world, enjoyed poolside, before late-night celebrations took over a St-Tropez restaurant. Day four was the main event: the ceremony on the Beauvallon terrace overlooking the sea, then fireworks, a private concert performance, and an after-party that extended until sunrise. Day five closed the week the only way it could — a foam party at the pool.",
      "Enormous thanks to the creative team: planning and coordination by Heather, floral and décor design by Reverie d'Azur, entertainment by Black Rabbit Project, and our friends at Maddy Christina on the welcome event. Filming five days of this magnitude is a production in the fullest sense — and exactly what this studio was built for.",
    ],
  },
  {
    file: "journal-westbrook-anniversary.html", slug: "westbrook",
    title: "Russell Westbrook and Nina Westbrook — Wedding Anniversary",
    date: "September 17, 2025", tag: "Celebration",
    excerpt: "Filming an anniversary celebration for Russell and Nina Westbrook — proof that the best love stories deserve a sequel.",
    body: [
      "Some love stories deserve a sequel. When Russell and Nina Westbrook celebrated their wedding anniversary, we had the privilege of filming a party that carried all the emotion of a wedding day with the ease of a couple who have already proven everything to each other.",
      "Anniversary films are a different craft. There is no ceremony structure to lean on, no schedule of traditions — just a family, their closest people, and an atmosphere that has to be caught rather than staged. It is pure documentary cinematography, elevated with the same fashion-film language we bring to our weddings.",
      "Working with athletes of Russell's stature means understanding both worlds: the public figure whose image is managed frame by frame, and the private man celebrating with his wife. The film lives in the second world — and that trust is the real luxury of this work.",
      "To Russell and Nina: thank you for letting our cameras into a night that belonged entirely to you.",
    ],
  },
  {
    file: "journal-alexa-wilton.html", slug: "alexa-wilton",
    title: "A Riviera Fairytale: Alexa and Wilton's Extravagant St-Tropez Wedding",
    date: "July 20, 2024", tag: "Real Wedding",
    excerpt: "Dreaming of a destination wedding bathed in sunshine and luxury? Look no further than Alexa and Wilton's magical St-Tropez celebration by House of Kirschner.",
    body: [
      "Dreaming of a destination wedding bathed in sunshine and luxury? Look no further than Alexa and Wilton's magical St-Tropez celebration, designed by House of Kirschner — a wedding that treated the Riviera itself as a set piece.",
      "From the first welcome aperitivo to the final sparkler exit, every element was composed like a page from a fashion editorial: couture gowns catching the Mediterranean light, tablescapes that could hang in a gallery, and a color story that moved from daylight ivory and champagne into the saturated golds and ambers of the Riviera night.",
      "For our cameras, St-Tropez is a gift that never repeats itself. The same bay reads differently at noon, at golden hour, and under fireworks — and a multi-day celebration lets a film breathe through all of those temperatures.",
      "A wedding of this scale is always a team achievement. To House of Kirschner and every vendor who built this fairytale: bravo. Films like this one are why we call the French Riviera home ground.",
    ],
  },
  {
    file: "journal-parisian-dream.html", slug: "parisian-dream",
    title: "A Parisian Dream Tour: The Luxurious Wedding of J & A",
    date: "May 21, 2024", tag: "Real Wedding",
    excerpt: "Dreaming of a Parisian wedding overflowing with elegance, romance, and a touch of cinematic magic? Versailles and the Musée Rodin, in one unforgettable celebration.",
    body: [
      "Dreaming of a Parisian wedding overflowing with elegance, romance, and a touch of cinematic magic? J & A's celebration, orchestrated by Sumptuous Events, delivered exactly that — a dream tour through the most storied venues in France.",
      "The celebration moved from the gardens of Versailles to the Musée Rodin in Paris, where the couple exchanged vows surrounded by sculpture and centuries of art. Filming in spaces like these demands the discretion of a documentary crew and the eye of a period drama — nothing can be moved, everything must be honored, and the light does whatever the light wants.",
      "That constraint is precisely what makes Paris films extraordinary. When the ceremony backdrop is The Thinker and the reception glows under gilded boiserie, our work is to frame what is already perfect and wait for the human moments that make it personal: a father's hand tightening on a shoulder, a bride laughing mid-vow.",
      "To Sumptuous Events and the entire team: merci. This film sits among our favorite Parisian chapters — and there have been many.",
    ],
  },
  {
    file: "journal-olympics-ai.html", slug: "olympics-ai",
    title: "Paris 2024 Olympics: A Wedding-Themed Extravaganza Brought to Life by AI",
    date: "April 29, 2024", tag: "AI · Editorial",
    excerpt: "The 2024 Olympics in Paris gearing up to be an extraordinary affair — reimagined by Chromata Films as a wedding-themed visual extravaganza, entirely through AI.",
    body: [
      "The 2024 Olympics in Paris were gearing up to be an extraordinary affair, blending athleticism with a whimsical twist. As a studio obsessed with both Paris and spectacle, we asked ourselves a ridiculous question: what would the Games look like if they were a wedding?",
      "Using AI image generation, we built a full visual editorial: brides carrying the Olympic torch down the Champs-Élysées, grooms fencing in black tie, synchronized swimmers in tulle, and a stadium dressed like the world's largest ballroom. Absurd? Completely. Gorgeous? We think so too.",
      "Beyond the fun, this project was a serious technical exercise. Art-directing AI at editorial quality demands the same disciplines as a real shoot: consistent lighting logic, a coherent color story, wardrobe continuity, and ruthless curation. Of the thousands of frames generated, only a handful survived our edit — the same ratio, honestly, as a real wedding day.",
      "This experiment became the seed of our AI masterclass for planners and designers. The tools are here; the taste is the differentiator. And taste, after a decade of film and VFX, is the one thing we never outsource.",
    ],
  },
];

pages["journal.html"] = shell({
  page: "journal",
  title: "Journal — Chromata Films | Latest News & Real Weddings",
  description: "Latest news from Chromata Films: real weddings in St-Tropez and Paris, AI masterclasses for planners, and stories from the world of luxury wedding cinematography.",
  main: `  <section class="page-hero" data-theme="dark" style="min-height:62svh">
    <div class="page-hero__bg">
      <img src="assets/img/carousel/c-01.jpg" alt="Chromata Films — journal" fetchpriority="high" />
    </div>
    <div class="page-hero__content">
      <p class="kicker line-mask"><span class="line-inner">Latest News</span></p>
      <h1 class="page-hero__title"><span class="line-mask"><span class="line-inner">The <em>Journal</em></span></span></h1>
    </div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <div class="journal-list">
${posts.map((p) => `        <a class="jitem" href="${p.file}">
          <span class="jdate">${p.date}</span>
          <h2>${p.title}</h2>
          <span class="jarrow">→</span>
          <p class="jexcerpt">${p.excerpt}</p>
          <span class="jtag">${p.tag}</span>
        </a>`).join("\n")}
      </div>
    </div>
  </section>`,
});

for (const p of posts) {
  pages[p.file] = shell({
    page: "journal",
    title: `${p.title} — Journal | Chromata Films`,
    description: p.excerpt,
    main: `  <section class="pad-section" style="padding-top:calc(var(--nav-h) + 10vh)" data-section>
    <div class="container">
      <article class="article">
        <p class="kicker">— Journal · ${p.tag}</p>
        <h1 class="display-md" style="margin-top:3vh">
          <span class="line-mask"><span class="line-inner">${p.title}</span></span>
        </h1>
        <div class="article__meta"><span>${p.date}</span><span>By Kevin Lopez</span></div>
        <div class="prose">
${p.body.map((par) => `          <p>${par}</p>`).join("\n")}
        </div>
        <div style="margin-top:8vh; display:flex; gap:30px; flex-wrap:wrap">
          <a class="text-link" href="journal.html">← Back to the Journal</a>
          <a class="text-link" href="contact.html">Begin your journey →</a>
        </div>
      </article>
    </div>
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
  main: `  <section class="page-hero" data-theme="dark" style="min-height:86svh">
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
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:clamp(14px,2vw,28px); margin-top:5vh" class="films-duo">
        <div>
          <div class="mat" style="position:relative; aspect-ratio:16/9; background:#000">
            <iframe data-lazy-src="https://player.vimeo.com/video/1039575157" title="Alex &amp; Wilton — Wedding Film Highlight" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute; inset:0; width:100%; height:100%; border:0"></iframe>
          </div>
          <p class="kicker" style="margin-top:2vh">— Alex &amp; Wilton · St-Tropez</p>
        </div>
        <div>
          <div class="mat" style="position:relative; aspect-ratio:16/9; background:#000">
            <iframe data-lazy-src="https://player.vimeo.com/video/1117935629" title="Jacqueline &amp; Gordon — Wedding Film Highlight" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute; inset:0; width:100%; height:100%; border:0"></iframe>
          </div>
          <p class="kicker" style="margin-top:2vh">— Jacqueline &amp; Gordon · Le Beauvallon</p>
        </div>
      </div>
      <style>@media (max-width:900px){ .films-duo { grid-template-columns:1fr !important; } }</style>
    </div>
  </section>

  <section class="pad-section" style="padding-top:0" data-section>
    <div class="container">
      <p class="kicker">— The Weddings</p>
      <div class="journal-list" style="margin-top:4vh">
        <a class="jitem" href="domantas-sabonis.html">
          <span class="jdate">France · 2021</span>
          <h2>Domantas Sabonis &amp; Shashana — the NBA All-Star wedding</h2>
          <span class="jarrow">→</span>
          <span class="jtag">Real Wedding</span>
        </a>
        <a class="jitem" href="jacqueline-gordon.html">
          <span class="jdate">St-Tropez · 2025</span>
          <h2>Jacqueline &amp; Gordon — five days at Le Beauvallon</h2>
          <span class="jarrow">→</span>
          <span class="jtag">Real Wedding</span>
        </a>
        <a class="jitem" href="anna-andres.html">
          <span class="jdate">Editorial</span>
          <h2>Anna Andres — a wedding shot like a Vogue cover</h2>
          <span class="jarrow">→</span>
          <span class="jtag">Real Wedding</span>
        </a>
        <a class="jitem" href="russell-westbrook.html">
          <span class="jdate">Positano · 2025</span>
          <h2>Russell Westbrook — a wedding anniversary on the Amalfi Coast</h2>
          <span class="jarrow">→</span>
          <span class="jtag">Celebration</span>
        </a>
      </div>
    </div>
  </section>

  <section class="pad-section" style="padding-top:0" data-section>
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
          <p class="lead">Some love stories deserve a sequel — and Positano wrote this one in gold and sea-blue.</p>
          <p>When Russell and Nina Westbrook chose the Amalfi Coast to celebrate their wedding anniversary, the brief was simple: all the emotion of a wedding day, none of the script. A family, their closest people, and a cliffside village that photographs like a film set from every angle.</p>
          <p>Anniversary films are a different craft. There is no ceremony structure to lean on — just an atmosphere that has to be caught rather than staged. Pure documentary cinematography, elevated with the fashion-film language we bring to our weddings, alongside the beautiful stills of Greg Finck.</p>
          <p>To Russell and Nina: thank you for letting our cameras into a celebration that belonged entirely to you.</p>
        </div>
        <div class="feature__meta">
          <div class="row"><span>Couple</span><span class="val">Russell &amp; Nina Westbrook</span></div>
          <div class="row"><span>Setting</span><span class="val">Positano, Amalfi Coast</span></div>
          <div class="row"><span>Date</span><span class="val">September 2025</span></div>
          <div class="row"><span>Photography</span><span class="val">Greg Finck</span></div>
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
      <div class="gallery-grid" style="margin-top:5vh">
        ${["rw-02.jpg","rw-03.jpg","rw-04.jpg","rw-05.jpg","rw-06.jpg","rw-07.jpg","rw-08.jpg","rw-09.jpg","rw-10.jpg","rw-11.jpg","rw-12.jpg","rw-13.jpg","rw-14.jpg"].map((f) => g("westbrook", f, "", "Russell and Nina Westbrook anniversary — Positano")).join("\n        ")}
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
  title: "Contact Us — Chromata Films | Global Luxury Destination Wedding Cinematographers",
  description: "Check your date with Chromata Films — global luxury destination wedding cinematographers. Tell us about your wedding and let's begin your journey.",
  main: `  <section class="film vignette" data-theme="dark" aria-label="Contact — cinematic header" style="height:100svh">
    <video src="assets/video/contact-header.mp4" poster="assets/video/contact-header-poster.jpg"
           muted loop playsinline autoplay data-ambient data-preload-track></video>
    <div class="film__shade"></div>
    <div class="hero__head">
      <p class="kicker" style="color:var(--gold-light)">— Contact Us</p>
      <h1 class="hero__title" style="font-size:clamp(2.2rem,5.5vw,5.6rem)">
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
            <p class="form-note">We answer every inquiry personally, usually within 48 hours. Planners: mention your studio — we love working with you.</p>
          </form>
        </div>
      </div>
    </div>
  </section>`,
});

for (const [file, html] of Object.entries(pages)) {
  writeFileSync(new URL("../" + file, import.meta.url), html);
  console.log("wrote", file);
}
