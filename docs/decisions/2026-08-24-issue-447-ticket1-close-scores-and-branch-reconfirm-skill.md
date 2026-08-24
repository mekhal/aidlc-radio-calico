# Issue #447 (Ticket 1: Sleep Timer) close — scored coding 4 / satisfied 5, branch-reconfirm skill proposed

## Context

Issue #447 ("Ticket 1: Sleep Timer", sub-issue of #421) shipped the Sleep Timer Countdown Panel
(AC1–AC6) on top of Ticket 0's menu shell (#446). The loop ran through two full Test PR → Code PR
cycles on the same AC3 clause:

1. **[PR #457](https://github.com/mekhal/aidlc-radio-calico/pull/457)** (Test PR) →
   **[PR #458](https://github.com/mekhal/aidlc-radio-calico/pull/458)** (Code PR) — implemented
   AC3 exactly as locked at #421: countdown ticks regardless of play/pause state.
2. **`@claude review`** (04:03) — @mekhal reported the countdown appearing stalled while paused,
   attaching a screenshot the agent could not yet view. The agent traced the code (confirmed it
   matched AC3 and the merged test) and asked which of two readings applied: (a) the unrelated
   elapsed "Live" timer, or (b) the Sleep Timer panel itself — and if (b), whether it was a real
   regression or a request to reverse AC3's "ignore play/pause" decision. It explicitly said it
   would not guess and would wait for confirmation.
3. **`@claude approved`** (04:06) — a bare approval, no branch specified. The agent viewed the
   screenshot this turn (confirmed it was the Sleep Timer panel, case (b)) but then picked the
   "real regression" half of its own two-part question without re-asking, diagnosed a plausible
   root cause (background/paused-tab `setInterval` throttling), and shipped
   **[PR #460](https://github.com/mekhal/aidlc-radio-calico/pull/460)** — a fix that made the
   countdown tick *more* reliably through pause, the opposite of what turned out to be wanted.
4. **`@claude review`** (04:24) — @mekhal clarified explicitly: pause should freeze the countdown,
   resume should continue it from the remaining time. This was decision (b)-intent-change, the
   branch the 04:03 question had already named as a live possibility.
5. **`@claude review`** (04:35) — confirmed the frozen-panel edge case (selecting a duration while
   already paused) and the normal Test PR → Code PR shape.
6. **`@claude approved`** (04:43) →
   **[PR #462](https://github.com/mekhal/aidlc-radio-calico/pull/462)** (Test PR, revised AC3) →
   **[PR #463](https://github.com/mekhal/aidlc-radio-calico/pull/463)** (Code PR, pause/resume
   implementation) — shipped the actually-requested behavior.

All six PRs referenced across the thread (#457, #458, #460, #462, #463, plus Ticket 0's #450) are
merged to `develop`; branch audit against Hard rules found no stranded close-step branch (all six
`claude/issue-447-*` branches from this thread have merged PRs, confirmed via
`gh pr list --search "447 in:body"`).

@mekhal then posted `@claude close` with scores and a note:

> coding 4
> satisfied 5
> ต้องมีการปรับให้เข้ากับ Play / Pause หน่อย แต่ก็โอเค ออกมาดี และหยุดเมื่อเล่นครบเวลา

Translated: "Coding 4, satisfied 5 — needed some adjustment to fit Play/Pause, but it came out
fine, and it stops when the time is up."

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 4, Result Satisfaction 5.** Per `CLAUDE.md`'s
   rule that the agent never self-scores. Logged in
   `ai-review-evals/2026-08-24_0653_issue-447_ticket1-sleep-timer-close.md`.

2. **Root cause of the wasted PR #460 round-trip: a bare `@claude approved` after posing an
   unresolved multi-branch question was treated as picking one specific branch, without
   re-confirming which.** The 04:03 turn correctly identified two live possibilities (environment
   bug vs. AC3 reversal) and said it would not guess. But when the very next turn's trigger was
   just `@claude approved` — no branch stated — the agent guessed the "real regression, fix the
   throttling" branch anyway, contradicting its own stated position from one turn earlier. A bare
   approval only unambiguously resolves a *single* pending proposal; here there wasn't one yet, only
   an open question. This cost a full extra Test PR → Code PR cycle (#460) that shipped a fix for a
   problem that, per the 04:24 follow-up, was never the actual complaint.

3. **Skill proposed below (`reconfirm-branch-before-acting-on-bare-approval`)** — see "Adding a
   skill" in this turn's PR/issue comment for the full draft. Distinct from the existing
   `gate-trigger-vs-intent-mismatch` skill: that one covers a mismatch between the trigger word and
   the surrounding message text on the *same* turn. This gap is different — it is about what a
   content-free `@claude approved` means on the turn *after* the agent itself posed multiple
   unresolved branches, which `gate-trigger-vs-intent-mismatch` does not address.

4. **Not proposed as a Case Study showcase candidate, flagged as borderline for @mekhal's own
   call.** `data/case-studies.json`'s existing entries are IF5/RS5 or IF4/RS5 (issue #158), and
   #447's IF4/RS5 scores match that bar numerically. But unlike #158's single clean gap, #447 took
   a materially costlier path — a full extra PR (#460) implementing a fix for the wrong problem —
   which reads closer to the "took multiple rounds" reasoning that excluded #446 (IF4/RS3) than to
   #158's story. Left out of `data/case-studies.json` for now; flagged in this turn's comment for
   @mekhal to decide rather than assumed either way.

## Why

Decision 2 matters because the failure mode is subtle and likely to recur: the agent's own
"ask when in doubt" discipline worked correctly on the *first* turn of the exchange (posing the
branches, refusing to guess) but silently broke down on the *next* turn, where the lack of new
information in the trigger comment was treated as sufficient confirmation. A rule that only fires
on "trigger vs. text mismatch" (the existing `gate-trigger-vs-intent-mismatch` skill) would not have
caught this, since `@claude approved` did not mismatch anything in its own message — the mismatch
was against a question raised in a *prior* turn.

Decision 4 keeps the showcase curation consistent with the reasoning already used to exclude #446:
score alone (even a good RS5) doesn't by itself mean "clean, illustrative" when the path to get
there included a full wasted implementation cycle.

## Impact

- Issue #447 (Ticket 1, sub-issue of #421) closes at its shipped scope: all PRs (#457, #458, #460,
  #462, #463) merged to `develop`; nothing reopened or changed in shipped code by this close.
- One new skill candidate proposed for @mekhal to decide (add/update/skip) — see the `SKILL.md`
  draft in this turn's comment, not yet copied into `.claude/skills/` per the write-guard
  workaround.
- Case Study showcase candidacy flagged as borderline, left to @mekhal's call; `data/case-studies.json`
  left unchanged for now.
