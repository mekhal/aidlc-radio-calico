# Issue #153 close — scored coding 4 / satisfied 3, rebase friction and bilingual gap corroborated

## Context

Issue #153 (the "Contact" page story) was split at its plan-approval gate into 3 native GitHub
sub-issues — #418 (scaffold + nav), #419 (Contact Info column), #420 (Contact Form + mailto) — per
[[2026-08-20-issue-152-whats-this-page-close-scores-and-ticket-splitting-skill]]'s established
`split-story-into-review-sized-sub-issues` mechanism. All 3 have since individually closed and all
9 PRs across the thread (#422, #423, #424, #425, #426, #427, #428, #430, #431, #433) are merged to
`develop`. #153 itself stayed open only as the tracking issue.

@mekhal has now posted `@claude close` on #153 with **coding 4, satisfied 3**, using the same two
complaints already raised at #152's second close
([[2026-08-21-issue-152-whats-this-followup-close-scores-and-i18n-gap]]):

1. **Manual local rebase across 3 branches.** Reviewing/merging 3 separate sub-issue Code PRs
   locally required rebasing 3 times. Unlike #152's case, the PR timeline here (#423 Ticket 1 code
   merged 09:12Z; #419's branches created 09:17Z onward; #420's branch created 15:59Z, after #419's
   code PR #426 merged at 15:53Z) shows each sub-issue's branch was in fact cut *after* its
   dependency had already merged to `develop` — so this isn't the "dependent branch cut from stale
   `develop`" mechanism identified at #152. The friction here is simpler: merging N sub-issue PRs
   into `develop` inherently means a human does N local rebase-and-merge cycles (per `CLAUDE.md`'s
   Branching section: "a Developer or Tester rebases the feature branch in and merges the PR here —
   a human, never you"), independent of dependency ordering.
2. **Result doesn't match the requirement for bilingual (two-language) content.** Unlike #152
   (where no follow-up issue existed yet), this exact gap for the Contact page was already opened
   as **[#432](https://github.com/mekhal/aidlc-radio-calico/issues/432)** during #419's own close
   ([[2026-08-20-issue-419-contact-info-close-scores-and-toggle-followup]]) — @mekhal's stated
   intent to "go create an issue for this separately" is very likely unaware #432 already exists,
   since it was opened by the agent, not by @mekhal.

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 4, Result Satisfaction 3.** Per `CLAUDE.md`'s
   rule that the agent never self-scores. Logged as a new file in `ai-review-evals/` (one file per
   `@claude close` event; #153 is closing for the first time, so this is that issue's first entry).

2. **No new issue opened for the bilingual gap — #432 already covers it.** Surfacing this to
   @mekhal directly in the close comment so they don't file a duplicate; if #432's scope doesn't
   fully capture what they mean by "ไม่ตรงกับความต้องการ...สองภาษา" here, that's a comment on #432
   itself, not a new issue.

3. **Rebase-friction complaint has now recurred twice (#152, #153) but with two different
   mechanisms.** #152's was "dependent sub-issue branch cut before its dependency merged."
   #153's, per the PR timeline above, was not that — every sub-issue branch here was already cut
   from a post-merge `develop`. The residual friction is simply "N sub-issues means N human
   rebase-and-merge cycles," which is inherent to the `split-story-into-review-sized-sub-issues`
   pattern itself (review-sized PRs is the explicit tradeoff), not a defect to fix. No new skill
   drafted for this — the already-proposed update to `split-story-into-review-sized-sub-issues`
   from #152's close (sequence dependent triggers after the dependency merges) still stands as the
   one actionable mechanical fix, and it targets the *other* mechanism. Recorded here so a third
   recurrence with yet another mechanism doesn't get missed.

4. **No new skill candidates from this issue's own work.** The i18n-gap skill
   (`confirm-i18n-requirement-at-plan-time`) and the sub-issue-sequencing addition were already
   proposed at #152's close and remain pending @mekhal's add/update/skip decision — re-proposing
   them here would just be noise. #153 corroborates that both are still worth deciding on, nothing
   more.

5. **Not proposed as a Case Study showcase candidate**, same reasoning as #152's second close: a
   3/3-range satisfaction score with an outstanding bilingual gap isn't the "clean, illustrative"
   example the showcase curation calls for.

## Why

Decision 2 avoids creating a duplicate for @mekhal to reconcile — #432 was opened by the agent
during #419's close specifically for this gap, and @mekhal's phrasing here ("เดี๋ยวจะไปสร้าง issue
ส่วนนี้เป็นพิเศษ") suggests they don't know it exists yet.

Decision 3 exists because superficially this looks like the same complaint as #152, but the
evidence (PR creation/merge timestamps) doesn't support the same root cause — worth being precise
about which mechanism is actually recurring so the eventual skill fix targets the real cause and
not a coincidental one.

## Impact

- Issue #153 (parent story) stays closed at its shipped AC scope (all 3 tickets merged); this close
  adds one evaluation entry, points @mekhal at the pre-existing #432 instead of a new issue, and
  declines to draft redundant skill proposals already pending from #152's close.
- `data/case-studies.json` left unchanged; #153 not treated as a showcase candidate.
