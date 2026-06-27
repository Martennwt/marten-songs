# 00 Setup (allererster Schritt)  [Platzhalter]

Bevor irgendetwas gebaut wird, holt sich der Kunde die Voraussetzungen. Das wird im **VIDEO-GUIDE**
Schritt fuer Schritt gezeigt (Konten anlegen, Keys kopieren, einsetzen):

- **Node >= 18** installieren (die Skripte brauchen das eingebaute fetch).
- **API-Keys anlegen** und in `API keys/` ablegen:
  - OpenAI / Whisper (Timing der Songs)
  - ElevenLabs (Sprach-Narration)
  - Gemini / Nano Banana Pro (gemalte Bilder + Thumbnails)
- **Bild-Generator** holen (externes Tool `generate-image.js`).
- Optional spaeter: **WhisperX** lokal installieren (perfekte Wort-Sync, siehe BRANDING.md).

Diese Tools/APIs bleiben bewusst extern (nicht im Paket gevendort) = dokumentierte Voraussetzungen.
