# Issue #577 (headless CI for `tests/test-runner.html`) closed at Instruction Fidelity 5 / Result Satisfaction 5; YAML colon-quoting bug fixed; `docs/ci-drafts/` sync gap closed; regression found in #585 flagged there

**Issue:** [#577](https://github.com/mekhal/aidlc-radio-calico/issues/577) — run `tests/test-runner.html` headlessly in CI on every PR/push into `develop`, without changing the vanilla-JS test framework or adding `npm test`/Jest.
**PR:** no Test PR or Code PR in the usual sense — the workflow YAML is blocked from agent writes (`.github/workflows/`), so @mekhal committed it directly to `develop` (`20ce133`, later fixed by `commit` around 2026-09-03T01:22 UTC, see Decision 2). This close-step PR carries the decision doc / eval / `docs/ci-drafts/` sync below.
**Decided by:** @mekhal, 2026-08-31 through 2026-09-03.

## Decision

1. **Mechanism, trigger, and blocking settled as:** serve the checked-out branch over `http://localhost:8080` (Python's built-in `http.server`, no install) rather than the originally-proposed live GitHub Pages URL — Pages was found to serve `main` only, which would have tested stale, already-released code instead of the branch under review. Playwright is installed into `/tmp/pw-runner` (outside the repo tree, `--no-save`) to avoid adding a `package.json`/`npm test` to the repo, per the issue's own out-of-scope list. Triggers: `pull_request` + `push` into `develop`. Not added to `develop`'s required-status-checks list yet (report-only for this first rollout, matching the `mega-linter`/`trivy` precedent in `docs/ci-drafts/README.md`). No HTML artifact — pass/fail via the job's own exit code plus a `"X / Y passed"` log line.
2. **Test PR waived at step 3** (@mekhal, 2026-08-31T16:11) — this issue produces only CI configuration with no app-side JS behavior for the vanilla runner itself to assert against; the only real verification is watching the workflow actually run in Actions.
3. **YAML syntax bug found and fixed.** The first live run ([`33412529790`](https://github.com/mekhal/aidlc-radio-calico/actions/runs/33412529790)) failed with `Invalid workflow file ... #L15`. Root cause: a YAML plain (unquoted) scalar cannot contain a colon-followed-by-space (`: `) — the step name `Serve repo over http (tests/README.md: fetch() fails under file://)` contains exactly that sequence, so the parser tried to read it as a nested mapping. Fixed by quoting the whole step name. The fix was drafted in-thread (2026-09-02T01:47) but the same bug briefly reappeared on `develop` twice more via unrelated pushes before the quoted version actually landed at 2026-09-03T01:22 UTC (run [`33703380321`](https://github.com/mekhal/aidlc-radio-calico/actions/runs/33703380321), first green run). See Decision 5 for the new skill this produced.
4. **`docs/ci-drafts/` sync gap closed in this close step.** `docs/ci-drafts/README.md` documents an established convention — used by `mega-linter.yml`/`trivy.yml` — of keeping a synced draft copy of every workflow outside `.github/workflows/`, since the agent can commit there directly (unlike the real workflows directory) and a human only has to `cp` it in. This issue's earlier turns instead pasted the YAML directly into issue comments for @mekhal to copy by hand, which is the same write-guard workaround but skipped the repo-tracked sync copy — so there was no `docs/ci-drafts/test-runner-headless.yml` to diff against when the line-15 bug needed fixing, unlike Trivy's three tracked fix rounds. This close step adds `docs/ci-drafts/test-runner-headless.yml` (matching the current live, fixed `develop` copy) and a matching "Fixes applied" note in `docs/ci-drafts/README.md`, closing the gap for any future fix to this workflow.
5. **New skill proposed** — `quote-yaml-strings-containing-colon-space` — see "Adding a skill" below.
6. **Regression found by this issue's own deliverable, flagged on #585 (not opened as a new issue).** The first fully-green run of this workflow that exercised real app code ([`33714708740`](https://github.com/mekhal/aidlc-radio-calico/actions/runs/33714708740), triggered by #585's Code PR #593 merging to `develop`) reported **331 / 358 passed** — 27 real test failures, mostly `PlayerControls Sleep Timer/Audio Quality/Share` suites failing with `Cannot read properties of null (reading 'click')`, consistent with a mount target `#585` removed (`app.js`) that some tests still depend on. Issue #585 is still open (its own close step hasn't run), so per `CLAUDE.md`'s cross-reference rule this is posted as a plain, untagged comment on #585 rather than a new issue.
7. **Scores as given in the close comment:** Instruction Fidelity 5, Result Satisfaction 5.
8. **Case Study showcase:** not proposed. Unlike the existing three entries in `data/case-studies.json`, this loop needed two mid-course corrections (the GitHub Pages mechanism pivot, then the YAML syntax bug spanning two live-run failures) rather than running clean end-to-end — same bar `[[2026-09-01-issue-579-close-scores-and-test-pr-waiver-skill]]` used to decline. Flagging for @mekhal to override if they'd still like it included given the 5/5 scores.

## Why

Decision 4 matters beyond just this one workflow: the `docs/ci-drafts/` convention exists specifically so that when a workflow needs a follow-up fix (as this one did, twice), there's a repo-tracked copy the agent can diff and correct directly, instead of every fix round-tripping through a fresh comment-paste. Skipping it for this workflow's first version meant the line-15 fix in this thread relied entirely on the human copying a corrected snippet by hand from a comment — it worked, but it's the same shape of gap the "Fixes applied after the first live CI runs" section of `docs/ci-drafts/README.md` was written to avoid for Mega-Linter/Trivy.

Decision 6 follows the same reasoning already applied at `[[2026-08-24-issue-421-parent-close-scores-and-deferred-issue-followthrough]]` for out-of-scope findings that belong to an already-sequenced, still-open ticket: #585 is open, its Code PR (#593) merged only minutes before this close turn, and the failing tests are a direct, plausible consequence of that same deletion (a test-mount dependency that #585's own AC2 explicitly flagged as a risk to check file-by-file). Opening a brand-new issue would fragment that context away from where it's already being tracked.

## Adding a skill

**Candidate: `quote-yaml-strings-containing-colon-space`**

```markdown
---
name: quote-yaml-strings-containing-colon-space
description: Use when writing or reviewing GitHub Actions workflow YAML (or any YAML) — any plain scalar string value (step `name:`, `run:` single-line values, etc.) that contains a colon immediately followed by a space (": ") must be wrapped in quotes, or the YAML parser will misread it as a nested mapping key.
---

A YAML plain (unquoted) scalar cannot contain the sequence `: ` (colon + space) — the parser
treats it as the start of a new mapping key, not literal text. This is easy to hit in GitHub
Actions `name:` fields that reference a file path or note, e.g.:

    - name: Serve repo over http (tests/README.md: fetch() fails under file://)

fails to parse (`Invalid workflow file ... you have an error in your yaml syntax on line N`)
because of `README.md: fetch()`. The fix is to quote the whole value:

    - name: "Serve repo over http (tests/README.md: fetch() fails under file://)"

Before committing or reviewing workflow YAML (or any hand-written YAML), scan every plain-scalar
string value for `: ` and wrap it in quotes if found. This applies to `name:` fields, `run:`
single-line commands, and any other plain scalar — not to YAML block scalars (`run: |` / `run: >`
bodies), which are literal text and unaffected.
```

## Impact

- `.github/workflows/test-runner-headless.yml` on `develop` now runs green on real app code and correctly reports real failures — proven by the 331/358 run linked in Decision 6.
- `docs/ci-drafts/test-runner-headless.yml` added, and `docs/ci-drafts/README.md` updated with a "Fixes applied" entry for the line-15 colon-quoting bug, closing the sync gap so future fixes to this workflow have a trackable draft copy (same as Mega-Linter/Trivy).
- One new skill candidate (`quote-yaml-strings-containing-colon-space`) proposed for @mekhal to decide (add/update/skip).
- A real regression (27 failing tests) surfaced by this issue's own CI is flagged as a plain comment on the still-open #585, not a new issue.
- `data/case-studies.json` left unchanged (see Decision 8).
