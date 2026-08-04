# Decision: `index.html` component-split architecture and 6-ticket breakdown

**Issue:** [#245](https://github.com/mekhal/aidlc-radio-calico/issues/245) (parent story) — sub-issues [#253](https://github.com/mekhal/aidlc-radio-calico/issues/253) (shared/), [#254](https://github.com/mekhal/aidlc-radio-calico/issues/254) (logo/), [#255](https://github.com/mekhal/aidlc-radio-calico/issues/255) (menu/), [#256](https://github.com/mekhal/aidlc-radio-calico/issues/256) (sidebar/), [#257](https://github.com/mekhal/aidlc-radio-calico/issues/257) (footer/), [#258](https://github.com/mekhal/aidlc-radio-calico/issues/258) (cleanup/validation), plus related follow-on [#272](https://github.com/mekhal/aidlc-radio-calico/issues/272) (`shared/tokens.css`)
**Decided by:** @mekhal, 2026-08-02

## Decision

1. **Split `album-promo.js`/`album-promo.css` into 5 folders**, not the 4 the issue originally asked for: `shared/` (state, translations, helpers — new, not in the original request), `logo/`, `menu/`, `sidebar/`, `footer/`. The 5th folder was added because `logo`/`menu`/`sidebar`/`footer` all depend on common helpers (`createIconLink`, the `state` object, `TRANSLATIONS`) that would otherwise have to be duplicated across every component file.
2. **Logo and menu are fully decoupled** into independent, separately-mountable components, even though they render inside one shared `<header>` today (`buildHeader()`). `logo.js`/`menu.js` each export their own builder returning their own top-level element; the `<header>` shell itself stays owned by page composition (`album-promo.js`), not by either component.
3. **No duplication** across the 4 leaf components for shared helpers — everything reusable goes in `shared/`, even where (at decision time) only one component actually used it (e.g. `createIconLink` was only called by `sidebar.js`).
4. **No build step** — components are loaded via plain `<script>`/`<link>` tags in dependency order (`shared` → `logo`/`menu`/`sidebar`/`footer` → `album-promo.js`), matching the existing vanilla-JS/no-bundler stack (`docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md`). No ES module imports.
5. **`index.html` stays the reference implementation** — this split is prep work for future pages to reuse the components, not a request to wire up a second page in this same story. `index.html`'s visual/behavioral output must remain identical to the pre-split baseline.
6. **Broken into 6 sub-tickets** rather than one large PR, opened as native GitHub sub-issues of #245: shared/ extraction first (unblocking, no dependents), then logo/menu/sidebar/footer in parallel (each depends only on shared/), then a final cleanup/validation ticket. This follows the existing Ticket A/B/C/D/E pattern already used in this repo for multi-part stories.
7. **`FOOTER_LINKS` → `SIDEBAR_LINKS` rename** rides along in the sidebar ticket (#256), fixing a pre-existing naming mismatch found during review: the constant was only ever rendered by `buildSidebar()`, never by `buildFooter()`, and several existing tests named `footer-*.test.js` actually asserted on the sidebar's output for the same reason.

## Why

The issue's screenshot showed 4 visually distinct boxes (logo, menu, sidebar, footer), but reading the actual code (`album-promo.js`) before drafting AC found that this was a single IIFE building all 4 dynamically from one closure sharing `state`/`TRANSLATIONS`/helper functions — "split the HTML into 4 folders" as literally requested would have forced duplicating that shared code 4 times. Surfacing this mismatch between the issue's framing and the actual code structure, and asking the human to resolve it, avoided locking in AC that didn't match reality. The human's answers (2026-08-02T13:50:36Z comment) confirmed the 5-folder/shared-first structure, full logo/menu decoupling, and the ticket ordering that this doc records.

## Impact

- Repo root gained 5 new folders (`shared/`, `logo/`, `menu/`, `sidebar/`, `footer/`), each with its own `.js`/`.css` and (per component) its own `tests/<component>/` folder — landed incrementally via #253–#257, all merged.
- `album-promo.js` shrank from 1046 → 731 lines (further reduced by #272's `shared/tokens.css` follow-on); `album-promo.css` shrank from 692 → ~429 lines.
- `tests/load-album-promo.js` and `tests/test-runner.html` updated to fetch/inject the new component files ahead of `album-promo.js`.
- No second page was wired up to consume the components in this story — confirmed prep-only per decision 5. A future issue would own actually reusing these components on a new page.
- This doc is scoped to decisions made **directly on the #245 parent thread** (the architecture + ticket-breakdown discussion itself); each sub-issue's own implementation-level decisions have their own decision docs and `ai-review-evals/` entries (see the Issue line above) and are not duplicated here.
