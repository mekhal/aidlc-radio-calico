/**
 * Issue #447 (Ticket 1 of #421, Sleep Timer): the ⋮ More Options sub-menu
 * shell (Ticket 0, issue #446, already merged into develop) renders the
 * Sleep Timer option list and highlights the active choice, but selecting a
 * duration does nothing beyond that — no countdown, no panel, no auto-pause.
 * This suite covers issue #447's own Acceptance Criteria:
 *
 *   AC1: the Sleep Timer sub-menu offers Off / 15 / 30 / 45 min / 1 hour.
 *        (Already shipped by Ticket 0 — kept here as regression coverage
 *        since Ticket 0's own Test PR was explicitly waived on #446.)
 *   AC2: selecting a non-Off duration immediately shows a Countdown Panel
 *        docked under the main player bar: a real-time "Sleep Timer: MM:SS"
 *        sentence with NO leading icon (a prior ⏱️ prefix was cut per the
 *        latest #421 decision — regression-guarded explicitly below), plus
 *        a Cancel button.
 *   AC3: the countdown only ticks while playback is playing. Pausing
 *        freezes it at the remaining time (panel stays visible, value
 *        unchanged); resuming continues from that same remaining time with
 *        no skip. Selecting a duration while already paused shows the panel
 *        immediately at the full duration, frozen, until Play is pressed.
 *        The countdown remains independent of Audio Quality changes
 *        mid-countdown. (Revised 2026-08-24 on #447's review — reverses the
 *        original "always counts regardless of play/pause" decision from
 *        #421; the Audio Quality independence is unchanged.)
 *   AC4: on reaching zero, playback is paused and the panel is hidden.
 *   AC5: Cancel, or reselecting Off, stops the countdown and hides the panel
 *        immediately.
 *   AC6: session-only — no localStorage persistence; a fresh mount never
 *        shows a leftover panel or a non-Off highlighted option.
 *
 * These fail today (RED) for AC2-AC6 — PlayerControls (album-promo.js)
 * has no Countdown Panel, no countdown state, and selecting a Sleep Timer
 * option only updates which menu item is highlighted
 * (renderMenuSection's onSelect, album-promo.js:363-383). AC1 already
 * passes (Ticket 0), kept for regression coverage only.
 *
 * Per the "interval-tick-override-and-cleanup-pattern" published skill
 * (docs/knowledge-asset/published/interval-tick-override-and-cleanup-pattern.md)
 * this suite assumes the Code PR exposes the countdown's tick cadence via
 * window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__ (mirrors the existing
 * window.__ALBUM_PROMO_TIMER_TICK_MS__ convention for the elapsed-time
 * counter). Since a real Sleep Timer duration is minutes long, this suite
 * also assumes one new sibling override,
 * window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__ — when set, the
 * countdown started by ANY selected option (15/30/45/60) counts down from
 * this many seconds instead of the option's real minute value, so tests can
 * finish a countdown in milliseconds without waiting out a real 15+ minute
 * timer. Both are test-only hooks with no effect when unset.
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

  function findPlayerControls(root) {
    return root.querySelector('[data-testid="player-controls"]');
  }

  function moreOptionsButton(root) {
    return findPlayerControls(root).querySelector('[data-testid="player-more-options"]');
  }

  // React 18 batches the state update from this click asynchronously (it
  // never flushes synchronously within the click() call), so opening the ⋮
  // menu and each subsequent submenu navigation needs a tick to actually
  // insert the new DOM before the next query — see issue #599.
  async function ensureMoreMenuOpen(root) {
    const button = moreOptionsButton(root);
    if (button.getAttribute("aria-expanded") !== "true") {
      button.click();
      await nextTick();
    }
  }

  async function openSleepTimerSubmenu(root) {
    await ensureMoreMenuOpen(root);
    // Idempotent: if a previous call already navigated into the Sleep Timer
    // option list, the nav row is gone (replaced by the option list) —
    // nothing left to click.
    const row = findPlayerControls(root).querySelector('[data-testid="player-menu-sleep-timer-row"]');
    if (row) {
      row.click();
      await nextTick();
    }
  }

  async function selectSleepTimerOption(root, value) {
    await openSleepTimerSubmenu(root);
    findPlayerControls(root).querySelector(`[data-testid="player-sleep-timer-option-${value}"]`).click();
  }

  function sleepTimerPanel(root) {
    return findPlayerControls(root).querySelector('[data-testid="player-sleep-timer-panel"]');
  }

  function sleepTimerCountdownText(root) {
    const panel = sleepTimerPanel(root);
    return panel && panel.querySelector('[data-testid="player-sleep-timer-countdown"]').textContent;
  }

  function clickSleepTimerCancel(root) {
    sleepTimerPanel(root).querySelector('[data-testid="player-sleep-timer-cancel"]').click();
  }

  function playPauseButton(root) {
    return findPlayerControls(root).querySelector('[data-testid="player-play-pause"]');
  }

  async function mountPlaying() {
    const root = await loadAlbumPromo();
    await nextTick();
    await nextTick();
    return root;
  }

  describe("PlayerControls Sleep Timer (issue #447)", () => {
    it("AC1: offers Off / 15 / 30 / 45 min / 1 hour in the Sleep Timer sub-menu", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        await openSleepTimerSubmenu(root);
        ["off", "15", "30", "45", "60"].forEach((value) => {
          const option = findPlayerControls(root).querySelector(
            `[data-testid="player-sleep-timer-option-${value}"]`
          );
          expect(option).toBeTruthy();
        });
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("AC2: selecting a duration immediately shows the Countdown Panel with a real-time MM:SS sentence and no leading icon", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        await selectSleepTimerOption(root, "15");
        await nextTick();

        const text = sleepTimerCountdownText(root);
        expect(text).toBeTruthy();
        expect(text.includes("⏱️")).toBeFalsy();
        expect(/^Sleep Timer: \d{1,2}:\d{2}$/.test(text)).toBeTruthy();

        const cancelButton = sleepTimerPanel(root).querySelector('[data-testid="player-sleep-timer-cancel"]');
        expect(cancelButton).toBeTruthy();
        expect(cancelButton.tagName).toBe("BUTTON");
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("AC2: the countdown text ticks downward in real time", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__ = 20;
      window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__ = 5;
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        await selectSleepTimerOption(root, "15");
        await nextTick();
        const startText = sleepTimerCountdownText(root);

        await waitFor(() => sleepTimerCountdownText(root) !== startText);
        expect(sleepTimerCountdownText(root) === startText).toBeFalsy();
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__;
        delete window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__;
      }
    });

    it("AC3: freezes the countdown while playback is paused, then resumes from the same remaining time after Play", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__ = 20;
      window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__ = 8;
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        await selectSleepTimerOption(root, "15");
        await nextTick();
        await waitFor(() => sleepTimerCountdownText(root) !== null);

        playPauseButton(root).click(); // pause playback
        await nextTick();
        expect(playPauseButton(root).getAttribute("aria-pressed")).toBe("false");

        const atPause = sleepTimerCountdownText(root);
        // Several tick intervals' worth of real time: if the countdown were
        // still (wrongly) ticking while paused, this would be enough for the
        // text to change.
        await wait(150);
        expect(sleepTimerCountdownText(root)).toBe(atPause);
        expect(sleepTimerPanel(root)).toBeTruthy();

        playPauseButton(root).click(); // resume playback
        await nextTick();
        expect(playPauseButton(root).getAttribute("aria-pressed")).toBe("true");

        await waitFor(() => sleepTimerCountdownText(root) !== atPause);
        expect(sleepTimerCountdownText(root) === atPause).toBeFalsy();
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__;
        delete window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__;
      }
    });

    it("AC3: selecting a duration while playback is already paused shows the panel frozen at the full duration until Play starts it", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__ = 20;
      window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__ = 8;
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        playPauseButton(root).click(); // pause before selecting a duration
        await nextTick();
        expect(playPauseButton(root).getAttribute("aria-pressed")).toBe("false");

        await selectSleepTimerOption(root, "15");
        await nextTick();

        const fullText = sleepTimerCountdownText(root);
        expect(fullText).toBeTruthy();
        expect(/^Sleep Timer: \d{1,2}:\d{2}$/.test(fullText)).toBeTruthy();

        await wait(150);
        expect(sleepTimerCountdownText(root)).toBe(fullText);
        expect(sleepTimerPanel(root)).toBeTruthy();

        playPauseButton(root).click(); // now start playing
        await nextTick();
        expect(playPauseButton(root).getAttribute("aria-pressed")).toBe("true");

        await waitFor(() => sleepTimerCountdownText(root) !== fullText);
        expect(sleepTimerCountdownText(root) === fullText).toBeFalsy();
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__;
        delete window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__;
      }
    });

    it("AC3: keeps counting down, unaffected, when the Audio Quality option is changed mid-countdown", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__ = 20;
      window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__ = 8;
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        await selectSleepTimerOption(root, "15");
        await nextTick();
        const beforeQualityChange = sleepTimerCountdownText(root);

        await ensureMoreMenuOpen(root);
        findPlayerControls(root).querySelector('[data-testid="player-menu-audio-quality-row"]').click();
        await nextTick();
        findPlayerControls(root).querySelector('[data-testid="player-audio-quality-option-high"]').click();
        await nextTick();

        // Panel must still be present and still counting — an Audio Quality
        // change must never cancel or reset the Sleep Timer (AC3).
        expect(sleepTimerPanel(root)).toBeTruthy();
        await waitFor(() => sleepTimerCountdownText(root) !== beforeQualityChange);
        expect(sleepTimerCountdownText(root) === beforeQualityChange).toBeFalsy();
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__;
        delete window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__;
      }
    });

    it("AC4: pauses playback and hides the Countdown Panel once the countdown reaches zero", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__ = 20;
      window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__ = 2;
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        await selectSleepTimerOption(root, "15");
        await nextTick();
        expect(sleepTimerPanel(root)).toBeTruthy();

        // The countdown is wall-clock-deadline-based (album-promo.js), so
        // reaching 0 from a 2-second override genuinely takes ~2000ms of
        // real time — waitFor's default 1500ms timeout is shorter than that
        // and was intermittently timing out under CI load (issue #599).
        await waitFor(() => !sleepTimerPanel(root), { timeout: 3000 });
        expect(spy.calls.pause.length).toBeGreaterThan(0);
        expect(playPauseButton(root).getAttribute("aria-pressed")).toBe("false");
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__;
        delete window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__;
      }
    });

    it("AC5: Cancel stops the countdown and hides the panel immediately, without pausing playback", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__ = 20;
      window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__ = 30;
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        await selectSleepTimerOption(root, "15");
        await nextTick();
        expect(sleepTimerPanel(root)).toBeTruthy();

        clickSleepTimerCancel(root);
        await nextTick();

        expect(sleepTimerPanel(root)).toBeFalsy();
        expect(spy.calls.pause.length).toBe(0);
        expect(playPauseButton(root).getAttribute("aria-pressed")).toBe("true");
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__;
        delete window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__;
      }
    });

    it("AC5: no leftover interval survives Cancel — the countdown text never changes again afterward", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__ = 20;
      window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__ = 30;
      const tracker = trackIntervals();
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        await selectSleepTimerOption(root, "15");
        await nextTick();
        const activeWhileCounting = tracker.active.size;

        clickSleepTimerCancel(root);
        await nextTick();
        expect(tracker.active.size).toBe(activeWhileCounting - 1);
      } finally {
        spy.restore();
        tracker.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__;
        delete window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__;
      }
    });

    it("AC5: reselecting Off stops the countdown and hides the panel immediately", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__ = 20;
      window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__ = 30;
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        await selectSleepTimerOption(root, "15");
        await nextTick();
        expect(sleepTimerPanel(root)).toBeTruthy();

        await selectSleepTimerOption(root, "off");
        await nextTick();

        expect(sleepTimerPanel(root)).toBeFalsy();
        expect(spy.calls.pause.length).toBe(0);
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__;
        delete window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__;
      }
    });

    it("AC6: never writes to localStorage when a duration is selected (session-only)", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await mountPlaying();
      const lengthBefore = window.localStorage.length;

      try {
        await selectSleepTimerOption(root, "15");
        await nextTick();
        expect(window.localStorage.length).toBe(lengthBefore);
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("AC6: a fresh mount never shows a leftover Countdown Panel or a non-Off highlighted option", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__ = 20;
      window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__ = 30;
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        await selectSleepTimerOption(root, "15");
        await nextTick();
        expect(sleepTimerPanel(root)).toBeTruthy();

        unloadAlbumPromo(root);
        spy.restore();

        const spy2 = spyOnPlayPause();
        const root2 = await mountPlaying();
        try {
          expect(sleepTimerPanel(root2)).toBeFalsy();
          await openSleepTimerSubmenu(root2);
          const offOption = findPlayerControls(root2).querySelector(
            '[data-testid="player-sleep-timer-option-off"]'
          );
          expect(offOption.getAttribute("aria-checked")).toBe("true");
        } finally {
          spy2.restore();
          unloadAlbumPromo(root2);
        }
      } finally {
        delete window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__;
        delete window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__;
      }
    });
  });
})();
