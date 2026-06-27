#!/usr/bin/env python
# ============================================================================
# whisperx-align.py - local forced alignment of OUR lyrics to the audio.
#
# Cloud Whisper (retime.js) is great at SEGMENT windows but its per-word
# timestamps are approximate and it goes DEAF on very soft intros (then it just
# spreads the words evenly across a window - a guess, not a measurement).
# WhisperX runs locally and does *forced alignment*: it takes our KNOWN lyrics
# and locks each word onto the audio at phoneme level (wav2vec2). Even a quiet
# a-cappella intro gets a real onset. No introStart/introLines fiddling.
#
# What it does:
#   1. Reads songs/<id>/lyrics.txt and segments it the canonical way
#      (one lyric line = one segment - same rule as tools/lib/lyrics.js).
#   2. Seeds rough [start,end] windows per line. If songs/<id>/timing.json
#      exists it reuses those windows (cloud Whisper finds segment windows
#      well); otherwise it spreads the lines evenly across the song duration.
#   3. Runs WhisperX forced alignment -> exact per-word start/end.
#   4. Writes songs/<id>/whisperx-aligned.json (segments + flat word_segments)
#      and prints a summary (incl. the first sung words = the soft-intro proof).
#
# This is the *local, precise* path. Convert it to our timing.json with the
# JS adapter (tools/whisperx-import.js, the documented next step), then the
# normal verify-song.js + build-anim.js run unchanged.
#
# Run (from the project root, inside the venv):
#   .venv\Scripts\python.exe tools\whisperx-align.py <song-id>
# ============================================================================
import sys, os, re, json, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def ensure_ffmpeg_on_path():
    """WhisperX shells out to ffmpeg; make sure it's reachable even before a
    shell restart picks up the PATH change winget made."""
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
    """One lyric line = one segment. Drops blank lines and [section] headers,
    collapses inner whitespace. Mirrors tools/lib/lyrics.js parseSegments()."""
    out = []
    for ln in raw.replace("\r", "").split("\n"):
        t = ln.strip()
        if not t or re.match(r"^\[.*\]$", t):
            continue
        out.append(re.sub(r"\s+", " ", t))
    return out

def rough_windows(n, duration, timing_path):
    """Return n [start,end] windows to seed alignment. Prefer the cloud
    timing.json windows; fall back to an even split across the song."""
    if os.path.exists(timing_path):
        try:
            segs = json.load(open(timing_path, encoding="utf-8")).get("segments", [])
            if len(segs) == n:
                return [[float(s["start"]), float(s["end"])] for s in segs], "timing.json"
        except Exception:
            pass
    step = duration / max(n, 1)
    return [[i * step, (i + 1) * step] for i in range(n)], "even-split"

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
    print(f"[whisperx] {sid}: {len(lines)} lyric lines, loading audio...")

    device = "cpu"
    audio = whisperx.load_audio(mp3_path)
    duration = len(audio) / 16000.0
    windows, src = rough_windows(len(lines), duration, os.path.join(sdir, "timing.json"))
    print(f"[whisperx] duration {duration:.1f}s, rough windows from: {src}")

    segments = [{"text": t, "start": w[0], "end": w[1]} for t, w in zip(lines, windows)]

    print("[whisperx] loading alignment model (wav2vec2, English)...")
    model_a, meta = whisperx.load_align_model(language_code="en", device=device)
    print("[whisperx] forced-aligning...")
    result = whisperx.align(segments, model_a, meta, audio, device,
                            return_char_alignments=False)

    out_segs = []
    for i, seg in enumerate(result["segments"]):
        words = [{"t": w["word"], "s": round(w["start"], 2), "e": round(w["end"], 2)}
                 for w in seg.get("words", []) if "start" in w]
        out_segs.append({"seg": i, "text": lines[i],
                         "start": round(seg.get("start", 0.0), 2),
                         "end": round(seg.get("end", 0.0), 2), "w": words})

    out = {"engine": "whisperx", "precise": True, "duration": round(duration, 2),
           "segments": out_segs}
    out_path = os.path.join(sdir, "whisperx-aligned.json")
    json.dump(out, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    total = sum(len(s["w"]) for s in out_segs)
    aligned_segs = sum(1 for s in out_segs if s["w"])
    print(f"[whisperx] wrote {out_path}")
    print(f"[whisperx] {total} words aligned across {aligned_segs}/{len(out_segs)} lines")
    if out_segs and out_segs[0]["w"]:
        first = out_segs[0]["w"][:8]
        print("[whisperx] first sung line, MEASURED onsets:")
        for w in first:
            print(f"            {w['s']:6.2f}s  {w['t']}")

if __name__ == "__main__":
    main()
