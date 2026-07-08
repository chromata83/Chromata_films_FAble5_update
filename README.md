# Chromata Films — Website

**Where the French Touch meets Modern Elegance.**
Award-winning luxury destination wedding cinematography — chromatafilms.com.

A single-page-experience-style, multi-page static site: GSAP 3 + ScrollTrigger choreography,
Lenis smooth scroll, scroll-scrubbed film sections, a raw-WebGL noise-dissolve shader,
and a Dalí × Schiaparelli pop-luxe art direction (porcelain / mediterranean sky /
royal gold / coral).

## Pages

| Page | File |
|---|---|
| Landing experience | `index.html` |
| Domantas & Shashana (NBA All-Star) | `domantas-sabonis.html` |
| Jacqueline & Gordon (St-Tropez) | `jacqueline-gordon.html` |
| Anna Andres (Miss Universe UA) | `anna-andres.html` |
| The Studio | `the-studio.html` |
| Journal + 6 articles | `journal.html`, `journal-*.html` |
| Gallery (frames + films) | `gallery.html` |
| Contact (inquiry form) | `contact.html` |

## Tech

- **GSAP 3 + ScrollTrigger** — pinned scrub films, masked line reveals, horizontal gallery,
  day→night metamorphosis, magnetic CTA, parallax via `data-speed`.
- **Lenis** smooth scroll (`lerp: 0.08`), synced to ScrollTrigger.
- **Scroll-scrubbed video** — `video.currentTime` driven through a lerp
  (`current += (target - current) * 0.1`) on keyframe-dense encodes (`-g 8`).
  On touch devices films switch to native autoplay loops (smoothest mobile playback);
  `prefers-reduced-motion` gets posters and simple fades.
- **Raw WebGL dissolve** (`js/webgl.js`) — perlin-noise `smoothstep` threshold mask,
  no three.js payload.
- **Fonts** — Germany Sans (display), Cormorant Garamond (italic accents),
  Space Grotesk (UI).

## Develop

Static site — serve the root with anything:

```sh
python -m http.server 8137
# → http://localhost:8137
```

### Rebuild sub-pages

All pages except `index.html` are generated from a shared shell:

```sh
node scripts/build-pages.mjs
```

### Rebuild optimized assets

Source masters live in `public/` (git-ignored). `scripts/build-assets.sh`
re-encodes videos keyframe-dense (desktop + mobile variants + posters) and
resizes/renames all imagery into `assets/`:

```sh
bash scripts/build-assets.sh   # requires ffmpeg
```

## Contact

Chromata Films — 27 Rue de Montchoisy, 1207 Geneva, Switzerland
contact@chromatafilms.com · [@chromata_films_weddings](https://www.instagram.com/chromata_films_weddings/)
