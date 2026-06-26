# Marten's Songs — Branding & Build Spec

The single source of truth for look, feel, prompts and pipeline. Keep this updated
so every new song stays on-brand and the image prompts stay consistent.

## What it is
A site of AI-created songs (faith, love, life, God) shown as **bilingual karaoke
lyric animations**: English lyrics light up word by word in time with the music, a
translation (ES/DE) sits underneath, atmospheric painted backgrounds drift behind,
and an "idea behind the song" panel can be read or listened to. Live:
https://martennwt.github.io/marten-songs/

## Visual identity
- **Mood:** reverent, cinematic, warm. Deep night-blue with gold light. Quiet, not flashy.
- **Colors:**
  - Background navy/teal: `#16243a` -> `#0c1626` -> `#070d18` (radial, dark at edges).
  - Gold accents: `#e9b85c`, `#ffe7ad`, `#ffe39a`, title gradient `#fff -> #f3d79a`.
  - Text: `#eaf0f7`; muted `#9fb0c6`; eyebrow gold `#caa45a`.
  - Sung word fill: `#f1d489` (done) / `#ffe6a6` (current sweep) with a soft gold glow, no hard box.
  - Translation: v1 soft teal-green `rgba(158,201,182,..)`; v2 neutral grey `rgba(178,186,198,..)`.
- **Type:** Cormorant Garamond (600) for titles + lyrics (serif, scriptural); Inter for all UI.
- **Motion:** floating gold "seed" particles (canvas); background images drift slowly left/right
  (`imgdrift`, scale 1.12, translate +/-2.8%, 22s) at ~0.27 opacity under a dark veil.

## Images (the painted backgrounds)
- **Model:** Gemini 3 Pro Image ("Nano Banana Pro", `gemini-3-pro-image`) for quality.
  Cheaper alternative for volume: `gemini-3.1-flash-image` (~4 cents/image, also good, wide).
- **Generator:** `C:/Users/marte/Documents/Claude/tools/images/generate-image.js`
  (reads keys from `Documents/Claude/API keys/`, never hardcodes). Batch + manifest (skips unchanged).
  Run: `node generate-image.js --provider gemini --model gemini-3-pro-image --batch songs/<id>/img/jobs.json --outdir songs/<id>/img`
- **Aspect:** wide 16:9, used as faint full-screen background (so dark, lots of negative space).
- **Rules (always in the prompt):** painterly oil-painting style; deep navy/teal + warm gold;
  soft atmospheric haze; lots of negative space; **no text, no letters, no watermark**;
  **no faces in detail; never depict God** (use light, sky, nature instead).
- **Prompt formula:**
  `Cinematic painterly oil-painting scene, wide 16:9 dark atmospheric background. <SCENE>.
   Deep navy and teal tones with warm golden light, soft haze, lots of negative space.
   No text, no letters, no watermark.`
- **Per-song:** prompts live in `songs/<id>/img/jobs.json` (id = filename). `song.json` lists
  `images[]` and `imageMap[]` (one image index per timing segment) so the background changes per section.
- **The Sower scenes (8):** 1 sower scattering seed at dawn · 2 the four soils (path/rock/thorns/good earth)
  · 3 birds in the dawn sky · 4 lilies of the field · 5 sky opening with a sunbeam (the "gift", a favourite)
  · 6 an old wooden door ajar, golden light spilling out ("knock and it opens") · 7 a path through a golden
  field ("seek first the kingdom") · 8 a single seedling in rich soil ("the seed in you is rising").

## Player features
- Word-by-word gold shimmer (smooth sweep, no box); translation per line.
- Countdown ring (top) during the intro that fills down to the first sung line.
- Volume = speaker button -> vertical slider popover. Language = small menu (Español/Deutsch).
- Top-right **"Die Idee hinter dem Lied"** panel: overview + scripture refs + verse-by-verse meaning,
  with a clear ES|DE switch and a **listen** button (deep voice narration).
- Full-lyrics view + one-click bilingual **PDF** (English larger, translation under each line).
- Intro gate: song image faintly behind, gold, X (top-left) back to the hub.
- Two builds per song: `index.html` (main: images + per-sentence translation) and `v1.html` (clean).

## Voice / narration
- Deep voice "dave" = ElevenLabs voice id `QtPMrakdgePQIUwOX7Ut`, model `eleven_multilingual_v2`.
- Song read-aloud: `tools/audio/build-audio.js` (settings 0.9/0.9/0.4, speed ~1.08, mp3 192k).
- "Idea behind the song" narration: `tools/about-audio.js <id>` -> `about-de.mp3` + `about-es.mp3`
  (settings 0.9/0.9/0.35, speed 1.0). Keys in `Documents/Claude/API keys/ElevenLabs.txt`.

## Add a new song (pipeline)
1. `songs/<id>/<id>.mp3`
2. `node tools/transcribe.js "songs/<id>/<id>.mp3" "songs/<id>/timing.json"` (gpt-4o-transcribe + guided whisper-1)
3. Write `songs/<id>/song.json`: title, subtitle (scripture refs), theme, mp3, cover, images[], imageMap[],
   es[]/de[] (per segment), about{intro,de,es}.
4. Images: write `songs/<id>/img/jobs.json`, run the generator (above).
5. Narration: `node tools/about-audio.js <id>`
6. Build: `node tools/build-anim.js <id>` (or `--all`). Builds index.html + v1.html + rebuilds the hub.
7. Deploy: `git add -A && git commit && git push origin main` (GitHub Pages auto-rebuilds).

## Costs (rough)
- Images: Gemini 3 Pro ~ a few cents to ~15 cents each; flash-image ~4 cents each. 8 images/song.
- Transcription (OpenAI) + narration (ElevenLabs): a few cents per song.
- => A few cents to ~1 EUR per song depending on the image model. Negligible at channel scale.
