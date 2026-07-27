# Decision: Ticket C Music Player Card — AC1/AC2/AC4/AC5/AC6 amendments, React DOM controls, Test PR re-waived

**Issue:** [#157](https://github.com/mekhal/aidlc-radio-calico/issues/157)
**Decided by:** @mekhal, 2026-07-24

## Decision

Ticket C's originally-locked AC (from #150) was revised at this issue's step-3 gate:

1. **AC1 amendment — no new `<img id="album-cover">` inside the card; the id stays on the existing
   Hero portrait image instead.** The original AC asked for a 3D "diamond" CSS placeholder wrapping
   its own `#album-cover` element. Since Ticket B (#156) had already shipped a real cover-art image
   in the Hero's left column, the human cut the diamond-placeholder design entirely and moved the
   `#album-cover` id onto that existing Hero portrait (`buildHero()` in `album-promo.js`) rather than
   creating a second, redundant image element. This was flagged before implementing because Ticket
   D's already-locked AC2 (#158) depends on `#album-cover` existing as a hook — resolved by keeping
   the id, just relocating it, so Ticket D's plan needed no change.
2. **AC2 amendment — analytics hooks prepared, no analytics service wired.** `#track-title` /
   `#track-artist` get a `data-analytics-id` attribute and a `dispatchTrackAnalyticsEvent()` helper
   that fires a `CustomEvent("album-promo:track-metadata-view")` on `document`. No GA/GTM/Segment
   dependency added — the repo has none, and adding one would conflict with the CDN-only stack
   decision (#20) without an explicit request to do so.
3. **AC4/AC5 amendment — playback controls (play/pause, timer, volume) built as a React DOM
   island**, using `React.createElement` + hooks loaded via CDN `<script>` (no JSX/Babel/bundler),
   mounted with `ReactDOM.createRoot` into the node the vanilla DOM builder already creates. This
   extends, to Ticket C's controls, the same one-off React-DOM exception to the vanilla-JS/jQuery
   stack decision (#20) that was already recorded for Ticket D's cover-art widget in
   `docs/decisions/2026-07-24-ticket-d-cover-art-react-dom-stack-and-polling-interval.md` — the page
   now has two parallel render systems (vanilla DOM builder for header/hero/footer, React islands for
   interactive widgets), which was called out explicitly rather than left implicit.
4. **AC6 confirmed as an unwritten repo-wide rule, not a per-ticket AC to restate** — scope stays
   `album-promo.html` / `album-promo.css` / `album-promo.js` (+ its own `i18n/album-promo-*.json`
   files) only; no changes to `index.html`, `app.js`, or `styles.css`.
5. **Test PR re-waived.** The React state introduced by (3) (`isPlaying`, `volume`) is real local
   component state, unlike the original "static mockup, nothing to test" framing from #150 — flagged
   as a material change to the original waiver's premise before accepting the human's explicit
   re-waiver, rather than silently carrying the old waiver forward.

## Why

`docs/decisions/2026-07-20-review-before-over-implementing.md`'s "ask when in doubt" principle
applied to each point that touched an already-locked cross-ticket AC (point 1) or a previously-waived
process step whose premise had changed (point 5) — both were surfaced as explicit questions rather
than assumed, and only implemented after the human's follow-up `@claude approved` with concrete
answers.

## Impact

- `album-promo.js`: `#album-cover` id lives on the Hero portrait (`buildHero()`), not a new element;
  `#track-title`/`#track-artist` carry `data-analytics-id` + `dispatchTrackAnalyticsEvent()`; new
  `PlayerControls` React component (`React.createElement`, hooks, `ReactDOM.createRoot`).
- `album-promo.html`: adds React 18 / ReactDOM 18 CDN `<script>` tags (see the follow-up CDN/drift
  decision doc for why the provider and a second file both needed later fixes).
- `i18n/album-promo-en.json` / `i18n/album-promo-th.json`: new `playerLoading` key.
- Code PR: [#183](https://github.com/mekhal/aidlc-radio-calico/pull/183) (merged) — Test PR skipped
  per the re-waiver above.
- Cross-reference: an untagged comment was left on [#158](https://github.com/mekhal/aidlc-radio-calico/issues/158)
  noting the `#album-cover` id's relocation to the Hero portrait, since Ticket D's plan references it.
