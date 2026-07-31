# Decision: "Now Playing" widget replaces the static "Good Vibes" mockup card in place — fictional branding shell kept, data made live

**Issue:** [#150](https://github.com/mekhal/aidlc-radio-calico/issues/150) (parent story)
**Decided by:** @mekhal, 2026-07-23T14:54:31Z (step-3/step-2 re-scope, `@claude approved`)

## Decision

The Music Player Card's original AC (locked 2026-07-23T09:22Z) was a fully static mockup showing a
fictional artist ("Chloe") and a fictional track ("Good Vibes"), with placeholder cover art. When
the human later asked for a "Now Playing" widget backed by the real
`https://d3d4yli4hf5bmh.cloudfront.net/metadatav2.json` + `cover.jpg` endpoints (2026-07-23T14:45Z),
two ways to reconcile this with the existing static card were on the table:

1. Add the live-data widget **alongside** the static "Good Vibes" card as a separate element, or
2. Have the live-data widget **replace** the static card's content in place.

The human chose **option 2, explicitly**: "ใช้ข้อมูลจริงแทนที่การ์ด 'Good Vibes' เดิมไปเลยครับ ไม่ต้องทำแยกเป็นคนละ widget" —
real data replaces the card outright, no separate widget. Branding was kept deliberately
decorative and separate from the data: "ให้คงธีม/ดีไซน์หลัก (สีพาสเทล, ฟอนต์ Serif, โลโก้ Chloe)
ตามโครง UI เดิมไว้ ส่วนข้อมูลเพลง/ปกอัลบั้มให้ดึงจากสตรีมจริงครับ" — the pastel/serif/"Chloe" logo
theme stays as the page's visual identity, while the track name, artist, and cover art shown inside
the player card are whatever is actually playing on the Radio Calico live stream.

## Why

This was flagged as an open "What's unsaid" question at step 2 re-scope: mixing a fictional artist
promo page with a real live-stream data widget could read as two half-finished ideas glued
together. The human's answer resolves it cleanly — "Chloe" is the page's persistent brand/skin
(logo, color palette, typography), not a claim about whose song is playing; the player card itself
is a real Radio Calico now-playing display wearing that skin. Anyone reading `album-promo.js`'s
`buildMusicPlayerCard()`/`renderMeta()` should not be confused by seeing "Chloe"-branded chrome
around genuinely different artist/track names pulled from `metadatav2.json` — that mismatch is
intentional, not a bug or a leftover mockup value.

## Impact

- Ticket D (#158) implemented `renderMeta()` to overwrite the card's title/artist/album/cover
  fields with live poll data, with the static "Good Vibes"/"Chloe" copy only as the pre-fetch
  loading state, never the steady-state content.
- No code or AC in Tickets A/B/E touches this — the branding shell (header logo, sidebar, hero,
  theme) stays exactly as originally scoped; only the Music Player Card's *content* became dynamic.
- Future changes to page branding vs. live-data scope should keep this separation: branding changes
  belong with Tickets A/B/E's scope, data/rendering changes belong with Ticket D's.
