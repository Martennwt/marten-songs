/* ============================================================================
   retime.js — build a TRUSTWORTHY timing.json from the real lyrics + the mp3.

   This is the fix for the #1 failure mode: auto-transcription of singing drops
   or mangles lines, so the displayed text and the timing are both wrong. Here
   we never trust Whisper's TEXT. We take your real lyrics as ground truth and
   use Whisper only as a clock:

     1. Segment your lyrics.txt the canonical way (tools/lib/lyrics.js).
     2. Ask whisper-1 (guided by your lyrics) for word-level timestamps.
     3. Align YOUR words onto Whisper's words (Needleman-Wunsch on normalized
        text). Each real word inherits the time of the Whisper word it matched.
     4. Where Whisper missed words (a dropped line), interpolate the times from
        the nearest matched neighbours, then force the whole track monotonic.
     5. Write timing.json with precise:true and per-segment word times, so the
        builder uses our times verbatim (no fragile time-window guessing).

   The displayed text is therefore EXACTLY your lyrics, by construction. Timing
   is as good as Whisper heard, gracefully filled where it didn't.

   Usage:  node tools/retime.js <song-id>
           (reads songs/<id>/lyrics.txt and the mp3 named in song.json[.off])
   Needs the OpenAI key + network -> run via Bash with dangerouslyDisableSandbox.
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { parseSegments, flattenTokens, norm } = require('./lib/lyrics');

const ROOT = path.resolve(__dirname, '..');
const KEY_FILE = 'C:/Users/marte/Documents/Claude/API keys/OpenAI.txt';

function readKey() {
  const txt = fs.readFileSync(KEY_FILE, 'utf8');
  const m = txt.match(/OPENAI_API_KEY=(.+)/) || txt.match(/(sk-[A-Za-z0-9_\-]+)/);
  if (!m) throw new Error('OpenAI key not found in ' + KEY_FILE);
  return m[1].trim();
}

async function whisperWords(key, buf, guide) {
  const fd = new FormData();
  fd.append('file', new Blob([buf], { type: 'audio/mpeg' }), 'song.mp3');
  fd.append('model', 'whisper-1');
  fd.append('language', 'en');
  fd.append('prompt', (guide || '').slice(0, 900));
  fd.append('response_format', 'verbose_json');
  fd.append('timestamp_granularities[]', 'word');
  fd.append('timestamp_granularities[]', 'segment');
  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST', headers: { Authorization: 'Bearer ' + key }, body: fd,
  });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + (await r.text()).slice(0, 400));
  return r.json();
}

/* Needleman-Wunsch: align true tokens A onto whisper tokens B (both normalized).
   Returns matchJ[i] = index into B that true token i matched, or -1. */
function align(A, B) {
  const n = A.length, m = B.length, GAP = -1, MIS = -1, HIT = 2;
  const dp = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const bt = Array.from({ length: n + 1 }, () => new Int8Array(m + 1));
  for (let i = 1; i <= n; i++) { dp[i][0] = i * GAP; bt[i][0] = 1; }
  for (let j = 1; j <= m; j++) { dp[0][j] = j * GAP; bt[0][j] = 2; }
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    const s = A[i - 1] === B[j - 1] ? HIT : MIS;
    let best = dp[i - 1][j - 1] + s, d = 0;
    const up = dp[i - 1][j] + GAP, left = dp[i][j - 1] + GAP;
    if (up > best) { best = up; d = 1; }
    if (left > best) { best = left; d = 2; }
    dp[i][j] = best; bt[i][j] = d;
  }
  const matchJ = new Array(n).fill(-1);
  let i = n, j = m;
  while (i > 0 || j > 0) {
    const d = (i > 0 && j > 0) ? bt[i][j] : (i > 0 ? 1 : 2);
    if (d === 0) { if (A[i - 1] === B[j - 1]) matchJ[i - 1] = j - 1; i--; j--; }
    else if (d === 1) { i--; } else { j--; }
  }
  return matchJ;
}

/* fill null starts (words Whisper didn't anchor) and make the track monotonic.
   Leading/trailing runs are placed at the song's natural word rate so an
   instrumental or too-quiet intro stays un-highlighted instead of being smeared
   from 0s (which lights words up long before they are actually sung). */
function fillTimes(starts, duration) {
  const n = starts.length;
  const idx = [];
  for (let i = 0; i < n; i++) if (starts[i] != null) idx.push(i);
  if (!idx.length) { // no anchors at all: spread evenly across the song
    for (let i = 0; i < n; i++) starts[i] = (i / Math.max(1, n)) * duration;
    return { anchors: 0, rate: duration / Math.max(1, n) };
  }
  // median word rate from consecutive anchored pairs (robust to outliers)
  const rates = [];
  for (let a = 0; a < idx.length - 1; a++) {
    const dt = starts[idx[a + 1]] - starts[idx[a]], dn = idx[a + 1] - idx[a];
    if (dn > 0 && dt > 0) rates.push(dt / dn);
  }
  rates.sort((x, y) => x - y);
  let rate = rates.length ? rates[Math.floor(rates.length / 2)] : 0.45;
  rate = Math.min(0.9, Math.max(0.22, rate));
  // leading: back-fill from the first anchor at the natural rate (floor 0)
  for (let i = idx[0] - 1; i >= 0; i--) starts[i] = Math.max(0, starts[i + 1] - rate);
  // internal gaps: linear between consecutive anchors
  for (let a = 0; a < idx.length - 1; a++) {
    const p = idx[a], q = idx[a + 1], pt = starts[p], qt = starts[q];
    for (let i = p + 1; i < q; i++) starts[i] = pt + (qt - pt) * ((i - p) / (q - p));
  }
  // trailing: extend at the natural rate, capped by duration
  const last = idx[idx.length - 1];
  for (let i = last + 1; i < n; i++) starts[i] = Math.min(duration - 0.1, starts[i - 1] + rate);
  // monotonic non-decreasing with a tiny minimum step
  for (let i = 1; i < n; i++) if (starts[i] <= starts[i - 1]) starts[i] = starts[i - 1] + 0.04;
  return { anchors: idx.length, rate };
}

(async () => {
  const id = process.argv[2];
  if (!id) { console.error('usage: node tools/retime.js <song-id>'); process.exit(1); }
  const dir = path.join(ROOT, 'songs', id);
  const lyrics = fs.readFileSync(path.join(dir, 'lyrics.txt'), 'utf8');
  const metaPath = fs.existsSync(path.join(dir, 'song.json')) ? path.join(dir, 'song.json') : path.join(dir, 'song.json.off');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const mp3 = path.join(dir, meta.mp3 || (id + '.mp3'));

  const segs = parseSegments(lyrics);
  const flat = flattenTokens(segs);
  console.log('segments: ' + segs.length + ', words: ' + flat.length);

  // Whisper is the only network/paid step. Cache its raw output so re-segmenting
  // or re-tuning is free + deterministic. Use `--fresh` to force a new call.
  const rawPath = path.join(dir, '.whisper.json');
  const fresh = process.argv.includes('--fresh');
  let w;
  if (fs.existsSync(rawPath) && !fresh) {
    w = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
    console.log('using cached whisper (' + path.basename(rawPath) + '; --fresh to re-call)');
  } else {
    const key = readKey();
    const buf = fs.readFileSync(mp3);
    process.stdout.write('whisper-1 (guided by your lyrics) ... ');
    const r = await whisperWords(key, buf, segs.map(s => s.text).join(' '));
    w = { words: r.words || [], segments: r.segments || [], duration: +r.duration || 0 };
    fs.writeFileSync(rawPath, JSON.stringify(w));
    console.log('ok (cached)');
  }
  const W = (w.words || []).map(o => ({ n: norm(o.word), start: +o.start }));
  const duration = +w.duration || 0;
  console.log('whisper: ' + W.length + ' words, ' + duration.toFixed(1) + 's');

  // align our true words onto whisper's words
  const matchJ = align(flat.map(t => t.n), W.map(o => o.n));
  const anchored = matchJ.map(j => j >= 0);
  const starts = flat.map((t, i) => (anchored[i] ? W[matchJ[i]].start : null));
  const { anchors } = fillTimes(starts, duration || (starts.length * 0.5));
  // per-segment coverage = fraction of its words that anchored to real audio
  const segHit = segs.map(() => [0, 0]);
  flat.forEach((t, i) => { segHit[t.seg][1]++; if (anchored[i]) segHit[t.seg][0]++; });
  const segCoverage = segHit.map(([h, tot]) => tot ? +(h / tot).toFixed(2) : 0);
  const weakSegments = segCoverage.map((c, i) => [c, i]).filter(([c]) => c < 0.5).map(([, i]) => i);

  // stitch back into segments with per-word times
  let p = 0;
  const outSegs = segs.map((s, si) => {
    const wobj = s.tokens.map((tok) => ({ t: tok, s: +starts[p++].toFixed(2) }));
    return { seg: si, text: s.text, start: wobj[0].s, end: 0, w: wobj };
  });
  // weak segments: Whisper's per-word stamps are unreliable here (soft/quiet
  // singing it barely heard), but its SEGMENT boundaries are solid. Spread the
  // words evenly across the window bounded by the confident neighbours, so a
  // soft intro tracks smoothly instead of clustering or cramming.
  for (const i of weakSegments) {
    const left = i > 0 ? outSegs[i - 1].w[outSegs[i - 1].w.length - 1].s + 0.3 : 0.3;
    const right = i + 1 < outSegs.length ? outSegs[i + 1].w[0].s - 0.2 : (duration - 0.2);
    const m = outSegs[i].w.length, span = Math.max(0.5, right - left);
    outSegs[i].w.forEach((o, k) => { o.s = +(left + span * ((k + 1) / (m + 1))).toFixed(2); });
    outSegs[i].start = outSegs[i].w[0].s;
  }
  // segment end = next segment's first word start (so the last word sweeps to it)
  for (let i = 0; i < outSegs.length; i++) {
    const nextStart = i + 1 < outSegs.length ? outSegs[i + 1].start : (duration || outSegs[i].w[outSegs[i].w.length - 1].s + 2.5);
    const lastW = outSegs[i].w[outSegs[i].w.length - 1].s;
    outSegs[i].end = +Math.max(lastW + 0.4, Math.min(nextStart, lastW + 2.5)).toFixed(2);
  }
  // flat words array (kept for compatibility / other tools)
  const words = [];
  outSegs.forEach(s => s.w.forEach((o, k) => words.push({
    word: o.t, start: o.s, end: +(s.w[k + 1] ? s.w[k + 1].s : s.end).toFixed(2),
  })));

  const coverage = flat.length ? anchors / flat.length : 0;
  const out = {
    precise: true, duration, words, segments: outSegs,
    _retime: { anchors, total: flat.length, coverage: +coverage.toFixed(3), segments: segs.length, segCoverage, weakSegments },
  };
  fs.writeFileSync(path.join(dir, 'timing.json'), JSON.stringify(out, null, 2));
  console.log('wrote timing.json — coverage ' + (coverage * 100).toFixed(0) + '% (' +
    anchors + '/' + flat.length + ' words anchored to audio, rest interpolated)');
  if (weakSegments.length) console.log('NOTE: ' + weakSegments.length + ' weak segment(s) (mostly estimated timing): ' +
    weakSegments.map(i => '#' + i + ' "' + outSegs[i].text.slice(0, 32) + '..."').join(', '));
})().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
