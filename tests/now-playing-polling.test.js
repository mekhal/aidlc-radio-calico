/**
 * Ticket D (issue #158): near-real-time refresh.
 *
 * Per docs/decisions/2026-07-24-ticket-d-cover-art-react-dom-stack-and-polling-interval.md
 * (10s polling, via setInterval + cleanup) and the 2026-07-28 step-3
 * approval on issue #158 ("การดึงข้อมูลปก กับ metadata แบบ near real-time"),
 * cover art AND title/artist/etc. metadata refresh together on ONE shared
 * poll loop against metadatav2.json — not two independent cadences. The
 * poll interval is overridable via window.__ALBUM_PROMO_METADATA_POLL_MS__
 * (default 10000) so tests don't wait a real 10 seconds.
 *
 * Fails today (RED) — album-promo.js doesn't fetch metadata at all yet, let
 * alone poll it.
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

  const FIRST = {
    artist: "Chloe x Halle",
    title: "Ungodly Hour",
    prev_artist_1: "a1",
    prev_title_1: "t1",
    prev_artist_2: "a2",
    prev_title_2: "t2",
    prev_artist_3: "a3",
    prev_title_3: "t3",
    prev_artist_4: "a4",
    prev_title_4: "t4",
    prev_artist_5: "a5",
    prev_title_5: "t5",
  };
  const SECOND = {
    artist: "Solange",
    title: "Cranes in the Sky",
    prev_artist_1: "b1",
    prev_title_1: "u1",
    prev_artist_2: "b2",
    prev_title_2: "u2",
    prev_artist_3: "b3",
    prev_title_3: "u3",
    prev_artist_4: "b4",
    prev_title_4: "u4",
    prev_artist_5: "b5",
    prev_title_5: "u5",
  };

  describe("Now Playing near-real-time refresh (issue #158, Ticket D)", () => {
    it("re-fetches metadata and updates title/artist on the poll interval", async () => {
      window.__ALBUM_PROMO_METADATA_POLL_MS__ = 50;
      const mock = window.installMockMetadataFetch({ metadataResponses: [FIRST, SECOND] });
      const root = await loadAlbumPromo();
      try {
        await waitFor(() => root.querySelector("#track-title").textContent === FIRST.title);
        await waitFor(() => root.querySelector("#track-title").textContent === SECOND.title);

        expect(root.querySelector("#track-artist").textContent).toBe(SECOND.artist);
        expect(mock.metadataCalls).toBeGreaterThan(1);
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_METADATA_POLL_MS__;
      }
    });

    it("re-fetches cover art on the same poll interval as the metadata (not a separate cadence)", async () => {
      window.__ALBUM_PROMO_METADATA_POLL_MS__ = 50;
      const mock = window.installMockMetadataFetch({ metadataResponses: [FIRST, SECOND] });
      const root = await loadAlbumPromo();
      try {
        await waitFor(() => mock.coverCalls > 1);

        expect(mock.coverCalls).toBeGreaterThan(1);
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
        delete window.__ALBUM_PROMO_METADATA_POLL_MS__;
      }
    });
  });
})();
