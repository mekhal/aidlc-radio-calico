/**
 * Issue #367 (split from #360): tests/test-report-dashboard.js's
 * startTestRun() wires window.onTestRunComplete with no timeout/fallback —
 * a suite that never calls back (for any future reason, as literally
 * happened in #354's original root cause) leaves the dashboard stuck on
 * "Running tests…" indefinitely with no diagnostic signal.
 *
 * Acceptance Criteria (2026-08-14 plan approval, timeout duration raised
 * from the original 60000ms proposal to 2 minutes per @mekhal):
 *   AC1: if window.onTestRunComplete has not been invoked within
 *        window.__TEST_REPORT_RUN_TIMEOUT_MS__ (default 120000ms) of the
 *        backdrop being shown, the dashboard shows a clear timeout/error
 *        state instead of leaving "Running tests…" up indefinitely.
 *   AC2: the timeout duration is overridable via
 *        window.__TEST_REPORT_RUN_TIMEOUT_MS__, mirroring this repo's
 *        window.__ALBUM_PROMO_TIMER_TICK_MS__ convention (see
 *        docs/knowledge-asset/published/interval-tick-override-and-cleanup-pattern.md).
 *   AC3: a normal completion before the timeout clears the pending timer —
 *        no leaked setTimeout.
 *   AC4: after a timeout fires, window.onTestRunComplete is cleared (a
 *        stale late real callback becomes a no-op) and the human can retry
 *        via the existing Reload Test button without reloading the page.
 *
 * Implementation note carried into this Test PR (see the plan-approval
 * comment thread): the loading backdrop is a full-screen
 * `position: fixed; inset: 0; z-index: 1000` overlay (test-report-dashboard.css),
 * so AC4's "retry via the existing Reload Test button" is only actually
 * reachable if the timeout removes the backdrop the same way a normal
 * completion does — leaving it up and merely swapping its label text would
 * visually cover the very button AC4 requires to stay clickable. The
 * timeout state is therefore rendered as a distinct message
 * (data-testid="report-run-timeout-message") in the dashboard's normal
 * `main` content area, alongside the always-reachable Reload Test button —
 * not as an in-place backdrop label swap.
 *
 * Written before test-report-dashboard.js implements any of this, per TDD
 * — fails until this ticket's Code PR adds the timeout/fallback.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadTestReportDashboard, unloadTestReportDashboard } = window.TestReportDashboardTestHelpers;
  const { STORAGE_KEY, saveTestReport } = window.TestReportStorage;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

  // Mirrors player-timer-and-autoplay.test.js's trackIntervals() — same
  // shape, applied to setTimeout/clearTimeout so AC3 can be asserted
  // deterministically (no leaked timer) without waiting out a real delay.
  function trackTimeouts() {
    const active = new Set();
    const originalSet = window.setTimeout;
    const originalClear = window.clearTimeout;
    window.setTimeout = function (fn, delay, ...rest) {
      const id = originalSet.call(
        window,
        function (...cbArgs) {
          active.delete(id);
          fn.apply(this, cbArgs);
        },
        delay,
        ...rest
      );
      active.add(id);
      return id;
    };
    window.clearTimeout = function (id) {
      active.delete(id);
      return originalClear.call(window, id);
    };
    return {
      active,
      restore: () => {
        window.setTimeout = originalSet;
        window.clearTimeout = originalClear;
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

  describe("Test Report Dashboard: onTestRunComplete timeout/fallback (issue #367)", () => {
    it("defaults window.__TEST_REPORT_RUN_TIMEOUT_MS__ to 120000ms (AC1, AC2)", async () => {
      const response = await fetch("test-report-dashboard.js");
      const source = await response.text();

      expect(source.indexOf("__TEST_REPORT_RUN_TIMEOUT_MS__")).toBeGreaterThan(-1);
      expect(source.indexOf("120000")).toBeGreaterThan(-1);
    });

    it("shows a distinct timeout state and stops blocking the backdrop's re-entrancy guard when onTestRunComplete never fires (AC1)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      window.__TEST_REPORT_RUN_TIMEOUT_MS__ = 20;
      const stub = stubIframeNavigation();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();

        // AC-B3: empty storage auto-runs, so the backdrop is already up.
        expect(document.querySelector('[data-testid="report-loading-backdrop"]')).toBeTruthy();

        await wait(80);

        expect(document.querySelector('[data-testid="report-loading-backdrop"]')).toBeFalsy();

        const message = root.querySelector('[data-testid="report-run-timeout-message"]');
        expect(message).toBeTruthy();
        expect((message.textContent || "").toLowerCase()).toContain("timed out");

        unloadTestReportDashboard(root);
      } finally {
        stub.restore();
        cleanupStray();
        delete window.__TEST_REPORT_RUN_TIMEOUT_MS__;
      }
    });

    it("clears window.onTestRunComplete on timeout and lets the human retry via the existing Reload Test button (AC4)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      window.__TEST_REPORT_RUN_TIMEOUT_MS__ = 20;
      const stub = stubIframeNavigation();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();
        await wait(80);

        expect(window.onTestRunComplete).toBeFalsy();

        const reloadButton = root.querySelector('[data-testid="report-reload-button"]');
        expect(reloadButton).toBeTruthy();

        reloadButton.click();
        await nextTick();

        expect(document.querySelector('[data-testid="report-loading-backdrop"]')).toBeTruthy();
        expect(typeof window.onTestRunComplete).toBe("function");

        // Finish the retried run's own timer before the test ends — leaving
        // it pending would fire ~20ms later, mid-way through a later test.
        saveTestReport([{ name: "retried", passed: true }], 1);
        window.onTestRunComplete();
        await nextTick();

        unloadTestReportDashboard(root);
      } finally {
        stub.restore();
        cleanupStray();
        delete window.__TEST_REPORT_RUN_TIMEOUT_MS__;
      }
    });

    it("ignores a stale onTestRunComplete call that arrives after the timeout already fired (AC4)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      window.__TEST_REPORT_RUN_TIMEOUT_MS__ = 20;
      const stub = stubIframeNavigation();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();

        const staleCallback = window.onTestRunComplete;
        await wait(80);

        expect(document.querySelector('[data-testid="report-run-timeout-message"]')).toBeTruthy();

        saveTestReport([{ name: "late", passed: true }], 1);
        // A throw here would fail this test itself (it()'s own try/catch),
        // which is exactly the "must be a safe no-op" behavior AC4 requires.
        staleCallback();
        await nextTick();

        // The stale callback must not resurrect the (already-dismissed)
        // timeout state's absence of a backdrop, nor silently swap in the
        // late report — the dashboard already moved on to the timeout state.
        expect(document.querySelector('[data-testid="report-run-timeout-message"]')).toBeTruthy();

        unloadTestReportDashboard(root);
      } finally {
        stub.restore();
        cleanupStray();
        delete window.__TEST_REPORT_RUN_TIMEOUT_MS__;
      }
    });

    it("clears the pending timeout via clearTimeout when onTestRunComplete fires normally, before it ever fires (AC3)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      saveTestReport([{ name: "a", passed: true }], 1);
      window.__TEST_REPORT_RUN_TIMEOUT_MS__ = 100000;
      const stub = stubIframeNavigation();
      const tracker = trackTimeouts();

      try {
        const root = await loadTestReportDashboard();
        await nextTick();

        root.querySelector('[data-testid="report-reload-button"]').click();
        await nextTick();

        expect(tracker.active.size).toBe(1);

        saveTestReport([{ name: "fresh", passed: true }], 1);
        window.onTestRunComplete();
        await nextTick();

        expect(tracker.active.size).toBe(0);

        unloadTestReportDashboard(root);
      } finally {
        tracker.restore();
        stub.restore();
        cleanupStray();
        delete window.__TEST_REPORT_RUN_TIMEOUT_MS__;
      }
    });
  });
})();
