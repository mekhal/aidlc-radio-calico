# Decision: Now Playing layout reworked to `RadioCalicoLayout.png` reference — white-card wrapper dropped, year/album/quality/rating scope reopened, live time format

**Issue:** [#157](https://github.com/mekhal/aidlc-radio-calico/issues/157)
**Decided by:** @mekhal, 2026-07-27

## Decision

A step-7 (post-merge) request to match `RadioCalicoStyle/RadioCalicoLayout.png` went through two
rounds, because the first round's request would have silently reopened scope that had been
**explicitly cut earlier that same day**:

1. **First round** (09:08–09:15): asked for a general "Radio Calico-style" 2-column layout with
   artist/title/album/year/quality-metadata/rating. Flagged before implementing that four of those
   elements (year, album name, source/stream quality, 👍/👎 rating) had never existed in any locked AC
   across Tickets A-E and had no data hooks anywhere in the codebase. The human's response cut all
   four back out and approved only a hierarchy/placement change (artist rendered larger than track
   title) plus making the Hero portrait a 1:1 square — implemented as a scoped rework
   ([#193](https://github.com/mekhal/aidlc-radio-calico/pull/193), merged).
2. **Second round** (15:00–15:07), same day: the human supplied the actual reference image and asked
   for a fresh gap assessment against it, rather than assuming the first round's cut still applied.
   The image showed Radio Calico's real design does include all four previously-cut elements, plus a
   structural difference from Ticket C's original locked AC1 ("white rounded card wrapping
   everything") — the reference has no card wrapping the text content, only a themed dark box around
   the playback strip. Both were flagged as open questions (reopen the four elements? drop the AC1
   card-wrapper structure?) rather than assumed, given they directly contradicted same-day-earlier
   decisions. The human then explicitly reopened all four elements and confirmed dropping the
   white-card wrapper.

Implemented once approved:

- `#track-year`, `#track-album`, `#track-quality-source`, `#track-quality-stream` — new placeholder
  elements, no live data source (consistent with Ticket D's existing "prepare hooks, no premature data
  binding" pattern).
- "Rate this track" 👍/👎 — **visual-only toggle, no persisted state.** The human's answer ("Yes ... 
  แล้วไป comment ใน Ticket ที่เกี่ยวกับการทำ function ไว้") was read as approving the UI but not
  specifying `localStorage`-backed persistence, so it was built with the same no-real-state treatment
  already established for the playback controls (#150's decision), and the open question of who owns
  real vote-recording logic was cross-referenced rather than assumed.
- `.chloe-player-card` white-card wrapper removed; only the playback-controls strip keeps a boxed
  background, now theme-aware (`--chloe-player-box-bg`/`--chloe-player-box-fg` CSS variables) rather
  than the reference image's literal dark color, per the human's "ปรับให้เหมาะสมกับ theme" instruction.
- Time readout changed from static `00:00 / 00:00` to `<mm:ss elapsed> / ● Live` with a softly
  pulsing red-dot indicator, replacing the two-timestamp file-style format with one that fits a live
  stream (no fixed total duration).

## Why

Two same-day rounds reversed each other's scope decisions (cut, then reopened) because the second
round supplied ground-truth evidence (the actual reference image) the first round didn't have. Per
`docs/decisions/2026-07-20-review-before-over-implementing.md`, both the initial cut and the later
reopening were surfaced as explicit questions rather than the agent picking a side, since guessing
wrong in either direction would have meant reworking committed, already-merged code a third time.

## Impact

- `album-promo.js` / `album-promo.css`: white-card wrapper removed; new placeholder elements +
  `data-testid`s; live-pulse dot keyframes; theme-aware player-box CSS variables.
- `i18n/album-promo-en.json` / `i18n/album-promo-th.json`: new keys for rating labels/aria-labels and
  quality-line labels.
- Code PRs: [#193](https://github.com/mekhal/aidlc-radio-calico/pull/193) (hierarchy/square-art
  rework, merged), [#196](https://github.com/mekhal/aidlc-radio-calico/pull/196) (full reference-image
  rework, merged).
- Cross-reference: untagged comment left on [#158](https://github.com/mekhal/aidlc-radio-calico/issues/158)
  (Ticket D) noting the new `#track-year`/`#track-album`/`#track-quality-*` hooks and that real
  vote-recording logic for the rating UI isn't assigned to any ticket yet.

## Open item at close (not decided)

No ticket currently owns real persistence/logic for the "Rate this track" 👍/👎 control (it is
visual-only, matching the playback controls' no-real-state precedent) — flagged on #158 but not
picked up by any locked AC yet.
