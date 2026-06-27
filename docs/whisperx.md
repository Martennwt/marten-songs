# WhisperX - dein lokaler Untertitel- und Wort-Timer (Anfänger-Guide)

Teil der **KI-Medien-Guide-Dokumente**. Hier steht alles über WhisperX so einfach wie möglich, damit du
jederzeit nachschlagen kannst. Installiert + getestet am **2026-06-27** auf Martens Rechner.

> **In einem Satz:** WhisperX ist ein kostenloses Programm auf deinem Computer, das aus einer Tonspur
> heraushört, **welches Wort wann** gesprochen oder gesungen wird - perfekt für Karaoke-Timing und Untertitel.

---

## 1. Was ist WhisperX überhaupt? (ganz einfach)

Stell dir einen sehr guten Tipp-Assistenten vor, der sich ein Lied oder Video anhört und dir sagt:
„Das Wort *There* kommt bei Sekunde 15,57, *was* bei 15,81, *nothing* bei 16,01 ..." - **jedes Wort mit
genauer Uhrzeit.**

- „**Whisper**" ist das KI-Modell von OpenAI, das Sprache in Text umwandelt (Transkription).
- „**WhisperX**" ist eine verbesserte, **kostenlose Open-Source-Version**, die zusätzlich **Forced Alignment**
  kann: Sie bekommt einen **bereits bekannten Text** (z. B. unsere Lyrics) und klebt **jedes Wort exakt** auf
  die passende Stelle in der Tonspur. Sie rät den Text nicht, sie **misst** die Zeiten.

Das Wichtige: WhisperX läuft **lokal auf deinem Computer**, nicht in der Cloud. Du brauchst kein Internet
(außer einmal beim Installieren) und zahlst nichts pro Nutzung.

---

## 2. Warum haben wir das gemacht? (und warum ist es wichtig)

Unser Karaoke-Player lässt jedes Wort genau dann aufleuchten, wenn es gesungen wird. Dafür braucht er pro
Wort eine **Startzeit**. Bisher kamen diese Zeiten von **Whisper über die OpenAI-Cloud** (`tools/retime.js`).

Das Cloud-Whisper hat zwei Schwächen:
1. Seine Wort-Zeiten sind **nur ungefähr** (ein leichtes Wabern).
2. Bei **sehr leisen Intros** (zartes A-cappella) wird es **taub**: Es hört die Wörter gar nicht und verteilt
   sie einfach gleichmäßig über ein Zeitfenster. Das ist **geraten**, nicht gemessen. Genau deshalb mussten
   wir bei „The Word That Found Me" den Intro per Ohr von Hand timen (`introStart`/`introLines`).

**WhisperX löst beides.** Echter Beweis aus unserem Test mit „The Word That Found Me":
- Erste Zeile „There was nothing in my hands ...": WhisperX **misst** „There" bei **15,57s**.
- Cloud-Whisper hatte denselben Anfang bei **2,16s geraten** (über 2-25s gleichmäßig verteilt = komplett daneben).
- WhisperX trifft automatisch genau das Fenster, das wir früher mühsam per Ohr einstellen mussten.

**Warum wichtig:** Das ist der Schritt von „Song schicken -> meistens gut, manchmal Handarbeit" zu
„**Song schicken -> makellose Wort-Sync, ohne Gefummel**". Und es ist gratis und privat.

---

## 3. Was ist ffmpeg? (das haben wir mitinstalliert)

**ffmpeg** ist das Schweizer Taschenmesser für Audio und Video. Es kann praktisch **jedes** Audio-/Video-Format
öffnen, umwandeln und auslesen (mp3, wav, mp4, m4a ...). WhisperX kann selbst keine MP3 lesen - es **benutzt
ffmpeg im Hintergrund**, um die Tonspur in Zahlen zu verwandeln, die die KI versteht.

Du musst ffmpeg nie direkt bedienen. Es muss nur installiert und „auffindbar" sein (im sogenannten **PATH**,
das ist die Liste der Orte, an denen Windows nach Programmen sucht). Bei uns ist das erledigt.

---

## 4. Was kann ich mit WhisperX alles machen?

WhisperX kann drei Dinge:

1. **Transkribieren** - aus Audio/Video Text machen (wie OpenAI Whisper, aber lokal + gratis).
   Funktioniert für **jede** Audio- oder Videodatei: Songs, Podcasts, Sprachnotizen, Interviews,
   heruntergeladene YouTube-Videos, deine Spanisch-Lernvideos usw. Über 90 Sprachen.
2. **Forced Alignment** - bekannten Text Wort für Wort exakt auf die Tonspur legen (unser Karaoke-Timing).
3. **Untertitel erzeugen** - es kann direkt **.srt** / **.vtt**-Untertiteldateien ausgeben (z. B. für YouTube).
   *(Optional auch Sprecher-Trennung „wer spricht wann" - brauchen wir nicht, lassen wir aus.)*

**YouTube-Videos transkribieren?** Ja - in zwei Schritten: erst die **Tonspur herunterladen** (mit dem
Zusatz-Tool `yt-dlp`), dann diese Datei durch WhisperX schicken. WhisperX selbst lädt nichts von YouTube;
es braucht eine fertige Audio-/Videodatei. (yt-dlp können wir bei Bedarf genauso installieren.)

**Ganze Audio-Files?** Ja, jede Länge - ein 60-Minuten-Podcast genauso wie ein 3-Minuten-Song. Auf der CPU
dauert Langes entsprechend länger, aber es funktioniert.

---

## 5. Welche Vorteile hat WhisperX gegenüber OpenAI-Whisper (Cloud)?

| | **WhisperX (lokal)** | **OpenAI Whisper (Cloud)** |
|---|---|---|
| **Kosten** | kostenlos (nur Strom) | ~2 Cent pro 3-Min-Song, zahlbar pro Minute |
| **Datenschutz** | Audio bleibt auf deinem PC | Audio wird zu OpenAI hochgeladen |
| **Internet** | nur einmal zum Installieren | bei jeder Nutzung |
| **Limit** | keins | API-Limits / Kontingente |
| **Wort-Genauigkeit** | **Forced Alignment = exakt**, auch bei leisen Stellen | nur ungefähr, taub bei leisem Intro |
| **Aufwand** | einmal installieren (~2,4 GB, siehe unten) | nichts installieren, sofort startklar |
| **Tempo** | auf CPU langsamer (Minuten) | schnell (Server-GPUs) |

Kurz: **WhisperX ist gratis, privat und genauer** - der Preis ist die einmalige Installation und etwas mehr
Rechenzeit ohne Grafikkarte.

**Brauchen wir OpenAI-Whisper jetzt noch?** Im Prinzip kann WhisperX alles, was wir brauchen, auch alleine -
inklusive Transkription. **Aktuell** nutzt unsere Pipeline die Cloud noch für die grobe Struktur (welche Zeile
ungefähr wann), und WhisperX macht die feinen Wort-Zeiten. Sobald der kleine Adapter gebaut ist (siehe
Abschnitt 9), können wir **komplett lokal** arbeiten und die Cloud ganz weglassen.

---

## 6. Wie groß ist das, und was liegt wo? (wichtig zu verstehen)

Es gibt **zwei Dinge**, die man nicht verwechseln darf:

1. **Das Programm WhisperX** - liegt **lokal auf deinem Computer** im Ordner `.venv/` (ca. **2,0 GB**, das
   meiste davon ist „torch", das Rechenwerk der KI). Dazu ein heruntergeladenes **Modell** (~**361 MB**) im
   versteckten Ordner `C:\Users\marte\.cache\torch`. Zusammen rund **2,4 GB**. Das wird **NICHT** zu GitHub
   hochgeladen (steht in `.gitignore`).
2. **Unsere Hilfsdateien** - das kleine Skript `tools/whisperx-align.py` und dieser Guide `docs/whisperx.md`.
   Das sind **Textdateien von wenigen Kilobyte**. **Die** laden wir zu GitHub hoch.

> Deshalb: Wenn wir „WhisperX committen", laden wir **nicht** das 2,4-GB-Programm hoch, sondern nur unsere
> winzigen Text-Anleitungen, die **beschreiben, wie man es benutzt**. Das Programm bleibt auf deinem PC.

---

## 7. „Commit" und „Push" - was ist der Unterschied?

- **Commit** = einen Zwischenstand **lokal speichern** (wie „Speichern unter" mit Notiz). Bleibt auf deinem PC.
- **Push** = die gespeicherten Stände **zu GitHub hochladen** (online sichern + bei uns: live schalten).

Bei uns gilt: Was nach GitHub **gepusht** wird, schaltet GitHub Pages **live** auf die Webseite. Deshalb
pushen wir nur, was fertig ist. (Die Kurs-Seite z. B. ist noch nicht fertig -> committet/gesichert, aber
**nicht** gepusht.)

**Ist GitHub sicher? Kann da jemand einen Virus hochladen?**
- GitHub ist ein **Speicher für Text-/Code-Dateien**, kein Programm, das etwas „ausführt". Hochgeladene
  Dateien laufen nicht von alleine. Ein Besucher unserer Seite lädt nur fertige HTML-Seiten - harmlos.
- In **unser** Repo kann nur hochladen, wer Schreibrechte hat (du). Fremde können nichts hineinschmuggeln.
- WhisperX selbst kam **nicht** von einem zufälligen GitHub-Account, sondern aus **PyPI**, dem offiziellen
  Paket-Verzeichnis für Python - millionenfach genutzte, offene Software. Das ist der normale, sichere Weg.

---

## 8. Kann ich WhisperX überall nutzen, in jedem Projekt? Nur im Terminal?

- **Bedienung:** WhisperX hat **keine Fenster-Oberfläche** - du startest es per **Befehl im Terminal**
  (oder über ein kleines Skript wie unseres). Das ist aber nur **ein** Befehl, kein Programmieren.
- **Wo es gilt:** Aktuell ist WhisperX in der **Projekt-Umgebung** dieses Songs-Ordners installiert
  (`.venv/`). In einem **anderen** Projekt (z. B. Spanisch-Lernen) ist es so noch nicht automatisch da.
- **Überall verfügbar machen (empfohlen, wenn du es oft brauchst):** ein einziger Befehl macht den
  `whisperx`-Aufruf **systemweit** in jedem Terminal nutzbar:
  ```powershell
  uv tool install whisperx
  ```
  Danach kannst du in **jedem** Ordner z. B. tippen:
  ```powershell
  whisperx "mein-video.mp4" --model large-v2 --language de --output_format srt
  ```
  Die heruntergeladenen Modelle werden **geteilt** (kein erneuter großer Download). Kostet einmalig nochmal
  etwas Speicher für eine eigene Umgebung. **Sag Bescheid, dann richte ich das ein.**

---

## 9. Wie passt WhisperX in unsere Song-Pipeline?

```
lyrics.txt + mp3
      |
      v
[ Voice-Vorscan + Messen ]   tools/whisperx-align.py  ->  whisperx-aligned.json
        (findet ZUERST lokal, wo der Gesang anfängt/aufhört, dann misst es jedes Wort)
      |
      v
[ in unser Format ]   tools/whisperx-import.js  ->  timing.json (precise:true)
      |
      v
verify-song.js (Prüfung)  ->  build-anim.js  ->  fertiger Player
```

**Komplett lokal, kein Cloud-Schritt mehr.** Beide Bausteine sind gebaut und erprobt (The Sower Remastered +
The Word That Found Me V2). Der **Voice-Vorscan** in `whisperx-align.py` ist der Fix gegen das Intro-Problem:
ohne ihn klebt WhisperX die ersten Wörter auf ein Instrumental-Intro (Gold leuchtet zu früh). Mit ihm wird
der echte Gesang-Start automatisch erkannt, pro Song. `retime.js` (OpenAI-Cloud) bleibt nur ruhender Fallback.

---

## 10. So benutzt du unser Skript (Schritt für Schritt)

Voraussetzung im Songordner: `songs/<id>/lyrics.txt` (echte Lyrics, eine Zeile = eine Anzeigezeile) + die MP3.
```powershell
.venv\Scripts\python.exe tools\whisperx-align.py <song-id>
```
Beispiel: `.venv\Scripts\python.exe tools\whisperx-align.py the-word-that-found-me`

Was passiert:
1. Liest `lyrics.txt` und teilt es in Zeilen (genau wie der Rest der Pipeline, `tools/lib/lyrics.js`).
2. Nimmt grobe Start/Ende-Zeiten aus `timing.json` als Anker (falls vorhanden).
3. Lädt beim **ersten Mal** das Modell (~361 MB, danach gecacht) und richtet **jedes Wort gemessen** aus.
4. Schreibt `songs/<id>/whisperx-aligned.json` und druckt die gemessenen Intro-Zeiten als Beweis.

---

## 11. Häufige Fragen / Stolpersteine (FAQ)

- **„No module named pip"** beim Installieren -> eine uv-Umgebung hat **kein pip**. Mit
  `uv pip install --python .venv\Scripts\python.exe <paket>` installieren (nicht `python -m pip`).
- **„ffmpeg not found"** -> ein **neues** Terminal öffnen (damit der PATH frisch geladen ist); unser Skript
  hängt ffmpeg zur Sicherheit selbst dazu.
- **Erster Lauf lädt ein Modell** (~361 MB). Das ist einmalig, danach offline und sofort.
- **Es ist langsam** -> ohne NVIDIA-Grafikkarte rechnet alles auf der CPU (korrekt, nur langsamer). Mit GPU
  wäre es Sekunden. Für unsere Stückzahlen völlig ok.
- **Kostet das was?** Nein. Lokal = gratis. Nur die einmalige Installation braucht Internet + Speicherplatz.
- **Brauche ich Internet zum Benutzen?** Nein (nach der einmaligen Installation + Modell-Download).
- **Ändert WhisperX meine Originaldateien?** Nein. Es liest die MP3 nur und schreibt eine neue JSON-Datei.

---

## 12. Protokoll - was genau installiert wurde (für dein Video / Nachschauen)
- **ffmpeg 8.1.1** (Gyan-Build) via `winget`, bin-Ordner im Benutzer-PATH.
- **Isolierte Umgebung `.venv/`** per `uv` (Python 3.12.10), in `.gitignore` (nur lokal, ~2,0 GB).
- **WhisperX 3.8.6** + **torch 2.8.0+cpu** (CPU-Build) installiert; Import verifiziert
  (`whisperx ok, torch 2.8.0+cpu cuda False`).
- **Modell-Cache** `~/.cache/torch` ~361 MB (wav2vec2, englisches Alignment-Modell).
- **Skript** `tools/whisperx-align.py` gebaut, auf „The Word That Found Me" getestet:
  434 Wörter, 40/40 Zeilen, 0 Fehler, Intro gemessen (There @ 15,57s).
- Der genaue Ablauf dieser Installation als Schritt-für-Schritt-Mitschrift: siehe
  `docs/sessions/2026-06-27-whisperx-install.md`.
