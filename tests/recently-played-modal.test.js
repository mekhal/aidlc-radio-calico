/**
 * Issue #209 (Recently Played modal, split from #158) — AC2 only, per the
 * human's step-3/4 scoping decision ("@claude approved create test pr only
 * ac 2"): Modal open/close behavior. AC1 (trigger button placement), AC3
 * (list content/format), AC4 (live updates), AC5 (theming), AC6 (inline
 * section removal) and AC7 (i18n keys) are intentionally NOT covered here —
 * they get their own Test PR(s) later if/when the human asks for them.
 *
 * AC2 text (from the approved plan):
 *   "Clicking the trigger renders a dialog (data-testid="recently-played-modal",
 *   role="dialog", aria-modal="true") with a backdrop
 *   (data-testid="recently-played-modal-backdrop") and a close button
 *   (data-testid="recently-played-modal-close", aria-label from i18n).
 *   Escape, a backdrop click, or the close button all close the modal; on
 *   close, focus returns to the trigger button; closing removes the
 *   modal/backdrop nodes and their listeners from the DOM (no leaks across
 *   repeated open/close cycles)."
 *
 * Fails today (RED) — neither the recently-played-trigger button nor the
 * recently-played-modal exist yet in album-promo.js. The trigger's
 * data-testid contract ("recently-played-trigger") comes from the plan
 * posted on issue #209 (AC1) — AC2 depends on it existing to be clickable,
 * even though AC1's own placement/styling assertions are out of scope here.
 *
 * Modeled on tests/test-report-modal.test.js's open/close coverage of
 * app.js's openTestReportModal() (issue #41) — same interaction contract
 * (Escape/backdrop-click/close-button all close, focus returns to trigger),
 * reused here per CLAUDE.md's reuse-first rule rather than inventing a new
 * pattern.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadAlbumPromo, unloadAlbumPromo } = window.AlbumPromoTestHelpers;

  async function waitFor(predicate, { timeout = 1500, interval = 20 } = {}) {
    const start = Date.now();
    for (;;) {
      const value = predicate();
      if (value) return value;
      if (Date.now() - start >= timeout) {
        throw new Error("waitFor: timed out waiting for condition");
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  const SAMPLE_METADATA = {
    artist: "Chloe x Halle",
    title: "Ungodly Hour",
    prev_artist_1: "Frank Ocean",
    prev_title_1: "Pyramids",
    prev_artist_2: "SZA",
    prev_title_2: "Good Days",
    prev_artist_3: "Solange",
    prev_title_3: "Cranes in the Sky",
    prev_artist_4: "Daniel Caesar",
    prev_title_4: "Best Part",
    prev_artist_5: "Jorja Smith",
    prev_title_5: "Blue Lights",
  };

  function findTrigger(root) {
    return root.querySelector('[data-testid="recently-played-trigger"]');
  }

  function findModal() {
    return document.querySelector('[data-testid="recently-played-modal"]');
  }

  function findBackdrop() {
    return document.querySelector('[data-testid="recently-played-modal-backdrop"]');
  }

  function findCloseButton() {
    return document.querySelector('[data-testid="recently-played-modal-close"]');
  }

  async function openModal(trigger) {
    trigger.click();
    return waitFor(() => findModal());
  }

  describe("Recently Played modal open/close behavior (issue #209, AC2)", () => {
    it("opens a dialog with a backdrop and close button when the trigger is clicked", async () => {
      const mock = window.installMockMetadataFetch({ metadataResponse: SAMPLE_METADATA });
      const root = await loadAlbumPromo();
      try {
        const trigger = findTrigger(root);
        expect(trigger).toBeTruthy();

        const modal = await openModal(trigger);
        expect(modal).toBeTruthy();
        expect(modal.getAttribute("role")).toBe("dialog");
        expect(modal.getAttribute("aria-modal")).toBe("true");

        const backdrop = findBackdrop();
        expect(backdrop).toBeTruthy();

        const closeButton = findCloseButton();
        expect(closeButton).toBeTruthy();
        expect((closeButton.getAttribute("aria-label") || "").length).toBeGreaterThan(0);

        closeButton.click();
        await waitFor(() => !findModal());
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });

    it("closes on Escape and returns focus to the trigger button", async () => {
      const mock = window.installMockMetadataFetch({ metadataResponse: SAMPLE_METADATA });
      const root = await loadAlbumPromo();
      try {
        const trigger = findTrigger(root);
        await openModal(trigger);

        document.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
        );
        await waitFor(() => !findModal());

        expect(document.activeElement).toBe(trigger);
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });

    it("closes via the close button and returns focus to the trigger button", async () => {
      const mock = window.installMockMetadataFetch({ metadataResponse: SAMPLE_METADATA });
      const root = await loadAlbumPromo();
      try {
        const trigger = findTrigger(root);
        await openModal(trigger);

        const closeButton = findCloseButton();
        closeButton.click();
        await waitFor(() => !findModal());

        expect(document.activeElement).toBe(trigger);
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });

    it("closes when clicking outside the modal (on the backdrop)", async () => {
      const mock = window.installMockMetadataFetch({ metadataResponse: SAMPLE_METADATA });
      const root = await loadAlbumPromo();
      try {
        const trigger = findTrigger(root);
        await openModal(trigger);

        const backdrop = findBackdrop();
        expect(backdrop).toBeTruthy();
        backdrop.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        await waitFor(() => !findModal());
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });

    it("removes the modal/backdrop nodes on close, with no leaks across repeated open/close cycles", async () => {
      const mock = window.installMockMetadataFetch({ metadataResponse: SAMPLE_METADATA });
      const root = await loadAlbumPromo();
      try {
        const trigger = findTrigger(root);

        await openModal(trigger);
        expect(document.querySelectorAll('[data-testid="recently-played-modal"]').length).toBe(1);
        expect(document.querySelectorAll('[data-testid="recently-played-modal-backdrop"]').length).toBe(
          1
        );

        findCloseButton().click();
        await waitFor(() => !findModal());
        expect(document.querySelectorAll('[data-testid="recently-played-modal"]').length).toBe(0);
        expect(document.querySelectorAll('[data-testid="recently-played-modal-backdrop"]').length).toBe(
          0
        );

        await openModal(trigger);
        expect(document.querySelectorAll('[data-testid="recently-played-modal"]').length).toBe(1);
        expect(document.querySelectorAll('[data-testid="recently-played-modal-backdrop"]').length).toBe(
          1
        );

        findCloseButton().click();
        await waitFor(() => !findModal());
        expect(document.querySelectorAll('[data-testid="recently-played-modal"]').length).toBe(0);
        expect(document.querySelectorAll('[data-testid="recently-played-modal-backdrop"]').length).toBe(
          0
        );
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });
  });
})();
