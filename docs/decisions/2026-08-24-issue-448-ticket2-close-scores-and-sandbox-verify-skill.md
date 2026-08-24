# Issue #448 (Ticket 2: Audio Quality) close — scored coding 5 / satisfied 5, sandbox-verify skill proposed

## Context

Issue #448 ("Ticket 2: Audio Quality", sub-issue of #421) wired the already-shipped Audio Quality
sub-menu (Ticket 0, #446) to a real `hls.currentLevel` on the live `hls.js` instance, on top of
Ticket 1's Sleep Timer (#447) landing independently.

1. **`@claude review`** — traced the existing shell/state (AC1/AC2 already covered by #446),
   confirmed `hlsRef` and the `hls.js` CDN dependency already existed, and raised two open
   implementation questions the AC didn't answer: (a) index-based vs. bitrate-based level matching,
   (b) Native HLS (Safari) fallback behavior with no `hls.js` instance to control.
2. **@mekhal's answer** — bitrate-based matching confirmed; Native HLS fallback: menu renders/
   highlights normally, selecting an option no-ops.
3. **[PR #467](https://github.com/mekhal/aidlc-radio-calico/pull/467)** (Test PR) — AC1–AC5 covered,
   including a deliberately-unsorted `hls.levels` fixture so an index-based implementation would
   fail the bitrate-matching case.
4. **`@claude approved choose a`**, then two more bare `@claude approved` comments, then
   **`@claude approved Test PR approved continue Code PR`** — all four landed on the *issue* while
   PR #467 was still open. Per the existing `pr-followup-on-pr-not-issue` skill, each was correctly
   flagged rather than acted on, producing three stray empty branches
   (`claude/issue-448-20260824-0721`, `-0740`, `-0803`) with no pushed changes.
5. **`@claude approved`** (08:35) — PR #467 had merged one minute earlier (08:34:57Z), so this
   bare approval was now the valid step-6 trigger (no ambiguity left to flag). **[PR
   #468](https://github.com/mekhal/aidlc-radio-calico/pull/468)** (Code PR) shipped
   `findLevelIndexForQuality()` (bitrate-sorted, not index-based) and `selectAudioQuality()`,
   matching the Test PR's contract exactly.

Both PR #467 and #468 are merged to `develop`. All stray branches from step 4 have no pushed
history (nothing stranded). Both the Test PR and Code PR turns hit the same environment limitation:
this sandbox's Bash tool blocks starting a listening/background static file server (required for
`tests/test-runner.html`'s fetch-based module loading) without interactive approval, which wasn't
available in either turn — so RED (Test PR) and GREEN (Code PR) status were each confirmed by
hand-tracing the implementation against the exact test fixtures, not an actual browser run, with
that caveat stated explicitly in both PR descriptions asking @mekhal to confirm locally.

@mekhal then posted `@claude close  coding 5 satisfied 5`.

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 5, Result Satisfaction 5.** Per `CLAUDE.md`'s
   rule that the agent never self-scores. Logged in
   `ai-review-evals/2026-08-24_0940_issue-448_ticket2-audio-quality-close.md`.

2. **No rework cycle this time** — unlike Ticket 0 (IF4/RS3, repeated UI-fix rounds) and Ticket 1
   (IF4/RS5, one wasted implementation cycle from a bare-approval branch-guess), Ticket 2 shipped
   in exactly one Test PR → Code PR pass with both open questions resolved before any code was
   written. The four stray-branch turns were process friction, not implementation rework — no code
   was written or discarded because of them.

3. **New skill proposed** (`sandbox-blocked-test-runner-verification`) — see the `SKILL.md` draft
   in this turn's issue comment. This repo's hand-written vanilla-JS test convention
   (`tests/test-runner.html`, opened directly in a browser — no `npm test`, see
   `docs/decisions/2026-07-12-testing-framework-vanilla-runner.md`) means every Test PR and Code PR
   turn needs a static file server to actually execute the suite. That server start was blocked in
   *both* of this ticket's implementation turns, and the same hand-trace-and-flag fallback was
   independently re-derived each time rather than following a recorded pattern. Not previously
   captured under `docs/knowledge-asset/published/` (checked: `test-pr-native-api-and-self-ref-checklist.md`
   and `code-pr-implements-test-pr-contract.md` cover test *design*, not the *execution*-blocked
   case).

4. **Proposed as a Case Study showcase candidate.** `data/case-studies.json` currently holds three
   IF5/RS5 or IF4/RS5 entries (#245, #294, #158); Ticket 2's IF5/RS5 with a clean single-pass
   Test PR → Code PR loop and two resolved-before-coding open questions matches that bar more
   closely than Ticket 0 or Ticket 1 did. Flagged in this turn's comment for @mekhal to confirm
   before `data/case-studies.json` is touched — not written to unprompted, per the issue #203
   close-step protocol.

## Why

Decision 2 matters for the same "evidence trail" reason the AI review evaluation framework exists:
distinguishing "resolved cleanly" from "resolved after rework" is exactly the signal that lets
`Instruction Fidelity`/`Result Satisfaction` scores eventually move a class of AI decision from
Human Review Everything to Human Review Risk — a IF5/RS5 with zero wasted implementation cycles is
stronger evidence than one that got there via an extra PR.

Decision 3 matters because the sandbox limitation is structural (a Bash tool restriction, not a
one-off flake), so it will recur on essentially every future Test PR/Code PR turn in this repo
until the harness config changes. Recording the fallback procedure once means future turns state
the caveat and hand-trace consistently instead of re-deriving the same workaround from scratch.

## Impact

- Issue #448 (Ticket 2, sub-issue of #421) closes at its shipped scope: PR #467 and #468 both
  merged to `develop`; nothing reopened or changed in shipped code by this close.
- One new skill candidate proposed for @mekhal to decide (add/update/skip) — see the `SKILL.md`
  draft in this turn's comment, not yet copied into `.claude/skills/` per the write-guard
  workaround.
- Case Study showcase candidacy proposed (not assumed); `data/case-studies.json` left unchanged
  pending @mekhal's confirmation.
