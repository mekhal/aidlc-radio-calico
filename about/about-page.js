/**
 * Issue #151 (Ticket 1 of the About page story), plan confirmed at step 3
 * approval (2026-08-15, answers to the 5 questions): About moves off
 * index.html onto its own standalone page, pages/about.html, instead of an
 * in-page "#about" section — the same rework Case Study went through under
 * issue #323. This is the thin page-init script for it — mirrors
 * case-study/case-study-page.js and tests/test-report-dashboard.js's
 * already-shipped pattern for a page that reuses the same shared chrome
 * (createState() + buildLogo()/buildMenu() + buildSidebar(state) +
 * buildFooter(state)) rather than duplicating header/sidebar/footer markup
 * (reuse-first). No hero/player/Recently Played/React/hls.js here — those are
 * Now Playing-specific (album-promo.js), and this page never mounts
 * album-promo.js at all.
 *
 * Per the human's answer to question 2.2, pages/about.html lives one
 * directory below the repo root (a new "pages/" folder — case-study.html
 * sits at the root itself). This makes the closest existing precedent
 * tests/test-report-dashboard.js's buildHeader() (also one directory down,
 * under tests/), not case-study-page.js's (case-study.html needs no rewrite,
 * since it sits at the root). Differences from that precedent:
 * - The logo's image path gets the same "../" rewrite.
 * - The shared menu's hash-anchor items (#home/#whats-this/#contact) are
 *   rewritten to "../index.html#..." (one "../", not two — pages/ sits at
 *   the same depth as tests/).
 * - The caseStudy item's href ("case-study.html", set by menu/menu.js
 *   itself) is rewritten to "../case-study.html", same generic non-hash rule
 *   test-report-dashboard.js already applies.
 * - The about item's own href ("pages/about.html", set by menu/menu.js
 *   itself) is a special case none of the existing precedents have: it is
 *   THIS page's own self-referencing link. Applying the generic "../${href}"
 *   rule would produce "../pages/about.html", which 404s from inside pages/
 *   itself (it would resolve to pages/pages/about.html). It must instead
 *   resolve to "about.html" (same directory, no prefix) — mirrors how
 *   case-study-page.js leaves caseStudy's own href untouched for the same
 *   self-reference reason.
 *
 * Answer to 2.5 ("reuse theme & use i18n") plus the theme/language toggle
 * switches only existing today inside buildSidebar(state) — mounted here the
 * same way case-study.html/test-report-dashboard.html both already do, even
 * though the issue's own mockup only sketches header/content/footer. Merged
 * into #383 with the sidebar mounted as submitted (confirmed by the human).
 *
 * Issue #151 (Ticket 2 of the About page story): mounts Section 1 ("The
 * Radio Calico Project" — about/about.js's buildProjectSection()) into
 * <main data-testid="about-main">. Mirrors the already-shipped
 * window.__aboutPageI18nReady await pattern — loadAboutContent() is awaited
 * once here (not inside about.js's synchronous, directly-testable section
 * builders) before the section is built and appended.
 *
 * See tests/about/about-page.test.js and tests/about/about-content.test.js.
 *
 * Issue #151 (Ticket 3 of the About page story): mounts Section 2
 * ("Production-grade Standards" — about/about.js's buildStandardsSection())
 * into the same <main>, below Section 1, off the same
 * window.__aboutPageContentReady await.
 *
 * Issue #151 (Ticket 4 of the About page story, final ticket): mounts
 * Section 3 ("References & Acknowledgements" — about/about.js's
 * buildReferencesSection()) into the same <main>, below Section 2, off the
 * same window.__aboutPageContentReady await.
 */
(function () {
  "use strict";

  function buildHeader(state) {
    const header = document.createElement("header");
    header.className = "chloe-header";

    const wordmark = buildLogo();
    const logoImg = wordmark.querySelector("img");
    if (logoImg) logoImg.setAttribute("src", `../${logoImg.getAttribute("src")}`);

    const nav = buildMenu(state);
    Array.from(nav.querySelectorAll("a")).forEach((link) => {
      const href = link.getAttribute("href");
      if (href.startsWith("#")) {
        link.setAttribute("href", `../index.html${href}`);
      } else if (href === "pages/about.html") {
        link.setAttribute("href", "about.html");
      } else {
        link.setAttribute("href", `../${href}`);
      }
    });

    header.appendChild(wordmark);
    header.appendChild(nav);

    return header;
  }

  function initAboutPage() {
    const root = document.getElementById("about-root");
    if (!root) return;

    const state = createState();
    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-chloe-theme", state.theme);

    root.appendChild(buildSidebar(state));

    const page = document.createElement("div");
    page.className = "chloe-page";
    page.appendChild(buildHeader(state));

    const main = document.createElement("main");
    main.className = "chloe-main";
    main.dataset.testid = "about-main";
    page.appendChild(main);

    page.appendChild(buildFooter(state));
    root.appendChild(page);

    // Mirrors album-promo.js's window.__albumPromoI18nReady /
    // case-study-page.js's window.__caseStudyPageI18nReady — exposed as a
    // named promise so a test suite can deterministically await it instead
    // of racing the fetch.
    window.__aboutPageI18nReady = loadTranslations().then(() => {
      state.onLanguageChange.forEach((fn) => fn());
    });

    window.__aboutPageContentReady = loadAboutContent().then((content) => {
      main.appendChild(buildProjectSection(state));
      main.appendChild(buildStandardsSection(state, content.productionStandards));
      main.appendChild(buildReferencesSection(state, content.references));
    });
  }

  window.buildHeader = buildHeader;

  initAboutPage();
})();
