<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/propose-test-pr-waiver-for-pure-cleanup-issues/SKILL.md
Surfaced while closing issue #579.
Decision record: docs/decisions/2026-09-01-issue-579-close-scores-and-test-pr-waiver-skill.md
-->
<!-- BEGIN SKILL.md -->
---
name: propose-test-pr-waiver-for-pure-cleanup-issues
description: Use at AI-DLC step 3 when an issue's entire Acceptance Criteria is file deletion/removal with no new runtime logic — proactively propose waiving the Test PR instead of defaulting to writing existence-check tests, and wait for the human's explicit answer.
---

When an issue's AC is pure removal (delete N confirmed files, strip stale references, no new
logic to unit-test), do not default to step 4's literal "write failing tests first." Existence
tests for a deletion are technically writable (e.g. `fetch(file)` returns 404) but add process
overhead a human may not want for a clean-up ticket. At step 3 (posting the plan), explicitly
flag the issue as a Test-PR-waiver candidate under CLAUDE.md step 3's carve-out, and wait for the
human's explicit answer before skipping — never skip silently, and never write the tests silently
either just because the issue reads as "task-like."

If a later `@claude approved` reply is ambiguous about which step it means, that's a separate,
already-covered check (see `gate-trigger-vs-intent-mismatch`) — this skill is about not creating
that ambiguity in the first place for this issue shape.

Grounding case: issue #579 (delete 4 confirmed-unreferenced files + one config edit). The step-3
plan did not flag it as a waiver candidate; `@claude approved Test PR` was read literally, producing
a real Test PR (#587) with existence-check tests. The human then had to correct course mid-thread
("remove unuse ... not create test"), close #587 by hand, and re-approve as a direct Code PR
(#588). Close-comment feedback: "ไม่ควรใส่ Unit Test ใน issue Clean up (ควรถามก่อนถ้าไม่แน่ใจ)" — don't
add unit tests in a Clean-up issue; ask first if unsure.
<!-- END SKILL.md -->
