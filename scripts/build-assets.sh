#!/usr/bin/env bash
# Chromata Films — asset pipeline.
# Copies every source asset from public/ into assets/ with web-safe names,
# resizes stills for web, and re-encodes the GASP films keyframe-dense so
# scroll-scrubbing (video.currentTime) stays smooth on desktop and mobile.
set -e
ROOT="e:/Chromata_FILMS_WEBSITE"
PUB="$ROOT/public"
OUT="$ROOT/assets"
FF="ffmpeg -hide_banner -loglevel error -y"

mkdir -p "$OUT/fonts" "$OUT/video" \
  "$OUT/img/landing" "$OUT/img/domantas" "$OUT/img/jacky" \
  "$OUT/img/carousel" "$OUT/img/logos" "$OUT/img/studio" "$OUT/img/contact"

# ---------- fonts ----------
cp "C:/Users/kev1l/AppData/Local/Temp/claude/e--Chromata-FILMS-WEBSITE/272d8688-8eec-4b54-8070-0eefe57c9896/scratchpad/germany-sans/Germany Sans DEMO.ttf" "$OUT/fonts/GermanySans.ttf"

# ---------- helpers ----------
jpg () { # src dst maxw
  $FF -i "$1" -vf "scale='min($3,iw)':-2" -q:v 4 "$2"
}

# ---------- landing images ----------
jpg "$PUB/landingpage_images/Under the Veil - Agnes Black - Rosewood Gbhala -124.jpg" "$OUT/img/landing/founders.jpg" 1600
jpg "$PUB/landingpage_images/shoes cover.jpg" "$OUT/img/landing/shoes.jpg" 1600
jpg "$PUB/domantas_sabonis/DSC00034-1-low.jpg" "$OUT/img/landing/domantas-cover.jpg" 1800
cp "$PUB/landingpage_images/top 15.png"              "$OUT/img/landing/top15.png"
cp "$PUB/landingpage_images/wow head.png"            "$OUT/img/landing/wow-head.png"
cp "$PUB/landingpage_images/legs.png"                "$OUT/img/landing/legs.png"
cp "$PUB/landingpage_images/Untitled design (2).png" "$OUT/img/landing/cutout-shine.png"
cp "$PUB/landingpage_images/Untitled design (3).png" "$OUT/img/landing/cutout-showreel.png"
cp "$PUB/landingpage_images/Untitled design (4).png" "$OUT/img/landing/cutout-bts.png"

# ---------- domantas (numeric order) ----------
i=0
find "$PUB/domantas_sabonis" -name '*.jpg' | sed 's/.*(\([0-9]*\) sur.*/\1 &/' | sort -n | cut -d' ' -f2- | while read -r f; do
  i=$((i+1)); jpg "$f" "$OUT/img/domantas/ds-$(printf '%02d' $i).jpg" 1800
done

# ---------- jacky & gordon (numeric order) ----------
i=0
find "$PUB/Jacky_Gordon" -name '*.jpg' | sed 's/.*(\([0-9]*\) sur.*/\1 &/' | sort -n | cut -d' ' -f2- | while read -r f; do
  i=$((i+1)); jpg "$f" "$OUT/img/jacky/jg-$(printf '%02d' $i).jpg" 1800
done

# ---------- homepage carousel ----------
i=0
find "$PUB/carroussel_homepage" -name '*.jpg' | sort | while read -r f; do
  i=$((i+1)); jpg "$f" "$OUT/img/carousel/c-$(printf '%02d' $i).jpg" 1400
done

# ---------- press logos ----------
cp "$PUB/carrousel_logos/500_GALA-B copie.png"                 "$OUT/img/logos/gala-500.png"
cp "$PUB/carrousel_logos/87th_nominations copie.png"           "$OUT/img/logos/oscars-87th.png"
cp "$PUB/carrousel_logos/Harper's_Bazaar_Logo.svg.png"         "$OUT/img/logos/harpers-bazaar.png"
cp "$PUB/carrousel_logos/VESLogo400x200 - Edited.png"          "$OUT/img/logos/ves.png"
cp "$PUB/carrousel_logos/VOGUE_revista_-_logo.png"             "$OUT/img/logos/vogue.png"
cp "$PUB/carrousel_logos/about-swt-laurels-2020-copy copie.png" "$OUT/img/logos/swt-laurels.png"
cp "$PUB/carrousel_logos/cosmopolitan-logo-300x83.png"         "$OUT/img/logos/cosmopolitan.png"
cp "$PUB/carrousel_logos/logo over the moon white copie.png"   "$OUT/img/logos/over-the-moon.png"
cp "$PUB/carrousel_logos/wedluxe logo.png"                     "$OUT/img/logos/wedluxe.png"
cp "$PUB/carrousel_logos/SeekPng.com_oops-png_9313421.png"     "$OUT/img/logos/press-extra.png"
cp "$PUB/carrousel_logos/Background1.png"                      "$OUT/img/logos/press-bg.png"

# ---------- studio ----------
jpg "$PUB/the_studio_images/L1063485-1.jpg"                                    "$OUT/img/studio/studio-01.jpg" 1600
jpg "$PUB/the_studio_images/RSVP-London-Rosewood Awards Gbvnala-560.jpg"       "$OUT/img/studio/studio-02.jpg" 1600
jpg "$PUB/the_studio_images/d7552b40-037d-48a7-b5df-38ee18311113.jpg"          "$OUT/img/studio/michael.jpg" 1600
jpg "$PUB/the_studio_images/stephane FPV pilot.jpg"                            "$OUT/img/studio/stephane.jpg" 1600

# ---------- contact ----------
jpg "C:/Users/kev1l/Pictures/daria/done/369294494_758511202714505_8070243041937941151_n.jpg" "$OUT/img/contact/contact-side.jpg" 1600

# ---------- videos: keyframe-dense scrub encodes ----------
vid () { # src slug
  $FF -i "$1" -an -vf "scale='min(1920,iw)':-2" -c:v libx264 -profile:v high -pix_fmt yuv420p -g 8 -keyint_min 8 -sc_threshold 0 -crf 23 -preset slow -movflags +faststart "$OUT/video/$2.mp4"
  $FF -i "$1" -an -vf "scale='min(960,iw)':-2"  -c:v libx264 -profile:v main -pix_fmt yuv420p -g 8 -keyint_min 8 -sc_threshold 0 -crf 26 -preset slow -movflags +faststart "$OUT/video/$2-mobile.mp4"
}
vid "$PUB/BG_GASP (1).mp4" "hero"
vid "$PUB/BG_GASP.mp4"     "reel"
vid "$PUB/BG_GASP (2).mp4" "film-night"
vid "$PUB/BG_GASP (3).mp4" "contact"
vid "$PUB/BG_GASP (2)_3_thm2_prob4.mp4" "amour"

# poster frames for reduced-motion / first paint
for s in hero reel film-night contact amour; do
  $FF -i "$OUT/video/$s.mp4" -vf "select=eq(n\,0)" -frames:v 1 -q:v 4 "$OUT/video/$s-poster.jpg"
done

echo "ASSET PIPELINE DONE"
du -sm "$OUT"/*
