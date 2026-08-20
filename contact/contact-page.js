/**
 * Issue #418 (Ticket 1 of the "Contact" page story, part of #153): Contact
 * moves off index.html onto its own standalone page, pages/contact.html,
 * instead of an in-page "#contact" section — the same rework About/What's
 * this/Case Study went through under issues #151/#402/#323. This is the thin
 * page-init script for it — mirrors about/about-page.js's and
 * whats-this/whats-this-page.js's already-shipped pattern for a page that
 * reuses the same shared chrome (createState() + buildLogo()/buildMenu() +
 * buildSidebar(state) + buildFooter(state)) rather than duplicating
 * header/sidebar/footer markup (reuse-first). No hero/player/Recently
 * Played/React/hls.js here — those are Now Playing-specific
 * (album-promo.js), and this page never mounts album-promo.js at all.
 *
 * Per the approved plan, pages/contact.html lives one directory below the
 * repo root (same "pages/" folder as pages/about.html/pages/whats-this.html),
 * so this mirrors those pages' buildHeader() rewrite rules exactly — see
 * about/about-page.js's header comment for the full rationale of each
 * rewrite rule below. The one difference: contact was the last nav item
 * still hash-based besides home (see menu/menu.js), so after this issue's
 * Code PR, "#home" is the only remaining hash-anchor item to rewrite to
 * "../index.html#home" — about/whatsThis/caseStudy's own hrefs get the
 * generic "../${href}" rewrite, and contact's own href
 * ("pages/contact.html", set by menu/menu.js) is THIS page's own
 * self-referencing link, so it resolves to "contact.html" (same directory,
 * no prefix).
 *
 * AC4/AC6: no Contact Info/Contact Form content yet (those land in Tickets
 * 2-3) — buildContactMain() returns a bare <main> containing a Bootstrap
 * `.row` with two empty mount roots, #contact-info-root/#contact-form-root,
 * each `col-12 col-md-6` so they stack to a single column below the md
 * breakpoint and sit side by side at md and up.
 *
 * See tests/contact/contact-page.test.js.
 *
 * Issue #419 (Ticket 2 of the "Contact" page story): mounts the Contact Info
 * column (contact/contact.js's buildContactInfoSection()) into
 * #contact-info-root. Mirrors the already-shipped
 * window.__aboutPageContentReady/window.__whatsThisPageContentReady pattern
 * — loadContactContent() is awaited once here (not inside contact.js's
 * synchronous, directly-testable buildContactInfoSection()) before the
 * section is built and appended.
 *
 * Issue #420 (Ticket 3 of the "Contact" page story): mounts the Contact Form
 * column (contact/contact.js's buildContactFormSection()) into
 * #contact-form-root. Unlike the info column, buildContactFormSection() has
 * no async content to await, so it mounts synchronously alongside the rest
 * of the page — no window.__contactPage*Ready promise needed for it.
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
      } else if (href === "pages/contact.html") {
        link.setAttribute("href", "contact.html");
      } else {
        link.setAttribute("href", `../${href}`);
      }
    });

    header.appendChild(wordmark);
    header.appendChild(nav);

    return header;
  }

  function buildContactMain() {
    const main = document.createElement("main");
    main.className = "chloe-main";
    main.dataset.testid = "contact-main";

    const row = document.createElement("div");
    row.className = "row";

    const infoRoot = document.createElement("div");
    infoRoot.id = "contact-info-root";
    infoRoot.className = "col-12 col-md-6";

    const formRoot = document.createElement("div");
    formRoot.id = "contact-form-root";
    formRoot.className = "col-12 col-md-6";

    row.appendChild(infoRoot);
    row.appendChild(formRoot);
    main.appendChild(row);

    return main;
  }

  function initContactPage() {
    const root = document.getElementById("contact-root");
    if (!root) return;

    const state = createState();
    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-chloe-theme", state.theme);

    root.appendChild(buildSidebar(state));

    const page = document.createElement("div");
    page.className = "chloe-page";
    page.appendChild(buildHeader(state));
    page.appendChild(buildContactMain());
    page.appendChild(buildFooter(state));
    root.appendChild(page);

    // Mirrors about-page.js's window.__aboutPageI18nReady — exposed as a
    // named promise so a test suite can deterministically await it instead
    // of racing the fetch.
    window.__contactPageI18nReady = loadTranslations().then(() => {
      state.onLanguageChange.forEach((fn) => fn());
    });

    const infoRoot = page.querySelector("#contact-info-root");

    // Mirrors about-page.js's window.__aboutPageContentReady — exposed as a
    // named promise so a test suite can deterministically await it instead
    // of racing the fetch.
    window.__contactPageContentReady = loadContactContent().then((content) => {
      infoRoot.appendChild(buildContactInfoSection(content));
    });

    const formRoot = page.querySelector("#contact-form-root");
    formRoot.appendChild(buildContactFormSection());
  }

  window.buildHeader = buildHeader;
  window.buildContactMain = buildContactMain;

  initContactPage();
})();
