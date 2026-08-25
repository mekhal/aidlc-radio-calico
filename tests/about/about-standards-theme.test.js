/**
 * Issue #394 (split from #151's close), AC3: `.chloe-about-standards__table`
 * only relies on Bootstrap's default `table.table` styling (white surface,
 * gray borders), disconnected from the page's mint/sage/serif theme in both
 * light and dark mode. Step-3 decision (2026-08-25, "การจับคู่สีธีม...
 * อนุมัติตามที่เสนอ"): style the table body with the `--chloe-sage`/
 * `--chloe-ink` pair (already the page's own section background/text
 * elsewhere) and its `<thead>` with `--chloe-player-box-bg`/`-fg` for
 * contrast — both pairs already flip correctly under
 * `[data-chloe-theme="dark"]` in shared/tokens.css (verified against the
 * theme-token-background-audit published skill: reuse a proven-flip token
 * pair rather than inventing one), so no new dark-theme override is needed.
 *
 * Asserted against the CSS source itself, not computed styles — this suite
 * runs inside tests/test-runner.html, which never links about/about.css (no
 * About page chrome is rendered there), so computed-style assertions
 * wouldn't reflect real rendering. Source-text assertions follow the same
 * pattern already used by tests/test-report-dashboard-dark-theme.test.js for
 * issue #294's dark-theme token fixes.
 *
 * Written before about/about.css adds any `.chloe-about-standards__table`
 * rule, per TDD — fails until this issue's Code PR (step 6) adds it. See
 * tests/about/about-standards.test.js for the AC1/AC2 (i18n) coverage.
 */
(function () {
  "use strict";

  const { describe, it, expect } = window.TestHarness;

  async function readAboutCss() {
    const response = await fetch(window.__ABOUT_CSS_PATH__ || "../about/about.css");
    if (!response.ok) {
      throw new Error(`Expected to fetch about/about.css, got HTTP ${response.status}`);
    }
    return response.text();
  }

  function extractRule(cssText, selector) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = cssText.match(new RegExp(escaped + "\\s*\\{([^}]*)\\}"));
    if (!match) {
      throw new Error(`Expected to find a "${selector}" rule in about/about.css`);
    }
    return match[1];
  }

  describe(".chloe-about-standards__table theme tokens (issue #394 AC3)", () => {
    it("styles the table body with the --chloe-sage/--chloe-ink token pair instead of Bootstrap defaults", async () => {
      const css = await readAboutCss();
      const tableRule = extractRule(css, ".chloe-about-standards__table");

      expect(tableRule.includes("var(--chloe-sage)")).toBeTruthy();
      expect(tableRule.includes("var(--chloe-ink)")).toBeTruthy();
    });

    it("styles the table header with the --chloe-player-box-bg/--chloe-player-box-fg token pair for contrast", async () => {
      const css = await readAboutCss();
      const theadRule = extractRule(css, ".chloe-about-standards__table thead");

      expect(theadRule.includes("var(--chloe-player-box-bg)")).toBeTruthy();
      expect(theadRule.includes("var(--chloe-player-box-fg)")).toBeTruthy();
    });
  });
})();
