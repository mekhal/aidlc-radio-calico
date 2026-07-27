<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/reference-image-layout-diff-before-rework/SKILL.md
Surfaced while working issue #157 (Ticket C — RadioCalicoLayout.png reference request reopened
scope that had been explicitly cut earlier the same day).
Decision record: docs/decisions/2026-07-27-ticket-c-now-playing-layout-reference-image-rework.md
-->
<!-- BEGIN SKILL.md -->
---
name: reference-image-layout-diff-before-rework
description: Use when a human supplies a reference design/layout image and asks to match it — systematically diff the current implementation against the image into "already matches" / "needs a locked-AC change" / "new scope" before editing, instead of implementing directly from the image.
---

When asked to rework a UI to match a reference image (screenshot, mockup, competitor site capture):

1. Read the image and list every distinct element/behavior it shows.
2. Sort each one into three buckets by comparing against the current implementation and its locked
   AC history:
   - **Already matches** — no change needed, note it so the human knows it was checked.
   - **Requires changing a previously-locked AC or structural decision** (e.g. removing a wrapper
     element that a locked AC specifically asked for, changing a layout pattern that was explicitly
     approved earlier) — flag this distinctly, since matching the image would silently reverse a
     prior sign-off.
   - **Genuinely new scope** — elements/data with no existing hook, AC, or owning ticket anywhere in
     the project.
3. Before implementing, check whether any bucket-2 or bucket-3 item contradicts a decision made
   *earlier in the same thread*, not just older history — a reference image is strong new evidence,
   but a same-day reversal of an explicit prior instruction is still worth surfacing as a question
   rather than assumed, in either direction (reopening previously-cut scope, or cutting
   previously-approved scope).
4. Present the three buckets plainly and ask for confirmation on buckets 2 and 3 before touching code
   — implement only what's confirmed, not the literal image content on faith.
<!-- END SKILL.md -->
