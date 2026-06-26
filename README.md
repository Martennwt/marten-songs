# Marten's Songs

AI-created songs about faith, love, life and God, shown as bilingual karaoke
lyric animations: the English lyrics light up word by word in time with the
music, with a Spanish translation underneath. A hub page lists every song.

## Structure

```
Marten's Songs/
  index.html              hub page (auto-built, lists all songs)
  songs/
    the-sower/
      index.html          the song's animation (auto-built)
      the-sower.mp3        the audio
      song.json           title, subtitle, theme, mp3 name, es[] translations
      timing.json         transcript + word timestamps (from transcribe.js)
  tools/
    transcribe.js         mp3 -> timing.json (OpenAI: clean text + word timing)
    build-anim.js         song.json + timing.json -> the animation + hub
  assets/                 shared assets (if needed later)
```

## Add a new song

**Always have the MP3 *and* the real lyrics.** Auto-transcribing singing drops/mangles
lines, so we use the lyrics as ground truth and Whisper only for timing. (Full pipeline +
look/feel: `BRANDING.md`. Guided flow: the `/neuer-song` skill.)

1. Drop the audio in `songs/<id>/<id>.mp3` and the real lyrics in `songs/<id>/lyrics.txt`
   (verse blocks separated by blank lines; `[Verse]/[Chorus]` headers are ignored; write
   choruses out in full).
2. Build the timing from lyrics + audio:
   ```
   node tools/retime.js <id>
   ```
   Guided `whisper-1` gives word clocks; your real words are aligned onto them, gaps
   interpolated, time forced monotonic. The displayed text is your lyrics by construction.
   It prints coverage % and flags any "weak" (soft/quiet) segments.
3. Create `songs/<id>/song.json` with `es[]`/`de[]`/`imageMap[]` — **one entry per couplet**
   (= per timing segment; segmentation lives in `tools/lib/lyrics.js`), plus title, subtitle,
   theme, genre, mp3, cover, images[], about{}. No internal `". "` inside an es/de entry.
4. **Verify before anything else:**
   ```
   node tools/verify-song.js <id>      # text==lyrics, counts, monotonic timing, images
   ```
   `FAIL` = do not ship; fix and re-verify.
5. Build:
   ```
   node tools/build-anim.js <id>        # builds the song + rebuilds the hub
   node tools/build-anim.js --all       # rebuild everything
   ```
6. Open `songs/<id>/index.html` and play it through before sharing.

`transcribe.js` (gpt-4o-transcribe + guided whisper-1) is only for a first draft when no
lyrics exist yet — then get the real lyrics and use `retime.js`.

## Notes

- API keys live in `C:/Users/marte/Documents/Claude/API keys/` and are read by
  the scripts, never hardcoded. Only `transcribe.js` needs the key (the build is
  fully offline).
- Auto-transcription of singing is good but not perfect; a word may light up
  slightly early or late. Fine-tune by editing the `start` values in
  `timing.json` if needed, then rebuild.
- Fonts load from Google Fonts (online) with a system fallback. Everything else
  works offline by double-clicking the HTML.

## Deploy (planned)

Goal: publish to GitHub Pages so a single link can be shared. The repo is a
static site (root `index.html`), so Pages can serve it directly from `main`.
