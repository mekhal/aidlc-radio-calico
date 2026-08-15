# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#360](https://github.com/mekhal/aidlc-radio-calico/issues/360) |
| PR | None for #360 itself (diagnose + split only). Child tickets: [#368](https://github.com/mekhal/aidlc-radio-calico/pull/368) (#362, merged), [#369](https://github.com/mekhal/aidlc-radio-calico/pull/369) (#363, merged), [#371](https://github.com/mekhal/aidlc-radio-calico/pull/371) (#364, merged), [#370](https://github.com/mekhal/aidlc-radio-calico/pull/370) (#365, merged), #366 (decision-only, no PR), [#372](https://github.com/mekhal/aidlc-radio-calico/pull/372)/[#373](https://github.com/mekhal/aidlc-radio-calico/pull/373) (#367, merged) |
| Date | 2026-08-15 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | @mekhal |

---

## Task

Diagnosed the 24 (turned out to be 25) test failures left after issue #354 fixed the suite-hang
bug, grouped them by root cause rather than by file, and split them into separately reviewable
GitHub issues — no fixing inside this ticket itself, per its own scoped AC.

---

## Original User Request

Turn 1 (issue body, agent-authored at #354's close): request to triage the remaining 24 failures,
citing two already-flagged-but-unaddressed items (sidebar base path, footer `©` encoding) and a
missing-timeout note, plus `@claude review`. Turns 2–4: `@claude review` three times, each with the
human supplying real suite output, correcting the agent's grouping/AC, and asking clarifying
questions the agent answered from source. Turn 5: `@claude approved`, with one inline correction
(Ticket 4(b): rewrite 2 assertions without `.not` rather than extending `tests/assert.js`). Turn 6
(this entry): `@claude close coding 5 satisfied 4 ... เทสสำเร็จแตะ 90% แล้ว ขอปิด Ticket ไว้เท่านี้
ก่อน เดี๋ยวกลับมา Review ที่เหลือใหม่` — scores given directly, pass rate now 90%, close this
ticket for now, will resume reviewing the rest later. This close comment was originally posted on
the wrong issue (#355) and relayed verbatim to #360 by a prior turn after the human confirmed the
mistake.

---

## AI Decision

1. Could not run the live suite in turn 1 due to sandboxed Bash permissions — rather than guessing
   at failures from static reads alone, explicitly flagged the blocker and asked the human to either
   paste real output or grant permissions, and clearly labeled what was confirmed (footer bug) vs.
   unconfirmed (sidebar) from static reading alone.
2. When the human's real data corrected the failure count (24 → 25) and one grouping call (sidebar
   *was* a real bug), the agent updated its own account rather than defending the original guess.
3. Re-verified all 7 root-cause groups against actual source before finalizing each draft of the
   plan, across three rounds of human correction — including catching, via the mandatory
   `origin/develop` sync-check, a stale checkout that would have made the agent wrongly contest one
   of the human's corrections (Ticket 2's timer-format expectation).
4. Split into 6 tickets (not the original 4) as the human's corrections revealed unrelated root
   causes (structural double-injection vs. simple leak; stale test vs. code bug; missing matcher vs.
   stale fixture; doc-content suite's ownership) — reviewability over ticket-count minimization.
5. Did not embed a live `@claude` trigger in any of the 6 newly-opened tickets — same convention as
   #354's close — leaving it to the human to start each one's own loop.
6. On this close turn, processed a close comment that had been relayed from a different issue
   (#355) rather than authored fresh here — used it as-is (same scores, same request) instead of
   asking the human to re-post, since the relay had already been explicitly confirmed correct by the
   human on #355.

Suggested Keywords:

- ask-before-guessing (blocked on Bash permissions, asked rather than proceeding on static reads
  alone)
- self-correct-on-human-data (updated failure count and grouping once real output arrived)
- sync-check-catches-stale-checkout-mid-argument (issue #106 pattern, caught mid-verification)
- ticket-split-grows-with-evidence (4 → 6 tickets as distinct root causes surfaced)
- no-embedded-trigger-in-spawned-tickets (matches #354's close convention)
- misdirected-close-comment-relay (processed a comment relayed from a different issue, verbatim)

---

## Decision Type

**Diagnosis + ticket-split ticket (no code/tests of its own), with a cross-issue misdirected-close
recovery.**

Suggested Keywords:

- diagnose-and-split, zero code changes in the parent ticket itself
- multiple correction rounds from the human, each verified against source before acceptance
- cross-issue close-comment relay (originated on #355, confirmed and relayed to #360)

---

## Risk Level

Default

```
Medium
```

(Human may change later.)

---

## Instruction Fidelity (0–5)

```
5
```

(Score given directly by @mekhal in the close trigger: "coding 5".)

---

## Result Satisfaction (0–5)

```
4
```

(Score given directly by @mekhal in the close trigger: "satisfied 4". No reason attached; the
accompanying note — "เดี๋ยวกลับมา Review ที่เหลือใหม่", will come back to review the rest later —
suggests the 4 may reflect that downstream review is still open, not a specific complaint about
this ticket's own diagnosis/split work.)

---

## Human Decision *(Optional)*

- Close #360 now; all 6 spawned tickets (#362–#367) are already closed (90% pass rate). Human will
  return to review "the rest" later — scope of that follow-up not yet specified.

---

## Review Notes *(Optional)*

-

---

## Future Policy *(Optional)*

Examples

- Always Auto
- Auto with Review
- Human Review
- Human Only

---

## Lessons Learned *(Optional)*

- The misdirected-close-comment pattern (content posted on an issue whose subject doesn't match)
  had no existing skill in `docs/knowledge-asset/published/` — the agent on #355 paused and asked
  rather than guessing, which is the right default, but the recovery mechanic (relay verbatim to the
  correct issue rather than paraphrase) isn't yet codified anywhere. Flagged as a new-skill
  candidate at this close (see close comment).
