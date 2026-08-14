/**
 * Issue #254 (Ticket 2 of #245): buildHeader() (album-promo.js:222-264)
 * delegates its wordmark to the global buildLogo() instead of constructing
 * it inline, and the rendered `<header>` stays DOM-identical to before the
 * extraction. AC3, AC6. Nav construction (NAV_KEYS/NAV_HREFS/render()) is
 * untouched — out of scope here, belongs to #255.
 *
 * Mounts the real page via AlbumPromoTestHelpers (tests/load-album-promo.js,
 * which this ticket's AC5 update loads logo/logo.js ahead of album-promo.js
 * for), then checks the mounted wordmark structurally matches a fresh
 * buildLogo() call — the observable proxy for "buildHeader delegates to
 * buildLogo" available in this repo's DOM-assertion test harness.
 *
 * Written before logo/logo.js exists, per TDD — fails until this ticket's
 * Code PR (step 6) creates logo/logo.js and wires buildHeader() to call it.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadAlbumPromo, unloadAlbumPromo } = window.AlbumPromoTestHelpers;

  function wordmarkShape(node) {
    return {
      tagName: node.tagName,
      className: node.className,
      text: Array.from(node.childNodes)
        .map((n) => (n.nodeType === Node.TEXT_NODE ? n.textContent : `<${n.tagName} src="${n.getAttribute("src")}" alt="${n.getAttribute("alt")}">`))
        .join("|"),
    };
  }

  describe("album-promo.js buildHeader() + logo/logo.js integration (issue #254, Ticket 2)", () => {
    it("the mounted header's wordmark matches a fresh buildLogo() call", async () => {
      const root = await loadAlbumPromo();
      try {
        const mountedWordmark = root.querySelector(".chloe-wordmark");
        expect(mountedWordmark).toBeTruthy();

        const freshWordmark = window.buildLogo();

        expect(wordmarkShape(mountedWordmark)).toEqual(wordmarkShape(freshWordmark));
      } finally {
        unloadAlbumPromo(root);
      }
    });

    it("the header still renders the nav alongside the wordmark, untouched by this extraction", async () => {
      const root = await loadAlbumPromo();
      try {
        const header = root.querySelector(".chloe-header");
        expect(header).toBeTruthy();
        expect(header.querySelector(".chloe-wordmark")).toBeTruthy();

        const nav = header.querySelector(".chloe-nav");
        expect(nav).toBeTruthy();
        expect(nav.getAttribute("aria-label")).toBe("Primary");
        expect(nav.querySelectorAll("a").length).toBe(5);
      } finally {
        unloadAlbumPromo(root);
      }
    });
  });
})();
