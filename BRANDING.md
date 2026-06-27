# Marten's Songs — Branding & Build Spec

The single source of truth for look, feel, prompts and pipeline. Keep this updated
so every new song stays on-brand and the image prompts stay consistent.

## What it is
A site of AI-created songs (faith, love, life, God) shown as **bilingual karaoke
lyric animations**: English lyrics light up word by word in time with the music, a
translation (ES/DE) sits underneath, atmospheric painted backgrounds drift behind,
and an "idea behind the song" panel can be read or listened to. Live:
https://martennwt.github.io/marten-songs/

## Setup & external tools (by design)
- **Run it:** Node **>= 18** (the scripts use the built-in `fetch`), **no npm dependencies**. `package.json`
  declares the version + scripts: `npm run build` (all songs + hub), and per-song `npm run verify -- <id>`,
  `npm run retime -- <id>`, `npm run song -- <id>`. Commands also run directly: `node tools/build-anim.js <id>`.
- **Why package.json matters (even with zero deps):** it is the project's "front door". It pins the required
  Node version (`fetch` breaks on Node < 18, a silent trap otherwise), gives one obvious place to run the
  build (`npm run build`), and makes the folder **self-describing and clonable** — essential for the goal of
  selling it as a drop-in ZIP. Without it a new person (or a buyer) has to reverse-engineer how to start.
- **External tools & APIs are intentionally NOT bundled in this repo (decision).** They stay our external
  tools/APIs: the **image generator** lives in the shared `Documents/Claude/tools/images/generate-image.js`,
  the **song read-aloud** helper likewise, and the **APIs** (OpenAI/Whisper for timing, ElevenLabs for
  narration, Gemini / Nano Banana Pro for images) are external services. Keys live in
  `Documents/Claude/API keys/` and are read by the scripts, never hardcoded. For the **sellable product**
  these become **documented prerequisites the buyer sets up** (their own API keys + the generator), not files
  we ship. The **customer video guide** walks this step by step (create the accounts, copy each API key,
  paste it in). Keep this boundary clean; do not try to vendor them into the repo.
- **WhisperX (local forced alignment): documented below, but NOT yet installed.** Marten intends to install
  it as a separate step for perfect word-sync on soft vocals. Until then the cloud Whisper path (`retime.js`)
  + the intro knobs are used. (Step-by-step in "Forced alignment with WhisperX" below; ask before the ~GB install.)

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
- "Idea behind the song" narration: `tools/about-audio.js <id>` -> `about-de.mp3` + `about-es.mp3`,
  voice **Guillermo** `qUPtETgSYRhCRb2pfOla` (deep, chosen), settings 0.9/0.9/0.35, speed 1.06.
  It speaks a cleaned script (scripture refs spoken naturally, e.g. "Matthäus 6, Vers 33"; bracketed
  ranges dropped). Keys in `Documents/Claude/API keys/ElevenLabs.txt`.

## Add a new song (pipeline)
**Always have the MP3 + the real lyrics together.** (See "Skill standards" — this is the #1 rule.)
1. `songs/<id>/<id>.mp3` and the real lyrics as `songs/<id>/lyrics.txt` (verse blocks separated by blank
   lines; `[Verse]/[Chorus]` headers are fine, they're ignored; write choruses out in full).
2. `node tools/retime.js <id>` — builds a trustworthy `timing.json` from lyrics + audio (guided whisper-1 for
   word clocks, then aligns YOUR words onto them, interpolates gaps, forces monotonic). The displayed text is
   your lyrics BY CONSTRUCTION. Watch the printed coverage % and any "weak segment(s)" (soft/quiet parts).
3. Write `songs/<id>/song.json`: title, subtitle (scripture refs), names{de,es}, theme, genre, mp3, cover,
   images[], imageMap[], es[]/de[] (**one entry per lyric LINE = per timing segment**), about{intro,de,es},
   narration, offset. Segmentation = **one lyric line per display line** (the "Sower" standard — each sung
   line lights up on its own with its translation under it), defined once in `tools/lib/lyrics.js`;
   es[]/de[]/imageMap[] line up 1:1 with the lines.
4. Images: write `songs/<id>/img/jobs.json`, run the generator (above).
5. Narration (optional): `node tools/about-audio.js <id>` (set `narration:false` to skip).
6. **Verify (the gate): `node tools/verify-song.js <id>`** — text == lyrics, counts match, timing monotonic &
   in range, images valid, coverage report. **FAIL = do not ship.** Fix and re-verify.
7. Build: `node tools/build-anim.js <id>` (or `--all`). Builds index.html + v1.html + rebuilds the hub.
8. Open `songs/<id>/index.html` and actually PLAY it through before showing Marten.
9. Deploy (after Marten's OK): `git add -A && git commit && git push origin main` (GitHub Pages auto-rebuilds).

The `/neuer-song` skill (`~/.claude/commands/neuer-song.md`) walks this exact flow.

## Forced alignment with WhisperX (optional upgrade — perfect word-sync)
The current pipeline uses **Whisper via the OpenAI API (cloud)**: easy, but its word timestamps are approximate
and it goes deaf on very soft vocals (then we pace the intro by hand with `introStart`/`introLines`). **WhisperX**
removes that fiddling: it runs **locally** and does *forced alignment* — it takes YOUR known lyrics and aligns
them to the audio at phoneme level (wav2vec2), so even a quiet a-cappella intro gets exact per-word times.
Trade-off: a bigger one-time install (Python + ffmpeg + ~torch); after that, "send mp3 + lyrics → flawless"
is real with zero ear-calibration.

**Step by step (one-time setup):**
1. Install **ffmpeg** (audio decoding) and **Python 3.10+**. On Windows: `winget install Gyan.FFmpeg` (or a static
   build on PATH), and Python from python.org.
2. Create an isolated env and install WhisperX:
   `python -m venv .venv && .venv\Scripts\activate && pip install whisperx` (pulls torch; CPU works, GPU is faster).
3. Quick check (WhisperX's own transcript + word times):
   `whisperx "song.mp3" --model large-v2 --language en --output_format json --output_dir out`

**Forced-align to OUR exact lyrics (the part that fixes soft intros)** — Python:
```python
import whisperx, json
device = "cpu"                                  # or "cuda"
audio  = whisperx.load_audio("song.mp3")
# segments = OUR lyrics (one per line), with rough start/end (whole-song span is fine):
segs = [{"text": line, "start": 0.0, "end": 0.0} for line in open("lyrics.txt").read().splitlines() if line.strip() and not line.startswith("[")]
model_a, meta = whisperx.load_align_model(language_code="en", device=device)
aligned = whisperx.align(segs, model_a, meta, audio, device, return_char_alignments=False)
json.dump(aligned, open("aligned.json","w"))    # aligned["word_segments"] = exact per-word start/end
```
4. **Adapter to our format:** a small `tools/whisperx-import.js` turns `aligned.json` into our `timing.json`
   (segments = the lyric lines, words = `{t, s}` from `word_segments`), sets `precise:true`, then the normal
   `verify-song.js` + `build-anim.js` run unchanged. No `introStart`/`introLines` needed — the words are measured.
5. In the skill, the rule becomes: **if WhisperX is installed, use it; else fall back to OpenAI Whisper + the
   intro knobs.** (`retime.js` stays the cloud path; `whisperx-import.js` is the local forced-alignment path.)

> Note: this is documented, NOT yet installed in this repo. Ask Marten before running the install (downloads ~GB).

## Costs (rough)
- Images: Gemini 3 Pro ~ a few cents to ~15 cents each; flash-image ~4 cents each. ~6-8 images/song.
- Transcription: whisper-1 = 0.006 $/min -> ~2 cents per 3-min song. Narration (ElevenLabs) optional.
- => A few cents to ~1 EUR per song depending on the image model. Negligible at channel scale.

## Skill standards (locked-in lessons)
- **MP3 + real lyrics together is the safest path — always.** Auto-transcription of singing drops/mangles
  lines (then text AND timing are wrong). With the lyrics we never trust Whisper's TEXT, only its clock.
  Running transcription twice does NOT help (same model, near-same mistakes, double cost). `transcribe.js`
  (gpt-4o-transcribe + guided whisper-1) is only for getting a first draft when no lyrics exist yet — then
  ask for the real lyrics and run `retime.js`.
- **`retime.js` is the trustworthy timer.** It segments `lyrics.txt` the canonical way (`tools/lib/lyrics.js`),
  asks whisper-1 (guided) for word times, aligns YOUR words onto Whisper's via Needleman-Wunsch, interpolates
  any words Whisper dropped, and forces monotonic time. Output has `precise:true` + per-segment word times, so
  the builder uses them verbatim. Whisper word stamps are unreliable on soft/quiet singing, but its SEGMENT
  windows are solid → for "weak" segments (few anchored words) retime spreads the words across the segment
  window instead of trusting the jittery per-word stamps. It reports coverage% and weakSegments.
- **`verify-song.js` is the gate before every delivery.** Checks text==lyrics, segment/es/de/imageMap counts,
  monotonic+in-range times, valid image indices, coverage. FAIL = do not ship. It re-derives the segmentation
  from `lyrics.txt`, so a drift between lyrics and what's displayed is caught automatically.
- **Segmentation = one lyric LINE per data segment** (`tools/lib/lyrics.js`, used by retime AND verify);
  es[]/de[]/imageMap[] = one entry per line, same order. **Display groups 2 lines per active block**
  (`groupLines`, default 2): both lines show together, each keeps its OWN translation, and the gold sweep
  flows across both. (1 line felt too sparse; the whole couplet as one block was too much — 2 lines, each
  with its translation, is the sweet spot.)
- **Soft intros: Whisper can go DEAF.** A very soft/quiet a-cappella intro can be below Whisper's threshold —
  it transcribes NOTHING there (or hallucinates words from elsewhere). Example: "The Word That Found Me" — Whisper's
  first detected word is at 22.7s, so the ~16-22s sung intro is invisible to it. No Whisper-based timing can know
  those words; any timing there is a model of the singing, not measured.
- **Intro fix (built-in, two knobs).** `retime.js` flags such leading lines as weak segments; the player then
  paces the soft intro itself instead of trusting Whisper's garbage:
  - `"introStart": <s>` = when the first word is really sung (gold won't appear before it).
  - `"introEnd": <s>` = when the soft intro finishes (sets the PACE). If omitted, the intro is paced at the
    song's own median word rate up to the first solidly-heard line.
  The player re-spaces only the soft-intro words across [introStart, introEnd]; everything Whisper heard well
  stays exactly as measured. Calibrate by ear with `?cal=1` — a panel with **Start** and **Ende** controls
  (buttons ±0.5s; keys `[` `]` = Start ±0.1, `,` `.` = Ende ±0.1). Read the two numbers, write them into
  song.json, rebuild. Concrete: Mustard `introStart: 11` (phantom early words, introEnd auto).
  - **Rubato intros** (each soft line a different pace, with a pause between them) need per-line windows:
    `"introLines": [[start,end], ...]` — one [start,end] for each leading soft line. The player spreads each
    line's words across its own window, so line A can be fast and line B slow with a gap. Beats introStart/End
    (which assume one pace). Concrete: The Word `"introLines": [[16,21],[22.5,29.5]]` (line 0 fast 16–20.6s,
    pause, line 1 slower 22.5–29s). Tune by ear: shift a line's window ±0.5s until the gold sits on the voice.
- **The "send one song → flawless" goal.** Clear vocals already time well automatically. The only hard case is
  a very soft intro Whisper can't hear → the two intro knobs (one ear-check) cover it. For fully hands-off
  perfection on soft vocals, the real upgrade is **forced alignment** (whisperX / aeneas): it aligns the KNOWN
  lyrics to the audio and detects quiet vocals Whisper misses. Not yet installed (needs Python+ffmpeg+model);
  it's the documented path when zero manual calibration is required.
- **Global offset (rare).** If a song is uniformly early/late (not just the intro), set `"offset": <seconds>`
  (positive = whole highlight later); applied in the player as `tt = t + LEAD - OFFSET`. Per-word perfection on
  soft singing would need forced alignment — future option.
- **Translation = top Castellano + German.** ES is Spain Castellano (tú), DE natural. For recognizable
  Bible lines, echo the standard versions so a native recognizes them instantly:
  Reina-Valera (ES): "no te afanes", "buscad/busca primero el reino ... por añadidura", "lirios del campo",
  "su Hijo unigénito" (Jn 3:16), "Creo; ayuda mi incredulidad" (Mr 9:24), "venid a mí los cansados" (Mt 11:28).
  Luther (DE): "Sorgt euch nicht", "Glaube wie ein Senfkorn", "Hijo"->"Sohn", "kommt zu mir, ihr Müden".
  Keep es[]/de[] one entry per timing segment, sentences separated by ". " so the per-sentence (v2) split lines up.
- **Mobile backgrounds pan, do NOT make separate mobile images.** 16:9 images are cropped on phones, so on
  mobile the `.iml` layers animate `background-position` 0%->100% (`imgpan`, ~14s) to reveal the whole scene
  (subject often on the left -> starts at 0%). Desktop keeps the slow scale/translate drift.
- **Word highlight LEAD offset = 0.18s** (`var LEAD` in songJS): the gold sweep runs slightly ahead because
  whisper marks word starts a touch late. Tweak LEAD if a song feels early/late. Perfect per-word sync would
  need forced alignment (whisperX/aeneas) - future option, more setup; auto-timing has a small inherent wobble.
- **`narration` flag** in song.json: set `false` to skip the read-aloud TTS (and the listen button is hidden),
  e.g. to save ElevenLabs tokens. Default = narration on (Guillermo voice).
- **Thumbnail/cover** = `cover` in song.json -> shown as the hub card banner and faintly behind the gate;
  it adapts to desktop and mobile automatically (no separate asset).
