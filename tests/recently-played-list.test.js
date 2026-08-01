/**
 * Ticket D (issue #158), AC3: originally rendered a "เล่นล่าสุด" (Recently
 * Played) list of the 5 previous tracks using the prev_artist_1..5/
 * prev_title_1..5 fields from the same metadatav2.json response, inline
 * below the hero/player section.
 *
 * Updated for issue #209 (Recently Played moved into a Modal, AC6): the
 * inline section was deleted outright, so the list now only exists inside
 * the modal opened via [data-testid="recently-played-trigger"]. These tests
 * open the modal first — renderRecentlyPlayed()/parseRecentlyPlayed() and
 * the recently-played-item/-artist/-title test-ids are unchanged, only
 * where the list lives in the DOM changed. The former "DOM order below
 * hero" assertion no longer applies (it checked the now-deleted inline
 * section) and isn't replaced with new trigger-placement coverage here,
 * since AC1 wasn't in this Test PR's scope — see
 * tests/recently-played-modal.test.js for the AC2 open/close coverage this
 * complements.
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

  async function openRecentlyPlayedModal(root) {
    const trigger = root.querySelector('[data-testid="recently-played-trigger"]');
    trigger.click();
    return waitFor(() => document.querySelector('[data-testid="recently-played-modal"]'));
  }

  function closeRecentlyPlayedModal() {
    const closeButton = document.querySelector('[data-testid="recently-played-modal-close"]');
    if (closeButton) closeButton.click();
  }

  describe("Recently Played list (issue #158, Ticket D, AC3 — moved into a Modal by issue #209)", () => {
    it("renders exactly 5 previously played tracks in the modal", async () => {
      const mock = window.installMockMetadataFetch({ metadataResponse: SAMPLE_METADATA });
      const root = await loadAlbumPromo();
      try {
        await openRecentlyPlayedModal(root);
        await waitFor(() => document.querySelectorAll('[data-testid="recently-played-item"]').length === 5);

        expect(document.querySelectorAll('[data-testid="recently-played-item"]').length).toBe(5);
        closeRecentlyPlayedModal();
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });

    it("renders each item's artist and title from prev_artist_N/prev_title_N", async () => {
      const mock = window.installMockMetadataFetch({ metadataResponse: SAMPLE_METADATA });
      const root = await loadAlbumPromo();
      try {
        await openRecentlyPlayedModal(root);
        await waitFor(() => document.querySelectorAll('[data-testid="recently-played-item"]').length === 5);

        const items = document.querySelectorAll('[data-testid="recently-played-item"]');
        [1, 2, 3, 4, 5].forEach((n, index) => {
          const item = items[index];
          expect(item.querySelector('[data-testid="recently-played-artist"]').textContent).toBe(
            SAMPLE_METADATA[`prev_artist_${n}`]
          );
          expect(item.querySelector('[data-testid="recently-played-title"]').textContent).toBe(
            SAMPLE_METADATA[`prev_title_${n}`]
          );
        });
        closeRecentlyPlayedModal();
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });
  });
})();
