# Decision: Ticket 4 (`sidebar/` extraction) — dropped test-rename bullet, `.chloe-switch*` co-location, and deferred CSS-token cleanup to a new ticket

**Issue:** [#256](https://github.com/mekhal/aidlc-radio-calico/issues/256) (Ticket 4 of the `index.html` component-extraction story, #245)
**Decided by:** @mekhal, 2026-08-03

## Decision

1. **The draft issue's "~5 misnamed test files" bullet was dropped from scope.** Reading
   `footer-github-linkedin-links.test.js`, `footer-lint-report-link.test.js`,
   `footer-security-report-link.test.js`, `footer-test-report-button.test.js`, and
   `theme-toggle-footer.test.js` showed they all assert on `app.js`'s own, separate `<footer>`
   (testids `footer-*`) via `loadApp()` — none of them touch `album-promo.js`'s `FOOTER_LINKS`/
   `buildSidebar()` (testids already prefixed `sidebar-footer-*`). No test file needed renaming;
   confirmed independently across two `@claude review` turns before the plan was drafted.
2. **`FOOTER_LINKS` renamed to `SIDEBAR_LINKS`** (now `sidebar/sidebar.js:21`) since it only ever
   rendered inside `buildSidebar()`, never `buildFooter()` — the name was misleading on its own
   merits, independent of decision 1.
3. **`.chloe-switch*` CSS (styles `buildThemeToggle`/`buildLanguageToggle`) moved into
   `sidebar/sidebar.css` alongside `.chloe-sidebar*`**, rather than staying behind in
   `album-promo.css`, since both toggle-builder functions moved into `sidebar/sidebar.js` in the
   same ticket. Confirmed via grep that nothing outside `buildSidebar()`'s call chain uses either
   ruleset.
4. **`--chloe-sidebar-w` and `--chloe-sidebar-bar-h` stay declared in `album-promo.css`'s `:root`**,
   not moved into `sidebar/sidebar.css`, because both are read by code on *both* sides of the split:
   `.chloe-sidebar`/`.chloe-sidebar` mobile rules (moved into `sidebar.css`) and `.chloe-page`'s
   `padding-left`/mobile `padding-bottom` (staying in `album-promo.css`). `sidebar.css` reads both
   via `var()` without redeclaring them — CSS custom properties cascade globally from `:root`
   regardless of which stylesheet declares them, given both load on the same page.
5. **A general "extract root CSS custom properties into a shared tokens file" cleanup is deferred to
   a new ticket, not folded into #256.** The human's instruction was explicit: "create task for
   cleanup later." The finding (both `logo/logo.css` and `menu/menu.css` already read `--chloe-*`
   variables declared in `album-promo.css`'s `:root`, and `sidebar.css` needs the same) was
   originally raised as an untagged comment on the already-sequenced #258 (final post-split cleanup
   ticket), then formalized as its own ticket, **[#272](https://github.com/mekhal/aidlc-radio-calico/issues/272)**,
   per the cross-reference-out-of-scope-findings convention — with a note on #272 itself flagging
   the possible scope overlap with #258 for the human to resolve.

## Why

Decision 1 keeps the Test PR (step 4) scoped to only what the AC actually needs — writing failing
tests for, or renaming, files that don't exercise the code under test would have been test bloat
with zero coverage benefit.

Decision 3 follows the same "everything exclusively used by the extracted function moves with it"
rule already applied to `buildThemeToggle`/`buildLanguageToggle` themselves (AC1) — leaving their
CSS behind while their JS moves would split a cohesive unit across two files for no benefit.

Decision 4 preserves correctness of the page shell: `.chloe-page`'s layout rules read the same two
variables and are explicitly out of scope for this ticket (they're page-shell CSS, not
sidebar-owned), so removing the `:root` declarations would break `album-promo.css` at runtime.

Decision 5 keeps this ticket's Code PR (#271) reviewable and scoped to the approved AC, rather than
also touching `logo.css`/`menu.css` (outside #256's AC, belonging to already-closed tickets
#254/#255) mid-ticket. It matches this repo's own precedent of landing `shared/` (JS) as its own
ticket (#253) before logo/menu/sidebar built on it, rather than introducing a shared abstraction
mid-way through one component's extraction.

## Impact

- `sidebar/sidebar.js`, `sidebar/sidebar.css`: new files (Test PR #270 scaffolding + Code PR #271
  implementation, both merged).
- `album-promo.js`: loses `buildSidebar`/`buildThemeToggle`/`buildLanguageToggle`/their private
  helpers/`SIDEBAR_LINKS` (previously `FOOTER_LINKS`, lines 13-220); `buildSidebar()`'s call site
  unchanged, now resolves to the global from `sidebar/sidebar.js` (Code PR #271, merged).
- `album-promo.css`: loses `.chloe-sidebar*`/`.chloe-switch*` base + mobile media-query rules;
  `--chloe-sidebar-w`/`--chloe-sidebar-bar-h` custom properties stay in `:root` (Code PR #271,
  merged).
- `index.html`: added `<link rel="stylesheet" href="sidebar/sidebar.css">` and
  `<script src="sidebar/sidebar.js">`, following the #254/#255 load-order pattern (Code PR #271,
  merged).
- `tests/sidebar/sidebar.test.js`, `tests/test-runner.html` (registration): new test file (Test PR
  #270, merged).
- No test files renamed (decision 1) — no changes to `footer-*.test.js`/`theme-toggle-footer.test.js`.
- New ticket [#272](https://github.com/mekhal/aidlc-radio-calico/issues/272): CSS custom-property
  centralization, deferred per decision 5; flagged for possible overlap with #258.
