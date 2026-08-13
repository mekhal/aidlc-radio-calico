# Issue #330 close — Unit test pass-rate investigation → menu.js/sidebar.js IIFE fix

## Context

Issue #330 reported the Test Report Dashboard passing only 67% (107/159) and asked for a
root-cause check on why so many unit tests failed, and whether failing tests still corresponded to
live functionality.

The loop ran across several turns:

1. Step 2 review: read the dashboard screenshots, traced concrete failing tests back to app
   source, and confirmed the failing tests exercise **currently-shipped** functionality (not stale
   tests for removed features). Found one concrete, fixable bug: `menu/menu.js` and
   `sidebar/sidebar.js` declare top-level `const` outside an IIFE, unlike `album-promo.js`. Because
   the test harness re-injects each dependency as a fresh `<script>` tag per test, a second
   injection of either file throws `Uncaught SyntaxError: Identifier '...' has already been
   declared` — which doesn't directly fail a test (the harness has no `window.onerror` listener)
   but does mean the script's code never re-executes after the first load, undermining the
   per-test-clean-mount design and freezing state like `SIDEBAR_BASE_PATH` at whatever the first
   injection computed.
2. `@claude approved  ในตัว js ที่ถูก Reuse ใช้ซ้ำในหน้าอื่น ให้ปรับ concept เป็น IIFE` — scope
   confirmed as the two reused files (`menu.js`/`sidebar.js`, both called from `album-promo.js` and
   `tests/test-report-dashboard.js`). Test PR [#334](https://github.com/mekhal/aidlc-radio-calico/pull/334)
   pinned the re-injection-safety AC (script injectable twice without an uncaught redeclaration
   error, `SIDEBAR_BASE_PATH` re-evaluates on every injection instead of freezing). Merged.
3. `@claude review` — a screenshot showed the same 159/107/52 numbers as the very first
   screenshot, which didn't add up against the merged Test PR; explained as a stale/cached
   dashboard load rather than a regression (a fresh run should show the two new red tests as
   expected TDD-red, not a new problem).
4. `@claude approved  นอกจาก menu.js และ sidebar.js แล้ว ช่วยตรวจสอบเพิ่มเติม...` — full
   codebase audit (`grep` every `*.js` for top-level `const`/`let`/`class` outside an IIFE, cross-checked
   against actual `<script>` includes and every externally-called global) confirmed **no other
   file** needed the same fix: `app.js`/`album-promo.js` already IIFE-wrapped; `logo.js`/`footer.js`/
   `shared/helpers.js` only use `function` declarations (safe to redeclare); `shared/state.js`/
   `shared/translations.js` only use `var` (also safe). Code PR
   [#337](https://github.com/mekhal/aidlc-radio-calico/pull/337) wrapped both files in the same
   IIFE pattern `album-promo.js` uses, explicitly attaching `window.buildMenu` / `window.buildSidebar`
   / `window.SIDEBAR_BASE_PATH` since these no longer auto-attach once inside a function scope.
   Merged into `develop`, then promoted to `main` via PR #338.
5. `@claude approve  test result look ok` — confirmed PR #337 already merged and IIFE wrapping
   present on disk; flagged the literal-trigger-vs-message-text ambiguity (advance vs. close) per
   the `gate-trigger-vs-intent-mismatch` skill rather than guessing, and asked which was meant.
6. `@claude close  coding 5 satisfied 5  please create a new task for update other reuse JS` —
   scores given directly; human asked for a new, separate ticket to track further reused-JS
   auditing going forward.

## Decision

1. **Root cause was a JS global-scope redeclaration bug, not stale/obsolete tests.** All failing
   tests traced were exercising live functionality; the fix was to the reused source files
   (`menu.js`, `sidebar.js`), not to prune tests.
2. **IIFE-wrap scope limited to files that are both top-level `const`/`let`/`class` AND reused
   across pages** — confirmed by grep-based audit, not guesswork. `function`-only and `var`-only
   files were correctly left untouched since neither breaks on script re-injection.
3. **The ~45 pre-existing "Index/App" bucket failures (issue #221/#158-flavored `Cannot read
   properties of null` errors) are explicitly out of scope for this ticket** — flagged at step 2 and
   again at the penultimate turn, never pulled into this loop's Test/Code PRs.
4. **A new, separate ticket for continued/further reused-JS auditing was requested directly by
   @mekhal at close**, rather than the agent unilaterally deciding to expand this issue's scope —
   consistent with "missed functionality becomes a NEW issue." The agent creates this ticket
   because it was explicitly asked to, but does not embed a live `@claude` trigger in the new
   issue's body — the human decides when to start that loop.
5. **Case Study showcase (`data/case-studies.json`) — not yet applicable.** The file doesn't exist
   yet, so this close does not propose a showcase entry.

## Non-decision

Whether to open a ticket for the ~45 Index/App bucket failures was raised as a question at the
penultimate turn but not answered before close; it remains open for @mekhal to request separately
if wanted (distinct from the "other reuse JS" ticket created at this close, which is about the
IIFE/global-scope audit pattern, not the unrelated null-reference bucket).
