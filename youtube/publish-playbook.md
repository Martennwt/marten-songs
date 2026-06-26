# publish-playbook.md - alles, was pro Song zu YouTube geht

Die eine Checkliste vom fertigen Song bis zum hochgeladenen YouTube-Video. Marke = `brand.md`,
Beschreibungstext = `description-template.md`, Nachfrage/SEO = `reichweite/reichweite-playbook.html`.
Kein Em-Dash.

> Heute: die Songs leben im HTML-Player auf der Seite. Spaeter: wir **rendern** sie zu mp4 und laden nur
> noch das fertige Video + die Texte zu YouTube hoch (Schritt 7). Dieser Playbook deckt beides ab.

---

## Schritt 0 - Keyword/Thema waehlen (Mensch entscheidet)
Ein Vers + ein Gefuehl + das Format. 3-Schritt-Check (aus reichweite): (1) Begriff steht im
YouTube-Autosuggest. (2) Google Trends YouTube-Filter nicht fallend. (3) Kaltsuche zeigt kleine Kanaele
auf Seite 1. Deine staerkste freie Lane: **zweisprachig EN+ES Karaoke** (`bilingual worship`, Rang 0).

## Schritt 1 - Titel (Such-Phrase nach vorn)
| Typ | Template |
|---|---|
| Single | `{Hook/Vers} - {Songname} | Bible Song with Lyrics ({Stelle})` |
| Zweisprachig | `{Vers/Thema} - Bilingual Worship (English + Spanish Lyrics) | Sing Along` |
| Schlaf/Loop | `{Dauer} {Stimmung} Scripture Songs for Sleep & Prayer (Lyrics, Black Screen)` |
| Gefuehl | `{Vers} - A Song for When You're {Gefuehl} (Lyrics)` |
| Kinder | `Bible Songs for Kids with Lyrics - Sing Along ({Stelle})` |

## Schritt 2 - Beschreibung
- **Zeile 1+2 (vor "Mehr ansehen") = das Keyword + Hook**, unter 120 Zeichen. Wichtigster SEO-Hebel.
- **Body** aus `description-template.md` (Idee hinter dem Song, KI-Hinweis, Links, Hashtags).
- **Kapitel** aus `timing.json`-Abschnitten, erstes immer `0:00`, beschriftet mit Bibelstelle
  (= Google Key Moments).

## Schritt 3 - Tags + Hashtags
- **Tags (wenige, relevant):** bible song, scripture song, bible verse song, worship lyric video, sing
  along, bible karaoke, bilingual worship, {vers}, {gefuehl}, christian music.
- **Hashtags (3 bis 5, nie ueber 15):** #BibleSongs #ScriptureSong #SingAlong #Worship #LyricVideo.

## Schritt 4 - Thumbnail
Skill **`/top-thumbnail`**: 3 A/B-Kandidaten, "Golden Oil", Hook <=3 Woerter, Vers-Eyebrow, ein
Song-Signal (Play/Sing-Along), eine Variante zweisprachig EN+ES. In YouTube "Test & Compare" hochladen.

## Schritt 5 - Captions
Akkurate Untertitel hochladen (die gesungenen Worte werden fuer die Suche gelesen, hilft auch global).

## Schritt 6 - Video rendern (eigener Schritt, aktuell noch manuell/offen)
Aus dem HTML-Player ein **mp4** machen. Was rein muss: die gemalten Hintergruende (Drift/Pan), der
Wort-fuer-Wort-Text, die Uebersetzung. Was fuer das YouTube-Video WEG kann: die Player-Bedienleiste unten
(Buttons), weil das Video passiv laeuft. Optionen fuer den Renderer: headless Chrome + Aufnahme, oder ein
ffmpeg-Bildsequenz-Weg. **Noch nicht gebaut** (WORKLOG nennt "mp4-Renderer" als offenen Punkt). Bis dahin:
Bildschirmaufnahme des Players als Notloesung.

## Schritt 7 - Upload + Launch
- **Premiere** am Release-Tag, Song als **Featured Video** setzen.
- **Playlists** (keyword-reich): Bilingual Worship (EN & ES), Scripture for Sleep, Bible Songs for
  Worry & Anxiety, Psalms Set to Music, Bible Songs for Kids, Worship to Pray To.
- **End Screen** auf den naechsten Song + Abo. **Pinned Comment** mit Frage.
- **Hype** in Woche 1 (Community bitten). **KI-Kennzeichnung** setzen. **Auto-Dubbing** ES/DE/PT.
- **Links anhaengen:** Suno-Link (Quelle), Affiliate-Links (ElevenLabs zahlt; Claude/Gemini = normale
  Links bis Affiliate da ist, siehe `description-template.md`), Website, Kurs-Warteliste.

## Was YouTube pro Song am Ende braucht (die "Lieferung")
1. mp4 (gerendert) 2. Titel 3. Beschreibung (mit Kapiteln + Links) 4. Tags 5. Hashtags 6. 3 Thumbnails
7. Captions 8. Playlist-Zuordnung 9. KI-Kennzeichnung. Spaeter automatisierbar: Punkte 2 bis 5 + 8 aus
`song.json` + `timing.json` generieren, ggf. sogar der Upload per YouTube-API.

## Bezug zum Studio-Skill (Spur 1)
Die Schritte 1 bis 3 + 7 sind genau die "Metadaten-Maschine", die in den Studio-Skill kommt: aus dem
fertigen Song automatisch Titel/Beschreibung/Tags/Kapitel bauen. Schritt 4 (Thumbnail) + Schritt 6
(Render) bleiben eigene Schritte.
