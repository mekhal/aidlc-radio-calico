<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/root-relative-path-audit-for-nested-pages/SKILL.md
Surfaced while closing issue #509 (What's this page — Ticket 2: diagram images). The Code PR
(#515) added a new repo-root-relative `image.src` path rendered from `pages/whats-this.html` (one
directory below repo root) and it 404'd on GitHub Pages until @mekhal reported it, requiring a
follow-up fix (PR #517). This is the 4th time the same bug class has shipped — see
docs/decisions/2026-08-10-issue-299-repo-relative-path-base-path-pattern.md, which documented the
fix pattern after the 3rd occurrence (#101, #253, #299) and explicitly flagged itself as a skill
candidate that was never published.
Decision record: docs/decisions/2026-08-26-issue-509-ticket2-close-scores-and-path-audit-skill.md
-->
<!-- BEGIN SKILL.md -->
---
name: root-relative-path-audit-for-nested-pages
description: Use when implementing (or reviewing) a Code PR that adds or changes any repo-root-relative asset path (img src, fetch() URL, link href) rendered from an HTML page — check whether that page lives below the repo root (e.g. under pages/) and apply the base-path-override pattern before merging, instead of relying on unit tests to catch it.
---

A path written as root-relative (e.g. `"aidlc-loop-gates.jpg"`, `"data/foo.json"`) only resolves
correctly from a page at the exact directory depth its author had in mind. It silently breaks for
any other page that loads the same script/data at a different depth — most commonly anything under
`pages/`, which sits one level below repo root. Unit tests built on jsdom-style mocked DOM do not
catch this: they don't exercise real relative-URL resolution by page depth, so a test suite can be
fully green while the path 404s on the actual deployed site.

Before merging any change that introduces a new root-relative asset path:

1. Identify every page (`pages/*.html`, `tests/*.html`, or any future subfolder) from which the
   changed module/data can be rendered, not just the page you're actively working on.
2. If any of those pages sit below repo root, rewrite the path immediately — do not ship it
   root-relative and unrewritten. Two established patterns already exist in this codebase;
   match whichever one the surrounding code already uses rather than inventing a third:
   - **Shared module used by many pages** — a page-overridable base path constant, defaulting to
     `""` (unchanged behavior at root): `var MODULE_BASE_PATH = window.__MODULE_BASE_PATH__ || "";`,
     prefixing only root-relative paths, with the override set in each nested page *before* the
     module's `<script>` tag loads (`window.__<ModuleName>_BASE_PATH__`). See
     `docs/decisions/2026-08-10-issue-299-repo-relative-path-base-path-pattern.md`
     (`window.__ALBUM_PROMO_I18N_BASE_PATH__` in `shared/translations.js`/#253,
     `window.__SIDEBAR_BASE_PATH__` in `sidebar/sidebar.js`/#299 — `window.__I18N_BASE_PATH__` in
     `app.js`/#101 was a third example of this pattern until app.js was deleted as dead code, #585).
   - **Per-page chrome built by that page's own `-page.js` init script** (e.g. the logo/nav
     rewrite already in `about-page.js`'s and `whats-this-page.js`'s `buildHeader()`) — a
     page-level rewrite applied right after the element is built/mounted, prefixing with `"../"`.
     Any new per-page element with a root-relative asset path (e.g. a content-driven image) should
     get the same treatment in the *same* Code PR that introduces it, not as a follow-up once it
     404s — this is what issue #509 missed: `buildSectionImage()`'s new `image.src` shipped with
     no rewrite of either kind until a follow-up PR (#517) added one after the bug was reported.
3. Because unit tests won't catch a page-depth path bug, explicitly note in the Code PR
   description which pages the new path was checked against, or ask the human to spot-check the
   live/deployed page before merging.
<!-- END SKILL.md -->
