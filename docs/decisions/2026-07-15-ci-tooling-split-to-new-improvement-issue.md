# Decision: CI tooling (lint / security scan / coverage) is split out of issue #54 into a new Improvement issue

**Issue:** [#54](https://github.com/mekhal/aidlc-radio-calico/issues/54) — ตรวจสอบ Test Failed ใน Test Report
**Decided by:** @mekhal, 2026-07-15

## Decision

Issue #54's own AC (Test Report modal passes 31/31 on the live deploy) was already closed out on 2026-07-15 (see [[2026-07-15-test-report-live-verification-and-suite-file-fixes]]). A follow-up review thread on the same issue then explored adding CI-driven lint, security scanning, and test coverage — this is **out of scope for #54** and is split into a **new `type: improvement` issue** instead of being bundled into #54's already-closed loop, per `CLAUDE.md`'s "missed functionality becomes a NEW issue" rule.

Tool choices settled during the review thread, to seed the new issue's step 2 context:

- **Lint:** Mega-Linter (container-based GitHub Action, no `npm install` needed in-repo) — plus a footer link/button to the published static lint report page, distinct from the existing client-side "Test Report" modal (issue #41), since Mega-Linter only runs in CI, not in the user's browser.
- **Test coverage:** dropped from scope entirely — the repo's vanilla test runner has no coverage instrumentation, and adding any would mean revisiting the manual-only design in [[2026-07-12-testing-framework-vanilla-runner]], which was out of scope for this thread.
- **Security scan:** Trivy (container-based GitHub Action, filesystem scan for secrets/misconfig — more relevant to this CDN-only repo than `npm audit`), exporting an HTML report via Trivy's bundled HTML template.

## Why

- Per `CLAUDE.md`: "Missed functionality becomes a NEW issue — never expand scope inside the current loop." Issue #54 was scoped to fixing the Test Report modal's failing tests; CI tooling is a separate capability with its own AC and its own step-2 discovery.
- Both tools were chosen specifically because they **do not require `npm install`** in the repo, honoring [[2026-07-12-tech-stack-vanilla-js-jquery]] ("the app never runs `npm install`") — that decision was written about app runtime dependencies, but the new issue should confirm explicitly whether it also covers CI/dev-tooling `package.json` files, since this hasn't been asked before.
- Any workflow YAML for Mega-Linter/Trivy lives under `.github/workflows/`, which the Claude agent cannot write to (GitHub App permission boundary, same category as the `.claude/` write-guard) — the new issue's plan must account for a human committing the workflow file(s) from an agent-drafted copy outside that directory.

## Impact

- No code changes in this decision — docs only.
- A new issue (`type: improvement`) is opened to track: Mega-Linter (lint) with a footer report link, Trivy (security scan) with HTML export, and no test-coverage tooling. Step 2 (5 questions) still needs to run on that issue before a plan/AC is posted.
- The `verify-dom-fix-on-live-deploy` skill candidate raised earlier in #54 (see [[2026-07-15-test-report-live-verification-and-suite-file-fixes]]) remains a separate, still-open decision — not part of this split.
