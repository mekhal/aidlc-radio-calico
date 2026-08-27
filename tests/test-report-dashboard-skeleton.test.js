/**
 * Issue #533 (plan approved 2026-08-27): replaces the full-screen
 * `report-loading-backdrop` overlay (`.report-loading-backdrop`,
 * `position: fixed; inset: 0`) with an in-place loading skeleton that
 * mirrors the stats-row + category-grid layout, so the dashboard chrome
 * (header/sidebar/heading/Reload button) stays visible while a run is in
 * flight instead of being covered by a full-screen overlay.
 *
 * Acceptance Criteria (this Test PR):
 *   AC1: no full-screen backdrop on either trigger path (Reload Test click,
 *        empty-storage auto-run per AC-B3/issue #205); the dashboard chrome
 *        stays visible and interactive while loading — the Reload Test
 *        button itself is disabled during loading only to prevent a
 *        double-run (the existing `startTestRun()` re-entrancy guard this
 *        replaces), not because chrome becomes unreachable.
 *   AC2: a skeleton renders in place of the stats row + category grid,
 *        matching their tile/card layout, with each placeholder block
 *        carrying a shimmer/pulse class (`report-skeleton__pulse`) for the
 *        animation — see test-report-dashboard.css for the actual
 *        shimmer/pulse keyframes (dark-theme-safe per
 *        docs/knowledge-asset/published/theme-token-background-audit.md).
 *        This suite only asserts the structural class marker: like the rest
 *        of this file, tests/test-runner.html does not load
 *        test-report-dashboard.css, so computed-animation assertions
 *        wouldn't reflect real CSS here (see tests/test-report-dashboard.test.js
 *        and hero-listen-now-control.test.js for the same getComputedStyle
 *        caveat/precedent).
 *   AC3: on completion, the skeleton is replaced by real content in the
 *        same synchronous render as `onTestRunComplete` — asserted by
 *        checking the skeleton is gone and the real stats-row/category-grid
 *        are present together, with no intermediate frame showing neither.
 *   Skeleton category-card count: mirrors the previously-stored report's
 *        category count (so a Reload doesn't shift the grid's layout once
 *        real data lands); falls back to a fixed default of 3 placeholder
 *        cards when there is no previous report yet (true first-ever load).
 *
 * Written before test-report-dashboard.js implements any of this, per TDD
 * — fails until this issue's Code PR replaces buildLoadingBackdrop() with
 * the skeleton described above.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadTestReportDashboard, unloadTestReportDashboard } = window.TestReportDashboardTestHelpers;
  const { STORAGE_KEY, saveTestReport } = window.TestReportStorage;

  const DEFAULT_SKELETON_CARD_COUNT = 3;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function stubIframeNavigation() {
    const originalDescriptor =
      Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "src") ||
      Object.getOwnPropertyDescriptor(HTMLElement.prototype, "src");
    let capturedSrc = null;

    Object.defineProperty(HTMLIFrameElement.prototype, "src", {
      configurable: true,
      set(value) {
        capturedSrc = value;
        this.setAttribute("data-stubbed-src", value);
      },
      get() {
        return capturedSrc;
      },
    });

    return {
      getSrc: () => capturedSrc,
      restore() {
        if (originalDescriptor) {
          Object.defineProperty(HTMLIFrameElement.prototype, "src", originalDescriptor);
        }
      },
    };
  }

  function cleanupStray() {
    const skeleton = document.querySelector('[data-testid="report-dashboard-skeleton"]');
    if (skeleton) skeleton.remove();
    const backdrop = document.querySelector('[data-testid="report-loading-backdrop"]');
    if (backdrop) backdrop.remove();
    const iframe = document.querySelector('[data-testid="report-test-runner-iframe"]');
    if (iframe) iframe.remove();
    window.localStorage.removeItem(STORAGE_KEY);
  }

  describe("Test Report Dashboard: loading skeleton replaces the full-screen backdrop (issue #533)", () => {
    it("clicking Reload Test shows an in-place skeleton, not a full-screen backdrop (AC1)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport([{ name: "a", passed: true, category: "index/app" }], 1);
      const stub = stubIframeNavigation();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();

        root.querySelector('[data-testid="report-reload-button"]').click();
        await nextTick();

        expect(document.querySelector('[data-testid="report-loading-backdrop"]')).toBeFalsy();
        expect(root.querySelector('[data-testid="report-dashboard-skeleton"]')).toBeTruthy();

        // Chrome stays visible/interactive — not covered by any full-screen element.
        expect(root.querySelector(".chloe-header")).toBeTruthy();
        expect(root.querySelector(".chloe-sidebar")).toBeTruthy();
        expect(root.querySelector(".report-heading")).toBeTruthy();

        unloadTestReportDashboard(root);
      } finally {
        stub.restore();
        cleanupStray();
      }
    });

    it("disables the Reload Test button while the skeleton is showing, to prevent a double-run (AC1)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport([{ name: "a", passed: true, category: "index/app" }], 1);
      const stub = stubIframeNavigation();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();

        const reloadButton = root.querySelector('[data-testid="report-reload-button"]');
        reloadButton.click();
        await nextTick();

        expect(reloadButton.disabled).toBeTruthy();

        unloadTestReportDashboard(root);
      } finally {
        stub.restore();
        cleanupStray();
      }
    });

    it("renders a skeleton stat tile per real stat tile (4), each with a shimmer/pulse class (AC2)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport([{ name: "a", passed: true, category: "index/app" }], 1);
      const stub = stubIframeNavigation();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();

        root.querySelector('[data-testid="report-reload-button"]').click();
        await nextTick();

        const tiles = root.querySelectorAll('[data-testid="report-skeleton-stat-tile"]');
        expect(tiles.length).toBe(4);
        tiles.forEach((tile) => {
          expect(tile.className).toContain("report-skeleton__pulse");
        });

        unloadTestReportDashboard(root);
      } finally {
        stub.restore();
        cleanupStray();
      }
    });

    it("still shows the hidden iframe pointed at test-runner.html while the skeleton is up (AC-B1 carried over)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport([{ name: "a", passed: true, category: "index/app" }], 1);
      const stub = stubIframeNavigation();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();

        root.querySelector('[data-testid="report-reload-button"]').click();
        await nextTick();

        const iframe = document.querySelector('[data-testid="report-test-runner-iframe"]');
        expect(iframe).toBeTruthy();
        expect(stub.getSrc() || "").toContain("test-runner.html");
        expect(iframe.hidden || iframe.style.display === "none").toBeTruthy();

        unloadTestReportDashboard(root);
      } finally {
        stub.restore();
        cleanupStray();
      }
    });

    it("replaces the skeleton with real content (no intermediate empty frame) once onTestRunComplete fires (AC3)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport([{ name: "old", passed: true, category: "index/app" }], 1);
      const stub = stubIframeNavigation();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();

        root.querySelector('[data-testid="report-reload-button"]').click();
        await nextTick();

        saveTestReport(
          [
            { name: "fresh one", passed: true, category: "index/app" },
            { name: "fresh two", passed: false, error: "x", category: "index/app" },
          ],
          2
        );

        window.onTestRunComplete();
        await nextTick();

        expect(root.querySelector('[data-testid="report-dashboard-skeleton"]')).toBeFalsy();
        expect(root.querySelector('[data-testid="report-stats-row"]')).toBeTruthy();
        expect(root.querySelector('[data-testid="report-category-grid"]')).toBeTruthy();

        const reloadButton = root.querySelector('[data-testid="report-reload-button"]');
        expect(reloadButton.disabled).toBeFalsy();

        unloadTestReportDashboard(root);
      } finally {
        stub.restore();
        cleanupStray();
      }
    });

    it("auto-runs on empty storage with a skeleton, not the full-screen backdrop (AC-B3 carried over, AC1)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      const stub = stubIframeNavigation();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();

        expect(document.querySelector('[data-testid="report-loading-backdrop"]')).toBeFalsy();
        expect(root.querySelector('[data-testid="report-dashboard-skeleton"]')).toBeTruthy();

        unloadTestReportDashboard(root);
      } finally {
        stub.restore();
        cleanupStray();
      }
    });

    it("defaults to 3 skeleton category-card placeholders on a true first-ever load (no previous report)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      const stub = stubIframeNavigation();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();

        const cards = root.querySelectorAll('[data-testid="report-skeleton-category-card"]');
        expect(cards.length).toBe(DEFAULT_SKELETON_CARD_COUNT);
        cards.forEach((card) => {
          expect(card.className).toContain("report-skeleton__pulse");
        });

        unloadTestReportDashboard(root);
      } finally {
        stub.restore();
        cleanupStray();
      }
    });

    it("mirrors the previous report's category count for skeleton category-card placeholders on Reload (no grid reflow when real data lands)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport(
        [
          { name: "a", passed: true, category: "shared" },
          { name: "b", passed: true, category: "logo" },
        ],
        1
      );
      const stub = stubIframeNavigation();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();

        root.querySelector('[data-testid="report-reload-button"]').click();
        await nextTick();

        const cards = root.querySelectorAll('[data-testid="report-skeleton-category-card"]');
        expect(cards.length).toBe(2);

        unloadTestReportDashboard(root);
      } finally {
        stub.restore();
        cleanupStray();
      }
    });
  });
})();
