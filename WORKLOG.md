# Worklog — Marten's Songs

---

## 2026-06-26 (3): Bilder, Version 2, Hub mit Bildern, Intro-Fenster, Bugfixes

**Erledigt:**
- **Bugfixes (live):** Lautstärke-Popover + Sprachmenü waren dauerhaft offen (display:flex schlug
  `hidden`) -> `.pop[hidden]{display:none}`. PDF lief rechts raus (Umbruch mit falscher Schriftgröße
  berechnet) -> Schriftgröße VOR `splitTextToSize`; headless verifiziert (maxLineW 481 <= 483).
- **Button-Copy** oben rechts: „Die Idee hinter dem Lied" / „La idea detrás".
- **5 Hintergrundbilder** pro Abschnitt mit **Gemini 3 Pro Image** (ölgemäldeartig, Navy/Gold, kein Text)
  in `songs/the-sower/img/`. Generator: `tools/images/generate-image.js` (zentral), Batch `img/jobs.json`.
- **Version 2** (`songs/<id>/v2.html`): Übersetzung **pro Satz** in dezentem Grau + die Bilder als leicht
  transparenter, langsam driftender Hintergrund, der **pro Abschnitt überblendet** (`imageMap` in song.json).
  Version 1 bleibt clean (Doppelzeile). Builder: `buildSong(id,{fine,images,variant,out})`.
- **Hub-Kacheln** mit **Bild-Banner** oben, Gold-Hover-Glow, und zwei Buttons (Version 1 / Version 2).
- **Intro-Fenster** mit dem Song-Bild leicht dahinter, Gold-Verlauf und **X oben links** zurück zum Hub.
- **Mockup** des Intro-Fensters (deutlicher Bild-Hintergrund, Hover-Gold am Play) liegt im Scratchpad
  (`intro-mockup.html`) als Design-Vergleich.
- Alles gepusht -> live auf https://martennwt.github.io/marten-songs/.

**Offen / als Nächstes:**
1. **Intro-Flow** final entscheiden: aktuell ein Play-Druck (Autoplay braucht eine Nutzer-Geste). Optional:
   Karte 1-2s zeigen, Gold-Shimmer, dann starten.
2. Evtl. den deutlicheren Intro-Look aus dem Mockup in die echte Seite übernehmen.
3. Zwei weitere Songs.
4. Bild-Hintergrund-Intensität pro Geschmack feinjustieren.

---

## 2026-06-26 (2): Player-Ausbau + LIVE auf GitHub Pages

**Erledigt:**
- **Lautstärke** als Lautsprecher-Button mit aufklappbarem **vertikalem Regler** (Popover, schließt
  beim Rausklicken).
- **Sprache** als kleines **Menü** (Español / Deutsch) statt Umschalter; steuert Zeilen-Übersetzung,
  Info-Panel und Songtext-Ansicht gemeinsam.
- **Ganzer Songtext** als Player-Button („Letra/Text") -> Modal mit allen Zeilen (EN + Übersetzung),
  plus **PDF-Download** (jsPDF via CDN: Titel, dann je Zeile Englisch größer + Übersetzung darunter).
- Prominenter Button oben rechts „Was steckt dahinter?" (ES/DE), Info-Panel mit Intro + Bibelstellen
  + Erklärung pro Strophe und eigenem Sprach-Schalter.
- Wort-Schimmer ohne Flackern (gesungen/aktuell gleicher Render-Weg), SVG-Flaggen, Übersetzung etwas
  transparenter.
- **LIVE gestellt:** öffentliches Repo **github.com/Martennwt/marten-songs**, GitHub Pages aktiv:
  **https://martennwt.github.io/marten-songs/** (Quelle main/root). Updates künftig: commit + `git push`.
- Ordnername hat Leerzeichen + Apostroph -> beim Öffnen via Chrome IMMER URL-kodieren (`%20`,`%27`),
  sonst „Datei nicht gefunden". (Repo/Build betroffen nicht, da pfad-relativ.)

**Offen / als Nächstes:**
1. **Hintergrund-Bilder pro Abschnitt** (4-5/Song): Modell vorauss. Gemini 3 Pro Image; erst 1 Test-
   Bild für Stil, dann Rest; leicht transparent hinter dem Text mit langsamem Drift.
2. **Übersetzungs-v2** (pro Satz statt pro Doppelzeile) als zweite Variante zum Vergleich.
3. **Zwei weitere Songs** von Marten.
4. Button-Copy oben rechts evtl. final wählen (Vorschläge gegeben).

---

## 2026-06-26: Projekt aufgesetzt, "The Sower" reingeholt, Pipeline gebaut

**Erledigt:**
- **Neues Projekt** `Documents/Claude/Marten's Songs/` angelegt (eigenständig, getrennt
  vom Guillermo-Guide). Zweck: KI-Songs über Glaube, Liebe, Leben, Gott als zweisprachige
  Karaoke-Lyric-Animationen (EN leuchtet wortweise auf, ES klein darunter), plus Hub-Seite.
- **"The Sower" reingezogen** (vorher in `Downloads/The-Sower-Animation`): liegt jetzt in
  `songs/the-sower/` (mp3 + timing.json + song.json + gebautes index.html).
- **Transkription** (in der vorherigen Session erarbeitet, jetzt als wiederverwendbares Tool):
  2-Stufen-Pipeline. `gpt-4o-transcribe` liefert den sauberen Text (whisper-1 allein hatte bei
  dem gesungenen Song halluziniert), dann `whisper-1` mit diesem Text als Prompt -> Wort-
  Zeitstempel (290 Wörter, 13 Zeilen, exakt). Steckt jetzt in `tools/transcribe.js`.
- **Builder** `tools/build-anim.js`: baut pro Song aus `song.json` (ES-Übersetzung + Meta) und
  `timing.json` die Animation, und regeneriert die Hub-Seite. `node tools/build-anim.js <id>`
  bzw. `--all`.
- **Hub-Seite** `index.html`: listet alle Songs als Karten (dunkles, edles Design, Goldakzent,
  schwebende Lichtpunkte), Link zu jedem Song.
- **Spanische Übersetzung** für The Sower (Reina-Valera-Stil) in `song.json` hinterlegt.
- **README.md** mit Anleitung "neuen Song hinzufügen".
- git initialisiert, erster Commit.

**Offen / als Nächstes:**
1. **Zwei weitere Songs** von Marten kommen noch -> je: mp3 ablegen, `transcribe.js`, `song.json`
   (mit ES) schreiben, `build-anim.js` laufen lassen.
2. **Animation + Player anpassen** nach Martens Wünschen (Design/Verhalten noch offen, kommt).
3. **Online stellen via GitHub** (Pages), damit ein Link teilbar ist. Repo-Name vorauss.
   `marten-songs`. Statische Seite, Root `index.html`, also direkt aus `main` servierbar.
4. Feinschliff Wort-Timing bei Bedarf (einzelne Wörter minimal früh/spät, da Gesang).

**Quelle/Keys:** OpenAI-Key aus `Documents/Claude/API keys/OpenAI.txt` (nur Transkription
braucht Netz; Build ist offline). Original-mp3s liegen bei Marten in Downloads.
