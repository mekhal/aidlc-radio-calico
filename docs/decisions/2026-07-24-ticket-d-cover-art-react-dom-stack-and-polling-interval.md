# Decision: Ticket D cover-art widget — React DOM stack exception + 10s polling interval

**Issue decided on:** [#156](https://github.com/mekhal/aidlc-radio-calico/issues/156) (Ticket B thread)
**Scoped to / cross-referenced on:** [#158](https://github.com/mekhal/aidlc-radio-calico/issues/158) (Ticket D)
**Decided by:** @mekhal, 2026-07-24T14:27

## Decision

A request for a live-updating cover-art component (`useState`/`useEffect`, polling a metadata API,
`decoding="async"`, `max-width: 370px`, `aspect-ratio: 1/1` + `object-fit: cover`) was raised on
Ticket B's thread (#156), flagged there as out of scope for Ticket B (a static hero image, no
metadata API in the repo) and as a conflict with the repo's vanilla-JS-only tech-stack decision
(`docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md`, issue #20). Per
`docs/decisions/2026-07-17-cross-reference-out-of-scope-findings-on-related-tickets.md`, it was
cross-referenced as a plain, untagged comment on Ticket D (#158), which already owns the
metadata-fetch/cover-art scope.

Two decisions were made and recorded there for whoever picks up Ticket D's step 3:

1. **Stack: React DOM (hooks via `React.createElement`, no JSX, no npm/bundler)** — a one-off,
   explicit exception to the repo's vanilla-JS/DOM-construction pattern (issue #20;
   `buildHeader`/`buildSidebar`/`buildHero` in `album-promo.js`) for this specific component. Should
   be explicitly re-confirmed at Ticket D's own step-3 gate rather than assumed to extend to the
   rest of the page.
2. **Polling interval: 10 seconds** (not the originally-suggested 5s), via `setInterval` with a
   cleanup function.

No code was written on Ticket B (#156) for this — it is entirely deferred to Ticket D, which has
not started its own loop yet.

## Why

`CLAUDE.md`'s "missed functionality becomes a NEW issue" rule, with the cross-reference exception
for scope that's already owned by a sequenced sibling ticket under the same parent story. The
stack question was raised rather than assumed because it's a real, consequential deviation from a
locked repo-wide decision (#20), not a local implementation detail.

## Impact

- No file changes on #156.
- Comment on [#158](https://github.com/mekhal/aidlc-radio-calico/issues/158#issuecomment-5070960818)
  carries the decision forward; not tagged `@claude` there — the human starts that ticket's loop
  when ready.
- Ticket D's own step-3 plan should treat "React DOM, no JSX" and "10s polling" as pre-confirmed
  inputs rather than open questions, but should still re-confirm the metadata API endpoint, which
  was never specified (no such endpoint exists yet in this repo — only the HLS audio stream URL in
  `RadioCalicoStyle/stream_URL.txt`).
