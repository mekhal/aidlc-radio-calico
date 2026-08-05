/**
 * Persists the latest test run's results to localStorage (issue #205, AC1),
 * replacing any previously stored run every time saveTestReport() is called.
 * Loaded as a plain <script> global (no npm/imports), like the rest of
 * tests/*.js. Consumed by tests/test-runner.html (writer) and
 * tests/test-report-dashboard.html (reader) — the dashboard never re-runs
 * the suite itself, it only reads whatever was last saved here.
 *
 * Issue #205 PR C (AC-C1): each result also carries a `category` field
 * (the page/component it belongs to, tagged by assert.js's it() via
 * TestHarness.categorizeScriptPath()). Results saved without one already
 * set (e.g. hand-built arrays in tests) default to "index/app" — the same
 * fallback categorizeScriptPath() itself uses for uncategorized paths.
 */
(function (global) {
  const STORAGE_KEY = "radioCalicoTestReport";
  const DEFAULT_CATEGORY = "index/app";

  function summarize(results) {
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    return { total, passed, failed: total - passed };
  }

  function saveTestReport(results, now) {
    const timestamp = typeof now === "number" ? now : Date.now();
    const report = {
      results: results.map((r) => ({
        name: r.name,
        passed: r.passed,
        error: r.error || null,
        category: r.category || DEFAULT_CATEGORY,
      })),
      summary: summarize(results),
      timestamp,
    };
    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(report));
    return report;
  }

  function loadTestReport() {
    const raw = global.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (_e) {
      return null;
    }
  }

  global.TestReportStorage = { STORAGE_KEY, saveTestReport, loadTestReport };
})(window);
