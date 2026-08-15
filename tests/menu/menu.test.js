/**
 * Issue #255 (Ticket 3 of #245, menu/menu.js): buildMenu(state) extracted
 * out of album-promo.js's buildHeader() (album-promo.js:222-254) — returns
 * just the `<nav class="chloe-nav">`, with NAV_KEYS/NAV_HREFS as private
 * constants. AC1.
 *
 * Reads translated nav labels from the shared ALBUM_PROMO_TRANSLATIONS
 * cache (shared/translations.js, this ticket's AC2 — see
 * tests/shared/shared-translations.test.js) instead of album-promo.js's
 * private `TRANSLATIONS` variable, so this component has no dependency on
 * album-promo.js's internals.
 *
 * Loaded standalone via SharedModuleTestHelpers.loadSharedModule, reused
 * as-is from issue #253/#254 (reuse-first) — shared/state.js +
 * shared/translations.js are loaded first so buildMenu(state) has
 * createState()/ALBUM_PROMO_TRANSLATIONS available, same pattern as
 * tests/logo/logo.test.js.
 *
 * Written before menu/menu.js exists, per TDD — fails until this ticket's
 * Code PR (step 6) creates it.
 *
 * Issue #322 (Ticket 1 of #203): a `caseStudy` entry is inserted between
 * `whatsThis` and `contact` (NAV_KEYS order + NAV_HREFS `#case-study`), AC1.
 * Written before menu/menu.js implements it, per TDD — fails until this
 * ticket's Code PR (step 6) adds it.
 *
 * Issue #323 (rework, 2026-08-13): caseStudy moves off index.html onto its
 * own standalone page — NAV_HREFS.caseStudy becomes the real page
 * "case-study.html" (was the hash anchor "#case-study"). This file's own
 * local NAV_HREFS copy is updated to match, same as
 * tests/menu/menu-active-state.test.js's own local copy (updated in the
 * rework's Test PR, #346) — the href-order/label assertions below are
 * otherwise unchanged.
 *
 * Issue #151 (Ticket 1 of the About page story): about moves off index.html
 * onto its own standalone page the same way — NAV_HREFS.about becomes the
 * real page "pages/about.html" (was the hash anchor "#about"). This file's
 * local NAV_HREFS copy is updated to match; the href-order/label assertions
 * below are otherwise unchanged (they only compare against NAV_HREFS[key],
 * not against a hash literal). About's own path-based active-state behavior
 * is covered separately in tests/menu/menu-about-link.test.js.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const NAV_KEYS = ["home", "about", "whatsThis", "caseStudy", "contact"];
  const NAV_HREFS = {
    home: "#home",
    about: "pages/about.html",
    whatsThis: "#whats-this",
    caseStudy: "case-study.html",
    contact: "#contact",
  };

  const SAMPLE_TRANSLATIONS = {
    en: {
      nav: { home: "Home", about: "About", whatsThis: "What's this", caseStudy: "Case Study", contact: "Contact" },
    },
    th: {
      nav: { home: "หน้าแรก", about: "เกี่ยวกับ", whatsThis: "นี่คืออะไร", caseStudy: "กรณีศึกษา", contact: "ติดต่อ" },
    },
  };

  async function loadMenuModule() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_TRANSLATIONS_JS_PATH__ || "../shared/translations.js");
    await loadSharedModule(window.__ALBUM_PROMO_MENU_JS_PATH__ || "../menu/menu.js");
  }

  describe("menu/menu.js (issue #255, Ticket 3)", () => {
    it("buildMenu(state) returns a nav.chloe-nav with aria-label Primary and 5 links in NAV_KEYS order", async () => {
      await loadMenuModule();
      const state = window.createState();

      const nav = window.buildMenu(state);

      expect(nav.tagName).toBe("NAV");
      expect(nav.className).toBe("chloe-nav");
      expect(nav.getAttribute("aria-label")).toBe("Primary");

      const links = nav.querySelectorAll("a");
      expect(links.length).toBe(NAV_KEYS.length);
      NAV_KEYS.forEach((key, i) => {
        expect(links[i].getAttribute("href")).toBe(NAV_HREFS[key]);
      });
    });

    it("leaves link labels empty until ALBUM_PROMO_TRANSLATIONS has loaded", async () => {
      await loadMenuModule();
      window.ALBUM_PROMO_TRANSLATIONS = null;
      const state = window.createState();

      const nav = window.buildMenu(state);

      nav.querySelectorAll("a").forEach((a) => expect(a.textContent).toBe(""));
    });

    it("renders translated nav labels for state.lang once ALBUM_PROMO_TRANSLATIONS is populated", async () => {
      await loadMenuModule();
      window.ALBUM_PROMO_TRANSLATIONS = SAMPLE_TRANSLATIONS;
      const state = window.createState();
      state.lang = "en";

      const nav = window.buildMenu(state);
      const links = nav.querySelectorAll("a");

      NAV_KEYS.forEach((key, i) => {
        expect(links[i].textContent).toBe(SAMPLE_TRANSLATIONS.en.nav[key]);
      });

      window.ALBUM_PROMO_TRANSLATIONS = null;
    });

    it("re-renders nav labels via state.onLanguageChange when the language changes", async () => {
      await loadMenuModule();
      window.ALBUM_PROMO_TRANSLATIONS = SAMPLE_TRANSLATIONS;
      const state = window.createState();
      state.lang = "en";

      const nav = window.buildMenu(state);
      expect(nav.querySelectorAll("a")[0].textContent).toBe("Home");

      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      expect(nav.querySelectorAll("a")[0].textContent).toBe("หน้าแรก");

      window.ALBUM_PROMO_TRANSLATIONS = null;
    });

    it("buildMenu(state) returns an independent node on each call", async () => {
      await loadMenuModule();
      const state = window.createState();

      const first = window.buildMenu(state);
      const second = window.buildMenu(state);

      expect(first === second).toBeFalsy();
    });

    // Issue #330: menu.js is fetched and re-injected as a fresh <script> tag
    // on every test that mounts it (loadMenuModule() above, and every other
    // page that reuses it — see tests/test-report-dashboard.js). Before the
    // IIFE fix, NAV_KEYS/NAV_HREFS were plain top-level `const`s, which live
    // in the shared global lexical environment; re-injecting the script a
    // second time throws "Identifier 'NAV_KEYS' has already been declared"
    // as an uncaught global error (window's "error" event — synchronous
    // script-instantiation errors don't propagate back to the appendChild()
    // call that injected them).
    it("can be injected as a <script> more than once without an uncaught global redeclaration error", async () => {
      let caught = null;
      const onError = (event) => {
        caught = (event.error && event.error.message) || event.message;
      };
      window.addEventListener("error", onError);

      await loadMenuModule();
      await loadMenuModule();

      window.removeEventListener("error", onError);
      expect(caught).toBeFalsy();
    });
  });
})();
