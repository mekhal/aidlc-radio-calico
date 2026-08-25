# Issue #355 close — re-verification found 31 JS lint errors, spun into issue #488 rather than reopening #317

## Context

Issue #355 was opened at #317's close specifically to wait out an asynchronous constraint: the
checked-in `reports/lint/megalinter-report.html` only refreshes on the Mega-Linter workflow's
weekly cron (`0 3 * * 0`), not on the `pull_request`/`push` triggers that ran #317's fix PRs. The
issue body embedded 5 concrete checks to run once a post-fix weekly run had actually landed, and
was deliberately posted without an `@claude` mention so nothing would be claimed before that was
true.

An earlier turn on this issue (`@claude close coding 5 satisfied 4 ...`, 2026-08-14) turned out to
be misdirected — content about test-suite triage pass rates, not lint verification — and was
relayed to issue #360 instead, per the `gate-trigger-vs-intent-mismatch` pattern (pause when
trigger and content disagree, though here the mismatch was *which issue*, not which gate). #355
itself stayed untouched by that turn.

On 2026-08-25, `@claude review` ran the 5 checks for real: the weekly cron had by then run twice
(2026-08-16, 2026-08-23) since #317's 2026-08-11 fix. 4 of 5 checks passed — the report is
post-fix, the JS row shows `eslint`/`javascript_eslint` (not `standard`), and `.claude/skills/`
stays excluded. Check #3 failed: AC5 of #317's approved plan expected 0 JS errors under the new
config; the current report shows 31 (up from 16 in the 2026-08-16 run, alongside file count
growing 69→91 — consistent with the large JS batch added by issues #195/#205 in that window, not
an obviously broken config).

@mekhal then chose "ทางที่ 2" (option 2): open a new ticket for the 31 errors, and close #355
since #355's own scope — re-verifying the report — is complete.

## Decision

1. **Opened issue #488** ("Triage 31 JS lint errors found in newly added JS files") to carry the
   check-#3 gap forward, per check #5's own instruction in #355's body ("if the numbers don't
   match expectations, treat that as new findings on this ticket, not a reopen of #317") and
   `CLAUDE.md`'s "missed functionality becomes a NEW issue" rule. #488 is scoped to triage only
   (get the per-violation list, categorize fix-now vs. config-change vs. false-positive) — it does
   not re-open #317's or #355's already-closed decisions (ESLint flavor choice, exclusion regex,
   report-cadence root cause).

2. **Closing #355 at "re-verification complete" scope**, not "JS lint is clean" scope. #355's own
   AC was to run the 5 checks once the weekly refresh happened — done, and done accurately (the
   failing check was reported, not glossed over). The unresolved lint count is #488's problem now,
   not evidence that #355's re-verification work was incomplete.

3. **No scores recorded this close.** @mekhal's message chose between two options for how to
   proceed but did not include `coding N satisfied N` — `Instruction Fidelity`/`Result
   Satisfaction` are left blank in the eval entry for a human to fill in later, consistent with
   "the agent never self-scores."

4. **One new skill candidate proposed**: `deferred-verification-ticket-for-async-refresh` — see
   the `SKILL.md` draft in this issue's close comment. #355's shape (open now with embedded
   checks, no `@claude` tag, wait for an external schedule, then run those exact checks verbatim)
   worked cleanly end to end and is likely to recur — this repo already has at least one other
   schedule-gated artifact (the Mega-Linter weekly report itself), and the pattern generalizes to
   any CI/cron-refreshed evidence file.

5. **Not proposed for the Case Study showcase.** The loop's most interesting property — a
   correctly-caught misdirected close-comment on 2026-08-14 — is a process-recovery story, not a
   clean single-pass AI-DLC example; the showcase stays reserved for the latter.

## Why

Decision 1 matters because check #5 in #355's own body pre-committed to this exact split (new
finding → new ticket, not a reopen) before the numbers were even known, so following it here is
consistent rather than a fresh judgment call — but it's worth recording precisely because the
*content* of #488 could easily have been miscategorized as "#317's config is broken" instead of
"31 findings that need triage," and the decision doc is what preserves that distinction.

Decision 4 matters because the deferred-ticket shape is not currently captured anywhere in
`docs/knowledge-asset/published/` — a `grep` for "cron"/"deferred"/"weekly" across published and
deprecated skills came back empty — despite this being the second time in this repo's history a
report artifact has had a cron-vs-trigger refresh mismatch (the same root cause `docs/decisions/2026-08-13-issue-317-js-lint-close-report-cadence.md`
first diagnosed). Naming the ticket-shape pattern, not just the root cause, means the next
schedule-gated artifact doesn't need to rediscover both.

## Impact

- Issue #355 closes with 4/5 re-verification checks passing on record; the JS error-count gap
  carries forward as issue #488, not as a reopened #317.
- One new skill candidate proposed for @mekhal to decide (add/update/skip).
- Case Study showcase candidacy not raised for this issue.
