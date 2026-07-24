<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/fold-forward-stranded-branch-fix/SKILL.md
Surfaced while closing issue #155 (Ticket A). CLAUDE.md's existing hard rule (see
docs/decisions/2026-07-21-verify-close-step-branches-get-a-pr-opened.md) only requires flagging a
stranded branch (pushed, no PR ever opened). This thread went one step further twice
(2026-07-24T06:55, cherry-picking branch `-0646`'s commit forward; and folding `-0159`'s change
directly into a later branch's own commit at 03:39) and both times the small fix was recovered
with no data loss, rather than left to rot until a human noticed the flag.
-->
<!-- BEGIN SKILL.md -->
---
name: fold-forward-stranded-branch-fix
description: Use when the stranded-branch check (branch pushed, no PR ever opened) finds one — if the missing branch's diff is small and still applies cleanly, cherry-pick or re-apply it onto the current working branch before continuing, instead of only flagging it and leaving the fix stranded.
---

CLAUDE.md requires flagging any branch referenced earlier in the thread that was pushed but never
got a PR opened. Flagging alone leaves the confirmed, human-approved fix sitting unreachable on a
branch nobody will merge. When the stranded branch's diff is small (a text/style fix, not a large
feature) and still applies cleanly against the current branch's tip, cherry-pick it (or re-apply
the same change by hand if the cherry-pick conflicts) onto the branch you're already working on,
note in the PR description which stranded branch it recovers, and call out that the old branch is
now superseded and safe to leave alone. Still flag the gap itself (per the existing hard rule) —
folding the fix forward is in addition to flagging, not a replacement for it. Do not do this for
large/risky diffs without asking first — recovering a big unreviewed change silently is a bigger
risk than leaving it stranded and visible.
<!-- END SKILL.md -->
