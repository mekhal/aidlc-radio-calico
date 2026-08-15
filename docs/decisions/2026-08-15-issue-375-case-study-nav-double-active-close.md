# Issue #375 close — Case Study nav double-active bug

## Context

Issue #375 reported that opening `case-study.html` directly showed **both** Home and Case Study
boxed as active in the nav bar, per @mekhal's screenshot. Root cause: `menu/menu.js`'s
`getActiveNavKeys()` defaulted an empty `window.location.hash` to `"#home"` unconditionally — a
holdover from before Case Study moved off `index.html` onto its own standalone page in
[[2026-08-13-issue-323-case-study-highlight-cards-close]] (#323). `case-study.html` never sets a
hash either, so the stale default lit up Home at the same time `isCaseStudyActive()` independently
lit up Case Study.

The loop ran cleanly end to end:

1. `@claude review` — root-caused the bug directly from `menu/menu.js:74-77`, included a
   before/after mockup of the nav bar (per
   `docs/knowledge-asset/published/review-ui-changes-with-mockup.md`), and proposed two
   functionally-equivalent fixes.
2. `@claude approved AC` — Test PR [#376](https://github.com/mekhal/aidlc-radio-calico/pull/376)
   added the real-world trigger case (empty hash + `case-study.html` path) to
   `tests/menu/menu-case-study-link.test.js`, which the existing suite didn't cover (it only
   exercised an explicit non-home hash). Merged.
3. `@claude approved` — Code PR [#377](https://github.com/mekhal/aidlc-radio-calico/pull/377)
   implemented the fix. Merged.
4. `@claude close coding 5 satisfied 5 เพิ่มการตัดสินใจนี้เข้า knowledge ด้วย` — scores given
   directly, plus an explicit ask to capture this as reusable knowledge.

## Decision

1. **Fix picked "option 1" (gate the `"#home"` fallback on `!isCaseStudyActive()`) over "option 2"
   (a more general "am I on index.html" check using the existing
   `window.__MENU_CURRENT_PATH__ || window.location.pathname` seam).** Both satisfy the AC; no
   preference was stated at approval, so the agent went with the smaller, more targeted change
   rather than generalizing preemptively — consistent with "don't design for hypothetical future
   requirements" until a second standalone page actually exists.
2. **Test PR added the case to the existing `menu-case-study-link.test.js` file** rather than a new
   file — the case is a variant of that file's existing "independent of the other items' hash-based
   active state" coverage, just with the hash empty instead of set to `"#about"`.
3. **Verification of the Code PR against the full suite was manual, not automated** — headless
   Chromium execution (`chromium --headless --dump-dom` against `tests/test-runner.html`) is not in
   this environment's `--allowedTools`, so the agent traced the fix by hand against all 12 existing
   cases across both nav test files instead of running them. Flagged in the Code PR comment as an
   `--allowedTools` gap rather than silently skipping verification.
4. **New skill candidate drafted at close, per @mekhal's explicit request** ("เพิ่มการตัดสินใจนี้เข้า
   knowledge ด้วย") — see the close comment for the proposed `standalone-page-nav-fallback-audit`
   `SKILL.md` content, offered for human add/update/skip per the skill capture flow, not written
   unprompted.

## Non-decision

Option 2 (the general path-based fallback gate) was not implemented — if a second standalone page
is added later, `getActiveNavKeys()`'s fallback will need the same kind of per-page gate again
unless that generalization is done at that time. This is an accepted tradeoff, not an oversight;
captured as the reusable audit step in the proposed skill instead of pre-building the general
mechanism now.
