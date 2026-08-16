/**
 * Issue #151 (Ticket 1 of the About page story), plan confirmed at step 3
 * approval (2026-08-15, answers to the 5 questions): About becomes its own
 * standalone page, pages/about.html — reusing shared chrome (createState() +
 * buildLogo()/buildMenu() + buildFooter(state)) rather than duplicating
 * header/footer markup (reuse-first), same pattern as case-study.html
 * (case-study/case-study-page.js) and tests/test-report-dashboard.html
 * (tests/test-report-dashboard.js). about/about-page.js is the thin
 * page-init script for it.
 *
 * Per the human's answer to question 2.2, pages/about.html lives one
 * directory below the repo root (a new "pages/" folder — case-study.html
 * sits at the root itself). This makes the closest existing precedent
 * tests/test-report-dashboard.js's buildHeader() (also one directory down,
 * under tests/), NOT case-study-page.js's (no rewrite needed, since
 * case-study.html is at the root). Differences from that precedent:
 * - The logo's image path gets the same "../" rewrite.
 * - The shared menu's hash-anchor items (#home/#whats-this/#contact) are
 *   rewritten to "../index.html#..." (one "../", not two — pages/ sits at
 *   the same depth as tests/).
 * - The caseStudy item's href ("case-study.html", set by menu/menu.js
 *   itself) is rewritten to "../case-study.html", same generic non-hash rule
 *   test-report-dashboard.js already applies.
 * - The about item's own href ("pages/about.html", set by menu/menu.js
 *   itself per tests/menu/menu-about-link.test.js) is a special case none of
 *   the existing precedents have: it is THIS page's own self-referencing
 *   link. Applying the generic "../${href}" rule would produce
 *   "../pages/about.html", which 404s from inside pages/ itself (it would
 *   resolve to pages/pages/about.html). It must instead resolve to
 *   "about.html" (same directory, no prefix) — mirrors how
 *   case-study-page.js leaves caseStudy's own href untouched for the same
 *   self-reference reason (see tests/case-study/case-study-page.test.js).
 *
 * No hero/player/Recently Played/React/hls.js on this page — those are
 * Now Playing-specific (album-promo.js), and this page never mounts
 * album-promo.js at all.
 *
 * Whether to also mount buildSidebar(state) (case-study.html/
 * test-report-dashboard.html both do, and it's the only existing component
 * that carries the theme/language toggle switches) is an open question this
 * Test PR does NOT decide — the issue's own mockup shows only a header/
 * content/footer layout with no side rail, but 2.5's "reuse theme" answer
 * needs a toggle to live somewhere. Deliberately left untested here; see
 * this Test PR's summary for the question posed to the human.
 *
 * Written before about/about-page.js exists, per TDD — fails until this
 * issue's Code PR (step 6) creates it.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const SAMPLE_TRANSLATIONS = {
    en: {
      nav: { home: "Home", about: "About", whatsThis: "What's this", caseStudy: "Case Study", contact: "Contact" },
    },
  };

  async function loadAboutPageModule() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_TRANSLATIONS_JS_PATH__ || "../shared/translations.js");
    await loadSharedModule(window.__ALBUM_PROMO_LOGO_JS_PATH__ || "../logo/logo.js");
    await loadSharedModule(window.__ALBUM_PROMO_MENU_JS_PATH__ || "../menu/menu.js");
    await loadSharedModule(window.__ABOUT_PAGE_JS_PATH__ || "../about/about-page.js");
  }

  function sampleState() {
    window.ALBUM_PROMO_TRANSLATIONS = SAMPLE_TRANSLATIONS;
    const state = window.createState();
    state.lang = "en";
    return state;
  }

  describe("about/about-page.js (issue #151, Ticket 1 — standalone pages/about.html page)", () => {
    it("buildHeader(state) rewrites the shared menu's hash-anchor items to ../index.html#...", async () => {
      await loadAboutPageModule();
      const state = sampleState();

      const header = window.buildHeader(state);
      const hrefs = Array.from(header.querySelectorAll(".chloe-nav a")).map((a) => a.getAttribute("href"));

      expect(hrefs).toEqual(["../index.html#home", "about.html", "../index.html#whats-this", "../case-study.html", "../index.html#contact"]);
    });

    it("buildHeader(state) resolves the about item's own href to the self-referencing about.html, not ../pages/about.html", async () => {
      await loadAboutPageModule();
      const state = sampleState();

      const header = window.buildHeader(state);
      const aboutLink = header.querySelector('.chloe-nav a[href="about.html"]');

      expect(aboutLink).toBeTruthy();
      expect(header.querySelector('.chloe-nav a[href="../pages/about.html"]')).toBeFalsy();
    });

    it("buildHeader(state) rewrites the logo's image path with a ../ prefix (pages/about.html sits one directory below the repo root)", async () => {
      await loadAboutPageModule();
      const state = sampleState();

      const header = window.buildHeader(state);
      const logoImg = header.querySelector(".chloe-wordmark__logo");

      expect(logoImg.getAttribute("src")).toBe("../RadioCalicoStyle/RadioCalicoLogoTM.png");
    });
  });
})();
