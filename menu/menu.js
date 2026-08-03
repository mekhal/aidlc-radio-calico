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
 */
"use strict";

const NAV_KEYS = ["home", "about", "whatsThis", "contact"];
const NAV_HREFS = { home: "#home", about: "#about", whatsThis: "#whats-this", contact: "#contact" };

function buildMenu(state) {
  const nav = document.createElement("nav");
  nav.className = "chloe-nav";
  nav.setAttribute("aria-label", "Primary");

  const navLinks = {};
  NAV_KEYS.forEach((key) => {
    const a = document.createElement("a");
    a.href = NAV_HREFS[key];
    navLinks[key] = a;
    nav.appendChild(a);
  });

  function render() {
    if (!ALBUM_PROMO_TRANSLATIONS) return;
    NAV_KEYS.forEach((key) => {
      navLinks[key].textContent = ALBUM_PROMO_TRANSLATIONS[state.lang].nav[key];
    });
  }

  render();
  state.onLanguageChange.push(render);

  return nav;
}
