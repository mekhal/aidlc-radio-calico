<!--
DEPRECATED 2026-08-21 (issue #432 close, per @mekhal's "ย้าย Knowledge ที่ทับซ้อนเข้า Deprecated"):
this content is now fully duplicated verbatim as a Hard rule directly in CLAUDE.md (the "missed
functionality becomes a NEW issue" bullet's exception clause for a related, already-sequenced
sibling ticket), which is always loaded every turn — keeping this as a separate published/ file
was redundant upkeep with no added coverage. See
docs/decisions/2026-08-21-issue-432-close-scores-and-followups.md.

Original scratch-draft note, kept for history:
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/cross-reference-out-of-scope-findings-on-related-tickets/SKILL.md
Surfaced while closing PR #102 (Ticket A, #99, parent story #98).
Decision record: docs/decisions/2026-07-17-cross-reference-out-of-scope-findings-on-related-tickets.md
-->
<!-- BEGIN SKILL.md -->
---
name: cross-reference-out-of-scope-findings-on-related-tickets
description: Use whenever a review/discussion on one ticket surfaces something out of scope for it — before defaulting to "open a new issue," check if a related, already-sequenced sibling ticket under the same parent story already owns that scope, and if so leave an untagged comment there instead.
---

When you find something out of scope for the ticket you're currently working (a review answer, a step-2/6 discussion, etc.):

1. Confirm it's genuinely out of scope for the current ticket's AC — don't fold it into the current loop ("missed functionality becomes a NEW issue" still applies as the default).
2. Check whether a related, already-sequenced ticket under the same parent story already owns that scope — look for a sequence noted in the parent issue (e.g. "Ticket A → B → C") or a "Related: #X" line in the current issue/PR body.
3. If such a ticket exists: post a **plain comment** on it describing the finding (what, why, where in the code/AC) — do **not** tag `@claude` in that comment. The human tags the agent themselves when they're ready to start that ticket's loop.
4. If no related ticket exists yet: fall back to the default rule and open a new issue instead.
5. Note in your current answer that you've cross-referenced the finding onto the downstream ticket (with a link), so there's a trail from where it was discovered.
<!-- END SKILL.md -->
