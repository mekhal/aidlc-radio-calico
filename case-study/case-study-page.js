/**
 * Issue #323 (rework, confirmed on the issue thread 2026-08-13 06:31-06:43):
 * Case Study moves off index.html onto its own standalone page,
 * case-study.html, instead of an in-page "#case-study" section. This is the
 * thin page-init script for it — mirrors tests/test-report-dashboard.js's
 * already-shipped pattern for a second page that reuses the same shared
 * chrome (createState() + buildLogo()/buildMenu() + buildSidebar(state) +
 * buildFooter(state)) rather than duplicating header/sidebar/footer markup
 * (reuse-first). No hero/player/Recently Played/React/hls.js here — those
 * are Now Playing-specific (album-promo.js), and this page never mounts
 * album-promo.js at all.
 *
 * Two differences from the Test Report Dashboard precedent, both because
 * case-study.html sits at the repo root next to index.html (not one
 * directory down under tests/):
 * - The logo's image path needs no "../" rewrite.
 * - The shared menu's hash-anchor items (#home/#about/#whats-this/#contact)
 *   are rewritten to "index.html#..." (no "../" prefix); the caseStudy
 *   item's own href ("case-study.html", set by menu/menu.js itself) is left
 *   untouched since it already points at this same page.
 *
 * See tests/case-study/case-study-page.test.js.
 */
(function () {
  "use strict";

  function buildHeader(state) {
    const header = document.createElement("header");
    header.className = "chloe-header";

    const wordmark = buildLogo();
    const nav = buildMenu(state);
    Array.from(nav.querySelectorAll("a")).forEach((link) => {
      const href = link.getAttribute("href");
      if (href.startsWith("#")) {
        link.setAttribute("href", `index.html${href}`);
      }
    });

    header.appendChild(wordmark);
    header.appendChild(nav);

    return header;
  }

  function buildCaseStudyMain() {
    const main = document.createElement("main");
    main.className = "chloe-main";
    main.appendChild(buildCaseStudySection());
    return main;
  }

  function initCaseStudyPage() {
    const root = document.getElementById("case-study-root");
    if (!root) return;

    const state = createState();
    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-chloe-theme", state.theme);

    root.appendChild(buildSidebar(state));

    const page = document.createElement("div");
    page.className = "chloe-page";
    page.appendChild(buildHeader(state));
    page.appendChild(buildCaseStudyMain());
    page.appendChild(buildFooter(state));
    root.appendChild(page);

    // Mirrors album-promo.js's window.__albumPromoI18nReady /
    // test-report-dashboard.js's window.__testReportDashboardI18nReady —
    // exposed as a named promise so a test suite can deterministically await
    // it instead of racing the fetch.
    window.__caseStudyPageI18nReady = loadTranslations().then(() => {
      state.onLanguageChange.forEach((fn) => fn());
    });
  }

  window.buildHeader = buildHeader;
  window.buildCaseStudyMain = buildCaseStudyMain;

  initCaseStudyPage();
})();
