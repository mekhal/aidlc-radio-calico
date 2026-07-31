/**
 * Issue #221 (Ticket D follow-up): wire up year/album/quality metadata
 * fields on the album-promo Now Playing panel, using metadatav2.json field
 * names confirmed via a live sample pasted on the issue (2026-07-31):
 * `date` (not `year`), `album`, and a single `bit_depth`/`sample_rate` pair
 * (no separate stream-quality field).
 *
 *   AC1: on a successful fetch, #track-year shows the `date` field's value,
 *        replacing the static "(—)" placeholder.
 *   AC2: on a successful fetch, #track-album shows the `album` field's
 *        value, replacing "Loading…"; a language toggle re-render does not
 *        revert a live value back to "Loading…".
 *   AC3: on a successful fetch, #track-quality-source shows the
 *        playerQualitySourceLabel i18n label plus a value derived from
 *        bit_depth/sample_rate (e.g. "16-bit / 44.1kHz"), with the same
 *        language-toggle protection as AC2.
 *   AC5: on fetch failure, or when date/album/bit_depth/sample_rate is
 *        missing/empty on an otherwise-successful response, the
 *        corresponding field falls back to "" (matching the existing
 *        artist/title pattern) — no new error UI.
 *
 * AC4 (static #track-quality-stream string) was dropped from scope during
 * PR review (issue #225): deriving real per-stream quality would need extra
 * requests beyond this ticket, and a hardcoded placeholder value wasn't
 * wanted either, so #track-quality-stream is no longer rendered at all.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadAlbumPromo, unloadAlbumPromo } = window.AlbumPromoTestHelpers;

  // album-promo.js's own language preference key (see LANG_STORAGE_KEY in
  // album-promo.js) — reset around the language-toggle test below so it
  // doesn't leak a "th" preference into later tests/suites sharing this page.
  const ALBUM_PROMO_LANG_STORAGE_KEY = "chloeAlbumPromoLanguage";

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

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  const SAMPLE_METADATA = {
    artist: "Bryan Adams",
    title: "Heat Of The Night",
    album: "Into The Fire",
    date: "1987",
    bit_depth: 16,
    sample_rate: 44100,
    prev_artist_1: "Dr. Dre",
    prev_title_1: "Nuthin' But A G Thang",
  };

  describe("Now Playing year/album/quality metadata (issue #221)", () => {
    it("binds fetched date/album/quality into #track-year/#track-album/#track-quality-source (AC1, AC3)", async () => {
      const mock = window.installMockMetadataFetch({ metadataResponse: SAMPLE_METADATA });
      const root = await loadAlbumPromo();
      try {
        await waitFor(() => root.querySelector("#track-album").textContent === SAMPLE_METADATA.album);

        expect(root.querySelector("#track-year").textContent).toBe(SAMPLE_METADATA.date);
        expect(root.querySelector("#track-album").textContent).toBe(SAMPLE_METADATA.album);
        expect(root.querySelector("#track-quality-source").textContent).toBe(
          "Source quality: 16-bit / 44.1kHz"
        );
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });

    it("does not render a #track-quality-stream element (AC4 dropped, issue #225)", async () => {
      const mock = window.installMockMetadataFetch({ metadataResponse: SAMPLE_METADATA });
      const root = await loadAlbumPromo();
      try {
        await waitFor(() => root.querySelector("#track-album").textContent === SAMPLE_METADATA.album);

        expect(root.querySelector("#track-quality-stream")).toBe(null);
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });

    it("does not revert live year/album/quality-source values back to placeholders on a language toggle (AC2, AC3)", async () => {
      window.localStorage.removeItem(ALBUM_PROMO_LANG_STORAGE_KEY);
      const mock = window.installMockMetadataFetch({ metadataResponse: SAMPLE_METADATA });
      const root = await loadAlbumPromo();
      try {
        await waitFor(() => root.querySelector("#track-album").textContent === SAMPLE_METADATA.album);

        root.querySelector('[data-testid="sidebar-language-toggle"]').click();
        await nextTick();

        expect(root.querySelector("#track-year").textContent).toBe(SAMPLE_METADATA.date);
        expect(root.querySelector("#track-album").textContent).toBe(SAMPLE_METADATA.album);
        expect(root.querySelector("#track-quality-source").textContent).toBe(
          "คุณภาพต้นฉบับ: 16-bit / 44.1kHz"
        );
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
        window.localStorage.removeItem(ALBUM_PROMO_LANG_STORAGE_KEY);
      }
    });

    it("falls back to an empty value when date/album/bit_depth/sample_rate are missing on an otherwise-successful fetch (AC5)", async () => {
      const mock = window.installMockMetadataFetch({
        metadataResponse: { artist: "Solange", title: "Cranes in the Sky" },
      });
      const root = await loadAlbumPromo();
      try {
        await waitFor(() => root.querySelector("#track-title").textContent === "Cranes in the Sky");

        expect(root.querySelector("#track-year").textContent).toBe("");
        expect(root.querySelector("#track-album").textContent).toBe("");
        expect(root.querySelector("#track-quality-source").textContent).toBe("Source quality: ");
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });

    it("leaves year/album/quality-source on their loading placeholders on a metadata fetch failure (AC5)", async () => {
      const mock = window.installMockMetadataFetch({ metadataShouldFail: true });
      const root = await loadAlbumPromo();
      try {
        await waitFor(() => root.querySelector('[data-testid="now-playing-status"]').hidden === false);

        expect(root.querySelector("#track-year").textContent).toBe("(—)");
        expect(root.querySelector("#track-album").textContent).toBe("Loading…");
        expect(root.querySelector("#track-quality-source").textContent).toBe("Source quality: Loading…");
      } finally {
        mock.restore();
        unloadAlbumPromo(root);
      }
    });
  });
})();
