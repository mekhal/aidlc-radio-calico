# Issue #569 (restore Contact form label color to `--chloe-ink`) close — scored coding 5 / satisfied 5

**Issue:** [#569](https://github.com/mekhal/aidlc-radio-calico/issues/569) — Contact page field
labels showed `--chloe-mint-deep` instead of `--chloe-ink`, regressed by a manual `main → develop`
merge (commit `26d6f73`) that silently undid PR #566's revert. Filed as a follow-up to
[#546](https://github.com/mekhal/aidlc-radio-calico/issues/546) per its close decision (see
`docs/decisions/2026-08-29-issue-546-close-scores-and-merge-regression-followup.md`).
**PR:** [#571](https://github.com/mekhal/aidlc-radio-calico/pull/571) (Code PR, Test PR waived —
merged to `develop`)
**Decided by:** @mekhal, 2026-08-29

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 5, Result Satisfaction 5.** Per `CLAUDE.md`'s
   rule that the agent never self-scores; the human supplied them directly in the close comment
   ("coding 5", "satisfied 5"). Logged in
   `ai-review-evals/2026-08-29_1631_issue-569_contact-label-ink-restore-close.md`.

2. **Test PR waived at step 3, scope narrowed at step 6 via a plain cross-reference (not a new
   issue).** The human's first trigger ("remove all color check unit test") conflicted with this
   issue's own AC #2/#3 (which asked to *fix*, not delete, the contradicting assertion in
   `tests/contact/contact-theme.test.js`). Rather than guess, the agent asked for clarification
   (see `docs/decisions/2026-07-20-review-before-over-implementing.md`); the human then directed
   that work to the already-existing [#542](https://github.com/mekhal/aidlc-radio-calico/issues/542)
   instead, and confirmed the Test PR waiver for #569 itself. The agent posted an untracked,
   untagged cross-reference comment on #542 per `CLAUDE.md`'s downstream-ticket rule, then shipped
   #569 as a single-line CSS fix (`contact/contact.css`'s `.chloe-contact-form .form-label` back to
   `var(--chloe-ink)`), verified by `tests/theme-mint-deep.test.js`'s existing assertion (which was
   failing pre-fix and passes post-fix) rather than by a new/fixed test in the waived Test PR.

3. **New-skill candidate proposed, pending @mekhal's add/skip decision** (draft below): when an
   issue's own Code PR count exceeds 3 within one loop, proactively suggest opening a new ticket
   instead of continuing to iterate on the same issue. This is the human's own suggestion, made
   directly in the close comment ("เสนอให้ Developer สร้าง Ticket ใหม่ถ้า มีการ Loop เยอะเกินไป
   (Code PR เกิน 3 ครั้ง)" — "suggest the Developer create a new Ticket if there are too many loops
   (Code PR exceeds 3 times)"), prompted by the #546→#569 chain visible in the attached screenshot
   (#546 alone shipped a Test PR, a Code PR, and five post-ship follow-up PRs before its own
   close). #569 itself only needed one Code PR (#571), so the trigger condition didn't fire here,
   but the human wants the threshold enforced going forward.

4. **Not proposed as a Case Study showcase candidate.** The underlying regression this issue fixed
   originated in a human-only git operation (a manual merge), not a clean agent-authored loop from
   request to fix — not the illustrative "AI-DLC loop end-to-end" example the showcase curation
   calls for, even though this issue's own loop scored 5/5.

## Draft skill candidate (for @mekhal to decide: add / update / skip)

```markdown
---
name: flag-excessive-code-pr-loop-count
description: Use when an issue's own loop reaches its 4th Code PR (3 Code PRs already opened/merged on the same issue, about to open a 4th) — pause and propose to the human that the remaining work be split into a new ticket instead of continuing to iterate on the current issue, rather than opening the additional PR unprompted.
---

Track how many Code PRs (step 6) an issue's own loop has produced, including post-ship follow-up
Code PRs commented back onto the same issue/PR thread. When a 4th Code PR would be needed (3 are
already open/merged for this issue), stop before implementing it and ask the human: continue
iterating on this issue, or open a new ticket for the remaining scope? Present this as a question,
not a unilateral split — the human may have a good reason to keep iterating (e.g. a single
stubborn CSS regression that's nearly done). This complements, but is distinct from,
`split-story-into-review-sized-sub-issues` (which splits large *upfront* scope into review-sized
tickets before any PR is opened) — this skill instead watches loop *count* accumulating after the
fact, which is what a human notices as "too many rounds on one issue" (e.g. #546's Test PR + Code
PR + five follow-up PRs before close).
```

## Why

Decision 2 exists because the agent's clarifying question (rather than guessing which reading of
"remove all color check unit test" was meant) avoided either violating this issue's own written AC
or silently deleting test coverage the human might still have wanted — asking cost one extra round
but produced a scope the human explicitly confirmed twice (waiver, then cross-reference target).

Decision 3 exists because the human is naming a general process gap (unbounded Code PR loops on a
single issue) discovered from the #546 chain, not asking for anything on #569 itself (#569 only had
one Code PR) — recording it as a skill candidate is how `CLAUDE.md`'s "distill recurring decisions
into skills" step is supposed to work, even when the triggering issue itself didn't hit the
threshold.

## Impact

- Issue #569 closes at its shipped scope (PR #571, merged to `develop`). AC #1, #3, #4 verified via
  `tests/theme-mint-deep.test.js`; AC #2 (fixing the contradicting assertion in
  `tests/contact/contact-theme.test.js`) intentionally left to #542's own loop, cross-referenced
  there already.
- One new-skill candidate (`flag-excessive-code-pr-loop-count`) drafted above, pending @mekhal's
  decision; not yet added to `.claude/skills/` (write-guard workaround — a human must create that
  file).
- `data/case-studies.json` left unchanged.
