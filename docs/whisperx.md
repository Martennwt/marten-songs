# WhisperX - lokale Forced-Alignment (perfekte Wort-Synchronisation)

Guide für die KI-Medien-Guide-Dokumente. Stand: installiert + getestet am 2026-06-27 auf Martens Rechner.

---

## 1. Was ist WhisperX und warum brauchen wir es?

Unser Karaoke-Player lässt jedes englische Wort **genau dann** aufleuchten, wenn es gesungen wird. Dafür
brauchen wir pro Wort eine **Startzeit**. Bisher kommen diese Zeiten aus **Whisper über die OpenAI-Cloud**
(`tools/retime.js`).

Das Cloud-Whisper hat zwei Schwächen:
- Seine **Wort-Zeiten sind nur ungefähr** (ein leichtes Wabern, das wir mit `LEAD 0.18s` kaschieren).
- Bei **sehr leisen Intros** (zartes A-cappella) wird Whisper **taub**: Es hört die Wörter gar nicht und
  verteilt sie einfach gleichmäßig über ein Zeitfenster. Das ist geraten, nicht gemessen. Genau deshalb
  mussten wir bei „The Word That Found Me" das Intro per Ohr mit `introStart`/`introLines` von Hand timen.

**WhisperX** löst beides. Es läuft **lokal auf dem Rechner** (kein API-Call) und macht **Forced Alignment**:
Es bekommt **unsere bekannten Lyrics** und presst sie mit einem Phonem-Modell (wav2vec2) Wort für Wort auf
die Tonspur. Es errät den Text nicht, es **misst**, wo jedes Wort tatsächlich klingt - auch im leisen Intro.

> Kurzform: Cloud-Whisper rät die Zeiten, WhisperX misst sie. Forced Alignment = „ich kenne den Text schon,
> sag mir nur, wann genau jedes Wort kommt."

**Der Gewinn:** „Song schicken -> makellose Wort-Sync" wird real, **ohne** das manuelle Intro-Gefummel.

---

## 2. Voraussetzungen (was auf dem Rechner sein muss)

| Baustein | Zweck | Status auf Martens Rechner |
|---|---|---|
| **Python 3.10-3.12** | WhisperX läuft in Python | ✓ Python 3.12.10 |
| **ffmpeg** | dekodiert die MP3 für das Modell | ✓ frisch installiert (8.1.1) |
| **uv** (oder pip) | installiert die Python-Pakete | ✓ uv 0.11.14 |
| **torch** | das KI-Rechenwerk (zieht WhisperX automatisch) | ✓ 2.8.0+cpu |
| GPU (optional) | macht es schneller | – keine NVIDIA-GPU -> CPU-Modus (läuft, nur langsamer) |

Festplatte: einmalig ca. **2-3 GB** (torch + Modelle). Internet nur **einmal** für die Installation +
den ersten Modell-Download. Danach komplett offline und kostenlos.

---

## 3. Installation (genau diese Schritte, einmalig)

### Schritt 1 - ffmpeg installieren
```powershell
winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
```
winget trägt den ffmpeg-Ordner direkt in den Benutzer-PATH ein. **Wichtig:** Erst eine **neue** Shell
(neues Terminal) sieht den PATH. Prüfen in einem neuen Fenster:
```powershell
ffmpeg -version
```
(Unser Skript hängt ffmpeg zur Sicherheit auch selbst in den PATH, falls man im selben Fenster bleibt.)

### Schritt 2 - isolierte Python-Umgebung anlegen
Eine eigene Umgebung („venv"), damit WhisperX nichts am restlichen System verstellt. Sie liegt im Projekt
unter `.venv/` und ist in `.gitignore` (wird **nicht** mit hochgeladen, ist nur lokal):
```powershell
uv venv .venv --python 3.12
```

### Schritt 3 - WhisperX installieren
```powershell
uv pip install --python .venv\Scripts\python.exe whisperx
```
Das zieht ~100 Pakete (torch, transformers, faster-whisper, ...), ca. 1-2 Minuten.

> **Stolperstein, den wir hatten:** Eine uv-Umgebung kommt **ohne `pip`**. `python -m pip install ...`
> schlägt deshalb mit „No module named pip" fehl. Lösung: einfach **uv** zum Installieren benutzen
> (`uv pip install --python .venv\Scripts\python.exe ...`) - das braucht kein pip in der Umgebung.

### Alternative ohne uv (universeller Weg, z. B. für Kunden)
```powershell
python -m venv .venv
.venv\Scripts\activate
pip install whisperx
```
Langsamer als uv, aber überall gleich. (Auf Windows zieht `pip install whisperx` automatisch die
CPU-Variante von torch - kein 2,5-GB-CUDA-Paket.)

---

## 4. Installation prüfen
```powershell
.venv\Scripts\python.exe -c "import whisperx, torch; print('whisperx ok, torch', torch.__version__, 'cuda', torch.cuda.is_available())"
```
Erwartet (CPU-Rechner): `whisperx ok, torch 2.8.0+cpu cuda False`.

---

## 5. Benutzung - unser Skript `tools/whisperx-align.py`

Voraussetzung im Songordner: `songs/<id>/lyrics.txt` (echte Lyrics, eine Zeile = eine Anzeigezeile) und die
MP3. Dann:
```powershell
.venv\Scripts\python.exe tools\whisperx-align.py <song-id>
```

Was das Skript tut:
1. Liest `lyrics.txt` und segmentiert es **genau wie der Rest der Pipeline** (eine Lyric-Zeile = ein Segment,
   dieselbe Regel wie `tools/lib/lyrics.js`).
2. Setzt grobe Start/Ende-Fenster pro Zeile als Anker. Wenn schon eine `timing.json` da ist (aus
   `retime.js`), nutzt es deren Fenster; sonst verteilt es die Zeilen grob über die Songlänge.
3. Lädt das wav2vec2-Modell (beim **ersten Mal** Download ~360 MB, danach gecacht) und richtet **jedes Wort
   gemessen** an der Tonspur aus.
4. Schreibt `songs/<id>/whisperx-aligned.json` (Segmente + Wort-Zeiten) und druckt eine Zusammenfassung,
   inklusive der **gemessenen Onsets der ersten gesungenen Zeile** (der Intro-Beweis).

---

## 6. Wie es in unsere Pipeline passt

```
lyrics.txt + mp3
      |
      v
[ grobe Struktur ]   retime.js (Cloud-Whisper)  ->  timing.json   (Segment-Fenster sitzen gut)
      |
      v
[ exakte Wort-Zeiten ]   whisperx-align.py  ->  whisperx-aligned.json   (gemessen, auch im leisen Intro)
      |
      v
[ in unser Format ]   tools/whisperx-import.js  ->  timing.json (precise:true)   <-- NÄCHSTER SCHRITT, noch offen
      |
      v
verify-song.js (Gate)  ->  build-anim.js  ->  fertiger Player
```

**Regel künftig:** Ist WhisperX installiert, nimm den lokalen Forced-Alignment-Weg; sonst fällt die Pipeline
auf Cloud-Whisper + die Intro-Regler zurück. `retime.js` bleibt der Cloud-Pfad, `whisperx-align.py` ist der
lokale Präzisions-Pfad.

**Noch offen (bewusst):** Der Adapter `tools/whisperx-import.js`, der `whisperx-aligned.json` in unsere
`timing.json` (`precise:true`, Wortzeiten `{t,s}`) umschreibt, ist noch nicht gebaut. Erst danach laufen
`verify-song.js` + `build-anim.js` unverändert auf den WhisperX-Zeiten. Das ist der nächste Baustein, bevor
wir einen Live-Song auf WhisperX-Timing umstellen (kein Live-Song wird ohne Martens Sichtung geändert).

---

## 7. Notizen / Troubleshooting
- **CPU vs GPU:** Ohne NVIDIA-GPU läuft alles auf der CPU - korrekt, nur langsamer (ein 3-Minuten-Song
  einige Minuten). Mit GPU wäre es Sekunden. Für unsere Stückzahlen ist CPU völlig ok.
- **„No module named pip"** in der Umgebung -> mit `uv pip install ...` installieren (siehe Schritt 3).
- **ffmpeg nicht gefunden** -> neues Terminal öffnen (PATH), oder das Skript regelt es selbst.
- **Erster Lauf lädt Modelle** (wav2vec2 ~360 MB). Einmalig, danach offline.
- **Keine API-Kosten:** WhisperX ist lokal und gratis. Nur Strom/Rechenzeit. (Cloud-Whisper kostete ~2 Cent
  pro Song; das sparen wir hier.)
- **Diarisation/Sprecher-Trennung** (pyannote, braucht HuggingFace-Token) brauchen wir **nicht** - wir nutzen
  nur das Alignment-Modell, das ohne Token lädt.

---

## 8. Was wir konkret installiert haben (Protokoll)
- ffmpeg 8.1.1 (Gyan-Build) via winget, bin im Benutzer-PATH.
- `.venv/` per uv (Python 3.12.10), in `.gitignore`.
- whisperx 3.8.6, torch 2.8.0+cpu (CPU-Build, ~230 MB).
- Test-Skript `tools/whisperx-align.py` gebaut und auf „The Word That Found Me" laufen lassen
  (der harte Soft-Intro-Fall). Ergebnis siehe Commit-Notiz / WORKLOG.
