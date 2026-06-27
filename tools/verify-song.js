/* ============================================================================
   verify-song.js — the pre-delivery gate. Run this BEFORE you ship a song.

   It re-checks, from scratch, that the built data is internally consistent and
   that the displayed text really is the lyrics you provided. If anything is off
   it prints a clear FAIL and exits non-zero, so you never hand over a song
   whose words or timing silently drifted.

   Checks:
     [text]     timing.json segment text == lyrics.txt segmentation (exactly)
     [counts]   #segments == es.length == de.length == imageMap.length
     [time]     every word start is a number, inside [0, duration], and the
                whole track is monotonic non-decreasing
     [bounds]   each segment's words sit within the segment's [start, end]
     [images]   every imageMap index points at a real images[] entry
     [cover]    how many words were anchored to the audio vs interpolated
                (warns, does not fail, below 40%)

   Usage:  node tools/verify-song.js <song-id>
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { parseSegments, norm } = require('./lib/lyrics');

const ROOT = path.resolve(__dirname, '..');

function main(id) {
  const dir = path.join(ROOT, 'songs', id);
  const fails = [], warns = [];
  const fail = m => fails.push(m), warn = m => warns.push(m);

  const metaPath = fs.existsSync(path.join(dir, 'song.json')) ? path.join(dir, 'song.json') : path.join(dir, 'song.json.off');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const timing = JSON.parse(fs.readFileSync(path.join(dir, 'timing.json'), 'utf8'));
  const lyrics = fs.readFileSync(path.join(dir, 'lyrics.txt'), 'utf8');
  const wantSegs = parseSegments(lyrics);
  const segs = timing.segments || [];
  const dur = +timing.duration || 0;

  // [counts]
  const es = meta.es || [], de = meta.de || [], im = meta.imageMap || [];
  if (segs.length !== wantSegs.length) fail(`segment count ${segs.length} != lyrics segments ${wantSegs.length}`);
  if (es.length !== segs.length) fail(`es[] length ${es.length} != segments ${segs.length}`);
  if (de.length !== segs.length) fail(`de[] length ${de.length} != segments ${segs.length}`);
  if (im.length !== segs.length) fail(`imageMap length ${im.length} != segments ${segs.length}`);

  // [text] displayed text must equal the lyrics, word for word
  const n = Math.min(segs.length, wantSegs.length);
  for (let i = 0; i < n; i++) {
    const got = (segs[i].text || '').trim();
    const want = wantSegs[i].text.trim();
    if (norm(got).replace(/\s+/g, '') !== norm(want).replace(/\s+/g, '')) {
      // norm strips punctuation; compare token-normalized to be safe
      const a = got.split(/\s+/).map(norm).join(' '), b = want.split(/\s+/).map(norm).join(' ');
      if (a !== b) fail(`segment ${i} text mismatch:\n      got:  ${got}\n      want: ${want}`);
    }
    // per-word token text must match the display tokens (precise builds)
    if (segs[i].w) {
      const wt = segs[i].w.map(o => norm(o.t)).join(' ');
      const tt = want.split(/\s+/).map(norm).join(' ');
      if (wt !== tt) fail(`segment ${i} word tokens != text tokens`);
    }
  }

  // [time] monotonic, numeric, in range
  let prev = -1, anchorsOk = true;
  for (let i = 0; i < segs.length; i++) {
    const ws = segs[i].w || [];
    if (!ws.length) { fail(`segment ${i} has no words`); continue; }
    for (const o of ws) {
      if (typeof o.s !== 'number' || !isFinite(o.s)) { fail(`segment ${i} word "${o.t}" has non-numeric start`); anchorsOk = false; break; }
      if (o.s < -0.001 || (dur && o.s > dur + 0.5)) fail(`segment ${i} word "${o.t}" start ${o.s} out of [0,${dur}]`);
      if (o.s < prev - 0.001) { fail(`non-monotonic time at segment ${i} word "${o.t}" (${o.s} < ${prev})`); }
      prev = o.s;
    }
    // [bounds]
    const first = ws[0].s, last = ws[ws.length - 1].s;
    if (first < segs[i].start - 0.001 || last > segs[i].end + 0.001) warn(`segment ${i} words sit outside [start,end]`);
  }

  // [drift] self-flag mis-timed songs so you don't have to ear-check every one:
  //   - "cram": a multi-word line whose words are squeezed into a tiny span
  //     (the classic symptom of a window/anchor that landed in the wrong place)
  //   - "jump": a line that starts far later than the song's typical line gap
  //     (a real instrumental break is fine; this only fires on extreme outliers)
  const lineStarts = segs.map(s => (s.w && s.w[0]) ? s.w[0].s : 0);
  const gaps = [];
  for (let i = 1; i < segs.length; i++) gaps.push(lineStarts[i] - lineStarts[i - 1]);
  const medGap = gaps.length ? [...gaps].sort((a, b) => a - b)[Math.floor(gaps.length / 2)] : 0;
  segs.forEach((s, i) => {
    const ws = s.w || [];
    if (ws.length >= 4) {
      const span = ws[ws.length - 1].s - ws[0].s;
      if (span < 0.6) warn(`segment ${i} words crammed into ${span.toFixed(2)}s (likely misaligned): "${(s.text || '').slice(0, 40)}"`);
    }
  });
  if (medGap > 0) for (let i = 1; i < segs.length; i++) {
    const g = lineStarts[i] - lineStarts[i - 1];
    if (g > Math.max(medGap * 4, 9)) warn(`big jump before segment ${i} (+${g.toFixed(1)}s vs ~${medGap.toFixed(1)}s typical) — check for drift: "${(segs[i].text || '').slice(0, 40)}"`);
  }

  // [images]
  const nImg = (meta.images || []).length;
  im.forEach((ix, i) => { if (ix < 0 || ix >= nImg) fail(`imageMap[${i}]=${ix} but only ${nImg} images`); });

  // [cover]
  const cov = timing._retime ? timing._retime.coverage : null;
  if (cov != null && cov < 0.4) warn(`only ${(cov * 100).toFixed(0)}% of words anchored to audio — timing is mostly estimated`);
  const weakSegs = (timing._retime && timing._retime.weakSegments) || [];
  weakSegs.forEach(i => warn(`segment ${i} timing is mostly estimated (soft/quiet part Whisper couldn't hear): "${(segs[i] && segs[i].text || '').slice(0, 44)}..."`));

  // report
  console.log(`\n=== verify: ${id} ===`);
  console.log(`segments ${segs.length} | es ${es.length} | de ${de.length} | imageMap ${im.length} | duration ${dur.toFixed(1)}s` +
    (cov != null ? ` | coverage ${(cov * 100).toFixed(0)}%` : ''));
  warns.forEach(w => console.log('  WARN  ' + w));
  if (fails.length) {
    fails.forEach(f => console.log('  FAIL  ' + f));
    console.log(`\nRESULT: FAIL (${fails.length} problem(s)) — do NOT ship.`);
    return 1;
  }
  console.log(`\nRESULT: PASS${warns.length ? ` (${warns.length} warning(s))` : ''} — text matches lyrics, timing is sane.`);
  return 0;
}

const id = process.argv[2];
if (!id) { console.error('usage: node tools/verify-song.js <song-id>'); process.exit(1); }
process.exit(main(id));
