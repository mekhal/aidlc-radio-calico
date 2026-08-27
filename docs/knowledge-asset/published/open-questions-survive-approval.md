<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/open-questions-survive-approval/SKILL.md
Surfaced while closing issue #529 — a review turn left 3 sub-questions open (which reference
image, exact wording, translation authorship); the next comment was a bare `@claude approved
waiver Test PR` that didn't individually answer any of them. The agent proceeded on its own
most-recent proposal and disclosed every resulting assumption in the Code PR turn. Outcome was
Instruction Fidelity 5 / Result Satisfaction 5, but the good score doesn't by itself prove the
pattern is safe to repeat unreflectively — see the reasoning in the decision doc.
Decision record: docs/decisions/2026-08-27-issue-529-close-scores-and-open-questions-skill.md
-->
<!-- BEGIN SKILL.md -->
---
name: open-questions-survive-approval
description: Use when a prior review turn left specific sub-questions open and the human's next comment is a bare gate command (e.g. `@claude approved`) that doesn't individually answer them — don't treat the approval as silent agreement on every open point.
---

If a review turn ends with explicit open questions (e.g. "which of these did you mean?", "confirm
this wording", "who drafts X?") and the next comment only issues a gate command without addressing
them one by one, do not treat the gate as resolving every question. Proceed on the most recent
proposal on the table (blocking entirely would stall the loop for a decision the human may
genuinely just be delegating), but in the very next comment restate each unresolved question
alongside the assumption made for it, as plainly as if it were still an open item — so a human
skimming only that comment can still catch a wrong assumption before merge. Never silently fold an
unanswered question into "approved" without that disclosure.
<!-- END SKILL.md -->
