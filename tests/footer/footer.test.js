/**
 * Issue #257 (Ticket 5 of #245, footer/footer.js): buildFooter(state)
 * extracted out of album-promo.js (previously album-promo.js:704-727) —
 * returns just the `<footer class="chloe-footer">`, unchanged. AC1.
 *
 * Reads translated disclaimer/copyright text from the shared
 * ALBUM_PROMO_TRANSLATIONS cache (shared/translations.js, issue #255) —
 * already the case before this extraction (issue #255 moved album-promo.js's
 * former private `TRANSLATIONS` reads over to the shared global), so this
 * component has no dependency on album-promo.js's internals, same as
 * menu/menu.js and sidebar/sidebar.js.
 *
 * Loaded standalone via SharedModuleTestHelpers.loadSharedModule, reused
 * as-is from issue #253/#254/#255/#256 (reuse-first) — shared/state.js and
 * shared/translations.js are loaded first so buildFooter(state) has
 * createState()/ALBUM_PROMO_TRANSLATIONS available, same pattern as
 * tests/menu/menu.test.js.
 *
 * Written before footer/footer.js exists, per TDD — fails until this
 * ticket's Code PR (step 6) creates it.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const SAMPLE_TRANSLATIONS = {
    en: {
      disclaimer: "Radio Calico is an independent internet radio stream.",
      copyright: "&copy; 2026 Radio Calico. Released under the MIT License.",
    },
    th: {
      disclaimer: "Radio Calico เป็นสถานีวิทยุอินเทอร์เน็ตอิสระ",
      copyright: "&copy; 2026 Radio Calico สงวนสิทธิ์ภายใต้สัญญาอนุญาต MIT",
    },
  };

  async function loadFooterModule() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_TRANSLATIONS_JS_PATH__ || "../shared/translations.js");
    await loadSharedModule(window.__ALBUM_PROMO_FOOTER_JS_PATH__ || "../footer/footer.js");
  }

  describe("footer/footer.js (issue #257, Ticket 5)", () => {
    it("buildFooter(state) returns a footer.chloe-footer wrapping a disclaimer and copyright paragraph", async () => {
      await loadFooterModule();
      const state = window.createState();

      const footer = window.buildFooter(state);

      expect(footer.tagName).toBe("FOOTER");
      expect(footer.className).toBe("chloe-footer");

      const disclaimer = footer.querySelector("p.chloe-footer__disclaimer");
      const copy = footer.querySelector("p.chloe-footer__copy");
      expect(disclaimer).toBeTruthy();
      expect(copy).toBeTruthy();
    });

    it("leaves disclaimer/copyright text empty until ALBUM_PROMO_TRANSLATIONS has loaded", async () => {
      await loadFooterModule();
      window.ALBUM_PROMO_TRANSLATIONS = null;
      const state = window.createState();

      const footer = window.buildFooter(state);

      expect(footer.querySelector(".chloe-footer__disclaimer").textContent).toBe("");
      expect(footer.querySelector(".chloe-footer__copy").textContent).toBe("");
    });

    it("re-renders disclaimer/copyright via state.onLanguageChange when the language changes", async () => {
      await loadFooterModule();
      window.ALBUM_PROMO_TRANSLATIONS = SAMPLE_TRANSLATIONS;
      const state = window.createState();
      state.lang = "en";

      const footer = window.buildFooter(state);
      expect(footer.querySelector(".chloe-footer__disclaimer").textContent).toBe(
        SAMPLE_TRANSLATIONS.en.disclaimer,
      );

      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      expect(footer.querySelector(".chloe-footer__disclaimer").textContent).toBe(
        SAMPLE_TRANSLATIONS.th.disclaimer,
      );

      window.ALBUM_PROMO_TRANSLATIONS = null;
    });

    it("buildFooter(state) returns an independent node on each call", async () => {
      await loadFooterModule();
      const state = window.createState();

      const first = window.buildFooter(state);
      const second = window.buildFooter(state);

      expect(first === second).toBeFalsy();
    });
  });
})();
