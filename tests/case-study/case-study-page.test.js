/**
 * Issue #323 (rework, confirmed on the issue thread 2026-08-13 06:42):
 * Case Study becomes its own standalone page, case-study.html, instead of
 * an in-page section on index.html. case-study/case-study-page.js is the
 * new thin page-init script for it — mirrors tests/test-report-dashboard.js's
 * already-shipped pattern for a second page that reuses the same shared
 * chrome (createState() + buildLogo/buildMenu + buildSidebar(state) +
 * buildFooter(state)) rather than duplicating header/sidebar/footer markup
 * (reuse-first).
 *
 * Two differences from the Test Report Dashboard precedent
 * (tests/test-report-dashboard.js, tests/test-report-dashboard-shared-chrome.test.js),
 * both because case-study.html lives at the repo root next to index.html
 * (not one directory down under tests/):
 * - The logo's image path needs no "../" rewrite.
 * - The shared menu's hash-anchor items (#home/#about/#whats-this/#contact)
 *   are rewritten to "index.html#..." (no "../" prefix); the caseStudy
 *   item's own href ("case-study.html", set by menu/menu.js itself per
 *   tests/menu/menu-case-study-link.test.js) is left untouched since it
 *   already points at this same page.
 *
 * No hero/player/Recently Played/React/hls.js on this page — those are
 * Now Playing-specific (album-promo.js), and this page never mounts
 * album-promo.js at all.
 *
 * Written before case-study/case-study-page.js exists, per TDD — fails
 * until this issue's Code PR (step 6) creates it.
 *
 * Issue #151 (Ticket 1 of the About page story): About's href changes from
 * the hash anchor "#about" to the real page "pages/about.html" (About moves
 * to its own standalone page, one directory down under pages/ — see
 * tests/about/about-page.test.js). Since case-study.html sits at the repo
 * root, this non-hash href needs no further rewrite here — the buildHeader()
 * rule below only rewrites "#"-prefixed hrefs, so "pages/about.html" already
 * resolves correctly as-is from the repo root.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const SAMPLE_TRANSLATIONS = {
    en: {
      nav: { home: "Home", about: "About", whatsThis: "What's this", caseStudy: "Case Study", contact: "Contact" },
    },
  };

  async function loadCaseStudyPageModule() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_TRANSLATIONS_JS_PATH__ || "../shared/translations.js");
    await loadSharedModule(window.__ALBUM_PROMO_LOGO_JS_PATH__ || "../logo/logo.js");
    await loadSharedModule(window.__ALBUM_PROMO_MENU_JS_PATH__ || "../menu/menu.js");
    await loadSharedModule(window.__CASE_STUDY_JS_PATH__ || "../case-study/case-study.js");
    await loadSharedModule(window.__CASE_STUDY_PAGE_JS_PATH__ || "../case-study/case-study-page.js");
  }

  function sampleState() {
    window.ALBUM_PROMO_TRANSLATIONS = SAMPLE_TRANSLATIONS;
    const state = window.createState();
    state.lang = "en";
    return state;
  }

  describe("case-study/case-study-page.js (issue #323 rework — standalone case-study.html page)", () => {
    it("buildCaseStudyMain() returns a <main> containing only the Case Study section (no hero, no player)", async () => {
      await loadCaseStudyPageModule();

      const main = window.buildCaseStudyMain();

      expect(main.tagName).toBe("MAIN");
      expect(main.className).toContain("chloe-main");
      expect(main.querySelector("#case-study")).toBeTruthy();
      expect(main.querySelector(".chloe-hero")).toBeFalsy();
      expect(main.querySelector('[data-testid="recently-played-list"]')).toBeFalsy();
    });

    it("buildHeader(state) rewrites the shared menu's hash-anchor items to index.html#..., leaving caseStudy's own href untouched", async () => {
      await loadCaseStudyPageModule();
      const state = sampleState();

      const header = window.buildHeader(state);
      const hrefs = Array.from(header.querySelectorAll(".chloe-nav a")).map((a) => a.getAttribute("href"));

      expect(hrefs).toEqual(["index.html#home", "pages/about.html", "index.html#whats-this", "case-study.html", "index.html#contact"]);
    });

    it("buildHeader(state) does not rewrite the logo's image path (case-study.html sits at the repo root, same as index.html)", async () => {
      await loadCaseStudyPageModule();
      const state = sampleState();

      const header = window.buildHeader(state);
      const logoImg = header.querySelector(".chloe-wordmark__logo");

      expect(logoImg.getAttribute("src")).toBe("RadioCalicoStyle/RadioCalicoLogoTM.png");
    });
  });
})();
