/**
 * Issue #402 (Ticket 1 of the "What's this" page story, part of #152): the
 * "What's this" nav item moves off index.html onto its own standalone page,
 * pages/whats-this.html, instead of an in-page "#whats-this" section — the
 * same rework About went through under issue #151. This is the thin
 * page-init script for it — mirrors about/about-page.js's already-shipped
 * pattern for a page that reuses the same shared chrome (createState() +
 * buildLogo()/buildMenu() + buildSidebar(state) + buildFooter(state)) rather
 * than duplicating header/sidebar/footer markup (reuse-first). No
 * hero/player/Recently Played/React/hls.js here — those are Now
 * Playing-specific (album-promo.js), and this page never mounts
 * album-promo.js at all.
 *
 * Per the approved plan, pages/whats-this.html lives one directory below the
 * repo root (same "pages/" folder as pages/about.html), so this mirrors
 * about/about-page.js's buildHeader() rewrite rules exactly — see that
 * file's header comment for the full rationale of each rewrite rule below.
 *
 * AC6: no content sections yet (Sections 1-3 land in Tickets 2-4).
 * buildWhatsThisMain() mirrors case-study/case-study-page.js's
 * buildCaseStudyMain() precedent, minus the section append — a bare <main>
 * with a testid and no content children, so Tickets 2-4 can append their
 * sections into it without this ticket asserting on content that doesn't
 * exist yet.
 *
 * See tests/whats-this/whats-this-page.test.js.
 *
 * Issue #403 (Ticket 2 of the "What's this" page story): mounts Section 1
 * ("What is this?" — whats-this/whats-this.js's buildWhatIsThisSection())
 * into <main data-testid="whats-this-main">. Mirrors the already-shipped
 * window.__aboutPageContentReady await pattern — loadWhatsThisContent() is
 * awaited once here (not inside whats-this.js's synchronous, directly-
 * testable section builder) before the section is built and appended.
 *
 * See tests/whats-this/whats-this-content.test.js.
 *
 * Issue #404 (Ticket 3 of the "What's this" page story): mounts Section 2
 * ("The AI-DLC Loop" - whats-this/whats-this.js's buildAiDlcLoopSection())
 * into <main data-testid="whats-this-main">, appended after Section 1 within
 * the same loadWhatsThisContent() await chain.
 *
 * See tests/whats-this/whats-this-loop.test.js.
 *
 * Issue #405 (Ticket 4 of the "What's this" page story): mounts Section 3
 * ("Skill Capture & Reuse" - whats-this/whats-this.js's
 * buildSkillCaptureSection()) into <main data-testid="whats-this-main">,
 * appended after Section 2 within the same loadWhatsThisContent() await
 * chain.
 *
 * See tests/whats-this/whats-this-skills.test.js.
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
      } else if (href === "pages/whats-this.html") {
        link.setAttribute("href", "whats-this.html");
      } else {
        link.setAttribute("href", `../${href}`);
      }
    });

    header.appendChild(wordmark);
    header.appendChild(nav);

    return header;
  }

  function buildWhatsThisMain() {
    const main = document.createElement("main");
    main.className = "chloe-main";
    main.dataset.testid = "whats-this-main";
    return main;
  }

  function initWhatsThisPage() {
    const root = document.getElementById("whats-this-root");
    if (!root) return;

    const state = createState();
    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-chloe-theme", state.theme);

    root.appendChild(buildSidebar(state));

    const page = document.createElement("div");
    page.className = "chloe-page";
    page.appendChild(buildHeader(state));

    const main = buildWhatsThisMain();
    page.appendChild(main);

    page.appendChild(buildFooter(state));
    root.appendChild(page);

    // Mirrors about-page.js's window.__aboutPageI18nReady — exposed as a
    // named promise so a test suite can deterministically await it instead
    // of racing the fetch.
    window.__whatsThisPageI18nReady = loadTranslations().then(() => {
      state.onLanguageChange.forEach((fn) => fn());
    });

    // Mirrors about-page.js's window.__aboutPageContentReady.
    window.__whatsThisPageContentReady = loadWhatsThisContent().then((content) => {
      main.appendChild(buildWhatIsThisSection(state, content.whatIsThis));
      main.appendChild(buildAiDlcLoopSection(state, content.aidlcLoop));
      main.appendChild(buildSkillCaptureSection(state, content.skillCapture));
    });
  }

  window.buildHeader = buildHeader;
  window.buildWhatsThisMain = buildWhatsThisMain;

  initWhatsThisPage();
})();
