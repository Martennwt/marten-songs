# YouTube description template

Copy the block under "TEMPLATE" into each video's description and fill the {{...}} fields.
Keep the AI disclosure line, it is required by YouTube for altered or synthetic content
and it builds trust (it is part of staying monetizable in 2026).

---

## AFFILIATE LINKS, the honest status (read once)

I checked this so nothing false ends up in your description.

- **Claude / Anthropic:** there is currently **no public individual affiliate program**.
  Only an enterprise "Claude Partner Network" and an enterprise referral program (one-time fee,
  rates not public). So the "10 to 15 EUR per yearly signup" idea is **not available today**.
  The placeholder `{{AFFILIATE_CLAUDE}}` below is just a normal link for now. The day Anthropic
  opens a real affiliate, you swap that one line and you are done.
- **ElevenLabs (voices):** **real affiliate program**, recurring commission. This is your
  strongest money link. Sign up, then paste your link into `{{AFFILIATE_ELEVENLABS}}`.
- **Gemini / Google AI, OpenAI / Whisper:** no open consumer affiliate, normal links only.

How to wire it: sign up for each program, then do a find-and-replace of the `{{AFFILIATE_*}}`
tokens with your real links. Until then they point to the normal product pages, which is fine.

---

## TEMPLATE

```
{{SONG_TITLE}} . a cinematic, bilingual Scripture song

{{ONE_LINE_HOOK}}
The lyrics light up word by word in time with the music, with a translation underneath.
Based on {{SCRIPTURE_REFS}}.

Watch all the songs (full dashboard):
https://martennwt.github.io/marten-songs/

Want to build a channel like this yourself? Join the waitlist for The Sower System:
https://martennwt.github.io/marten-songs/course/

. . . . . . . . . . . . . . . . . . . .

This video was created with AI.
The music, vocals, lyrics, artwork and animation are AI-assisted, produced and arranged by me.

. . . . . . . . . . . . . . . . . . . .

Tools I use to make these (some links support the channel at no cost to you):

- Claude (the studio that builds it): {{AFFILIATE_CLAUDE}}
- ElevenLabs (voices and narration): {{AFFILIATE_ELEVENLABS}}
- Google Gemini (the painted backgrounds): {{LINK_GEMINI}}

. . . . . . . . . . . . . . . . . . . .

Chapters:
00:00 {{CHAPTER_1}}
{{MORE_CHAPTERS}}

If this spoke to you, subscribe and pass it on. The word still needs sowers.

#{{HASHTAG_1}} #faith #worship #scripture #christianmusic #lyricvideo #AImusic
```

---

## Default link values (paste these until you have affiliate links)

- `{{AFFILIATE_CLAUDE}}`     -> https://claude.com/  (or https://www.anthropic.com/claude-code)
- `{{AFFILIATE_ELEVENLABS}}` -> https://elevenlabs.io/  (replace with your affiliate link, this one pays)
- `{{LINK_GEMINI}}`          -> https://gemini.google.com/

## Pinned-comment idea (extra conversion)

> Made entirely with AI, start to finish. I am putting the whole system into a short course,
> The Sower System. Join the waitlist here: https://martennwt.github.io/marten-songs/course/
