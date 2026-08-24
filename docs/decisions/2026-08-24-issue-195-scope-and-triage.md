# Decision: Mega-Linter triage scope, report format, and a sandbox tooling blocker

**Issue:** [#195](https://github.com/mekhal/aidlc-radio-calico/issues/195) — Triage Mega-Linter
warnings/errors across CSS, HTML, JavaScript, Markdown, YAML
**Decided by:** @mekhal, 2026-08-24 (approving the agent's `@claude review` clarifying questions)

## Decision

At the `@claude review` step the agent asked three open questions before folding @mekhal's
"single-file HTML report, with a chart, explained as a readable list" request into this issue's
AC1. @mekhal's `@claude approved` comment answered all three:

1. **Scope narrows to CSS + JavaScript + YAML.** Issue #314 dropped HTML/MARKDOWN from
   `.mega-linter.yml`'s `ENABLE` list (Non-Core) and issue #317 disabled
   `JAVASCRIPT_STANDARD`/`JAVASCRIPT_PRETTIER` in favor of plain ESLint — those linters no longer
   run, so the issue's original 5-descriptor table is stale. This issue's title still says "CSS,
   HTML, JavaScript, Markdown, YAML"; the scope itself is now CSS + JavaScript + YAML only. (The
   title isn't renamed here — out of scope for a triage/report-format decision — but any future
   reference to this issue should read it as CSS+JS+YAML.)
2. **Chart = plain CSS/SVG bars, no new dependency** — option (a) from the review comment's two
   choices, consistent with the issue #87/Trivy precedent
   ([2026-07-16-trivy-sarif-direct-link-no-viewer.md](2026-07-16-trivy-sarif-direct-link-no-viewer.md))
   of keeping report tooling simple for a demo rather than adding a charting library.
3. **The report regenerates automatically on every CI run**, not just as a one-off write-up.
   Concretely: the existing "Stage report" step in `.github/workflows/mega-linter.yml` already
   regenerates `reports/lint/megalinter-report.html` on every run (it's currently just the
   Markdown summary wrapped in `<pre>`) — that step's output gets replaced with the richer
   chart+list report instead of a new file, so the existing footer link
   (`app.js`'s `lintReportLink.href = "reports/lint/megalinter-report.html"`,
   `tests/footer-lint-report-link.test.js`) and its test need **no change**.

## Report data source: reuse the existing Markdown summary, not a new reporter

The generator (`reports/lint/report-render.js`, see the Test PR for this issue) parses the
Markdown summary table Mega-Linter already produces (`MARKDOWN_SUMMARY_REPORTER: true`, already
enabled) instead of turning on a new reporter (`JSON_REPORTER`/`SARIF_REPORTER`). Reasoning:

- The table already carries everything the chart + readable list need: descriptor, linter name/
  URL, status, files, errors, warnings.
- No new Mega-Linter config/output surface to get wrong sight-unseen — this agent has no CI log
  access to verify an unfamiliar reporter's exact output path/schema before it ships (see the
  tooling blocker below).
- Matches "no new dependency" in the same spirit as the CSS/SVG chart choice.

This means the report **does not** include per-finding (file/line/rule message) drill-down — only
the per-linter summary, rendered more readably. Per-finding detail remains gated on the tooling
blocker below; if @mekhal wants drill-down in the report itself later, that's new scope for a
follow-up issue, not folded into this one silently.

## Tooling blocker: this agent session cannot run `gh`, `curl`, `npm`, `node`, or any linter binary

AC1 of the issue asks for "per-finding detail pulled from CI logs." This agent's sandboxed
session only allows `git`, `Read`/`Grep`/`Glob`/`Write`/`Edit`, and a handful of coreutils
(`ls`, `find`, `cat`, `which`) — every other binary (`gh`, `curl`, `npm`, `npx`, `node`,
`yamllint`, `awk`) returned "This command requires approval," which cannot be granted
interactively in this headless run. As a result:

- **Could not** fetch the latest Mega-Linter CI run's detailed step logs via `gh run view --log`.
- **Could not** run stylelint/eslint/yamllint locally to reproduce exact findings.

If @mekhal wants this closed out with exact per-finding data, either:
(a) add `gh`/the specific linter binaries to this session's `--allowedTools` so a follow-up turn
can pull the real logs, or (b) paste the Mega-Linter job's raw step output (or attach the
`megalinter-report` artifact) into a comment on this issue.

## Triage (best-effort, static analysis — see caveats)

Per-linter categorization below is derived from reading `.mega-linter.yml`, `.eslintrc.json`,
`.stylelintrc.json`, and the actual source files directly (not from CI logs, per the blocker
above). Confidence is noted per finding.

### YAML — high confidence
All 8 scanned YAML files (`trivy.yml`, `.mega-linter.yml`, the 4 `.github/workflows/*.yml`, and
their 2 `docs/ci-drafts/` mirrors) were checked directly for yamllint's default `line-length: 80`
rule by counting lines over 80 characters: **18 lines total** — an exact match to yamllint's
reported 18 errors. All of them are long prose comments (this repo documents *why* behind CI
config inline, e.g. `.github/workflows/mega-linter.yml`'s trigger-rationale block) rather than
structural YAML problems.
- **Category: config-adjustment** (rule not suited to this repo) — this repo's convention is
  long, explanatory inline comments; the fix is a `.yamllint` override raising or disabling
  `line-length` for comments (or repo-wide), not rewrapping every explanatory comment.
- prettier's 1 error / 3 warnings and v8r's 0 findings on YAML: **not confirmed** — no reliable
  static check available without running prettier; low-impact given v8r (schema validation) is
  already clean.

### JavaScript — medium confidence
`.eslintrc.json`'s `globals` list has no entries for the test-harness identifiers
(`describe`/`it`/`expect`/`TestHarness`/etc.) that all 36 `tests/*.test.js` files use as bare
globals (confirmed via `tests/assert.js`'s `global.TestHarness = {...}` — attached at runtime,
which ESLint's `no-undef` (part of `eslint:recommended`) cannot see without an explicit `globals`
entry or `/* eslint-env */`/`/* global */` comment — grepped for and found none).
- **Category: config-adjustment** — likely a real contributor to the 31 JAVASCRIPT/eslint errors,
  but **not confirmed** to explain all 31 without running eslint. Proposed fix: add an
  `overrides` block scoped to `tests/**/*.test.js` declaring those globals, rather than widening
  the global `globals` list (keeps app-code linting strict).

### CSS — unconfirmed, blocked
`.stylelintrc.json` extends `stylelint-config-standard` (a large rule set) plus one custom
`selector-class-pattern` rule. A targeted grep for camelCase class selectors (which would violate
that custom pattern) found none. Beyond that, manually eyeballing 12 CSS files against ~90
possible `stylelint-config-standard` rules risks producing a wrong, misleading triage — **not
attempted**. The 49 CSS/stylelint errors are recorded as **fully blocked** pending the tooling
access described above.

## AC2 — fix now vs. follow-up tickets

**Decision: none of the above are fixed in this loop.** The two config-adjustment hypotheses
(YAML line-length, JS test globals) are recorded here as candidate follow-up tickets for @mekhal
to confirm — not applied unilaterally, since "add config-adjustment" wasn't itself asked for in
this turn's approval (only scope/chart/automation were), and the JS finding in particular is not
yet confirmed to fully explain the 31 errors. CSS is blocked outright pending tooling access.

## AC3 — `DISABLE_ERRORS` blocking flip

**Decision: stays `true` (non-blocking) for all three linters.** None of CSS/JS/YAML's findings
are yet confirmed or fixed; flipping to blocking now would immediately fail every PR's Mega-Linter
check on pre-existing findings unrelated to that PR's own diff. Revisit once the YAML/JS
config-adjustments (if confirmed) are applied and CSS is triaged with real tooling access.

## Impact

- `tests/lint-report-render.test.js` (new, this issue's Test PR): failing tests for
  `reports/lint/report-render.js`'s `parseMegaLinterMarkdownTable`/`buildChartBars`/
  `renderReadableList` — implemented in this issue's Code PR (step 6).
- `tests/test-runner.html`: registers the new test file (doc/tool-content-assertion category, no
  app.js DOM surface — same as `harness-serialization.test.js`/`skills-storage-in-repo.test.js`).
- No app code, `.mega-linter.yml`, or workflow file changed yet — that's the Code PR.
