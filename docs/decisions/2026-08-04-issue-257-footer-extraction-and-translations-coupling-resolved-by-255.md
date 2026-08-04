# Decision: Ticket 5 (`footer/` extraction) — TRANSLATIONS coupling already resolved, AC1–AC5 confirmed as posted, innerHTML preserved for `&copy;`

**Issue:** [#257](https://github.com/mekhal/aidlc-radio-calico/issues/257) (Ticket 5, the last of the `index.html` component-extraction story, #245)
**Decided by:** @mekhal, 2026-08-03/2026-08-04

## Decision

1. **The `TRANSLATIONS` closure-coupling risk flagged at step 2's first `@claude review` turn
   needed no design decision** — by the time step 2's AC was actually drafted, #255 (merged in the
   interim) had already promoted `TRANSLATIONS` from a private `let` inside `album-promo.js`'s IIFE
   to the shared global `ALBUM_PROMO_TRANSLATIONS` (`shared/translations.js:28`), and `buildFooter`
   already read it that way. `footer/footer.js` reads the global directly, the same pattern
   `menu/menu.js` already established — no "expose as global vs. pass explicitly" choice was needed
   because #255 had already made that choice for the whole file.
2. **AC1–AC5 were verified against the live codebase a second time, immediately before writing the
   Test PR**, in response to the human's explicit "approved sorry please verify AC first" — not
   re-derived from scratch, but every claim (line ranges, single call site, CSS selector list, wiring
   pattern) was independently re-checked, since #255/#256 had shifted `album-promo.js`'s line numbers
   twice already since the AC was first discussed.
3. **`copy.innerHTML = ...` was kept as `.innerHTML`, not normalized to `.textContent`, when moving
   `buildFooter` into its own file.** The copyright string in both `i18n/album-promo-en.json` and
   `i18n/album-promo-th.json` contains a literal `&copy;` HTML entity, so switching to `.textContent`
   would have silently changed the rendered footer text from `©` to the literal string `&copy;` — a
   real visual regression that AC4 ("no behavior/visual change") explicitly forbids. The Test PR's
   assertion was written against `.innerHTML` specifically to catch this rather than let it slip
   through unnoticed.
4. **Followed the #253/#254/#255/#256 precedent of a separate Test PR → Code PR pair**, rather than
   waiving the Test PR at step 3 — this was the default proposed by the agent and left unchallenged
   by the human, consistent with every other ticket in this series.

## Why

Decision 1 means the risk raised two turns earlier resolved itself as a side effect of #255 landing,
not because #257 made its own coupling decision — worth recording so a future reader doesn't assume
#257 independently solved a design problem that #255 actually solved.

Decision 2 is a direct response to a human instruction ("verify AC first") rather than a judgment
call, but it's recorded because it caught nothing wrong — the AC held up exactly as drafted, which is
itself useful signal that the earlier verification passes (across the `@claude review`/`@claude
approved` turns) were already accurate.

Decision 3 is the one concrete correctness catch specific to this ticket: a naive "extract the
function" pass could have introduced a visual regression (`&copy;` literal instead of `©`) that no
AC bullet named explicitly — it only surfaces from reading the actual translation JSON files, not
from the draft scope's prose.

Decision 4 keeps this ticket consistent with its three siblings, so the human doesn't have to
re-decide the Test-PR-vs-waiver question for every ticket in the same series.

## Impact

- `footer/footer.js`, `footer/footer.css`: new files (Test PR #274 scaffolding + Code PR #275
  implementation, both merged).
- `album-promo.js`: loses `buildFooter` (previously lines 704-727); its call site
  (`page.appendChild(buildFooter(state))`) is unchanged, now resolves to the global from
  `footer/footer.js` (Code PR #275, merged).
- `album-promo.css`: loses `.chloe-footer`/`.chloe-footer__disclaimer`/`.chloe-footer__copy`
  (previously lines 444-461) (Code PR #275, merged).
- `index.html`: added `<link rel="stylesheet" href="footer/footer.css">` and
  `<script src="footer/footer.js">`, following the #254/#255/#256 load-order pattern (Code PR #275,
  merged).
- `tests/footer/footer.test.js`, `tests/test-runner.html` (registration): new test file (Test PR
  #274, merged), including the `.innerHTML`/`&copy;`-preservation assertion from decision 3.
- This closes out the last of the four sibling component tickets (#254/#255/#256/#257) under the
  parent story #245.
