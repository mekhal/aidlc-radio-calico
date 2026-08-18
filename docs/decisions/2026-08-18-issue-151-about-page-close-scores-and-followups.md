# Issue #151 close — About page story scored 3/3, two follow-ups split out

## Context

Issue #151 asked for a full "About" page (HTML + Bootstrap 5), built across a 4-ticket loop on
this single issue: Ticket 1 (standalone page scaffold in `pages/`, [#382](https://github.com/mekhal/aidlc-radio-calico/pull/382)/[#383](https://github.com/mekhal/aidlc-radio-calico/pull/383)), Ticket 2 (Section 1 —
project overview + 5-swatch color palette, [#385](https://github.com/mekhal/aidlc-radio-calico/pull/385)/[#386](https://github.com/mekhal/aidlc-radio-calico/pull/386)), Ticket 3 (Section 2 —
"Production-grade Standards" table, [#388](https://github.com/mekhal/aidlc-radio-calico/pull/388)/[#389](https://github.com/mekhal/aidlc-radio-calico/pull/389)), and Ticket 4 (Section 3 —
References & Acknowledgements, [#391](https://github.com/mekhal/aidlc-radio-calico/pull/391)/[#392](https://github.com/mekhal/aidlc-radio-calico/pull/392)). All 8 branches on the thread merged; nothing
stranded.

At close, @mekhal scored the story **coding 3, satisfied 3** (below the 4-5 typical of this repo's
prior closes) and listed three concrete complaints, with a screenshot of the live "Production-grade
Standards" table.

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 3, Result Satisfaction 3.** Per `CLAUDE.md`'s
   rule that the agent never self-scores — same precedent as
   [[2026-08-06-issue-205-close-scores-and-dark-theme-bug-split]] (#205, scored 4/4 with a stated
   reason). Logged in `ai-review-evals/2026-08-18_0934_issue-151_about-page-close.md`.

2. **Complaints #2 (table text not translated) and #3 (table colors don't match theme) split into a
   new issue, [#394](https://github.com/mekhal/aidlc-radio-calico/issues/394)**, rather than reopening #151's loop — same
   "missed functionality becomes a NEW issue" pattern as #205 → #294. Root cause for both: Ticket
   3's `buildProductionStandardsTable()` was deliberately built as fixed-English, Bootstrap-default-styled
   data (documented at the time as "same precedent as case-study cards" in Code PR #389's
   description) — a real decision made explicitly during the loop, but one that didn't match what
   the human actually wanted once they saw it rendered.

3. **Complaint #1 ("ไม่ยอมสร้าง sub ticket ใหม่เพื่อ loop") is a process lesson, not a code
   defect — no new issue filed for it.** It refers back to the mid-story sequencing question (raised
   after Ticket 1's close): "should Tickets 2-4 become separate GitHub issues, or stay sequential
   Test/Code PR pairs on #151?" The human's one-line answer at the time, **"Sub ticket"**, was
   interpreted as *"stay sequential on #151, tickets are just sub-units of this one issue"* — but
   this close comment reveals that reading was wrong: the human meant *actual separate GitHub
   issues* should have been opened. The two-word answer was genuinely ambiguous (it can support
   either reading), and per `CLAUDE.md`'s "ask when in doubt" rule the agent should have confirmed
   which was meant instead of picking one and running with it across three more tickets. Applied
   immediately: issue #394 above was opened as a real, separate GitHub issue rather than continuing
   the sequential-PRs-on-#151 pattern.

## Why

Decision 2 keeps #151's own AC (all merged, all matching what was actually specified in the
Test PR contracts) from being reopened for a preference gap the AC never stated — the issue body's
"Production-grade Standards" section only asked for "a Bootstrap Table หรือ Cards" listing the four
gates, not i18n or theme-token coverage, so this is new scope, not a missed AC.

Decision 3 is the one worth generalizing: a single ambiguous word/short-phrase answer at a gate
(especially one translated from Thai shorthand) should be confirmed before it's used to lock in
three more tickets' worth of structural decisions, rather than assumed and revisited only at close
once the cost of the wrong reading has compounded. See the proposed skill below.

## Impact

- Issue #151 closes at its original 4-ticket AC scope; no further code changes made in this close
  turn (per `CLAUDE.md`'s `@claude close` scope — "used only to summarize the issue for skill
  creation").
- New issue [#394](https://github.com/mekhal/aidlc-radio-calico/issues/394) tracks the table
  i18n + theme-color gap, with root cause and suggested fix directions already recorded.
- **Case Study showcase:** not proposed as a showcase candidate this close — the story ended at
  3/3 satisfaction with two follow-up bugs still open, so it isn't the "clean, illustrative
  end-to-end example" the showcase is meant to hold, per
  [[2026-08-11-issue-203-case-study-data-source-and-ticket-breakdown]]'s curation guidance.
