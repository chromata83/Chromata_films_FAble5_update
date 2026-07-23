// Chromata Films — generates all sub-pages from a shared shell.
// Run: node scripts/build-pages.mjs
import { writeFileSync } from "node:fs";

const EMAIL = "contact@chromatafilms.com";
const ADDRESS = "27 Rue de Montchoisy, 1207 Geneva, Switzerland";
// production domain — used to build absolute URLs for canonical / Open Graph / JSON-LD
const SITE_URL = "https://www.chromatafilms.com";

// light=true → dark-text nav for pages whose top section is light (e.g. journal
// articles); default is the cream nav--night used over dark video heroes.
const nav = (current, light = false) => `<header class="nav${light ? "" : " nav--night"}" id="nav">
  <a class="nav__brand" href="index.html" aria-label="Chromata Films — home">
    <img class="nav__logo" src="assets/img/logo-mark.png" alt="" />
    <span class="nav__wordmark">Chromata Films</span>
  </a>
  <nav class="nav__links" aria-label="Primary">
    <a class="nav__link" href="index.html">Home</a>
    <a class="nav__link" href="real-weddings.html"${["real-weddings", "domantas", "jacky", "anna", "westbrook", "vaux"].includes(current) ? ' aria-current="page"' : ""}>Real Weddings</a>
    <a class="nav__link" href="the-studio.html"${current === "studio" ? ' aria-current="page"' : ""}>The Studio</a>
    <a class="nav__link" href="journal.html"${current === "journal" ? ' aria-current="page"' : ""}>Journal</a>
    <a class="nav__link" href="gallery.html"${current === "gallery" ? ' aria-current="page"' : ""}>Gallery</a>
    <a class="nav__cta" href="contact.html">Contact Us</a>
  </nav>
  <button class="nav__burger" id="navBurger" aria-label="Open menu"><span></span><span></span><span></span></button>
</header>

<div class="mobile-menu" id="mobileMenu">
  <a class="big" href="index.html">Home</a>
  <a class="big" href="real-weddings.html">Real <em>Weddings</em></a>
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
      <a href="real-weddings.html">All Real Weddings</a>
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

const shell = ({ page, title, description, main, footerCta = true, noindex = false, headExtra = "", navLight = false }) => `<!DOCTYPE html>
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
<link rel="stylesheet" href="css/main.css?v=48" />${headExtra ? "\n" + headExtra : ""}
</head>
<body data-page="${page}">

${PRELOADER}

${nav(page, navLight)}

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
<script src="js/main.js?v=32" defer></script>
</body>
</html>
`;

const next = (href, label) => `  <a class="nextproject" href="${href}" data-theme="dark">
    <p class="kicker">— Next wedding</p>
    <div class="np-title">${label} <em>→</em></div>
  </a>`;

const g = (folder, n, cls = "", alt = "") =>
  `<figure class="gitem ${cls} mat img-reveal"><img src="assets/img/${folder}/${n}" alt="${alt}" loading="lazy"></figure>`;

const venueFigure = (folder, file, caption) =>
  `<figure class="mat img-reveal venue-figure"><img src="assets/img/${folder}/${file}" alt="${caption} — Chromata Films" loading="lazy"><figcaption>${caption}</figcaption></figure>`;

// Vimeo player URL for a video field that's either a plain ID string or an
// { id, hash } object (unlisted videos require ?h=<hash> or the embed 404s).
const vimeoSrc = (v) => {
  const id = typeof v === "string" ? v : v.id;
  const hash = typeof v === "string" ? null : v.hash;
  return `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ""}`;
};
const videoEmbedUrl = (video, provider) =>
  provider === "youtube" ? `https://www.youtube-nocookie.com/embed/${video}` : vimeoSrc(video);

/* ---- Journal vendor/venue outbound links ----
   Every real business name credited in a journal post's prose gets linked to
   its verified official site (or best verified fallback — see notes). Each
   entry lists every spelling variant seen across the archive so one dictionary
   covers all posts; linkVendors() matches the longest applicable variant at
   each position so e.g. "Villa Ephrussi de Rothschild" wins over "Villa
   Ephrussi" where both would apply. Names NOT here (Event Boutique, Loli
   Events, LS Planning, Weds4U, Villa Gastel) could not be verified with
   confidence and were deliberately left as plain text rather than guessed. */
const VENDOR_LINKS = [
  { url: "https://www.villa-ephrussi.com/en", variants: ["Villa Ephrussi de Rothschild", "Villa Ephrussi"] },
  { url: "https://www.fourseasons.com/capferrat/", variants: ["Grand-Hôtel du Cap-Ferrat, a Four Seasons Hotel", "Grand-Hôtel du Cap-Ferrat", "Four Seasons Cap-Ferrat", "Grand-Hôtel in Cap-Ferrat"] },
  { url: "https://www.oetkerhotels.com/hotels/chateau-saint-martin/", variants: ["Château Saint-Martin & Spa"] },
  { url: "https://www.estoublon.com/en/", variants: ["Château d'Estoublon"] },
  { url: "https://www.montecarlosbm.com/en/hotel-monaco/residences/villa-la-vigie", variants: ["Villa La Vigie"] },
  { url: "https://www.oetkerhotels.com/hotels/hotel-du-cap-eden-roc/", variants: ["Hôtel du Cap-Eden-Roc"] },
  { url: "https://airelles.com/en/destination/gordes-hotel", variants: ["Bastide de Gordes"] },
  { url: "https://chateausaintgeorges-grasse.com/", variants: ["Château St Georges"] },
  { url: "https://www.lebeauvallon.com/", variants: ["Le Beauvallon", "Beauvallon Hotel", "Hôtel Beauvallon"] },
  { url: "https://www.chateauberne.com/en/", variants: ["Château de Berne"] },
  { url: "https://chateaudelagaude.com/en", variants: ["Château de la Gaude"] },
  { url: "https://vaux-le-vicomte.com/en/", variants: ["Vaux-le-Vicomte"] },
  { url: "https://www.carrieres-lumieres.com/en", variants: ["Les Carrières de Lumières"] },
  { url: "https://yacht-club-monaco.mc/en/home/", variants: ["Monaco Yacht Club"] },
  { url: "https://www.selman-marrakech.com/", variants: ["Selman hotel", "Selman Hotel"] },
  { url: "https://www.villaerba.it/en/", variants: ["Villa Erba"] },
  { url: "https://theheritage-collection.com/villa-balbiano/", variants: ["Villa Balbiano"] },
  { url: "https://www.villabonomi.com/", variants: ["Villa Bonomi"] },
  { url: "https://www.hotelvillacortine.com/", variants: ["Villa Cortine Palace Hotel"] },
  { url: "https://www.roccofortehotels.com/hotels-and-resorts/masseria-torre-maizza/", variants: ["Rocco Forte Hotel"] },
  { url: "https://www.cattedralemonopoli.net/cattedralemonopoli/", variants: ["Cathedral of Monopoli"] },
  { url: "https://www.altosdechavon.com", variants: ["Altos de Chavón"] },
  { url: "https://www.ritzparis.com", variants: ["the Ritz"] },
  { url: "https://en.chateauversailles.fr", variants: ["gardens of Versailles"] },
  { url: "https://www.musee-rodin.fr", variants: ["Musée Rodin"] },
  { url: "https://sumptuous-events.com/", variants: ["Sumptuous Events"] },
  { url: "https://houseofkirschner.com/", variants: ["House of Kirschner"] },
  { url: "https://lavenderandrose.com/", variants: ["Lavender and Rose"] },
  { url: "https://cocoon-events.com/", variants: ["Cocoon Events"] },
  { url: "https://sacksproductions.com/", variants: ["Sacks Productions"] },
  { url: "https://www.eventoile.com", variants: ["Eventoile"] },
  { url: "https://www.artego-events.com", variants: ["Artego Luxury Events"] },
  { url: "https://www.theweddingplannersmonaco.com/", variants: ["The Wedding Planners Monaco"] },
  { url: "https://www.aavawedding.com/en/", variants: ["Aava Weddings"] },
  { url: "https://www.palazzoeventi.com", variants: ["Palazzo Eventi"] },
  { url: "https://italianweddingsandevents.com/", variants: ["Italian Weddings and Events"] },
  { url: "https://dashochzeitswerk.de/", variants: ["Das Hochzeitswerk"] },
  { url: "https://whitelabel-events.com/", variants: ["White Label Events"] },
  { url: "https://weddingplannerprovence.com/", variants: ["WEP"] },
  { url: "https://www.mindyweiss.com", variants: ["Mindy Weiss"] },
  { url: "https://www.kbydesigns.com/", variants: ["KBY Designs"] },
  { url: "https://roni-floral-design.com/en/", variants: ["Roni Florals Design", "Roni Floral Design", "Roni Flora Design", "Roni Florals", "Roni Floral"] },
  { url: "https://deco-flamme.com/en/", variants: ["Deco Flamme"] },
  { url: "https://www.floresie.com/", variants: ["Floresie"] },
  { url: "http://www.floral-events.com/", variants: ["Chiara Sperti"] },
  { url: "https://www.vincenzodascanio.it/", variants: ["Vincenzo Dascanio"] },
  { url: "https://www.bastien-blanc-tailleur.com/en", variants: ["Bastien Blanc Tailleur"] },
  { url: "https://bouchra-paris.com/", variants: ["Bouchra Sugar Design", "Bouchra Paris"] },
  { url: "https://floraison-paris.com/", variants: ["Floraison Paris"] },
  { url: "https://www.rattiflora.com/", variants: ["Rattiflora"] },
  { url: "https://www.inspiration-music.com/", variants: ["Inspiration Live Music"] },
  { url: "https://nuart.it/", variants: ["Nuart Events", "Nuarts"] },
  { url: "https://vogueliveband.com/en/", variants: ["Vogue Live Band", "Vogue Live band"] },
  { url: "https://www.facebook.com/kuriozia/", variants: ["Artistes Kurioza Events", "Artiste Kurioza Events"] },
  { url: "https://www.festivalmibely.com/en/", variants: ["Festival Mibely"] },
  { url: "https://en.festivalbandparis.com/", variants: ["Festival Band Paris"] },
  { url: "https://www.sublimesparis.com/en", variants: ["Sublimes Paris", "Sublime Paris"] },
  { url: "https://www.jazzaroundmidnight.com/", variants: ["Jazz Around Midnight"] },
  { url: "https://visionairevents.com/", variants: ["Visionairevents"] },
  { url: "https://www.blunotteventi.com/", variants: ["Blunotte Eventi"] },
  { url: "https://selecktive.com/", variants: ["Selecktive"] },
  { url: "https://www.maddychristina.com", variants: ["Maddy Christina"] },
  { url: "https://www.bottega53.com/", variants: ["Bottega53", "Bottega 53"] },
  { url: "https://germanlarkin.com/", variants: ["German Larkin"] },
  { url: "https://www.ettorefranceschi.com/", variants: ["Ettore Franceschi"] },
  { url: "https://oliverfly.com/", variants: ["Oliver Fly"] },
  { url: "https://roman-ivanov.com/", variants: ["Roman Ivanov"] },
  { url: "https://www.lesecretdaudrey.com/", variants: ["Les Secrets d'Audrey"] },
  { url: "https://cedricklein.com/", variants: ["Cedric Klein"] },
  { url: "https://www.belathee.com/", variants: ["Belathee Photography"] },
  { url: "https://clairemorrisphotography.com/", variants: ["Claire Morris"] },
  { url: "https://www.davidbastianoni.com/", variants: ["David Bastianoni"] },
  { url: "https://www.lostinlovephotography.com/", variants: ["Lost in Love Photography"] },
  { url: "https://www.thierryjoubert.com/", variants: ["Thierry Joubert"] },
  { url: "https://sandraaberg.com/", variants: ["Sandra Aberg"] },
  { url: "https://emmanuellemarty.com/", variants: ["Emmanuelle Marty"] },
  { url: "https://www.daniloandsharon.com/", variants: ["Danilo and Sharon Studio"] },
  { url: "https://www.reina-kim.com/", variants: ["Reina Kim"] },
  { url: "https://ziadnakad.com/", variants: ["Ziad Nakad"] },
  { url: "https://lovestoriestv.com/wedding-film-awards", variants: ["Love StoryTV"] },
  { url: "https://www.ritzcarlton.com/en/hotels/dalrz-the-ritz-carlton-dallas/overview/", variants: ["Ritz-Carlton Dallas"] },
  { url: "https://www.gabrielerizzilab.com/", variants: ["Gabriele Rizzi Lab"] },
  { url: "https://www.jordankahnmusiccompany.com/", variants: ["Jordan Kahn Music Company"] },
  { url: "https://thechainsmokers.com/", variants: ["The Chainsmokers"] },
  { url: "https://lgpelite.co.uk/", variants: ["LGP Elite Experiences"] },
  { url: "https://www.bayerbros.com/", variants: ["Bayer Brothers Sets"] },
  { url: "https://www.grodesigns.com/", variants: ["GRŌ designs", "GRŌ Designs"] },
  { url: "https://www.partydallas.com/", variants: ["Party! Dallas"] },
  { url: "https://stage2lighting.com/", variants: ["Stage 2 Lighting"] },
  { url: "https://www.instagram.com/alexbramall/", variants: ["Alex Bramall"] },
];
const VENDOR_FLAT = VENDOR_LINKS
  .flatMap((e) => e.variants.map((v) => ({ v, url: e.url })))
  .sort((a, b) => b.v.length - a.v.length);
const VENDOR_URL_BY_TEXT = new Map(VENDOR_FLAT.map((e) => [e.v, e.url]));
// "the Ritz" (→ Ritz Paris) needs a guard: length-sort only resolves ties at
// the SAME start position, but "the Ritz-Carlton Dallas" lets the shorter
// "the Ritz" match 4 chars earlier than "Ritz-Carlton Dallas" could even
// start, so it wins by position and mislinks a different hotel chain to
// ritzparis.com. Excluding "-Carlton" from following it fixes that specific
// collision without touching the general longest-wins sort for everyone else.
const VENDOR_RE = new RegExp(VENDOR_FLAT.map((e) => {
  const escaped = e.v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return e.v === "the Ritz" ? `${escaped}(?!-Carlton)` : escaped;
}).join("|"), "g");
const linkVendors = (text) =>
  text.replace(VENDOR_RE, (m) => `<a class="vendor-link" href="${VENDOR_URL_BY_TEXT.get(m)}" target="_blank" rel="noopener noreferrer">${m}</a>`);

const pages = {};

/* AI-generated wedding-design concepts (assets/img/aimc) — shared between the
   AI masterclass post and the earlier AI-in-the-wedding-industry post. */
const AIMC_GALLERY = [
  { file: "aimc-01.jpg", alt: "A hand sketch of an ornate palace facade dressed for a wedding, the starting point for an AI visualization" },
  { file: "aimc-02.jpg", alt: "A line drawing of a floral wedding archway, ready to be turned into a photoreal image with AI" },
  { file: "aimc-03.jpg", alt: "Sketch to reality: a drawn statue and pedestal beside its AI-rendered floral version" },
  { file: "aimc-04.jpg", alt: "Sketch to reality: a drawn urn beside its AI-rendered white-flower arrangement" },
  { file: "aimc-05.jpg", alt: "A pencil concept transformed by AI into a photoreal ostrich-feather table centerpiece" },
  { file: "aimc-06.jpg", alt: "AI-rendered wedding decor concept set in the gardens of Villa Ephrussi de Rothschild" },
  { file: "aimc-07.jpg", alt: "AI-rendered wedding decor concept at the Hotel du Cap-Eden-Roc, palms and pool at golden hour" },
  { file: "aimc-08.jpg", alt: "AI-rendered floral aisle in the courtyard of the Grand-Hotel du Cap-Ferrat" },
  { file: "aimc-09.jpg", alt: "AI-rendered reception concept on the terrace of Villa Balbiano, Lake Como, framed by wisteria" },
  { file: "aimc-10.jpg", alt: "AI-rendered open-sky church ceremony draped in wisteria and white flowers" },
  { file: "aimc-11.jpg", alt: "An AI mood board of a dozen round wedding tables laid out across a garden reception" },
  { file: "aimc-12.jpg", alt: "An AI variation showing a long rectangular banquet table with green velvet chairs and white florals" },
  { file: "aimc-13.jpg", alt: "AI-rendered dinner setup with towering white ostrich-feather centerpieces in an opulent interior" },
  { file: "aimc-14.jpg", alt: "AI-rendered tablescape dressed with ostrich feathers and pampas in an arched venue" },
  { file: "aimc-15.jpg", alt: "An AI variation replacing the reception tables with new white floral centerpieces" },
  { file: "aimc-16.jpg", alt: "An isometric AI view of a wedding table and floral pedestal setup for planning layouts" },
  { file: "aimc-17.jpg", alt: "A dramatic AI concept: a neon-lit floral stage with a projected face for a modern reception" },
  { file: "aimc-18.jpg", alt: "An AI concept of a garden ceremony framed by lavender and purple floral installations" },
];

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
      <div class="vidpair" aria-label="Anna Andres — vertical wedding films">
        <div class="vidpair__item">
          <iframe data-lazy-src="https://player.vimeo.com/video/466573692?h=39a3243ffd" title="Anna Andres wedding — vertical film" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
        </div>
        <div class="vidpair__item">
          <iframe data-lazy-src="https://player.vimeo.com/video/466573597?h=6b59c916d3" title="Anna Andres wedding — vertical film" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
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

  <!-- GASP scroll-scrubbed film band (2.39:1 cinemascope) between the blockbusters and "beyond the frame" -->
  <section class="film film--band film--scope vignette" data-scrub data-film-nopin data-theme="dark" data-section aria-label="Chromata Films — cinematic film">
    <video data-src="assets/video/studio-film.mp4" data-src-mobile="assets/video/studio-film-mobile.mp4"
           poster="assets/video/studio-film-poster.jpg" muted playsinline preload="metadata"></video>
    <div class="film__shade"></div>
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
    file: "journal-analog-film-weddings.html", slug: "analog-film-weddings",
    title: "Super 8mm and Super 16mm — When Analog Comes Back Into Our Lives",
    date: "June 12, 2026", tag: "Trend · Editorial",
    thumb: "journal-thumbs/analog-film-weddings.jpg",
    verticalVideos: [
      { id: "1140692063", hash: "d480349846" },
      { id: "1140691721", hash: "c56b67af06" },
      { id: "1140691515", hash: "1b5929c874" },
    ],
    seo: {
      title: "Super 8mm and Super 16mm — Analog Film Is Back at Weddings | Chromata Films",
      description: "Why couples are choosing real analog film again: the data behind the 2025–2026 Super 8 and 16mm wedding trend, and how Chromata Films shoots true 16mm on real weddings.",
      keywords: "Super 8mm wedding film, 16mm wedding videographer, analog wedding film, film wedding video trend 2025, Super 8 wedding video, Kodak Super 8, vintage wedding film, best wedding videographers in Europe, Chromata Films",
    },
    excerpt: "Real analog film is back on wedding days ... not a digital filter, but true Super 8mm and 16mm motion-picture film. Here's the data behind the trend, and how Chromata Films shoots it for real.",
    body: [
      "Something old is new again on wedding days: real analog film. Not a digital filter dressed up to look like film ... actual Super 8mm and 16mm motion-picture film, shot on cameras built decades before anyone owned a phone, processed and scanned by hand. After years of 4K, drones and infinite retakes, more and more couples are asking us for grain again.",
      "The numbers back up what we're seeing on set. Pinterest's 2025 Wedding Trends Report found searches for \"film wedding photos\" up 2,258 percent year over year, and The Knot's 2025 wedding-video trend coverage named Super 8, blended with digital footage, as one of the year's defining looks. Kodak, meanwhile, reported film stock sales rising roughly 20 percent in 2024 and released a new Super 8 camera that same year ... its first major update to the format in more than three decades.",
      "Grain and warmth are only part of it. Shooting on film removes the infinite-takes safety net of digital: there is no monitor to check mid-scene, no instant replay, just a fixed number of minutes on a roll and a commitment to the moment as it actually happens. For a generation that has already brought disposable cameras back to the reception table, and that reaches for the soft, imperfect look of 90s and 2000s home movies over anything hyper-polished, that constraint feels less like a limitation and more like the entire point.",
      "It is also genuinely rare. A standard 400-foot roll of 16mm holds around eleven minutes of footage at 24 frames per second, must be processed and scanned by a specialist lab in the days after the wedding, and captures no audio on its own ... every roll is a decision, not a default. Very few working wedding videographers own the cameras, know how to load them correctly, or have a lab relationship that can turn a wedding weekend around in time for the final edit. It sits closer to cinematography school than modern content creation.",
      "It's a discipline we've built into the studio rather than treated as a novelty. Michael Bod, part of the Chromata Films team, is our dedicated 16mm film and portrait specialist ... one of the only wedding filmmakers we know of who shoots true analog motion-picture film on real weddings, grain, halation and all, rather than a digital \"film-look\" preset applied after the fact. It sits alongside our standard cinema coverage, not instead of it: Super 8 and 16mm can't replace a full wedding film on their own (no built-in sound, only a handful of minutes per roll), but as a companion reel, it gives a day a texture that no amount of 4K can fake.",
      "Below are a few frames from recent rolls, shown exactly as they come back from the lab ... unretouched, ungraded, straight off the film.",
      "If you're planning a wedding and want a reel that will look and feel the same in thirty years as it does today, ask us about shooting on film. It won't be for every couple, or every moment of the day ... but for the right few minutes, nothing digital has matched it yet.",
    ],
  },
  {
    file: "journal-marcella-daniel.html", slug: "marcella-daniel",
    title: "Marcella Raneri and Daniel Nutkis — A Floral Engagement Party at the Ritz-Carlton Dallas, with a Surprise Set by The Chainsmokers",
    date: "April 19, 2025", tag: "Engagement · Press",
    video: "1078314523",
    galleryDir: "marcella-daniel",
    seo: {
      title: "Marcella Raneri & Daniel Nutkis Engagement Party — Ritz-Carlton Dallas | Chromata Films",
      description: "Inside Marcella Raneri and Daniel Nutkis's 200,000-stem floral engagement party at the Ritz-Carlton Dallas, featuring a surprise DJ set by The Chainsmokers. Filmed by Chromata Films.",
      keywords: "Marcella Raneri, Daniel Nutkis, engagement party Dallas, Ritz-Carlton Dallas wedding videographer, The Chainsmokers DJ set, Roni Floral Design, luxury engagement party film, Dallas wedding videographer, Chromata Films",
      ogImage: "marcella-raneri-daniel-nutkis-engagement-04.jpg",
    },
    credits: [
      { role: "Venue", name: "Ritz-Carlton Dallas", url: "https://www.ritzcarlton.com/en/hotels/dalrz-the-ritz-carlton-dallas/overview/" },
      { role: "Event Planning & Design", name: "Lucia Garibay · LGP Elite Experiences", url: "https://lgpelite.co.uk/" },
      { role: "Event & Floral Design", name: "Nicolas Barelier · Roni Floral Design", url: "https://roni-floral-design.com/en/" },
      { role: "Immersive Entertainment", name: "Gabriele Rizzi Lab", url: "https://www.gabrielerizzilab.com/" },
      { role: "Band", name: "Jordan Kahn Music Company", url: "https://www.jordankahnmusiccompany.com/" },
      { role: "Headliner DJs", name: "The Chainsmokers", url: "https://thechainsmokers.com/" },
      { role: "Set Design", name: "Bayer Brothers Sets", url: "https://www.bayerbros.com/" },
      { role: "Production Design", name: "GRŌ designs", url: "https://www.grodesigns.com/" },
      { role: "Furniture & Rentals", name: "Party! Dallas", url: "https://www.partydallas.com/" },
      { role: "Lighting & Sound", name: "Stage 2 Lighting", url: "https://stage2lighting.com/" },
      { role: "Photography", name: "Alex Bramall", url: "https://www.instagram.com/alexbramall/" },
      { role: "Videography", name: "Chromata Films" },
    ],
    excerpt: "Marcella Raneri and Daniel Nutkis's 200,000-stem floral engagement party at the Ritz-Carlton Dallas ... a vintage trolley entrance, a Parisian-street ballroom, and a surprise set by The Chainsmokers.",
    body: [
      "When Marcella Raneri and Daniel Nutkis celebrated their engagement at the Ritz-Carlton Dallas, the brief was simple in ambition and enormous in scale: a spring-themed party dressed in roughly 200,000 stem flowers, the first chapter in a four-season lead-up to their wedding. Guests arrived by vintage trolley car, driven straight through a cascading floral canopy into a ballroom built to look like a Parisian street in full bloom.",
      "Every inch of the room carried the theme. Nicolas Barelier led the event and floral design in partnership with Roni Floral Design ... the French Riviera florist's global reputation, built on projects like the Paris Opera, made them, in Marcella's words, \"truly the perfect team to bring our vision to life.\" Bayer Brothers Sets and GRŌ designs built the scenic production around them, Party! Dallas supplied the bespoke furniture, and Stage 2 Lighting shaped the room after dark.",
      "The night's entertainment carried its own surprise. Gabriele Rizzi Lab staged the immersive elements ... a slow-motion petal-toss booth, a live artist sketching guests into floral portraits ... while Jordan Kahn Music Company anchored the live band. Then, midway through the night, The Chainsmokers stepped out for a full surprise DJ set. Marcella and Daniel had met the duo after watching them perform in Las Vegas earlier that year and booked them on the spot. \"I immediately thought it would be the perfect vibe for our guests,\" Marcella said. By the time Drew Taggart dropped into \"Paris,\" the room was unrecognisable from the dinner that had just ended.",
      "Around 300 guests, including Alyssa Edwards and Hope Beel, spent the night under a ceiling that seemed to rain petals, with Alex Bramall documenting every detail in photographs and our own cameras capturing the film. \"It absolutely surpassed my expectations,\" Marcella told Local Profile after the party. \"One of my favorite moments was the look on everyone's faces when The Chainsmokers came out.\"",
      "This is the first of four seasonal celebrations Marcella and Daniel are building toward their wedding ... spring for the engagement, summer for the hen party, autumn for the bridal shower, and winter, finally, for the wedding itself. If the opening chapter is anything to go by, the finale will be extraordinary. We can't wait to be there for it.",
    ],
    gallery: [
      { file: "marcella-raneri-daniel-nutkis-engagement-01.jpg", alt: "A vintage trolley car under a cascading rose and floral canopy entrance at Marcella Raneri and Daniel Nutkis's engagement party, Ritz-Carlton Dallas" },
      { file: "marcella-raneri-daniel-nutkis-engagement-02.jpg", alt: "Models in couture floral gowns beneath a rose archway at Marcella Raneri and Daniel Nutkis's floral-themed engagement party" },
      { file: "marcella-raneri-daniel-nutkis-engagement-03.jpg", alt: "Marcella Raneri and Daniel Nutkis pose in front of a floral butterfly-wing backdrop at their Ritz-Carlton Dallas engagement party" },
      { file: "marcella-raneri-daniel-nutkis-engagement-04.jpg", alt: "Marcella Raneri in a rose-petal ball gown on the dance floor at her Dallas engagement party" },
      { file: "marcella-raneri-daniel-nutkis-engagement-05.jpg", alt: "The floral-canopied stage and dance floor moments before The Chainsmokers' surprise performance" },
      { file: "marcella-raneri-daniel-nutkis-engagement-06.jpg", alt: "Guests dancing beneath oversized floral installations at Marcella Raneri and Daniel Nutkis's engagement party" },
      { file: "marcella-raneri-daniel-nutkis-engagement-07.jpg", alt: "The Chainsmokers DJing a surprise set for Marcella Raneri and Daniel Nutkis's engagement party guests" },
    ],
  },
  {
    file: "journal-maxence-elise-caqueret.html", slug: "maxence-elise-caqueret",
    title: "Maxence and Elise Caqueret — A Private Wedding Film",
    date: "October 10, 2024", tag: "Real Wedding",
    video: "1018353157",
    thumb: "journal-thumbs/maxence-elise-caqueret.jpg",
    seo: {
      title: "Maxence and Elise Caqueret — A Private Wedding Film | Chromata Films",
      description: "An intimate, family-only wedding film for footballer Maxence Caqueret and Elise, captured with discretion by Chromata Films.",
      keywords: "Maxence Caqueret wedding, private wedding videographer, discreet wedding film, footballer wedding, luxury wedding cinematography, Chromata Films",
    },
    excerpt: "An intimate, family-only wedding film for Maxence and Elise Caqueret, captured with the same discretion they asked of everyone in the room.",
    body: [
      "Some weddings are built for the world to see; others are kept close, shared only with the people who matter most. When Maxence and Elise Caqueret married, they chose the second path ... an intimate, family-only celebration, captured with the same discretion they asked of everyone in the room.",
      "Maxence plays professional football at the highest level, currently with Como 1907 in Italy's Serie A after coming through the Olympique Lyonnais academy. That public life made the choice to keep this day private a deliberate one ... and it shaped how we filmed it: fewer wide establishing shots of the venue, more time spent close to the couple, following the day as it was actually lived rather than staged for an audience.",
      "That is the craft of a private wedding film. There is no red carpet to lean on, no press moment to build toward ... just two families brought together, and a couple who wanted the film to feel like a memory rather than a broadcast. We are grateful Maxence and Elise trusted us with that distinction.",
      "To Maxence and Elise: congratulations, and thank you for letting our cameras into a day that belonged entirely to you.",
    ],
  },
  {
    file: "journal-ai-masterclass.html", slug: "ai-masterclass",
    title: "AI Wedding Masterclass for Planners and Designers",
    date: "September 29, 2025", tag: "Masterclass",
    video: "1122868433",
    galleryDir: "aimc",
    seo: {
      title: "AI Wedding Masterclass for Planners & Designers | Chromata Films",
      description: "Turn sketches into photoreal wedding concepts with Midjourney and AI. A hands-on masterclass for planners and designers by Chromata Films founder Kevin Lopez.",
      keywords: "AI wedding masterclass, Midjourney for wedding planners, AI wedding design, wedding visualization, AI for event designers, sketch to photoreal, Kevin Lopez, Chromata Films, Wed Design AI",
      ogImage: "aimc-06.jpg",
    },
    cta: {
      label: "Get the Masterclass →",
      href: "https://www.weddesignsai.com/weddesignmasterclass",
      sub: "Hosted on Wed Design AI ... hands-on Midjourney training for wedding planners and designers.",
    },
    excerpt: "Learn how to turn sketches into photoreal wedding concepts with Midjourney and AI. A hands-on masterclass for planners and designers, led by Chromata Films founder Kevin Lopez.",
    body: [
      "The wedding industry is in the middle of a creative revolution, and the planners and designers who embrace artificial intelligence are gaining a real competitive edge. After a decade in visual effects and nine years filming luxury weddings, we have watched AI move from novelty to genuine production tool ... so we built a masterclass to help designers get in front of that curve, not behind it.",
      "It is led by Kevin Lopez, our founder and a former VFX artist. His work brings together years of film and visual-effects craft with a lifelong love of painting, animation and visual storytelling ... and one simple belief: these tools should help you express your vision faster, never replace the craft behind it.",
      "The Wed Design AI Masterclass is entirely hands-on. You will learn Midjourney and a set of complementary visualization tools from the ground up: how to turn a simple line drawing into a photorealistic image, and how to place a design inside a client's actual venue so they can see it before a single flower is ordered.",
      "The payoff is speed and clarity. You will transform abstract client ideas into stunning visual concepts in minutes, generate multiple design options at a pace that was impossible before, and build professional proposals that win more bookings ... photoreal mood boards, tablescape variations and lighting studies at golden hour versus candlelight, all rendered in the real space.",
      "We also cover the boundaries. Through real case studies, ethical frameworks and guided exercises, you will learn what AI is genuinely good at ... concept, mood and iteration speed ... and where it should never be used, such as representing another vendor's real work or replacing real coverage of a real day. Couples hire us for truth, beautifully told; AI simply helps us plan the telling.",
      "Whatever your technical background, you will leave with a workflow you can put to use the very next morning. The masterclass is available now at <a class='text-link' href='https://www.weddesignsai.com/weddesignmasterclass' target='_blank' rel='noopener noreferrer'>Wed Design AI</a>.",
    ],
    galleryHeading: "From sketch to photoreal — made with AI",
    gallery: AIMC_GALLERY,
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
    galleryDir: "westbrook",
    gallery: Array.from({ length: 14 }, (_, i) => `rw-${String(i + 1).padStart(2, "0")}.jpg`),
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
    video: "948291710",
    galleryDir: "parisian-dream",
    gallery: Array.from({ length: 18 }, (_, i) => `pd-${String(i + 1).padStart(2, "0")}.jpg`),
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
    galleryDir: "olympics",
    seo: {
      title: "Paris 2024 Olympics Reimagined as a Wedding (AI) | Chromata Films",
      description: "AI reimagines the Paris 2024 Olympics as a luxury wedding: brides carrying the torch, fencing in couture and rowing the Seine. See the full Chromata Films editorial.",
      keywords: "Paris 2024 Olympics, AI wedding editorial, AI wedding photography, luxury wedding cinematography, wedding art direction, Chromata Films, Paris wedding, Olympic Games wedding concept",
      ogImage: "oly-02.jpg",
    },
    excerpt: "What would the Paris 2024 Olympics look like as a wedding? Chromata Films reimagined the Games as a luxury wedding editorial, built entirely with AI image generation.",
    body: [
      "The Paris 2024 Olympics were gearing up to be an extraordinary affair, blending athleticism with a whimsical, unmistakably French sense of spectacle. As a studio obsessed with both Paris and grand celebrations, we asked ourselves a ridiculous question: what would the Games look like if they were a wedding?",
      "Using AI image generation, we built a full visual editorial: brides carrying the Olympic torch, grooms fencing in couture, athletes leaping in front of the Eiffel Tower, and stadiums carpeted in rose petals like the world's largest ballroom. Brides row a boat down the Seine, a nod to the opening ceremony; a torchbearer holds the flame in flowing white. Absurd? Completely. Gorgeous? We think so too.",
      "Beyond the fun, this project was a serious technical exercise. Art-directing AI at editorial quality demands the same disciplines as a real shoot: consistent lighting logic, a coherent colour story, wardrobe continuity and ruthless curation. Of the thousands of frames generated, only a handful survived our edit ... the same ratio, honestly, as a real wedding day.",
      "This experiment became the seed of our AI masterclass for wedding planners and designers. The tools are here; the taste is the differentiator. And taste, after a decade of film and VFX, is the one thing we never outsource.",
    ],
    galleryHeading: "The editorial — Paris 2024, reimagined as a wedding",
    gallery: [
      { file: "oly-01.jpg", alt: "Aerial view of grooms in black tuxedos lined up on an athletics track like sprinters at the start — AI wedding editorial" },
      { file: "oly-02.jpg", alt: "Two brides in Olympic sportswear celebrating in front of the Olympic rings in Paris — AI-generated wedding editorial" },
      { file: "oly-03.jpg", alt: "Vogue-style cover portrait of a bride crowned with a golden Olympic headpiece" },
      { file: "oly-04.jpg", alt: "A bride and groom fencing in white couture among white roses" },
      { file: "oly-05.jpg", alt: "A couple fencing in a candlelit ballroom, the bride in an ornate white gown" },
      { file: "oly-06.jpg", alt: "Bride in a cream ruffled gown reclining on a bed of rose petals in an Olympic stadium" },
      { file: "oly-07.jpg", alt: "Bride in a flowing gown sprinting across a stadium field carpeted in rose petals" },
      { file: "oly-08.jpg", alt: "A bride and groom among towering floral installations in a petal-filled Olympic stadium" },
      { file: "oly-09.jpg", alt: "Bride with a sweeping train stretched across a flower-covered stadium field" },
      { file: "oly-10.jpg", alt: "A bride and a partner in black racing across a rose-petal stadium track" },
      { file: "oly-11.jpg", alt: "Bride as an Olympic torchbearer in a white jumpsuit, the cauldron flame burning behind her" },
      { file: "oly-12.jpg", alt: "Bride pole-vaulting with a billowing veil under the floodlights of an Olympic stadium" },
      { file: "oly-13.jpg", alt: "An athlete in black clearing a hurdle past a row of brides in a packed Olympic stadium" },
      { file: "oly-14.jpg", alt: "Bride mid long-jump in front of the Eiffel Tower as grooms lie below and the Olympic flame burns" },
      { file: "oly-15.jpg", alt: "A team of brides rowing a boat down the Seine beneath a historic Paris bridge" },
      { file: "oly-16.jpg", alt: "Brides rowing a white boat past a stone bridge on the Seine, echoing the Paris 2024 opening ceremony" },
    ],
  },
];

/* ---- Historical journal archive (migrated from the original blog) ---- */
const archive = [
  /* ===================== Page 2 ===================== */
  {
    file: "journal-france-venues.html", page: 2, tag: "Guide",
    title: "Our Favourite Venues in the South of France", date: "April 22, 2024",
    galleryDir: "france-venues",
    inlineMedia: [
      { after: 1, items: [{ file: "fv-01.jpg", caption: "Villa Ephrussi de Rothschild", alt: "Villa Ephrussi de Rothschild wedding venue, South of France — Chromata Films" }] },
      { after: 2, items: [{ file: "fv-02.jpg", caption: "Grand-Hôtel du Cap-Ferrat", alt: "Grand-Hôtel du Cap-Ferrat wedding venue, South of France — Chromata Films" }] },
      { after: 3, items: [{ file: "fv-03.jpg", caption: "Bastide de Gordes", alt: "Bastide de Gordes wedding venue, South of France — Chromata Films" }] },
      { after: 4, items: [{ file: "fv-04.jpg", caption: "Château Saint-Martin & Spa", alt: "Château Saint-Martin & Spa wedding venue, South of France — Chromata Films" }] },
      { after: 5, items: [{ file: "fv-05.jpg", caption: "Château d'Estoublon", alt: "Château d'Estoublon wedding venue, South of France — Chromata Films" }] },
      { after: 6, items: [{ file: "fv-06.jpg", caption: "Villa La Vigie", alt: "Villa La Vigie wedding venue, South of France — Chromata Films" }] },
      { after: 7, items: [{ file: "fv-07.jpg", caption: "Hôtel du Cap-Eden-Roc", alt: "Hôtel du Cap-Eden-Roc wedding venue, South of France — Chromata Films" }] },
    ],
    excerpt: "Dreaming of a fairytale wedding bathed in the golden light of the French Riviera, or nestled amidst the lavender fields of Provence? A tour of our most enchanting venues to celebrate your love story.",
    body: [
      "Dreaming of a fairytale wedding bathed in the golden light of the French Riviera, or nestled amidst the lavender fields of Provence? This breathtaking region offers a symphony of romance, from sun-drenched coastlines to charming, rustic estates. Choosing the perfect venue can be overwhelming, so here are some of the most enchanting locations to celebrate your love story.",
      "Villa Ephrussi de Rothschild is a fairytale on the Côte d'Azur. This rose-pink palace, dreamed up by Béatrice de Rothschild, is wrapped in nine thematic gardens ... French, Florentine, Spanish, a stone garden, a Japanese garden and more ... each one a masterpiece of colour and design, and each a magical backdrop for your ceremony and portraits. It remains one of the most requested venues on the Riviera, and for good reason: nowhere else gives you this much romance in a single frame.",
      "The Grand-Hôtel du Cap-Ferrat, a Four Seasons Hotel, answers with timeless elegance. Picture your ceremony held in the central aisle of the gardens, the hotel rising behind you and the Mediterranean stretching to the horizon ... a setting that is genuinely hard to top. Once dinner is over, the celebration drifts down to the Club Dauphin, where the party carries on around the pool at the water's edge.",
      "Perched atop one of the most beautiful hilltop villages in France, the Bastide de Gordes offers sweeping panoramic views over the Luberon valley. Housed in a restored 17th-century farmhouse, it pairs rustic Provençal character with true five-star polish: a ceremony infused with the light of the countryside, then a reception on the terrace as the valley turns gold at sunset.",
      "Nestled amid the hills above Vence, Château Saint-Martin & Spa blends luxury with rustic charm. Parts of the estate date to the 12th century, and it offers a tranquil spa, gourmet dining and long views down to the sea. Imagine your ceremony in the courtyard, surrounded by cypress and olive trees, followed by a reception under a marquee built especially for the occasion. Magical.",
      "For a truly grand affair, Château d'Estoublon is the epitome of Provençal opulence. This 18th-century estate, wrapped in olive groves and vineyards, gives you a chapel for the ceremony, a lavish garden reception, fireworks over the grounds and a live band to carry the party deep into the night.",
      "Perched above the Baie des Anges, Villa La Vigie brings Art Deco charm and breathtaking panoramic views. Once a residence of Winston Churchill and later home to Karl Lagerfeld, the villa is the chic French Riviera style at its purest ... a ceremony on the terrace with the sea as your backdrop, and a reception in the gardens beneath the stars.",
      "And then there is the Hôtel du Cap-Eden-Roc, a true Riviera paradise. Its famous aisle runs from the hotel down through the pines to the ceremony spot ... the very setting Dior chose for its campaign with Natalie Portman, just to give you a sense of the drama. Spend the day beside the legendary seawater pool at the edge of the Mediterranean, then celebrate under the stars with the gentle sea breeze, and you will never quite see the world the same way again.",
      "With its stunning scenery, exquisite venues and rich culture, Provence and the French Riviera offer the perfect setting for a wedding you and your guests will cherish forever. And if you need help planning your destination wedding, we know a few wedding planners who would be delighted to help.",
    ],
  },
  {
    file: "journal-sandra-pedro.html", page: 2, tag: "Real Wedding",
    title: "Sandra and Pedro — A Mixed-Religion Ceremony at Château d'Estoublon", date: "February 21, 2024",
    video: "3AZhvvBCFjU", videoProvider: "youtube",
    galleryDir: "sandra-pedro",
    gallery: Array.from({ length: 20 }, (_, i) => `sp-${String(i + 1).padStart(2, "0")}.jpg`),
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
    video: "879796920",
    galleryDir: "four-seasons",
    gallery: Array.from({ length: 25 }, (_, i) => `fsb-${String(i + 1).padStart(2, "0")}.jpg`),
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
    video: "880169269",
    galleryDir: "daria",
    gallery: Array.from({ length: 29 }, (_, i) => `dl-${String(i + 1).padStart(2, "0")}.jpg`),
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
    video: "866854185",
    galleryDir: "natalia",
    gallery: Array.from({ length: 44 }, (_, i) => `nm-${String(i + 1).padStart(2, "0")}.jpg`),
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
    video: "858206093",
    thumb: "journal-thumbs/puglia-princess.jpg",
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
    video: "905275321",
    galleryDir: "katya-joey",
    gallery: Array.from({ length: 18 }, (_, i) => `kj-${String(i + 1).padStart(2, "0")}.jpg`),
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
    galleryDir: "carousel",
    inlineMedia: [
      { after: 1, items: [{ file: "c-37.jpg", caption: "Angela & Allister — Paris", alt: "Angela and Allister's luxury wedding in Paris, featured in Brides — Chromata Films" }] },
    ],
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
    galleryDir: "wed-europe",
    galleryHeading: "Scenes from our European weddings",
    gallery: Array.from({ length: 76 }, (_, i) => `we-${String(i + 1).padStart(2, "0")}.jpg`),
    seo: {
      title: "Planning a Destination Wedding in Europe — The Complete Guide | Chromata Films",
      description: "How to plan a luxury destination wedding in Europe: the most beautiful venues in Italy, France and Spain, timing and logistics, trusted planners, and how to choose the best wedding videographer in Europe for your day.",
      keywords: "destination wedding Europe, best wedding videographers in Europe, luxury wedding videographer, wedding film Europe, Lake Como wedding, French Riviera wedding, Paris wedding, Provence wedding, Spain destination wedding, European wedding planner, Chromata Films",
    },
    excerpt: "The complete guide to planning your European destination wedding ... the finest venues in Italy, France and Spain, timing, planners, and how to choose the best wedding videographer in Europe.",
    body: [
      "Are you and your partner searching for the perfect European destination to exchange your vows? Look no further than the charming, romantic countries of Italy, France and Spain. Each offers luxurious venues ... grand palaces, picturesque castles, beachfront villas ... alongside breathtaking landscapes, rich culture and ideal weather for a destination wedding in Europe. After a decade filming celebrations across all three, here is what we have learned, and how to make the right choices for your own day.",
      "Italy offers the perfect blend of romance and grandeur. Venice gives you gondolas and gilded palazzos; a Tuscan villa gives you golden light over the vineyards. Lake Como remains the crown jewel for luxury weddings ... we have filmed unforgettable celebrations at Villa Erba, Villa Balbiano and Villa Bonomi, where the mountains meet the water and every terrace feels like a film set. And further south, Puglia rewards couples who want warmth, whitewashed villages and cathedral ceremonies followed by masseria receptions under the stars.",
      "France brings glamour and sophistication in every register. Paris offers the grandest stages in the world ... the Ritz, the Musée Rodin, and châteaux like Vaux-le-Vicomte, the little Versailles, which can be privatised entirely for your celebration. The French Riviera, our home ground, concentrates more legendary venues per kilometre of coastline than anywhere on earth: Villa Ephrussi de Rothschild, the Grand-Hôtel du Cap-Ferrat and the Hôtel du Cap-Eden-Roc among them. Provence answers with lavender, olive groves and estates like Château d'Estoublon for couples who want their wedding to taste of the countryside.",
      "Spain is ideal for a beach wedding, from the Costa del Sol to the Balearic Islands. Marbella delivers polished glamour, Mallorca and Ibiza offer cliff-top villas above turquoise water, and the Spanish talent pool of planners, florists and entertainers is superb. If your guests dream of sunshine, late dinners and dancing until dawn, Spain will not disappoint.",
      "A word on timing and logistics. The European wedding season runs from May to late September, and the most requested venues are reserved twelve to eighteen months in advance ... start early, especially if you are considering a full venue buyout. Think in terms of a multi-day celebration: a welcome dinner, a beach or pool party, the wedding day itself and a farewell brunch. It is the format that makes a destination wedding feel like a holiday your guests will talk about for years.",
      "While we specialise in high-end cinematography, we know that finding the right planner is crucial, which is why we work closely with a network of experienced and reputable wedding planners across France, Italy and Spain who can turn your dream into reality. Tell us the country and the mood, and we will happily point you to the people we trust with our own clients' weddings.",
      "And then there is the question couples ask us most: how do you choose the best wedding videographer in Europe? Look for a studio that films weddings the way cinema films stories ... true cinema cameras rather than hybrid kits, licensed drone pilots, a fashion-film eye for couture and decor, and the discretion to disappear into the day. Ask to see full films, not just teasers; a beautiful minute is easy, a beautiful hour is craft. The only thing that remains as a souvenir of your special day is the film and the photography ... so surround yourself with true professionals.",
      "It is the standard we hold ourselves to at Chromata Films. Our studio has been named among the Top 15 wedding videographers in Europe, and our work has won the Wedding Film Award for Best Destination Wedding Film for a celebration at Lake Como. Based between Geneva and the French Riviera, we film luxury weddings across Italy, France, Spain and five continents, bringing a background in feature-film visual effects to every story we tell.",
      "So what are the next steps? Start by researching the destinations and venues that fit your style, then reach out to us. We can help with the documentation of your big day and connect you with the right planner to bring your dream wedding in Europe to life.",
    ],
  },
  {
    file: "journal-ai-wedding-industry.html", page: 3, tag: "AI · Editorial",
    title: "Artificial Intelligence and Why It Will Change the Wedding Industry", date: "January 19, 2023",
    galleryDir: "aimc",
    galleryHeading: "AI wedding-design concepts from our studio",
    gallery: AIMC_GALLERY,
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
    video: "788687357",
    verticalVideos: ["789230402", "789230943", "789231356"],
    galleryDir: "jasmiina",
    gallery: Array.from({ length: 45 }, (_, i) => `jt-${String(i + 1).padStart(2, "0")}.jpg`),
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
    video: "t7_JRwa1oDM", videoProvider: "youtube",
    galleryDir: "vaux",
    gallery: Array.from({ length: 11 }, (_, i) => `vlv-${String(i + 1).padStart(2, "0")}.jpg`),
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
    video: "764060129",
    galleryDir: "marrakech",
    gallery: Array.from({ length: 54 }, (_, i) => `ar-${String(i + 1).padStart(2, "0")}.jpg`),
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
    video: { id: "769436553", hash: "a19b51aede" },
    thumb: "journal-thumbs/ali-bakhtiar.jpg",
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
    thumb: "marrakech/ar-24.jpg",
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
    video: "704850376",
    galleryDir: "altos",
    gallery: Array.from({ length: 35 }, (_, i) => `lj-${String(i + 1).padStart(2, "0")}.jpg`),
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
    thumb: "domantas/ds-28.jpg",
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
    video: "642838113",
    galleryDir: "michal-steve",
    gallery: Array.from({ length: 14 }, (_, i) => `ms-${String(i + 1).padStart(2, "0")}.jpg`),
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
    thumb: "domantas/ds-27.jpg",
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
    verticalVideos: [{ id: "466573692", hash: "39a3243ffd" }, { id: "466573597", hash: "6b59c916d3" }],
    galleryDir: "anna",
    gallery: Array.from({ length: 12 }, (_, i) => `an-${String(i + 1).padStart(2, "0")}.jpg`),
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
    video: "453536410",
    galleryDir: "mozzafiato",
    gallery: Array.from({ length: 28 }, (_, i) => `mz-${String(i + 1).padStart(2, "0")}.jpg`),
    makingOf: { id: "V01TjzPWLSM", provider: "youtube", by: "Thomas Augier" },
    credits: [
      { role: "Couple", name: "Private client" },
      { role: "Venue", name: "Grand-Hôtel du Cap-Ferrat, a Four Seasons Hotel", url: "https://www.fourseasons.com/capferrat/" },
      { role: "Campaign Partner", name: "Dolce & Gabbana" },
      { role: "Photography", name: "Emmanuelle Marty", url: "https://emmanuellemarty.com/" },
      { role: "Four Seasons Liaison", name: "Aurélien Guery" },
      { role: "Making Of", name: "Thomas Augier", url: "https://www.youtube.com/@thomasaugier6100" },
      { role: "Camera", name: "Sony FX9" },
      { role: "Film", name: "Chromata Films" },
    ],
    excerpt: "Mozzafiato ... a Grand-Hôtel du Cap-Ferrat campaign with Dolce & Gabbana, six weeks in the making for a story of palace, yacht and couture.",
    body: [
      "This is the story of a couple deciding to formalise their long-term relationship with marriage, celebrating in Cap-Ferrat. The location offers everything ... palatial accommodation, quaint villages, yacht excursions and private pool moments.",
      "The production was a collaborative campaign with the Grand-Hôtel du Cap-Ferrat, a Four Seasons Hotel, and Dolce & Gabbana. The France director visited during filming, underscoring how significant the project was. What began as a two-day shoot grew into six weeks of planning, from art direction and location scouting to yacht coordination and early editing.",
      "This was a small-crew production where meticulous planning preceded execution. Collaborating with photographer Emmanuelle Marty was seamless, and support from the Four Seasons team, especially Aurélien Guery, kept everything running smoothly. We shot on the Sony FX9. Our thanks to all who contributed ... models, stylists, florists, decorators, hair and makeup artists and crew. Enjoy the film and the photography gallery.",
      "Behind every frame of Mozzafiato was a crew working at full stretch for six weeks, so we invited filmmaker Thomas Augier to document the process itself. His making-of short below goes past the finished campaign into the choreography of a six-week production: the scouting, the yacht logistics, the early-morning light chases and the quiet coordination between two luxury houses that made the final film possible.",
    ],
  },
  {
    file: "journal-dolce-gabbana-teaser.html", page: 7, tag: "Teaser",
    thumb: "mozzafiato/mz-22.jpg",
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

// Journal-listing thumbnail for a post, as a path under assets/img/. Order of
// preference: explicit `thumb` override → SEO og image → first gallery image →
// first inline-media image → the brand placeholder card (for text-only posts
// with no imagery of their own anywhere in the repo).
const thumbFileName = (it) => (typeof it === "string" ? it : it.file);
const postThumb = (p) => {
  if (p.thumb) return p.thumb;
  if (p.seo && p.seo.ogImage) return `${p.galleryDir}/${p.seo.ogImage}`;
  if (p.gallery && p.gallery.length) return `${p.galleryDir}/${thumbFileName(p.gallery[0])}`;
  if (p.inlineMedia && p.inlineMedia.length && p.inlineMedia[0].items.length) return `${p.galleryDir}/${p.inlineMedia[0].items[0].file}`;
  return "journal-thumbs/placeholder.jpg";
};

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
          <figure class="jitem__thumb"><img src="assets/img/${postThumb(p)}" alt="${p.title.replace(/<[^>]+>/g, "").replace(/"/g, "&quot;")} — Chromata Films" loading="lazy"></figure>
          <div class="jitem__body">
            <span class="jdate">${p.date}</span>
            <h2>${p.title}</h2>
            <p class="jexcerpt">${p.excerpt}</p>
          </div>
          <span class="jarrow">→</span>
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
  // ---- SEO: per-post overrides + Open Graph / Twitter / canonical / JSON-LD ----
  // Applied to EVERY journal post (not just ones with an explicit `seo` field)
  // so the whole archive is fully indexable and citable by search engines and
  // AI answer engines (ChatGPT, Perplexity, Claude) alike — canonical URL,
  // OG/Twitter cards, and a BlogPosting (+ VideoObject when a film exists)
  // JSON-LD graph naming Chromata Films as author/publisher on every article.
  const metaTitle = (p.seo && p.seo.title) || `${p.title} — Journal | Chromata Films`;
  const metaDesc = (p.seo && p.seo.description) || p.excerpt;
  const pageUrl = `${SITE_URL}/${p.file}`;
  const iso = new Date(`${p.date} 12:00:00`).toISOString();
  const galleryAlt = (it) => (typeof it === "string" ? `${p.title} — Chromata Films` : it.alt);
  const galleryFile = (it) => (typeof it === "string" ? it : it.file);
  const firstGalleryImg = p.gallery && p.gallery.length ? `${SITE_URL}/assets/img/${p.galleryDir}/${galleryFile(p.gallery[0])}` : null;
  const ogImage = (p.seo && p.seo.ogImage)
    ? `${SITE_URL}/assets/img/${p.galleryDir}/${p.seo.ogImage}`
    : firstGalleryImg || `${SITE_URL}/assets/img/logo-mark.png`;
  // Fallback keyword set for posts without a hand-tuned `seo.keywords`: tag +
  // title terms + evergreen queries ("best wedding videographer in Europe")
  // are what a couple or an AI assistant would actually search.
  const keywords = (p.seo && p.seo.keywords)
    || `${p.title}, ${p.tag}, wedding videographer Europe, luxury wedding film, best wedding videographers in Europe, destination wedding cinematography, Chromata Films`;
  const imageList = (p.gallery || []).slice(0, 6).map((it) => `${SITE_URL}/assets/img/${p.galleryDir}/${galleryFile(it)}`);
  if (!imageList.length) imageList.push(ogImage);
  const jsonGraph = [{
    "@type": "BlogPosting",
    "@id": `${pageUrl}#article`,
    headline: p.title,
    description: metaDesc,
    image: imageList,
    datePublished: iso,
    dateModified: iso,
    inLanguage: "en",
    author: { "@type": "Organization", name: "Chromata Films", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Chromata Films", logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/img/logo-mark.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    keywords,
  }];
  if (p.video) {
    jsonGraph.push({
      "@type": "VideoObject",
      "@id": `${pageUrl}#video`,
      name: `${p.title} — Wedding Film`,
      description: metaDesc,
      thumbnailUrl: [ogImage],
      uploadDate: iso,
      publisher: { "@type": "Organization", name: "Chromata Films", logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/img/logo-mark.png` } },
      embedUrl: videoEmbedUrl(p.video, p.videoProvider),
    });
  }
  const headExtra = [
    `<link rel="canonical" href="${pageUrl}" />`,
    `<meta name="keywords" content="${keywords}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="Chromata Films" />`,
    `<meta property="og:title" content="${metaTitle}" />`,
    `<meta property="og:description" content="${metaDesc}" />`,
    `<meta property="og:url" content="${pageUrl}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta property="article:published_time" content="${iso}" />`,
    `<meta property="article:author" content="Chromata Films" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${metaTitle}" />`,
    `<meta name="twitter:description" content="${metaDesc}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`,
    `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": jsonGraph })}</script>`,
  ].join("\n");
  pages[p.file] = shell({
    page: "journal",
    title: metaTitle,
    description: metaDesc,
    headExtra,
    navLight: true,
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
          <iframe data-lazy-src="${videoEmbedUrl(p.video, p.videoProvider)}" title="${p.title} — wedding film" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
        </div>
      </figure>
` : ""}${p.verticalVideos ? `      <div class="vidpair vidpair--article" aria-label="${p.title} — vertical teasers">
${p.verticalVideos.map((v) => `        <div class="vidpair__item">
          <iframe data-lazy-src="${vimeoSrc(v)}" title="${p.title} — vertical teaser" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
        </div>`).join("\n")}
      </div>
` : ""}      <article class="article">
        <div class="prose">
${p.body.map((par, i) => {
  const paraHtml = `          <p>${linkVendors(par)}</p>`;
  const row = p.inlineMedia && p.inlineMedia.find((m) => m.after === i);
  if (!row) return paraHtml;
  // A single image sits below its paragraph, sized to the paragraph's length
  // (a longer write-up earns a bigger image); multiple images form a grid row.
  if (row.items.length === 1) {
    const words = par.split(/\s+/).filter(Boolean).length;
    const t = Math.max(0, Math.min(1, (words - 40) / 42)); // 40 words → 0, 82 → 1
    const pct = Math.round(58 + t * 42); // 58% … 100% of the text column
    const it = row.items[0];
    return `${paraHtml}
          <figure class="mat img-reveal venue-figure venue-figure--solo" style="max-width:${pct}%">
            <img src="assets/img/${p.galleryDir}/${it.file}" alt="${it.alt || `${it.caption} — Chromata Films`}" loading="lazy">
            <figcaption>${it.caption}</figcaption>
          </figure>`;
  }
  return `${paraHtml}
          <div class="venue-row venue-row--${row.items.length}">
${row.items.map((it) => "            " + venueFigure(p.galleryDir, it.file, it.caption)).join("\n")}
          </div>`;
}).join("\n")}
        </div>
${p.cta ? `        <div class="article-cta">
          <a class="btn btn--coral" href="${p.cta.href}" target="_blank" rel="noopener noreferrer">${p.cta.label}</a>
${p.cta.sub ? `          <p class="article-cta__note">${p.cta.sub}</p>\n` : ""}        </div>
` : ""}      </article>
${p.gallery ? `${p.galleryHeading ? `      <h2 class="article__gallery-title">${p.galleryHeading}</h2>
` : ""}      <div class="gallery-grid article__gallery">
${p.gallery.map((it) => "        " + g(p.galleryDir, galleryFile(it), "", galleryAlt(it))).join("\n")}
      </div>
` : ""}${p.makingOf ? `      <article class="article" style="margin-top:9vh">
        <h2 class="article__gallery-title">Behind the Scenes — Making Of${p.makingOf.by ? ` by ${p.makingOf.by}` : ""}</h2>
        <figure class="article__film mat" style="margin-top:4vh">
          <div class="article__film-frame">
            <iframe data-lazy-src="${videoEmbedUrl(p.makingOf.id, p.makingOf.provider)}" title="${p.title} — making of${p.makingOf.by ? ` by ${p.makingOf.by}` : ""}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
          </div>
        </figure>
      </article>
` : ""}${p.credits ? `      <article class="article">
        <div class="article-credits">
          <h2 class="article__gallery-title" style="margin-top:0">Full Credits</h2>
          <div class="feature__meta" style="margin-top:3vh">
${p.credits.map((c) => `            <div class="row"><span>${c.role}</span><span class="val">${c.url ? `<a class="text-link" href="${c.url}" target="_blank" rel="noopener noreferrer">${c.name}</a>` : c.name}</span></div>`).join("\n")}
          </div>
        </div>
      </article>
` : ""}      <div class="article">
        <div style="margin-top:8vh; display:flex; gap:30px; flex-wrap:wrap">
          <a class="text-link" href="${journalHref(p.page)}">← Back to the Journal</a>
          <a class="text-link" href="contact.html">Begin your journey →</a>
        </div>
      </div>
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

/* ============================== REAL WEDDINGS (index) ============================== */
const realWeddings = [
  {
    href: "domantas-sabonis.html", title: "Domantas <em>&amp;</em> Shashana",
    kicker: "NBA All-Star · Villa Ephrussi, Cap-Ferrat", dir: "domantas",
    thumbs: ["ds-25.jpg", "ds-27.jpg", "ds-28.jpg"],
    excerpt: "Three days at Villa Ephrussi, St-Jean-Cap-Ferrat ... when an NBA All-Star marries the love of his life, the celebration has to hit different. And it did. Mindy Weiss orchestrated a flawless three-day production, with florals by Roni Floral Design, and a party that ran deep into the Riviera night",
  },
  {
    href: "jacqueline-gordon.html", title: "Jacqueline <em>&amp;</em> Gordon",
    kicker: "Five Days · Le Beauvallon, St-Tropez", dir: "jacky",
    thumbs: ["jg-05.jpg", "jg-11.jpg", "jg-20.jpg"],
    excerpt: "Jacqueline and Gordon's wedding in St-Tropez could be summarized in one simple word: WOW. Five days at Le Beauvallon above the bay ... a seaside fashion show, a drone light spectacle, a Bridgerton-meets-1980s party, fireworks, and an after-party that only surrendered at sunrise",
  },
  {
    href: "anna-andres.html", title: "Anna <em>Andres</em>",
    kicker: "Miss Universe Ukraine · Editorial Film", dir: "anna",
    thumbs: ["an-02.jpg", "an-05.jpg", "an-09.jpg"],
    excerpt: "When a Miss Universe titleholder plans her wedding, the bar is not \"beautiful\". The bar is \"cover story\". Anna Andres trusted us to film her wedding with the same visual intelligence as the editorials she has graced ... couture in golden light, and a ceremony that stopped the room",
  },
  {
    href: "russell-westbrook.html", title: "Russell <em>&amp;</em> Nina Westbrook",
    kicker: "Anniversary · Positano, Amalfi Coast", dir: "westbrook",
    thumbs: ["rw-03.jpg", "rw-07.jpg", "rw-11.jpg"],
    excerpt: "Some love stories deserve a sequel ... and Positano wrote this one in gold and sea-blue. When Russell and Nina Westbrook chose the Amalfi Coast to celebrate their anniversary, the brief was simple: all the emotion of a wedding day, none of the script",
  },
  {
    href: "vaux-le-vicomte.html", title: "Vaux-le-Vicomte",
    kicker: "Private Wedding · Château, France", dir: "vaux",
    thumbs: ["vlv-03.jpg", "vlv-06.jpg", "vlv-09.jpg"],
    excerpt: "The château that inspired Versailles, an evening of grand-siècle splendor, and a couple whose names we'll keep to ourselves. Beneath Le Nôtre's gardens and Le Brun's painted ceilings, our VIP clients gathered their closest circle for one unforgettable night",
  },
];

pages["real-weddings.html"] = shell({
  page: "real-weddings",
  title: "Real Weddings — Luxury Destination Wedding Films | Chromata Films",
  description: "A selection of real weddings and celebrations filmed by Chromata Films: Domantas Sabonis at Villa Ephrussi, Jacqueline & Gordon in St-Tropez, Anna Andres, Russell & Nina Westbrook in Positano, and a private wedding at Vaux-le-Vicomte.",
  headExtra: [
    `<link rel="canonical" href="${SITE_URL}/real-weddings.html" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Chromata Films" />`,
    `<meta property="og:title" content="Real Weddings — Luxury Destination Wedding Films | Chromata Films" />`,
    `<meta property="og:url" content="${SITE_URL}/real-weddings.html" />`,
    `<meta property="og:image" content="${SITE_URL}/assets/img/real-weddings/real-weddings-header.jpg" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${SITE_URL}/assets/img/real-weddings/real-weddings-header.jpg" />`,
  ].join("\n"),
  main: `  <!-- 3:1 ambient video header (YouTube background film + title overlay) -->
  <section class="videoband videoband--header" data-theme="dark" data-section aria-label="Real Weddings — cinematic video header">
    <iframe data-lazy-src="https://www.youtube-nocookie.com/embed/-CulEs9XwO8?autoplay=1&mute=1&loop=1&playlist=-CulEs9XwO8&controls=0&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3&disablekb=1"
            title="Chromata Films — real weddings header film" loading="lazy" allow="autoplay; encrypted-media"></iframe>
    <div class="film__shade"></div>
    <div class="hero__head">
      <p class="kicker" style="color:var(--coral)">— Real Weddings</p>
      <h1 class="hero__title hero__title--page">
        <span class="line-mask intro-rise"><span class="line-inner">Real <em>Weddings</em></span></span>
      </h1>
    </div>
  </section>

  <section class="pad-section" data-section>
    <div class="container">
      <p class="body-copy" style="max-width:44em">A selection of the celebrations we've had the honour of filming ... from an NBA All-Star's Riviera wedding to a private night at the château that inspired Versailles. Each is its own story; step inside any of them below.</p>
      <div class="rw-list" style="margin-top:2vh">
${realWeddings.map((w, i) => `        <article class="rw-card">
          <div class="rw-card__text">
            <p class="kicker">— ${w.kicker}</p>
            <h2 class="rw-card__title"><a href="${w.href}"><span class="line-mask"><span class="line-inner">${w.title}</span></span></a></h2>
            <p class="rw-card__excerpt">${w.excerpt} <span class="rw-card__more">[...]</span></p>
            <a class="btn btn--coral rw-card__cta" href="${w.href}">Read more →</a>
          </div>
          <a class="rw-card__thumbs" href="${w.href}" aria-label="View the ${w.title.replace(/<[^>]+>/g, "")} wedding">
${w.thumbs.map((t, j) => `            <figure class="rw-thumb mat img-reveal"><img src="assets/img/${w.dir}/${t}" alt="${w.title.replace(/<[^>]+>/g, "")} wedding — Chromata Films" loading="lazy"></figure>`).join("\n")}
          </a>
        </article>`).join("\n")}
      </div>
    </div>
  </section>`,
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

/* ---- sitemap.xml + robots.txt ----
   index.html is handwritten (not in `pages`) so it's added explicitly; every
   generated page is included except the deliberately-unlisted noindex ones. */
const NOINDEX_FILES = new Set(["gettoknowusmore.html"]);
const sitemapFiles = ["index.html", ...Object.keys(pages).filter((f) => !NOINDEX_FILES.has(f))];
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapFiles.map((f) => `  <url><loc>${SITE_URL}/${f === "index.html" ? "" : f}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`;
writeFileSync(new URL("../sitemap.xml", import.meta.url), sitemap);
console.log("wrote sitemap.xml (" + sitemapFiles.length + " urls)");

const robots = `User-agent: *
Allow: /
Disallow: /gettoknowusmore.html

Sitemap: ${SITE_URL}/sitemap.xml
`;
writeFileSync(new URL("../robots.txt", import.meta.url), robots);
console.log("wrote robots.txt");
