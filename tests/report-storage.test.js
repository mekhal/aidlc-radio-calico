/**
 * Issue #205, AC1: persist the latest test run's results to localStorage,
 * replacing any previously stored run each time. No app/DOM surface — like
 * harness-serialization.test.js, this exercises a standalone tests/*.js
 * module directly, so it's wired straight into tests/test-runner.html rather
 * than the footer modal's app-scoped suite (see tests/test-report-suite-files.js).
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { STORAGE_KEY, saveTestReport, loadTestReport } = window.TestReportStorage;

  describe("Test report localStorage persistence (issue #205, AC1)", () => {
    it("returns null when nothing has been saved yet", () => {
      window.localStorage.removeItem(STORAGE_KEY);

      expect(loadTestReport()).toBe(null);
    });

    it("saves results, summary counts, and a timestamp", () => {
      window.localStorage.removeItem(STORAGE_KEY);

      const results = [
        { name: "a", passed: true },
        { name: "b", passed: false, error: "boom" },
      ];
      saveTestReport(results, 1234);
      const report = loadTestReport();

      expect(report.timestamp).toBe(1234);
      expect(report.summary).toEqual({ total: 2, passed: 1, failed: 1 });
      expect(report.results).toEqual([
        { name: "a", passed: true, error: null, category: "index/app" },
        { name: "b", passed: false, error: "boom", category: "index/app" },
      ]);

      window.localStorage.removeItem(STORAGE_KEY);
    });

    it("replaces the previously stored run instead of accumulating", () => {
      window.localStorage.removeItem(STORAGE_KEY);

      saveTestReport([{ name: "old", passed: true }], 1);
      saveTestReport([{ name: "new", passed: false, error: "nope" }], 2);
      const report = loadTestReport();

      expect(report.results.length).toBe(1);
      expect(report.results[0].name).toBe("new");
      expect(report.timestamp).toBe(2);

      window.localStorage.removeItem(STORAGE_KEY);
    });
  });
})();
