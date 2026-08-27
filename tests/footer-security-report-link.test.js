/**
 * Issue #87 (supersedes issue #79's version of this link): footer link
 * pointed directly at the Trivy SARIF report published by CI, instead of
 * GitHub's native Code Scanning Alerts page.
 *
 * Issue #544: re-pointed again, this time at the new
 * reports/security/security-report.html text-summary report (Option A —
 * see this issue's review thread) instead of the raw .sarif file, so a
 * human reviewer gets a readable Passed/Failed + category breakdown instead
 * of downloading raw SARIF JSON. The raw file is still reachable via that
 * page's own download link. Same <a target="_blank"> shape as
 * tests/footer-lint-report-link.test.js, just re-pointed.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadApp, unloadApp } = window.AppTestHelpers;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function findFooterSecurityReportLink(root) {
    return root.querySelector('[data-testid="footer-security-report-link"]');
  }

  describe("Footer security report link (issue #87)", () => {
    it("is a link to the published Trivy SARIF report, labeled 'Security Scan Report', that opens in a new tab", async () => {
      window.installMockHls();
      const root = await loadApp();
      await nextTick();

      const link = findFooterSecurityReportLink(root);
      expect(link).toBeTruthy();
      expect(link.tagName).toBe("A");
      expect(link.textContent).toBe("Security Scan Report");
      expect(link.getAttribute("href")).toBe("reports/security/security-report.html");
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");

      unloadApp(root);
    });
  });
})();
