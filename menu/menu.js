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
 */
"use strict";

const NAV_KEYS = ["home", "about", "whatsThis", "contact"];
const NAV_HREFS = { home: "#home", about: "#about", whatsThis: "#whats-this", contact: "#contact" };

function getActiveNavKey() {
  const hash = window.location.hash || "#home";
  return NAV_KEYS.find((key) => NAV_HREFS[key] === hash) || "home";
}

function buildMenu(state) {
  const nav = document.createElement("nav");
  nav.className = "chloe-nav";
  nav.setAttribute("aria-label", "Primary");

  let activeKey = null;
  const navLinks = {};
  NAV_KEYS.forEach((key) => {
    const a = document.createElement("a");
    a.href = NAV_HREFS[key];
    a.addEventListener("click", (event) => {
      if (key === activeKey) event.preventDefault();
    });
    navLinks[key] = a;
    nav.appendChild(a);
  });

  function updateActiveState() {
    activeKey = getActiveNavKey();
    NAV_KEYS.forEach((key) => {
      const isActive = key === activeKey;
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
