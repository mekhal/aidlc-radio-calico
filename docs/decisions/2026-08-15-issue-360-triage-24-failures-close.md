# Issue #360 close — Triage the 24 (actually 25) remaining test failures

## Context

Issue #360 was the explicit follow-up ticket requested at #354's close: with the test suite now
running to completion (88% pass rate at #354's close), 24 individual test failures were still
unaddressed and needed their own diagnosis — a new, separate root-cause investigation per the
repo's "missed functionality becomes a NEW issue" rule.

The loop ran across several turns:

1. Step 2 review (turn 1): could not execute the live suite (no Bash permission for a static
   server/headless browser in that session) — read source statically instead. Confirmed the
   `footer.test.js` `©` mismatch as a real bug; could not confirm/deny the sidebar base-path item
   without runtime output. Asked the human to either paste the real failure list or grant Bash
   permissions.
2. Step 2 review (turn 2): @mekhal ran the suite locally and pasted the actual result —
   **174/199 passed, 25 failing** (not 24), grouped into 7 root-cause groups (A–G) with real error
   text. Corrected the agent's own turn-1 read of the sidebar item (it *was* a real bug, just a
   different test case than the one inspected).
3. Step 2 review (turn 3): agent validated all 7 groups against source on the current `develop` tip
   and proposed a first draft 4-ticket split.
4. Step 2 review (turn 4): @mekhal corrected 4 points after re-reading the draft (Ticket 1 needed to
   cover a structural double-injection bug, not just a global leak; Ticket 2's assumed target format
   was wrong — the human had deliberately removed the `" / "` separator, so the test itself is
   stale; Ticket 4 split the real missing-matcker cause `.not` vs. a stale expected-link-count; and
   a new Ticket 5 was requested for a doc-content test suite's long-term home). Agent verified each
   correction against source — during which the mandatory `origin/develop` sync check caught a
   stale checkout that would have made the agent wrongly contest correction 3.
5. `@claude approved` (turn 5): opened all 6 tickets (#362–#367) from the approved plan, applying
   the human's Ticket 4(b) clarification (rewrite 2 assertions without `.not`, don't extend
   `tests/assert.js` yet). No Test/Code PR opened for #360 itself — its own AC was "diagnose +
   split," not "fix."
6. All 6 spawned tickets ran their own independent AI-DLC loops and are now closed: #362 → PR #368
   (merged), #363 → PR #369 (merged), #364 → PR #371 (merged), #365 → PR #370 (merged), #366 →
   decision-only close (kept `skills-storage-in-repo.test.js` as-is, no code change), #367 → PR #372
   (superseded) / #373 (merged).
7. `@claude close coding 5 satisfied 4 ... เทสสำเร็จแตะ 90% แล้ว ขอปิด Ticket ไว้เท่านี้ก่อน
   เดี๋ยวกลับมา Review ที่เหลือใหม่` — originally posted on the wrong issue (#355), a Task ticket
   about the weekly JS-lint cron with no connection to this test-triage work. The agent on #355
   paused instead of processing it (content didn't match #355's subject), the human confirmed the
   mistake, and the agent relayed the comment **verbatim** to #360 (this issue) rather than
   summarizing or re-deriving it, preserving the original screenshot and scores for this issue's own
   close pipeline. This entry processes that relayed comment.

## Decision

1. **The actual failure count was 25, not 24** — the issue title's number came from an unverified
   screenshot at #354's close; the agent corrected this once real data was available rather than
   forcing the split to match the original title.
2. **6 tickets, not 4** — the split grew from the human's step-2 corrections (turn 4), each
   correction changing either the AC's precision (Ticket 1's structural fix) or the ticket's
   existence (Ticket 5 split out from what would have been folded into Ticket 1, Ticket 6 kept
   separate and explicitly low-priority per the human's "ไม่เร่ง" note).
3. **#360 itself never had a Test/Code PR** — its own deliverable was the diagnosis + the split,
   which is what step 2's plan committed to and what the human's later "diagnose + split, not fix
   here" answer confirmed. All fixing happened in the 6 child tickets' own independent loops.
4. **All 6 child tickets are closed** (5 with merged code PRs, 1 — #366 — as a keep-as-is decision
   with no code change) — pass rate rose from 88% to 90% per @mekhal's screenshot at this close.
5. **Misdirected close comment handled by pause-then-relay, not by silent reprocessing.** When
   @mekhal's close comment landed on #355 (a Task ticket about JS-lint cron re-verification) instead
   of #360, the agent on #355 recognized the mismatch and stopped rather than guessing which issue
   it "really" meant. Once confirmed, the comment was relayed verbatim (not rewritten) to #360, so
   this issue's own close-time record has the original text and screenshot, not a paraphrase.
6. **Scores given directly**: Instruction Fidelity 5, Result Satisfaction 4 (`coding 5 satisfied 4`
   in the close trigger) — no reason attached; @mekhal's note ("เดี๋ยวกลับมา Review ที่เหลือใหม่" —
   will come back to review the rest later) suggests review of the underlying fixes/PRs is ongoing
   independent of this ticket's own close.

## Non-decision

Whether any further work remains on the 6 child tickets' own fixes is explicitly left open — the
human said they'll come back to review "the rest" later; this close only concludes #360's own scope
(diagnose the 25 failures, split into tickets), not a claim that every downstream fix has been fully
re-reviewed.
