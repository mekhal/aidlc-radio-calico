/**
 * Issue #448 (Ticket 2 of #421, Audio Quality): the ⋮ More Options sub-menu
 * shell (Ticket 0, issue #446, already merged into develop) renders the
 * Audio Quality option list and highlights the active choice, but selecting
 * an option only updates local React state — it never touches the real
 * hls.js instance's `currentLevel` (album-promo.js:773,
 * `setAudioQualityOption` wired directly as `renderMenuSection`'s
 * `onSelect`). This suite covers issue #448's own Acceptance Criteria:
 *
 *   AC1: the Audio Quality sub-menu offers Auto (recommended) / High /
 *        Medium / Low. (Already shipped by Ticket 0 — kept here as
 *        regression coverage since Ticket 0's own Test PR was explicitly
 *        waived on #446.)
 *   AC2: the active option is highlighted by color/class, with no ✓ mark.
 *        (Also already shipped by Ticket 0 — regression coverage only.)
 *   AC3: selecting High/Medium/Low/Auto actually drives `hls.currentLevel`
 *        via the real hls.js instance — not UI-only. Levels are matched by
 *        each level's real `bitrate` value (highest -> High, middle ->
 *        Medium, lowest -> Low), not by array index, since a master
 *        playlist's `hls.levels` order isn't guaranteed to be
 *        bitrate-sorted (per #448's review discussion). Auto maps to
 *        `hls.currentLevel = -1` (hls.js's own ABR sentinel).
 *        Native-HLS-fallback sub-case (2026-08-24 review Q&A, #448): when
 *        there's no hls.js instance (Safari's native HLS path), the Audio
 *        Quality menu still renders and highlights selections normally, but
 *        selecting an option is a no-op (no crash, nothing to control).
 *   AC4: session-only — no localStorage writes when a quality option is
 *        selected.
 *   AC5: switching Audio Quality while the Sleep Timer (Ticket 1, #447) is
 *        counting down must not affect the countdown (it keeps ticking) and
 *        must still apply the new hls.currentLevel. #447's own suite
 *        (tests/player-sleep-timer.test.js) already covers this from the
 *        Sleep Timer's side (the countdown survives a quality change); this
 *        suite adds the complementary assertion from the Audio Quality
 *        side (the quality change still takes effect).
 *
 * These fail today (RED) for AC3-AC5 — PlayerControls (album-promo.js) has
 * no wiring from `setAudioQualityOption`/`AUDIO_QUALITY_OPTIONS` to
 * `hlsRef.current.currentLevel`, and there's no native-HLS-fallback no-op
 * guard. AC1/AC2 already pass (Ticket 0), kept for regression coverage
 * only.
 *
 * Per the "test-pr-native-api-and-self-ref-checklist" published skill
 * (docs/knowledge-asset/published/test-pr-native-api-and-self-ref-checklist.md):
 *   1. No native API override risk: the Native HLS fallback case stubs
 *      `window.HTMLMediaElement.prototype.canPlayType` (a plain synchronous
 *      value the app code reads itself, not a browser-driven side effect
 *      like navigation) and deletes `window.Hls` — same low-risk category
 *      as this suite's existing `play`/`pause` prototype overrides
 *      (spyOnPlayPause, reused from tests/player-sleep-timer.test.js),
 *      which are already proven reliable across this repo's other player
 *      suites. Both are saved/restored per-test.
 *   2. Self-referential test audit: n/a — no test in this file opens/clicks
 *      the in-app Test Report modal control, so (like
 *      player-sleep-timer.test.js and player-real-audio-playback.test.js)
 *      this file is wired only into tests/test-runner.html, not into the
 *      in-app auto-run list (tests/test-report-suite-files.js).
 *
 * tests/mock-hls.js was extended (not duplicated) to default each MockHls
 * instance's `levels` to `[]` and `currentLevel` to `-1`, mirroring real
 * hls.js's own shape/defaults closely enough for AC3's bitrate-based
 * mapping to be assertable; each test below sets `hls.levels` to whatever
 * bitrate set that test needs.
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

  function spyOnPlayPause() {
    const calls = { play: [], pause: [] };
    const originalPlay = window.HTMLMediaElement.prototype.play;
    const originalPause = window.HTMLMediaElement.prototype.pause;
    window.HTMLMediaElement.prototype.play = function () {
      calls.play.push(this);
      return Promise.resolve();
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

  async function openAudioQualitySubmenu(root) {
    await ensureMoreMenuOpen(root);
    findPlayerControls(root).querySelector('[data-testid="player-menu-audio-quality-row"]').click();
    await nextTick();
  }

  async function audioQualityOptionButton(root, value) {
    await openAudioQualitySubmenu(root);
    return findPlayerControls(root).querySelector(`[data-testid="player-audio-quality-option-${value}"]`);
  }

  async function selectAudioQualityOption(root, value) {
    (await audioQualityOptionButton(root, value)).click();
  }

  async function mountPlaying() {
    const root = await loadAlbumPromo();
    await nextTick();
    await nextTick();
    return root;
  }

  describe("PlayerControls Audio Quality (issue #448)", () => {
    it("AC1: offers Auto / High / Medium / Low in the Audio Quality sub-menu", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        await openAudioQualitySubmenu(root);
        ["auto", "high", "medium", "low"].forEach((value) => {
          const option = findPlayerControls(root).querySelector(
            `[data-testid="player-audio-quality-option-${value}"]`
          );
          expect(option).toBeTruthy();
        });
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("AC2: highlights the active option by color/class, with no leading ✓ mark", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        await selectAudioQualityOption(root, "high");
        await nextTick();

        const option = await audioQualityOptionButton(root, "high");
        expect(option.className.includes("is-active")).toBeTruthy();
        expect(option.getAttribute("aria-checked")).toBe("true");
        expect(option.textContent.includes("✓")).toBeFalsy();
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("AC3: selecting High/Medium/Low sets hls.currentLevel by matching each level's real bitrate, not its list index", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        const hls = window.latestHlsInstance();
        expect(hls).toBeTruthy();
        // Deliberately unsorted and not in AUDIO_QUALITY_OPTIONS order — an
        // index-based (levels[0]/[1]/[2]) implementation would map to the
        // wrong level here; only bitrate-based matching is correct.
        hls.levels = [
          { bitrate: 160000 }, // index 0: Medium
          { bitrate: 64000 }, // index 1: Low
          { bitrate: 320000 }, // index 2: High
        ];

        await selectAudioQualityOption(root, "high");
        await nextTick();
        expect(hls.currentLevel).toBe(2);

        await selectAudioQualityOption(root, "medium");
        await nextTick();
        expect(hls.currentLevel).toBe(0);

        await selectAudioQualityOption(root, "low");
        await nextTick();
        expect(hls.currentLevel).toBe(1);
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("AC3: selecting Auto sets hls.currentLevel back to -1 (hls.js's own ABR mode)", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        const hls = window.latestHlsInstance();
        hls.levels = [{ bitrate: 160000 }, { bitrate: 64000 }, { bitrate: 320000 }];

        await selectAudioQualityOption(root, "high");
        await nextTick();
        expect(hls.currentLevel).toBe(2);

        await selectAudioQualityOption(root, "auto");
        await nextTick();
        expect(hls.currentLevel).toBe(-1);
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("AC3 (Native HLS fallback, 2026-08-24 review Q&A): the menu still renders and highlights selections, but selecting an option is a no-op with no hls.js instance to control", async () => {
      const originalHls = window.Hls;
      delete window.Hls;
      const originalCanPlayType = window.HTMLMediaElement.prototype.canPlayType;
      window.HTMLMediaElement.prototype.canPlayType = function (type) {
        return type === "application/vnd.apple.mpegurl" ? "probably" : "";
      };
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        expect(window.latestHlsInstance()).toBeFalsy();

        await openAudioQualitySubmenu(root);
        ["auto", "high", "medium", "low"].forEach((value) => {
          expect(
            findPlayerControls(root).querySelector(`[data-testid="player-audio-quality-option-${value}"]`)
          ).toBeTruthy();
        });

        await selectAudioQualityOption(root, "high");
        await nextTick();

        const option = await audioQualityOptionButton(root, "high");
        expect(option.getAttribute("aria-checked")).toBe("true");
        expect(option.className.includes("is-active")).toBeTruthy();
      } finally {
        window.HTMLMediaElement.prototype.canPlayType = originalCanPlayType;
        if (originalHls) {
          window.Hls = originalHls;
        } else {
          delete window.Hls;
        }
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("AC4: never writes to localStorage when a quality option is selected (session-only)", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await mountPlaying();
      const lengthBefore = window.localStorage.length;

      try {
        await selectAudioQualityOption(root, "high");
        await nextTick();
        expect(window.localStorage.length).toBe(lengthBefore);
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("AC5: switching Audio Quality mid-countdown still applies the new hls.currentLevel and leaves the Sleep Timer counting down", async () => {
      window.installMockHls();
      window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__ = 20;
      window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__ = 8;
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        const hls = window.latestHlsInstance();
        hls.levels = [{ bitrate: 160000 }, { bitrate: 64000 }, { bitrate: 320000 }];

        await ensureMoreMenuOpen(root);
        findPlayerControls(root).querySelector('[data-testid="player-menu-sleep-timer-row"]').click();
        await nextTick();
        findPlayerControls(root).querySelector('[data-testid="player-sleep-timer-option-15"]').click();
        await nextTick();

        const panel = () => findPlayerControls(root).querySelector('[data-testid="player-sleep-timer-panel"]');
        expect(panel()).toBeTruthy();
        const countdownText = () => {
          const p = panel();
          return p && p.querySelector('[data-testid="player-sleep-timer-countdown"]').textContent;
        };
        const beforeText = countdownText();

        await selectAudioQualityOption(root, "high");
        await nextTick();

        expect(hls.currentLevel).toBe(2);
        // Sleep Timer panel must still be present and still counting down —
        // an Audio Quality change must never cancel or reset it (AC5).
        expect(panel()).toBeTruthy();
        await waitFor(() => countdownText() !== beforeText);
        expect(countdownText() === beforeText).toBeFalsy();
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__;
        delete window.__ALBUM_PROMO_SLEEP_TIMER_SECONDS_OVERRIDE__;
      }
    });
  });
})();
