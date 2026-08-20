/**
 * Issue #402 (Ticket 1 of the "What's this" page story, part of #152): "What's
 * this" moves off index.html onto its own standalone page,
 * pages/whats-this.html, instead of an in-page "#whats-this" section — the
 * same rework About went through under issue #151. menu/menu.js's `whatsThis`
 * nav item switches from a same-page hash anchor to a real page href, so:
 *
 * - NAV_HREFS.whatsThis becomes "pages/whats-this.html" (was "#whats-this") —
 *   see tests/menu/menu-active-state.test.js, whose local NAV_HREFS constant
 *   is updated in this same Test PR to match, and whose generic hash-driven
 *   cases now drive off "contact" instead of "whatsThis" (the only nav item
 *   still hash-based once About/What's this/Case Study are all real pages).
 * - getActiveNavKeys() can no longer detect the whatsThis item via
 *   window.location.hash (a real page has no hash to compare). Every other
 *   item keeps the existing hash-based check unchanged — this file covers
 *   only the whatsThis item's own detection, mirroring
 *   tests/menu/menu-about-link.test.js's structure and its issue #375
 *   double-active fix (applied here pre-emptively rather than as a
 *   follow-up bug, since the failure mode is identical for any standalone
 *   page reached with an empty hash).
 *
 * Per docs/knowledge-asset/published/test-pr-native-api-and-self-ref-checklist.md:
 * a test must not stub/override real navigation or window.location.pathname
 * directly. Instead this is the implementation contract for the Code PR:
 * menu.js reads the same application-level seam already used for about/
 * caseStudy, `window.__MENU_CURRENT_PATH__ || window.location.pathname`, when
 * deciding whether the whatsThis item is active.
 *
 * Written before menu/menu.js implements this, per TDD — fails until this
 * issue's Code PR (step 6) adds the path-based check for whatsThis.
 *
 * Issue #418 (Ticket 1 of the "Contact" page story): the "independent of the
 * other items' existing hash-based active state" case below used "contact"
 * as its example of an unrelated hash-based nav item. Contact moves to its
 * own standalone page (pages/contact.html) under this issue, so it's no
 * longer hash-based — swapped to "home" (#home), the only nav item left
 * that's hash-based, mirroring the same swap menu-active-state.test.js's
 * generic cases made.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;
  const { clickAndCheckPrevented } = window.MenuTestHelpers;

  const SAMPLE_TRANSLATIONS = {
    en: {
      nav: { home: "Home", about: "About", whatsThis: "What's this", caseStudy: "Case Study", contact: "Contact" },
    },
  };

  async function loadMenuModule() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_TRANSLATIONS_JS_PATH__ || "../shared/translations.js");
    await loadSharedModule(window.__ALBUM_PROMO_MENU_JS_PATH__ || "../menu/menu.js");
  }

  function buildNav() {
    window.ALBUM_PROMO_TRANSLATIONS = SAMPLE_TRANSLATIONS;
    const state = window.createState();
    state.lang = "en";
    return window.buildMenu(state);
  }

  function whatsThisLink(nav) {
    return nav.querySelector('a[href="pages/whats-this.html"]');
  }

  async function withCurrentPath(value, fn) {
    const original = window.__MENU_CURRENT_PATH__;
    try {
      window.__MENU_CURRENT_PATH__ = value;
      await fn();
    } finally {
      window.__MENU_CURRENT_PATH__ = original;
      window.ALBUM_PROMO_TRANSLATIONS = null;
    }
  }

  describe("menu/menu.js What's this nav item points to its own page, not a hash anchor (issue #402, Ticket 1)", () => {
    it('renders the whatsThis nav item\'s href as the real page "pages/whats-this.html", not "#whats-this"', async () => {
      await loadMenuModule();
      await withCurrentPath("/index.html", async () => {
        const nav = buildNav();
        expect(whatsThisLink(nav)).toBeTruthy();
        expect(nav.querySelector('a[href="#whats-this"]')).toBeFalsy();
      });
    });

    it("marks whatsThis active (aria-current=page) when the current page path ends with whats-this.html", async () => {
      await loadMenuModule();
      await withCurrentPath("/pages/whats-this.html", async () => {
        const nav = buildNav();
        expect(whatsThisLink(nav).getAttribute("aria-current")).toBe("page");
      });
    });

    it("does not navigate when the active whatsThis link is clicked", async () => {
      await loadMenuModule();
      await withCurrentPath("/pages/whats-this.html", async () => {
        const nav = buildNav();
        expect(clickAndCheckPrevented(whatsThisLink(nav))).toBe(true);
      });
    });

    it("leaves whatsThis inactive (clickable, no aria-current) when the current page is not whats-this.html", async () => {
      await loadMenuModule();
      await withCurrentPath("/index.html", async () => {
        const nav = buildNav();
        const link = whatsThisLink(nav);
        expect(link.getAttribute("aria-current")).toBe(null);
        expect(clickAndCheckPrevented(link)).toBe(false);
      });
    });

    it("whatsThis's page-path check is independent of the other items' existing hash-based active state", async () => {
      await loadMenuModule();
      const originalHash = window.location.hash;
      try {
        window.location.hash = "#home";
        await withCurrentPath("/pages/whats-this.html", async () => {
          const nav = buildNav();
          const home = nav.querySelector('a[href="#home"]');
          expect(home.getAttribute("aria-current")).toBe("page");
          expect(whatsThisLink(nav).getAttribute("aria-current")).toBe("page");
        });
      } finally {
        window.location.hash = originalHash;
      }
    });

    it("leaves Home inactive when the hash is empty on whats-this.html, so only What's this is active (mirrors issue #375's case-study fix)", async () => {
      await loadMenuModule();
      const originalHash = window.location.hash;
      try {
        window.location.hash = "";
        await withCurrentPath("/pages/whats-this.html", async () => {
          const nav = buildNav();
          const home = nav.querySelector('a[href="#home"]');
          expect(home.getAttribute("aria-current")).toBe(null);
          expect(whatsThisLink(nav).getAttribute("aria-current")).toBe("page");
        });
      } finally {
        window.location.hash = originalHash;
      }
    });

    it("whatsThis and about/caseStudy can each be active independently on their own pages (no cross-contamination)", async () => {
      await loadMenuModule();
      await withCurrentPath("/pages/about.html", async () => {
        const nav = buildNav();
        expect(whatsThisLink(nav).getAttribute("aria-current")).toBe(null);
      });
      await withCurrentPath("/case-study.html", async () => {
        const nav = buildNav();
        expect(whatsThisLink(nav).getAttribute("aria-current")).toBe(null);
      });
    });
  });
})();
