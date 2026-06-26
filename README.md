# Marten's Songs

KI-erstellte Songs ueber Glaube, Liebe, Leben und Gott, gezeigt als **zweisprachige Karaoke-Lyric-
Animationen**: die englischen Lyrics leuchten Wort fuer Wort im Takt auf, die Uebersetzung steht darunter,
gemalte Hintergruende driften dahinter, plus ein Panel "die Idee hinter dem Lied".
Live: https://martennwt.github.io/marten-songs/ . Kein Em-Dash.

> **Diese Datei ist der Einstieg fuer Menschen.** Fuer Claude ist es `CLAUDE.md` (wird automatisch geladen).
> Wie wir bauen (Spezifikation) steht in `BRANDING.md`. Entwicklungs-Tagebuch: `WORKLOG.md` (intern).

---

## Die Landkarte: es ist nur DREIERLEI

Wenn du die drei auseinanderhaeltst, ist nichts mehr chaotisch:

1. **DIE ENGINE (die Song-Seite, LIVE).** Baut und zeigt die Songs. Nicht umbenennen, haengt am Build +
   an der Live-Seite. -> `index.html`, `songs/`, `tools/`, `assets/`
2. **DER YOUTUBE-KANAL.** Marke + Reichweite + Veroeffentlichen. -> `youtube/` (Index: `youtube/README.md`)
3. **DER KURS / DAS PRODUKT (geparkt).** Was du spaeter verkaufst. -> `course/` (Funnel-Seite) +
   `youtube/sower-system/` (der Skill-Bauplan)

```
Marten's Songs/
├── index.html      ENGINE  Hub-Menue (LIVE, gebaut von tools/build-anim.js)
├── songs/          ENGINE  jeder Song (mp3, song.json, timing.json, gebautes index.html)
├── tools/          ENGINE  die Maschine (retime, verify-song, build-anim, generate-image)
├── assets/         ENGINE  geteilte Dateien
├── youtube/        KANAL   brand.md, publish-playbook.md, description-template.md, reichweite/, sower-system/ ...
├── course/         KURS    die Verkaufsseite (Funnel)
├── archive/        Altes/Unbenutztes, das wir nicht loeschen, aber wegraeumen
├── README.md       <- DIESE Datei (Mensch-Einstieg + Landkarte)
├── CLAUDE.md       Einstieg fuer Claude (verweist auf README + BRANDING + WORKLOG)
├── BRANDING.md     WIE wir bauen: Look, Player, Pipeline, Bild-Prompts, alle Lektionen
└── WORKLOG.md      Tagebuch (intern, NICHT im verkauften Kunden-Paket)
```

---

## Das Ziel (die Vision, hier festgehalten)

Am Ende sollen daraus **zwei getrennte, verkaufbare Skills** werden. Es sind zwei verschiedene Dinge:

1. **Song-Website-Skill** - "bau dir deinen eigenen zweisprachigen Karaoke-Song-Player / deine eigene
   Webseite mit Songs". Das ist die ENGINE (`index.html`, `songs/`, `tools/`) + der Skill `/neuer-song`
   + `BRANDING.md`. **Den bauen wir zuerst, damit Marten ihn selbst ausprobieren kann** (Songs Stueck fuer
   Stueck auf die eigene Seite bringen).
2. **YouTube-Kanal-Skill** - "bau dir einen Faith-YouTube-Kanal" (Marke, Reichweite/SEO, Thumbnails,
   pro Song veroeffentlichen). Das ist der `youtube/`-Ordner + `/top-thumbnail`.

So soll es fuer Kunden laufen: der Kaeufer bekommt einen **Ordner (oder eine ZIP)**, legt ihn in sein
Claude-Projekt, und im **Chat geht er Schritt fuer Schritt von A bis Z durch**, waehrend Claude ihn fuehrt
und alles fuer ihn macht. Der Bauplan dafuer liegt in `youtube/sower-system/blueprint.md` (GEPARKT).
`WORKLOG.md` ist internes Tagebuch und kommt **nicht** ins Kunden-Paket.

**Fokus jetzt:** Skill 1 (die eigene Songseite) scharf machen und mit echten Songs testen.

---

## Live vs. nur lokal

- **LIVE** (martennwt.github.io/marten-songs): `index.html`, `songs/`, `tools/`.
- **NUR LOKAL** (noch nicht committet): `course/`, `youtube/`. Hier koennen wir frei umsortieren.

## Wo ist der fertige Song-Ablauf?

Der Weg von "MP3 + Text" zu "fertiger Song mit Effekten, Play, Uebersetzung, Erklaerung":
- **BRANDING.md** = die Spezifikation (Look, Player, Pipeline, alle Regeln).
- **Skill `/neuer-song`** (`~/.claude/commands/neuer-song.md`) = der gefuehrte Ablauf Schritt fuer Schritt.
- **tools/** = die Skripte, die es ausfuehren (retime -> verify -> build-anim).

---

## Neuen Song hinzufuegen (die Pipeline)

**Immer MP3 + die echten Lyrics zusammen.** Auto-Transkription von Gesang verschluckt/verdreht Zeilen,
darum sind die Lyrics die Wahrheit und Whisper nur die Uhr. (Voller Look/Feel: `BRANDING.md`.)

1. Audio nach `songs/<id>/<id>.mp3`, echte Lyrics nach `songs/<id>/lyrics.txt` (Strophen durch Leerzeilen
   getrennt; `[Verse]/[Chorus]`-Header werden ignoriert; Refrains ausschreiben).
2. Timing bauen: `node tools/retime.js <id>` (guided whisper-1 fuer Wortuhren, deine Woerter werden per
   Alignment daraufgelegt, Luecken interpoliert, Zeit monoton erzwungen). Achte auf "coverage %" + "weak".
3. `songs/<id>/song.json` schreiben: `es[]`/`de[]`/`imageMap[]` mit **einem Eintrag pro Lyric-ZEILE**
   (= pro Anzeigezeile, Segmentierung in `tools/lib/lyrics.js`), plus title, subtitle, names{de,es},
   genre, mp3, cover, images[], about{}, introStart/introEnd bei Bedarf. Kein internes `". "` in es/de.
4. **Pruefen (Gate, vor allem anderen):** `node tools/verify-song.js <id>` (Text==Lyrics, Counts, Timing
   monoton, Bilder). `FAIL` = nicht ausliefern, beheben, neu pruefen.
5. Bauen: `node tools/build-anim.js <id>` (Song + Hub) oder `--all`.
6. `songs/<id>/index.html` oeffnen und wirklich durchspielen, bevor du teilst.
7. Live (nach OK): `git add -A && git commit && git push origin main` (Pages baut automatisch).

`transcribe.js` ist nur fuer einen ersten Entwurf, wenn noch keine Lyrics existieren, danach echte Lyrics
holen und `retime.js` fahren.

## Notizen

- API-Keys liegen in `C:/Users/marte/Documents/Claude/API keys/` und werden von den Skripten gelesen, nie
  hardcoded. Nur `retime.js`/`transcribe.js` brauchen Netz; der Build ist offline.
- Fonts kommen von Google Fonts (online) mit System-Fallback; sonst laeuft alles offline per Doppelklick.

## Was wir NICHT umbenennen (und warum)

- `index.html`, `songs/`, `tools/`, `assets/`: haengen am Build + an der Live-Seite.
- `course/`: geplanter oeffentlicher Pfad `.../marten-songs/course/`, von index.html + der Beschreibungs-
  Vorlage verlinkt. Bleibt `course/` (intern "die Funnel Page").
