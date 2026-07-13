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
  "$OUT/img/landing" "$OUT/img/domantas" "$OUT/img/jacky" "$OUT/img/jg-blog" "$OUT/img/aw-blog" \
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
cp "$PUB/landingpage_images/domantas cover.png" "$OUT/img/landing/domantas-cover.png"
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
# studio closing-section illustrations
i=0
for f in "A9_00995.jpg" "358396225_291305283266365_6392017329932999453_n.jpg" "372835832_18384628741021401_739032674496621848_n.jpg" "387685587_1838694466638717_6640025345285390009_n.jpg" "397504558_920807432803164_128011837635376924_n.jpg" "429680543_17976621647664230_8262253484510476541_n.jpg"; do
  i=$((i+1)); jpg "$PUB/the studio_illustrations/$f" "$OUT/img/studio/illus-$(printf '%02d' $i).jpg" 1400
done

# ---------- contact ----------
jpg "C:/Users/kev1l/Pictures/daria/done/369294494_758511202714505_8070243041937941151_n.jpg" "$OUT/img/contact/contact-side.jpg" 1600

# ---------- anna andres (new header + gallery) ----------
mkdir -p "$OUT/img/anna"
jpg "$PUB/Anna Andres/anna andres header.png" "$OUT/img/anna/anna-header.jpg" 1920
i=0
for f in \
  "259a3533(1).jpg" \
  "hotel+du+cap+eden+roc+wedding+photographer+Анна+Андрес+свадебный+фотограф+02.webp" \
  "image00001_5f0dc6628c112.webp" \
  "252454998_328738855679353_4636211931660097973_n.jpg" \
  "image00005_5f0dc62b7a4ca.webp" \
  "Анна+Андрес+свадебный+фотограф+hotel+du+cap+eden+roc+wedding+photographer+Анна+Андрес+свадебный+фотограф+04 (1).webp" \
  "253075228_639296430571300_4164084866042770414_n.jpg" \
  "image00014_5f0dc57ff1ee2.webp" \
  "Untitled-83_5f0dc52020090.webp" \
  "hotel+du+cap+eden+roc+wedding+photographer+Анна+Андрес+свадебный+фотограф.webp" \
  "Untitled-84_5f0dc5678ba25 (1).webp" \
  "Анна+Андрес+свадебный+фотограф+wedding+photographer+anna+andres+eden+roc+05.webp" ; do
  i=$((i+1)); jpg "$PUB/Anna Andres/$f" "$OUT/img/anna/an-$(printf '%02d' $i).jpg" 1400
done

# ---------- jacky & gordon header ----------
jpg "$PUB/Jacky_Gordon/J&G _ DAY 4 _ Wedding day _ 15.6.25 (501 sur 1547).jpg" "$OUT/img/jacky/jacky-header.jpg" 1800

# ---------- jacky & gordon journal-article gallery (deduped, wedding-day frames first) ----------
jgb_src=(
  "J&G _ DAY 4 _ Wedding day _ 15.6.25 (839 sur 1547).jpg"
  "J&G _ DAY 4 _ Wedding day _ 15.6.25 (840 sur 1547).jpg"
  "J&G _ DAY 4 _ Wedding day _ 15.6.25 (857 sur 1547).jpg"
  "J&G _ DAY 4 _ Wedding day _ 15.6.25 (861 sur 1547).jpg"
  "J&G _ DAY 4 _ Wedding day _ 15.6.25 (893 sur 1547).jpg"
  "J&G _ DAY 4 _ Wedding day _ 15.6.25 (897 sur 1547).jpg"
  "maddy.christina.photo-3706386851893911076_50112328229-20250824_191605.jpg"
  "maddy.christina.photo-20250827_074409-69952137.jpg"
  "maddy.christina.photo-20250913_114019-1174179990.jpg"
  "maddy.christina.photo-20250913_114019-3319762215.jpg"
  "maddy.christina.photo-20250913_114019-4181562028.jpg"
  "maddy.christina.photo-20250913_114019-4234461129.jpg"
  "maddy.christina.photo-3738675366639237727_50112328229-20251008_082736.jpg"
  "maddy.christina.photo-3741546465219602452_50112328229-20251012_073157.jpg"
  "maddy.christina.photo-3745947350343391246_50112328229-20251018_091544.jpg"
  "maddy.christina.photo-3757894877053478569_50112328229-20251103_195320.jpg"
  "maddy.christina.photo-3757894877053478569_50112328229-20251103_1953420.jpg"
  "maddy.christina.photo-3757894877053478569_50112328229-20251103_k195320.jpg"
  "maddy.christina.photo-3771880647400960037_50112328229-20251123_210000.jpg"
  "maddy.christina.photo-3771880647400960037_50112328229-20251123_2100000.jpg"
)
i=0
for f in "${jgb_src[@]}"; do
  i=$((i+1)); jpg "$PUB/Jacky_gordon_blog/$f" "$OUT/img/jg-blog/jgb-$(printf '%02d' $i).jpg" 1800
done

# ---------- alexa & wilton journal-article gallery (chronological: welcome, beach, wedding, film) ----------
aw_src=(
  "Alexia & Wilton _ DAY 1 _ Welcome Party _ 28.6.24 _ By Maddy Christina (1 sur 606).jpg"
  "Alexia & Wilton _ DAY 1 _ Welcome Party _ 28.6.24 _ By Maddy Christina (28 sur 606).jpg"
  "Alexia & Wilton _ DAY 1 _ Welcome Party _ 28.6.24 _ By Maddy Christina (32 sur 606).jpg"
  "Alexia & Wilton _ DAY 1 _ Welcome Party _ 28.6.24 _ By Maddy Christina (43 sur 606).jpg"
  "Alexia & Wilton _ DAY 1 _ Welcome Party _ 28.6.24 _ By Maddy Christina (300 sur 606).jpg"
  "Alexia & Wilton _ DAY 1 _ Welcome Party _ 28.6.24 _ By Maddy Christina (320 sur 606).jpg"
  "Alexia & Wilton _ DAY 1 _ Welcome Party _ 28.6.24 _ By Maddy Christina (407 sur 606).jpg"
  "Alexia & Wilton _ DAY 2 _ Beach Party _ 29.6.24 _ By Maddy Christina (5 sur 423).jpg"
  "Alexia & Wilton _ DAY 2 _ Beach Party _ 29.6.24 _ By Maddy Christina (139 sur 423).jpg"
  "Alexia & Wilton _ DAY 2 _ Beach Party _ 29.6.24 _ By Maddy Christina (196 sur 423).jpg"
  "Alexia & Wilton _ DAY 2 _ Beach Party _ 29.6.24 _ By Maddy Christina (199 sur 423).jpg"
  "Alexia & Wilton _ DAY 2 _ Beach Party _ 29.6.24 _ By Maddy Christina (408 sur 423).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (215 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (233 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (303 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (385 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (525 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (537 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (592 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (795 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (814 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (977 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1048 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1069 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1070 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1072 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1073 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1086 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1106 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1114 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1118 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1163 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1164 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1166 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1488 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1659 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1708 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1727 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1740 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1805 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1851 sur 1864).jpg"
  "Alexa & Wilton _ Wedding day _ 30.6.24 _ by Maddy Christina (1854 sur 1864).jpg"
  "Alexa & Wilton _ Film Photography _ 30.6.24 (30 sur 118).jpg"
  "Alexa & Wilton _ Film Photography _ 30.6.24 (50 sur 118).jpg"
  "Alexa & Wilton _ Film Photography _ 30.6.24 (117 sur 118).jpg"
)
i=0
for f in "${aw_src[@]}"; do
  i=$((i+1)); jpg "$PUB/Alex and Wilton/$f" "$OUT/img/aw-blog/aw-$(printf '%02d' $i).jpg" 1800
done

# ---------- wedding planner logos (keep original format, aspect + colours) ----------
mkdir -p "$OUT/img/planner-logos"
cp "$PUB/planner_logos/logotype_black_palazzoeventi-1-01-scaled.png"        "$OUT/img/planner-logos/palazzo-eventi.png"
cp "$PUB/planner_logos/the_wedding_planners___monaco_logo-1695093997.jpg"   "$OUT/img/planner-logos/wedding-planners-monaco.jpg"
cp "$PUB/planner_logos/houseofkirschner_official_logo.jpg"                  "$OUT/img/planner-logos/house-of-kirschner.jpg"
cp "$PUB/planner_logos/logo_anthracite_png-02.png"                          "$OUT/img/planner-logos/anthracite.png"
cp "$PUB/planner_logos/website-assetts-v3-06-3957510473.png"                "$OUT/img/planner-logos/planner-06.png"
cp "$PUB/planner_logos/Logo.png"                                            "$OUT/img/planner-logos/planner-logo.png"
cp "$PUB/planner_logos/photo.png"                                           "$OUT/img/planner-logos/planner-photo.png"
cp "$PUB/planner_logos/images.png"                                          "$OUT/img/planner-logos/planner-images.png"
cp "$PUB/planner_logos/images (4).jpg"                                      "$OUT/img/planner-logos/planner-04.jpg"
cp "$PUB/planner_logos/images (5).jpg"                                      "$OUT/img/planner-logos/planner-05.jpg"
cp "$PUB/planner_logos/1631307868847.jpg"                                   "$OUT/img/planner-logos/planner-lg.jpg"
cp "$PUB/planner_logos/partner_lgpelite.webp"                               "$OUT/img/planner-logos/lgp-elite.webp"

# ---------- videos: keyframe-dense scrub encodes ----------
vid () { # src slug
  $FF -i "$1" -an -vf "scale='min(1920,iw)':-2" -c:v libx264 -profile:v high -pix_fmt yuv420p -g 8 -keyint_min 8 -sc_threshold 0 -crf 23 -preset slow -movflags +faststart "$OUT/video/$2.mp4"
  $FF -i "$1" -an -vf "scale='min(960,iw)':-2"  -c:v libx264 -profile:v main -pix_fmt yuv420p -g 8 -keyint_min 8 -sc_threshold 0 -crf 26 -preset slow -movflags +faststart "$OUT/video/$2-mobile.mp4"
}
vid "$PUB/BG_GASP_HEADER.mp4" "hero"
vid "$PUB/BG_GASP.mp4"     "reel"
vid "$PUB/BG_GASP (2).mp4" "film-night"
vid "$PUB/BG_GASP (3).mp4" "contact"
vid "$PUB/BG_GASP (2)_3_thm2_prob4.mp4" "amour"
vid "$PUB/magnific_create-a-video_2973139937.mp4" "gallery-film"

# ambient header videos (autoplay loop, not scrubbed → single file + poster)
ambient () { # src slug
  $FF -i "$1" -an -vf "scale='min(1920,iw)':-2" -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 23 -preset slow -movflags +faststart "$OUT/video/$2.mp4"
  $FF -i "$OUT/video/$2.mp4" -vf "select=eq(n\,0)" -frames:v 1 -q:v 4 "$OUT/video/$2-poster.jpg"
}
ambient "$PUB/the journal header.mp4"     "journal-header"
ambient "$PUB/the studio_header_new.mp4"  "studio-header"
ambient "$PUB/header_contact_us_NEW.mp4"  "contact-header"

# poster frames for reduced-motion / first paint
for s in hero reel film-night contact gallery-film; do
  $FF -i "$OUT/video/$s.mp4" -vf "select=eq(n\,0)" -frames:v 1 -q:v 4 "$OUT/video/$s-poster.jpg"
done
# amour uses hand-picked intro (poster) + outro stills instead of video frames
# (user-provided stills committed under assets/img/landing/)
jpg "$OUT/img/landing/shashana.00_14_44_08.Still004-WEB.jpg"     "$OUT/video/amour-poster.jpg" 1920
jpg "$OUT/img/landing/Derush_WedDay3.01_15_34_04.Still013.jpg"   "$OUT/video/amour-outro.jpg"  1920

echo "ASSET PIPELINE DONE"
du -sm "$OUT"/*
