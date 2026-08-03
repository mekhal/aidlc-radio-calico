/**
 * Issue #253 (Ticket 1): shared i18n fetch extracted out of album-promo.js
 * so tickets 2-5 (logo/menu/sidebar/footer) can reuse the same globals —
 * plain <script> tag, no ES modules
 * (docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md), so
 * ALBUM_PROMO_I18N_BASE_PATH uses `var` and loadTranslations() is a plain
 * function declaration, both of which attach to `window` automatically. See
 * tests/shared/shared-translations.test.js.
 *
 * Issue #255 (Ticket 3): ALBUM_PROMO_TRANSLATIONS added as a shared
 * resolved-translations cache, set as a side effect inside
 * loadTranslations(), so menu/menu.js (and album-promo.js itself, replacing
 * its former private `let TRANSLATIONS`) can read translated strings
 * without depending on album-promo.js's internals — same "shared global"
 * precedent createState() set on issue #253.
 */
"use strict";

// Strings live in i18n/album-promo-en.json + i18n/album-promo-th.json,
// fetched below — kept as separate files from app.js's i18n/en.json +
// i18n/th.json (rather than merged in) so this page's copy set stays
// decoupled from the main app's keys, per the self-contained-page
// constraint from the issue #155 review. Follow-up review comment on PR
// #166 (2026-07-24) asked for the strings to live under i18n/ rather than
// inline in this file; mirrors app.js's loadTranslations() fetch pattern.
var ALBUM_PROMO_I18N_BASE_PATH = window.__ALBUM_PROMO_I18N_BASE_PATH__ || "i18n/";

var ALBUM_PROMO_TRANSLATIONS = null;

async function loadTranslations() {
  const [enResponse, thResponse] = await Promise.all([
    fetch(`${ALBUM_PROMO_I18N_BASE_PATH}album-promo-en.json`),
    fetch(`${ALBUM_PROMO_I18N_BASE_PATH}album-promo-th.json`),
  ]);
  const [en, th] = await Promise.all([enResponse.json(), thResponse.json()]);
  ALBUM_PROMO_TRANSLATIONS = { en, th };
  return ALBUM_PROMO_TRANSLATIONS;
}
