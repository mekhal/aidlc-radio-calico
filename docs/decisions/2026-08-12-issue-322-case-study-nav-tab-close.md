# Issue #322 close — Case Study nav tab placement (AC1, AC5)

## Context

Issue #322 was Ticket 1 of #203 (Case Study tab on the nav bar) — the unblocking, nav-only
ticket: add a `caseStudy` entry between `whatsThis` and `contact` in `menu/menu.js`, with
matching `nav.caseStudy` translations in both `i18n/album-promo-en.json` and
`-th.json`, per the AC already drafted and approved by @mekhal on #203 (see
`docs/decisions/2026-08-11-issue-203-case-study-data-source-and-ticket-breakdown.md`).

The loop ran across three turns:

1. A non-standard gate trigger ("ปรับปรุง Test เดิมให้รองรับ Menu ใหม่") was read as authorization
   for step 4 (write failing tests), since the AC was already approved on the parent issue and
   restated verbatim in this issue's own body — flagged explicitly per
   `docs/knowledge-asset/published/gate-trigger-vs-intent-mismatch.md`. Test PR
   [#326](https://github.com/mekhal/aidlc-radio-calico/pull/326) updated the three existing
   nav/menu tests to expect `caseStudy` (AC1 order, AC5 no-drift); `menu/menu.js` itself untouched.
2. `@claude approved` advanced to step 6. Code PR
   [#327](https://github.com/mekhal/aidlc-radio-calico/pull/327) implemented the `NAV_KEYS`/
   `NAV_HREFS`/i18n contract the merged Test PR recorded, per
   `docs/knowledge-asset/published/code-pr-implements-test-pr-contract.md` — nothing invented
   beyond that seam.
3. `@claude close  coding 5 satisfied 5` — scores given directly, no reason attached.

Both PRs merged into `develop` cleanly; no stray branches.

## Decision

1. **AC5 markup-parity check surfaced pre-existing drift, and it was flagged rather than fixed.**
   `album-promo.html` does not load `menu/menu.js` (or any shared module) at all — only
   `album-promo.js` directly — a state dating to the #253–257 shared-module extractions, and the
   file's own header comment marks it "reference only — do not add new markup changes to this
   file" (issue #157/#159). Since AC5 only requires no *new* drift introduced by this ticket (the
   new tab renders identically wherever `buildMenu()` is actually mounted), and the file explicitly
   forbids new markup changes, the Code PR did not touch `album-promo.html` — consistent with
   "review before over-implementing"
   (`docs/decisions/2026-07-20-review-before-over-implementing.md`).
2. **No CSS changes were needed.** `.chloe-nav` is a flexbox that accommodates a 5th link without
   any layout changes, so AC1's link order was satisfied purely by the `NAV_KEYS` array order.
3. **Case Study showcase (`data/case-studies.json`) — not yet applicable.** The file doesn't exist
   yet (Tickets 2–3 of #203 haven't landed), so this close does not propose a showcase entry; that
   check is deferred to whichever of Tickets 2/3 first creates the file.

## Non-decision

No new skill is proposed from this issue's own work — the two judgment calls made in-loop (the
non-standard gate-trigger reading, and implementing exactly the Test PR's recorded contract) both
already reuse existing published skills (`gate-trigger-vs-intent-mismatch`,
`code-pr-implements-test-pr-contract`) rather than establishing new guidance. No change to
`CLAUDE.md`.
