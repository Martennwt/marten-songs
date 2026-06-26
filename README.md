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

1. Drop the audio in `songs/<id>/<id>.mp3`.
2. Transcribe with timing:
   ```
   node tools/transcribe.js "songs/<id>/<id>.mp3" "songs/<id>/timing.json"
   ```
   It prints the lines (segments). It uses OpenAI: `gpt-4o-transcribe` for the
   accurate lyrics, then `whisper-1` guided by those lyrics for word timestamps.
3. Create `songs/<id>/song.json`:
   ```json
   {
     "id": "<id>", "title": "...", "subtitle": "...", "theme": "faith|love|life",
     "mp3": "<id>.mp3",
     "es": ["spanish for segment 0", "...one entry per timing.json segment..."]
   }
   ```
   The `es` array lines up 1:1 with the segments printed by `transcribe.js`.
4. Build:
   ```
   node tools/build-anim.js <id>        # builds the song + rebuilds the hub
   node tools/build-anim.js --all       # rebuild everything
   ```
5. Open `songs/<id>/index.html` (or the hub `index.html`) to check it.

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
