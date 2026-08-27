# Issue #544 close — Security Scan Report scores and a standalone-report-page skill candidate

## Context

Issue #544 asked for a Security Scan Dashboard reading `reports/security/trivy.sarif`. The loop
went through three `@claude review` rounds before `@claude approved`:

1. **Review 1:** flagged that the issue's own "dashboard" ask reversed a prior explicit decision
   (issue #87, `docs/decisions/2026-07-16-trivy-sarif-direct-link-no-viewer.md`, which dropped a
   grouped SARIF viewer for a plain direct link), and that the trigger word (`review`) didn't match
   the issue body's implementation-shaped "Task Request" section.
2. **Review 2:** human dropped the "heavy dashboard" idea for a plain text/category summary.
   Re-checking the actual `trivy.sarif` content (`results: []`, no confirmed `scanners:` flag for
   license scanning) surfaced a real data gap — a category-by-`ruleId` breakdown couldn't be
   tested against real data yet — and three options (A/B/C) were offered.
3. **Review 3:** human picked Option A (ship 4 static category sections reading "0 findings") plus
   a new download-button request, but opened with `@claude review` while asking to "see the UI" —
   a trigger-word/intent mismatch (per the existing `gate-trigger-vs-intent-mismatch` skill),
   flagged rather than silently resolved.
4. **Approved:** human waived the Test PR and asked for the Code PR directly, so the UI could be
   reviewed as real code. Code PR #545 shipped `reports/security/security-report.html` as a neutral
   standalone report page (mirroring `reports/lint/megalinter-report.html`'s existing pattern, not
   the branded Test Report Dashboard chrome), with a bilingual EN/TH toggle and a raw-SARIF download
   link. Merged to `develop`.
5. **Close:** `@claude close coding 3 satisfied 4`, with a screenshot surfacing two follow-up asks:
   add the app's header/sidebar/footer chrome to the page, and shrink the download control.

## Decision

1. **Recorded Instruction Fidelity 3 / Result Satisfaction 4 verbatim** in a new
   `ai-review-evals/` entry — never self-scored, per the framework's own rule.
2. **Verified no PR gap before closing.** The only branch referenced in this issue's prior turns,
   `claude/issue-544-20260827-1535`, maps to PR #545, merged to `develop` — nothing stranded per
   the issue #135 mitigation.
3. **The two follow-up requests become a new issue, not a rework of this closed loop:** filed as
   [#548](https://github.com/mekhal/aidlc-radio-calico/issues/548), since PR #545 is already merged
   (there's no open PR to push a follow-up commit onto, so the "comment on the PR, not the issue"
   rule doesn't apply here — there is no open PR left). #548 bundles both the header/sidebar/footer
   chrome request (a design-pattern reversal of decision 4 below) and the download-control sizing
   fix, since both were found together from the same screenshot on the same shipped page.
4. **One new skill candidate proposed**: `standalone-ci-report-page-pattern` — for CI-generated
   report pages (security scans, lint reports, etc.), default to a small neutral standalone page
   co-located with the raw report artifact, fetched via a same-directory relative path, rather than
   building full app-dashboard chrome or a heavy viewer — unless a human explicitly asks to match
   app chrome (which is exactly what issue #548 now does, an explicit override of this default, not
   a contradiction of it). See the `SKILL.md` draft in this issue's close comment (not yet written
   to `docs/knowledge-asset/published/` — proposed, pending @mekhal's add/update/skip decision, per
   `CLAUDE.md`'s "Adding a skill" step).
5. **Not proposing a Case Study showcase entry.** Instruction Fidelity 3 with two concrete
   follow-up complaints doesn't read as the "clean, illustrative" example the showcase curation
   (`data/case-studies.json`) calls for, consistent with the precedent set at issues #505/#533/#538.

## Why

Decision 3 keeps this closing turn scoped to what was actually shipped and evaluated (PR #545),
rather than letting new UI-chrome/sizing requests silently reopen a loop that's already closed —
same reasoning already applied at issue #505's close for its own post-merge follow-ups (issue
#522). Bundling both new complaints into one ticket (rather than two) matches that same precedent
(#522 bundled three complaints into one ticket) since both are small, related, and found together.

Decision 4 matters because this issue took three review rounds to converge on "standalone report
page, not branded dashboard chrome, not raw-link-only" — the same design question the megalinter
report already answered implicitly (by existing) but that was never written down as a default to
reach for before re-litigating it turn by turn. Writing it down doesn't prevent a human from
choosing differently for a specific case (as #548 already does) — it just moves the default answer
earlier in the conversation next time a new CI report needs a page.

## Impact

- Issue #544 closes at its shipped scope: PR #545 merged to `develop`.
- New issue #548 opened for the header/sidebar/footer chrome + download-control sizing follow-ups,
  ready for its own step 2 (5 questions + plan) when a human triggers `@claude` on it.
- One new skill candidate (`standalone-ci-report-page-pattern`) proposed for @mekhal to decide
  (add/update/skip) — see the `SKILL.md` draft in this turn's comment.
- `data/case-studies.json` left unchanged.
