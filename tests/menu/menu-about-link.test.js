/**
 * Issue #151 (Ticket 1 of the About page story, plan confirmed 2026-08-15):
 * About moves off index.html onto its own standalone page, pages/about.html,
 * instead of an in-page "#about" section — the same rework caseStudy went
 * through under issue #323. menu/menu.js's `about` nav item switches from a
 * same-page hash anchor to a real page href, so:
 *
 * - NAV_HREFS.about becomes "pages/about.html" (was "#about") — see
 *   tests/menu/menu-active-state.test.js, whose local NAV_HREFS constant is
 *   updated in this same Test PR to match, and whose generic hash-driven
 *   cases now drive off "whatsThis" instead of "about".
 * - getActiveNavKeys() can no longer detect the about item via
 *   window.location.hash (a real page has no hash to compare). Every other
 *   item keeps the existing hash-based check unchanged — this file covers
 *   only the about item's own detection, mirroring
 *   tests/menu/menu-case-study-link.test.js's structure and its issue #375
 *   double-active fix (applied here pre-emptively rather than as a
 *   follow-up bug, since the failure mode is identical for any standalone
 *   page reached with an empty hash).
 *
 * Per docs/knowledge-asset/published/test-pr-native-api-and-self-ref-checklist.md:
 * a test must not stub/override real navigation or window.location.pathname
 * directly. Instead this is the implementation contract for the Code PR:
 * menu.js reads the same application-level seam already used for caseStudy,
 * `window.__MENU_CURRENT_PATH__ || window.location.pathname`, when deciding
 * whether the about item is active.
 *
 * Written before menu/menu.js implements this, per TDD — fails until this
 * issue's Code PR (step 6) adds the path-based check for about.
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

  function aboutLink(nav) {
    return nav.querySelector('a[href="pages/about.html"]');
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

  describe("menu/menu.js About nav item points to its own page, not a hash anchor (issue #151, Ticket 1)", () => {
    it('renders the about nav item\'s href as the real page "pages/about.html", not "#about"', async () => {
      await loadMenuModule();
      await withCurrentPath("/index.html", async () => {
        const nav = buildNav();
        expect(aboutLink(nav)).toBeTruthy();
        expect(nav.querySelector('a[href="#about"]')).toBeFalsy();
      });
    });

    it("marks about active (aria-current=page) when the current page path ends with about.html", async () => {
      await loadMenuModule();
      await withCurrentPath("/pages/about.html", async () => {
        const nav = buildNav();
        expect(aboutLink(nav).getAttribute("aria-current")).toBe("page");
      });
    });

    it("does not navigate when the active about link is clicked", async () => {
      await loadMenuModule();
      await withCurrentPath("/pages/about.html", async () => {
        const nav = buildNav();
        expect(clickAndCheckPrevented(aboutLink(nav))).toBe(true);
      });
    });

    it("leaves about inactive (clickable, no aria-current) when the current page is not about.html", async () => {
      await loadMenuModule();
      await withCurrentPath("/index.html", async () => {
        const nav = buildNav();
        const link = aboutLink(nav);
        expect(link.getAttribute("aria-current")).toBe(null);
        expect(clickAndCheckPrevented(link)).toBe(false);
      });
    });

    it("about's page-path check is independent of the other items' existing hash-based active state", async () => {
      await loadMenuModule();
      const originalHash = window.location.hash;
      try {
        window.location.hash = "#home";
        await withCurrentPath("/pages/about.html", async () => {
          const nav = buildNav();
          const home = nav.querySelector('a[href="#home"]');
          expect(home.getAttribute("aria-current")).toBe("page");
          expect(aboutLink(nav).getAttribute("aria-current")).toBe("page");
        });
      } finally {
        window.location.hash = originalHash;
      }
    });

    it("leaves Home inactive when the hash is empty on about.html, so only About is active (mirrors issue #375's case-study fix)", async () => {
      await loadMenuModule();
      const originalHash = window.location.hash;
      try {
        window.location.hash = "";
        await withCurrentPath("/pages/about.html", async () => {
          const nav = buildNav();
          const home = nav.querySelector('a[href="#home"]');
          expect(home.getAttribute("aria-current")).toBe(null);
          expect(aboutLink(nav).getAttribute("aria-current")).toBe("page");
        });
      } finally {
        window.location.hash = originalHash;
      }
    });

    it("about and caseStudy can each be active independently on their own pages (no cross-contamination)", async () => {
      await loadMenuModule();
      await withCurrentPath("/case-study.html", async () => {
        const nav = buildNav();
        expect(aboutLink(nav).getAttribute("aria-current")).toBe(null);
      });
    });
  });
})();
