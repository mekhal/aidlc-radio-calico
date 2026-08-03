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
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const LANG_STORAGE_KEY = "chloeAlbumPromoLanguage";
  const THEME_STORAGE_KEY = "chloeAlbumPromoTheme";

  const SIDEBAR_LINKS = [
    {
      testid: "sidebar-footer-site-link",
      href: "https://www.radio-calico.com/",
      label: "radio-calico.com",
      icon: "bi-broadcast",
    },
    {
      testid: "sidebar-footer-test-report-link",
      href: "tests/test-report-dashboard.html",
      label: "Test Report",
      icon: "bi-clipboard-check",
    },
    {
      testid: "sidebar-footer-lint-report-link",
      href: "reports/lint/megalinter-report.html",
      label: "Lint Report",
      icon: "bi-brush",
    },
    {
      testid: "sidebar-footer-security-report-link",
      href: "reports/security/trivy.sarif",
      label: "Security Scan Report",
      icon: "bi-shield-check",
    },
    {
      testid: "sidebar-footer-github-link",
      href: "https://github.com/mekhal/aidlc-radio-calico",
      label: "GitHub",
      icon: "bi-github",
    },
    {
      testid: "sidebar-footer-linkedin-link",
      href: "https://www.linkedin.com/in/mekhalomlao/",
      label: "LinkedIn",
      icon: "bi-linkedin",
    },
  ];

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

    it("renders SIDEBAR_LINKS as external icon links, in order", async () => {
      await loadSidebarModule();
      const state = window.createState();

      const aside = window.buildSidebar(state);
      const nav = aside.querySelector("nav.chloe-sidebar__icons");

      SIDEBAR_LINKS.forEach((entry) => {
        const link = nav.querySelector(`[data-testid="${entry.testid}"]`);
        expect(link.tagName).toBe("A");
        expect(link.getAttribute("href")).toBe(entry.href);
        expect(link.title).toBe(entry.label);
        expect(link.target).toBe("_blank");
        expect(link.rel).toBe("noopener noreferrer");
        expect(link.querySelector("i").className).toBe(`bi ${entry.icon}`);
      });
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
  });
})();
