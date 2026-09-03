/**
 * Issue #67, AC2: the footer's on-demand Test Report modal (app.js, since
 * deleted as dead code per issue #585) was scoped down to only app.js's own
 * HTML/DOM interface-function tests — tests/harness-serialization.test.js
 * (tests the assert.js harness itself) and tests/skills-storage-in-repo.test.js
 * (doc-content assertions, no app/DOM behavior) no longer belonged there.
 * window.TEST_REPORT_SUITE_FILES (tests/test-report-suite-files.js) is now
 * permanently empty since app.js's modal was its only consumer, but these two
 * files still need to run somewhere, so this asserts they stay wired directly
 * into tests/test-runner.html's script list rather than that (now-empty) list.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;

  async function readOwnPage() {
    const response = await fetch("test-runner.html");
    if (!response.ok) {
      throw new Error(`Expected to fetch test-runner.html, got HTTP ${response.status}`);
    }
    return response.text();
  }

  describe("Test Report modal scoping (issue #67, AC2)", () => {
    it("excludes non-interface-function tests from the modal's scoped suite", () => {
      expect(window.TEST_REPORT_SUITE_FILES.includes("harness-serialization.test.js")).toBeFalsy();
      expect(window.TEST_REPORT_SUITE_FILES.includes("skills-storage-in-repo.test.js")).toBeFalsy();
    });

    it("still wires harness-serialization.test.js directly into test-runner.html", async () => {
      const html = await readOwnPage();
      expect(html.includes('<script src="harness-serialization.test.js"></script>')).toBeTruthy();
    });

    it("still wires skills-storage-in-repo.test.js directly into test-runner.html", async () => {
      const html = await readOwnPage();
      expect(html.includes('<script src="skills-storage-in-repo.test.js"></script>')).toBeTruthy();
    });
  });
})();
