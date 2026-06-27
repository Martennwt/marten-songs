# CLAUDE.md — Marten's Songs

Start here. Human map + the goal: **README.md**. How we build (the KI guide = locked design, prompt,
translation + pipeline standards): **BRANDING.md**. Current state + open tasks: **WORKLOG.md**.
Reply to Marten in German. No em-dashes in copy.

## What this is
A static site of AI-created faith/love/life songs as **bilingual karaoke lyric animations**:
the English lyrics light up word by word in time with the music, an ES/DE translation sits below,
painted backgrounds drift behind, plus an "idea behind the song" panel.
Live: https://martennwt.github.io/marten-songs/ — public GitHub Pages, repo `Martennwt/marten-songs`.

## How to work
- Default translation language is **DE**; translations are top **Castellano (ES)** + **German (DE)**,
  echoing Reina-Valera / Luther for recognizable Bible lines (see BRANDING.md).
- **Build:** `node tools/build-anim.js <id>` (or `--all`). Builds `songs/<id>/index.html` (main: images +
  per-sentence) and `v1.html` (clean), and rebuilds the hub `index.html`.
- **Deploy:** commit + `git push origin main` (Pages auto-rebuilds). Only push when it works AND Marten OKs.
- **New song:** ideally Marten sends the **MP3 + the real lyrics** (MP3-only works when whisper hears it
  well, but it drops lines on some beats). Steps in BRANDING.md "Add a new song".
- Background images: Gemini 3 Pro (or flash-image ~4c). Narration optional (`narration:false` to skip).

## Key files
- `tools/retime.js` — lyrics + mp3 -> trustworthy `timing.json`. THE pipeline (lyrics are truth, Whisper only the clock).
- `tools/verify-song.js` — the gate before every delivery (text==lyrics, counts, monotonic timing, images). FAIL = do not ship.
- `tools/build-anim.js` — the whole player/animation + hub generator (CSS/JS live here).
- `tools/lib/lyrics.js` — the single segmentation truth (one lyric line = one data segment), used by retime AND verify.
- `tools/about-audio.js` — read-aloud narration of the "idea" text (Guillermo voice).
- `tools/transcribe.js` — FALLBACK only (no lyrics yet): first-draft text, then get real lyrics and run retime.
- `songs/<id>/song.json` — title, names{de,es}, subtitle (refs), genre, mp3, cover, images[], imageMap[],
  es[], de[], about{intro,de,es}, narration, introStart/introEnd/introLines/offset. (`song.json.off` = parked.)
- **External, NOT in this repo (by design):** image generator `Documents/Claude/tools/images/generate-image.js`
  + APIs (OpenAI/Whisper, ElevenLabs, Gemini). Keys in `Documents/Claude/API keys/` (never hardcode). See BRANDING.md.
- Run: Node >= 18 (built-in fetch), no npm deps. `package.json` has `npm run build` / `verify` / `retime`.
