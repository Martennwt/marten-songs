#!/usr/bin/env python
# ============================================================================
# whisperx-words.py - local ASR pass that writes the .whisper.json clock for
# retime.js, WITHOUT forcing. Unlike whisperx-align.py (CTC forced alignment,
# best for clear/soft vocals), this transcribes the song and keeps the word
# times WHERE THE WORDS ARE ACTUALLY HEARD. That means humming, "oh-oh-oh" and
# long held notes (which are NOT in the lyrics) become GAPS instead of getting
# words crammed onto them - the held word stays lit and the next line waits.
#
# Pipeline:  whisperx-words.py <id> [model]  ->  node tools/retime.js <id>
#   retime then aligns OUR lyrics (Needleman-Wunsch) onto these heard words,
#   interpolates the gaps, forces monotonic.
#
# Use this for HUM-HEAVY / held-note songs; use whisperx-align.py (CTC) for
# very soft a-cappella intros. Default model 'medium' (good on sung repeats).
#
# Run:  .venv\Scripts\python.exe tools\whisperx-words.py <song-id> [medium|large-v3]
# ============================================================================
import sys, os, re, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def parse_segments(raw):
    out = []
    for ln in raw.replace("\r", "").split("\n"):
        t = ln.strip()
        if not t or re.match(r"^\[.*\]$", t):
            continue
        out.append(re.sub(r"\s+", " ", t))
    return out

def main():
    if len(sys.argv) < 2:
        sys.exit("usage: python tools/whisperx-words.py <song-id> [model]")
    sid = sys.argv[1]
    model_size = sys.argv[2] if len(sys.argv) > 2 else "medium"
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

    lyrics = " ".join(parse_segments(open(lyrics_path, encoding="utf-8").read()))
    from faster_whisper import WhisperModel
    print(f"[whisperx-words] {sid}: ASR with '{model_size}' (word timestamps, guided by lyrics)...")
    m = WhisperModel(model_size, device="cpu", compute_type="int8")
    segs, info = m.transcribe(mp3_path, language="en", word_timestamps=True,
                              vad_filter=True, initial_prompt=lyrics[:700])
    words, segments = [], []
    for s in segs:
        segments.append({"start": round(float(s.start), 3), "end": round(float(s.end), 3), "text": s.text})
        for w in (s.words or []):
            words.append({"word": w.word, "start": round(float(w.start), 3), "end": round(float(w.end), 3)})
    duration = round(float(info.duration), 3)
    cache = {"words": words, "segments": segments, "duration": duration,
             "_source": "faster-whisper-" + model_size}
    json.dump(cache, open(os.path.join(sdir, ".whisper.json"), "w", encoding="utf-8"), ensure_ascii=False)
    print(f"[whisperx-words] heard {len(words)} words across {len(segments)} segments, {duration:.1f}s")
    if words:
        print("[whisperx-words] first/last heard words: " +
              f"{words[0]['start']:.1f}s {words[0]['word']!r} ... {words[-1]['start']:.1f}s {words[-1]['word']!r}")
    print(f"[whisperx-words] wrote {os.path.join(sdir, '.whisper.json')}")
    print("[whisperx-words] NEXT: node tools/retime.js " + sid)

if __name__ == "__main__":
    main()
