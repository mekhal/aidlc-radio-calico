/**
 * Issue #257 (Ticket 5 of #245): footer component extracted out of
 * album-promo.js's buildFooter() (previously album-promo.js:704-727) — plain
 * <script> tag, no ES modules
 * (docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md); a plain
 * function declaration attaches to `window` automatically.
 *
 * Reads translated disclaimer/copyright text from the shared
 * ALBUM_PROMO_TRANSLATIONS cache (shared/translations.js, issue #255) — same
 * pattern as menu/menu.js and sidebar/sidebar.js, so this component has no
 * dependency on album-promo.js's internals. See tests/footer/footer.test.js.
 */
"use strict";

function buildFooter(state) {
  const footer = document.createElement("footer");
  footer.className = "chloe-footer";

  const disclaimer = document.createElement("p");
  disclaimer.className = "chloe-footer__disclaimer";

  const copy = document.createElement("p");
  copy.className = "chloe-footer__copy";

  function render() {
    if (!ALBUM_PROMO_TRANSLATIONS) return;
    disclaimer.textContent = ALBUM_PROMO_TRANSLATIONS[state.lang].disclaimer;
    copy.innerHTML = ALBUM_PROMO_TRANSLATIONS[state.lang].copyright;
  }

  render();
  state.onLanguageChange.push(render);

  footer.appendChild(disclaimer);
  footer.appendChild(copy);

  return footer;
}
