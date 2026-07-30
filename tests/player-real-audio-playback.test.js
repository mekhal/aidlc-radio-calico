/**
 * Issue #220 (Option B, confirmed 2026-07-30): real audio playback for the
 * Music Player Card's PlayerControls, built as a self-contained path inside
 * album-promo.js — not imported from app.js — per the page's existing
 * standalone-page precedent (AC6, #158).
 *   AC1: exactly one real <audio> element renders once PlayerControls
 *        mounts, with no controls/autoplay attributes.
 *   AC2: the <audio> element is wired to the live stream via window.Hls
 *        (hls.js) — loadSource(STREAM_URL) + attachMedia(audio) — using the
 *        same stream URL app.js uses, set up on mount (not lazily on click).
 *   AC3: clicking the play/pause button calls .play()/.pause() on the real
 *        <audio> element; aria-pressed keeps reflecting isPlaying.
 *   AC4: the volume slider sets the real <audio> element's .volume, scaled
 *        from the input's 0-100 range to the element's native 0-1 range.
 *   AC6: tearing down the page pauses playback and destroys the Hls
 *        instance — no leftover instance survives across page loads/tests.
 * AC5 (hls.js CDN entry + <script> wiring) is Code PR-only — no test infra
 * in this repo asserts CDN config<->HTML consistency (see the Plan comment
 * on issue #220), so it isn't covered here.
 *
 * These fail today (RED) — PlayerControls (album-promo.js:555-602) only
 * toggles local React state; no <audio> element exists anywhere in
 * album-promo.js. See tests/README.md for how to run this suite.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadAlbumPromo, unloadAlbumPromo } = window.AlbumPromoTestHelpers;

  const STREAM_URL = "https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8";

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

  describe("PlayerControls real audio playback (issue #220, Option B)", () => {
    it("renders exactly one real <audio> element with no controls/autoplay (AC1)", async () => {
      window.installMockHls();
      const root = await loadAlbumPromo();
      await nextTick();

      const audioEls = findPlayerControls(root).querySelectorAll("audio");
      expect(audioEls.length).toBe(1);
      expect(audioEls[0].hasAttribute("controls")).toBeFalsy();
      expect(audioEls[0].hasAttribute("autoplay")).toBeFalsy();

      unloadAlbumPromo(root);
    });

    it("wires the audio element to the live stream via Hls.js on mount (AC2)", async () => {
      window.installMockHls();
      const root = await loadAlbumPromo();
      await nextTick();

      const hls = window.latestHlsInstance();
      expect(hls).toBeTruthy();
      expect(hls.source).toBe(STREAM_URL);

      const audio = findPlayerControls(root).querySelector("audio");
      expect(hls.media).toBe(audio);

      unloadAlbumPromo(root);
    });

    it("calls audio.play()/.pause() when the play/pause button is clicked, keeping aria-pressed in sync (AC3)", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await loadAlbumPromo();
      await nextTick();

      const button = root.querySelector('[data-testid="player-play-pause"]');

      button.click();
      await nextTick();
      expect(spy.calls.play.length).toBe(1);
      expect(button.getAttribute("aria-pressed")).toBe("true");

      button.click();
      await nextTick();
      expect(spy.calls.pause.length).toBe(1);
      expect(button.getAttribute("aria-pressed")).toBe("false");

      spy.restore();
      unloadAlbumPromo(root);
    });

    it("sets the real audio element's volume from the slider, scaled 0-100 -> 0-1 (AC4)", async () => {
      window.installMockHls();
      const root = await loadAlbumPromo();
      await nextTick();

      const audio = findPlayerControls(root).querySelector("audio");
      const slider = root.querySelector('[data-testid="player-volume"] input');

      setSliderValue(slider, 50);
      await nextTick();

      expect(audio.volume).toBe(0.5);

      unloadAlbumPromo(root);
    });

    it("pauses and destroys the Hls instance when the page is torn down (AC6)", async () => {
      window.installMockHls();
      const root = await loadAlbumPromo();
      await nextTick();

      const hls = window.latestHlsInstance();
      expect(hls.destroyed).toBeFalsy();

      unloadAlbumPromo(root);
      await nextTick();

      expect(hls.destroyed).toBeTruthy();
    });
  });
})();
