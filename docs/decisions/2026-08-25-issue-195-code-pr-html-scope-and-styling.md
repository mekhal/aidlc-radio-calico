# Decision: Code PR for the Mega-Linter HTML report — Test PR waived, HTML scope, report styling

**Issue:** [#195](https://github.com/mekhal/aidlc-radio-calico/issues/195) — Triage Mega-Linter
warnings/errors across CSS, HTML, JavaScript, Markdown, YAML
**Decided by:** @mekhal, 2026-08-25 (`@claude approved waiver Test PR. Start Code PR`)

## Decision

@mekhal's approval waived the Test PR (step 4) and asked to go straight to the Code PR (step 6),
per CLAUDE.md step 3's "human tells the agent to skip the Test PR" path. The already-drafted
failing tests from the prior turn's Test-PR branch (`claude/issue-195-20260824-1600` — pushed but
never had a PR opened, see the process flag in this issue's last `@claude review` comment) are
reused here instead of re-derived, per CLAUDE.md's "check whether a prior branch/PR for the same
instruction already exists" rule, and are bundled into this Code PR to satisfy the Definition of
Done's "Test PR waived → Code PR still demonstrates the AC by whatever means agreed" clause.

## What this Code PR implements

- `reports/lint/report-render.js` — the `parseMegaLinterMarkdownTable` / `buildChartBars` /
  `renderReadableList` contract the reused Test PR content was written against (unchanged, no
  contract drift — see `docs/knowledge-asset/published/code-pr-implements-test-pr-contract.md`).
- `reports/lint/report-style.css`, `reports/lint/report-boot.js` — new static assets (styling +
  DOM wiring) that the CI "Stage report" step inlines alongside `report-render.js` into a single
  self-contained `reports/lint/megalinter-report.html`, replacing the old plain-Markdown-in-`<pre>`
  shell. No new dependency, no build step — parsing/rendering runs client-side when the report is
  opened.
- `docs/ci-drafts/mega-linter.yml` (write-guard draft; a human copies this into
  `.github/workflows/mega-linter.yml`) — updated "Stage report" step per the above.
- `.mega-linter.yml` — `HTML` re-added to `ENABLE`, reversing that part of issue #314's decision.

## HTML scope — re-enabling actual linting, not just report-readiness

@mekhal's `@claude review` comment on this issue explicitly asked to add HTML "เข้าไปใน Scope
Linting และ Report" (into the linting scope *and* the report), listing "CSS + JavaScript + YAML +
HTML" as the wanted scope — this answers the agent's own Question 1 from that review turn: HTML
linting itself is re-enabled (`djlint`/`htmlhint` run again in CI), not just the report code being
HTML-row-ready. The report generator needed no contract change either way — it already parses
whatever rows Mega-Linter's summary table contains, so an HTML row (once CI produces one) flows
through unchanged.

**Consequence:** re-enabling HTML linting will surface new findings (the issue's original table
showed 9 djlint errors on 4 files before issue #314 disabled it, but that count is stale — a fresh
CI run is needed). This Code PR does **not** triage those findings — there's no CI run yet to pull
them from, same tooling blocker as this issue's CSS triage
(`docs/decisions/2026-08-24-issue-195-scope-and-triage.md`). AC1's HTML triage is deferred to
after a real CI run exists; whether that becomes its own follow-up ticket or folds into this
issue's close-out is left open until then, not decided here.

## `DISABLE_ERRORS` — unchanged, stays non-blocking

Consistent with `docs/decisions/2026-08-24-issue-195-scope-and-triage.md`'s AC3 decision: adding
HTML findings to an already-non-blocking, non-triaged report doesn't change the blocking question.
`DISABLE_ERRORS: true` is untouched.

## Report styling — neutral dev-report look, not the RadioCalico brand palette

The prior `@claude review` turn flagged this as an open question (brand palette vs. neutral) and
did not get an explicit answer in the `approved` comment. Decided here, flagged for correction:
**neutral** (grays + a red/amber/green accent for error/warning/success) — this is an internal CI
artifact read by whoever's triaging lint output, not user-facing product UI, so it doesn't draw on
`RadioCalicoStyle/RadioCalico_Style_Guide.txt`. If @mekhal wants the brand palette instead, that's
a small follow-up change to `reports/lint/report-style.css` only.

## Verification limits (same sandbox tooling blocker as the prior turn)

This session still has no `gh`/`npm`/`node`/browser-automation access, so:
- The reused test file (`tests/lint-report-render.test.js`) was traced by hand against
  `report-render.js`'s logic (each `expect(...)` checked line-by-line) but **not executed** — this
  repo's tests only run in-browser via `tests/test-runner.html` served over http(s)
  (`tests/README.md`), which this session cannot start.
- `reports/lint/megalinter-report.html` was hand-regenerated locally (mirroring the CI "Stage
  report" step) using the last known real CSS/JavaScript/YAML summary data, as a working preview
  until the next CI run overwrites it with fresh data (now including HTML). Not opened in an
  actual browser to confirm rendering — a human should sanity-check it opens correctly.
- `.mega-linter.yml`'s HTML re-enable and the `docs/ci-drafts/mega-linter.yml` step change were
  not run through actual Mega-Linter/CI in this session.

## Impact

- `reports/lint/report-render.js`, `report-style.css`, `report-boot.js` (new).
- `tests/lint-report-render.test.js` (reused from `claude/issue-195-20260824-1600`), wired into
  `tests/test-runner.html`.
- `.mega-linter.yml`: `HTML` added to `ENABLE`.
- `docs/ci-drafts/mega-linter.yml`: "Stage report" step rewritten to generate the styled report —
  **a human must copy this into `.github/workflows/mega-linter.yml`** (write-guard).
- `reports/lint/megalinter-report.html`: regenerated preview (CI overwrites on next run).
