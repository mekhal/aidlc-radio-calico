# Issue #538 close — taxonomy regex fix scores and a test-folder/taxonomy-sync skill candidate

## Context

Issue #538 was itself surfaced as a drafted-but-unopened ticket in
[issue #533's close decision doc](2026-08-27-issue-533-close-scores-and-loading-skeleton-skill.md)
("Recognize existing page test folders…"): `tests/about/`, `tests/case-study/`, `tests/contact/`,
and `tests/whats-this/` already existed with real test files, but `categorizeScriptPath()` in
`tests/assert.js` (added under issue #205) only matched
`shared|logo|menu|sidebar|footer`, so all four folders' results silently fell into the generic
`index/app` bucket on the Test Report Dashboard instead of their own category.

The loop ran:

- **Review (`@claude review`):** confirmed the root cause (regex-only gap), confirmed the
  dashboard's `groupResultsByCategory()`/`buildCategoryGrid()` needed no change (already renders
  one card per distinct category string present in results, not a hardcoded list), and identified
  the correct existing test file (`tests/report-category-tagging.test.js`, from issue #205's
  AC-C1) to extend rather than the similarly-named but unrelated
  `tests/test-report-dashboard-taxonomy.test.js`.
- **Approved (`waiver Test PR`):** human waived the separate Test PR step explicitly; AC coverage
  was bundled directly into the Code PR per the Definition of Done's waiver clause.
- **Code PR (#539):** extended the regex to
  `shared|logo|menu|sidebar|footer|about|case-study|contact|whats-this`, added the new test case,
  and updated the stale doc-comments enumerating the folder list. Merged to `develop`.
- **Close:** `@claude close coding 5 satisfied 5` with a dashboard screenshot.

## Decision

1. **Recorded Instruction Fidelity 5 / Result Satisfaction 5 verbatim** in a new
   `ai-review-evals/` entry — never self-scored, per the framework's own rule.
2. **Verified no PR gap before closing.** The only branch referenced in this issue's prior turns,
   `claude/issue-538-20260827-1346`, maps to PR #539, merged to `develop` — nothing stranded per
   the issue #135 mitigation.
3. **One new skill candidate proposed**: when a new `tests/<page>/` folder is added, extend
   `categorizeScriptPath()`'s regex (and its doc-comment) in the same change — the taxonomy list
   and the actual folder list drifted apart silently once already (these four folders existed with
   real test files for some time before this fix), with no error or test failure surfacing the
   drift; it only showed up as a dashboard UX symptom (`about`/`case-study`/`contact`/`whats-this`
   results all merged into `index/app`). See the `SKILL.md` draft in this issue's close comment
   (not yet copied into `.claude/skills/` per the write-guard workaround).
4. **Not proposing a Case Study showcase entry.** Same reasoning as issue #533's close: the
   showcase (`data/case-studies.json`) holds three IF5/RS5 entries, each illustrating a non-trivial
   mismatch, a root-caused production bug, or a fix that produced a durable published skill. #538
   is a clean, correctly-scored loop but a single-function regex fix with no surfaced mismatch — it
   doesn't add a materially different illustration to the existing curated set.

## Why

Decision 3 matters because the drift this issue fixed is structural, not a one-off typo: nothing
in the test harness enforces that `categorizeScriptPath()`'s allowlist stays in sync with the
folders actually present under `tests/`, so the same silent-fallback-to-`index/app` failure mode
will recur the next time a page gets its own test folder unless the update is made a habit at
folder-creation time rather than caught later as a dashboard-taxonomy bug ticket.

Decision 4 mirrors the standing rule from issue #203/#533: the showcase stays a small, curated set
illustrating distinct patterns, not a running log of every 5/5 close.

## Impact

- Issue #538 closes at its shipped scope: PR #539 merged to `develop`.
- One new skill candidate proposed for @mekhal to decide (add/update/skip) — see the `SKILL.md`
  draft in this turn's comment.
