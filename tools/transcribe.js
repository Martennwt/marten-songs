/* ============================================================================
   transcribe.js — turn a song mp3 into timing.json (segments + word timestamps).

   Two-step pipeline that works well for SUNG lyrics:
     1) gpt-4o-transcribe  -> clean, accurate lyrics (great content, no timing)
     2) whisper-1 verbose_json, guided by those lyrics as the prompt
        -> segments + word-level timestamps that match the real words
        (the prompt massively cuts Whisper's hallucination on music)

   Reads the OpenAI key from the central key store (never hardcode).
   Network call via the Bash tool needs dangerouslyDisableSandbox:true.

   Usage:
     node tools/transcribe.js "C:/path/song.mp3" songs/<id>/timing.json
   ============================================================================ */
const fs = require('fs');
const KEY_FILE = 'C:/Users/marte/Documents/Claude/API keys/OpenAI.txt';

function readKey() {
  const txt = fs.readFileSync(KEY_FILE, 'utf8');
  const m = txt.match(/OPENAI_API_KEY=(.+)/) || txt.match(/(sk-[A-Za-z0-9_\-]+)/);
  if (!m) throw new Error('OpenAI key not found in ' + KEY_FILE);
  return m[1].trim();
}

async function transcribe(key, buf, fields) {
  const fd = new FormData();
  fd.append('file', new Blob([buf], { type: 'audio/mpeg' }), 'song.mp3');
  for (const k in fields) fd.append(k, fields[k]);
  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST', headers: { Authorization: 'Bearer ' + key }, body: fd,
  });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 400));
  return r.json();
}

(async () => {
  const [, , audioPath, outPath] = process.argv;
  if (!audioPath || !outPath) { console.error('usage: node tools/transcribe.js <mp3> <out.json>'); process.exit(1); }
  const key = readKey();
  const buf = fs.readFileSync(audioPath);

  process.stdout.write('1/2 content (gpt-4o-transcribe) ... ');
  const c = await transcribe(key, buf, {
    model: 'gpt-4o-transcribe', response_format: 'json',
    prompt: 'This is a sung song with clear lyrics in English. Transcribe the lyrics faithfully.',
  });
  const cleanText = (c.text || '').trim();
  console.log('ok (' + cleanText.length + ' chars)');

  process.stdout.write('2/2 timing (whisper-1, guided) ... ');
  const out = await transcribeBoth(key, buf, cleanText);
  out.cleanText = cleanText;
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log('ok. duration=' + (out.duration || '?') + 's, words=' + (out.words || []).length + ', segments=' + (out.segments || []).length);
  console.log('\n--- segments (start -> text) ---');
  (out.segments || []).forEach(s => console.log(s.start.toFixed(1) + 's: ' + s.text.trim()));
  console.log('\nNext: write songs/<id>/song.json (title, mp3, es[] per segment), then: node tools/build-anim.js <id>');
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });

/* whisper-1 with BOTH word + segment granularities (needs the multi-value form) */
async function transcribeBoth(key, buf, cleanText) {
  const fd = new FormData();
  fd.append('file', new Blob([buf], { type: 'audio/mpeg' }), 'song.mp3');
  fd.append('model', 'whisper-1');
  fd.append('language', 'en');
  fd.append('prompt', cleanText.slice(0, 900));
  fd.append('response_format', 'verbose_json');
  fd.append('timestamp_granularities[]', 'word');
  fd.append('timestamp_granularities[]', 'segment');
  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST', headers: { Authorization: 'Bearer ' + key }, body: fd,
  });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 400));
  return r.json();
}
