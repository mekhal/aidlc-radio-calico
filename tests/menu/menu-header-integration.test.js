/**
 * Issue #255 (Ticket 3 of #245): buildHeader() (album-promo.js:222-254)
 * delegates its nav to the global buildMenu(state) instead of constructing
 * it inline, and the rendered `<header>` stays DOM-identical to before the
 * extraction. AC5, AC6. Wordmark/logo construction (buildLogo(), issue
 * #254) is untouched — out of scope here.
 *
 * Mounts the real page via AlbumPromoTestHelpers (tests/load-album-promo.js,
 * updated by this ticket to fetch+inject menu/menu.js ahead of
 * album-promo.js, same convention issue #254 used for logo/logo.js), then
 * checks the mounted nav structurally matches a fresh buildMenu(state) call
 * once translations are ready — same pattern as
 * tests/logo/logo-header-integration.test.js.
 *
 * Written before menu/menu.js exists, per TDD — fails until this ticket's
 * Code PR (step 6) creates it and wires buildHeader() to call it.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadAlbumPromo, unloadAlbumPromo } = window.AlbumPromoTestHelpers;

  function navShape(node) {
    return {
      tagName: node.tagName,
      className: node.className,
      ariaLabel: node.getAttribute("aria-label"),
      links: Array.from(node.querySelectorAll("a")).map((a) => ({
        href: a.getAttribute("href"),
        text: a.textContent,
      })),
    };
  }

  describe("album-promo.js buildHeader() + menu/menu.js integration (issue #255, Ticket 3)", () => {
    it("the mounted header's nav matches a fresh buildMenu(state) call once translations are ready", async () => {
      const root = await loadAlbumPromo();
      try {
        const mountedNav = root.querySelector(".chloe-nav");
        expect(mountedNav).toBeTruthy();

        const freshNav = window.buildMenu(window.createState());

        expect(navShape(mountedNav)).toEqual(navShape(freshNav));
      } finally {
        unloadAlbumPromo(root);
      }
    });

    it("the header still renders the wordmark alongside the nav, untouched by this extraction", async () => {
      const root = await loadAlbumPromo();
      try {
        const header = root.querySelector(".chloe-header");
        expect(header).toBeTruthy();
        expect(header.querySelector(".chloe-nav")).toBeTruthy();
        expect(header.querySelector(".chloe-wordmark")).toBeTruthy();
      } finally {
        unloadAlbumPromo(root);
      }
    });
  });
})();
