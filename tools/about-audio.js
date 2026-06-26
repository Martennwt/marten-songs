/* ============================================================================
   about-audio.js — narrate a song's "idea behind the song" (the about text)
   with a deep voice (ElevenLabs), one MP3 per language.

   Turns the written about text into a SPEAK-friendly script:
   - drops the bracketed scripture references like "(Mt 13,3-9)" / "(13,18-23)"
     (they sound like noise when read aloud),
   - expands inline ones: "Mt 6,33" -> "Matthaeus 6, Vers 33" (DE) /
     "Mateo 6, versiculo 33" (ES); "Johannes 3,16" -> "... Vers 16"; "V. 27" -> "Vers 27",
   - strips typographic quotes.

   Reads songs/<id>/song.json -> about.{intro,de,es}, writes songs/<id>/about-<lang>.mp3.

   Usage:  node tools/about-audio.js <song-id> [voiceId] [speed]
   Network call via the Bash tool needs dangerouslyDisableSandbox:true.
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const KEYDIR = 'C:/Users/marte/Documents/Claude/API keys';
const DEFAULT_VOICE = 'qUPtETgSYRhCRb2pfOla';      // Guillermo (deep, chosen for the narration)
const MODEL = 'eleven_multilingual_v2';

function readKey() {
  const t = fs.readFileSync(path.join(KEYDIR, 'ElevenLabs.txt'), 'utf8');
  const m = t.match(/ELEVENLABS_API_KEY=(.+)/) || t.match(/(sk_[A-Za-z0-9]+)/);
  if (!m) throw new Error('ElevenLabs key not found');
  return m[1].trim();
}

/* build a clean, speakable narration from the about object */
function narrate(about, lang) {
  if (!about) return '';
  const parts = [];
  if (about.intro && about.intro[lang]) parts.push(about.intro[lang]);
  (about[lang] || []).forEach(s => { if (s.h) parts.push(s.h.replace(/\s*·\s*/g, ': ')); (s.p || []).forEach(p => parts.push(p)); });
  let t = parts.join('\n\n');
  const VERSE = lang === 'es' ? 'versículo' : 'Vers';
  const RANGE = lang === 'es' ? ' a ' : ' bis ';
  // strip typographic quotes
  t = t.replace(/[„“”»«]/g, '');
  // drop any parenthetical that contains a digit (these are scripture references)
  t = t.replace(/\s*\([^)]*\d[^)]*\)/g, '');
  // "Mt 6,33" -> book name
  t = t.replace(/\bMt\.?\s+/g, lang === 'es' ? 'Mateo ' : 'Matthäus ');
  // "<Book> 6,33" or "6,33-39" -> "<Book> 6, Vers 33 (bis 39)"
  t = t.replace(/\b(Matthäus|Mateo|Johannes|Juan|Lukas|Lucas)\s+(\d+),(\d+)(?:-(\d+))?/g,
    (m, b, c, v, v2) => b + ' ' + c + ', ' + VERSE + ' ' + v + (v2 ? (RANGE + v2) : ''));
  // "V. 27" -> "Vers 27"
  t = t.replace(/\bV\.\s*(\d+)/g, VERSE + ' $1');
  // tidy
  t = t.replace(/\s+([.,;:!?])/g, '$1').replace(/[ \t]{2,}/g, ' ').replace(/\(\s*\)/g, '').replace(/\n{3,}/g, '\n\n').trim();
  return t;
}

async function tts(text, voiceId, settings, key) {
  const r = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId + '?output_format=mp3_44100_192', {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Accept': 'audio/mpeg', 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings: settings }),
  });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 300));
  return Buffer.from(await r.arrayBuffer());
}

if (require.main === module) {
  const id = process.argv[2];
  const voiceId = process.argv[3] || DEFAULT_VOICE;
  const speed = +(process.argv[4] || 1.06);
  if (!id) { console.error('usage: node tools/about-audio.js <song-id> [voiceId] [speed]'); process.exit(1); }
  const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'songs', id, 'song.json'), 'utf8'));
  const settings = { stability: 0.9, similarity_boost: 0.9, style: 0.35, use_speaker_boost: true, speed };
  (async () => {
    const key = readKey();
    for (const lang of ['de', 'es']) {
      const txt = narrate(meta.about, lang);
      if (!txt) { console.log('skip ' + lang); continue; }
      process.stdout.write('[' + lang + '] ' + txt.length + ' chars, speed ' + speed + ' ... ');
      const buf = await tts(txt, voiceId, settings, key);
      fs.writeFileSync(path.join(ROOT, 'songs', id, 'about-' + lang + '.mp3'), buf);
      console.log((buf.length / 1024).toFixed(0) + ' KB -> about-' + lang + '.mp3');
    }
    console.log('done.');
  })().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
}

module.exports = { narrate, tts, readKey, MODEL };
