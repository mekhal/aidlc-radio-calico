/**
 * Issue #418 (Ticket 1 of the "Contact" page story, part of #153): Contact
 * becomes its own standalone page, pages/contact.html, instead of an in-page
 * "#contact" section — the same rework About/What's this/Case Study went
 * through under issues #151/#402/#323. contact/contact-page.js is the thin
 * page-init script for it — mirrors about/about-page.js's and
 * whats-this/whats-this-page.js's already-shipped pattern for a page that
 * reuses the same shared chrome (createState() + buildLogo()/buildMenu() +
 * buildSidebar(state) + buildFooter(state)) rather than duplicating
 * header/sidebar/footer markup (reuse-first). Sidebar/footer output is
 * already covered by their own dedicated suites (tests/sidebar/sidebar.test.js,
 * tests/footer/footer.test.js), so this file — like tests/about/about-page.test.js
 * and tests/whats-this/whats-this-page.test.js before it — only covers this
 * page's own header-rewrite logic (AC2's "no duplicated markup/CSS" is proven
 * by calling the same shared builders, not by re-testing their internals) and
 * this ticket's own two-column grid mount roots (AC4).
 *
 * Per the approved plan, pages/contact.html lives one directory below the
 * repo root (same "pages/" folder as pages/about.html/pages/whats-this.html),
 * so this mirrors those pages' buildHeader() rewrite rules exactly:
 * - The logo's image path gets a "../" rewrite.
 * - The shared menu's one remaining hash-anchor item (#home) is rewritten to
 *   "../index.html#home" — contact was the last hash-based item besides home;
 *   this issue's Code PR moves it to a real page too (see
 *   tests/menu/menu-contact-link.test.js).
 * - The about/whatsThis/caseStudy items' own hrefs (set by menu/menu.js) get
 *   the generic "../${href}" rewrite, same as on pages/about.html/pages/whats-this.html.
 * - The contact item's own href ("pages/contact.html", set by menu/menu.js)
 *   is THIS page's own self-referencing link — it must resolve to
 *   "contact.html" (same directory, no prefix), same self-reference
 *   exception about-page.js and whats-this-page.js already make for their
 *   own item.
 *
 * AC4: two empty Bootstrap-grid column mount roots (#contact-info-root,
 * #contact-form-root) exist inside a `.row`, each `col-12 col-md-6` so they
 * stack to a single column below the md breakpoint and sit side by side at
 * md and up — no content yet, that lands in Tickets 2-3 (AC6). This is the
 * explicit contract the Code PR (step 6) implements against, per
 * docs/knowledge-asset/published/test-pr-native-api-and-self-ref-checklist.md.
 *
 * Written before contact/contact-page.js exists, per TDD — fails until this
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

  async function loadContactPageModule() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_TRANSLATIONS_JS_PATH__ || "../shared/translations.js");
    await loadSharedModule(window.__ALBUM_PROMO_LOGO_JS_PATH__ || "../logo/logo.js");
    await loadSharedModule(window.__ALBUM_PROMO_MENU_JS_PATH__ || "../menu/menu.js");
    await loadSharedModule(window.__CONTACT_PAGE_JS_PATH__ || "../contact/contact-page.js");
  }

  function sampleState() {
    window.ALBUM_PROMO_TRANSLATIONS = SAMPLE_TRANSLATIONS;
    const state = window.createState();
    state.lang = "en";
    return state;
  }

  describe("contact/contact-page.js (issue #418, Ticket 1 — standalone pages/contact.html page)", () => {
    it("buildHeader(state) rewrites the shared menu's remaining hash-anchor item (#home) to ../index.html#home", async () => {
      await loadContactPageModule();
      const state = sampleState();

      const header = window.buildHeader(state);
      const hrefs = Array.from(header.querySelectorAll(".chloe-nav a")).map((a) => a.getAttribute("href"));

      expect(hrefs).toEqual([
        "../index.html#home",
        "../pages/about.html",
        "../pages/whats-this.html",
        "../case-study.html",
        "contact.html",
      ]);
    });

    it("buildHeader(state) resolves the contact item's own href to the self-referencing contact.html, not ../pages/contact.html", async () => {
      await loadContactPageModule();
      const state = sampleState();

      const header = window.buildHeader(state);
      const contactLink = header.querySelector('.chloe-nav a[href="contact.html"]');

      expect(contactLink).toBeTruthy();
      expect(header.querySelector('.chloe-nav a[href="../pages/contact.html"]')).toBeFalsy();
    });

    it("buildHeader(state) rewrites the logo's image path with a ../ prefix (pages/contact.html sits one directory below the repo root)", async () => {
      await loadContactPageModule();
      const state = sampleState();

      const header = window.buildHeader(state);
      const logoImg = header.querySelector(".chloe-wordmark__logo");

      expect(logoImg.getAttribute("src")).toBe("../RadioCalicoStyle/RadioCalicoLogoTM.png");
    });

    it("buildContactMain() returns two empty grid mount roots, no content yet (AC4, AC6)", async () => {
      await loadContactPageModule();

      const main = window.buildContactMain();
      const infoRoot = main.querySelector("#contact-info-root");
      const formRoot = main.querySelector("#contact-form-root");

      expect(main.tagName).toBe("MAIN");
      expect(infoRoot).toBeTruthy();
      expect(formRoot).toBeTruthy();
      expect(infoRoot.children.length).toBe(0);
      expect(formRoot.children.length).toBe(0);
    });

    it("buildContactMain()'s two mount roots each use col-12 col-md-6 so they stack on mobile and sit side by side from md up (AC4)", async () => {
      await loadContactPageModule();

      const main = window.buildContactMain();
      const infoRoot = main.querySelector("#contact-info-root");
      const formRoot = main.querySelector("#contact-form-root");

      expect(infoRoot.classList.contains("col-12")).toBeTruthy();
      expect(infoRoot.classList.contains("col-md-6")).toBeTruthy();
      expect(formRoot.classList.contains("col-12")).toBeTruthy();
      expect(formRoot.classList.contains("col-md-6")).toBeTruthy();
    });

    it("buildContactMain()'s two mount roots sit in the same Bootstrap row", async () => {
      await loadContactPageModule();

      const main = window.buildContactMain();
      const row = main.querySelector(".row");

      expect(row).toBeTruthy();
      expect(row.querySelector("#contact-info-root")).toBeTruthy();
      expect(row.querySelector("#contact-form-root")).toBeTruthy();
    });
  });
})();
