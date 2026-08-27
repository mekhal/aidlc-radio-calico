<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/shared-asset-reference-audit-before-delete/SKILL.md
Surfaced while closing issue #522 ("What's this" page — diagram image fixes). At the 2026-08-27T02:02
turn, @mekhal approved deleting code-pr-gates.jpg after it was removed from the whatIsThis section's
content. Before acting on that approval, the agent grepped the repo and found README.md/README.th.md
independently embed the same file for an unrelated purpose (the Step 6/7 Code PR Gates illustration),
so deleting it would have broken both READMEs. The approval was given without that context — the
original plan's open question had assumed the file would be orphaned without checking first.
Decision record: docs/decisions/2026-08-27-issue-522-close-scores-and-shared-asset-skill.md
-->
<!-- BEGIN SKILL.md -->
---
name: shared-asset-reference-audit-before-delete
description: Use before deleting any binary or shared asset (image, font, data file) that a content/data change makes look unused in the section you're editing — grep the whole repo for other references to that filename before removing it, since images and other binaries are commonly reused across unrelated docs/pages.
---

A content or data change (e.g. removing an `image` field from one section of a JSON-driven page)
can make an asset file look orphaned from the vantage point of the file you're editing, even
though it's still referenced elsewhere in the repo for an unrelated purpose. Binary assets in
particular (images, diagrams, fonts) are easy to reuse across docs/pages precisely because they
carry no import/require statement that a code search would normally catch — a plain-text grep for
the filename is the only reliable check.

Before deleting any asset file as part of a scoped removal:

1. Grep the entire repo for the filename (not just the module/section you're changing), e.g.
   `grep -rn "code-pr-gates.jpg" .` — check `README.md`/`README.th.md` and any other docs, not just
   app source, since Markdown `<img>`/`![]()` references won't show up in an app-code-only search.
2. If another, unrelated reference exists, do not delete the file as part of the current change.
   Keep it and only remove the reference from the section actually in scope; if the other reference
   also needs to change, that's a separate decision for whoever owns that other doc/page, not a
   silent side effect of the current ticket.
3. If asking a human to approve a deletion, surface what the grep found (or that none was found)
   as part of that approval request — an approval given without knowing about a second referrer
   isn't an informed one, even if the human never objects afterward.
<!-- END SKILL.md -->
