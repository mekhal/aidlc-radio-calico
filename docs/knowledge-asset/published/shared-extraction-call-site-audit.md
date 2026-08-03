<!--
Per human decision on issue #253 (2026-08-03): this file is the permanent home for this skill —
kept in docs/knowledge-asset/published/ only. Per CLAUDE.md's "Using a skill" section, this
folder is already treated as live/approved guidance (not a draft awaiting a copy into
.claude/skills/), so no further human copy step is requested for this skill.
Surfaced while closing issue #253 (Ticket 1: extract shared/ from album-promo.js).
Decision record: docs/decisions/2026-08-03-issue-253-skill-stored-in-published-only.md
-->
<!-- BEGIN SKILL.md -->
---
name: shared-extraction-call-site-audit
description: Use at AI-DLC step 2/3 when planning to relocate code (functions/consts) into a shared module — grep every call site of the items being moved (not just the ones named in the draft AC) before finalizing the AC's export list, since non-obvious dependents (e.g. sibling functions that aren't themselves moving) can silently break if a moved constant isn't also exported.
---

When planning a "move X into shared/<file>.js" ticket:

1. Before finalizing the AC's export list, grep the whole codebase for every identifier the plan intends to move (not just the functions the issue body names) — include constants, not just functions.
2. For each moved identifier, check whether any function *staying behind* in the original file still references it. If so, either (a) export the identifier as a global from the shared module too, or (b) add an accessor function to the shared module — surface the choice to the human rather than picking silently, since it changes the shared module's public surface.
3. If the AC's wording claims something is "the X factory" or otherwise implies existing structure that isn't literally present in the code, flag the mismatch before relying on that wording — confirm with the human whether the AC means "wrap this as a new function" or "keep it as-is."

This is a plan-review step: run it in a `@claude review` turn, before code or tests are written.
<!-- END SKILL.md -->
