/**
 * Issue #323 (rework, confirmed on the issue thread 2026-08-13 06:31-06:43):
 * Case Study moves off index.html onto its own standalone page
 * (case-study.html) instead of an in-page "#case-study" section, reversing
 * the original Ticket 2 scope. menu/menu.js's `caseStudy` nav item switches
 * from a same-page hash anchor to a real page href, so:
 *
 * - NAV_HREFS.caseStudy becomes "case-study.html" (was "#case-study") — see
 *   tests/menu/menu-active-state.test.js, whose local NAV_HREFS constant is
 *   updated in this same Test PR to match.
 * - getActiveNavKey() can no longer detect the caseStudy item via
 *   window.location.hash (a real page has no hash to compare). Every other
 *   item keeps the existing hash-based check from issue #306 unchanged
 *   (still covered by menu-active-state.test.js) — this file covers only
 *   the caseStudy item's own detection.
 *
 * Per docs/knowledge-asset/published/test-pr-native-api-and-self-ref-checklist.md:
 * a test must not stub/override real navigation or window.location.pathname
 * directly (a real browser may silently ignore the override or actually
 * navigate away from test-runner.html). Instead this is the implementation
 * contract for the Code PR: menu.js reads an application-level seam,
 * `window.__MENU_CURRENT_PATH__ || window.location.pathname`, when deciding
 * whether the caseStudy item is active — same seam-over-native-override
 * pattern as case-study.js's existing `window.__CASE_STUDY_DATA_PATH__`.
 *
 * Written before menu/menu.js implements this, per TDD — fails until this
 * issue's Code PR (step 6) adds the path-based check for caseStudy.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

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

  function caseStudyLink(nav) {
    return nav.querySelector('a[href="case-study.html"]');
  }

  function clickAndCheckPrevented(link) {
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    return event.defaultPrevented;
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

  describe("menu/menu.js Case Study nav item points to its own page, not a hash anchor (issue #323 rework)", () => {
    it('renders the caseStudy nav item\'s href as the real page "case-study.html", not "#case-study"', async () => {
      await loadMenuModule();
      await withCurrentPath("/index.html", async () => {
        const nav = buildNav();
        expect(caseStudyLink(nav)).toBeTruthy();
        expect(nav.querySelector('a[href="#case-study"]')).toBeFalsy();
      });
    });

    it("marks caseStudy active (aria-current=page) when the current page path ends with case-study.html", async () => {
      await loadMenuModule();
      await withCurrentPath("/case-study.html", async () => {
        const nav = buildNav();
        expect(caseStudyLink(nav).getAttribute("aria-current")).toBe("page");
      });
    });

    it("does not navigate when the active caseStudy link is clicked", async () => {
      await loadMenuModule();
      await withCurrentPath("/case-study.html", async () => {
        const nav = buildNav();
        expect(clickAndCheckPrevented(caseStudyLink(nav))).toBe(true);
      });
    });

    it("leaves caseStudy inactive (clickable, no aria-current) when the current page is not case-study.html", async () => {
      await loadMenuModule();
      await withCurrentPath("/index.html", async () => {
        const nav = buildNav();
        const link = caseStudyLink(nav);
        expect(link.getAttribute("aria-current")).toBe(null);
        expect(clickAndCheckPrevented(link)).toBe(false);
      });
    });

    it("caseStudy's page-path check is independent of the other items' existing hash-based active state", async () => {
      await loadMenuModule();
      const originalHash = window.location.hash;
      try {
        window.location.hash = "#about";
        await withCurrentPath("/case-study.html", async () => {
          const nav = buildNav();
          const about = nav.querySelector('a[href="#about"]');
          expect(about.getAttribute("aria-current")).toBe("page");
          expect(caseStudyLink(nav).getAttribute("aria-current")).toBe("page");
        });
      } finally {
        window.location.hash = originalHash;
      }
    });
  });
})();
