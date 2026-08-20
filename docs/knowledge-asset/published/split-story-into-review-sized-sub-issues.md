<!--
Per human decision on issue #152's close (2026-08-20, "เก็บ skill แตก Ticket ให้ง่ายต่อการ Review
ไว้ด้วย" — "also capture the skill of splitting into tickets to make review easier"): kept in
docs/knowledge-asset/published/ only, per CLAUDE.md's "Using a skill" section treating this folder
as live/approved guidance already, not a draft awaiting a copy into .claude/skills/.
Surfaced while closing issue #152 (What's this page) — the second time this pattern was used
correctly (after #245), directly correcting the #151 mistake where a short/ambiguous answer was
misread as "stay sequential on one issue."
Decision record: docs/decisions/2026-08-20-issue-152-whats-this-page-close-scores-and-ticket-splitting-skill.md
-->
<!-- BEGIN SKILL.md -->
---
name: split-story-into-review-sized-sub-issues
description: Use at AI-DLC step 2/3 when a story issue's scope naturally breaks into multiple independently-reviewable deliverables (e.g. a page's scaffold + N content sections) — split into ticket-sized native GitHub sub-issues, each running its own full 7-step loop, and confirm that mechanism explicitly with the human rather than inferring it from a short/ambiguous answer.
---

When a story's Acceptance Criteria covers more than one independently reviewable deliverable,
split it before locking the plan:

1. **Default to native GitHub sub-issues, not sequential Test/Code PRs on one issue.** Open one
   sub-issue per ticket (the `addSubIssue` GraphQL mutation — precedent: #245 → #253-258, #152 →
   #402-405), so each ticket runs its own independent 7-step AI-DLC loop (own Plan+AC gate, own
   Test PR, own Code PR, own human approval) instead of being a sub-unit inside one issue's loop.
   This keeps every PR reviewable in isolation and lets tickets progress in parallel instead of
   blocking on each other.
2. **Never infer the mechanism from a short or ambiguous answer — ask explicitly.** Issue #151
   read a two-word reply ("Sub ticket") as "stay sequential on this issue," when the human actually
   meant "open separate GitHub issues" — the wrong reading wasn't caught until 3 more tickets had
   already been built the sequential way (`docs/decisions/2026-08-18-issue-151-about-page-close-scores-and-followups.md`).
   Ask directly — "separate GitHub issues, or sequential Test/Code PRs on this one issue?" — any
   time the human's answer doesn't unambiguously name one of the two mechanisms, before opening any
   sub-issue or writing the plan for Ticket 2 onward.
3. **The parent issue stays open as a tracking issue until every sub-issue's Code PR has merged to
   `develop`** — not until every sub-issue is individually closed. Closing each sub-issue (its own
   decision doc + eval entry) is a separate, human-triggered `@claude close` action per sub-issue;
   the parent's own close step should not wait on those.
4. **Size tickets so each is independently reviewable**, typically: one ticket for scaffold/
   plumbing that the rest depend on, then one ticket per content section/component that can proceed
   once the scaffold ticket merges (e.g. #152: Ticket 1 scaffold+nav → Tickets 2-4 sections, each
   depending only on Ticket 1).

This is a specific application of `CLAUDE.md`'s "Split large work into multiple tickets" and
"Review-sized PRs" rules — this skill remembers not just *that* to split, but *how* (sub-issue
mechanism + dependency-aware sizing) and the explicit-confirmation step that issue #151 learned the
hard way.
<!-- END SKILL.md -->
