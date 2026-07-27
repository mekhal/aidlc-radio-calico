<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/check-deployed-entrypoint-vs-edited-file/SKILL.md
Surfaced while working issue #157 (Ticket C — index.html/album-promo.html drift caused a
"fix" to not appear live even though the edited file was correct).
Decision record: docs/decisions/2026-07-25-ticket-c-cdn-jsdelivr-swap-and-index-html-drift.md
-->
<!-- BEGIN SKILL.md -->
---
name: check-deployed-entrypoint-vs-edited-file
description: Use when a bug is reported as present live/deployed but the source file you're editing already looks correct — confirm which file the deployment target actually serves before re-checking (or re-fixing) the same file again.
---

When a human reports a bug that reproduces on the live/deployed site, but the file you'd expect to be
responsible for it already contains the correct code:

1. Identify what the deployment target actually serves as its entry point (e.g. GitHub Pages serves
   a specific branch/path's `index.html` by convention — check the Pages config, not just assume).
2. Check whether that served file is the *same* file you've been editing, or a differently-named
   sibling/duplicate (e.g. `index.html` vs. a feature-specific `album-promo.html` that both happen to
   load the same script/stylesheet). Projects that grew a page incrementally sometimes have more than
   one HTML entry point that were meant to stay identical but drifted once only one of them kept
   getting edited.
3. If a duplicate entry point exists, diff it directly against the file you've confirmed is correct,
   rather than re-inspecting the already-correct file a second time on a repeated bug report for the
   same symptom.
4. If drift is found and fixed, flag it as its own finding (not folded silently into the original
   fix) — the existence of a second, easily-forgotten entry point is worth a human decision on
   whether to consolidate it, independent of whatever specific line caused this particular bug.
<!-- END SKILL.md -->
