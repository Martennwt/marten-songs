# Automatisierung: Song-Ordner → fertiges Karaoke + YouTube (Plan)

Das Endziel: **du legst einen Song in EINEN Ordner, der Rest passiert automatisch.** Hier steht, wie das geht,
was es schon gibt und was noch zu bauen ist. (Stand 2026-06-27.)

## Das Endziel (die volle Kette pro Song)
MP3 (+ Lyrics) rein → Timing (WhisperX, Selbst-Check) → Cover/Bilder → mobile Version → Übersetzung ES/DE →
„Idee hinter dem Song" → HTML-Player → MP4-Render → YouTube-Beschreibung → Song ins Archiv.

## Wie der Zeitplan läuft (das „jeden Montag scannen")
- **Lokaler Zeitplan (der realistische Weg):** eine Routine auf deinem PC (läuft, wenn der Rechner an ist),
  z. B. Windows Task Scheduler oder Claude `/schedule`. Scannt z. B. jeden Montag den Drop-Ordner.
  **Wichtig:** die WhisperX-Stufe MUSS lokal laufen (Modelle + `.venv` liegen auf deinem Rechner), dieser
  Schritt braucht also deine Maschine.
- **Cloud-Zeitplan:** kann unabhängig vom Rechner laufen, aber **nicht** die lokale WhisperX-Stufe. Cloud
  könnte die nicht-lokalen Teile machen (Bilder, Texte). Für die ganze Kette = lokaler Zeitplan.

## Die Kette im Detail (was es gibt / was zu bauen ist)
1. **Neuen Song erkennen** im Drop-Ordner (MP3 + `lyrics.txt`).  → *bauen: Watcher/Scan*
2. **Timing:** lokal WhisperX → `retime` → `verify` + Drift-Check → bei Flag automatisch Cloud + `introStart`
   aus der VAD-Gesangsregion.  → *da; die Auto-Umschaltung lokal→Cloud noch in die Pipeline gießen*
3. **Cover/Bilder:** Gemini-Generator (`tools/images/generate-image.js`).  → *da; Prompts pro Song automatisieren*
4. **Übersetzung ES/DE + „Idee hinter dem Song":** ein Claude-Schritt.  → *da (aktuell manuell); als Routine-Schritt*
5. **HTML-Player (desktop + mobil):** `tools/build-anim.js`.  → *da*
6. **MP4-Render:** Player ohne Bedien-UI → Video.  → *bauen (Task: YouTube-MP4-Renderer)*
7. **YouTube-Beschreibung:** Vorlage vorhanden.  → *automatisieren*
8. **Song → Archiv** nach der Verarbeitung.  → *bauen*

## Phasen (realistisch, Schritt für Schritt)
- **Phase 1:** EIN Orchestrator-Befehl `tools/make-song.js <id>` = die ganze Kette für einen Songordner
  (Timing → Selbst-Check → ggf. Cloud → Bilder → Build). Semi-automatisch, pro Song gestartet.
- **Phase 2:** Drop-Ordner + Wochen-Zeitplan (scannen → verarbeiten → archivieren) → „Review-Hub".
- **Phase 3:** MP4-Render + YouTube-Beschreibung, mit **Review vor Veröffentlichung**.

## Kritische Hinweise (ehrlich)
- **Lyrics am besten MIT der MP3 ablegen.** Nur-MP3 geht (WhisperX transkribiert selbst), aber Gesang-
  Transkription ist ungenauer → schlechtere Wort-Sync. Echte Lyrics = sicherster Weg.
- **Keine Auto-Veröffentlichung auf YouTube ohne Review.** YouTube hat Regeln für KI-Inhalte, und Qualität
  zählt. Die Pipeline baut bis „fertig/Vorschau", du gibst dann frei und lädst hoch. So bleibt Kontrolle.
- **Standard bleibt lokal/gratis;** Cloud nur für die harten (hum-lastigen) Songs, die der Drift-Check meldet.
