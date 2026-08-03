# Decision: Ticket 3 (`menu/` extraction) — shared `ALBUM_PROMO_TRANSLATIONS` cache, and sequencing ahead of #254

**Issue:** [#255](https://github.com/mekhal/aidlc-radio-calico/issues/255) (Ticket 3 of the `index.html` component-extraction story, #245)
**Decided by:** @mekhal, 2026-08-03

## Decision

1. **`album-promo.js`'s private `let TRANSLATIONS = null;` is promoted into a shared
   `ALBUM_PROMO_TRANSLATIONS` global in `shared/translations.js`**, set as a side effect inside
   `loadTranslations()` instead of by the caller. `album-promo.js` and the new `menu/menu.js` both
   read from the shared global; `album-promo.js` no longer holds its own copy. Confirmed by the
   human's answer "ทำแบบ issue 253" (do it like issue #253) — the same precedent as `createState()`
   being added to `shared/state.js` during #253: a small, deliberate addition beyond pure
   cut-paste, justified because sibling tickets will want the same shape.
2. **`menu/menu.js` exports `buildMenu(state)`**, extracted from `buildHeader()`
   (`album-promo.js`, previously lines 222-254), with `NAV_KEYS`/`NAV_HREFS` moved in as private
   constants. `.chloe-nav*` CSS rules moved into `menu/menu.css`. `buildHeader()` keeps the
   `<header class="chloe-header">` shell and its (already-extracted, #254) `buildLogo()` call
   unchanged, and now calls `buildMenu(state)` in place of the old inline nav construction.
3. **This ticket proceeded ahead of #254** (logo extraction), per the human's answer "ทำ issue นี้
   ก่อนเลย" (do this issue first). `buildHeader()`'s nav-building code had no dependency on the
   logo/wordmark half, so building `menu/` first and leaving the wordmark markup untouched in
   `buildHeader()` carried no risk either direction — confirmed by reading `buildHeader()` before
   committing to the sequencing answer.

## Why

Item 1 avoids two independent, diverging copies of the same session-lifetime translation data
(one in `album-promo.js`, one implicitly needed by any new component script), and sets a reusable
pattern: when a component extraction needs data currently held in the host page-controller's
private variable, promote that data into the relevant `shared/*.js` module as a global set by the
existing loader/fetcher, rather than duplicating state or threading it through function
parameters. The issue's own review comments flagged this will resurface for #256/#257
(sidebar/footer) if they also read translated strings — this decision is the template those
tickets should follow, see the proposed `shared-state-promotion-pattern` skill candidate raised at
this issue's close.

Item 3 reflects that `#245`'s "fully decouple logo and menu" decision (rather than a single fused
header component) already implied these two tickets don't need to land in a fixed order — the call
site (`buildHeader()`) can adopt each extracted piece independently as it lands.

## Impact

- `menu/menu.js`, `menu/menu.css`: new files (Test PR #267 scaffolding + Code PR #268 implementation, both merged).
- `shared/translations.js`: gained `ALBUM_PROMO_TRANSLATIONS` (Code PR #268, merged).
- `album-promo.js`: `buildHeader()`'s inline nav block replaced by `buildMenu(state)`; all 13
  `TRANSLATIONS[...]` call sites repointed to `ALBUM_PROMO_TRANSLATIONS`; private `TRANSLATIONS`
  variable removed (Code PR #268, merged).
- `index.html`: added `<link rel="stylesheet" href="menu/menu.css">` and
  `<script src="menu/menu.js">`, following the load-order pattern #254 set for `logo/` (Code PR #268, merged).
- `tests/menu/menu.test.js`, `tests/menu/menu-header-integration.test.js`,
  `tests/shared/shared-translations.test.js` (additions): new/updated test files (Test PR #267, merged).
