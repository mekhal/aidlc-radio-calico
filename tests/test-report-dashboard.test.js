/**
 * Issue #205 (AC2/AC3/AC4): Test Report Dashboard renders the last saved
 * localStorage run as an infographic, reusing index.html's header/sidebar/
 * footer chrome. No app.js DOM surface, so — like harness-serialization.test.js
 * and skills-storage-in-repo.test.js — this is wired directly into
 * tests/test-runner.html rather than the footer modal's app-scoped suite
 * (see tests/test-report-suite-files.js).
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadTestReportDashboard, unloadTestReportDashboard } = window.TestReportDashboardTestHelpers;
  const { STORAGE_KEY, saveTestReport } = window.TestReportStorage;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  describe("Test Report Dashboard (issue #205)", () => {
    it("reuses the same header/sidebar/footer chrome as index.html", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      const root = await loadTestReportDashboard();
      await nextTick();

      expect(root.querySelector(".chloe-header")).toBeTruthy();
      expect(root.querySelector(".chloe-sidebar")).toBeTruthy();
      expect(root.querySelector(".chloe-footer")).toBeTruthy();
      expect(root.querySelector(".chloe-page")).toBeTruthy();

      unloadTestReportDashboard(root);
    });

    it("shows an empty state when no test run has been saved yet", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      const root = await loadTestReportDashboard();
      await nextTick();

      const emptyState = root.querySelector('[data-testid="report-empty-state"]');
      expect(emptyState).toBeTruthy();
      expect(root.querySelector('[data-testid="report-stats-row"]')).toBeFalsy();

      unloadTestReportDashboard(root);
    });

    it("renders summary stat tiles, the results list, and a timestamp from the stored report", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport(
        [
          { name: "test one", passed: true },
          { name: "test two", passed: false, error: "went wrong" },
        ],
        1700000000000
      );

      const root = await loadTestReportDashboard();
      await nextTick();

      expect(root.querySelector('[data-testid="report-stat-total"] .report-stat-tile__value').textContent).toBe(
        "2"
      );
      expect(root.querySelector('[data-testid="report-stat-passed"] .report-stat-tile__value').textContent).toBe(
        "1"
      );
      expect(root.querySelector('[data-testid="report-stat-failed"] .report-stat-tile__value').textContent).toBe(
        "1"
      );
      expect(root.querySelector('[data-testid="report-stat-rate"] .report-stat-tile__value').textContent).toBe(
        "50%"
      );

      const items = root.querySelectorAll('[data-testid="report-result-item"]');
      expect(items.length).toBe(2);
      expect(items[0].className).toContain("is-pass");
      expect(items[1].className).toContain("is-fail");
      expect(items[1].querySelector(".report-list__error").textContent).toBe("went wrong");

      const timestamp = root.querySelector('[data-testid="report-timestamp"]');
      expect(timestamp.textContent.length).toBeGreaterThan(0);

      window.localStorage.removeItem(STORAGE_KEY);
      unloadTestReportDashboard(root);
    });

    it("does not re-run the suite — a stale localStorage value is rendered as-is", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport([{ name: "only this one", passed: true }], 1);

      const root = await loadTestReportDashboard();
      await nextTick();

      const items = root.querySelectorAll('[data-testid="report-result-item"]');
      expect(items.length).toBe(1);
      expect(items[0].textContent).toContain("only this one");

      window.localStorage.removeItem(STORAGE_KEY);
      unloadTestReportDashboard(root);
    });
  });
})();
