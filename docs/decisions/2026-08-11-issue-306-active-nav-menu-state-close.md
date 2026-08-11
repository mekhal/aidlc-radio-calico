# Issue #306 close — active nav menu state

## Context

Issue #306 asked that the nav item matching the currently-open page be visually distinguished
from the others ("Active") and not clickable, per @mekhal's screenshot showing all four
`chloe-nav` links (Home / About / What's this / Contact) rendered identically with none marked
current.

The loop ran cleanly end to end: step 2 plan + AC (posted 2026-08-10), Test PR
[#310](https://github.com/mekhal/aidlc-radio-calico/pull/310) (`tests/menu/menu-active-state.test.js`,
step 4), Code PR [#311](https://github.com/mekhal/aidlc-radio-calico/pull/311) (`menu/menu.js` +
`menu/menu.css`, step 6) — both merged into `develop`. @mekhal scored this close
`coding 5 satisfied 5` with no reason attached (a clean run, unlike [[2026-08-11-issue-305-branch-hygiene-fresh-cut-from-develop]]'s 4/5, where the friction was branch hygiene, not the feature work).

Two close-comment misfires happened on this thread before the real close (a `coding 4 satisfied 5`
score that actually belonged to issue #305, then a correction) — those are already fully recorded
against #305, not repeated here.

## Decision

1. **Active detection stays generic (hash-vs-`href` comparison), not hardcoded to `#home`.**
   `getActiveNavKey()` compares `window.location.hash` (defaulting empty to `#home`, since that's
   `index.html`'s real landing state) against each `NAV_HREFS` entry, so About/What's this/Contact
   will correctly activate once those become real pages — no rework needed then, even though only
   Home resolves to content today.
2. **Reuse the existing `--chloe-pink-deep` token for the active style instead of introducing a
   new one.** That token already has a dark-theme override and is already used for `:hover`, so
   the active-state color needs no new design-token work — consistent with the reuse-first
   guidance in `docs/knowledge-asset/published/theme-token-background-audit.md`.
3. **"Not clickable" is implemented as a no-op click (`preventDefault()`) with `href` left intact
   and `aria-current="page"` added, not a DOM swap to `<span>`.** This kept the existing
   `tests/menu/menu.test.js` / `tests/menu/menu-header-integration.test.js` assertions valid
   unmodified and kept the Test PR's contract (native `window.location.hash` /
   `Event.defaultPrevented`, no stubbed API) satisfied by the Code PR, per
   `docs/knowledge-asset/published/code-pr-implements-test-pr-contract.md`.
4. **Test PR was not skipped.** The step-2 plan flagged this as a well-scoped, easily-isolated
   unit (pure hash-match function + DOM assertion) and @mekhal did not waive it — Test PR #310
   landed first, Code PR #311 implemented against its contract.

## Non-decision

No change to `CLAUDE.md`, no new design tokens, no scope beyond the four existing nav links
(About/What's this/Contact still have no real destination page — building those remains explicitly
out of scope, as stated in the original plan's AC #4).
