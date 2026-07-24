# Decision: Ticket B hero section — DOM-construction approach, AC rewording, CloudFront image

**Issue:** [#156](https://github.com/mekhal/aidlc-radio-calico/issues/156)
**Decided by:** @mekhal, 2026-07-24

## Decision

1. **AC1/AC3 amendment — hero built via DOM construction in `album-promo.js`, not static HTML in
   `album-promo.html`.** Ticket B's originally-approved AC1 implied hard-coded markup
   (`album-promo.html` gets a Bootstrap `row` with two `col-lg-6` columns). Ticket A (issue #155)
   shipped in the meantime and established a different pattern: the whole page renders from
   `initAlbumPromo()` in `album-promo.js` into a single `#album-promo-root` node
   (`buildHeader`/`buildSidebar`/`buildFooter`), with `index.html` and `album-promo.html` both just
   loading that script. Flagged as a real AC conflict before writing any code; the human confirmed
   option (a) — build the hero the same way, via a new `buildHero(state)` function called from
   `buildMain(state)` — for consistency with what was already merged, rather than mixing a
   static-HTML hero into an otherwise JS-rendered page.
2. **AC3 reworded — right column exposed as a DOM handle, not just "reserved."** `buildHero`
   exposes the empty player-card column as `state.heroPlayerSlot` (plus
   `data-testid="hero-player-slot"`) so Ticket C's future player-card code can
   `state.heroPlayerSlot.appendChild(...)` directly instead of querying the DOM.
3. **AC5 satisfied automatically.** Since both `index.html` and `album-promo.html` already load the
   same `album-promo.js`/`album-promo.css` (per Ticket A), Ticket B needed no HTML file changes at
   all — only `album-promo.js` and `album-promo.css`.
4. **Hero portrait image swapped from the Ticket B placeholder to the real album cover** —
   `https://images.unsplash.com/photo-1517841905240-472988babdf9...` (a placeholder chosen because
   no image was specified in #150 or this ticket) replaced with
   `https://d3d4yli4hf5bmh.cloudfront.net/cover.jpg` at the human's request. Requested and approved
   after Ticket B's Code PR (#175) had already merged, so this shipped as **step-7 rework**
   (`CLAUDE.md`) — a new commit + new Code PR (#177), not a reopened loop.

## Why

(1)-(3): following an already-merged sibling ticket's established rendering pattern was judged more
valuable than literal AC wording written before that pattern existed — confirmed explicitly rather
than assumed, per `docs/decisions/2026-07-20-review-before-over-implementing.md`. (4): cosmetic
placeholder swap requested after merge; no AC conflict, straightforward rework.

## Impact

- `album-promo.js`: `buildHero(state)` (new), `buildMain(state)` now threads `state` through.
- `album-promo.css`: `.chloe-hero__portrait` (`clip-path` silhouette, `object-fit: cover`,
  `min-height: 60vh`).
- PRs: [#175](https://github.com/mekhal/aidlc-radio-calico/pull/175) (merged, initial hero),
  [#177](https://github.com/mekhal/aidlc-radio-calico/pull/177) (merged, CloudFront image rework).
- Ticket B's issue body AC1–AC3 text is superseded by this doc and by the human's
  2026-07-24T08:52 approval comment on #156 for anyone reading the issue after the fact; the
  literal AC wording was not edited retroactively.

## Open item at close (not decided)

A later review round on #156 (2026-07-24T13:55) asked for the hero image's CSS/layout to be
reworked toward a `radio-calico.com`-style boxed/capped image (`max-width` ~300–400px, no
full-bleed, dropping the `clip-path` silhouette). A concrete adjusted-CSS proposal and clarifying
questions were posted in reply, but the human never confirmed a direction before this issue closed
— see the close comment on #156 for the flag and the open questions carried forward.
