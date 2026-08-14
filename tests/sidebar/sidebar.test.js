/**
 * Issue #256 (Ticket 4 of #245, sidebar/sidebar.js): buildSidebar(state)
 * extracted out of album-promo.js (previously album-promo.js:201-220),
 * along with buildThemeToggle/buildLanguageToggle (previously :134-199) and
 * their private helpers (createSwitch/setSwitchActiveSide/
 * bindSwitchActivation/FLAG_ICONS/setLangThumbFlag) — confirmed via grep
 * that none of those are used outside buildSidebar()'s call chain. AC1.
 *
 * FOOTER_LINKS is renamed SIDEBAR_LINKS in this move (AC2): it only ever
 * rendered inside buildSidebar(), never app.js's actual <footer>, so the old
 * name was misleading (see issue #256's review discussion, both review
 * turns before this plan was approved).
 *
 * Loaded standalone via SharedModuleTestHelpers.loadSharedModule, reused
 * as-is from issue #253/#254/#255 (reuse-first) — shared/state.js
 * (createState) and shared/helpers.js (createIconLink, which buildSidebar
 * calls into per issue #253) are loaded first, same pattern as
 * tests/menu/menu.test.js.
 *
 * Written before sidebar/sidebar.js exists, per TDD — fails until this
 * ticket's Code PR (step 6) creates it.
 *
 * Issue #299 (AC1-AC4): the three site-root-relative links above
 * (Test Report, Lint Report, Security Scan Report) 404 on any page one
 * directory below root (e.g. tests/test-report-dashboard.html), because
 * SIDEBAR_LINKS hardcodes them relative to the site root. Fix mirrors the
 * existing window.__ALBUM_PROMO_I18N_BASE_PATH__ override pattern
 * (shared/translations.js, see tests/shared/shared-translations.test.js):
 * a new window.__SIDEBAR_BASE_PATH__ override, defaulting to "" (AC1,
 * unchanged on index.html/album-promo.html), prefixes only those three
 * relative hrefs — the absolute links (Site, GitHub, LinkedIn) are
 * untouched (AC4). New cases appended below; existing cases above left
 * untouched. Written before the base-path support exists in
 * sidebar/sidebar.js, per TDD — fail until this ticket's Code PR (step 6)
 * implements it.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const LANG_STORAGE_KEY = "chloeAlbumPromoLanguage";
  const THEME_STORAGE_KEY = "chloeAlbumPromoTheme";

  async function loadSidebarModule() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_HELPERS_JS_PATH__ || "../shared/helpers.js");
    await loadSharedModule(window.__ALBUM_PROMO_SIDEBAR_JS_PATH__ || "../sidebar/sidebar.js");
  }

  describe("sidebar/sidebar.js (issue #256, Ticket 4)", () => {
    it("buildSidebar(state) returns an aside.chloe-sidebar with its aria-label, wrapping a nav.chloe-sidebar__icons", async () => {
      await loadSidebarModule();
      const state = window.createState();

      const aside = window.buildSidebar(state);

      expect(aside.tagName).toBe("ASIDE");
      expect(aside.className).toBe("chloe-sidebar");
      expect(aside.getAttribute("aria-label")).toBe("Site footer links");

      const nav = aside.querySelector("nav.chloe-sidebar__icons");
      expect(nav.getAttribute("aria-label")).toBe("Site links");
    });

    it("theme toggle: click flips state.theme, aria-checked, localStorage, and <html data-chloe-theme>", async () => {
      window.localStorage.setItem(THEME_STORAGE_KEY, "light");
      await loadSidebarModule();
      const state = window.createState();

      const aside = window.buildSidebar(state);
      const themeToggle = aside.querySelector('[data-testid="sidebar-theme-toggle"]');
      expect(themeToggle.getAttribute("aria-checked")).toBe("false");

      themeToggle.click();

      expect(state.theme).toBe("dark");
      expect(themeToggle.getAttribute("aria-checked")).toBe("true");
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
      expect(document.documentElement.getAttribute("data-chloe-theme")).toBe("dark");

      window.localStorage.removeItem(THEME_STORAGE_KEY);
      document.documentElement.removeAttribute("data-chloe-theme");
    });

    it("language toggle: click flips state.lang, aria-checked, localStorage, and runs state.onLanguageChange callbacks", async () => {
      window.localStorage.setItem(LANG_STORAGE_KEY, "en");
      await loadSidebarModule();
      const state = window.createState();
      let changeCalls = 0;
      state.onLanguageChange.push(() => changeCalls++);

      const aside = window.buildSidebar(state);
      const langToggle = aside.querySelector('[data-testid="sidebar-language-toggle"]');
      expect(langToggle.getAttribute("aria-checked")).toBe("false");

      langToggle.click();

      expect(state.lang).toBe("th");
      expect(langToggle.getAttribute("aria-checked")).toBe("true");
      expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBe("th");
      expect(changeCalls).toBeGreaterThan(0);

      window.localStorage.removeItem(LANG_STORAGE_KEY);
    });

    it("buildSidebar(state) returns an independent node on each call", async () => {
      await loadSidebarModule();
      const state = window.createState();

      const first = window.buildSidebar(state);
      const second = window.buildSidebar(state);

      expect(first === second).toBeFalsy();
    });

    it("exposes SIDEBAR_BASE_PATH as a global, defaulting to '' when window.__SIDEBAR_BASE_PATH__ is unset (issue #299, AC1)", async () => {
      delete window.__SIDEBAR_BASE_PATH__;
      await loadSidebarModule();

      expect(window.SIDEBAR_BASE_PATH).toBe("");
    });

    it("honors window.__SIDEBAR_BASE_PATH__, prefixing only the Test/Lint/Security Scan links (issue #299, AC2 + AC3)", async () => {
      window.__SIDEBAR_BASE_PATH__ = "../";
      await loadSidebarModule();
      const state = window.createState();

      const aside = window.buildSidebar(state);
      const nav = aside.querySelector("nav.chloe-sidebar__icons");

      expect(nav.querySelector('[data-testid="sidebar-footer-test-report-link"]').getAttribute("href")).toBe(
        "../tests/test-report-dashboard.html"
      );
      expect(nav.querySelector('[data-testid="sidebar-footer-lint-report-link"]').getAttribute("href")).toBe(
        "../reports/lint/megalinter-report.html"
      );
      expect(nav.querySelector('[data-testid="sidebar-footer-security-report-link"]').getAttribute("href")).toBe(
        "../reports/security/trivy.sarif"
      );

      expect(nav.querySelector('[data-testid="sidebar-footer-site-link"]').getAttribute("href")).toBe(
        "https://www.radio-calico.com/"
      );
      expect(nav.querySelector('[data-testid="sidebar-footer-github-link"]').getAttribute("href")).toBe(
        "https://github.com/mekhal/aidlc-radio-calico"
      );
      expect(nav.querySelector('[data-testid="sidebar-footer-linkedin-link"]').getAttribute("href")).toBe(
        "https://www.linkedin.com/in/mekhalomlao/"
      );

      window.__SIDEBAR_BASE_PATH__ = "../";
    });

    // Issue #330: sidebar.js is fetched and re-injected as a fresh <script>
    // tag on every test that mounts it (loadSidebarModule() above, and every
    // other page that reuses it — see tests/test-report-dashboard.js).
    // Before the IIFE fix, SIDEBAR_LINKS/FLAG_ICONS were plain top-level
    // `const`s, which live in the shared global lexical environment;
    // re-injecting the script a second time throws "Identifier
    // 'SIDEBAR_LINKS' has already been declared" as an uncaught global error
    // (window's "error" event — synchronous script-instantiation errors
    // don't propagate back to the appendChild() call that injected them).
    it("can be injected as a <script> more than once without an uncaught global redeclaration error", async () => {
      let caught = null;
      const onError = (event) => {
        caught = (event.error && event.error.message) || event.message;
      };
      window.addEventListener("error", onError);

      await loadSidebarModule();
      await loadSidebarModule();

      window.removeEventListener("error", onError);
      expect(caught).toBeFalsy();
    });

    // Issue #330: the redeclaration error above means the *whole* script
    // fails to re-run on the second injection (not just the conflicting
    // `const`s) — so SIDEBAR_BASE_PATH silently keeps whatever value the
    // first injection computed, even once window.__SIDEBAR_BASE_PATH__
    // changes. This is the same failure mode already implicated in the
    // "honors window.__SIDEBAR_BASE_PATH__" test above being test #7 in this
    // suite (six prior re-injections have already tripped the bug by then).
    // Two consecutive injections here (default, then overridden) isolate it
    // to a minimal repro.
    it("re-executes on every injection, so SIDEBAR_BASE_PATH picks up a changed override on the very next load", async () => {
      delete window.__SIDEBAR_BASE_PATH__;
      await loadSidebarModule();
      expect(window.SIDEBAR_BASE_PATH).toBe("");

      window.__SIDEBAR_BASE_PATH__ = "../";
      await loadSidebarModule();
      expect(window.SIDEBAR_BASE_PATH).toBe("../");

      delete window.__SIDEBAR_BASE_PATH__;
    });
  });
})();
