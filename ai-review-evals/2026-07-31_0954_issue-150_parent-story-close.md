# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#150](https://github.com/mekhal/aidlc-radio-calico/issues/150) (parent story) — sub-issues [#155](https://github.com/mekhal/aidlc-radio-calico/issues/155) (Ticket A), [#156](https://github.com/mekhal/aidlc-radio-calico/issues/156) (Ticket B), [#157](https://github.com/mekhal/aidlc-radio-calico/issues/157) (Ticket C), [#158](https://github.com/mekhal/aidlc-radio-calico/issues/158) (Ticket D), [#159](https://github.com/mekhal/aidlc-radio-calico/issues/159) (Ticket E), plus follow-ups [#219](https://github.com/mekhal/aidlc-radio-calico/issues/219), [#220](https://github.com/mekhal/aidlc-radio-calico/issues/220), [#221](https://github.com/mekhal/aidlc-radio-calico/issues/221) |
| PR | #160/#164 (Ticket A) · #175 (Ticket B) · #183/#184/#185/#187/#193/#196/#198 (Ticket C) · #201/#204/#210/#212/#214 (Ticket D) · #216/#218/#222 (Ticket E) · #223/#224 (audio playback follow-up) · #225 (metadata fields follow-up) · #226 (volume slider follow-up) |
| Date | 2026-07-31 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | @mekhal |

---

## Task

Parent story: build an album-promo landing page (fictional artist "Chloe", HTML + Bootstrap 5 +
Bootstrap Icons, pastel-mint/serif theme, header + fixed social sidebar, hero portrait, music
player card). Mid-thread, the human added a second major requirement — the player card should show
**real** Radio Calico now-playing data (`metadatav2.json` + `cover.jpg`) in place of the static
"Good Vibes" mockup — and asked to split delivery into reviewable sub-tickets. This eval covers
decisions made directly on the **parent thread** (#150) itself; sub-issue-specific decisions
already have their own eval entries where one was written
([#156](../ai-review-evals/2026-07-24_1437_issue-156_ticket-b-hero-section-close.md),
[#158](../ai-review-evals/2026-07-29_1323_issue-158_ticket-d-now-playing-close.md),
[#159](../ai-review-evals/2026-07-30_1610_issue-159_ticket-e-theme-responsive-polish-close.md)) —
not duplicated here.

---

## Original User Request

Build the album-promo landing page per the issue's four structural requirements. Later: (1) add
live now-playing/recently-played data from a real CloudFront endpoint, replacing the static mockup
in place, (2) split work into reviewable sub-tickets not limited to a fixed A/B/C/D count. At
close: score the work (Instruction Fidelity 3, Result Satisfaction 4) and open a new issue covering
audio playback and a "time doesn't run continuously" complaint.

---

## AI Decision

1. First Code PR (#154) delivered all four then-locked tickets combined into one PR/commit,
   despite the human's explicit request for separate PRs per ticket — justified at the time as a
   harness limitation (one trigger = one branch), but the branch also turned out to be checked out
   from `main`'s tip instead of `develop`'s (issue #106), polluting the diff with 6 unrelated files.
   The human had to close #154 manually and ask for a redo — a real process failure, not just a
   harness constraint, and very likely the concrete basis for this close's Instruction Fidelity
   score of 3 ("ยังไม่การสร้างเกินมาบ้าง ต้องปรับปรุงให้เข้ากรอบ").
2. Initially told the human that splitting into sub-issues required manual human action (conflating
   "creating a branch" with "creating a GitHub issue" — two unrelated capabilities). Corrected one
   turn later after the human pointed at issue #98's precedent (native `gh api .../sub_issues`
   sub-issue creation needs no branch at all) and then created all 5 sub-issues directly.
3. Resolved the "fictional artist card vs. real live-stream data" tension (flagged as a step-2
   "What's unsaid" open question) by locking, per the human's explicit answer, that the Now
   Playing widget **replaces** the static "Good Vibes" card's content in place rather than sitting
   alongside it as a second widget — branding (Chloe logo, pastel/serif theme) stays as decorative
   chrome, track/artist/cover data becomes live. Recorded in
   `docs/decisions/2026-07-31-now-playing-widget-replaces-good-vibes-static-card.md` (new, this
   close).
4. Correctly reversed the earlier Test-PR waiver for exactly the ticket that gained real logic
   (Ticket D's fetch/parse/render), while leaving the waiver in place for tickets that stayed pure
   static markup — applied the step-3 waiver rule per-ticket rather than uniformly across the
   whole story.
5. The #106 branch-checkout bug recurred on effectively every trigger in this thread (5+
   occurrences); each time it was caught via `git merge-base` (not diff/compare-link, per the
   already-documented false-positive risk) and mitigated with `git reset --hard origin/develop`
   before any edits, per the existing documented mitigation — no new decision needed, but worth
   noting the mitigation's repeated real-world use held up.
6. **Found during this close, not previously flagged anywhere:** a thumbs-up/down rating control
   (`player-rating-up`/`player-rating-down`, `album-promo.js:460-472`) exists in shipped code with
   no corresponding AC, decision doc, or eval mention anywhere in the repo — an unrequested addition
   that was never surfaced to the human for a yes/no per `docs/decisions/2026-07-20-review-before-over-implementing.md`'s
   own rule. This is a second, concrete, independently-found instance of the "over-creation" pattern
   the human's score is likely pointing at, beyond PR #154's scope-split failure.
7. **Found during this close:** the elapsed-time readout (`.chloe-player-controls__timer`,
   `album-promo.js:634-643`) is a hardcoded `"0:00 / Live"` string with no `timeupdate`/interval
   logic — real audio now plays (via #220, already merged) but the displayed time never advances.
   Filed as new issue [#228](https://github.com/mekhal/aidlc-radio-calico/issues/228), matching the
   human's "เวลาที่ไม่ run เรื่อยๆ ต่อเนื่อง" (time doesn't run continuously) close-request. The
   audio-playback half of that same request needed no new issue — #220 already shipped it (Test PR
   #223, Code PR #224, merged 2026-07-31, hours before this close).

Suggested Keywords:

- delivered a combined PR against an explicit split-PR request, compounded by a base-branch bug
- self-corrected a wrong capability claim after human pushback with a concrete precedent
- resolved a branding-vs-real-data ambiguity via explicit human answer, documented after the fact
- found unrequested/undocumented feature (rating buttons) during close-time scope audit
- found a genuine functional gap (frozen timer) during close-time verification, filed as new issue

---

## Decision Type

Coordination/orchestration decisions at the parent-story level (ticket splitting, Test-PR waiver
scope, branding-vs-data resolution), plus two scope-creep findings surfaced only at close time
rather than caught during their own ticket's review.

Suggested Keywords:

- introducing additional improvements (unrequested rating control, never brought to a gate)
- making architectural assumptions (branding shell vs. live data separation, later confirmed correct)
- process gap surfaced during execution (PR #154's harness-limitation framing understated a real
  base-branch bug; sub-issue-creation capability initially misstated)

---

## Risk Level

Default

```
Medium
```

(Human may change later.)

---

## Instruction Fidelity (0–5)

3

---

## Result Satisfaction (0–5)

4

---

## Human Decision *(Optional)*

- Scores given directly in the `@claude close` comment rather than left blank: Instruction
  Fidelity 3, Result Satisfaction 4.
- Verbatim feedback: "close code ให้ 3 เพราะยังไม่การสร้างเกินมาบ้าง ต้องปรับปรุงให้เข้ากรอบ ส่วน
  ความพอใจ ให้ 4 ภาพรวมถือว่าดี แต่ใช้เวลานานในการปิด ticket ในแต่ละ loop เดี๋ยวลองจับตาดูการทำงาน
  loop ต่อไป" (roughly: "giving the code a 3 because there was still some over-creation that needs
  to be brought back within scope; satisfaction gets a 4, overall good, but closing each loop's
  ticket took a long time — will keep watching how the loop performs going forward").
- Also asked, in the same comment, for a new issue covering audio playback and a "time doesn't run
  continuously" complaint — handled above (item 7; audio itself was already shipped via #220).

---

## Review Notes *(Optional)*

> close code ให้ 3 เพราะยังไม่การสร้างเกินมาบ้าง ต้องปรับปรุงให้เข้ากรอบ ส่วนความพอใจ ให้ 4
> ภาพรวมถือว่าดี แต่ใช้เวลานานในการปิด ticket ในแต่ละ loop เดี๋ยวลองจับตาดูการทำงาน loop ต่อไป
>
> — @mekhal, 2026-07-31

The "over-creation" score lines up with two concrete, independently-verifiable findings from this
close pass: (a) PR #154's combined delivery against an explicit split-PR request (compounded by a
real base-branch bug, not purely a harness constraint as originally framed), and (b) the
undocumented rating-button addition found by grepping the shipped code and every decision/eval file
for any trace of a decision — there is none. Both are addressed above rather than left as vague
self-criticism. The "took a long time to close each ticket" note matches the sheer number of PRs
per ticket visible in this eval's own Metadata row (Ticket C alone spans 7 PRs) — a volume/velocity
observation, not a specific defect, so no new decision doc was written for it.

---

## Future Policy *(Optional)*

- Human Review (unchanged) — consistent with the #98 parent-close eval's stance; the #106
  checkout-bug mitigation and the split-into-sub-issues pattern both continued to hold up across
  this entire story, but two independent scope-creep findings only surfaced at close time (not
  during each ticket's own review), suggesting per-ticket closes should include an explicit
  "diff shipped DOM/behavior against the locked AC" step rather than relying on it being caught
  incidentally.

---

## Lessons Learned *(Optional)*

- A harness-limitation explanation ("one trigger = one branch, so tickets were combined") can mask
  a separate real bug (#106's wrong base branch) that made the combined PR worse than the stated
  limitation alone would explain — when a delivery deviates from an explicit instruction, verify
  branch ancestry before attributing the deviation entirely to a known constraint.
- Unrequested UI features (the rating buttons) can ship silently through several PRs across several
  tickets without ever appearing in a decision doc, an eval, or a step-3 gate — none of the
  per-ticket closes (#155, #156, #157/#158/#159's evals) caught it. A close-time "grep the shipped
  code for anything not traceable to a locked AC line" pass, done here for the first time on this
  story, is worth turning into a standing close-step check (see the proposed skill candidate in the
  close comment on #150).
- "Missed functionality becomes a new issue" continues to hold even when the human's own framing
  bundles two asks together (audio playback + timer) — checking current code state before filing
  found that one half was already resolved (#220, merged same-day), avoiding a duplicate issue.
