# Worklog — Marten's Songs

---

## 2026-06-26 (8): YouTube-Branding-Mockup + Thumbnail-Pipeline (Golden Oil über fal)

**Erledigt:**
- **Branding-Mockup `youtube/branding.html`** gebaut/iteriert: Name (Draw Near), 6 SVG-Logos, Avatare,
  3 Banner (2560x1440 + Safe-Area), Thumbnails, fertiges Video-Beschreibungs-Skript (echte Kapitel-Zeiten
  aus timing.json), Launch-Playbook, Copy. 1:1-Toggle + PNG-Export. Headless-Render zur Selbstprüfung.
- **Stil ENTSCHIEDEN = „Golden Oil"** (hell, warm, gemalt). Lektion: dunkle Gesichter + CSS-Composites
  waren schwach/düster. Alle dunklen Teile aus der Live-Seite **gelöscht** (Gesichter-Sektion, dunkle
  Thumbnail-Tabs, Photoreal, Stil-Picker). Voll-Backup `youtube/branding-archiv.html` (Link „⤓ alte Versionen").
- **Tool-Durchbruch:** Nano Banana Pro (= Gemini 3 Pro Image) läuft über **fal.ai** (`fal-ai/nano-banana-pro`)
  = gleicher Look wie s1, über **fal-Guthaben, KEIN Google-Tageslimit**. Generator
  `tools/images/generate-image.js` erweitert: Nano-Banana auf fal mit `aspect_ratio` (16:9/3:4), Job-Feld
  `aspect` (FLUX-Pfad unverändert). OpenAI/gpt-image für Golden Oil verworfen (anderer Look, „crap").
- **Bilder erzeugt:** Original `styles/s1-golden-oil.png` (Gemini); 3 Golden-Oil-Portraits
  (gp-man/gp-older-woman/gp-young-man); und **3 fertige Golden-Oil-Thumbnails über fal** im Mockup:
  fg1 Don't Worry/Matthew 6, fg2 Be Still/Psalm 46, fg3 Do Not Fear/Isaiah 41:10 - je andere Person +
  Thema, an echte Suchnachfrage gekoppelt. Text sauber gerendert, Play + Benefit-Badge.
- **Skill `/top-thumbnail`** (`~/.claude/commands/top-thumbnail.md`): hält Anatomie (Gesicht + Hook ≤3 Wörter
  + „es ist ein Song"-Signal + Vers + EN/ES + Slogan), Song-zuerst-lesen (Genre/Energie), Golden-Oil-Default,
  fal-Nano-Banana als Standardweg fest. Kanal-Slogan = „Come closer to God".
- Recherche eingeflossen (CTR/Thumbnails 2026, beste KI-Bild-Tools, fal Nano Banana). Memory aktuell.

**Offen / morgen:**
1. Marten sichtet die 3 fal-Thumbnails: Stil/Qualität ok? Feste „Gesicht des Kanals"-Person oder wechseln?
2. Banner (Sung Scripture / Feel Him) sind noch dunkel: ggf. auf hellen Golden-Look ziehen.
3. Gewinner-Thumbnail in **Canva** finalisieren (Draw-Near-Logo + exakte Marken-Typo).
4. Kanalname final wählen + Handle-Verfügbarkeit prüfen; Lieblings-Logo wählen.
5. Optional: weitere Themen-Thumbnails; die zweisprachige EN+ES-Lane (Rang 0) prominent bespielen.
6. Nichts gepusht (Branding ist lokales Mockup).

---

## 2026-06-26 (7): Monetarisierung, Kurs-Landingpage „The Sower System" + Sticky-Bars

**Ziel:** Kanal monetarisieren. Kurs verkaufen (eine Skill-Datei + kurzer „Set up Claude"-Videokurs =
fast Plug-and-play, um einen glaubensbasierten KI-Musik-Kanal zu starten). Marke: **The Sower System**,
Claim „Scatter the seed. Reap the channel." Sprache der Verkaufsseite: **Englisch**. Pre-Launch =
**nur Warteliste, kein Preis**. Formular bewusst **austauschbar** (noch kein Anbieter gewählt).

**Affiliate-Recherche (wichtig, ehrlich):** Anthropic/Claude hat **kein** öffentliches Einzel-Affiliate
(nur Enterprise „Partner Network" + Enterprise-Referral, einmalig, Sätze nicht öffentlich). Die Idee
„10-15 EUR pro Jahres-Abo" ist **so nicht verfügbar**. Echter Affiliate im Stack: **ElevenLabs**
(wiederkehrend). Gemini/OpenAI: kein offenes Consumer-Affiliate. Deshalb alle Links als Platzhalter.

**Gebaut:**
- `course/index.html` — komplette, futuristische Landingpage im exakten Marten's-Songs-Design:
  Announcement-Bar, Sticky-Nav, Hero (eigenes KI-Bild), Proof-Galerie (die 3 echten Songs verlinkt),
  Problem-Sektion (Nische, **YouTube-2026-KI-Regeln**, Tool-Chaos, „blank chat", Technik-Wand, Zeit),
  Solution-Band (before/after auf `harvest.png`), „What's inside" (9 Feature/Benefit-Karten),
  „How it works" (4 Schritte), „Who this is for", **Warteliste-Block** (Formular swap-ready), FAQ,
  Final-CTA, Footer. Effekte: Gold-Partikel-Canvas, Scroll-Reveal, Nav-Solid-on-Scroll, Glas/Gold-Hover.
- 3 eigene KI-Bilder via `tools/images/generate-image.js` (gemini-3-pro-image), in `course/img/`:
  `hero.png` (Sämann streut Saat, wird zu Sternen), `harvest.png` (Weizenfeld), `path.png` (Lichtpfad).
- **Hub-Sticky-Bars in `tools/build-anim.js` eingebaut** (also build-fest): oben `.promo` (Kurs +
  „Join the waitlist"), unten `.ctabar` (Features/Benefits + „See the course"), beide mit ×-Schließen
  (sessionStorage). CSS in `hubCSS()`, JS `closeBar()` im Hub-Script. `body{padding-bottom:74px}`.
- `marketing/youtube-description.md` — Beschreibungs-Vorlage mit **KI-Offenlegung** (von Marten gewünscht)
  + `{{AFFILIATE_*}}`-Platzhaltern + ehrlicher Affiliate-Status + Pinned-Comment-Idee.
- `node tools/build-anim.js --all` lief sauber; Hub + Seite headless (Chrome) gescreenshottet und geprüft.

**NICHT gepusht, NICHT committet** (wartet auf Martens Sichtung + OK).

**Offen / Marten muss entscheiden:**
1. **Warteliste-Anbieter** wählen (MailerLite empfohlen) → in das Formular in `course/index.html`
   einsetzen (Swap-Anleitung steht als Kommentar direkt über dem `<form>`).
2. **ElevenLabs-Affiliate** anmelden (echtes Geld) → Token in der YT-Vorlage ersetzen.
3. **Rechtliches (DSGVO!):** E-Mail-Sammeln in der EU braucht Datenschutzerklärung + Impressum. Fehlt noch.
4. Preis/Founding-Angebot festlegen (für den Launch, aktuell bewusst kein Preis).
5. Den eigentlichen **Kursinhalt** (Skill-Datei + Setup-Videos) produzieren.
6. Danach: commit + push → live unter `.../marten-songs/course/`.

---

## 2026-06-26 (9): Übergabe an neuen Chat — alles festgehalten, offene Entscheidungen

**Stand:** Songs sind live & gut (per-Zeile-Daten, 2-Zeilen-Anzeige, Badge, Reihenfolge, Intro-Fixes,
Kurzwort-Sync, Seek-Fix — gepusht in `02c70b6`). Pipeline + Lektionen dokumentiert.

**Neu festgehalten in dieser Session:**
- **WhisperX** (Forced Alignment, lokal) als Schritt-für-Schritt in `BRANDING.md` (Abschnitt „Forced alignment
  with WhisperX"): Install (ffmpeg+Python+`pip install whisperx`), Forced-Align an UNSERE Lyrics (Python-Snippet),
  geplanter Adapter `tools/whisperx-import.js` → `timing.json`. Whisper-API = Cloud-Pfad; WhisperX = lokaler
  Perfekt-Pfad. NICHT installiert (Marten-OK nötig, ~GB Download).
- **`introLines`** (rubato-Intro: pro Zeile [start,end]-Fenster) in `BRANDING.md` + Skill `/neuer-song` dokumentiert.
- Skill `/neuer-song` auf aktuellen Stand gebracht (2-Zeilen-Anzeige, introStart/introEnd/introLines, Seek/Sync).

**OFFEN — Marten will im NEUEN Chat klären (Reihenfolge so gewünscht):**
1. **Doku-Organisation / Umbenennung:** `BRANDING.md` ist faktisch der **Skill/Bauplan** der ganzen App
   (Design, Bilder, Pipeline, Player, Mobil, alle Lektionen) — Name „Branding" irreführend. Frage offen:
   umbenennen (PLAYBOOK/GUIDE/SKILL?) UND evtl. trennen in *interne Bau-Doku* vs. *verkaufbarer „KI-Guide"*
   für den Kurs. (AskUserQuestion zum Namen wurde gestellt, Marten will erst sortieren → im neuen Chat entscheiden.)
2. **WhisperX installieren?** Marten fand's „cool" — auf sein OK als eigener Schritt einrichten.
3. YouTube-Branding läuft im SEPARATEN Fenster (`course/`, `youtube/`, `marketing/`, `YOUTUBE.md`) — hier nicht anfassen.

---

## 2026-06-26 (8): Player-Feinschliff aus Martens Live-Tests (2-Zeilen, Badge, Sync) + gepusht

Aus dem iterativen Browser-Test mit Marten, alles in `tools/build-anim.js`:
- **2 Zeilen pro Block:** Anzeige gruppiert 2 Lyric-Zeilen pro aktivem Block (`groupLines`, Default 2), jede
  Zeile mit eigener Übersetzung, Gold-Schimmer läuft über beide. Gilt für alle Songs (auch The Sower).
- **„★ Most loved"-Badge** (`badge`-Feld) + **Hub-Reihenfolge** (`order`-Feld): The Sower zuerst.
- **Kurzwort-Sync:** Gold-Füllung jetzt proportional zur Wortlänge (gedeckelt) → „in/I/a" snappen statt zäh
  zu faden. Kein Nachhängen/Aufholen mehr.
- **Seek-Fix:** Klick auf die Leiste richtet die Anzeige SOFORT neu aus (scrollt + setzt gesungene Zeilen
  zurück), auch rückwärts vor die erste Zeile — kein Warten auf den Countdown (`setActive` reconciliert alle Zeilen).
- **Soft-Intro-Timing (der harte Fall):** Whisper hört sehr leise A-cappella-Intros NICHT (bei The Word erstes
  erkanntes Wort erst 22,7s, davor halluziniert). Neue Regler in song.json, beim Laden angewandt (timing.json
  bleibt pure Whisper-Wahrheit):
  - `introStart` (+ optional `introEnd`) = Start/Tempo des leisen Intros; sonst Tempo der Song-Wortrate.
  - **`introLines`** `[[start,end],...]` = pro leiser Zeile ein Fenster (für **rubato**: Zeile schnell, Pause,
    Zeile langsam). The Word: `[[16,21],[22.5,29.5]]`. Mustard: `introStart:11`.
  - `?cal=1` Panel mit Start/Ende-Reglern zum Justieren per Ohr.
- Lektion + `introLines` in `BRANDING.md` festgehalten. **Gepusht** auf Martens „push".

**Offen / Strategie:** Für „ein Song schicken → 100% automatisch makellos" auch bei leisen Intros bleibt
**Forced Alignment** (whisperX) das Angebot — Marten muss OK geben (größere Installation: Python+ffmpeg+Modell).
YouTube-Branding läuft in separatem Fenster (`course/`, `youtube/`, `marketing/`, `YOUTUBE.md` — von mir nicht angefasst).

---

## 2026-06-26 (6): Zeile-für-Zeile-Standard + Intro-Timing-Fix + LIVE gepusht

Martens Feedback aus dem Browser umgesetzt:
- **Zeile für Zeile** (wie The Sower): Anzeige war bei den neuen Songs als große Blöcke, weil der Player nach
  Satzzeichen trennte (Sower-Zeilen enden auf Punkt, neue Songs auf Komma). Segmentierung in
  `tools/lib/lyrics.js` auf **eine Lyric-Zeile = eine Anzeigezeile** umgestellt (Mustard 52, The Word 40),
  `es[]/de[]/imageMap[]` pro Zeile neu geschrieben. verify PASS.
- **Gold zu früh am Anfang:** Whisper ankert leise Intros ein paar Sekunden zu früh (Mustard: „The smallest of"
  bei ~8s, gesungen ~11s); der Rest stimmt. NEU: `"introStart"` in song.json + Player-Logik `applyIntro()` —
  rückt **nur** die Wörter vor dem echten Gesang-Start nach (verteilt sie in die Lücke bis zum ersten korrekt
  gehörten Wort), Rest unberührt. timing.json bleibt pure Whisper-Wahrheit, Fix wird beim Laden angewendet.
  Mustard `introStart: 11` gesetzt (verifiziert: The/smallest/of → 11/11.46/11.92, „all the seeds" bleibt 12.4+).
- **Kalibrier-Tool** `?cal=1`: Panel „Gesang ab X.Xs" mit −/+ Buttons (±0.5s) und Tasten `[` `]` (±0.1s), live.
  Marten justiert per Ohr, sagt die Zahl → wird in `introStart` gebacken. (Globaler `offset` bleibt für selten
  gleichmäßig verschobene Songs.)
- **Whisper-Cache** in retime (`.whisper.json`): Re-Segmentieren/Neu-Timen gratis & sofort; `--fresh` ruft neu ab.
- `BRANDING.md`, README, Skill `/neuer-song` aktualisiert (Zeilen-Standard + introStart/Kalibrierung).
- **GEPUSHT** auf Martens OK („Rest sieht gut aus") → beide Songs live auf martennwt.github.io/marten-songs.

**Offen:** The Word hat `introStart: 0` (sein weicher Intro startet graduell) — falls das Gold dort auch zu früh
wirkt, per `?cal=1` justieren und Zahl nennen. Genre bestätigen. YouTube-Branding läuft in separatem Fenster.

---

## 2026-06-26 (5): Die 2 geparkten Songs gefixt (Lyrics-first) + Selbst-Check-Pipeline

**Marten schickte die echten Lyrics** für Mustard Seed + The Word That Found Me → beide gebaut, lokal
geprüft, jetzt aktiv (`song.json`, `.off`-Backups gelöscht). Noch **nicht gepusht** (wartet auf Martens OK
nach Sichtung im Browser).

**Neue, robuste Pipeline gebaut (für den Kurs gedacht, „immer reproduzierbar"):**
- `tools/lib/lyrics.js` — eine Wahrheit für die Segmentierung: Couplet = 2 Lyric-Zeilen = 1 Anzeigezeile.
- `tools/retime.js` — Lyrics + MP3 → vertrauenswürdige `timing.json`. Guided whisper-1 für Wortuhren, dann
  **Needleman-Wunsch-Alignment** der echten Wörter auf die Whisper-Zeiten, Lücken interpoliert, Monotonie
  erzwungen. `precise:true` + Wortzeiten pro Segment. Schwache Segmente (leiser Gesang, den Whisper kaum
  hört): gleichmäßig über das Whisper-**Segmentfenster** verteilt statt zappeligen Einzelzeiten zu trauen.
- `tools/verify-song.js` — **das Gate vor jeder Auslieferung**: Text==Lyrics (wortgenau), #Segmente==es==de==
  imageMap, Zeiten monoton/im Bereich, imageMap gültig, Coverage + weak-Segments. FAIL = nicht ausliefern.
- `tools/build-anim.js` — nutzt jetzt `precise`-Wortzeiten verbatim (The-Sower-Pfad unverändert).
- **Skill `/neuer-song`** (`~/.claude/commands/neuer-song.md`) hält den ganzen Ablauf fest. `BRANDING.md` +
  `README.md` aktualisiert (Lektionen + verify-vor-Auslieferung).

**Ergebnisse:** Mustard Seed 26 Segmente, **99 % Coverage**, verify PASS. The Word That Found Me 20 Segmente,
**94 % Coverage**, verify PASS mit 1 WARN: das **zarte A-cappella-Intro** („There was nothing in my hands…")
hört Whisper kaum → über das Whisper-Fenster (0–28s) gleichmäßig verteilt (~1,1 s/Wort, glatt, aber nicht
wortgenau). Falls Marten den Intro-Einsatz genauer will: per Ohr nachjustieren (Startzeit nennen → manuell setzen).
Außerdem ein alter Transkriptionsfehler korrigiert: Bridge ist „a faith of **seeds**" (vorher fälschlich „seas/Meeren").

**Gelernte Regel bestätigt (live erlebt):** Mit echten Lyrics als Whisper-Prompt sprang Mustard Seeds
**Verse 1 von „fehlt komplett" auf 99 % Coverage** — Lyrics-mitschicken ist der Hebel, nicht „zweimal laufen".

**Offen:** Browser-Sichtung durch Marten → dann commit + push. Genre der 2 Songs bestätigen (Indie Folk Pop).
Optional: `the-sower-remastered` mit gleicher Pipeline retimen.

---

## 2026-06-26 (4): Stand für Wiedereinstieg (Kontext-Cut)

**LIVE = nur „The Sower" (Original)** auf https://martennwt.github.io/marten-songs/ . Spanisch auf
Top-Castellano verfeinert (Reina-Valera-Anklang). Default-Sprache DE.

**Player-Features alle drin (über `tools/build-anim.js`):** Wort-Schimmer mit **LEAD 0.18s** Vorlauf
(gegen Whisper-Verzug), Lautstärke-Popover (vertikal), Sprachmenü ES/DE, Intro-Cover mit Bild + X (kein
Play-Button: Tippen/Autoplay, ~1,5s Cover dann Song), Countdown-Ring im Intro, Info-Panel „Die Idee
hinter dem Lied" mit ES|DE-Schalter + Vorlesen (Guillermo-Stimme, nur The Sower), Letra-Ansicht + PDF,
Genre-Filter (Indie Folk Pop aktiv; Blues/HipHop/R&B „bald"), Hub-Karten mit Bild + Gold-Hover, deutscher
Titel auf Cover, Hintergrundbilder heller (.34) + **Mobil-Schwenk `imgpan`** (Bild läuft auf dem Handy
links→rechts durch, kein 16:9-Beschnitt). 8 Bilder für The Sower. Alles in `BRANDING.md` (Standards) dokumentiert.

**Geparkt, NICHT live (lokal, `songs/<id>/` mit `song.json.off`):**
- `mustard-seed` und `the-word-that-found-me`: Whisper-Transkript passte NICHT (Zeilen verschluckt, z. B.
  fehlte „There was nothing in my hands…"; Timing schief). mp3/timing/Bilder/Übersetzungen liegen bereit.
  **FIX:** Marten schickt die **echten Lyrics** → Anzeigetext aus den Lyrics neu bauen + Timing daran
  ausrichten, dann lokal zeigen, erst dann pushen. (`song.json.off` → zurück zu `song.json` zum Aktivieren.)
- `the-sower-remastered`: mp3+timing da, Transkript verwürfelt (anderer Beat/Melodie). Eigener Song,
  sauberer Re-Time nötig, Bilder von The Sower wiederverwenden.

**Offen / Entscheidungen für die nächste Session:**
1. Echte Lyrics für die 2 neuen Songs (+ ggf. Remaster-Lyrics = The-Sower-Lyrics) → fixen.
2. Genre der neuen Songs bestätigen (vorerst Indie Folk Pop).
3. Optional: Single-Page-Umbau (echtes Auto-Start ohne Klick), `flash-image` als Bild-Default (4 Cent
   statt Pro ~13 Cent), Forced-Alignment für perfekte Wort-Sync, mp4-Renderer fürs YouTube-Video.

**Regel gelernt:** MP3 **+ Lyrics** zusammen schicken = sicherster Weg. Nur-MP3 klappt, wenn Whisper den
Song gut hört, verschluckt aber bei manchen Beats Zeilen → Text/Timing stimmen dann nicht.

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
