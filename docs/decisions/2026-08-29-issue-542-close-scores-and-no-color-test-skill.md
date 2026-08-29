# Issue #542 (fix 77 failing test cases: Index/App, Whats-This, About, Contact) close — scored coding 5 / satisfied 5

**Issue:** [#542](https://github.com/mekhal/aidlc-radio-calico/issues/542) — the Test Report
Dashboard showed 77 failing test cases (Pass Rate 80%) across Index/App (52), Whats-This (17),
About (4), and Contact (4).
**PRs:**
[#550](https://github.com/mekhal/aidlc-radio-calico/pull/550) (Code PR — 5 confirmed root causes +
color-test cleanup, merged to `develop`),
[#553](https://github.com/mekhal/aidlc-radio-calico/pull/553) (Code PR — CDN loading migrated from
unpkg-only to jsDelivr-primary, merged to `develop`)
**Decided by:** @mekhal, 2026-08-29

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 5, Result Satisfaction 5.** Per `CLAUDE.md`'s
   rule that the agent never self-scores; the human supplied them directly in the close comment
   ("coding 5", "satisfied 5"). Logged in
   `ai-review-evals/2026-08-29_1648_issue-542_test-suite-cleanup-close.md`.

2. **Root-caused and fixed 5 of 6 failure groups, shipped across two Code PRs.** The human's
   review-round-by-round steering (paste the real failing-test JSON, then twice repeat "delete the
   color tests, don't ask") let the agent group ~75 raw failures into 5 confirmed, source-verified
   root causes (wrong data-path globals in `tests/test-runner.html`; `app.js` hardcoding
   `window.__APP_JS_PATH__`/relative paths that break when the Test Report modal mounts from inside
   `tests/test-runner.html`; a missing `.not` matcher in `tests/assert.js`; a stale-DOM-node bug in
   `renderLoadingSkeleton()`) plus the color/palette test deletions the human directed — all shipped
   in PR #550. A 6th cause (intermittent 0%-pass-rate runs, screenshotted separately mid-loop) was
   root-caused to `tests/test-runner.html`/`app.js` loading React/ReactDOM/Babel only from
   `unpkg.com` with no fallback — the same provider flagged unreliable since issue #157 — and
   shipped in a follow-up Code PR (#553), migrating both to the jsDelivr-primary/unpkg-fallback
   pattern already used elsewhere in the app.

3. **~30 PlayerControls (Sleep Timer/Audio Quality/Share) + 2 focus-identity failures (Group F)
   remained unconfirmed at close, not covered by either Code PR.** Static analysis against the live
   source found no structural bug (selectors, render conditions, and focus-restore code all matched
   what the tests expect); confirming the actual cause needs a live browser run, which this
   sandboxed agent environment cannot do (no network egress for the CDN-loaded
   React/Babel/Bootstrap `tests/test-runner.html` needs). The issue's AC #1 ("77/77 pass, 100%") is
   therefore **not fully met** at close — recorded here so the gap is traceable rather than silently
   dropped. The human chose to close anyway; if Group F still fails, it needs a fresh issue with a
   real dashboard run's error text (the sandbox limitation was flagged at every turn touching it).

4. **New-skill candidate, per the human's explicit instruction in the close comment: stop writing
   color-check tests by default.** ("เก็บ skill ไม่เขียน Test อะไรที่เกี่ยวกับการเช็ค color จะเขียน
   Test ก็ต่อเมื่อ Developer ระบุเท่านั้น" — "Save a skill: don't write any test that checks color;
   only write one when the Developer specifies.") This generalizes the deletion pattern from this
   issue's own two color-test-removal rounds (removing the hardcoded 5-swatch palette assertion,
   the hover-color assertion, and the dark-palette color assertion — see PR #550) and the
   `tests/contact/contact-theme.test.js` color-assertion tension surfaced later on
   [#569](https://github.com/mekhal/aidlc-radio-calico/issues/569) (cross-referenced back to this
   issue, still open — see decision 5). Draft below, pending @mekhal's add/skip decision — this
   instruction reads as a direct, already-final call rather than an open question, but the drafted
   `SKILL.md` still needs a human to create it under `.claude/skills/` per the write-guard
   workaround.

5. **The #569 cross-reference's still-open scope question is not resolved by this close.** #569
   flagged that `tests/contact/contact-theme.test.js`'s `--chloe-ink`-titled test currently asserts
   `var(--chloe-mint-deep)` (contradicts its own title), and asked whether "remove all color check
   unit tests" means just that one assertion or all remaining color-token tests
   (`tests/theme-mint-deep.test.js` etc.) across the suite. This close's new skill (decision 4)
   settles the *forward-looking* policy (don't write new ones) but does not retroactively resolve
   *which existing* token-based tests to remove — that still needs @mekhal's explicit scope answer
   before any of those specific files are touched, consistent with this issue's own earlier
   "review before over-implementing" pattern.

6. **Not proposed as a Case Study showcase candidate.** While the loop closed at 5/5, it took two
   Code PRs (#550, #553) reacting to a bug surfaced mid-loop by a screenshot rather than one clean
   pass, and it closes with a known-incomplete AC (Group F, decision 3) — not the illustrative
   "closed end-to-end, no rework cycles" example the showcase curation calls for.

## Draft skill candidate (for @mekhal to decide: add / update / skip)

```markdown
---
name: no-color-check-tests-unless-requested
description: Use when writing or reviewing any test file — do not add assertions on color values (hex codes, rgb(), computed styles, or CSS custom-property color tokens like var(--chloe-ink)) by default. Only write a color-check assertion when a developer explicitly asks for one.
---

Do not proactively write test assertions that check a literal color value, a computed CSS color
style, or a color-related custom-property token — whether the test is new or being extended. This
includes hardcoded hex/rgb assertions, brand-palette swatch checks, and `var(--chloe-*)`
token-usage checks tied to a specific color.

Only add this kind of assertion when a developer explicitly requests it for a specific case (e.g.
"add a test that catches this exact rebrand regression"). Do not add it defensively, as boilerplate
coverage, or because a component happens to render a color.

Why: color values change with rebrands and theme tweaks more often than the underlying behavior
does, so color assertions tend to fail on legitimate visual changes rather than real regressions.
Issue #542 removed a hardcoded 5-swatch palette test, a hover-color test, and a dark-palette color
test for exactly this reason; issue #569 hit the same friction from the other direction — a
color-token assertion (`tests/contact/contact-theme.test.js`) silently contradicted its own test
title after an unrelated theme change, and fixing it in place was judged not worth it.

This does not retroactively decide what to do with *existing* color/token tests already in the
suite (see `tests/theme-mint-deep.test.js`, `tests/contact/contact-theme.test.js`, and similar) —
those still need an explicit human scope call per issue, this skill only governs new test-writing
going forward.
```

## Why

Decision 3 exists because closing an issue whose own AC (100% pass rate) is not fully met is a
judgment call that belongs to the human, not something the agent should paper over — recording the
gap here keeps the AC honest even though the human chose 5/5 satisfaction with the shipped scope.

Decision 4 exists because the human framed this explicitly as "save a skill" (เก็บ skill), not as a
question — but `CLAUDE.md`'s skill-capture flow still requires drafting the `SKILL.md` content and
recording it for the human to physically add (write-guard workaround), rather than assuming it's
already live just because the instruction was direct.

Decision 5 exists because #569's cross-reference asked a specific, still-unanswered scope question
("just this one assertion, or all color-token tests across the suite?") that this close's *general,
forward-looking* skill doesn't answer — conflating "stop writing new ones" with "here's which old
ones to delete" would be exactly the kind of unrequested scope expansion `CLAUDE.md`'s
"ask when in doubt" rule warns against.

## Impact

- Issue #542 closes with 5 of 6 failure groups fixed and shipped (PRs #550, #553); Group F
  (~30 PlayerControls + focus-identity failures) remains open and unconfirmed — a fresh issue with
  real browser-run error text is the recommended next step if it's still failing.
- One new-skill candidate (`no-color-check-tests-unless-requested`) drafted above, pending
  @mekhal's decision; not yet added to `.claude/skills/` (write-guard workaround — a human must
  create that file).
- #569's open scope question (which existing color/token tests to remove, if any) is not resolved
  by this close and stays with whoever picks up that thread next.
- `data/case-studies.json` left unchanged.
