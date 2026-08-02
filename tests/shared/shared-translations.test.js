/**
 * Issue #253 (Ticket 1): shared/translations.js — loadTranslations() and
 * ALBUM_PROMO_I18N_BASE_PATH extracted out of album-promo.js unchanged, so
 * tickets 2-5 can reuse the same i18n fetch. AC1.
 *
 * Written before shared/translations.js exists, per TDD — fails until
 * Ticket 1's Code PR (step 6) creates it.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  async function loadSharedTranslations() {
    await loadSharedModule(
      window.__ALBUM_PROMO_SHARED_TRANSLATIONS_JS_PATH__ || "../shared/translations.js"
    );
  }

  describe("shared/translations.js (issue #253, Ticket 1)", () => {
    it("exposes ALBUM_PROMO_I18N_BASE_PATH as a global, honoring the existing window.__ALBUM_PROMO_I18N_BASE_PATH__ override", async () => {
      await loadSharedTranslations();

      expect(window.ALBUM_PROMO_I18N_BASE_PATH).toBe(window.__ALBUM_PROMO_I18N_BASE_PATH__);
    });

    it("loadTranslations() fetches album-promo-en.json + album-promo-th.json and returns { en, th }", async () => {
      await loadSharedTranslations();

      const translations = await window.loadTranslations();

      expect(typeof translations.en).toBe("object");
      expect(typeof translations.th).toBe("object");
      expect(typeof translations.en.themeToggleLabel).toBe("string");
      expect(typeof translations.th.themeToggleLabel).toBe("string");
    });
  });
})();
