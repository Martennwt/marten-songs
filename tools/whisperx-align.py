#!/usr/bin/env python
# ============================================================================
# whisperx-align.py - local forced alignment of OUR lyrics to the audio.
#
# Method (robust, handles repeated choruses, no per-line window guessing):
#   1. A quick local VAD pre-scan finds the SUNG REGION (so an instrumental
#      intro/outro is trimmed and the first words don't get glued onto silence).
#   2. ONE whole-song CTC forced alignment of the full lyrics against that
#      region (wav2vec2). CTC alignment is MONOTONIC over the entire word
#      sequence, so a chorus that repeats 3x lines up at its 3 real times - the
#      thing that broke the proportional/ per-line approaches mid-song.
#   3. Writes the measured per-word times to songs/<id>/.whisper.json, the exact
#      cache shape tools/retime.js reads. Then `node tools/retime.js <id>`
#      (which finds the cache and makes NO network call) does the proven
#      Needleman-Wunsch of OUR lyrics onto these times + interpolation + the
#      monotonic, per-segment timing.json. So we reuse the battle-tested timer
#      and only swap its clock source from the OpenAI cloud to local WhisperX.
#
# Fully local, free, no cloud. After this run: `node tools/retime.js <id>`.
#
# Run:  .venv\Scripts\python.exe tools\whisperx-align.py <song-id>
# ============================================================================
import sys, os, re, json, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def ensure_ffmpeg_on_path():
    from shutil import which
    if which("ffmpeg"):
        return
    for p in glob.glob(os.path.join(os.environ.get("LOCALAPPDATA", ""),
                                    "Microsoft", "WinGet", "Packages",
                                    "Gyan.FFmpeg*", "**", "bin"), recursive=True):
        if os.path.exists(os.path.join(p, "ffmpeg.exe")):
            os.environ["PATH"] = p + os.pathsep + os.environ.get("PATH", "")
            return

def parse_segments(raw):
    """One lyric line = one segment. Mirrors tools/lib/lyrics.js parseSegments()."""
    out = []
    for ln in raw.replace("\r", "").split("\n"):
        t = ln.strip()
        if not t or re.match(r"^\[.*\]$", t):
            continue
        out.append(re.sub(r"\s+", " ", t))
    return out

def vocal_bounds(audio, duration):
    """VAD pre-scan: return (start, end) of the sung region so an instrumental
    intro/outro is trimmed. Falls back to the whole file."""
    try:
        from faster_whisper import WhisperModel
        m = WhisperModel("base", device="cpu", compute_type="int8")
        segs, _ = m.transcribe(audio, vad_filter=True, language="en")
        spans = [(float(s.start), float(s.end)) for s in segs if s.end > s.start]
        if spans:
            return min(s for s, _ in spans), max(e for _, e in spans)
    except Exception as e:
        print("[whisperx] VAD pre-scan failed, using whole file:", repr(e))
    return 0.0, duration

def main():
    if len(sys.argv) < 2:
        sys.exit("usage: python tools/whisperx-align.py <song-id>")
    sid = sys.argv[1]
    sdir = os.path.join(ROOT, "songs", sid)
    lyrics_path = os.path.join(sdir, "lyrics.txt")
    song_json = os.path.join(sdir, "song.json")
    if not os.path.exists(lyrics_path):
        sys.exit("no lyrics.txt in " + sdir)
    mp3 = sid + ".mp3"
    if os.path.exists(song_json):
        mp3 = json.load(open(song_json, encoding="utf-8")).get("mp3", mp3)
    mp3_path = os.path.join(sdir, mp3)
    if not os.path.exists(mp3_path):
        sys.exit("no audio at " + mp3_path)

    ensure_ffmpeg_on_path()
    import whisperx

    lines = parse_segments(open(lyrics_path, encoding="utf-8").read())
    full_text = " ".join(lines)
    device = "cpu"
    print(f"[whisperx] {sid}: {len(lines)} lyric lines, loading audio...")
    audio = whisperx.load_audio(mp3_path)
    duration = len(audio) / 16000.0

    print("[whisperx] local VAD pre-scan (finding the sung region)...")
    vs, ve = vocal_bounds(audio, duration)
    lo, hi = max(0.0, vs - 1.0), min(duration, ve + 1.0)
    print(f"[whisperx] sung region {vs:.1f}-{ve:.1f}s of {duration:.1f}s")

    print("[whisperx] loading alignment model (wav2vec2, English)...")
    model_a, meta = whisperx.load_align_model(language_code="en", device=device)
    print("[whisperx] forced-aligning the whole song (one pass)...")
    # one segment = the full lyrics over the sung region; align() chunks the
    # audio internally, so a long segment is fine.
    result = whisperx.align([{"text": full_text, "start": lo, "end": hi}],
                            model_a, meta, audio, device, return_char_alignments=False)
    words = [w for w in result.get("word_segments", []) if w.get("start") is not None]
    if not words:
        sys.exit("[whisperx] alignment produced no words")

    # cache for retime.js (it reads songs/<id>/.whisper.json and makes NO network call)
    cache = {
        "words": [{"word": w["word"], "start": round(float(w["start"]), 3),
                   "end": round(float(w.get("end", w["start"])), 3)} for w in words],
        "segments": [], "duration": round(duration, 3),
        "_source": "whisperx-local-ctc",
    }
    json.dump(cache, open(os.path.join(sdir, ".whisper.json"), "w", encoding="utf-8"),
              ensure_ascii=False)

    print(f"[whisperx] {len(words)} words measured over {ve - vs:.1f}s of singing")
    print("[whisperx] first measured words:")
    for w in words[:8]:
        print(f"            {float(w['start']):6.2f}s  {w['word']}")
    print(f"[whisperx] wrote {os.path.join(sdir, '.whisper.json')}")
    print("[whisperx] NEXT: node tools/retime.js " + sid + "  (uses this cache, no cloud)")

if __name__ == "__main__":
    main()
