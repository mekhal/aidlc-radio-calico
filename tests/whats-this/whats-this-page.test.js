/**
 * Issue #402 (Ticket 1 of the "What's this" page story, part of #152): the
 * "What's this" nav item moves off index.html onto its own standalone page,
 * pages/whats-this.html, instead of an in-page "#whats-this" section — the
 * same rework About went through under issue #151. whats-this/whats-this-page.js
 * is the thin page-init script for it — mirrors about/about-page.js's already-
 * shipped pattern for a page that reuses the same shared chrome (createState() +
 * buildLogo()/buildMenu() + buildSidebar(state) + buildFooter(state)) rather
 * than duplicating header/sidebar/footer markup (reuse-first). Sidebar/footer
 * output is already covered by their own dedicated suites (tests/sidebar/
 * sidebar.test.js, tests/footer/footer.test.js), so this file — like
 * tests/about/about-page.test.js and tests/case-study/case-study-page.test.js
 * before it — only covers this page's own header-rewrite logic (AC1's "no
 * duplicated markup/CSS" is proven by calling the same shared builders, not by
 * re-testing their internals).
 *
 * Per the human's approved plan, pages/whats-this.html lives one directory
 * below the repo root (same "pages/" folder as pages/about.html), so this
 * mirrors about/about-page.js's buildHeader() rewrite rules exactly:
 * - The logo's image path gets a "../" rewrite.
 * - The shared menu's hash-anchor items (#home/#contact — the only two still
 *   hash-based once About/What's this/Case Study are all real pages) are
 *   rewritten to "../index.html#...".
 * - The about/caseStudy items' own hrefs ("pages/about.html"/"case-study.html",
 *   set by menu/menu.js) get the generic "../${href}" rewrite.
 * - The whatsThis item's own href ("pages/whats-this.html", set by menu/menu.js
 *   per tests/menu/menu-whats-this-link.test.js) is THIS page's own
 *   self-referencing link — applying the generic "../${href}" rule would
 *   produce "../pages/whats-this.html", which 404s from inside pages/ itself
 *   (resolves to pages/pages/whats-this.html). It must instead resolve to
 *   "whats-this.html" (same directory, no prefix) — same self-reference
 *   exception about-page.js already makes for its own item.
 *
 * AC6: the page has no content sections yet (Sections 1-3 land in Tickets
 * 2-4) — just chrome plus an empty mount root. buildWhatsThisMain() mirrors
 * case-study/case-study-page.js's buildCaseStudyMain() precedent: a bare
 * <main> with a testid and no content children, so Tickets 2-4 can append
 * their sections into it without this ticket asserting on content that
 * doesn't exist yet.
 *
 * Written before whats-this/whats-this-page.js exists, per TDD — fails until
 * this issue's Code PR (step 6) creates it.
 *
 * Issue #418 (Ticket 1 of the "Contact" page story): the contact item's href
 * in the expected hrefs array below changes from the hash anchor
 * "../index.html#contact" to the real page "../pages/contact.html" (Contact
 * moves to its own standalone page, one directory down under pages/, same as
 * About/What's this) — this page's generic non-hash rewrite rule
 * (`../${href}`) applies unchanged; no code change needed in
 * whats-this-page.js itself. #home is now the only hash-anchor item left.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const SAMPLE_TRANSLATIONS = {
    en: {
      nav: { home: "Home", about: "About", whatsThis: "What's this", caseStudy: "Case Study", contact: "Contact" },
    },
  };

  async function loadWhatsThisPageModule() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_TRANSLATIONS_JS_PATH__ || "../shared/translations.js");
    await loadSharedModule(window.__ALBUM_PROMO_LOGO_JS_PATH__ || "../logo/logo.js");
    await loadSharedModule(window.__ALBUM_PROMO_MENU_JS_PATH__ || "../menu/menu.js");
    await loadSharedModule(window.__WHATS_THIS_PAGE_JS_PATH__ || "../whats-this/whats-this-page.js");
  }

  function sampleState() {
    window.ALBUM_PROMO_TRANSLATIONS = SAMPLE_TRANSLATIONS;
    const state = window.createState();
    state.lang = "en";
    return state;
  }

  describe('whats-this/whats-this-page.js (issue #402, Ticket 1 — standalone pages/whats-this.html page)', () => {
    it("buildHeader(state) rewrites the shared menu's hash-anchor items to ../index.html#...", async () => {
      await loadWhatsThisPageModule();
      const state = sampleState();

      const header = window.buildHeader(state);
      const hrefs = Array.from(header.querySelectorAll(".chloe-nav a")).map((a) => a.getAttribute("href"));

      expect(hrefs).toEqual([
        "../index.html#home",
        "../pages/about.html",
        "whats-this.html",
        "../case-study.html",
        "../pages/contact.html",
      ]);
    });

    it("buildHeader(state) resolves the whatsThis item's own href to the self-referencing whats-this.html, not ../pages/whats-this.html", async () => {
      await loadWhatsThisPageModule();
      const state = sampleState();

      const header = window.buildHeader(state);
      const whatsThisLink = header.querySelector('.chloe-nav a[href="whats-this.html"]');

      expect(whatsThisLink).toBeTruthy();
      expect(header.querySelector('.chloe-nav a[href="../pages/whats-this.html"]')).toBeFalsy();
    });

    it("buildHeader(state) rewrites the logo's image path with a ../ prefix (pages/whats-this.html sits one directory below the repo root)", async () => {
      await loadWhatsThisPageModule();
      const state = sampleState();

      const header = window.buildHeader(state);
      const logoImg = header.querySelector(".chloe-wordmark__logo");

      expect(logoImg.getAttribute("src")).toBe("../RadioCalicoStyle/RadioCalicoLogoTM.png");
    });

    it("buildWhatsThisMain() returns an empty <main> mount root with no content sections yet (AC6)", async () => {
      await loadWhatsThisPageModule();

      const main = window.buildWhatsThisMain();

      expect(main.tagName).toBe("MAIN");
      expect(main.className).toContain("chloe-main");
      expect(main.children.length).toBe(0);
    });

    it("rewriteSectionImagePaths(root) rewrites each .whats-this-image__img src with a ../ prefix (issue #509 follow-up: pages/whats-this.html sits one directory below the repo root, same as the logo rewrite above)", async () => {
      await loadWhatsThisPageModule();

      const root = document.createElement("main");
      root.innerHTML =
        '<div class="whats-this-image"><img class="img-fluid whats-this-image__img" src="aidlc-loop-gates.jpg"></div>';

      window.rewriteSectionImagePaths(root);

      const img = root.querySelector(".whats-this-image__img");
      expect(img.getAttribute("src")).toBe("../aidlc-loop-gates.jpg");
    });

    it("rewriteSectionImagePaths(root) leaves non-section-image <img> elements (e.g. the logo, rewritten separately by buildHeader) untouched", async () => {
      await loadWhatsThisPageModule();

      const root = document.createElement("div");
      root.innerHTML = '<img class="chloe-wordmark__logo" src="RadioCalicoStyle/RadioCalicoLogoTM.png">';

      window.rewriteSectionImagePaths(root);

      const logoImg = root.querySelector(".chloe-wordmark__logo");
      expect(logoImg.getAttribute("src")).toBe("RadioCalicoStyle/RadioCalicoLogoTM.png");
    });
  });
})();
