# The Sower System - Skizze (wie wir den verkaufbaren Skill bauen)

Planungs-Dokument, kein fertiger Code. Beantwortet: wie bauen Profis so ein Produkt, wie verkauft man
einen Ordner, und wie sieht das ganze System aus. Kein Em-Dash. Stand 26.06.2026.

---

## 0. Der wichtigste Gedanke: es sind ZWEI Ebenen, aber EINE Maschine

| | Ebene B: dein Studio-Flow (jetzt) | Ebene A: das Kundenprodukt (verkaufen) |
|---|---|---|
| Wer | nur du | jeder, der den Kurs kauft |
| Marke | fix: Draw Near / Marten's Songs | leer, wird FÜR die Person erzeugt |
| Start | "Ich lege los" + MP3 + Lyrics | "Hey" -> geführte Reise von null |
| Inhalt | nur die Song-Produktion | alles: Onboarding, Nische, Branding, Thumbnails, SEO, Song-Produktion, Upload |

**Der Trick: Ebene B ist Ebene A mit deinem Profil schon ausgefüllt.** Es ist EIN Ordner. Eine Profil-Datei
entscheidet, ob die Marke schon feststeht (du) oder erst erfragt wird (Kunde). Darum bauen wir zuerst B
sauber (brauchst du eh für die 5-7 Songs), und B ist dann der erprobte Kern, den der Kunde bekommt.

---

## 1. Wie Profis so ein Produkt bauen (das "Skill"-Modell)

Ein verkaufbarer Claude-Skill ist **kein einzelnes MD-File**. Es ist ein **Ordner** nach Anthropics
"Agent Skills"-Format. Du hattest völlig recht: nicht eine Riesen-MD, sondern ein Ordner mit mehreren Dateien.

Die vier Bausteine, die jeder Profi-Skill hat:

1. **`SKILL.md` (der eine Einstieg).** Oben ein kurzer Kopf (`name`, `description`). Darunter die Anweisung
   an Claude: "Wenn der Nutzer startet, führe diese Reihenfolge aus." Das ist das Gehirn. Der Nutzer tippt
   EIN Wort, Claude steuert den Rest.
2. **Module (mehrere kleine MD-Dateien).** Pro Schritt eine Datei (Onboarding, Nische, Branding, Thumbnails,
   Song-Pipeline...). Claude lädt immer nur die, die gerade dran ist. Das nennt sich "progressive disclosure"
   und ist der Grund, warum man NICHT alles in eine Datei packt: sonst ist der Kontext voll und es wird teuer
   und ungenau. Viele kleine Dateien = sauber, schnell, erweiterbar.
3. **Eine Profil-/Status-Datei (das Gedächtnis).** z.B. `profile/profile.md`. Hier schreibt der Skill
   kontinuierlich rein, was er über die Person lernt (Name, Nische, Hobbys, Markenentscheidungen). Jeder
   spätere Schritt liest sie zuerst. Das ist genau dein "wird ins individualisierte System abgespeichert".
4. **Werkzeuge + Vorlagen.** Die Skripte (retime, verify, build-anim, generate-image) und Templates
   (song.json, Beschreibung) liegen mit im Ordner, damit die Maschine beim Kunden genauso läuft wie bei dir.

So fühlt es sich für den Nutzer an:
```
Nutzer:  Hey
Claude:  Schön, dass du da bist. Wie heißt du?
Nutzer:  Marten
Claude:  Hi Marten. Erzähl mir kurz, was dich bewegt - worüber willst du singen lassen?
         ... (speichert alles in profile.md, geht Schritt für Schritt weiter)
```
Ein Einstieg, kein Befehls-Wirrwarr. Genau dein Bild.

---

## 2. Die Ordnerstruktur (die Skizze)

```
the-sower-system/                 <- DAS ist der Ordner, den der Kunde hochlädt
  CLAUDE.md                       Projekt-Hirn: "sagt der Nutzer Hey/Start, beginne die Reise"
  SKILL.md                        der eine Einstieg: kennt die Reihenfolge der Module
  profile/
    profile.md                    wird pro Person gefüllt (Name, Nische, Marke, Fortschritt)
  modules/
    01-onboarding.md              wer bist du, Interessen, Hobbys
    02-niche.md                   Nischen- + Konkurrenz-Recherche (nutzt das SEO-Playbook)
    03-branding.md                Kanalname, Logo, Banner (richtige Größe), Fonts, Beschreibung,
                                  "so machst du den YouTube-Kanal auf" + nächste Schritte
    04-thumbnails.md              Thumbnail-System (3 A/B-Kandidaten, Anatomie, Nano-Banana-Rezept)
    05-songs.md                   Song-Pipeline: Whisper/retime -> Text+Timing prüfen -> bauen
    06-images.md                  Bild-Prompts, gemalter Look, leichte 3D-Bewegung (drift/pan)
    07-publish.md                 Titel/Beschreibung/Tags/Hashtags/Kapitel + Upload-Checkliste
  reference/                      Nachschlagewerk (wird nur bei Bedarf geladen)
    seo-playbook.md               die echte-Nachfrage-Recherche (aus reichweite-playbook)
    branding-spec.md              Farben, Typografie, Look (aus BRANDING.md)
    suno-styles.md                Suno-Style-Vorlagen: Simple Core + Detailliert
    lyric-structure.md            Songtext-Bauplan (Vers/Pre/Chorus/Bridge, Bibel-/Weisheits-Mix)
    channel-setup.md              YouTube-Kanal Schritt für Schritt aufsetzen
  tools/                          die Maschine (retime.js, verify-song.js, build-anim.js,
                                  generate-image.js, lib/lyrics.js)
  templates/
    song.json.template
    youtube-description.template
    img-jobs.template
  assets/
    logos/   die designten Logos + Erklärung
    banner/  Kanal-Banner in 2560x1440 (Safe-Area)
    fonts/   die Marken-Schriften
    styles/  Referenz-Bilder (Golden-Oil etc.)
```

Für DICH (Ebene B) ist `profile/profile.md` schon mit Draw Near / Marten's Songs ausgefüllt, und Module
01-03 sind übersprungen. Für den Kunden sind sie leer und die Reise füllt sie.

---

## 3. Wo dein bisheriges Material hingehört (nichts geht verloren)

| Was du schon hast | Status | Landet in |
|---|---|---|
| Player: Wort-für-Wort, Play, Übersetzung, Erklärung, mobil/desktop | fertig | `tools/build-anim.js` + `modules/05-songs.md` |
| Whisper/Timing/verify-Pipeline (das "2 Zeilen + Übersetzung drunter") | fertig | `tools/` + `modules/05-songs.md` |
| Bild-Prompts The Sower, gemalter Look, Drift/Pan-Bewegung | fertig | `reference/branding-spec.md` + `modules/06-images.md` |
| Thumbnail-System (Anatomie + Nano Banana Pro) | fertig | `modules/04-thumbnails.md` |
| SEO / echte Nachfrage (reichweite-playbook) | fertig | `reference/seo-playbook.md` + `modules/02-niche.md` |
| Kanalname, Tagline, Beschreibung, Banner-Sets, Logos (6 Richtungen) | im YOUTUBE.md + branding.html | `modules/03-branding.md` + `assets/` |
| Beschreibungs-Vorlage + KI-Hinweis | fertig | `templates/` + `modules/07-publish.md` |
| Songtext-Struktur + Suno-Style | TEILS (dein "Give It All Away"-Muster) | `reference/lyric-structure.md` + `reference/suno-styles.md` **neu** |
| Typografie fürs Thumbnail/Banner (Schrift-Regeln) | **LÜCKE, die du gesehen hast** | `reference/branding-spec.md` ergänzen **neu** |

Die Lücke "Fonts": BRANDING.md regelt Cormorant Garamond + Inter für die Seite, top-thumbnail nennt
condensed Sans (Anton/Archivo Black) fürs Thumbnail, aber es gibt keine zusammenhängende Kanal-Typografie.
Das füllen wir in `branding-spec.md`.

---

## 4. Die zwei Reisen im Detail

**Ebene A, Kunde (einmalig, von null):**
1. `Hey` -> Onboarding (Name, was bewegt dich, Hobbys).
2. Nische finden (verbindet Interessen + echte YouTube-Nachfrage).
3. Branding (Name, Logo wählen "gefällt dir das? willst du ändern?", Banner, Fonts, Beschreibung,
   Kanal aufsetzen).
4. Erstes Thumbnail-Muster.
5. Erster Song (Pipeline).
6. Upload + SEO.
   Alles wird in `profile.md` gespeichert, der Kunde hat danach SEIN individualisiertes System.

**Ebene B, du (jeder Song, im Dauerbetrieb):**
1. MP3 + Lyrics ablegen, "Ich lege los" (oder ein Trigger).
2. Whisper/retime -> Text + Timing.
3. Prüfen (verify-song) -> Text == Lyrics, Timing monoton, 2 Zeilen + Übersetzung drunter (der Standard,
   der jetzt bei allen 3 Songs gleich ist).
4. Bilder erzeugen (gemalter Look, Bewegung).
5. Bauen (dein Player) + selbst durchspielen.
6. Thumbnail + Beschreibung/Tags/Kapitel.
   Du wirfst 5-7 Songs rein, die Maschine weiß bei jedem genau, welcher Schritt dran ist.

---

## 5. Wie man so einen Ordner verkauft (die Profi-Wege)

Von einfach zu professionell:

1. **ZIP + Setup-Video (schnellster Start).** Ordner zippen, auf Gumroad oder Lemon Squeezy verkaufen.
   Käufer entpackt, legt den Ordner in sein Claude-Projekt (oder `.claude/skills/`), tippt "Hey". Dazu ein
   kurzes "So richtest du Claude ein"-Video. Genau das steht schon als Plan im WORKLOG ("Skill-Datei +
   Set-up-Videos = fast Plug-and-play").
2. **GitHub-Template-Repo.** Käufer bekommt Zugriff und klont/lädt es. Updates pushst du, er zieht sie.
   Wirkt technischer, gut für Tech-affine.
3. **Claude Code Plugin (am professionellsten).** Den Ordner als echtes Plugin verpacken
   (`.claude-plugin/`), installierbar per `/plugin`. Höchste Politur, aber erst sinnvoll, wenn das System
   erprobt ist.

**Empfehlung:** Start mit Weg 1 (ZIP + Video + Warteliste, die du schon hast), später Weg 3, wenn validiert.
Der Kurs "The Sower System" ist die Hülle: Verkaufsseite (hast du) -> Käufer bekommt den Ordner + die Videos.

**Zum Namen:** Du hast "sourcestem/powersystem" überlegt. Ich empfehle, bei **The Sower System** zu bleiben,
weil Marke, Landingpage und Claim ("Scatter the seed. Reap the channel.") schon stehen. Der Einstieg bleibt
warm und einfach: der Nutzer sagt "Hey".

---

## 6. Empfohlene Baureihenfolge

1. **Diese Skizze abnehmen** (du sagst, was rein/raus soll).
2. **Ebene B bauen** (dein Studio-Flow als ein Ordner + ein Einstieg). Du brauchst es sofort für die Songs,
   und es ist der erprobte Kern des Produkts. Hier liegt schon fast alles (tools + neuer-song + branding).
3. **Suno-Style + Lyric-Struktur festschreiben** (`reference/`), damit dein Song-Vorbau reproduzierbar ist.
4. **Ebene A generalisieren:** Onboarding, Nische, Branding-Reise als Module obendrauf, Profil-Datei, leere
   Marke. Das ist der Schritt vom "für mich" zum "verkaufbar".
5. **Verpacken** (ZIP + Setup-Video) und an die Warteliste.

---

## 7. Offene Entscheidungen (brauche ich von dir)

1. **Name + Trigger:** "The Sower System" behalten? Einstieg per "Hey" (warm) oder zusätzlich ein `/start`
   als Absicherung?
2. **Reihenfolge bestätigen:** Erst Ebene B (dein Flow, sofort nutzbar), dann Ebene A (Kundenreise)? Ich
   empfehle ja.
3. **Wo soll der echte Skill-Ordner leben?** Vorschlag: ein eigener, sauberer Ordner (eigenes Repo später),
   getrennt von "Marten's Songs", damit das Produkt portabel ist. Bis dahin bauen wir die Skizze und die
   Referenz-Texte hier in `youtube/sower-system/`.
4. **Suno-Style:** Schick mir den Style, den du im Chat trainiert hast, dann wird er Teil von
   `reference/suno-styles.md` (Simple Core + Detailliert).
```
