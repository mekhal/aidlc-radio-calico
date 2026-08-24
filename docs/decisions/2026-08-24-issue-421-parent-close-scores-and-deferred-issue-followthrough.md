# Issue #421 (parent: Sleep Timer / Audio Quality / Share) closed at Instruction Fidelity 5 / Result Satisfaction 5; deferred out-of-scope issue finally opened at close; new skill proposed on following through on blocked actions

**Issue:** [#421](https://github.com/mekhal/aidlc-radio-calico/issues/421) (parent story) — sub-issues [#446](https://github.com/mekhal/aidlc-radio-calico/issues/446) (Ticket 0: Shell), [#447](https://github.com/mekhal/aidlc-radio-calico/issues/447) (Ticket 1: Sleep Timer), [#448](https://github.com/mekhal/aidlc-radio-calico/issues/448) (Ticket 2: Audio Quality), [#449](https://github.com/mekhal/aidlc-radio-calico/issues/449) (Ticket 3: Share)
**PR:** #450/#452/#454 (Ticket 0) · #457/#458, #460, #462/#463 (Ticket 1) · #467/#468 (Ticket 2) · #471/#472, #474, #476/#477, #479 (Ticket 3) — all merged to `develop`
**Decided by:** @mekhal, 2026-08-24

## Decision

1. **Scores given directly at close: Instruction Fidelity 5, Result Satisfaction 5** ("coding 5 satisfied 5"), recorded verbatim per `CLAUDE.md`'s rule that the agent never self-scores — same precedent as [[2026-08-20-issue-152-whats-this-page-close-scores-and-ticket-splitting-skill]]. This scores #421's own parent-thread work (the seven `@claude review` rounds of context-gathering/scope-negotiation, the plan lock, and the native-sub-issue split) — distinct from each sub-issue's own close score, already recorded separately (#446: IF4/RS3, #447: IF4/RS5, #448: IF5/RS5, #449: IF5/RS5).

2. **Parent story #421 closes now that all 4 sub-issues are both individually closed and their code merged to `develop`** — unlike #152's parent close (where #403/#405 were still open at close time), here every sub-issue's own `@claude close` had already run before this turn, so there is no unresolved-sibling caveat to record.

3. **Opened the deferred "resync to live edge" bug as [#482](https://github.com/mekhal/aidlc-radio-calico/issues/482) during this close step**, rather than leaving it as a standing ask to @mekhal. This bug was found during #421's own review (2026-08-21), confirmed three separate times across the thread as "open it as a new issue" (2026-08-22T00:09, 2026-08-22T00:15, 2026-08-24 close), but every prior attempt to actually open it hit a sandboxed `gh`/API block and was punted back to the human instead of being retried. By the 2026-08-23T14:36 turn the agent successfully used the GitHub Issues REST API to open four sub-issues (#446-449) — proving the capability had returned — but did not circle back to open the still-pending #482 at that same moment. This close step retried the same action and it succeeded on the first attempt, meaning the block was never a hard/permanent limitation for this action, only a transient one that went unretried for two days.

4. **New skill proposed** — `retry-deferred-action-when-capability-returns` — see "Adding a skill" section below.

5. **Case Study showcase** — proposed as a candidate (see "Impact"), not added unprompted, per [[2026-08-11-issue-203-case-study-data-source-and-ticket-breakdown]].

## Why

Decision 1 follows the "never grade its own homework" principle already established in the `ai-review-evals` framework; recording it against the parent thread specifically (not averaged across sub-issues) matches how #152 handled the same parent/sub-issue split.

Decision 3 matters on its own, independent of the skill: leaving a confirmed, agreed-upon bug report unopened for two days after the capability to open it was demonstrated elsewhere in the same thread is exactly the kind of drop that erodes trust in "I'll open this for you" commitments. Since `CLAUDE.md`'s "Missed functionality becomes a NEW issue" rule doesn't name issue-creation as human-only (only `develop`→`main` merges and approvals are explicitly human-only), and the agent had already exercised issue-creation successfully in this same thread, there was no remaining reason to keep treating it as blocked.

Decision 4 turns the concrete miss in Decision 3 into a durable rule: when a needed action is deferred because a *tool* is blocked in that specific run (not because the action is inherently out of the agent's remit), the deferral should be re-attempted the next time the agent has a turn with working tools for that action-type — rather than left open indefinitely on the assumption a human will pick it up. This is a different failure mode than `[[2026-08-24-issue-446-ticket0-close-scores-and-bilingual-default-skill]]`'s "skill proposed but never adopted" gap — that one is about a *decision* recorded but not applied to future behavior; this one is about a *concrete action* (open this specific issue) promised but not retried once unblocked.

## Adding a skill

**Candidate: `retry-deferred-action-when-capability-returns`**

```markdown
---
name: retry-deferred-action-when-capability-returns
description: Use when an agent turn defers an action (e.g. opening an issue) because a tool was sandbox-blocked in that run — check whether the same action-type has since succeeded in a later turn on the same thread, and if so, perform the deferred action immediately instead of leaving it as a standing ask to the human.
---

When a turn cannot complete an action because a specific tool is blocked in that sandbox run
(e.g. `gh issue create`, `WebFetch`, `curl`), and the action itself is not inherently human-only
under `CLAUDE.md` (only `develop`→`main` merges and approvals are explicitly human-only), do not
treat the deferral as permanent. At the next turn where the same action-type is attempted and
succeeds — even for an unrelated purpose (e.g. opening sub-issues via the GitHub API) — check
whether any earlier deferred action of that same type is still outstanding on the thread, and
perform it then, rather than waiting for the human to notice and do it themselves. At minimum,
re-check at the `@claude close` step, since that is the last turn on the thread before it stops
being actively monitored.
```

## Impact

- Issue #421 closes with its full scope shipped: Ticket 0 (Shell, ⋮ button + nested bilingual sub-menu), Ticket 1 (Sleep Timer, continuous countdown independent of play/pause/quality), Ticket 2 (Audio Quality, real `hls.currentLevel` switching), Ticket 3 (Share, Copy Link modal) — all four sub-issues closed and merged to `develop`.
- New issue [#482](https://github.com/mekhal/aidlc-radio-calico/issues/482) opened for the resync-to-live-edge bug, no longer stranded as an unfulfilled promise in #421's thread.
- One new skill candidate (`retry-deferred-action-when-capability-returns`) proposed for @mekhal to decide (add/update/skip) — drafted in this turn's comment per the write-guard workaround, not yet copied into `.claude/skills/`.
- **Case Study showcase:** proposed as a candidate — a complex multi-feature request (3 independent features sharing one UI shell) correctly split into 4 review-sized native sub-issues only after explicitly confirming the split mechanism (avoiding the #151 mistake, same discipline as #152), with every open implementation question (HLS multi-bitrate, Share fallback shape, Sleep Timer pause/resume behavior) resolved by the human before code was written on the more complex tickets (#448, #449). Caveat: individual sub-issue scores vary (#446 landed 4/3 after repeated UI-fix rounds), so this is more "correct process under a messy, scope-creeping request" than a uniformly clean example — left for @mekhal to weigh against the bar set by #245/#294/#158, not added to `data/case-studies.json` in this turn.
