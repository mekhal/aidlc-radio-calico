/**
 * Ticket D (issue #158), AC3: render a "เล่นล่าสุด" (Recently Played) list of
 * the 5 previous tracks using the prev_artist_1..5/prev_title_1..5 fields
 * from the same metadatav2.json response, placed below the hero/player
 * section.
 *
 * Fails today (RED) — album-promo.js's buildMain() only appends buildHero();
 * there is no Recently Played section, and no [data-testid="recently-played"]
 * hook, anywhere in the page yet.
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

  describe("Recently Played list (issue #158, Ticket D, AC3)", () => {
    it("renders exactly 5 previously played tracks", async () => {
      const mock = window.installMockMetadataFetch({ metadataResponse: SAMPLE_METADATA });
      const root = await loadAlbumPromo();
      try {
        await waitFor(() => root.querySelectorAll('[data-testid="recently-played-item"]').length === 5);

        expect(root.querySelectorAll('[data-testid="recently-played-item"]').length).toBe(5);
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });

    it("renders each item's artist and title from prev_artist_N/prev_title_N", async () => {
      const mock = window.installMockMetadataFetch({ metadataResponse: SAMPLE_METADATA });
      const root = await loadAlbumPromo();
      try {
        await waitFor(() => root.querySelectorAll('[data-testid="recently-played-item"]').length === 5);

        const items = root.querySelectorAll('[data-testid="recently-played-item"]');
        [1, 2, 3, 4, 5].forEach((n, index) => {
          const item = items[index];
          expect(item.querySelector('[data-testid="recently-played-artist"]').textContent).toBe(
            SAMPLE_METADATA[`prev_artist_${n}`]
          );
          expect(item.querySelector('[data-testid="recently-played-title"]').textContent).toBe(
            SAMPLE_METADATA[`prev_title_${n}`]
          );
        });
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });

    it("places the Recently Played section below the hero/player section in DOM order", async () => {
      const mock = window.installMockMetadataFetch({ metadataResponse: SAMPLE_METADATA });
      const root = await loadAlbumPromo();
      try {
        await waitFor(() => root.querySelector('[data-testid="recently-played"]'));

        const hero = root.querySelector('[data-testid="hero-player-slot"]');
        const recentlyPlayed = root.querySelector('[data-testid="recently-played"]');
        expect(hero).toBeTruthy();
        expect(recentlyPlayed).toBeTruthy();
        expect(
          !!(hero.compareDocumentPosition(recentlyPlayed) & Node.DOCUMENT_POSITION_FOLLOWING)
        ).toBeTruthy();
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });
  });
})();
