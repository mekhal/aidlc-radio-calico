/**
 * Issue #449 (Ticket 3 of #421, Share): the ⋮ More Options sub-menu shell
 * (Ticket 0, issue #446, already merged into develop) renders a "Share" menu
 * item (`data-testid="player-share"`), but selecting it only closes the ⋮
 * menu — album-promo.js:838's onClick is `() => setIsMoreMenuOpen(false)`,
 * nothing else. This suite covers issue #449's own Acceptance Criteria (AC
 * numbering matches the issue body):
 *
 *   AC1: the ⋮ More Options menu offers a Share item that is a single action
 *        (not a sub-option list like Sleep Timer/Audio Quality) — clicking it
 *        never opens a nested sub-menu panel.
 *   AC2: clicking Share opens a Modal containing a Copy Link button, and
 *        clicking Copy Link copies the current page URL via
 *        `window.location.href`.
 *   AC3: the Web Share API (`navigator.share()`) is never used/called.
 *   AC4: the modal has no social-media icons/buttons — Copy Link is the only
 *        share action present.
 *
 * These fail today (RED) — there is no modal, no Copy Link button, and no
 * clipboard wiring anywhere in album-promo.js yet.
 *
 * Follow-up (2026-08-24, same issue #449 thread, "Option A" chosen at the
 * review turn): clicking Copy Link gave no visible/screen-reader confirmation
 * that the copy happened. This adds one AC on top of the four above:
 *
 *   AC5: clicking Copy Link shows a "copied" confirmation (the button's own
 *        text swaps to a distinct copied-state label, `aria-live="polite"`
 *        announces it) for a short time, then reverts automatically.
 *
 * Per the "interval-tick-override-and-cleanup-pattern" published skill
 * (docs/knowledge-asset/published/interval-tick-override-and-cleanup-pattern.md),
 * the revert delay is not hardcoded-and-awaited in real time; the Code PR
 * must read it from an overridable window global with a sane default:
 *
 *   window.__ALBUM_PROMO_SHARE_COPIED_FEEDBACK_MS__
 *     Optional test-only override (default 2000ms in real use). When set,
 *     the "copied" auto-revert timeout uses this value instead.
 *
 * The exact copied-state label text is i18n-dependent, so this test asserts
 * on a stable `data-copied="true"/"false"` attribute on the Copy Link button
 * (data-testid stays "player-share-copy-link" — no new element/testid) plus
 * a text-content change, rather than a hardcoded translated string.
 *
 * Per the "test-pr-native-api-and-self-ref-checklist" published skill
 * (docs/knowledge-asset/published/test-pr-native-api-and-self-ref-checklist.md),
 * this suite does not override `navigator.clipboard.writeText` directly
 * (browsers can silently no-op such an override). Instead it assumes the
 * Code PR wires the actual copy through a small app-level seam, matching the
 * existing `window.__ALBUM_PROMO_..._OVERRIDE__`-style hooks already used
 * elsewhere in album-promo.js (e.g. `__ALBUM_PROMO_SLEEP_TIMER_TICK_MS__`):
 *
 *   window.__ALBUM_PROMO_COPY_TO_CLIPBOARD__
 *     Optional test-only hook. When set, the app calls it as
 *     `window.__ALBUM_PROMO_COPY_TO_CLIPBOARD__(text)` instead of the real
 *     clipboard API. When unset, the app calls
 *     `navigator.clipboard.writeText(text)` for real. `text` is always
 *     `window.location.href` at the moment Copy Link is clicked.
 *
 * This is the explicit seam contract the Code PR (step 6) must implement —
 * same reasoning as player-sleep-timer.test.js's tick-override contract.
 * `navigator.share` itself IS safe to spy on directly (a plain method call
 * with no browser-enforced side effect, same low-risk category as this
 * repo's existing HTMLMediaElement.prototype.play/pause overrides).
 *
 * Not wired into tests/test-report-suite-files.js — same category as
 * player-sleep-timer.test.js/player-audio-quality.test.js (exercises
 * PlayerControls, not app.js's own interface), so wired directly into
 * tests/test-runner.html only.
 *
 * Second follow-up (same day, same issue #449 thread): in addition to
 * Option A above, also add Option B — a small inline `<span>` next to the
 * Copy Link button (`data-testid="player-share-copied-status"`) that shows
 * while the button is in its copied state and clears when it reverts. The
 * human explicitly waived a separate Test PR for this one, so its assertion
 * is bundled directly into this file's Code PR commit instead — see the
 * "AC5 follow-up (Option B)" test below.
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

  function spyOnShare() {
    const originalShare = window.navigator.share;
    const calls = [];
    window.navigator.share = function (...args) {
      calls.push(args);
      return Promise.resolve();
    };
    return {
      calls,
      restore: () => {
        if (originalShare) {
          window.navigator.share = originalShare;
        } else {
          delete window.navigator.share;
        }
      },
    };
  }

  function stubClipboardHook() {
    const calls = [];
    window.__ALBUM_PROMO_COPY_TO_CLIPBOARD__ = (text) => {
      calls.push(text);
      return Promise.resolve();
    };
    return {
      calls,
      restore: () => {
        delete window.__ALBUM_PROMO_COPY_TO_CLIPBOARD__;
      },
    };
  }

  function findPlayerControls(root) {
    return root.querySelector('[data-testid="player-controls"]');
  }

  function moreOptionsButton(root) {
    return findPlayerControls(root).querySelector('[data-testid="player-more-options"]');
  }

  function ensureMoreMenuOpen(root) {
    const button = moreOptionsButton(root);
    if (button.getAttribute("aria-expanded") !== "true") button.click();
  }

  function shareMenuItem(root) {
    ensureMoreMenuOpen(root);
    return findPlayerControls(root).querySelector('[data-testid="player-share"]');
  }

  function openShareModal(root) {
    shareMenuItem(root).click();
  }

  function shareModal(root) {
    return document.querySelector('[data-testid="player-share-modal"]');
  }

  function copyLinkButton(root) {
    const modal = shareModal(root);
    return modal && modal.querySelector('[data-testid="player-share-copy-link"]');
  }

  function copiedStatusSpan(root) {
    const modal = shareModal(root);
    return modal && modal.querySelector('[data-testid="player-share-copied-status"]');
  }

  async function mountPlaying() {
    const root = await loadAlbumPromo();
    await nextTick();
    await nextTick();
    return root;
  }

  describe("PlayerControls Share (issue #449)", () => {
    it("AC1: the ⋮ menu offers a Share item that is a single action, not a sub-option list", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        const item = shareMenuItem(root);
        expect(item).toBeTruthy();
        expect(item.getAttribute("role")).toBe("menuitem");

        item.click();
        await nextTick();

        // Clicking Share must not open a nested sub-menu panel the way
        // Sleep Timer/Audio Quality do (no "player-share-menu-panel", no
        // back button) — it opens the Copy Link modal instead (AC2).
        expect(
          findPlayerControls(root).querySelector('[data-testid="player-share-menu-panel"]')
        ).toBeFalsy();
        expect(shareModal(root)).toBeTruthy();
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("AC2: clicking Share opens a Modal containing a Copy Link button", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        openShareModal(root);
        await nextTick();

        const modal = shareModal(root);
        expect(modal).toBeTruthy();
        expect(modal.getAttribute("role")).toBe("dialog");
        expect(modal.getAttribute("aria-modal")).toBe("true");
        expect(copyLinkButton(root)).toBeTruthy();
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("AC2: clicking Copy Link copies window.location.href through the app's clipboard seam", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const clipboard = stubClipboardHook();
      const root = await mountPlaying();

      try {
        openShareModal(root);
        await nextTick();

        copyLinkButton(root).click();
        await nextTick();

        expect(clipboard.calls.length).toBe(1);
        expect(clipboard.calls[0]).toBe(window.location.href);
      } finally {
        spy.restore();
        clipboard.restore();
        unloadAlbumPromo(root);
      }
    });

    it("AC3: never calls the Web Share API (navigator.share())", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const share = spyOnShare();
      const clipboard = stubClipboardHook();
      const root = await mountPlaying();

      try {
        openShareModal(root);
        await nextTick();
        copyLinkButton(root).click();
        await nextTick();

        expect(share.calls.length).toBe(0);
      } finally {
        spy.restore();
        share.restore();
        clipboard.restore();
        unloadAlbumPromo(root);
      }
    });

    it("AC4: the modal has no social-media icons/buttons — Copy Link is the only share action", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const root = await mountPlaying();

      try {
        openShareModal(root);
        await nextTick();

        const modal = shareModal(root);
        const buttons = Array.from(modal.querySelectorAll("button"));
        // Only Copy Link + Close are expected inside the modal — anything
        // else (Facebook/X/WhatsApp/etc. icon buttons) would fail this.
        expect(buttons.length <= 2).toBeTruthy();
        buttons.forEach((button) => {
          const testid = button.getAttribute("data-testid") || "";
          expect(testid === "player-share-copy-link" || testid === "player-share-modal-close").toBeTruthy();
        });

        const socialSelectors = [
          '[class*="facebook"]',
          '[class*="twitter"]',
          '[class*="whatsapp"]',
          '[class*="bi-facebook"]',
          '[class*="bi-twitter"]',
          '[class*="bi-whatsapp"]',
          '[data-testid*="share-social"]',
        ];
        socialSelectors.forEach((selector) => {
          expect(modal.querySelector(selector)).toBeFalsy();
        });
      } finally {
        spy.restore();
        unloadAlbumPromo(root);
      }
    });

    it("AC5: clicking Copy Link shows a 'copied' confirmation, announced via aria-live, that auto-reverts", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const clipboard = stubClipboardHook();
      window.__ALBUM_PROMO_SHARE_COPIED_FEEDBACK_MS__ = 10;
      const root = await mountPlaying();

      try {
        openShareModal(root);
        await nextTick();

        const button = copyLinkButton(root);
        expect(button.getAttribute("aria-live")).toBe("polite");
        const originalLabel = button.textContent;
        expect(button.getAttribute("data-copied")).toBe("false");

        button.click();
        await nextTick();

        expect(clipboard.calls.length).toBe(1);
        expect(button.getAttribute("data-copied")).toBe("true");
        expect(button.textContent).not.toBe(originalLabel);

        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(button.getAttribute("data-copied")).toBe("false");
        expect(button.textContent).toBe(originalLabel);
      } finally {
        delete window.__ALBUM_PROMO_SHARE_COPIED_FEEDBACK_MS__;
        spy.restore();
        clipboard.restore();
        unloadAlbumPromo(root);
      }
    });

    // Bundled directly into this Code PR (Test PR waived for this specific
    // follow-up, per the human's request on issue #449) rather than a
    // separate Test PR — still demonstrates the added behavior per the
    // CLAUDE.md Definition of Done for a waived Test PR.
    it("AC5 follow-up (Option B): an inline status span next to Copy Link appears while copied and clears after revert", async () => {
      window.installMockHls();
      const spy = spyOnPlayPause();
      const clipboard = stubClipboardHook();
      window.__ALBUM_PROMO_SHARE_COPIED_FEEDBACK_MS__ = 10;
      const root = await mountPlaying();

      try {
        openShareModal(root);
        await nextTick();

        expect(copiedStatusSpan(root)).toBe(null);

        copyLinkButton(root).click();
        await nextTick();

        const status = copiedStatusSpan(root);
        expect(status).not.toBe(null);
        expect(status.textContent.length > 0).toBe(true);

        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(copiedStatusSpan(root)).toBe(null);
      } finally {
        delete window.__ALBUM_PROMO_SHARE_COPIED_FEEDBACK_MS__;
        spy.restore();
        clipboard.restore();
        unloadAlbumPromo(root);
      }
    });

  });
})();
