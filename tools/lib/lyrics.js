/* ============================================================================
   lyrics.js — the single source of truth for turning a human lyrics.txt into
   the song's SEGMENTS (one couplet = one karaoke display line).

   Used by retime.js (to build timing.json) and verify-song.js (to check it).
   Keeping the rule in one place is what makes "the text is guaranteed correct"
   actually true: every tool segments the lyrics the exact same way.

   The rule (deterministic, ONE LYRIC LINE = ONE display line — the standard
   look from "The Sower": each sung line lights up on its own, with its own
   translation underneath, independent of punctuation):
     1. Drop blank lines (block separators) and section headers like
        "[Verse 1]", "[Chorus]", "[Intro: ...]".
     2. Every remaining lyric line becomes one segment (one display line).
   Choruses are written out in full in lyrics.txt, so repeats come for free and
   line up 1:1 with the es[]/de[]/imageMap[] arrays in song.json.
   ============================================================================ */

/** normalize a word for matching: lowercase, drop everything but a-z0-9. */
function norm(w) { return String(w).toLowerCase().replace(/[^a-z0-9]+/g, ''); }

/** split a segment's text into display tokens the same way build-anim.js does. */
function tokenize(text) { return text.trim().split(/\s+/).filter(Boolean); }

/**
 * Parse raw lyrics text into ordered segments.
 * @returns {Array<{text:string, lines:string[], tokens:string[]}>}
 */
function parseSegments(raw) {
  const rawLines = raw.replace(/\r/g, '').split('\n');
  // group into blocks separated by blank lines, dropping [headers]
  const blocks = [];
  let cur = [];
  for (const ln of rawLines) {
    const t = ln.trim();
    if (!t) { if (cur.length) { blocks.push(cur); cur = []; } continue; }
    if (/^\[.*\]$/.test(t)) continue;            // section header
    cur.push(t.replace(/\s+/g, ' '));
  }
  if (cur.length) blocks.push(cur);

  const segs = [];
  for (const block of blocks) {
    for (const line of block) {
      segs.push({ text: line, lines: [line], tokens: tokenize(line) });
    }
  }
  return segs;
}

/** flat list of {seg, k, token, norm} for every token across all segments. */
function flattenTokens(segs) {
  const out = [];
  segs.forEach((s, si) => s.tokens.forEach((tok, k) =>
    out.push({ seg: si, k, token: tok, n: norm(tok) })));
  return out;
}

module.exports = { norm, tokenize, parseSegments, flattenTokens };
