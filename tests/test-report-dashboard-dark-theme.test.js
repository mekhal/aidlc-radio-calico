/**
 * Issue #294 (AC1–AC3): dark-theme readability fixes for the Test Report
 * Dashboard's category-drilldown modal, pass/fail list rows, and Reload
 * button. Root cause (recorded in issue #294): those three rules paired
 * light-pastel `--chloe-mint`/`--chloe-pink` (or the always-white, never-
 * defined `--chloe-cream` fallback) as solid backgrounds with `--chloe-ink`
 * text — `--chloe-ink` flips to a light color under
 * `[data-chloe-theme="dark"]` (shared/tokens.css), so the pairing produces
 * light-on-light in dark theme.
 *
 * Approved fix (issue #294, step-3 approval, 2026-08-06): reuse the
 * `--chloe-player-box-bg`/`--chloe-player-box-fg` pair already used
 * correctly elsewhere on this same page (.report-stat-tile,
 * .report-category-card) for backgrounds/text, and keep the mint/pink-deep
 * accent as a border-left stripe instead of a full background fill for the
 * pass/fail distinction.
 *
 * Asserted against the CSS source itself, not computed styles — this suite
 * runs inside tests/test-runner.html, which never links
 * test-report-dashboard.css (no dashboard chrome is rendered there), so
 * computed-style assertions wouldn't reflect real rendering. Source-text
 * assertions follow the same pattern already used by
 * tests/test-report-suite-completeness.test.js for test-runner.html itself.
 *
 * Written before test-report-dashboard.css implements any of this, per TDD
 * — fails until issue #294's Code PR updates the four rules described above.
 */
(function () {
  "use strict";

  const { describe, it, expect } = window.TestHarness;

  async function readDashboardCss() {
    const response = await fetch("test-report-dashboard.css");
    if (!response.ok) {
      throw new Error(`Expected to fetch test-report-dashboard.css, got HTTP ${response.status}`);
    }
    return response.text();
  }

  function extractRule(cssText, selector) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = cssText.match(new RegExp(escaped + "\\s*\\{([^}]*)\\}"));
    if (!match) {
      throw new Error(`Expected to find a "${selector}" rule in test-report-dashboard.css`);
    }
    return match[1];
  }

  describe("Test Report Dashboard dark-theme readability (issue #294)", () => {
    it("AC1: the category modal drops the dead --chloe-cream fallback for theme-flipping tokens", async () => {
      const css = await readDashboardCss();
      expect(css.includes("--chloe-cream")).toBeFalsy();

      const modalRule = extractRule(css, ".report-category-modal");
      expect(modalRule.includes("var(--chloe-player-box-bg)")).toBeTruthy();
      expect(modalRule.includes("var(--chloe-player-box-fg)")).toBeTruthy();
    });

    it("AC2: pass/fail rows use a border accent instead of a full mint/pink background fill", async () => {
      const css = await readDashboardCss();

      const baseRule = extractRule(css, ".report-list__item");
      expect(baseRule.includes("var(--chloe-player-box-bg)")).toBeTruthy();
      expect(baseRule.includes("var(--chloe-player-box-fg)")).toBeTruthy();

      const passRule = extractRule(css, ".report-list__item.is-pass");
      expect(passRule.includes("background: var(--chloe-mint)")).toBeFalsy();
      expect(passRule.includes("border-left")).toBeTruthy();
      expect(passRule.includes("var(--chloe-mint)")).toBeTruthy();

      const failRule = extractRule(css, ".report-list__item.is-fail");
      expect(failRule.includes("background: var(--chloe-pink)")).toBeFalsy();
      expect(failRule.includes("border-left")).toBeTruthy();
      expect(failRule.includes("var(--chloe-pink-deep)")).toBeTruthy();
    });

    it("AC3: the Reload button drops the mint/ink pairing for theme-flipping tokens", async () => {
      const css = await readDashboardCss();
      const buttonRule = extractRule(css, ".report-reload-button");
      expect(buttonRule.includes("var(--chloe-mint)")).toBeFalsy();
      expect(buttonRule.includes("var(--chloe-ink)")).toBeFalsy();
      expect(buttonRule.includes("var(--chloe-player-box-bg)")).toBeTruthy();
      expect(buttonRule.includes("var(--chloe-player-box-fg)")).toBeTruthy();
    });
  });
})();
