/**
 * Issue #394 (further review, 2026-08-25, "แก้ไข style table References &
 * Acknowledgements ด้วย"): `.chloe-about-references__list` only relied on
 * Bootstrap's default `.list-group-item` styling (white surface, dark
 * border/text), the same theme-disconnect bug Section 2's table had before
 * its AC3 fix. Fix: override Bootstrap's own `--bs-list-group-*` custom
 * properties (which `.list-group-item` reads via `var()`) with the
 * `--chloe-sage`/`--chloe-ink` pair already used for Section 2's table body
 * — both already flip correctly under `[data-chloe-theme="dark"]` in
 * shared/tokens.css.
 *
 * Asserted against the CSS source itself, not computed styles — same
 * rationale and pattern as tests/about/about-standards-theme.test.js (this
 * suite runs inside tests/test-runner.html, which never links
 * about/about.css).
 *
 * Test PR waived by the human at this turn ("ข้าม Test PR ไปได้เลย") —
 * bundled into the Code PR per CLAUDE.md's Definition of Done to still
 * demonstrate the AC is met.
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

  describe(".chloe-about-references__list theme tokens (issue #394 follow-up)", () => {
    it("styles the list-group with the --chloe-sage/--chloe-ink token pair instead of Bootstrap defaults", async () => {
      const css = await readAboutCss();
      const listRule = extractRule(css, ".chloe-about-references__list");

      expect(listRule.includes("var(--chloe-sage)")).toBeTruthy();
      expect(listRule.includes("var(--chloe-ink)")).toBeTruthy();
    });

    it("overrides Bootstrap's --bs-list-group-bg/--bs-list-group-color/--bs-list-group-border-color custom properties", async () => {
      const css = await readAboutCss();
      const listRule = extractRule(css, ".chloe-about-references__list");

      expect(listRule.includes("--bs-list-group-bg")).toBeTruthy();
      expect(listRule.includes("--bs-list-group-color")).toBeTruthy();
      expect(listRule.includes("--bs-list-group-border-color")).toBeTruthy();
    });
  });
})();
