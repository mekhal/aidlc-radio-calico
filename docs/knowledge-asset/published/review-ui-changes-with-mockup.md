<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/review-ui-changes-with-mockup/SKILL.md
Surfaced while closing issue #209 (Recently Played Modal). Across that issue's `@claude review`
rounds, mockups (ASCII layout / before-after diagrams) were only produced when explicitly asked
for; at close, the human asked for this to become the default for any review touching a UI change.
Decision record: docs/decisions/2026-08-01-issue-209-recently-played-modal-design-and-review-mockups.md
-->
<!-- BEGIN SKILL.md -->
---
name: review-ui-changes-with-mockup
description: Use during a @claude review turn (or any review-only feedback in this repo) that discusses a UI/visual change — proactively include a mockup (ASCII layout, before/after diagram, or similar) instead of prose alone, without waiting for the human to ask for an example.
---

When a `@claude review` turn's answer proposes or discusses a change to layout, placement, styling,
or any other visually-observable UI behavior, include a simple mockup by default — an ASCII
before/after layout, a small diagram, or an equivalent text sketch of the relevant element in
context. Do this even if the human's comment didn't ask for an example.

Keep it proportionate: a one-line CSS tweak doesn't need a full-page diagram, but anything that
changes where an element sits, what it contains, or how it's laid out relative to its neighbors
should show that, not just describe it. This stays a `review`-gate deliverable — a mockup is not
code and does not get committed; nothing is implemented until the human replies `approved`.
<!-- END SKILL.md -->
