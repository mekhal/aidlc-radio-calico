/**
 * Issue #323 (rework, confirmed on the issue thread 2026-08-13 06:42): Case
 * Study moves off index.html onto its own page (case-study.html), reversing
 * the original Ticket 2 scope (issue #323's first Code PR, #342, had
 * appended an in-page "#case-study" section to album-promo.js's buildMain()
 * — see tests/case-study/case-study.test.js's now-moved
 * buildCaseStudySection() coverage). index.html/album-promo.js must stop
 * rendering that section inline.
 *
 * Mounts the real page via AlbumPromoTestHelpers (tests/load-album-promo.js),
 * same pattern as tests/menu/menu-header-integration.test.js.
 *
 * Written before album-promo.js is updated, per TDD — fails until this
 * issue's Code PR (step 6) removes buildCaseStudySection()'s call from
 * buildMain().
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadAlbumPromo, unloadAlbumPromo } = window.AlbumPromoTestHelpers;

  describe("album-promo.js no longer renders an inline Case Study section (issue #323 rework)", () => {
    it("does not render a #case-study section inside the mounted page", async () => {
      const root = await loadAlbumPromo();
      try {
        expect(root.querySelector("#case-study")).toBeFalsy();
        expect(root.querySelector(".case-study-grid")).toBeFalsy();
      } finally {
        unloadAlbumPromo(root);
      }
    });
  });
})();
