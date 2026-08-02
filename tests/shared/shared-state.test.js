/**
 * Issue #253 (Ticket 1): shared/state.js — createState(), getStoredLanguage(),
 * getStoredTheme(), and the LANG_STORAGE_KEY/THEME_STORAGE_KEY constants
 * extracted out of album-promo.js (unchanged values/behavior) so tickets 2-5
 * (logo/menu/sidebar/footer) can share the same state shape. AC1, revised in
 * the 2026-08-02 review round 2 to add createState()/the two storage keys to
 * the export list.
 *
 * Written before shared/state.js exists, per TDD — fails until Ticket 1's
 * Code PR (step 6) creates it.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const LANG_STORAGE_KEY = "chloeAlbumPromoLanguage";
  const THEME_STORAGE_KEY = "chloeAlbumPromoTheme";

  async function loadSharedState() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
  }

  describe("shared/state.js (issue #253, Ticket 1)", () => {
    it("exposes LANG_STORAGE_KEY and THEME_STORAGE_KEY as globals, matching album-promo.js's existing keys", async () => {
      await loadSharedState();

      expect(window.LANG_STORAGE_KEY).toBe(LANG_STORAGE_KEY);
      expect(window.THEME_STORAGE_KEY).toBe(THEME_STORAGE_KEY);
    });

    it("getStoredLanguage() defaults to 'en' with no stored preference", async () => {
      window.localStorage.removeItem(LANG_STORAGE_KEY);
      await loadSharedState();

      expect(window.getStoredLanguage()).toBe("en");
    });

    it("getStoredLanguage() returns 'th' only when explicitly stored", async () => {
      window.localStorage.setItem(LANG_STORAGE_KEY, "th");
      await loadSharedState();

      expect(window.getStoredLanguage()).toBe("th");

      window.localStorage.removeItem(LANG_STORAGE_KEY);
    });

    it("getStoredTheme() defaults to 'dark' with no stored preference", async () => {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
      await loadSharedState();

      expect(window.getStoredTheme()).toBe("dark");
    });

    it("getStoredTheme() returns 'light' only when explicitly stored", async () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, "light");
      await loadSharedState();

      expect(window.getStoredTheme()).toBe("light");

      window.localStorage.removeItem(THEME_STORAGE_KEY);
    });

    it("createState() builds { lang, theme, onLanguageChange, nowPlaying } from the stored preferences", async () => {
      window.localStorage.removeItem(LANG_STORAGE_KEY);
      window.localStorage.setItem(THEME_STORAGE_KEY, "light");
      await loadSharedState();

      const state = window.createState();

      expect(state.lang).toBe("en");
      expect(state.theme).toBe("light");
      expect(Array.isArray(state.onLanguageChange)).toBeTruthy();
      expect(state.onLanguageChange.length).toBe(0);
      expect(state.nowPlaying).toEqual({});

      window.localStorage.removeItem(THEME_STORAGE_KEY);
    });

    it("createState() returns a fresh object/array on every call (no shared mutation across calls)", async () => {
      await loadSharedState();

      const first = window.createState();
      first.onLanguageChange.push(() => {});
      const second = window.createState();

      expect(second.onLanguageChange.length).toBe(0);
    });
  });
})();
