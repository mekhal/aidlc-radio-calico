<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/deprecated-file-removal-before-close/SKILL.md
Surfaced while closing issue #573 (unreferenced-file audit). @mekhal's close comment added
album-promo.html to the confirmed DELETE list — it's deprecated per issue #159 — but flagged that
album-promo.js/.css (same name stem) are NOT deprecated and stay live (index.html:20,75 load them
directly). The rule below exists to stop that file-vs-prefix conflation, and the other three
conditions it bundles, from being skipped on a future deletion.
Decision record: docs/decisions/2026-08-29-issue-573-close-scores-and-deprecated-asset-removal-skill.md
-->
<!-- BEGIN SKILL.md -->
---
name: deprecated-file-removal-before-close
description: Use before deleting a file marked deprecated (in a decision doc, a deprecation banner, or docs/knowledge-asset/deprecated/) — verifies deprecation is file-level not prefix-level, confirms no live deploy page still loads it, and checks what tests actually cover via their loader before removing the file and its tests.
---

A file marked deprecated should not stay in the working tree once its replacement/history is
captured in `docs/knowledge-asset/deprecated/` and `docs/decisions/` — keeping a dead file around
"just in case" is its own maintenance cost and misleads a future audit into re-discovering it.
But deleting on the deprecation label alone is unsafe: sibling files that merely share a name
stem are not automatically deprecated together, and grep-based reference checks can miss whether
a file is still actually loaded by a live page.

Before deleting any file because it (or its topic) is marked deprecated:

1. **Check file-level, not prefix-level.** A deprecation applies to the specific file named in the
   decision doc / banner, not to every file sharing its basename stem. Grounding case:
   `album-promo.html` was deprecated per issue #159, but `album-promo.js` and `album-promo.css`
   (same stem, different extensions) were not — `index.html:20` and `:75` load them live as
   `<link href>`/`<script src>`. Deleting all three because "album-promo is deprecated" would have
   broken the live page.
2. **Confirm no live deploy page still loads it.** Grep the actual deploy entry points
   (`index.html`, `pages/*.html`, and any other page shipped to users) for a `<script src>` or
   `<link href>` pointing at the file. A file having *no* inbound reference at all is a stronger
   signal than one having some non-loading mention (a code comment, a decision doc, a `usedIn`
   listing) — the latter still needs the load-path check, not just a reference count.
3. **Identify what `tests/` actually covers via the loader, not the test's filename.** Check
   `tests/test-runner.html`'s `<script src>` list (or the relevant `tests/load-*.js` helper) for
   which files a given test suite actually pulls in. A test file named after the deprecated file
   doesn't prove it tests that exact file — confirm the loader wiring before treating "has test
   coverage" as evidence either for keeping or for deleting.
4. **If any of the above is unclear, stop and ask the human before deleting.** Do not delete
   speculatively and let a follow-up issue catch the breakage — this check exists specifically to
   catch it before the deletion ships.

When a deletion clears all four checks, remove the file **and** its dedicated tests together, and
also remove any listing of it from config/manifest files that enumerate consumers (e.g. a
`usedIn` array) — do not leave a dangling reference to a file that no longer exists.
<!-- END SKILL.md -->
