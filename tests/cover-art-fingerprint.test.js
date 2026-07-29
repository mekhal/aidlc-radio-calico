/**
 * Issue #158 follow-up (PR #212 review): unit coverage for
 * album-promo.js's fetchCoverFingerprint(), the SHA-256 digest that
 * refreshNowPlaying() (album-promo.js) compares against
 * state.nowPlaying.lastCoverFingerprint to decide whether #album-cover needs
 * a cache-busted repaint on each poll tick.
 *
 * Per AC5 (tests/README.md / now-playing-metadata-fetch.test.js): this repo's
 * suites verify internal functions indirectly through DOM behavior rather
 * than exposing them on window purely for testing. So instead of calling
 * fetchCoverFingerprint() directly, these tests drive the two bytes-in
 * scenarios that its digest must distinguish — identical cover bytes across
 * polls vs. changed cover bytes — via installMockMetadataFetch's
 * coverResponses queue, and assert on the #album-cover src behavior that
 * depends on the fingerprint comparison.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadAlbumPromo, unloadAlbumPromo } = window.AlbumPromoTestHelpers;

  function delay(ms) {
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
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  const SAMPLE_METADATA = { artist: "Chloe x Halle", title: "Ungodly Hour" };

  describe("fetchCoverFingerprint (issue #158 follow-up)", () => {
    it("does not repaint #album-cover on a poll tick whose cover bytes are unchanged", async () => {
      window.__ALBUM_PROMO_METADATA_POLL_MS__ = 50;
      const mock = window.installMockMetadataFetch({
        metadataResponse: SAMPLE_METADATA,
        coverResponses: ["same-bytes", "same-bytes", "same-bytes", "same-bytes"],
      });
      const root = await loadAlbumPromo();
      const cover = root.querySelector("#album-cover");
      try {
        // First fetch always cache-busts (fingerprint has no prior value to compare against).
        await waitFor(() => cover.src.includes("?t="));
        const srcAfterFirstFetch = cover.src;

        // Let several more polls (all with the same bytes) run their full
        // fetch → blob → digest → compare chain before asserting nothing
        // repainted, so this doesn't just get lucky on timing.
        await waitFor(() => mock.coverCalls >= 4);
        await delay(100);

        expect(cover.src).toBe(srcAfterFirstFetch);
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_METADATA_POLL_MS__;
      }
    });

    it("repaints #album-cover with a fresh cache-busted src once the cover bytes actually change", async () => {
      window.__ALBUM_PROMO_METADATA_POLL_MS__ = 50;
      const mock = window.installMockMetadataFetch({
        metadataResponse: SAMPLE_METADATA,
        coverResponses: ["bytes-a", "bytes-b"],
      });
      const root = await loadAlbumPromo();
      const cover = root.querySelector("#album-cover");
      try {
        await waitFor(() => cover.src.includes("?t="));
        const srcAfterFirstFetch = cover.src;

        await waitFor(() => cover.src !== srcAfterFirstFetch);

        expect(cover.src).toContain("cover.jpg");
        expect(cover.src === srcAfterFirstFetch).toBeFalsy();
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_METADATA_POLL_MS__;
      }
    });
  });
})();
