# Issue #152 follow-up close — scored coding 4 / satisfied 3, rebase friction and i18n gap surfaced

## Context

Issue #152 (the "What's this" page story) was already closed once, at coding 5 / satisfied 5,
in [[2026-08-20-issue-152-whats-this-page-close-scores-and-ticket-splitting-skill]] — that close
recorded the `split-story-into-review-sized-sub-issues` skill and left #152 open only as a
tracking issue pending all 4 sub-issues (#402-#405) individually closing. All 4 have since closed
and all 9 PRs across the thread (#406/#407, #409, #410, #411, #414, #415, #416, #417) are merged
to `develop`.

@mekhal has now posted a second `@claude close` on #152 itself, scoring **coding 4, satisfied 3**
— lower than the first close — with two concrete complaints:

1. **Manual local rebase across 3 branches.** Tickets 2-4 (#403, #404, #405) each depend only on
   Ticket 1 (#402)'s scaffold, per the dependency table posted at #152's plan gate. Because each
   sub-issue's branch is created fresh off `origin/develop` at the moment its own
   `@claude approved` is triggered (per the mandatory sync-check rule), any dependent sub-issue
   branch created *before* #402's Code PR (#407) merged to `develop` ends up based on stale
   `develop` and needs a manual rebase once #402 lands — which is what happened here across all
   three dependent branches.
2. **Result doesn't match the requirement for bilingual (two-language) content.** @mekhal states
   they will open a separate issue for this themselves ("เดี๋ยวจะไปสร้าง issue ส่วนนี้เป็นพิเศษ") —
   so no new issue is opened by this turn.

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 4, Result Satisfaction 3.** Per `CLAUDE.md`'s
   rule that the agent never self-scores. Logged in
   `ai-review-evals/2026-08-21_0706_issue-152_whats-this-followup-close.md` as a **second**,
   separate evaluation file for this issue (the framework logs one file per `@claude close` event,
   not a rolling summary — see `ai-review-evals/README.md`).

2. **No new issue opened for the bilingual gap.** Unlike the #151 → #394 and #419 → #432
   precedents (where the agent opened the follow-up issue directly), @mekhal explicitly stated
   they will file this one themselves. Per "Human decides, always," the agent defers to that
   stated intent rather than opening #152's follow-up preemptively.

3. **Root cause for the bilingual gap, recorded for whoever picks up that future issue:**
   `whats-this/whats-this.js:13-14` explicitly documents its Section 1 content as having "no i18n
   branching," a deliberate choice made because neither #152's own plan/review Q&A nor any of
   Tickets 2-4's Acceptance Criteria asked about bilingual/i18n support — unlike `about/about.js`,
   which i18n's its section headings via `ALBUM_PROMO_TRANSLATIONS`/`state.lang` per an explicit
   "reuse theme & use i18n" answer captured during the About page's own plan review. This is the
   same root cause as [[2026-08-18-issue-151-about-page-close-scores-and-followups]]'s complaint
   #2 (About's Production-Standards table shipped fixed-English because i18n was never asked
   about) and echoes [[2026-08-20-issue-419-contact-info-close-scores-and-toggle-followup]]'s
   toggle note — three separate instances now of a new page/section shipping without the
   established i18n pattern because the plan step didn't ask.

4. **Two skill items surfaced by this feedback, proposed for @mekhal to decide (add/update/skip)
   — see the two `SKILL.md` drafts below, not yet copied into `.claude/skills/` per the write-guard
   workaround:**
   - **New skill:** `confirm-i18n-requirement-at-plan-time` — always ask, during the 5-questions
     step, whether new page/section content needs bilingual/i18n support, given the project's
     established `shared/translations.js`/`state.lang`/`onLanguageChange` pattern already used by
     About, Case Study, Contact, and Album Promo — rather than defaulting to single-language
     content just because the issue body doesn't mention it.
   - **Proposed addition to the existing `split-story-into-review-sized-sub-issues` skill** (point
     5): when sub-issues have a dependency chain, say explicitly in the dependency table that a
     dependent sub-issue's `@claude approved` should wait until the depended-on ticket's Code PR
     has merged to `develop`, so its branch is cut from an up-to-date base and the human isn't left
     rebasing multiple local branches by hand after the fact.

5. **Not proposed as a Case Study showcase candidate.** The first close proposed #152 as a
   candidate pending confirmation; this follow-up close (lower scores, an outstanding bilingual gap
   to be filed as its own issue) means it no longer reads as the "clean, illustrative" example the
   showcase curation calls for — same reasoning [[2026-08-18-issue-151-about-page-close-scores-and-followups]]
   used to skip the showcase at 3/3. Superseding the earlier tentative proposal; nothing added to
   `data/case-studies.json`.

## Why

Decision 2 respects the human's stated intent to own that follow-up issue themselves — opening
one anyway would create a duplicate for @mekhal to reconcile.

Decision 4's first skill generalizes a gap that has now recurred three times (#151, #419, #152)
across three different pages, each time surfacing only after the content shipped rather than
during planning — worth fixing at the source (the 5-questions step) rather than catching it once
per page after the fact. The second skill addresses a distinct, mechanical pain point (manual
rebase) that is a direct consequence of how dependent sub-issue branches get created, independent
of the i18n content gap.

## Impact

- Issue #152 (parent story) stays closed at its shipped AC scope (all 4 tickets merged); this
  follow-up close adds a second evaluation entry and two proposed skill items — it does not reopen
  or change any shipped code.
- The bilingual-content follow-up issue is left for @mekhal to open; no new issue filed by this
  turn.
- `data/case-studies.json` left unchanged; #152 is no longer treated as a pending showcase
  candidate.
