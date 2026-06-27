# Worklog — Marten's Songs

---

## 2026-06-27 (3): Player-UX optimiert (Playlist-Sidebar, Home, Auto-Next, Songdauer) + Mobil-Fix

**Erledigt (alles in `tools/build-anim.js`, gebaut + headless geprüft + gepusht):**
- **Playlist-Sidebar:** Hamburger oben links → Drawer mit allen Songs (Cover + Name + Dauer, aktueller gold
  markiert), Song wechseln ohne Hauptmenü. `getPlaylist()`/`fmtDur()`-Helfer; `PLAYLIST`+`SONG_ID` injiziert.
- **Home-Button** (Icon) neben dem Hamburger → Hub.
- **Auto-Next:** Song endet → nächster lädt mit `?play=1`.
- **Songdauer** als Badge auf den Hub-Karten, in der Sidebar und im Player.
- **Mobil-Fix (wichtig):** Nav (Hamburger+Home) liegt jetzt **über dem Gate** (z-index 62), der alte `gate-x`
  ist dadurch ersetzt → Playlist/Home auch erreichbar, wenn Autoplay nicht startet.
- **`docs/automation-plan.md`** gespeichert (Drop-Ordner → Vollpipeline, Phasen, kritische Hinweise).
- Pushes heute: Songs/Pipeline (`d2b3c83`), Automatisierungsplan (`501150c`), Player-UX (`8030b2c`).

**Offen / morgen (Martens Wahl):**
1. Player-Feinschliff nach Martens Test (Icon-Größe/Position, Sidebar-Verhalten).
2. **MP4-Renderer** (Player ohne UI → YouTube-Video) + Beschreibungen.
3. **Auto-Ordner** + automatische lokal→Cloud-Umschaltung in die Pipeline gießen.
4. Auto-Next-Autoplay kann beim Seitenwechsel browserseitig blocken; für lückenlos später Single-Page-Umbau.
5. **Kurs-Seite v3** liegt weiter lokal/ungepusht (Martens OK steht aus).

---

## 2026-06-27 (2): WhisperX-Timing-Pipeline scharf gemacht, alle 4 Songs lokal getimt + Hybrid + Drift-Check

**Ziel:** Karaoke-Timing pro Song makellos UND automatisch (kein Handarbeit-Tuning), für den Video-Launch.

**Die Methode (REPRODUZIERBAR, so machen wir ab jetzt jeden Song):**
1. **Lokal (Standard, gratis):** `tools/whisperx-align.py <id>` = VAD findet die Gesangs-Region (trimmt
   Instrumental-Intro) + EINE durchgehende CTC-Forced-Alignment der GANZEN Lyrics → gemessene Wortzeiten in
   `.whisper.json`. Dann `node tools/retime.js <id>` (liest den lokalen Cache, KEIN Cloud-Call) → NW-Alignment
   unserer Lyrics + Interpolation + Monotonie → `timing.json`. CTC ist monoton → wiederholte Refrains + weiche
   A-cappella-Intros sitzen.
2. **Harte (hum-/halteton-lastige) Songs:** CTC quetscht den Outro zusammen. Der `verify`-**Drift-Check meldet
   das automatisch**. Dann für DIESEN Song auf **OpenAI Cloud** umschalten: `node tools/retime.js <id> --fresh`
   (Sekunden, ~2 Cent). Cloud ankert echte Wort-Einsätze → Summen/gehaltene Noten werden zu LÜCKEN (gehaltenes
   Wort bleibt gold, nächste Zeile wartet). Bei zu frühem Intro `introStart:<VAD-Gesangsstart>` (z. B. Mustard 11).
3. **Kritisch:** Cloud ist NICHT Standard (OpenAI ist bei sehr leisen A-cappella-Intros taub → die brauchen lokal).

**Erledigt (alle 4 Songs spielen sauber, von Marten bestätigt):**
- **The Sower (Remastered)** NEU gebaut (Version 2, MP3 von Marten): Lyrics aus dem Original abgeleitet (25 Zeilen),
  eigenes neues Cover (`img/cover-remastered.png`, Gemini). Lokal getimt.
- **The Word That Found Me** auf WhisperX-Timing umgestellt (leiser A-cappella-Intro wird automatisch gemessen,
  „There" @ 15,57s), Intro-Handregler entfernt, **alte geratene Version gelöscht** (V2 ist jetzt die echte).
- **Mustard Seed** neu getimt: lokal quetschte den hum-/halteton-lastigen Outro → auf **Cloud** umgeschaltet
  (Outro + „love…ooo"-Halteton + Summ-Pause sitzen) + `introStart:11`.
- **The Sower** (Original) unverändert gut.
- **Neue Tools:** `tools/whisperx-align.py` (CTC), `tools/whisperx-words.py` (lokaler ASR-Weg), `tools/whisperx-import.js`
  (Legacy-Adapter). **Drift-Check** in `verify-song.js` (meldet Cramming + unplausible Sprünge automatisch).
  **Zeiten in der Textansicht** in `build-anim.js` (zum Prüfen).
- **Doku/Guide** ehrlich aktualisiert: `/neuer-song`-Skill, `BRANDING.md`, `docs/whisperx.md`, und in der externen
  KI-Medien-Guide die Datei `whisperx-breakthrough.html` (Problem/Fix/VAD+ASR/Hybrid/Prompt/Code) + Querschnitt
  in `ki-medien-guide.html`. Memories: `whisperx-installed`, `be-a-critical-partner`, `open-results-in-browser`.

**Offen / als Nächstes (Marten will, Reihenfolge):**
1. UI: Playlist-Sidebar + Home-Button + Auto-Next (Desktop+mobil) + Songdauer anzeigen.
2. MP4-Renderer (Player ohne Bedien-UI → YouTube-Video) + Beschreibungen.
3. Auto-Ordner: Song reinlegen → automatisch alles (Konzept im Chat besprochen, Bau offen).
4. Automatische lokal→Cloud-Umschaltung in die Pipeline gießen (jetzt noch manuell pro Song).

**Kurs-Seite v3 bleibt lokal/ungepusht** (Marten noch nicht zufrieden).

---

## 2026-06-27 (1): WhisperX installiert (lokale Forced-Alignment) + Skript + getestet + Guide

**Ziel:** Der dokumentierte naechste Schritt fuer **perfekte Wort-Sync ohne Intro-Gefummel**. WhisperX
laeuft lokal und macht Forced Alignment: es presst UNSERE bekannten Lyrics Wort fuer Wort auf die Tonspur
(wav2vec2), misst also die Onsets statt sie zu raten - auch im leisen A-cappella-Intro, wo Cloud-Whisper taub ist.

**Erledigt:**
- **ffmpeg 8.1.1** via winget installiert (bin im Benutzer-PATH; neue Shell noetig zum Erkennen).
- **Isolierte Umgebung `.venv/`** per uv (Python 3.12.10), in `.gitignore` (nur lokal, nicht im Repo).
  Stolperstein festgehalten: uv-venvs haben **kein pip** -> mit `uv pip install --python .venv\Scripts\python.exe ...`
  installieren statt `python -m pip`.
- **WhisperX 3.8.6 + torch 2.8.0+cpu** installiert (CPU-Build ~230 MB, kein NVIDIA-GPU -> CPU-Modus, laeuft).
- **Skript `tools/whisperx-align.py`** gebaut: liest `lyrics.txt` (segmentiert exakt wie `tools/lib/lyrics.js`),
  nimmt grobe Fenster aus `timing.json` als Anker (sonst Gleichverteilung), richtet jedes Wort gemessen aus,
  schreibt `songs/<id>/whisperx-aligned.json` + druckt die gemessenen Intro-Onsets als Beweis. Haengt ffmpeg
  selbst in den PATH, damit es ohne Shell-Neustart laeuft.
- **Beweislauf auf „The Word That Found Me"** (der harte Soft-Intro-Fall): **434 Woerter, 40/40 Zeilen, 0
  Monotonie-Verletzungen, 0 ausserhalb des Bereichs.** Erste Zeile „There was nothing in my hands..." jetzt
  GEMESSEN: There 15,57s / was 15,81s / hands 17,59s. Cloud-Whisper hatte sie geraten (There 2,16s, gleichmaessig
  ueber 2-25s verteilt = falsch). WhisperX trifft automatisch das Fenster, das wir vorher per Ohr als
  `introLines [[16,21],...]` setzen mussten -> die manuelle Intro-Kalibrierung entfaellt.
- **Guide `docs/whisperx.md`** geschrieben + auf Martens Fragen **anfaengerfreundlich** ueberarbeitet: was/warum,
  ffmpeg erklaert, was man alles damit kann (transkribieren/Untertitel/YouTube via yt-dlp), Vorteile vs Cloud,
  Groesse (2,0 GB .venv + 361 MB Modell), commit-vs-push, GitHub-Sicherheit, „ueberall nutzbar" via
  `uv tool install whisperx`, FAQ. Plus **Mitschrift `docs/sessions/2026-06-27-whisperx-install.md`** (Schritt
  fuer Schritt fuers Video).
- **Push-Entscheidung:** alles nach GitHub **ausser der Kurs-Seite** (Marten ist mit v3 noch nicht zufrieden,
  bleibt lokal committet/ungepusht). WhisperX/Doku/Infra/YouTube-Mockup sind live.

**Offen / als Naechstes:**
1. **Adapter `tools/whisperx-import.js`** bauen: `whisperx-aligned.json` -> unsere `timing.json` (`precise:true`,
   Wortzeiten `{t,s}`), dann laufen `verify-song.js` + `build-anim.js` unveraendert auf den WhisperX-Zeiten.
2. Erst danach einen Live-Song (z. B. The Word) auf WhisperX-Timing umstellen - **nach Martens Sichtung**,
   kein Live-Song wird ungeprueft geaendert.
3. Regel in den Skill `/neuer-song` aufnehmen: WhisperX installiert -> lokaler Pfad; sonst Cloud + Intro-Regler.
4. BRANDING.md-Reorg (WhisperX-Abschnitt + Guide zusammenfuehren) - bewusst spaeter.

---

## 2026-06-26 (10): Kurs-Landingpage „The Sower System" gebaut + auf hell/modern neu entworfen (v3)

**Ziel:** Verkaufsseite fuer den Kurs (Monetarisierung). Eigene Produkt-Marke, NICHT spirituell, getrennt
vom Faith-Kanal. Verkauft **zwei Programme**: Web Player (eigene KI-Songs, mobil, fuer zuhause/Geschenk)
und YouTube-Kanal + Nebeneinkommen + **KI lernen**. Tonalitaet „If you can feel it, you can sing it."

**Erledigt:**
- `course/index.html` aufgebaut + in vielen Iterationen mit Marten verfeinert: Power-Sektion (animiertes
  Claude-Code-Terminal + Pipeline), YouTube-Channel-Mock (History „Echoes of History", Grid-Thumbnails,
  starker Header), interaktiver **Einkommens-Rechner** (Ads+Affiliate+Mitgliedschaften, konservativ),
  **Browser-Demo** (Dashboard-Menue → Sower-Player, scroll-getriggert), Tool-Logos + Browser-Logos,
  „Forget the old ways" (kein Schneiden/Design/Code), Pakete mit Preisen **99/149/199** (Bundle save 49),
  Zielgruppen-Sektion. Eigener SVG-Icon-Satz statt Emojis. Nischen-Fantasy-Showcase entfernt.
- **Embed-Modus im Player** (`tools/build-anim.js`): `?embed=1` blendet Songs-Link/X/Letra aus (Booklet
  geschuetzt), Idee-Button sichtbar. Songs neu gebaut. Hub-Sticky-Bars (oben Promo, unten CTA) eingebaut.
- **Grosser Neuentwurf v3 = HELL/modern** (auf Martens Feedback „zu dunkel, sieht aus wie immer"):
  warmes Creme + dunkler Text + Gold, **Hell/Dunkel-Rhythmus** (dunkle cineastische Baender: Demo,
  Solution, Power, Channel), **neuer Split-Hero mit Phone-Mockup**. Eigenes Light-Theme ueber dem Basis-CSS.
- **KI-Bilder erzeugt** (`tools/images/generate-image.js`, gemini-3-pro-image) in `course/img/`:
  `hero2` (goldene Wellen), `harvest`,`path`, Nischen `n-*`, History `h-banner`+`h-*` (6), Zielgruppen `aud-*` (4, warm/hell).
- `marketing/youtube-description.md` (KI-Offenlegung + Affiliate-Platzhalter). Affiliate-Recherche:
  Anthropic hat KEIN Einzel-Affiliate; ElevenLabs ist der echte. Siehe Memory [[affiliate-reality]].
- **Dateien:** `course/v1.html` = Grundlage (unangetastet), `course/v2.html` = `course/index.html` = aktueller
  heller v3, `course/faith.html` = aelteste Faith-Version. Plan: `~/.claude/plans/structured-wiggling-treehouse.md`.

**Gepusht:** nur EINMAL frueh (`09f6fc0`: erste allgemeine Kurs-Seite + Hub-Bars live). **Der gesamte
v2/v3-Umbau ist NICHT gepusht** , live ist noch die alte Version. (Cache-Tipp: `file://` cached, frisch via Inkognito.)

**Offen / morgen:**
1. Martens OK zur **hellen Richtung** (zuletzt offen). Dann Feinschliff.
2. **Demo-Dashboard** exakt wie sein echtes „Marten's Songs"-Hub stylen (Genre-Chips, „Most loved", Play/Songinterpretation).
3. **Markenname** entscheiden (`The Sower System` klingt leicht spirituell, evtl. neutraler Produktname).
4. FAQ-Copy auf neue Positionierung nachziehen, Kontraste final pruefen.
5. **Vor Launch:** Warteliste-Anbieter (MailerLite), ElevenLabs-Affiliate anmelden, **DSGVO** (Datenschutz+Impressum),
   eigentlicher Kursinhalt (Skill-Datei + Setup-Videos). Danach commit + push.

---

## 2026-06-26 (9): YouTube-Ranking-Recherche + grosse Doku-/Ordner-Reorg + Projekt-Hygiene

**Erledigt:**
- **Tiefenrecherche YouTube/Google-Ranking** (4 parallele Agenten): wie Menschen nach Glaube suchen
  (Gefuehl/Problem, nicht Kuenstler), Autocomplete-/Keyword-Tools, Ranking-Hebel 2026, Prediger-Idee
  (Recht). Ergebnis: `youtube/reichweite/reichweite-playbook.html` (poliert, Navy/Gold, Kopier-Buttons)
  + `youtube/reichweite/RECHERCHE-ranking-reichweite.md`.
- **Echte YouTube-Autosuggest live gezogen** (oeffentlicher ds=yt-Endpoint): 1070 reale Suchvorschlaege,
  geclustert. Staerkste freie Lane bestaetigt: **zweisprachig EN+ES Karaoke** (Rang 0).
- **Prediger-Idee (Paul Washer) ehrlich bewertet:** rechtlich riskant ("eigenen Teil dazugetan" schuetzt
  nicht; bei HeartCry Name/Foto im Thumbnail verboten). Sauberer Weg = Themen + Bibelstellen + Spurgeon
  (Public Domain). In Memory + Playbook.
- **Grosses Doku-/Ordner-Aufraeumen (alles nur lokal, nichts an der Live-Seite):**
  - `marketing/` aufgeloest -> `youtube/description-template.md`.
  - `YOUTUBE.md` (Root) in den youtube-Ordner geholt + nach Job getrennt: `youtube/brand.md` (Marke) +
    `youtube/publish-playbook.md` (pro Song veroeffentlichen, inkl. Render-Schritt) + `youtube/README.md`.
  - `START-HERE.md` als Mensch-Karte erstellt, dann in `README.md` gefaltet (geloescht). README ist jetzt
    der Mensch-Einstieg: Landkarte (3 Buckets: Engine/Kanal/Kurs) + das festgehaltene Ziel.
  - `archive/` angelegt: alte Kurs-Seite (faith.html), `the-sower-remastered` (Bauruine, kein song.json),
    `the-sower/_backup` (Original-mp3).
- **Senior-Review + 3 Quick-Wins:** `CLAUDE.md` Key files aktualisiert (retime + verify vorn, transcribe =
  Fallback, externe Tools benannt); **`package.json`** angelegt (Node >=18, keine Deps, npm run
  build/verify/retime); tote Song-Ordner archiviert -> `songs/` = nur noch 3 echte Songs.
- **KI-Guide (BRANDING.md):** neuer Abschnitt "Setup & external tools (by design)" - warum package.json
  zaehlt; **Entscheidung: Bild-Generator + APIs bleiben extern** (nicht ins Repo gevendort, = dokumentierte
  Voraussetzungen, im Kunden-Video-Guide gezeigt); WhisperX-Status (dokumentiert, noch nicht installiert).
- **Produkt-Vision festgehalten:** ZWEI getrennte verkaufbare Skills - (1) eigene Songseite/Player,
  (2) YouTube-Kanal. Kunde bekommt Ordner/ZIP, geht im Chat A-Z durch. `youtube/sower-system/` =
  benanntes Skelett + `blueprint.md` + neues `modules/00-setup.md` (Node + API-Keys, Video-Guide).
- **WhisperX erklaert** (lokale Forced-Alignment, perfekte Wort-Sync, entfernt das Intro-Gefummel).
- **Memories** neu/aktualisiert: `reichweite-playbook`, `product-vision-two-skills`, `youtube-branding`
  (Pfad -> brand.md), `MEMORY.md`.

**Offen / morgen:**
1. **WhisperX installieren** (auf Martens OK, ~GB Download) - der naechste Schritt fuer perfekte Wort-Sync.
2. **Skill 1 (eigene Songseite) scharf machen** - damit Marten 5-7 Songs hintereinander durchziehen kann.
3. Hauptziel bleibt: mehr Songs hinzufuegen (Marten liefert MP3 + Lyrics + Suno-Style).
4. Spaeter/optional fuers Kundenpaket: `.env` statt absolutem Key-Pfad; `BRANDING.md` evtl. umbenennen
   (interne Doku vs. verkaufbarer Guide); `youtube/branding-archiv.html` beim Branding-Durchgang ins archive.
5. Branding-Mockup laeuft im anderen Fenster (Eintrag 8) - hier nicht angefasst.

**Nicht committet, nicht gepusht** (alles lokal, wartet auf Martens OK).

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
