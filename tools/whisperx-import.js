/* ============================================================================
   whisperx-import.js — turn WhisperX forced-alignment into our timing.json.

   WhisperX (tools/whisperx-align.py) writes songs/<id>/whisperx-aligned.json
   with measured per-word times. This adapter converts it into the exact
   timing.json our builder + verifier expect, the SAME shape retime.js produces:
     { precise:true, duration, words:[{word,start,end}],
       segments:[{seg,text,start,end, w:[{t,s}] }], _retime:{...} }

   It does NOT trust WhisperX blindly. The LYRICS are the truth: it rebuilds
   each segment's words from lyrics.txt (canonical tokens, via lib/lyrics.js),
   lays the measured WhisperX times onto them in order, interpolates any word
   WhisperX could not place, and forces monotonic time. So the per-word count
   always equals the display tokens (what build-anim.js needs to use the
   precise path) and verify-song.js passes.

   Usage:  node tools/whisperx-import.js <song-id> [outfile=timing.json]
   ============================================================================ */
const fs = require('fs');
const path = require('path');
const { parseSegments, norm } = require('./lib/lyrics');

const ROOT = path.resolve(__dirname, '..');

function fillTimes(times, lo, hi) {
  // times: array with numbers or null. lo/hi: fallback bounds for the segment.
  const n = times.length;
  const known = [];
  for (let i = 0; i < n; i++) if (times[i] != null) known.push(i);
  if (!known.length) {                       // nothing measured: spread evenly
    const span = Math.max(hi - lo, 0.001);
    for (let i = 0; i < n; i++) times[i] = lo + (span * i) / Math.max(n, 1);
    return times;
  }
  // leading nulls -> from lo up to first known
  const f = known[0];
  for (let i = 0; i < f; i++) times[i] = lo + ((times[f] - lo) * (i + 1)) / (f + 1);
  // gaps between known -> linear
  for (let k = 0; k < known.length - 1; k++) {
    const a = known[k], b = known[k + 1];
    for (let i = a + 1; i < b; i++)
      times[i] = times[a] + ((times[b] - times[a]) * (i - a)) / (b - a);
  }
  // trailing nulls -> from last known up to hi
  const l = known[known.length - 1];
  for (let i = l + 1; i < n; i++) times[i] = times[l] + ((hi - times[l]) * (i - l)) / (n - l);
  return times;
}

function main(id, outfile) {
  const dir = path.join(ROOT, 'songs', id);
  const aligned = JSON.parse(fs.readFileSync(path.join(dir, 'whisperx-aligned.json'), 'utf8'));
  const lyrics = fs.readFileSync(path.join(dir, 'lyrics.txt'), 'utf8');
  const lySegs = parseSegments(lyrics);                 // canonical segments + tokens
  const aSegs = aligned.segments || [];
  const duration = +aligned.duration || 0;

  if (aSegs.length !== lySegs.length)
    throw new Error(`whisperx segments ${aSegs.length} != lyrics segments ${lySegs.length} (re-run whisperx-align)`);

  const outSegs = [];
  const flat = [];
  let prev = 0, anchorsTotal = 0, tokensTotal = 0;
  const segCoverage = [], weakSegments = [];

  for (let i = 0; i < lySegs.length; i++) {
    const tokens = lySegs[i].tokens;                    // truth: display words
    const wx = (aSegs[i].w || []).filter(w => typeof w.s === 'number');
    const times = new Array(tokens.length).fill(null);

    // match WhisperX words onto canonical tokens in order (subset-safe)
    let j = 0, anchors = 0;
    for (let k = 0; k < tokens.length; k++) {
      if (j < wx.length && norm(wx[j].t) === norm(tokens[k])) { times[k] = wx[j].s; j++; anchors++; }
    }
    // if order-match found nothing but counts line up, zip positionally
    if (!anchors && wx.length === tokens.length) {
      for (let k = 0; k < tokens.length; k++) { times[k] = wx[k].s; anchors++; }
    }
    anchorsTotal += anchors; tokensTotal += tokens.length;
    segCoverage.push(+(anchors / Math.max(tokens.length, 1)).toFixed(2));
    if (anchors / Math.max(tokens.length, 1) < 0.5) weakSegments.push(i);

    const lo = (aSegs[i].start != null) ? +aSegs[i].start : prev;
    const nextLo = (i + 1 < aSegs.length && aSegs[i + 1].start != null) ? +aSegs[i + 1].start : duration || lo + 1;
    const hi = (aSegs[i].end != null) ? +aSegs[i].end : nextLo;
    fillTimes(times, lo, hi);

    // force monotonic across the whole song
    const w = tokens.map((t, k) => {
      let s = +(+times[k]).toFixed(2);
      if (s < prev) s = +prev.toFixed(2);
      prev = s;
      return { t, s };
    });
    const start = w.length ? w[0].s : lo;
    const end = +(Math.max(w.length ? w[w.length - 1].s : hi, hi)).toFixed(2);
    outSegs.push({ seg: i, text: lySegs[i].text, start, end, w });
  }

  // flat top-level words list (word + start + end = next word start)
  outSegs.forEach((s, si) => s.w.forEach((o, k) => {
    const next = (k + 1 < s.w.length) ? s.w[k + 1].s
      : (si + 1 < outSegs.length && outSegs[si + 1].w[0]) ? outSegs[si + 1].w[0].s
      : Math.min(o.s + 1, duration || o.s + 1);
    flat.push({ word: o.t, start: o.s, end: +(+next).toFixed(2) });
  }));

  const coverage = +(anchorsTotal / Math.max(tokensTotal, 1)).toFixed(3);
  const out = {
    precise: true, duration, words: flat, segments: outSegs,
    _retime: {
      engine: 'whisperx', anchors: anchorsTotal, total: tokensTotal,
      coverage, segments: outSegs.length, segCoverage, weakSegments,
    },
  };
  const outPath = path.join(dir, outfile || 'timing.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`[whisperx-import] ${id}: ${outSegs.length} segments, ${tokensTotal} words, ` +
    `coverage ${(coverage * 100).toFixed(0)}%${weakSegments.length ? `, weak ${JSON.stringify(weakSegments)}` : ''}`);
  console.log(`[whisperx-import] wrote ${outPath}`);
}

const id = process.argv[2];
if (!id) { console.error('usage: node tools/whisperx-import.js <song-id> [outfile]'); process.exit(1); }
main(id, process.argv[3]);
