# Decision: Ticket 1 (`shared/` extraction) — AC1 storage-key/factory wording and deferred test-folder reorg

**Issue:** [#253](https://github.com/mekhal/aidlc-radio-calico/issues/253) (Ticket 1 of the `index.html` component-extraction story, #245)
**Decided by:** @mekhal, 2026-08-02

## Decision

1. **`LANG_STORAGE_KEY`/`THEME_STORAGE_KEY` are exported as globals from `shared/state.js`**, not kept private behind new `setStoredLanguage()`/`setStoredTheme()` setters. `buildThemeToggle`/`buildLanguageToggle` (staying in `album-promo.js`) keep writing to `localStorage` directly via the now-global keys, unchanged.
2. **AC1 explicitly calls for a new `createState()` factory** in `shared/state.js`, wrapping the `{ lang, theme, onLanguageChange, nowPlaying }` object literal that was previously inlined at `album-promo.js:1022`. This is new (small) code, not a pure cut-paste — acknowledged as a narrow, deliberate exception to AC4's "no behavior change... only code relocation" framing, since tickets 2-5 will likely want the same shape.
3. **Test-suite reorg into per-module folders (`tests/shared/`, `tests/logo/`, `tests/sidebar/`, `tests/footer/`) is deferred**, option (i) from the round-2 review: Ticket 1 only adds `tests/shared/` for its own new coverage. Per-module folders for logo/menu/sidebar/footer are added by each of Tickets 2-5 alongside their own extraction, not created empty now. The existing `footer-*.test.js`/`theme-toggle-footer.test.js` suite under `tests/` was found to test `app.js` (a page `index.html` no longer loads), not `album-promo.js`'s sidebar — that ambiguity is explicitly out of this ticket's scope and unresolved.
4. **The `origin/develop` checkout-lands-on-`main` bug (issue #106) recurred twice within this single issue's turns** (Test PR turn at 2026-08-02T15:48, Code PR turn at 2026-08-02T23:22) and the existing unconditional sync-check mitigation (`docs/decisions/2026-07-17-sync-to-develop-before-work-mitigation.md`, tightened by `docs/decisions/2026-08-02-issue-248-mandatory-published-skills-and-unconditional-develop-sync.md`) caught and corrected it both times before any edits were made. No new rule was needed — this is recorded as evidence the existing mitigation continues to be necessary and is working as designed, per the human's explicit request at close to keep this documented.

## Why

Round 1 review of the plan found that AC1's original export list (`getStoredLanguage`, `getStoredTheme`, `loadTranslations`, `ALBUM_PROMO_I18N_BASE_PATH`, `createIconLink`) missed two constants (`LANG_STORAGE_KEY`/`THEME_STORAGE_KEY`) that non-moving functions (`buildThemeToggle`/`buildLanguageToggle`) still depend on — found only by grepping every call site of the functions being moved, not just the functions themselves. The human chose the simpler of two proposed fixes (export the keys directly) over adding setter functions. Round 1 also flagged that "the `state` factory" in AC1's wording didn't match actual code (an inline literal, not a factory) — the human resolved this by making `createState()` an explicit, intentional ask rather than leaving the literal inline.

Round 2's test-isolation ask was scoped down after checking it against actual code: the "confusing" `footer-*.test.js` files turned out to test a different, no-longer-loaded file (`app.js`), and Tickets 2-5 (which would populate `tests/logo/`, `tests/sidebar/`, `tests/footer/`) haven't landed yet — so a full reorg now would be scoping ahead of AC5's "doesn't touch `buildHeader`/`buildSidebar`/`buildFooter` yet." No sibling ticket under #245 already owns this cross-cutting reorg, so it remains an open question for later rather than folded into this ticket.

## Impact

- `shared/state.js`, `shared/translations.js`, `shared/helpers.js`: new files (Code PR #260, merged).
- `album-promo.js`, `index.html`: edited to call the new globals (Code PR #260, merged).
- `tests/shared/`: new folder added this ticket only; `tests/logo/`, `tests/sidebar/`, `tests/footer/` intentionally not created yet — each of Tickets 2-5 (#245) creates its own when it lands.
- No new skill or `CLAUDE.md` rule change from item 4 — existing #106/#248 mitigations already cover this; recorded here as a same-issue data point, not a new decision.
