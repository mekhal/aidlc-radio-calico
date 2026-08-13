/**
 * Issue #354 (root cause #2): tests/load-album-promo.js's loadAlbumPromo()
 * must inject footer/footer.js ahead of album-promo.js (same pattern as
 * shared/, logo/, menu/, sidebar/) — album-promo.js's initAlbumPromo() calls
 * buildFooter() as a global, so without it every suite mounted via
 * AlbumPromoTestHelpers threw "ReferenceError: buildFooter is not defined".
 *
 * RED until this Test PR's tests/load-album-promo.js fix lands.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadAlbumPromo, unloadAlbumPromo } = window.AlbumPromoTestHelpers;

  describe("AlbumPromoTestHelpers loads footer/footer.js (issue #354)", () => {
    it("mounts a .chloe-footer without throwing ReferenceError: buildFooter is not defined", async () => {
      const root = await loadAlbumPromo();
      try {
        expect(typeof window.buildFooter).toBe("function");
        expect(root.querySelector(".chloe-footer")).toBeTruthy();
      } finally {
        unloadAlbumPromo(root);
      }
    });
  });
})();
