# Decision: `--chloe-*` CSS custom-property extraction into `shared/tokens.css` — kept separate from #258, Test PR waived, one extra call site fixed beyond the named AC

**Issue:** [#272](https://github.com/mekhal/aidlc-radio-calico/issues/272)
**PR:** [#277](https://github.com/mekhal/aidlc-radio-calico/pull/277) (Code PR, merged; Test PR waived — see decision 2)
**Decided by:** @mekhal, 2026-08-04

## Decision

1. **Kept as its own ticket, not folded into #258.** #258 is dead-code removal (the old
   `buildHeader`/`buildSidebar`/`buildFooter` implementations and their CSS); this ticket extracts
   still-*live* `:root` tokens every component actively reads via `var()` — a different concern.
   Confirmed via review turn before AC was drafted; @mekhal did not object, so this stood by default.
2. **Test PR (step 4) waived, per @mekhal's explicit `@claude approved skip to Code PR`.** Neither
   `tests/load-album-promo.js` nor `tests/load-test-report-dashboard.js` (the fetch/inject harness
   behind `tests/test-runner.html`) loads `<link>`/CSS at all — only `<script>` sources — so a
   conventional failing-test-first Test PR wasn't meaningful against AC1-5, which are all CSS
   declarations/load-order/visual-parity claims. AC6 ("no `.js` file changes") is the only AC a JS
   test could even observe, and it's a negative assertion. In place of a Test PR, the Code PR turn
   documented manual verification: byte-for-byte diff of the moved `:root`/dark-theme blocks against
   `shared/tokens.css`, confirmed load order in every consumer HTML file's `<link>` sequence, and
   re-grepped `album-promo.css` for leftover `:root`/`data-chloe-theme` declarations.
3. **`album-promo.html` fixed in the same Code PR, beyond the two files the approved AC named
   (`index.html`, `tests/test-report-dashboard.html`).** Applying the
   [`shared-extraction-call-site-audit`](../knowledge-asset/published/shared-extraction-call-site-audit.md)
   skill's call-site grep (not just the files the issue body/AC named) at Code PR time surfaced a
   third consumer: `album-promo.html`, a legacy/reference-only file (issue #159, not deployed via
   GitHub Pages) that still loads `album-promo.css` directly. Without the same one-line
   `shared/tokens.css` link added ahead of it, this file would have silently lost all `--chloe-*`
   styling — a direct violation of AC5's "no visual/behavioral change" for that file, not new
   functionality. Treated as completing the same audit the AC already committed to, not as
   over-implementing beyond the approved scope.

## Why

Decision 1 avoids conflating "extract live tokens other components depend on today" with "delete
code nothing depends on anymore" — folding them would have made #258's already-sequenced scope
(dead-code removal + full regression pass) harder to review by mixing an active-dependency move into
a cleanup pass.

Decision 2 follows the same reasoning CLAUDE.md gives for waiving a Test PR: this step was "genuinely
hard to test" in isolation given the existing harness's structural inability to load CSS, and the
waiver was the human's explicit call at the gate, not the agent's — the agent only proposed it.

Decision 3 is the same judgment call already exercised once earlier in this same ticket (the AC-draft
turn caught `tests/test-report-dashboard.html` the same way) — a second application of a skill this
ticket had already committed to using, applied at the point (Code PR implementation) where the full
set of `album-promo.css` consumers becomes concretely visible via grep, not a new decision to
re-litigate.

## Impact

- `shared/tokens.css`: new file — `:root` (10 custom properties) + `[data-chloe-theme="dark"]`
  override, moved verbatim from `album-promo.css` (Code PR #277, merged).
- `album-promo.css`: loses `:root`/`[data-chloe-theme="dark"]` blocks; stale comment at the old
  location updated to point at `shared/tokens.css` (Code PR #277, merged).
- `index.html`, `tests/test-report-dashboard.html`, `album-promo.html`: each gained
  `<link rel="stylesheet" href=".../shared/tokens.css">` ahead of `album-promo.css` (Code PR #277,
  merged; `album-promo.html` per decision 3).
- No `.js` file changed (AC6).
- No Test PR opened for this ticket (decision 2) — Code PR #277 carries the documented manual
  verification in place of failing tests.
