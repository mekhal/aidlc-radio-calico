/**
 * Issue #548 (follow-up to #544/#545), item 2 of @mekhal's step-3 answer:
 * "ทำ CSS ให้รองรับทั้ง 2 theme โดยใช้หน้า Home เป็นตัวอย่าง" — the report's
 * own inline <style> (previously security-report.html:1-108) hardcoded a
 * private :root palette (--bg/--card/--text/--muted/--border/--error/
 * --success) with no dark-mode variant at all. Extracted into an external
 * reports/security/security-report.css (matching every other chrome-mounted
 * page's pattern — logo.css/menu.css/sidebar.css/footer.css/
 * tests/test-report-dashboard.css) so it can reuse shared/tokens.css's
 * already theme-flipping --chloe-* custom properties instead, same
 * token-reuse pattern as tests/test-report-dashboard-dark-theme.test.js
 * (issue #294) and tests/contact/contact-theme.test.js (issue #506).
 *
 * Item 2 of the issue body: `#security-download-link` currently renders
 * inside its own full-width `.card`, reading as an oversized button — this
 * drops that wrapper for a `.download-row` + a normal-sized `.download-link`
 * pill control.
 *
 * Asserted against the CSS source itself, not computed styles — same
 * rationale as the two precedents above (this suite runs inside
 * tests/test-runner.html, which never links reports/security/
 * security-report.css).
 *
 * Written before reports/security/security-report.css exists, per TDD —
 * fails until this issue's Code PR (step 6) creates it.
 */
(function () {
  "use strict";

  const { describe, it, expect } = window.TestHarness;

  async function readSecurityReportCss() {
    const response = await fetch(window.__SECURITY_REPORT_CSS_PATH__ || "../reports/security/security-report.css");
    if (!response.ok) {
      throw new Error(`Expected to fetch security-report.css, got HTTP ${response.status}`);
    }
    return response.text();
  }

  function extractRule(cssText, selector) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = cssText.match(new RegExp(escaped + "\\s*\\{([^}]*)\\}"));
    if (!match) {
      throw new Error(`Expected to find a "${selector}" rule in security-report.css`);
    }
    return match[1];
  }

  describe("reports/security/security-report.css theme tokens (issue #548)", () => {
    it("drops the page's own hardcoded :root color palette (no --bg/--card custom properties left)", async () => {
      const css = await readSecurityReportCss();
      expect(css.includes("--bg:")).toBeFalsy();
      expect(css.includes("--card:")).toBeFalsy();
      expect(css.includes("#f7f7f8")).toBeFalsy();
    });

    it("styles the report cards with the --chloe-player-box-bg/--chloe-player-box-fg token pair (already theme-flipping)", async () => {
      const css = await readSecurityReportCss();
      const cardRule = extractRule(css, ".card");

      expect(cardRule.includes("var(--chloe-player-box-bg)")).toBeTruthy();
      expect(cardRule.includes("var(--chloe-player-box-fg)")).toBeTruthy();
    });

    it("shrinks the download control to a normal-sized pill button, dropping the full-width .card wrapper (issue #548 item 2)", async () => {
      const css = await readSecurityReportCss();
      expect(css.includes(".download-row")).toBeTruthy();

      const linkRule = extractRule(css, ".download-link");
      expect(linkRule.includes("display: inline-flex")).toBeTruthy();
      expect(/width:\s*100%/.test(linkRule)).toBeFalsy();
    });
  });
})();
