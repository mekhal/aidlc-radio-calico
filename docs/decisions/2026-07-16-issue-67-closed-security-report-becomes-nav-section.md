# Decision: Issue #67 closed; Trivy security-report delivery replaced with a "Security" nav section in a new issue

**Issue:** [#67](https://github.com/mekhal/aidlc-radio-calico/issues/67) — เพิ่ม Lint (Mega-Linter) และ Security Scan (Trivy)
**Decided by:** @mekhal, 2026-07-16

## Decision

Issue #67 is closed (`@claude close`) with the Mega-Linter half fully shipped and
verified live, but the Trivy half's *delivery mechanism* changed mid-stream:

- **Mega-Linter (lint):** done. `.github/workflows/mega-linter.yml` runs green,
  publishes `reports/lint/megalinter-report.html` to `main`, and the footer's
  `Lint Report` link (`app.js`) resolves it. No further action needed from #67.
- **Trivy (security scan):** the original AC1-style plan — export a single
  static `trivy-report.html` via `contrib/html.tpl` and link it from the
  footer as `Security Report` — is **abandoned**, not finished. Getting the
  workflow to run at all took three rounds of fixes (`trivy-action` version
  pin, transitive `setup-trivy` tag deletion, absolute-vs-relative template
  path — see `docs/ci-drafts/README.md`'s "Fixes applied" section), and
  before the HTML output could be verified live, the human redirected the
  requirement entirely: instead of one static HTML report page, Security
  scan results should surface as a **"Security" navigation section** with
  three distinct links (GitHub's own Code Scanning Alerts page, a raw SARIF
  download, and an *optional* HTML report link that hides itself when absent).
- This redirect is **out of scope for #67's own AC** (which asked for "a
  Trivy scan exporting HTML"), so per `CLAUDE.md`'s "missed functionality
  becomes a NEW issue" rule, it is captured as a new issue instead of being
  bolted onto #67's already-long thread:
  [#79](https://github.com/mekhal/aidlc-radio-calico/issues/79).

## Why

- `CLAUDE.md`: "missed functionality becomes a NEW issue — never expand
  scope inside the current loop." The nav-section requirement is materially
  different work (new UI structure, SARIF export, GitHub Code Scanning
  integration, conditional-link logic) from "export one HTML file," not a
  tweak to the same AC.
- Closing #67 now rather than leaving it open avoids an ever-growing thread
  (this one already went through 3 rounds of Trivy CI debugging) and matches
  the loop's own step-7 guidance to keep each issue's focus narrow.
- The existing footer's `Security Report` link (`app.js`, pointing at
  `reports/security/trivy-report.html`) is left as-is for now — issue #79's
  step 2 will decide whether it's replaced by the new nav section or
  coexists with it, rather than this closing decision presupposing that
  design.

## Impact

- No code changes in this decision — docs + a new issue only.
- Issue #79 opened (`type: improvement`) carrying the full requirement
  verbatim plus open step-2 questions (what "existing reports website" means
  in this repo's terms, whether GitHub Code Scanning is actually enabled to
  populate the alerts page, how a static-hosted vanilla-JS site can
  conditionally hide a link for a file that may not exist, and how
  `docs/ci-drafts/trivy.yml` needs to change to additionally export SARIF).
- `docs/ci-drafts/trivy.yml`'s HTML-template output (`contrib/html.tpl`) is
  left in place for now, since it was last confirmed structurally correct
  (three rounds of fixes applied) even though its *output* was never
  end-to-end verified live before this pivot — issue #79 will determine
  whether that step is kept, replaced, or supplemented with a SARIF export.
