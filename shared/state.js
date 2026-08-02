/**
 * Issue #253 (Ticket 1): shared state (lang/theme preferences + the
 * per-page state shape) extracted out of album-promo.js so tickets 2-5
 * (logo/menu/sidebar/footer) can reuse the same globals — plain <script>
 * tag, no ES modules (docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md),
 * so LANG_STORAGE_KEY/THEME_STORAGE_KEY use `var` and the functions are
 * plain declarations, both of which attach to `window` automatically. See
 * tests/shared/shared-state.test.js.
 */
"use strict";

// Distinct localStorage keys from app.js's "radioCalicoLanguage" (see
// app.js:39) — this page is standalone (AC6) and must not read/write the
// main app's stored preferences even though both share an origin.
var LANG_STORAGE_KEY = "chloeAlbumPromoLanguage";
var THEME_STORAGE_KEY = "chloeAlbumPromoTheme";

function getStoredLanguage() {
  return window.localStorage.getItem(LANG_STORAGE_KEY) === "th" ? "th" : "en";
}

// Dark is the default template theme (issue #155 review, 2026-07-24) —
// only an explicit stored "light" choice opts back out.
function getStoredTheme() {
  return window.localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
}

function createState() {
  return { lang: getStoredLanguage(), theme: getStoredTheme(), onLanguageChange: [], nowPlaying: {} };
}
