/**
 * Ticket D (issue #158): Now Playing data fetch + metadata rendering.
 *   AC1: on page load, fetch metadatav2.json; parse artist/title and write
 *        them into #track-artist/#track-title.
 *   AC2: fetch cover.jpg and set it as #album-cover's src.
 *   AC4: on fetch failure or CORS error, fall back gracefully — a default
 *        placeholder cover image (reusing RadioCalicoStyle/RadioCalicoLogoTM.png,
 *        per reuse-first, rather than a new asset) plus a status message,
 *        without breaking page layout.
 *   AC5: fetch/parse logic lives in small testable functions; verified here
 *        indirectly through DOM behavior (this repo's existing tests are all
 *        DOM/behavior-driven — see tests/README.md — nothing here exposes
 *        album-promo.js's internals on window).
 *
 * These fail today (RED): album-promo.js has no metadata fetch at all yet —
 * #track-title/#track-artist only ever show the static "Loading…" i18n
 * placeholder (renderMeta(), album-promo.js:479-492), and #album-cover's src
 * is a hardcoded string (album-promo.js:338) with no fetch, no error
 * handling, no fallback.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadAlbumPromo, unloadAlbumPromo } = window.AlbumPromoTestHelpers;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
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

  const SAMPLE_METADATA = {
    artist: "Chloe x Halle",
    title: "Ungodly Hour",
    year: "2020",
    album: "Ungodly Hour",
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

  describe("Now Playing metadata fetch + bind (issue #158, Ticket D)", () => {
    it("binds fetched artist/title into #track-artist/#track-title (AC1)", async () => {
      const mock = window.installMockMetadataFetch({ metadataResponse: SAMPLE_METADATA });
      const root = await loadAlbumPromo();
      try {
        await waitFor(() => root.querySelector("#track-title").textContent === SAMPLE_METADATA.title);

        expect(root.querySelector("#track-artist").textContent).toBe(SAMPLE_METADATA.artist);
        expect(root.querySelector("#track-title").textContent).toBe(SAMPLE_METADATA.title);
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });

    it("fetches cover.jpg and sets it as #album-cover's src (AC2)", async () => {
      const mock = window.installMockMetadataFetch({ metadataResponse: SAMPLE_METADATA });
      const root = await loadAlbumPromo();
      try {
        await waitFor(() => mock.coverCalls > 0);

        expect(root.querySelector("#album-cover").src).toContain("cover.jpg");
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });

    it("falls back to the placeholder cover on a cover-art fetch failure, without breaking the layout (AC4)", async () => {
      const mock = window.installMockMetadataFetch({
        metadataResponse: SAMPLE_METADATA,
        coverShouldFail: true,
      });
      const root = await loadAlbumPromo();
      try {
        await waitFor(() => mock.coverCalls > 0);
        await nextTick();

        const cover = root.querySelector("#album-cover");
        expect(cover.src).toContain("RadioCalicoLogoTM.png");
        expect(root.querySelector('[data-testid="now-playing-panel"]')).toBeTruthy();
        expect(root.querySelector('[data-testid="hero-player-slot"]')).toBeTruthy();
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });

    it("shows a status message and keeps the panel rendered on a metadata fetch failure (AC4)", async () => {
      const mock = window.installMockMetadataFetch({ metadataShouldFail: true });
      const root = await loadAlbumPromo();
      try {
        await waitFor(() => root.querySelector('[data-testid="now-playing-status"]'));
        await nextTick();

        const status = root.querySelector('[data-testid="now-playing-status"]');
        expect(status).toBeTruthy();
        expect((status.textContent || "").length).toBeGreaterThan(0);
        expect(root.querySelector('[data-testid="now-playing-panel"]')).toBeTruthy();
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });
  });
})();
