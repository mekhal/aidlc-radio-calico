/**
 * Issue #255 (Ticket 3 of #245): menu component extracted out of
 * album-promo.js's buildHeader() (previously album-promo.js:228-248) so it
 * can be mounted independently of the header shell/logo — plain <script>
 * tag, no ES modules
 * (docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md); a plain
 * function declaration attaches to `window` automatically.
 *
 * NAV_KEYS/NAV_HREFS are private to this component (moved from
 * album-promo.js). Reads translated labels from the shared
 * ALBUM_PROMO_TRANSLATIONS cache (shared/translations.js, issue #255 AC2)
 * instead of album-promo.js's former private `TRANSLATIONS`, so this
 * component has no dependency on album-promo.js's internals. See
 * tests/menu/menu.test.js.
 *
 * Issue #306: the nav item matching the current page/hash is marked active
 * (aria-current="page" + .chloe-nav-active) and does not navigate when
 * clicked; every other item stays a plain clickable link. Active detection
 * compares window.location.hash against each item's href, defaulting an
 * empty hash to "#home" since that's index.html's real landing state, and
 * re-evaluates on "hashchange" so it keeps working once About/What's
 * this/Contact become real pages. See tests/menu/menu-active-state.test.js.
 *
 * Issue #375 (bug fix): that "#home" fallback only holds on index.html.
 * Once Case Study became its own real page (#323 below), opening it
 * directly leaves the hash empty too, and the unconditional fallback made
 * Home active at the same time as Case Study. getActiveNavKeys() now only
 * applies the fallback when isCaseStudyActive() is false. See
 * tests/menu/menu-case-study-link.test.js's issue #375 case.
 *
 * Issue #322 (Ticket 1 of #203): a `caseStudy` entry sits between
 * `whatsThis` and `contact` (AC1). index.html (the deployed page, see
 * album-promo.html's own header comment) mounts buildMenu() from this shared
 * module with no page-specific nav markup, so the new tab's active-state/
 * translation behavior needs no page-specific change (AC5).
 *
 * Issue #323 (rework, 2026-08-13): caseStudy moves off index.html onto its
 * own standalone page (case-study.html), so its href becomes that real page
 * (was the hash anchor "#case-study") and its active state is judged by page
 * path, not hash — a real page has no hash to compare, and unlike every
 * other item it can be active independently of whatever the current hash is
 * (see tests/menu/menu-case-study-link.test.js's "independent of the other
 * items' existing hash-based active state" case). Per
 * docs/knowledge-asset/published/test-pr-native-api-and-self-ref-checklist.md
 * a test can't safely stub real navigation/window.location.pathname
 * directly, so this reads an application-level seam,
 * window.__MENU_CURRENT_PATH__ || window.location.pathname — same
 * seam-over-native-override pattern as case-study.js's existing
 * window.__CASE_STUDY_DATA_PATH__.
 *
 * Issue #330: wrapped in an IIFE (matching album-promo.js's pattern) so
 * NAV_KEYS/NAV_HREFS don't live in the shared global lexical environment —
 * the test harness re-injects this file as a fresh <script> tag on every
 * test that mounts it, and a second injection of a top-level `const` throws
 * an uncaught global redeclaration SyntaxError. buildMenu() is exposed on
 * `window` explicitly since it no longer auto-attaches from inside a
 * function scope. See tests/menu/menu.test.js.
 */
(function () {
  "use strict";

  const NAV_KEYS = ["home", "about", "whatsThis", "caseStudy", "contact"];
  const NAV_HREFS = {
    home: "#home",
    about: "#about",
    whatsThis: "#whats-this",
    caseStudy: "case-study.html",
    contact: "#contact",
  };

  function isCaseStudyActive() {
    const path = window.__MENU_CURRENT_PATH__ || window.location.pathname;
    return path.endsWith("case-study.html");
  }

  function isKeyActive(key, hash) {
    if (key === "caseStudy") return isCaseStudyActive();
    return NAV_HREFS[key] === hash;
  }

  function getActiveNavKeys() {
    // Issue #375: the empty-hash-means-home fallback only holds on
    // index.html. On a standalone page like case-study.html, an empty hash
    // is just "no anchor set" and must not also light up Home.
    const hash = isCaseStudyActive() ? window.location.hash : window.location.hash || "#home";
    return new Set(NAV_KEYS.filter((key) => isKeyActive(key, hash)));
  }

  function buildMenu(state) {
    const nav = document.createElement("nav");
    nav.className = "chloe-nav";
    nav.setAttribute("aria-label", "Primary");

    let activeKeys = new Set();
    const navLinks = {};
    NAV_KEYS.forEach((key) => {
      const a = document.createElement("a");
      a.href = NAV_HREFS[key];
      a.addEventListener("click", (event) => {
        if (activeKeys.has(key)) event.preventDefault();
      });
      navLinks[key] = a;
      nav.appendChild(a);
    });

    function updateActiveState() {
      activeKeys = getActiveNavKeys();
      NAV_KEYS.forEach((key) => {
        const isActive = activeKeys.has(key);
        navLinks[key].classList.toggle("chloe-nav-active", isActive);
        if (isActive) {
          navLinks[key].setAttribute("aria-current", "page");
        } else {
          navLinks[key].removeAttribute("aria-current");
        }
      });
    }

    function render() {
      if (!ALBUM_PROMO_TRANSLATIONS) return;
      NAV_KEYS.forEach((key) => {
        navLinks[key].textContent = ALBUM_PROMO_TRANSLATIONS[state.lang].nav[key];
      });
    }

    render();
    updateActiveState();
    state.onLanguageChange.push(render);
    window.addEventListener("hashchange", updateActiveState);

    return nav;
  }

  window.buildMenu = buildMenu;
})();
