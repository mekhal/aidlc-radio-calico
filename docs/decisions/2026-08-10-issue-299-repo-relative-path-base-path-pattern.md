# Decision: document the repo-root-relative-path pattern so it isn't re-solved from scratch

**Issue:** [#299](https://github.com/mekhal/aidlc-radio-calico/issues/299) (PR #302 review turn)
**Decided by:** @mekhal, 2026-08-10

## Decision

Record, as a standing observation, the pattern already used three times in this codebase for any script/module whose hrefs, `fetch()` calls, or asset paths are written relative to the **repo root**, but which can be loaded from an HTML page that lives **one or more directories below root** (e.g. anything under `tests/`):

1. Define a page-overridable base path constant in the module, defaulting to `""` (root-relative, i.e. unchanged behavior when loaded from a root-level page):
   ```js
   var MODULE_BASE_PATH = window.__MODULE_BASE_PATH__ || "";
   ```
   (Or the module's own natural default, e.g. `"i18n/"`, if the module already assumed a subfolder — see `shared/translations.js`.)
2. Prefix **only** the paths that are actually root-relative with `${MODULE_BASE_PATH}`. Leave absolute URLs (`https://...`) untouched — they resolve the same regardless of page depth.
3. In every HTML file that is **not** at repo root, set the override *before* the module's `<script>` tag loads, to the correct relative-depth prefix (typically `"../"` for one level down):
   ```html
   <script>
     window.__MODULE_BASE_PATH__ = "../";
   </script>
   <script src="../path/to/module.js"></script>
   ```
4. Name the override `window.__<ModuleName>_BASE_PATH__` (all-caps, module-scoped) so it's self-documenting and won't collide with another module's override.

### Existing instances of this exact pattern (for reference, not to be re-derived each time)

| Override | Module | Default | Set to `"../"` in |
|---|---|---|---|
| `window.__I18N_BASE_PATH__` | `app.js` (issue #101) | `"i18n/"` | `tests/test-runner.html` |
| `window.__ALBUM_PROMO_I18N_BASE_PATH__` | `shared/translations.js` (issue #253) | `"i18n/"` | `tests/test-runner.html`, `tests/test-report-dashboard.html` |
| `window.__SIDEBAR_BASE_PATH__` | `sidebar/sidebar.js` (issue #299) | `""` | `tests/test-runner.html`, `tests/test-report-dashboard.html` |

## Why

Issue #299 fixed the sidebar's Test Report / Lint Report / Security Scan Report links 404-ing when the sidebar is rendered from a page one directory below root (`tests/test-report-dashboard.html`). This is the same class of bug the i18n fetch paths already hit and fixed under issue #101 and #253 — a plain relative path (`"tests/..."`, `"i18n/..."`) only resolves correctly from the exact directory depth the author had in mind when writing it, and silently breaks for any other page that loads the same script.

The human flagged in this PR's review that this looked like a recurring issue and asked for a written observation so future work adding a new root-relative-path module doesn't have to re-discover and re-implement the same fix. This decision doc is that observation — a pointer to the already-proven pattern and its three prior applications, so the next occurrence is a five-minute application of a known pattern instead of a fresh investigation.

## Impact

- No code changes in this doc — PR #302's `sidebar/sidebar.js` / `tests/test-runner.html` / `tests/test-report-dashboard.html` changes are unaffected and unchanged by this file.
- This is a candidate for formal promotion to a `.claude/skills/` skill (or a `docs/knowledge-asset/published/` entry) via the normal skill-capture flow — to be proposed at this issue's `@claude close` turn, per `CLAUDE.md`'s "Adding a skill" section, not decided unilaterally here.
