/**
 * Issue #548 (follow-up to #544/#545): reports/security/security-report.html
 * gains the app's full Header + Sidebar + Footer chrome, reversing #544's
 * "neutral standalone page" choice per @mekhal's step-3 answer (2026-08-29):
 * "ใส่ครบทั้งหมด ทั้ง Header + Sidebar + Footer". Mirrors
 * about/about-page.js and tests/test-report-dashboard.js's already-shipped
 * pattern for a page that composes the same reusable globals index.html/
 * album-promo.js do (createState() + buildLogo()/buildMenu() +
 * buildSidebar(state) + buildFooter(state)) instead of duplicating chrome
 * markup (reuse-first).
 *
 * reports/security/ sits TWO directories below repo root (unlike every
 * existing buildHeader() precedent, which sits one level down under
 * pages/ or tests/), so every rewrite below uses "../../" instead of "../"
 * — see docs/knowledge-asset/published/root-relative-path-audit-for-nested-pages.md.
 * The shared menu has no "security-report" nav item, so — unlike
 * about-page.js — no self-referencing-link special case is needed here.
 *
 * Per @mekhal's step-3 answer item 1, the page's former private lang toggle
 * (#security-lang-toggle, report-boot.js's own LANG_STORAGE_KEY) is dropped
 * entirely — language now comes from buildSidebar(state)'s own toggle,
 * which this page mounts. report-boot.js's own initSecurityReportBoot(state,
 * container) is called here with the shared state object once the chrome
 * is mounted, so its render function can register on state.onLanguageChange
 * the same way menu.js/sidebar.js/footer.js already do.
 */
(function () {
  "use strict";

  function buildHeader(state) {
    const header = document.createElement("header");
    header.className = "chloe-header";

    const wordmark = buildLogo();
    const logoImg = wordmark.querySelector("img");
    if (logoImg) logoImg.setAttribute("src", `../../${logoImg.getAttribute("src")}`);

    const nav = buildMenu(state);
    Array.from(nav.querySelectorAll("a")).forEach((link) => {
      const href = link.getAttribute("href");
      link.setAttribute("href", href.startsWith("#") ? `../../index.html${href}` : `../../${href}`);
    });

    header.appendChild(wordmark);
    header.appendChild(nav);

    return header;
  }

  function initSecurityReportPage() {
    const root = document.getElementById("security-report-root");
    if (!root) return;

    const state = createState();
    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-chloe-theme", state.theme);

    root.appendChild(buildSidebar(state));

    const page = document.createElement("div");
    page.className = "chloe-page";
    page.appendChild(buildHeader(state));

    const main = document.createElement("main");
    main.className = "chloe-main security-report-main";
    main.dataset.testid = "security-report-main";
    page.appendChild(main);

    page.appendChild(buildFooter(state));
    root.appendChild(page);

    window.initSecurityReportBoot(state, main);
  }

  window.buildHeader = buildHeader;

  initSecurityReportPage();
})();
