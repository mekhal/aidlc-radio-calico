# Decision: Issue #529 ("What's this" page — center images, AI-DLC/Skill Capture cards → tables) closed at Instruction Fidelity 5 / Result Satisfaction 5

**Issue:** [#529](https://github.com/mekhal/aidlc-radio-calico/issues/529) — follow-up from
[#522](https://github.com/mekhal/aidlc-radio-calico/issues/522)'s close (the 3 remaining
complaints: uncentered diagram images, AI-DLC steps as cards, Skill Capture as cards)
**PR:** [#530](https://github.com/mekhal/aidlc-radio-calico/pull/530) (Code PR, Test PR waived —
image centering + both card-to-table conversions), merged to `develop`
**Decided by:** @mekhal, 2026-08-27

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 5, Result Satisfaction 5.** Per `CLAUDE.md`'s
   rule that the agent never self-scores. Logged in
   `ai-review-evals/2026-08-27_1010_issue-529_whats-this-center-and-tables-close.md`.

2. **Mid-review scope revision, made explicit before approval (not a post-approval override).**
   The original plan's AC3 kept the Skill Capture table at 2 rows (`firstTime`/`nextTime`), same
   shape as the cards it replaced. @mekhal's follow-up review comment
   ("Skill Capture ให้ใส่ Detail มากกว่านี้ ตามรายละเอียดในภาพ" — "add more detail to Skill
   Capture, per the details in the image") drove a revision to 5 rows (Capture / Distill / Store /
   Reuse / Evolve, matching the `skill-reuse-gates.png` diagram's own labeled stages), which
   changed `data/whats-this-content.json`'s `skillCapture` shape from `firstTime`/`nextTime` to a
   `stages` array. The agent flagged this openly as a scope change from the original AC4 ("no
   shape change") in the same review turn, before any approval — unlike #522's decision 3
   (a Hard-rule scope override applied *after* approval), this one was surfaced and settled at the
   review gate itself, which is exactly how `CLAUDE.md`'s "ask when in doubt" is meant to work.

3. **Approval arrived before 3 open sub-questions from that same review turn were explicitly
   answered.** The prior review turn asked @mekhal to confirm: (a) whether `skill-reuse-gates.png`
   was the referenced image, (b) the "Evolve" stage wording, and (c) who would draft the Thai
   translations. The next comment was `@claude approved waiver Test PR` — approving the gate, but
   not directly answering any of the three. The agent proceeded on its own most-recent proposal
   (5-stage table, its own drafted EN/TH copy) rather than pausing for a second review round, and
   explicitly flagged every one of those judgment calls in the Code PR turn's comment ("Notes on
   judgment calls made without a final explicit confirmation"). This turned out correct (5/5, no
   rework requested), but the *outcome* being good doesn't mean the *pattern* is safe to repeat
   silently next time — see decision 4.

4. **New skill proposed: `open-questions-survive-approval`.** Grounded in decision 3: when a review
   turn leaves specific sub-questions open and the next comment is a bare gate command (`approved`)
   that doesn't address them individually, don't treat silence as agreement on every open point.
   Proceed on the most recent proposal (since blocking entirely on unanswered sub-questions would
   stall the loop), but the very next comment must restate each unresolved question and the
   assumption made for it, in the same explicit way this turn did — so a human skimming only the
   final comment can still catch a wrong assumption before merge. Draft `SKILL.md` at
   `docs/knowledge-asset/published/open-questions-survive-approval.md`, pending @mekhal's
   add/update/skip decision (not yet copied into `.claude/skills/` per the write-guard workaround).

5. **Proposed as a Case Study showcase candidate.** Clean end-to-end loop: issue → review (with one
   substantive scope revision surfaced and resolved at the review gate, not after) → approved →
   Code PR → merged, 5/5 on both scores, no rework cycle. Proposed entry below, pending @mekhal's
   confirmation before writing to `data/case-studies.json` (per "Ask when in doubt" — not written
   unprompted).

## Why

Decision 2 exists to distinguish this issue's scope revision from #522's: this one happened at the
review gate (step 2/3), before the human approved anything, which is the loop working as designed;
#522's was a post-approval override of a Hard rule with no built-in exception clause. Conflating
the two in future retrospectives would misread this issue's history.

Decision 3/4 exist because a good outcome (5/5) can mask a risky pattern: approving a gate without
addressing every open sub-question from the prior turn, then having the agent quietly resolve them
on its own judgment, is only safe *because* the agent happened to flag every assumption explicitly
afterward. That flagging was itself a judgment call, not something `CLAUDE.md` currently requires
in so many words — publishing it as a skill makes it a durable expectation instead of something
that only happened to occur this time.

Decision 5 follows the same reasoning the showcase curation used for #245/#294 (both 5/5, clean
loops, no rework) — this issue fits that same bar, unlike #522 itself which was explicitly *not*
proposed at its own close due to real unresolved complaints behind a 4/3 score.

## Impact

- Issue #529 stays closed at its shipped scope (PR #530, merged) — no further code changes result
  from this close.
- `docs/knowledge-asset/published/open-questions-survive-approval.md` is a new file from this
  issue's own work, pending @mekhal's add/update/skip decision and, if added, a human copy into
  `.claude/skills/open-questions-survive-approval/SKILL.md`.
- `data/case-studies.json` left unchanged pending @mekhal's confirmation of the proposed entry
  below.

## Proposed Case Study entry (pending confirmation)

```json
{
  "issue": 529,
  "title": "Centering Fix + Cards-to-Table Conversion",
  "category": "Bug Fix",
  "problem": "Diagram images sat flush-left above 42rem instead of centered, and the AI-DLC/Skill Capture sections used card grids the human wanted as tables — surfaced as 3 follow-up complaints at #522's close.",
  "aiAction": "Traced the centering gap to a missing margin: 0 auto, reused an already theme-audited table pattern from about.js for both conversions, and — mid-review — expanded Skill Capture from 2 rows to a 5-stage table after the human asked for more detail matching the diagram, flagging the resulting data-shape change explicitly before approval.",
  "outcome": "Shipped via PR #530, merged to develop, no rework cycle. Instruction Fidelity 5 / Result Satisfaction 5.",
  "metrics": { "instructionFidelity": 5, "resultSatisfaction": 5 },
  "decisionDocUrl": "https://github.com/mekhal/aidlc-radio-calico/blob/develop/docs/decisions/2026-08-27-issue-529-close-scores-and-open-questions-skill.md",
  "evalUrl": "https://github.com/mekhal/aidlc-radio-calico/blob/develop/ai-review-evals/2026-08-27_1010_issue-529_whats-this-center-and-tables-close.md",
  "date": "2026-08-27"
}
```
