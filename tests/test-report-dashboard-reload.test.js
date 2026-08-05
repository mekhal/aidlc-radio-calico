/**
 * Issue #205 (PR B / AC-B1-B3, 2026-08-05 revised AC): "Reload Test" button
 * that drives a fresh suite run through a hidden <iframe src="test-runner.html">
 * (never re-running the suite in the dashboard's own document — its fixtures
 * would collide with the chrome this page already mounts), shows a loading
 * backdrop while that run is in flight, and auto-runs on first load when
 * localStorage is empty (AC-B3).
 *
 * AC-B2's contract: test-runner.html calls window.parent.onTestRunComplete()
 * once it has saved to localStorage; the dashboard exposes that as
 * window.onTestRunComplete, hides the backdrop, and re-renders from the
 * freshly-saved report.
 *
 * Safety note: this suite runs INSIDE tests/test-runner.html itself (as a
 * fixture-mounted script, not a live page). If a test here let a real
 * <iframe src="test-runner.html"> actually navigate, the browser would
 * re-run the entire outer suite a second time nested inside it — including
 * this same test — recursing without end. That risk is specific to this
 * repo's own test harness, not real usage (a real user's dashboard page is
 * never itself embedded inside test-runner.html), so these tests stub the
 * iframe's `src` setter to capture the intended URL without letting the
 * browser navigate. See stubIframeNavigation() below.
 *
 * Written before test-report-dashboard.js implements any of this, per TDD
 * — fails until this PR's Code PR adds the button/backdrop/iframe/callback.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadTestReportDashboard, unloadTestReportDashboard } = window.TestReportDashboardTestHelpers;
  const { STORAGE_KEY, saveTestReport } = window.TestReportStorage;

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
        // Deliberately not calling the real setter — prevents this stub
        // from ever letting the iframe actually navigate/recurse.
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
    const backdrop = document.querySelector('[data-testid="report-loading-backdrop"]');
    if (backdrop) backdrop.remove();
    const iframe = document.querySelector('[data-testid="report-test-runner-iframe"]');
    if (iframe) iframe.remove();
    window.localStorage.removeItem(STORAGE_KEY);
  }

  describe("Test Report Dashboard: Reload Test + auto-run (issue #205, PR B)", () => {
    it("shows a Reload Test button", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport([{ name: "a", passed: true }], 1);
      const root = await loadTestReportDashboard();
      await nextTick();

      expect(root.querySelector('[data-testid="report-reload-button"]')).toBeTruthy();

      unloadTestReportDashboard(root);
      cleanupStray();
    });

    it("clicking Reload Test shows a loading backdrop and a hidden iframe pointed at test-runner.html (AC-B1)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport([{ name: "a", passed: true }], 1);
      const stub = stubIframeNavigation();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();

        root.querySelector('[data-testid="report-reload-button"]').click();
        await nextTick();

        expect(document.querySelector('[data-testid="report-loading-backdrop"]')).toBeTruthy();

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

    it("hides the backdrop and re-renders from localStorage once window.onTestRunComplete() fires (AC-B2)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport([{ name: "old", passed: true }], 1);
      const stub = stubIframeNavigation();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();

        root.querySelector('[data-testid="report-reload-button"]').click();
        await nextTick();

        saveTestReport(
          [
            { name: "fresh one", passed: true },
            { name: "fresh two", passed: false, error: "x" },
          ],
          2
        );

        expect(typeof window.onTestRunComplete).toBe("function");
        window.onTestRunComplete();
        await nextTick();

        expect(document.querySelector('[data-testid="report-loading-backdrop"]')).toBeFalsy();

        const items = root.querySelectorAll('[data-testid="report-result-item"]');
        expect(items.length).toBe(2);

        unloadTestReportDashboard(root);
      } finally {
        stub.restore();
        cleanupStray();
      }
    });

    it("auto-runs (shows the backdrop without a click) when localStorage is empty on load (AC-B3)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      const stub = stubIframeNavigation();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();

        expect(document.querySelector('[data-testid="report-loading-backdrop"]')).toBeTruthy();

        unloadTestReportDashboard(root);
      } finally {
        stub.restore();
        cleanupStray();
      }
    });

    it("does NOT auto-run when localStorage already has a stored report (AC-B3)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport([{ name: "a", passed: true }], 1);
      const stub = stubIframeNavigation();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();

        expect(document.querySelector('[data-testid="report-loading-backdrop"]')).toBeFalsy();

        unloadTestReportDashboard(root);
      } finally {
        stub.restore();
        cleanupStray();
      }
    });
  });

  describe("test-runner.html notifies an embedding dashboard when its run is saved (AC-B2)", () => {
    it("calls window.parent.onTestRunComplete() after saveTestReport(), guarded for the standalone (no parent dashboard) case", async () => {
      const response = await fetch("test-runner.html");
      const html = await response.text();

      const saveIdx = html.indexOf("saveTestReport(results)");
      expect(saveIdx).toBeGreaterThan(-1);

      const notifyIdx = html.indexOf("onTestRunComplete");
      expect(notifyIdx).toBeGreaterThan(saveIdx);
    });
  });
})();
