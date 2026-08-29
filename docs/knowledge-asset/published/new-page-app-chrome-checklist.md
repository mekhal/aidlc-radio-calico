<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/new-page-app-chrome-checklist/SKILL.md
Surfaced while closing issue #548 (security-report.html: add app header/sidebar/footer chrome +
shrink download control). #544's close had deliberately kept this page standalone (no shared
state/chrome) to avoid exactly the conflicts this checklist covers; #548 is the first case where a
human explicitly asked to reverse that default, and hit both conflicts at once: a page-local i18n
toggle colliding with buildSidebar()'s built-in toggle, and CSS with no theme-flipping tokens while
buildSidebar() implies theme support.
Decision record: docs/decisions/2026-08-29-issue-548-close-scores-and-new-html-page-chrome-skill.md
-->
<!-- BEGIN SKILL.md -->
---
name: new-page-app-chrome-checklist
description: Use at AI-DLC step 2/3 when a plan adds the shared app chrome (Header + Sidebar + Footer, via createState()/buildLogo()/buildMenu()/buildSidebar()/buildFooter()) to a new or existing HTML page — checklist for state consolidation, theme-aware CSS, mounting all three pieces together, and path-depth rewrites.
---

Mounting the shared chrome onto a page is a design decision, not just wiring — `buildSidebar()`
brings its own language and theme toggle switches "for free" (see
`tests/test-report-dashboard.js`'s AC-A3 comment), which can conflict with a page that already has
its own state. Before wiring the chrome in:

1. **Check for a pre-existing page-local i18n/theme mechanism first.** If the page already has its
   own lang toggle, `localStorage` key, or private state object, decide explicitly whether to fold
   it into the shared `createState()` (removing the page-local toggle so there is exactly one
   language/theme switch on the page, wired via `state.onLanguageChange`/`state.onThemeChange` the
   same way `menu.js`/`sidebar.js`/`footer.js` do) — do not add `buildSidebar()` next to an
   uncoordinated second toggle backed by a different store. Raise this explicitly at step 2/3 rather
   than assuming; it is a real design conflict, not a styling detail (confirmed at issue #548).

2. **Make the page's CSS theme-aware before or alongside adding the chrome.** Link
   `shared/tokens.css` and replace any hardcoded/private color palette with tokens that already flip
   under `[data-chloe-theme="dark"]`. Use the Home page's CSS as the reference for which token pairs
   already work, and prefer reusing a pair proven to flip correctly elsewhere (e.g.
   `--chloe-player-box-bg`/`--chloe-player-box-fg`) over inventing a new one — see
   `docs/knowledge-asset/published/theme-token-background-audit.md`.

3. **Mount the full set together — Header, Sidebar, Footer — not a subset**, unless the human
   explicitly scopes it down. There is no reusable global `buildHeader()`; compose it per-page from
   `buildLogo()` + `buildMenu()`, matching the existing per-page `-page.js` precedent (`about-page.js`,
   `tests/test-report-dashboard.js`, `reports/security/security-report-page.js`).

4. **Apply the path-depth rewrite for the page's actual location**, not the depth of whichever
   precedent you're copying from. Every prior chrome-mounting page sat one level below repo root
   (`pages/*.html`, `tests/test-report-dashboard.html`, using `"../"`); a page at a different depth
   (e.g. two levels down, `reports/security/`, needing `"../../"`) requires its own check — see
   `docs/knowledge-asset/published/root-relative-path-audit-for-nested-pages.md` for the full
   base-path-override pattern. Do not assume the depth; verify it from the page's actual path.
<!-- END SKILL.md -->
