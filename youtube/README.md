# youtube/ - der Kanal-Ordner (alles zum YouTube-Kanal an einem Ort)

Der Kanal hat zwei Jobs. Danach ist dieser Ordner sortiert:

- **MARKE - wer der Kanal ist:** `brand.md` (Name, Versprechen, Look, Logos, Banner, Typografie),
  visuell im Mockup `branding.html` (alt: `branding-archiv.html`).
- **VEROEFFENTLICHEN - was pro Song rausgeht:** `publish-playbook.md` (Titel, Beschreibung, Tags,
  Kapitel, Thumbnail, Render, Upload) + `description-template.md` (der Beschreibungstext).

Dazu:
- `reichweite/` - SEO + echte Nachfrage (das Playbook, warum welche Titel/Themen).
- `styles/` - Bild-Stil-Referenzen. `faces/` - Thumbnail-Gesichter. `thumbs-ai/` - generierte Thumbnails.
- `sower-system/` - der verkaufbare Kurs-Skill. **GEPARKT** (Plan in `sower-system/blueprint.md`).

Thumbnails baut der Skill `/top-thumbnail`. Songs baut der Skill `/neuer-song` (Engine im Hauptordner).
Gesamtkarte: `../README.md`.
