# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#522](https://github.com/mekhal/aidlc-radio-calico/issues/522) |
| PR | #524 (Code PR, Test PR waived), #526 (Code PR, Test PR waived) — both merged to `develop` |
| Date | 2026-08-27 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | @mekhal |

---

## Task

Close of issue #522 ("What's this" page — remove one diagram image, resize + recaption the other
two), a follow-up from #505/#509. Mid-loop, the human also approved expanding scope inside this
same issue to restructure `aidlcLoop.steps` from 6 to CLAUDE.md's actual 7 numbered loop steps and
add a `skillCapture.intro` paragraph. Covers Code PR #524 (original 3 image asks) and Code PR #526
(7-step loop expansion), both Test-PR-waived per the human's instruction.

---

## Original User Request

> @claude close
> coding 4
> satisfied 3
>
> เปิด Ticket ใหม่ โดยใช้รายละเอียดดังนี้
> 1. การปรับรูปภาพยังไม่ถูกปรับเป้น Center
> 2. เปลี่ยนรายละเอียด AI-DLC เป็นตารางแทน Card
> 3. เปลี่ยน Skill capture เป็นตารางแทน Card

Translated: "close, coding 4, satisfied 3 — open a new ticket with these details: 1. the resized
images still aren't centered, 2. change the AI-DLC step details to a table instead of cards, 3.
change Skill Capture to a table instead of cards."

---

## AI Decision

Recorded the scores verbatim (never self-scored). Filed the 3 new complaints as a new issue
instead of reopening #522's already-merged loop, per `CLAUDE.md`'s "missed functionality becomes a
NEW issue" rule — consistent with the human's own request to open a new ticket. Traced the
centering complaint to a specific line (`whats-this/whats-this.css:170-173`'s `.whats-this-image`
rule caps width but never centers). Formally recorded, as a decision doc, the mid-loop scope
override where the human directed a 7-step-loop content expansion to happen inside issue #522
itself rather than a new issue, despite the agent's own recommendation to split it out — since
that Hard rule (unlike the Test PR waiver) has no built-in override clause, this close makes the
override an explicit, durable decision record rather than something that only lived in an earlier
PR-body sentence. Proposed a new skill (`shared-asset-reference-audit-before-delete`), grounded in
this issue's own 2026-08-27T02:02 turn where a human-approved file deletion (`code-pr-gates.jpg`)
was caught as unsafe (shared with both READMEs) only because the agent grepped for other
referrers before acting, not because of any established check.

Suggested Keywords:

- scope split into new issue per human's own request
- root cause traced to a specific missing CSS rule (centering)
- prior mid-loop Hard-rule override formally captured as a decision doc
- proposed (not applied) skill candidate from a near-miss (asset deletion caught before it shipped)

---

## Decision Type

Suggested Keywords:

- scope/density judgment revisited post-ship (image sizing/centering)
- deferred decision-capture completed (Hard-rule override formalized at close, not at the time it happened)
- convention change proposed, not yet applied (cards → tables, deferred to new issue)

---

## Risk Level

Default

```
Medium
```

(Human may change later.)

---

## Instruction Fidelity (0–5)

- 4

---

## Result Satisfaction (0–5)

- 3

---

## Human Decision *(Optional)*

-

---

## Review Notes *(Optional)*

- The centering gap slipped through because the plan's AC2 only specified a width cap
  (`max-width: 42rem`), and the bundled test (`tests/whats-this/whats-this-image-width.test.js`)
  only asserts that CSS rule's source text exists — it doesn't (and structurally can't, being a
  source-text assertion rather than a rendered/computed-style check) catch a missing `margin: 0
  auto`. Worth considering, for future width-cap ACs, whether centering should be stated
  explicitly rather than assumed implied by "resize."
- The card-vs-table asks (AI-DLC steps, Skill Capture) are a visual/structural preference not
  previously specified in any plan for #505/#509/#522 — first surfaced at this close.

---

## Future Policy *(Optional)*

-

---

## Lessons Learned *(Optional)*

- A width-cap AC ("resize this image") should say explicitly whether centering is also expected,
  rather than leaving it implied — this is the second time in this issue's own lifetime that a
  CSS-only source-text test passed while the visual result still didn't match what the human
  wanted (the first being the original oversized-image bug this same issue was opened to fix).
- Catching a human-approved but actually-unsafe action (deleting a file another doc still
  references) before executing it, rather than after, is exactly the kind of near-miss worth
  turning into a checklist immediately rather than waiting for it to actually ship broken once
  (contrast with #509's root-relative-path bug, which shipped broken before the same lesson was
  learned).
