/**
 * Issue #465: the speaker icon next to the volume slider
 * (`.chloe-player-controls__volume`, `data-testid="player-volume"`) is
 * currently a static, non-interactive Bootstrap icon (`bi-volume-up`,
 * album-promo.js, inside the `player-volume` label) — clicking it does
 * nothing and there is no mute/unmute state anywhere in `PlayerControls`.
 * Plan approved 2026-08-25 (issue #465 review + approval) covers:
 *
 *   AC1: the speaker renders as its own button
 *        (`data-testid="player-mute"`, separate from the `player-volume`
 *        label/range input, mirroring the `player-play-pause` button's
 *        accessibility pattern). Clicking it toggles mute: muting silences
 *        the real `<audio>` element (`audio.muted === true`) WITHOUT moving
 *        the volume slider's value; unmuting restores audible playback
 *        (`audio.muted === false`) with the slider unchanged.
 *   AC2: the icon and button state reflect mute status —
 *        `bi-volume-up` / `aria-pressed="false"` / `aria-label="Mute"` when
 *        unmuted, `bi-volume-mute` / `aria-pressed="true"` /
 *        `aria-label="Unmute"` when muted.
 *   AC3: dragging the volume slider to 0 automatically shows the muted
 *        icon/state (no click needed) and silences the audio element;
 *        dragging it back above 0 automatically un-mutes and restores
 *        audible playback at that slider value — no click needed either
 *        direction.
 *   Approved default (2026-08-25, issue #465 approval, question 1):
 *        un-muting while the slider is at 0 (auto-muted, or a manual mute
 *        that gets un-muted while volume is 0) restores the last non-zero
 *        volume the slider had, rather than leaving it at 0.
 *
 * These fail today (RED) — `album-promo.js`'s `PlayerControls` has no
 * `isMuted` state, no `data-testid="player-mute"` button, and the speaker
 * `<i>` is a static `bi-volume-up` icon with no click handler; the volume
 * `useEffect` only sets `audio.volume`, never `audio.muted`. See
 * tests/README.md for how to run this suite.
 *
 * Per the "test-pr-native-api-and-self-ref-checklist" published skill
 * (docs/knowledge-asset/published/test-pr-native-api-and-self-ref-checklist.md):
 *   1. No native API override risk: this suite only reads/sets the real
 *      `<audio>` element's own `.muted`/`.volume` properties (plain
 *      instance properties the app code itself reads/writes, not a
 *      browser-driven side effect like navigation) and reuses the
 *      `play`/`pause` prototype spy already proven low-risk across this
 *      repo's other player suites (tests/player-real-audio-playback.test.js,
 *      tests/player-timer-and-autoplay.test.js). No new seam needed.
 *   2. Self-referential test audit: n/a — no test in this file opens/clicks
 *      the in-app Test Report modal control, so (like the other `player-*`
 *      suites) this file is wired only into tests/test-runner.html, not
 *      into the in-app auto-run list (tests/test-report-suite-files.js).
 *
 * Verification note: headless-browser execution of this suite was not
 * available in this session (no network access for test-runner.html's CDN
 * React/ReactDOM scripts, and no --allowedTools headless-Chromium step) —
 * same documented gap as docs/decisions/2026-08-15-issue-375-case-study-nav-double-active-close.md.
 * These tests were verified RED by static tracing against the current
 * album-promo.js source instead of an actual run; flagging this explicitly
 * per that precedent rather than silently skipping verification.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadAlbumPromo, unloadAlbumPromo } = window.AlbumPromoTestHelpers;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
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

  function setSliderValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(input, String(value));
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function findPlayerControls(root) {
    return root.querySelector('[data-testid="player-controls"]');
  }

  function findMuteButton(root) {
    return findPlayerControls(root).querySelector('[data-testid="player-mute"]');
  }

  function findVolumeSlider(root) {
    return findPlayerControls(root).querySelector('[data-testid="player-volume"] input');
  }

  function findAudio(root) {
    return findPlayerControls(root).querySelector("audio");
  }

  function speakerIconClass(root) {
    return findMuteButton(root).querySelector("i").className;
  }

  describe("PlayerControls speaker mute/unmute (issue #465)", () => {
    it("renders the speaker as its own button, separate from the volume slider, unmuted by default (AC1/AC2)", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        const button = findMuteButton(root);
        expect(button).toBeTruthy();
        expect(button.tagName).toBe("BUTTON");
        expect(findVolumeSlider(root)).toBeTruthy();

        expect(button.getAttribute("aria-pressed")).toBe("false");
        expect(button.getAttribute("aria-label")).toBe("Mute");
        expect(speakerIconClass(root)).toContain("bi-volume-up");
        expect(speakerIconClass(root)).not.toContain("bi-volume-mute");
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("clicking the speaker button mutes the real audio element without moving the volume slider (AC1)", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        const slider = findVolumeSlider(root);
        setSliderValue(slider, 65);
        await nextTick();

        const button = findMuteButton(root);
        button.click();
        await nextTick();

        expect(findAudio(root).muted).toBeTruthy();
        expect(slider.value).toBe("65");
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("clicking the speaker button again un-mutes, restoring audible playback with the slider unchanged (AC1)", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        const slider = findVolumeSlider(root);
        setSliderValue(slider, 65);
        await nextTick();

        const button = findMuteButton(root);
        button.click(); // mute
        await nextTick();
        button.click(); // unmute
        await nextTick();

        expect(findAudio(root).muted).toBeFalsy();
        expect(slider.value).toBe("65");
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("swaps icon, aria-pressed, and aria-label between mute and unmute states (AC2)", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        const button = findMuteButton(root);

        button.click(); // mute
        await nextTick();
        expect(button.getAttribute("aria-pressed")).toBe("true");
        expect(button.getAttribute("aria-label")).toBe("Unmute");
        expect(speakerIconClass(root)).toContain("bi-volume-mute");
        expect(speakerIconClass(root)).not.toContain("bi-volume-up");

        button.click(); // unmute
        await nextTick();
        expect(button.getAttribute("aria-pressed")).toBe("false");
        expect(button.getAttribute("aria-label")).toBe("Mute");
        expect(speakerIconClass(root)).toContain("bi-volume-up");
        expect(speakerIconClass(root)).not.toContain("bi-volume-mute");
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("dragging the volume slider to 0 automatically mutes, no click needed (AC3)", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        const slider = findVolumeSlider(root);
        setSliderValue(slider, 0);
        await nextTick();

        expect(findAudio(root).muted).toBeTruthy();
        const button = findMuteButton(root);
        expect(button.getAttribute("aria-pressed")).toBe("true");
        expect(button.getAttribute("aria-label")).toBe("Unmute");
        expect(speakerIconClass(root)).toContain("bi-volume-mute");
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("dragging the slider back above 0 automatically un-mutes, no click needed (AC3)", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        const slider = findVolumeSlider(root);
        setSliderValue(slider, 0);
        await nextTick();

        setSliderValue(slider, 30);
        await nextTick();

        const audio = findAudio(root);
        expect(audio.muted).toBeFalsy();
        expect(audio.volume).toBe(0.3);
        const button = findMuteButton(root);
        expect(button.getAttribute("aria-pressed")).toBe("false");
        expect(button.getAttribute("aria-label")).toBe("Mute");
        expect(speakerIconClass(root)).toContain("bi-volume-up");
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("un-muting via the button after the slider auto-muted at 0 restores the last non-zero volume (approved default)", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        const slider = findVolumeSlider(root);
        setSliderValue(slider, 60);
        await nextTick();
        setSliderValue(slider, 0);
        await nextTick();

        const button = findMuteButton(root);
        expect(button.getAttribute("aria-pressed")).toBe("true"); // auto-muted at 0

        button.click(); // unmute
        await nextTick();

        const audio = findAudio(root);
        expect(audio.muted).toBeFalsy();
        expect(slider.value).toBe("60");
        expect(audio.volume).toBe(0.6);
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("un-muting a manual mute (volume already > 0) does not touch the last non-zero volume memory", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      try {
        const slider = findVolumeSlider(root);
        setSliderValue(slider, 45);
        await nextTick();

        const button = findMuteButton(root);
        button.click(); // manual mute, slider stays at 45
        await nextTick();
        expect(slider.value).toBe("45");

        button.click(); // unmute
        await nextTick();

        const audio = findAudio(root);
        expect(audio.muted).toBeFalsy();
        expect(slider.value).toBe("45");
        expect(audio.volume).toBe(0.45);
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });
  });
})();
