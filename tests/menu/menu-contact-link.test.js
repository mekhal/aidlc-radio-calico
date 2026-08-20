/**
 * Issue #418 (Ticket 1 of the "Contact" page story, part of #153): Contact
 * moves off index.html onto its own standalone page, pages/contact.html,
 * instead of an in-page "#contact" section — the same rework About/What's
 * this/Case Study went through under issues #151/#402/#323.
 * menu/menu.js's `contact` nav item switches from a same-page hash anchor to
 * a real page href, so:
 *
 * - NAV_HREFS.contact becomes "pages/contact.html" (was "#contact") — see
 *   tests/menu/menu-active-state.test.js, whose local NAV_HREFS constant is
 *   updated in this same Test PR to match. Contact was the last nav item
 *   still hash-based (besides home); the generic hash-driven cases there now
 *   drive off "home" (the only nav item left that's hash-based).
 * - getActiveNavKeys() can no longer detect the contact item via
 *   window.location.hash (a real page has no hash to compare). Every other
 *   item keeps its existing check unchanged — this file covers only the
 *   contact item's own detection, mirroring
 *   tests/menu/menu-whats-this-link.test.js's structure and its
 *   empty-hash-means-home fallback fix (applied here pre-emptively rather
 *   than as a follow-up bug, since the failure mode is identical for any
 *   standalone page reached with an empty hash).
 *
 * Per docs/knowledge-asset/published/test-pr-native-api-and-self-ref-checklist.md:
 * a test must not stub/override real navigation or window.location.pathname
 * directly. Instead this is the implementation contract for the Code PR:
 * menu.js reads the same application-level seam already used for
 * about/whatsThis/caseStudy, `window.__MENU_CURRENT_PATH__ || window.location.pathname`,
 * when deciding whether the contact item is active.
 *
 * Written before menu/menu.js implements this, per TDD — fails until this
 * issue's Code PR (step 6) adds the path-based check for contact.
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

  function contactLink(nav) {
    return nav.querySelector('a[href="pages/contact.html"]');
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

  describe("menu/menu.js Contact nav item points to its own page, not a hash anchor (issue #418, Ticket 1)", () => {
    it('renders the contact nav item\'s href as the real page "pages/contact.html", not "#contact"', async () => {
      await loadMenuModule();
      await withCurrentPath("/index.html", async () => {
        const nav = buildNav();
        expect(contactLink(nav)).toBeTruthy();
        expect(nav.querySelector('a[href="#contact"]')).toBeFalsy();
      });
    });

    it("marks contact active (aria-current=page) when the current page path ends with contact.html", async () => {
      await loadMenuModule();
      await withCurrentPath("/pages/contact.html", async () => {
        const nav = buildNav();
        expect(contactLink(nav).getAttribute("aria-current")).toBe("page");
      });
    });

    it("does not navigate when the active contact link is clicked", async () => {
      await loadMenuModule();
      await withCurrentPath("/pages/contact.html", async () => {
        const nav = buildNav();
        expect(clickAndCheckPrevented(contactLink(nav))).toBe(true);
      });
    });

    it("leaves contact inactive (clickable, no aria-current) when the current page is not contact.html", async () => {
      await loadMenuModule();
      await withCurrentPath("/index.html", async () => {
        const nav = buildNav();
        const link = contactLink(nav);
        expect(link.getAttribute("aria-current")).toBe(null);
        expect(clickAndCheckPrevented(link)).toBe(false);
      });
    });

    it("contact's page-path check is independent of the other items' existing hash-based active state", async () => {
      await loadMenuModule();
      const originalHash = window.location.hash;
      try {
        window.location.hash = "#home";
        await withCurrentPath("/pages/contact.html", async () => {
          const nav = buildNav();
          const home = nav.querySelector('a[href="#home"]');
          expect(home.getAttribute("aria-current")).toBe("page");
          expect(contactLink(nav).getAttribute("aria-current")).toBe("page");
        });
      } finally {
        window.location.hash = originalHash;
      }
    });

    it("leaves Home inactive when the hash is empty on contact.html, so only Contact is active (mirrors issue #375's case-study fix)", async () => {
      await loadMenuModule();
      const originalHash = window.location.hash;
      try {
        window.location.hash = "";
        await withCurrentPath("/pages/contact.html", async () => {
          const nav = buildNav();
          const home = nav.querySelector('a[href="#home"]');
          expect(home.getAttribute("aria-current")).toBe(null);
          expect(contactLink(nav).getAttribute("aria-current")).toBe("page");
        });
      } finally {
        window.location.hash = originalHash;
      }
    });

    it("contact and about/whatsThis/caseStudy can each be active independently on their own pages (no cross-contamination)", async () => {
      await loadMenuModule();
      await withCurrentPath("/pages/about.html", async () => {
        const nav = buildNav();
        expect(contactLink(nav).getAttribute("aria-current")).toBe(null);
      });
      await withCurrentPath("/pages/whats-this.html", async () => {
        const nav = buildNav();
        expect(contactLink(nav).getAttribute("aria-current")).toBe(null);
      });
      await withCurrentPath("/case-study.html", async () => {
        const nav = buildNav();
        expect(contactLink(nav).getAttribute("aria-current")).toBe(null);
      });
    });
  });
})();
