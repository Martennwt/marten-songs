# Mitschrift: WhisperX-Installation - 2026-06-27

Schritt-für-Schritt-Protokoll dieser Session, damit du den Ablauf später für ein Video oder zum Nachschauen
wieder genau so vor dir hast. Reihenfolge = wie es wirklich passiert ist. Befehle und echte Ausgaben sind
mitgeschrieben. (Eine einfache Erklärung, *was* WhisperX ist und kann, steht in `docs/whisperx.md`.)

---

## 0. Martens Auftrag
> „Lass uns erst mal WhisperX installieren. Schreib mir genau auf, was das ist, wie das installiert wird, wie
> man das macht ... das ist wichtig für die KI-Medien-Guide-Dokumente. Und dann committe alles, damit wir
> alles online haben."

Ziel: WhisperX (lokale Forced-Alignment) einrichten = perfekte Wort-Synchronisation ohne das manuelle
Intro-Timing, alles dokumentieren, dann sichern.

---

## 1. System geprüft (was ist schon da?)
```
python --version   -> Python 3.12.10        ✓
pip --version      -> pip 25.0.1             ✓
uv --version       -> uv 0.11.14             ✓ (schneller Installer)
ffmpeg -version    -> command not found      ✗ (muss installiert werden)
nvidia-smi         -> not found              -> keine NVIDIA-GPU = CPU-Modus
```
Ergebnis: Python + uv da, **ffmpeg fehlt**, keine Grafikkarte (also CPU, läuft, nur langsamer).

## 2. ffmpeg installiert
```powershell
winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
```
-> `Found FFmpeg [Gyan.FFmpeg] Version 8.1.1 ... Successfully verified installer hash`. winget hat den
ffmpeg-Ordner direkt in den Benutzer-PATH eingetragen (neue Shell erkennt ihn automatisch).

## 3. Isolierte Umgebung angelegt (.venv)
Eine eigene „Box" nur für WhisperX, damit nichts am restlichen System verstellt wird:
```powershell
uv venv .venv --python 3.12
```
-> `Using CPython 3.12.10 ... Creating virtual environment at: .venv`.
Dazu `.gitignore` erweitert um `.venv/`, `__pycache__/`, `*.whisper.json` (das Programm bleibt lokal, kommt
nicht zu GitHub).

## 4. Stolperstein + Fix
Erster Versuch `python -m pip install -U pip` schlug fehl:
```
No module named pip
```
**Grund:** uv-Umgebungen kommen ohne pip - uv installiert direkt hinein. **Fix:** einfach uv nehmen.

## 5. WhisperX installiert
```powershell
uv pip install --python .venv\Scripts\python.exe whisperx
```
-> `Resolved 101 packages ... Downloading torch (230.1MiB) ... Prepared 100 packages`. (torch kam als
**CPU-Build**, kein riesiges CUDA-Paket - richtig für diesen Rechner.)

## 6. ffmpeg in den PATH gesichert
winget hatte den bin-Ordner bereits in den Benutzer-PATH gelegt; im laufenden Fenster zur Sicherheit ergänzt.
Prüfung:
```
ffmpeg version 8.1.1-full_build-www.gyan.dev ...
```

## 7. Installation verifiziert
```powershell
.venv\Scripts\python.exe -c "import whisperx, torch; print('whisperx', ..., 'torch', torch.__version__, 'cuda', torch.cuda.is_available())"
```
->
```
whisperx 3.8.6
torch 2.8.0+cpu
cuda False
```
Heißt: WhisperX läuft, torch im CPU-Modus. ✓

## 8. Test-Skript gebaut
`tools/whisperx-align.py`: liest unsere `lyrics.txt`, nimmt grobe Zeitfenster aus `timing.json` als Anker,
richtet mit WhisperX **jedes Wort gemessen** auf der Tonspur aus, schreibt `whisperx-aligned.json`.

## 9. Beweislauf auf „The Word That Found Me" (der harte Soft-Intro-Fall)
```powershell
.venv\Scripts\python.exe tools\whisperx-align.py the-word-that-found-me
```
Ausgabe (gekürzt):
```
[whisperx] the-word-that-found-me: 40 lyric lines, loading audio...
[whisperx] duration 243.8s, rough windows from: timing.json
[whisperx] loading alignment model (wav2vec2, English)...
Downloading: wav2vec2 ... 360M  [100%]
[whisperx] forced-aligning...
[whisperx] 434 words aligned across 40/40 lines
[whisperx] first sung line, MEASURED onsets:
             15.57s  There
             15.81s  was
             16.01s  nothing
             17.59s  hands
```
Sanity-Check: **0 Monotonie-Verletzungen, 0 Werte außerhalb des Bereichs**, sauber bis 241,94s.

**Der Beweis:** Cloud-Whisper hatte „There" bei **2,16s geraten** (über 2-25s verteilt). WhisperX **misst**
es bei **15,57s** - genau dort, wo es wirklich gesungen wird, und genau das Fenster, das wir vorher per Ohr
als `introLines [[16,21],...]` einstellen mussten. Die manuelle Intro-Kalibrierung entfällt.

## 10. Größe der Installation
- `.venv/` (das Programm + torch): **2,0 GB** - lokal, nicht im Repo.
- Modell-Cache `~/.cache/torch`: **361 MB** - einmalig geladen, wird geteilt.
- Zusammen rund **2,4 GB**.

## 11. Dokumentiert + gesichert
- Guide `docs/whisperx.md` (was/warum/wie, FAQ) - anfängerfreundlich.
- Diese Mitschrift `docs/sessions/2026-06-27-whisperx-install.md`.
- WORKLOG-Eintrag ergänzt.
- **Commit** (lokal gespeichert) der WhisperX-Dateien + Doku/Infra; **Push** nach GitHub von allem **außer**
  der Kurs-Seite (die ist noch nicht fertig und bleibt vorerst nur lokal gesichert).

## 12. Offen / als Nächstes
1. Adapter `tools/whisperx-import.js` bauen: `whisperx-aligned.json` -> unsere `timing.json`.
2. Danach einen Live-Song auf WhisperX-Timing umstellen - nach Martens Sichtung.
3. Optional: WhisperX systemweit verfügbar machen (`uv tool install whisperx`), um es in jedem Projekt zu
   nutzen (z. B. Spanisch-Lernvideos transkribieren).
