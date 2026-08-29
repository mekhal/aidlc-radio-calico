/**
 * Issue #548 (follow-up to #544/#545): reports/security/security-report.html
 * gains the app's full Header + Sidebar + Footer chrome — the same reusable
 * globals index.html/album-promo.js compose (createState() + buildLogo() +
 * buildMenu() + buildSidebar(state) + buildFooter(state)) — reversing #544's
 * "neutral standalone page" choice per @mekhal's step-3 answer (2026-08-29):
 * "ใส่ครบทั้งหมด ทั้ง Header + Sidebar + Footer".
 *
 * reports/security/security-report-page.js is the new thin page-init script
 * (mirrors about/about-page.js and case-study/case-study-page.js). Its own
 * buildHeader(state) rewrites the shared menu/logo the same way
 * about-page.js does for pages/about.html (one directory below repo root),
 * except reports/security/ sits TWO directories below repo root, so every
 * rewrite uses "../../" instead of "../" — confirmed in the issue #548
 * review discussion against docs/knowledge-asset/published/
 * root-relative-path-audit-for-nested-pages.md. Unlike about-page.js, no
 * self-referencing-link special case is needed: the shared menu has no
 * "security-report" nav item (that link only lives in the sidebar, whose
 * SIDEBAR_BASE_PATH override is exercised separately by sidebar/sidebar.js's
 * own suite, not here).
 *
 * Written before reports/security/security-report-page.js exists, per TDD —
 * fails until this issue's Code PR (step 6) creates it.
 */
(function () {
  "use strict";

  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const SAMPLE_TRANSLATIONS = {
    en: {
      nav: { home: "Home", about: "About", whatsThis: "What's this", caseStudy: "Case Study", contact: "Contact" },
    },
  };

  async function loadSecurityReportPageModule() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_TRANSLATIONS_JS_PATH__ || "../shared/translations.js");
    await loadSharedModule(window.__ALBUM_PROMO_LOGO_JS_PATH__ || "../logo/logo.js");
    await loadSharedModule(window.__ALBUM_PROMO_MENU_JS_PATH__ || "../menu/menu.js");
    await loadSharedModule(window.__SECURITY_REPORT_PAGE_JS_PATH__ || "../reports/security/security-report-page.js");
  }

  function sampleState() {
    window.ALBUM_PROMO_TRANSLATIONS = SAMPLE_TRANSLATIONS;
    const state = window.createState();
    state.lang = "en";
    return state;
  }

  describe("reports/security/security-report-page.js (issue #548 — full chrome mount)", () => {
    it("buildHeader(state) rewrites the shared menu's hash-anchor home item to ../../index.html#home (two directories below repo root)", async () => {
      await loadSecurityReportPageModule();
      const state = sampleState();

      const header = window.buildHeader(state);
      const hrefs = Array.from(header.querySelectorAll(".chloe-nav a")).map((a) => a.getAttribute("href"));

      expect(hrefs).toEqual([
        "../../index.html#home",
        "../../pages/about.html",
        "../../pages/whats-this.html",
        "../../case-study.html",
        "../../pages/contact.html",
      ]);
    });

    it("buildHeader(state) rewrites the logo's image path with a ../../ prefix", async () => {
      await loadSecurityReportPageModule();
      const state = sampleState();

      const header = window.buildHeader(state);
      const logoImg = header.querySelector(".chloe-wordmark__logo");

      expect(logoImg.getAttribute("src")).toBe("../../RadioCalicoStyle/RadioCalicoLogoTM.png");
    });
  });

  async function readReportBootSource() {
    const response = await fetch(window.__SECURITY_REPORT_BOOT_JS_PATH__ || "../reports/security/report-boot.js");
    if (!response.ok) {
      throw new Error(`Expected to fetch report-boot.js, got HTTP ${response.status}`);
    }
    return response.text();
  }

  async function readSecurityReportHtml() {
    const response = await fetch(window.__SECURITY_REPORT_HTML_PATH__ || "../reports/security/security-report.html");
    if (!response.ok) {
      throw new Error(`Expected to fetch security-report.html, got HTTP ${response.status}`);
    }
    return response.text();
  }

  // Per @mekhal's step-3 answer, item 1: "ให้ยุบรวมระบบภาษาเดิมเข้ากับ
  // createState() และ buildSidebar เลย โดยลบปุ่ม #security-lang-toggle เดิมทิ้ง"
  // — the page's private lang toggle/localStorage key are removed entirely;
  // language now comes from the shared state buildSidebar(state)'s own
  // language toggle switch already provides "for free" (same as
  // tests/test-report-dashboard-shared-chrome.test.js's AC-A3).
  describe("reports/security/security-report.html i18n consolidation (issue #548)", () => {
    it("removes the page's own #security-lang-toggle button — language now comes from the shared sidebar toggle", async () => {
      const html = await readSecurityReportHtml();
      expect(html.includes("security-lang-toggle")).toBeFalsy();
    });

    it("removes report-boot.js's private LANG_STORAGE_KEY / lone language state in favor of the shared state object", async () => {
      const source = await readReportBootSource();
      expect(source.includes("radioCalicoSecurityReportLanguage")).toBeFalsy();
      expect(source.includes("LANG_STORAGE_KEY")).toBeFalsy();
    });
  });
})();
