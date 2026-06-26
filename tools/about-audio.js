/* ============================================================================
   about-audio.js — narrate a song's "idea behind the song" (the about text)
   with the deep dave voice (ElevenLabs), one MP3 per language.

   Reads songs/<id>/song.json -> about.{intro,de,es}, assembles a clean script,
   writes songs/<id>/about-<lang>.mp3.

   Usage:  node tools/about-audio.js <song-id>
   Network call via the Bash tool needs dangerouslyDisableSandbox:true.
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const KEYDIR = 'C:/Users/marte/Documents/Claude/API keys';
const VOICE = 'QtPMrakdgePQIUwOX7Ut';            // dave (deep, multilingual)
const MODEL = 'eleven_multilingual_v2';
const SETTINGS = { stability: 0.9, similarity_boost: 0.9, style: 0.35, use_speaker_boost: true, speed: 1.0 };

function readKey() {
  const t = fs.readFileSync(path.join(KEYDIR, 'ElevenLabs.txt'), 'utf8');
  const m = t.match(/ELEVENLABS_API_KEY=(.+)/) || t.match(/(sk_[A-Za-z0-9]+)/);
  if (!m) throw new Error('ElevenLabs key not found');
  return m[1].trim();
}
function assemble(about, lang) {
  if (!about) return '';
  const parts = [];
  if (about.intro && about.intro[lang]) parts.push(about.intro[lang]);
  (about[lang] || []).forEach(s => { if (s.h) parts.push(s.h.replace(/\s*·\s*/g, ', ')); (s.p || []).forEach(p => parts.push(p)); });
  return parts.join('\n\n');
}
const clean = s => s.replace(/[„“”»«"]/g, '').replace(/[ \t]+/g, ' ').trim();

(async () => {
  const id = process.argv[2];
  if (!id) { console.error('usage: node tools/about-audio.js <song-id>'); process.exit(1); }
  const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'songs', id, 'song.json'), 'utf8'));
  const key = readKey();
  for (const lang of ['de', 'es']) {
    const txt = clean(assemble(meta.about, lang));
    if (!txt) { console.log('skip ' + lang + ' (no about text)'); continue; }
    process.stdout.write('[' + lang + '] ' + txt.length + ' chars ... ');
    const r = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + VOICE + '?output_format=mp3_44100_192', {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Accept': 'audio/mpeg', 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: txt, model_id: MODEL, voice_settings: SETTINGS }),
    });
    if (!r.ok) { console.error('\nHTTP ' + r.status + ' ' + (await r.text()).slice(0, 300)); process.exit(1); }
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(path.join(ROOT, 'songs', id, 'about-' + lang + '.mp3'), buf);
    console.log((buf.length / 1024).toFixed(0) + ' KB -> about-' + lang + '.mp3');
  }
  console.log('done.');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
