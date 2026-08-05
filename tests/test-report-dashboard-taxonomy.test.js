/**
 * Issue #205 (PR C / AC-C2/AC-C3, 2026-08-05 revised AC): the dashboard
 * renders one summary card per category present in the stored results
 * (grouped by report-category-tagging.test.js's category field), laid out
 * in a Bootstrap col-md-4 grid so more categories fit without a layout
 * change, each with a donut chart of pass/fail. Clicking a card opens a
 * drill-down modal listing only that category's results.
 *
 * Written before test-report-dashboard.js implements any of this, per TDD
 * — fails until PR C's Code PR adds the category grid/cards/donut/modal.
 * Depends on PR C's other test file (report-category-tagging.test.js) for
 * the `category` field on stored results — this file seeds it directly via
 * saveTestReport() rather than relying on live categorization, so it does
 * not depend on load order between the two PR C test files.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadTestReportDashboard, unloadTestReportDashboard } = window.TestReportDashboardTestHelpers;
  const { STORAGE_KEY, saveTestReport } = window.TestReportStorage;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  describe("Test Report Dashboard: per-category donut cards (issue #205, PR C, AC-C2)", () => {
    it("renders one card per distinct category, laid out in a col-md-4 grid", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport(
        [
          { name: "a", passed: true, category: "shared" },
          { name: "b", passed: false, error: "x", category: "shared" },
          { name: "c", passed: true, category: "logo" },
        ],
        1
      );
      const root = await loadTestReportDashboard();
      await nextTick();

      const grid = root.querySelector('[data-testid="report-category-grid"]');
      expect(grid).toBeTruthy();

      const cards = root.querySelectorAll('[data-testid="report-category-card"]');
      expect(cards.length).toBe(2);

      const sharedCard = root.querySelector('[data-testid="report-category-card-shared"]');
      expect(sharedCard).toBeTruthy();
      expect(sharedCard.className).toContain("col-md-4");

      window.localStorage.removeItem(STORAGE_KEY);
      unloadTestReportDashboard(root);
    });

    it("shows a donut chart and the total/passed/failed counts on each category card", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport(
        [
          { name: "a", passed: true, category: "shared" },
          { name: "b", passed: false, error: "x", category: "shared" },
        ],
        1
      );
      const root = await loadTestReportDashboard();
      await nextTick();

      const sharedCard = root.querySelector('[data-testid="report-category-card-shared"]');
      expect(sharedCard.querySelector('[data-testid="report-category-donut"]')).toBeTruthy();
      expect(sharedCard.textContent.includes("2")).toBeTruthy();
      expect(sharedCard.textContent.includes("1")).toBeTruthy();

      window.localStorage.removeItem(STORAGE_KEY);
      unloadTestReportDashboard(root);
    });

    it("keeps AC3's overall summary stat tiles alongside the new per-category grid", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport([{ name: "a", passed: true, category: "shared" }], 1);
      const root = await loadTestReportDashboard();
      await nextTick();

      expect(root.querySelector('[data-testid="report-stats-row"]')).toBeTruthy();
      expect(root.querySelector('[data-testid="report-category-grid"]')).toBeTruthy();

      window.localStorage.removeItem(STORAGE_KEY);
      unloadTestReportDashboard(root);
    });
  });

  describe("Test Report Dashboard: category drill-down modal (issue #205, PR C, AC-C3)", () => {
    it("clicking a category card opens a modal listing only that category's results", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport(
        [
          { name: "shared one", passed: true, category: "shared" },
          { name: "logo one", passed: true, category: "logo" },
        ],
        1
      );
      const root = await loadTestReportDashboard();
      await nextTick();

      root.querySelector('[data-testid="report-category-card-shared"]').click();
      await nextTick();

      const modal = document.querySelector('[data-testid="report-category-modal"]');
      expect(modal).toBeTruthy();
      expect(modal.textContent.includes("shared one")).toBeTruthy();
      expect(modal.textContent.includes("logo one")).toBeFalsy();

      const closeButton = modal.querySelector('[data-testid="report-category-modal-close"]');
      if (closeButton) closeButton.click();

      window.localStorage.removeItem(STORAGE_KEY);
      unloadTestReportDashboard(root);
    });

    it("closes the modal via its close control", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport([{ name: "shared one", passed: true, category: "shared" }], 1);
      const root = await loadTestReportDashboard();
      await nextTick();

      root.querySelector('[data-testid="report-category-card-shared"]').click();
      await nextTick();
      document.querySelector('[data-testid="report-category-modal-close"]').click();
      await nextTick();

      expect(document.querySelector('[data-testid="report-category-modal"]')).toBeFalsy();

      window.localStorage.removeItem(STORAGE_KEY);
      unloadTestReportDashboard(root);
    });
  });
})();
