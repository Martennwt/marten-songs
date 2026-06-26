# Worklog — Marten's Songs

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
