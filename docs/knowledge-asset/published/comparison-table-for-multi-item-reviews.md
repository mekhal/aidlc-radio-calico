<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/comparison-table-for-multi-item-reviews/SKILL.md
Surfaced while closing issue #578 (app.js dead-code status confirmation). The first review turn
described each of app.js's 8 internal feature groups (nav bar, theme toggle, footer links, etc.) in
prose, one paragraph per group. @mekhal asked mid-thread for the same finding "ทำเป็นตาราง" (as a
table) instead, and confirmed satisfaction (5/5) with the table version at close.
Decision record: docs/decisions/2026-08-31-issue-578-close-scores-and-tabular-comparison-skill.md
-->
<!-- BEGIN SKILL.md -->
---
name: comparison-table-for-multi-item-reviews
description: Use when a review/close comment needs to present N items judged against the same set of criteria (dead-code-per-feature audits, before/after migrations, option tradeoffs) — a Markdown table with explicit columns lets a human scan and decide in one pass instead of parsing repeated prose paragraphs.
---

Prose that repeats the same shape once per item ("X is unused, replaced by Y, because Z. A is
unused, replaced by B, because C. ...") forces the reader to re-parse that shape on every paragraph
to extract the one or two facts they actually need to compare. Once a review is judging 3+ items
against the same fixed set of criteria, switch to a Markdown table instead.

When to use it:

- Auditing multiple files/functions for dead-code or deprecation status (item, status, what
  replaced it, why).
- Comparing options/tradeoffs the human needs to pick between (option, pros, cons,
  recommendation).
- Before/after migration summaries where each row is one migrated unit.

How to structure the table:

- One row per item, one column per criterion — keep the same columns for every row so the table is
  scannable top-to-bottom, not read cell-by-cell.
- Put the conclusion/verdict in its own column (e.g. "สถานะ production", "แทนที่ด้วย") rather than
  burying it inside a longer "reason" cell — the reader should be able to scan just that column
  first.
- Still include a one-line prose summary above or below the table for the overall verdict — the
  table replaces the per-item prose, not the top-level conclusion.
- Don't force a table when there are only 1–2 items, or when items don't share a common set of
  criteria — a table with mostly-empty or free-text cells is worse than a short paragraph.
<!-- END SKILL.md -->
