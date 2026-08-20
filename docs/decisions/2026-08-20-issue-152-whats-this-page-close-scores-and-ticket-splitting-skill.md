# Decision: Issue #152 (What's this page) closed at Instruction Fidelity 5 / Result Satisfaction 5; ticket-splitting-for-review captured as a new skill

**Issue:** [#152](https://github.com/mekhal/aidlc-radio-calico/issues/152) (parent story) — sub-issues [#402](https://github.com/mekhal/aidlc-radio-calico/issues/402) (scaffold + nav), [#403](https://github.com/mekhal/aidlc-radio-calico/issues/403) (Section 1), [#404](https://github.com/mekhal/aidlc-radio-calico/issues/404) (Section 2), [#405](https://github.com/mekhal/aidlc-radio-calico/issues/405) (Section 3)
**PR:** #406/#407 (Ticket 1) · #409 (Ticket 2) · #410 (Ticket 3) · #411 (Ticket 4) — all merged to `develop`
**Decided by:** @mekhal, 2026-08-20

## Decision

1. **Scores given directly at close:** Instruction Fidelity 5, Result Satisfaction 5 ("coding 5 satisfied 5"). Recorded as-is per `CLAUDE.md`'s rule that the agent never self-scores — same precedent as [[2026-08-04-issue-245-component-split-architecture-and-ticket-breakdown]] and [[2026-08-08-issue-294-close-scores-and-style-token-skill]].
2. **Parent story #152 closes now that all 4 sub-issue Code PRs are merged to `develop`** (#407, #409, #410, #411), matching the close condition set at #152's own plan-gate turn — the parent tracking issue closes once every sub-issue's code has landed, not once every sub-issue is individually closed (sub-issues #403 and #405 remain open at the time of this close; their own `@claude close` turns are separate, human-triggered actions on each sub-issue).
3. **New skill captured:** `split-story-into-review-sized-sub-issues` — the human's close instruction ("เก็บ skill แตก Ticket ให้ง่ายต่อการ Review ไว้ด้วย", i.e. "also capture the skill of splitting into tickets to make review easier") is read as approval to record, as a reusable skill, the corrected pattern this issue applied: split a multi-part story into native GitHub sub-issues (each running its own full 7-step loop) rather than sequential PRs on one issue, and confirm that mechanism explicitly with the human instead of inferring it from a short/ambiguous answer. Written directly to `docs/knowledge-asset/published/split-story-into-review-sized-sub-issues.md` — this folder is already treated as live/approved guidance per `CLAUDE.md`'s "Using a skill" section, not a draft awaiting a further copy step into `.claude/skills/`.

## Why

Decision 1 follows the same "never grade its own homework" principle already established in the `ai-review-evals` framework.

Decision 2 matters because #152 is a parent/tracking issue, not a normal single-loop issue — closing it on the literal `code merged` condition (rather than waiting for every sub-issue to also be individually closed, which is a separate human action per sub-issue) avoids blocking this close on actions that belong to other threads.

Decision 3 turns this issue's own success into a durable rule instead of a one-off outcome: #152 is the second time this exact split (parent story → native sub-issues, each an independent loop) was used, after [[2026-08-04-issue-245-component-split-architecture-and-ticket-breakdown]], and it directly corrects the mistake recorded in [[2026-08-18-issue-151-about-page-close-scores-and-followups]] — where a short ambiguous answer ("Sub ticket") was misread as "stay sequential on one issue" and only caught after 3 more tickets were built that way. #152 avoided repeating that mistake by asking the human explicitly which mechanism was meant (see #152's own `@claude review` turn, 2026-08-19T23:34) before locking the plan. The human's close-comment wording asked for exactly this lesson to be kept, so it is recorded directly rather than re-litigated as a separate add/skip question.

## Impact

- Issue #152 closes with its full scope shipped: `pages/whats-this.html` + `whats-this/` (scaffold, Section 1 "What is this?", Section 2 "The AI-DLC Loop", Section 3 "Skill Capture & Reuse"), all merged to `develop` across #407/#409/#410/#411.
- `docs/knowledge-asset/published/split-story-into-review-sized-sub-issues.md` is available for the agent to apply the next time a story issue's scope naturally breaks into multiple independently-reviewable deliverables.
- Sub-issues #403 and #405 remain open; closing them (their own decision docs/eval entries) is a separate, human-triggered action on each.
- **Case Study showcase:** proposed as a candidate (clean 4-ticket loop, all merged, 5/5 scores, and directly demonstrates the corrected ticket-splitting pattern) — not added to `data/case-studies.json` in this turn per [[2026-08-11-issue-203-case-study-data-source-and-ticket-breakdown]]'s "ask before adding" rule; left for the human to confirm.
