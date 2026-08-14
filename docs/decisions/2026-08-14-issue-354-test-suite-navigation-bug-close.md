# Issue #354 close — Test suite navigation bug + 3 hidden root causes

## Context

Issue #354 reported `tests/test-report-dashboard.html` hanging permanently on "Running tests…"
with no report saved to `localStorage`. Root cause: `tests/test-runner.html` ran ~54 tests then the
browser navigated itself to `/tests/case-study.html` (404), killing the suite before
`onTestRunComplete()` ever fired. Preventing the navigation temporarily surfaced 3 more hidden root
causes behind the same failure.

The loop ran across several turns:

1. Step 2 review: read all 4 reported root causes against the actual source and confirmed each one
   matched the code exactly — no discrepancies. Answered the one open sub-question (root cause #4:
   label vs. icon-only) directly from `app.js`'s `createIconLink()`, which always sets a label, so
   no human input was needed there. Flagged two decisions needing confirmation: ticket count (1 vs.
   4) and whether to waive the Test PR.
2. `@claude approved 2` — ambiguous ("2" could answer either open question). Asked for
   clarification per "ask when in doubt" rather than guessing, since the two readings diverged on
   whether to waive the Test PR.
3. `@claude approved choose B` — resolved to "single ticket, Test PR not waived." Test PR
   [#357](https://github.com/mekhal/aidlc-radio-calico/pull/357) fixed root causes #1, #2, #4 (all
   bugs in the test files themselves) and added a RED test for root cause #3 (`app.js` production
   code). Merged.
4. `@claude approved Code PR` — Code PR
   [#358](https://github.com/mekhal/aidlc-radio-calico/pull/358) fixed root cause #3: made
   `runTestReportSuite()` capture and restore the previous value of `window.__APP_JS_PATH__` in its
   `finally` block instead of leaving it stuck at `"app.js"` after the suite finishes. Merged.
5. `@claude close coding 5 satisfied 5 ... Passrate เพิ่มขึ้นเป็น 88%` — scores given directly;
   human asked for a new, separate ticket to track the remaining 24 failing tests.

## Decision

1. **All 4 reported root causes were confirmed accurate by direct code reading** before any code
   was touched — no surprises between the issue's diagnosis and the actual source.
2. **Single ticket, Test PR not waived** (resolved from the "choose B" ambiguity) — root causes #1,
   #2, #4 were bugs in test files (fixed directly, no separate AC needed); root cause #3 was one
   line of production code (`app.js`), covered by a RED test added in the Test PR and turned GREEN
   in the Code PR, keeping the TDD loop intact even for the one production-code line.
3. **`clickAndCheckPrevented()` was extracted into a shared helper** (root cause #1's fix) rather
   than patched in two places — reuse-first, consistent with existing convention.
4. **The out-of-scope notes from the original issue body (sidebar path override, footer `©`
   encoding, missing dashboard timeout) were explicitly left untouched**, as instructed.
5. **A new, separate ticket for the remaining 24 failing tests was requested directly by @mekhal at
   close**, rather than the agent unilaterally expanding this issue's scope — consistent with
   "missed functionality becomes a NEW issue." The agent creates this ticket because it was
   explicitly asked to, but does not embed a live `@claude` trigger in the new issue's body — the
   human decides when to start that loop (same convention as issue #340, spawned from #330's close).
6. **Case Study showcase** — proposed as a candidate at close (see close comment); not added
   unprompted, per "ask when in doubt."

## Non-decision

Whether the new "24 remaining failures" ticket should itself be split further once triaged is left
for that ticket's own step-2 review — this close only creates the ticket with the evidence
available (88% / 141-plus passing per the screenshot), not a pre-triaged breakdown.
