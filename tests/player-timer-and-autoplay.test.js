/**
 * Issue #228: the elapsed-time readout next to the play/pause button
 * (`.chloe-player-controls__timer`, data-testid="player-timer") was a
 * hardcoded "0:00" string that never ticked. Revised plan (approved
 * 2026-07-31, after the "@claude review" cumulative-timer + autoplay
 * scope change) covers two things together:
 *
 *   AC1: on mount, playback starts automatically (audio.play() called
 *        without a user click); once the play promise resolves, the
 *        elapsed-time counter starts ticking upward once per second
 *        from 0:00, replacing the hardcoded "0:00".
 *   AC2: if the autoplay audio.play() promise rejects (browser autoplay
 *        policy), the component falls back to the paused state with no
 *        thrown/unhandled error and no interval started.
 *   AC3: on pause, the counter stops ticking and holds its current value.
 *   AC4: on resume, the counter continues from where it stopped — it does
 *        NOT reset to 0:00 (cumulative, not per-play).
 *   AC5: the counter only returns to 0:00 on a fresh mount (page
 *        reload/component remount) — never merely from pause/resume.
 *   AC6: the tick interval is cleared on pause and on unmount/teardown —
 *        no leftover interval survives.
 *   AC7: the tick cadence is overridable via
 *        window.__ALBUM_PROMO_TIMER_TICK_MS__, mirroring the existing
 *        window.__ALBUM_PROMO_METADATA_POLL_MS__ convention
 *        (tests/now-playing-polling.test.js).
 *   AC8: the live-dot span, "Live" text, data-testid="player-timer", and
 *        aria-label="Elapsed time, live broadcast" stay unchanged — only
 *        the leading time text becomes dynamic.
 *   AC9: the play/pause button still works identically for manual clicks
 *        post-mount (pause stops stream+interval, play resumes both).
 *
 * These fail today (RED) — PlayerControls (album-promo.js:566-658) never
 * calls audio.play() on mount (togglePlayback only runs on a button click,
 * album-promo.js:604-612) and the timer text is the static string
 * "0:00 / " (album-promo.js:640). See tests/README.md for how to run this
 * suite.
 *
 * Note for whoever picks up the Code PR: once autoplay-on-mount ships,
 * tests/player-real-audio-playback.test.js's AC3 case ("calls
 * audio.play()/.pause() when the play/pause button is clicked") will need
 * its play-call-count assertions adjusted, since mount now calls play()
 * once before any click. Flagged here rather than changed now — this file
 * only adds new tests for issue #228's AC, per "Test the AC only".
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadAlbumPromo, unloadAlbumPromo } = window.AlbumPromoTestHelpers;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function waitFor(predicate, { timeout = 1500, interval = 20 } = {}) {
    const start = Date.now();
    for (;;) {
      const value = predicate();
      if (value) return value;
      if (Date.now() - start >= timeout) {
        throw new Error("waitFor: timed out waiting for condition");
      }
      await wait(interval);
    }
  }

  function spyOnPlayPause({ rejectPlay = false } = {}) {
    const calls = { play: [], pause: [] };
    const originalPlay = window.HTMLMediaElement.prototype.play;
    const originalPause = window.HTMLMediaElement.prototype.pause;
    window.HTMLMediaElement.prototype.play = function () {
      calls.play.push(this);
      return rejectPlay ? Promise.reject(new Error("NotAllowedError")) : Promise.resolve();
    };
    window.HTMLMediaElement.prototype.pause = function () {
      calls.pause.push(this);
    };
    return {
      calls,
      restore: () => {
        window.HTMLMediaElement.prototype.play = originalPlay;
        window.HTMLMediaElement.prototype.pause = originalPause;
      },
    };
  }

  function trackIntervals() {
    const active = new Set();
    const originalSet = window.setInterval;
    const originalClear = window.clearInterval;
    window.setInterval = function (...args) {
      const id = originalSet.apply(window, args);
      active.add(id);
      return id;
    };
    window.clearInterval = function (id) {
      active.delete(id);
      return originalClear.call(window, id);
    };
    return {
      active,
      restore: () => {
        window.setInterval = originalSet;
        window.clearInterval = originalClear;
      },
    };
  }

  function captureUnhandledRejections() {
    let reason = null;
    const handler = (event) => {
      reason = event.reason;
    };
    window.addEventListener("unhandledrejection", handler);
    return {
      get: () => reason,
      restore: () => window.removeEventListener("unhandledrejection", handler),
    };
  }

  function findPlayerControls(root) {
    return root.querySelector('[data-testid="player-controls"]');
  }

  function timerLeadingText(root) {
    const timer = findPlayerControls(root).querySelector('[data-testid="player-timer"]');
    return timer.childNodes[0].textContent;
  }

  function parseElapsedSeconds(text) {
    const match = /^(\d+):(\d{2}) \/ $/.exec(text);
    if (!match) throw new Error(`Unexpected timer text: ${text}`);
    return Number(match[1]) * 60 + Number(match[2]);
  }

  describe("PlayerControls elapsed-time counter + autoplay (issue #228)", () => {
    it("starts playback automatically on mount (no click) and begins ticking the counter from 0:00 once play resolves (AC1)", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_TIMER_TICK_MS__ = 20;
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        expect(spy.calls.play.length).toBe(1);

        const button = findPlayerControls(root).querySelector('[data-testid="player-play-pause"]');
        expect(button.getAttribute("aria-pressed")).toBe("true");
        expect(timerLeadingText(root)).toBe("0:00 / ");

        await waitFor(() => timerLeadingText(root) !== "0:00 / ");
        expect(timerLeadingText(root) === "0:00 / ").toBeFalsy();
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_TIMER_TICK_MS__;
      }
    });

    it("falls back to the paused state with no unhandled error when the autoplay play() promise rejects (AC2)", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_TIMER_TICK_MS__ = 20;
      const rejections = captureUnhandledRejections();
      const spy = spyOnPlayPause({ rejectPlay: true });
      const root = await loadAlbumPromo();
      await nextTick();
      await nextTick();

      try {
        const button = findPlayerControls(root).querySelector('[data-testid="player-play-pause"]');
        expect(button.getAttribute("aria-pressed")).toBe("false");
        expect(button.getAttribute("aria-label")).toBe("Play");
        expect(rejections.get()).toBeFalsy();

        const textAtStart = timerLeadingText(root);
        await wait(80);
        expect(timerLeadingText(root)).toBe(textAtStart);
      } finally {
        spy.restore();
        rejections.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_TIMER_TICK_MS__;
      }
    });

    it("stops ticking and holds its current value while paused (AC3)", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_TIMER_TICK_MS__ = 20;
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        await waitFor(() => timerLeadingText(root) !== "0:00 / ");

        const button = findPlayerControls(root).querySelector('[data-testid="player-play-pause"]');
        button.click();
        await nextTick();
        const heldText = timerLeadingText(root);

        await wait(80);
        expect(timerLeadingText(root)).toBe(heldText);
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_TIMER_TICK_MS__;
      }
    });

    it("resumes ticking from where it stopped, not from 0:00, after pause then play again (AC4)", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_TIMER_TICK_MS__ = 20;
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        await waitFor(() => timerLeadingText(root) !== "0:00 / ");

        const button = findPlayerControls(root).querySelector('[data-testid="player-play-pause"]');
        button.click(); // pause
        await nextTick();
        const heldText = timerLeadingText(root);

        button.click(); // resume
        await nextTick();
        expect(timerLeadingText(root)).toBe(heldText); // no reset at the moment of resume

        await waitFor(() => timerLeadingText(root) !== heldText);
        const resumedText = timerLeadingText(root);
        expect(parseElapsedSeconds(resumedText) > parseElapsedSeconds(heldText)).toBeTruthy();
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_TIMER_TICK_MS__;
      }
    });

    it("only resets to 0:00 on a fresh mount, never merely from pause/resume (AC5)", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_TIMER_TICK_MS__ = 20;
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        await waitFor(() => timerLeadingText(root) !== "0:00 / ");

        const button = findPlayerControls(root).querySelector('[data-testid="player-play-pause"]');
        button.click(); // pause
        await nextTick();
        button.click(); // resume
        await nextTick();
        await waitFor(() => timerLeadingText(root) !== "0:00 / ");

        unloadAlbumPromo(root);
        spy.restore();

        const spy2 = spyOnPlayPause();
        const root2 = await loadAlbumPromo();
        await nextTick();
        try {
          expect(timerLeadingText(root2)).toBe("0:00 / ");
        } finally {
          spy2.restore();
          unloadAlbumPromo(root2);
        }
      } finally {
        delete window.__ALBUM_PROMO_TIMER_TICK_MS__;
      }
    });

    it("clears the tick interval on pause and on unmount, leaving nothing running (AC6)", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_TIMER_TICK_MS__ = 20;
      const tracker = trackIntervals();
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        await waitFor(() => timerLeadingText(root) !== "0:00 / ");
        const activeAfterTicking = tracker.active.size;

        const button = findPlayerControls(root).querySelector('[data-testid="player-play-pause"]');
        button.click(); // pause
        await nextTick();
        expect(tracker.active.size).toBe(activeAfterTicking - 1);

        unloadAlbumPromo(root);
        await nextTick();
        expect(tracker.active.size).toBe(0);
      } finally {
        spy.restore();
        tracker.restore();
        delete window.__ALBUM_PROMO_TIMER_TICK_MS__;
      }
    });

    it("uses window.__ALBUM_PROMO_TIMER_TICK_MS__ to control the tick cadence (AC7)", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_TIMER_TICK_MS__ = 100000;
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        await wait(80);
        expect(timerLeadingText(root)).toBe("0:00 / ");
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }

      window.__ALBUM_PROMO_TIMER_TICK_MS__ = 20;
      const spy2 = spyOnPlayPause();
      const root2 = await loadAlbumPromo();
      await nextTick();
      try {
        await waitFor(() => timerLeadingText(root2) !== "0:00 / ");
        expect(timerLeadingText(root2) === "0:00 / ").toBeFalsy();
      } finally {
        spy2.restore();
        unloadAlbumPromo(root2);
        delete window.__ALBUM_PROMO_TIMER_TICK_MS__;
      }
    });

    it("keeps the live-dot span, Live text, data-testid, and aria-label unchanged (AC8)", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        const timer = findPlayerControls(root).querySelector('[data-testid="player-timer"]');
        expect(timer.getAttribute("aria-label")).toBe("Elapsed time, live broadcast");
        expect(timer.textContent).toContain("Live");

        const liveDot = timer.querySelector(".chloe-player-controls__live-dot");
        expect(liveDot).toBeTruthy();
        expect(liveDot.getAttribute("aria-hidden")).toBe("true");
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("still supports manual play/pause clicks after the autoplay mount (AC9)", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_TIMER_TICK_MS__ = 20;
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        const button = findPlayerControls(root).querySelector('[data-testid="player-play-pause"]');
        expect(spy.calls.play.length).toBe(1); // from autoplay

        button.click(); // manual pause
        await nextTick();
        expect(spy.calls.pause.length).toBe(1);
        expect(button.getAttribute("aria-pressed")).toBe("false");

        button.click(); // manual resume
        await nextTick();
        expect(spy.calls.play.length).toBe(2);
        expect(button.getAttribute("aria-pressed")).toBe("true");
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_TIMER_TICK_MS__;
      }
    });
  });
})();
