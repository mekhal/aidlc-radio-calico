<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/ac-conflict-lettered-options/SKILL.md
Surfaced while closing issue #155 (Ticket A). Validated across ~3 separate review rounds on that
thread (e.g. 2026-07-24T05:30 -> 05:41, and 07:59 -> 08:16): each time a request conflicted with a
locked AC, presenting the resolution paths as a labeled menu let the human answer with a short,
unambiguous pick ("1a... 3 confirmed... 4 apply strictly to X", "approved b") instead of prose
back-and-forth.
Decision record: docs/decisions/2026-07-24-ticket-a-album-promo-dynamic-rendering-and-ac-amendments.md,
docs/decisions/2026-07-24-ac6-cancelled-album-promo-becomes-homepage.md
-->
<!-- BEGIN SKILL.md -->
---
name: ac-conflict-lettered-options
description: Use when a human's review request conflicts with a locked Acceptance Criterion (or an earlier decision in the same thread) and there is more than one plausible way to resolve it — present the resolutions as a lettered/numbered menu instead of an open question, and wait for a specific pick before implementing.
---

When a request would reverse or conflict with an already-locked AC, don't just flag the conflict
and ask an open-ended "what did you mean?" — enumerate the concrete resolution paths as a short
lettered/numbered list (e.g. "(a) keep AC3, just restyle the icon group" / "(b) drop AC3's fixed
rail entirely"), and state your own default pick if the human just says `approved` with no
further detail. This lets the human resolve the ambiguity in one short reply (a bare letter or
number, optionally combined across several open points at once) instead of a prose round-trip.
Never implement until a specific option is chosen — a bare `approved` attached to a brand-new,
unplanned, and consequential request (with no live pending plan matching it) is not itself a pick;
ask which option before treating it as authorization.
<!-- END SKILL.md -->
