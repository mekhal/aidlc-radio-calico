# Decision: Ticket D — AC6 revision (dual-file markup) + near-real-time polling scope

**Issue decided on:** [#158](https://github.com/mekhal/aidlc-radio-calico/issues/158) (Ticket D)
**Decided by:** @mekhal, 2026-07-28T00:52 (step-3 gate, `@claude approved`)

## Decision

Two open questions raised at the step-3 review gate (2026-07-28T00:46) were resolved before the
Test PR was written:

1. **AC6 revised.** The issue's original AC6 said *"no changes to `index.html` — `album-promo.html`
   + its own `album-promo.css`/`album-promo.js` only"*. This conflicted with the decision already
   recorded on #157 (2026-07-25) that `index.html` — not `album-promo.html` — is the file actually
   served by GitHub Pages. Revised to: any markup change in the Code PR mirrors into **both**
   `index.html` and `album-promo.html`; `album-promo.css`/`album-promo.js` stay this ticket's own
   files (unchanged from the original AC6).
2. **Near-real-time confirmed for all Now Playing data, not just cover art.** The pre-confirmed 10s
   `setInterval` polling exception
   (`docs/decisions/2026-07-24-ticket-d-cover-art-react-dom-stack-and-polling-interval.md`) was
   scoped only to the cover-art image when it was first raised on #156. AC1–AC3 as originally
   written only said "on page load, fetch" (one-shot), which would have meant two independent
   fetch cadences hitting the same `metadatav2.json` endpoint. Confirmed instead: cover art, title,
   artist, and the Recently Played list all refresh together on **one shared** 10s poll loop against
   `metadatav2.json`, made test-overridable via `window.__ALBUM_PROMO_METADATA_POLL_MS__`.

## Why

Splitting one endpoint's data across two independent polling cadences (one-shot vanilla fetch for
text, 10s React poll for the image) would have been an inconsistent architecture with no stated
justification — worth flagging and confirming explicitly rather than assuming either interpretation
silently. The AC6 conflict was a direct fallout of #157's already-decided entry-point change and
needed to be reconciled before step 4's tests could target the right file(s).

## Impact

- `tests/now-playing-polling.test.js` (Test PR #201) asserts the shared-interval behavior.
- Code PR #204 implements the single poll loop and mirrors markup into `index.html` +
  `album-promo.html`.
- Sets precedent for later tickets touching the same page: prefer one fetch/poll loop per data
  source over per-field cadences unless a human explicitly asks for a different one.
