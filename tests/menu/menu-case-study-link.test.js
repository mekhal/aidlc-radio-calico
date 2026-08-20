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
 *
 * Issue #354 (root cause #1): clickAndCheckPrevented() moved to the shared
 * tests/menu/click-and-check-prevented.js (reuse-first, was duplicated
 * verbatim in this file and menu-active-state.test.js) — see that file for
 * why a plain "did menu.js call preventDefault()" check was unsafe on its
 * own.
 *
 * Issue #375 (bug): opening case-study.html directly leaves
 * window.location.hash empty (no in-page anchor is ever set on that page),
 * and getActiveNavKeys() in menu.js still defaults an empty hash to "#home"
 * unconditionally — a holdover from before issue #323 moved Case Study onto
 * its own real page. That default was only ever correct for index.html, so
 * on case-study.html it makes Home active at the same time as Case Study
 * (two boxed nav items — see the issue's screenshot). The case below covers
 * the real trigger: hash simply empty on case-study.html, not an explicit
 * non-home hash (menu-case-study-link's existing "independent of the other
 * items' existing hash-based active state" case above already covers an
 * explicit hash). Written before menu/menu.js implements the fix, per TDD —
 * fails until this issue's Code PR (step 6) gates the "#home" fallback on
 * actually being on index.html.
 *
 * Issue #151 (Ticket 1 of the About page story): the "independent of the
 * other items' existing hash-based active state" case below used "about" as
 * its example of an unrelated hash-based nav item. About moves to its own
 * standalone page (pages/about.html) under this issue, so it's no longer
 * hash-based — swapped to "whatsThis" (#whats-this), which stays a hash
 * placeholder, mirroring the same swap menu-active-state.test.js's generic
 * cases made.
 *
 * Issue #402 (Ticket 1 of the "What's this" page story): whatsThis goes
 * through the same move to its own standalone page (pages/whats-this.html),
 * so it's no longer hash-based either — the case below swaps again, to
 * "contact" (#contact), the only nav item still hash-based once Home/About/
 * What's this/Case Study are all covered by either the empty-hash-defaults-
 * to-home fallback or a real page.
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

  function caseStudyLink(nav) {
    return nav.querySelector('a[href="case-study.html"]');
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
        window.location.hash = "#contact";
        await withCurrentPath("/case-study.html", async () => {
          const nav = buildNav();
          const contact = nav.querySelector('a[href="#contact"]');
          expect(contact.getAttribute("aria-current")).toBe("page");
          expect(caseStudyLink(nav).getAttribute("aria-current")).toBe("page");
        });
      } finally {
        window.location.hash = originalHash;
      }
    });

    it("leaves Home inactive when the hash is empty on case-study.html, so only Case Study is active (issue #375)", async () => {
      await loadMenuModule();
      const originalHash = window.location.hash;
      try {
        window.location.hash = "";
        await withCurrentPath("/case-study.html", async () => {
          const nav = buildNav();
          const home = nav.querySelector('a[href="#home"]');
          expect(home.getAttribute("aria-current")).toBe(null);
          expect(caseStudyLink(nav).getAttribute("aria-current")).toBe("page");
        });
      } finally {
        window.location.hash = originalHash;
      }
    });

    it("leaves Home inactive when the hash is empty on case-study.html, so only Case Study is active (issue #375)", async () => {
      await loadMenuModule();
      const originalHash = window.location.hash;
      try {
        window.location.hash = "";
        await withCurrentPath("/case-study.html", async () => {
          const nav = buildNav();
          const home = nav.querySelector('a[href="#home"]');
          expect(home.getAttribute("aria-current")).toBe(null);
          expect(caseStudyLink(nav).getAttribute("aria-current")).toBe("page");
        });
      } finally {
        window.location.hash = originalHash;
      }
    });
  });
})();
