/**
 * Issue #340 (follow-up to issue #330): standing regression test for the bug
 * traced in #330 — a reused *.js file that declares a top-level
 * const/let/class outside an IIFE throws an uncaught SyntaxError the second
 * time the test harness re-injects it as a fresh <script> tag (redeclaration
 * in the same global scope), silently preventing that script's code from
 * re-executing after the first load. menu/menu.js and sidebar/sidebar.js hit
 * this in #330 (see docs/decisions/2026-08-10-issue-330-unit-test-pass-rate-iife-fix.md)
 * and were wrapped in the same IIFE pattern album-promo.js already used.
 *
 * This suite automates the manual audit re-run #340 asked for: fetch every
 * app-source *.js file's own text and fail if any of them regress, using the
 * same detection technique (a line starting with const/let/class at column
 * 0 sits outside any wrapping block — an IIFE body's declarations are
 * indented) as the manual audits linked above.
 *
 * Doc-content assertion, same category as skills-storage-in-repo.test.js —
 * no app/DOM behavior, so it needs tests/test-runner.html served over
 * http(s) (see tests/README.md).
 */
(function () {
  const { describe, it, expect } = window.TestHarness;

  // Every app-source *.js file (mirrors the audit table posted on issue
  // #340) — add new entries here whenever a new one is added to the repo,
  // since that's exactly the regression this suite exists to catch.
  const APP_SOURCE_JS_FILES = [
    "app.js",
    "album-promo.js",
    "case-study/case-study.js",
    "footer/footer.js",
    "logo/logo.js",
    "menu/menu.js",
    "sidebar/sidebar.js",
    "shared/helpers.js",
    "shared/state.js",
    "shared/translations.js",
  ];

  const TOP_LEVEL_DECLARATION = /^(const|let|class)\s/m;

  async function readRepoFile(relativePath) {
    const path = `../${relativePath}`;
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Expected to fetch ${path}, got HTTP ${response.status}`);
    }
    return response.text();
  }

  describe("Reused JS files stay IIFE-safe under repeated <script> re-injection (issue #340)", () => {
    APP_SOURCE_JS_FILES.forEach((file) => {
      it(`${file} has no top-level const/let/class outside an IIFE`, async () => {
        const source = await readRepoFile(file);
        expect(TOP_LEVEL_DECLARATION.test(source)).toBeFalsy();
      });
    });
  });
})();
