/**
 * Issue #205 (PR C / AC-C1, 2026-08-05 revised AC; extended by issue #538):
 * each stored test result must be tagged with the page/component it belongs
 * to, grouped by test folder — tests/shared/, tests/logo/, tests/menu/,
 * tests/sidebar/, tests/footer/, tests/about/, tests/case-study/,
 * tests/contact/, tests/whats-this/ — with everything else (test files
 * directly under tests/, covering index.html/app.js) bucketed as
 * "index/app".
 *
 * Design: tests/assert.js's it() derives the category from
 * document.currentScript.src at registration time (every *.test.js file in
 * this repo is loaded via a real <script src="...">, including the ones
 * injected by document.write in test-report-suite-files.js — currentScript
 * is set correctly for both) via a new pure, testable
 * window.TestHarness.categorizeScriptPath(url) helper — zero per-file
 * changes needed to the ~20 existing *.test.js files (reuse-first).
 * tests/report-storage.js's saveTestReport() then persists that category
 * alongside name/passed/error.
 *
 * Written before assert.js/report-storage.js implement any of this, per
 * TDD — fails until PR C's Code PR adds categorizeScriptPath() and wires it
 * into it() and saveTestReport().
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { STORAGE_KEY, saveTestReport, loadTestReport } = window.TestReportStorage;

  describe("TestHarness.categorizeScriptPath (issue #205, PR C, AC-C1)", () => {
    it('categorizes a tests/shared/ script path as "shared"', () => {
      expect(window.TestHarness.categorizeScriptPath("http://localhost/tests/shared/shared-state.test.js")).toBe(
        "shared"
      );
    });

    it("categorizes tests/logo/, tests/menu/, tests/sidebar/, and tests/footer/ script paths", () => {
      expect(window.TestHarness.categorizeScriptPath("http://localhost/tests/logo/logo.test.js")).toBe("logo");
      expect(window.TestHarness.categorizeScriptPath("http://localhost/tests/menu/menu.test.js")).toBe("menu");
      expect(window.TestHarness.categorizeScriptPath("http://localhost/tests/sidebar/sidebar.test.js")).toBe(
        "sidebar"
      );
      expect(window.TestHarness.categorizeScriptPath("http://localhost/tests/footer/footer.test.js")).toBe(
        "footer"
      );
    });

    it("categorizes tests/about/, tests/case-study/, tests/contact/, and tests/whats-this/ script paths (issue #538)", () => {
      expect(window.TestHarness.categorizeScriptPath("http://localhost/tests/about/about-page.test.js")).toBe(
        "about"
      );
      expect(
        window.TestHarness.categorizeScriptPath("http://localhost/tests/case-study/case-study.test.js")
      ).toBe("case-study");
      expect(window.TestHarness.categorizeScriptPath("http://localhost/tests/contact/contact-form.test.js")).toBe(
        "contact"
      );
      expect(
        window.TestHarness.categorizeScriptPath("http://localhost/tests/whats-this/whats-this-page.test.js")
      ).toBe("whats-this");
    });

    it('falls back to "index/app" for test files directly under tests/', () => {
      expect(
        window.TestHarness.categorizeScriptPath("http://localhost/tests/now-playing-polling.test.js")
      ).toBe("index/app");
    });
  });

  describe("it() tags each recorded result with its registering script's category (issue #205, PR C, AC-C1)", () => {
    it("marks itself as index/app, since this file lives directly under tests/", () => {
      // no-op: this test's own recorded result is what the next test inspects.
    });

    it("recorded the previous test's result with category \"index/app\"", () => {
      const results = window.TestHarness.getResults();
      const previous = results.find((r) => r.name.includes("marks itself as index/app"));
      expect(previous).toBeTruthy();
      expect(previous.category).toBe("index/app");
    });
  });

  describe("report-storage.js persists the category field (issue #205, PR C, AC-C1)", () => {
    it("saveTestReport() keeps each result's category, and loadTestReport() reads it back", () => {
      window.localStorage.removeItem(STORAGE_KEY);

      const saved = saveTestReport(
        [
          { name: "a shared test", passed: true, category: "shared" },
          { name: "an uncategorized test", passed: true },
        ],
        1
      );
      expect(saved.results[0].category).toBe("shared");
      expect(saved.results[1].category).toBe("index/app");

      const loaded = loadTestReport();
      expect(loaded.results[0].category).toBe("shared");
      expect(loaded.results[1].category).toBe("index/app");

      window.localStorage.removeItem(STORAGE_KEY);
    });
  });
})();
