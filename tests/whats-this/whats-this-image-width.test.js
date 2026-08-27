/**
 * Issue #522 (follow-up from #505, reported after #509 shipped): per
 * @mekhal's live review, the `aidlcLoop`/`skillCapture` diagram images
 * (`aidlc-loop-gates.jpg`, `skill-reuse-gates.png`) rendered at close to
 * full page width, uncropped — `.whats-this-image` (whats-this.css) had no
 * `max-width` of its own, only the shared `img-fluid` Bootstrap class
 * (`max-width: 100%` of its *container*), and the section container itself
 * has no cap either. AC2 (step 3 decision, 2026-08-27): cap
 * `.whats-this-image` at `max-width: 42rem`, matching the text column
 * already established by `.chloe-whats-this-what__body` (whats-this.css).
 *
 * Asserted against the CSS source itself, not computed styles — this suite
 * runs inside tests/test-runner.html, which never links whats-this/whats-this.css
 * (no What's this page chrome is rendered there), so computed-style
 * assertions wouldn't reflect real rendering. Source-text assertions follow
 * the same pattern already used by
 * tests/about/about-standards-theme.test.js for issue #394's theme-token
 * fixes.
 *
 * Step 3 waiver approved (2026-08-27): Test PR skipped, this test is
 * bundled directly into the Code PR instead (CLAUDE.md's Definition of
 * Done, "tests bundled into the Code PR" option).
 *
 * Issue #529 (follow-up from #522's close): the 42rem cap alone left the
 * image wrapper flush against the section's left edge on viewports wider
 * than 42rem — `margin: 0 0 1.5rem` has no horizontal auto-margin to center
 * the capped box. AC1: `margin: 0 auto 1.5rem`. Test PR waived again
 * (2026-08-27), bundled into this Code PR.
 */
(function () {
  "use strict";

  const { describe, it, expect } = window.TestHarness;

  async function readWhatsThisCss() {
    const response = await fetch(window.__WHATS_THIS_CSS_PATH__ || "../whats-this/whats-this.css");
    if (!response.ok) {
      throw new Error(`Expected to fetch whats-this/whats-this.css, got HTTP ${response.status}`);
    }
    return response.text();
  }

  function extractRule(cssText, selector) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = cssText.match(new RegExp(escaped + "\\s*\\{([^}]*)\\}"));
    if (!match) {
      throw new Error(`Expected to find a "${selector}" rule in whats-this/whats-this.css`);
    }
    return match[1];
  }

  describe(".whats-this-image width cap (issue #522 AC2)", () => {
    it("caps the shared diagram image wrapper at max-width: 42rem, matching the text column", async () => {
      const css = await readWhatsThisCss();
      const rule = extractRule(css, ".whats-this-image");

      expect(rule.includes("max-width: 42rem")).toBeTruthy();
    });
  });

  describe(".whats-this-image centering (issue #529 AC1)", () => {
    it("centers the capped image wrapper horizontally via a horizontal auto margin", async () => {
      const css = await readWhatsThisCss();
      const rule = extractRule(css, ".whats-this-image");

      expect(rule.includes("margin: 0 auto 1.5rem")).toBeTruthy();
    });
  });
})();
