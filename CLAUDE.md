# CLAUDE.md — Marten's Songs

Start here, then read **BRANDING.md** (locked design/prompt/translation standards) and
**WORKLOG.md** (current state + open tasks). Reply to Marten in German. No em-dashes in copy.

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
- `tools/build-anim.js` — the whole player/animation + hub generator (CSS/JS live here).
- `tools/transcribe.js` — mp3 -> `timing.json` (whisper word timestamps).
- `tools/about-audio.js` — read-aloud narration of the "idea" text (Guillermo voice).
- `songs/<id>/song.json` — title, names{de,es}, subtitle (refs), genre, mp3, cover, images[], imageMap[],
  es[], de[], about{intro,de,es}, narration. (`song.json.off` = parked, excluded from build/hub.)
- API keys live in `C:/Users/marte/Documents/Claude/API keys/` (never hardcode).
