# Decision: Issue #578 (`app.js` dead-code status confirmation) closed

**Issue:** [#578](https://github.com/mekhal/aidlc-radio-calico/issues/578) — task-only verification of
whether `app.js` (928 lines) is still live or dead code, per issue #220's original note and #573's
close-time finding. Explicit scope: **verify only, do not delete `app.js` in this issue's own PR**
— open a separate ticket if deletion is the call.
**PR:** none for the verification turns themselves (comment-only, per scope); this close-step PR
carries only the decision doc / eval bookkeeping / skill draft below.
**Decided by:** @mekhal, 2026-08-31

## Decision

1. **Confirmed: `app.js` is dead code in every production deploy path.** No page
   (`index.html`, `album-promo.html`, `pages/*.html`, `case-study.html`) loads it via
   `<script src="app.js">`, dynamic import, or inline execution — only a code *comment* at
   `index.html:30` mentions it. All 8 feature groups inside it (nav/brand header, theme toggle,
   language toggle, footer links, Test Report modal, hero/player controls, HLS setup, i18n loading)
   have been reimplemented independently in the current split-component architecture (`logo/`,
   `menu/`, `sidebar/`, `footer/`, `album-promo.js`), not called from `app.js`. Several call sites
   say so directly in their own comments (`sidebar/sidebar.js:132`, `album-promo.js:288` — "mirrors
   app.js's ..."). Full feature-by-feature table is in the issue's second review comment
   (2026-08-31T03:58Z).
2. **`app.js` is still a genuine, non-mocked test-mount target.** 14 test files call
   `AppTestHelpers.loadApp()` (`tests/load-app.js`), which fetches, Babel-transforms, and actually
   executes `app.js`'s real source in-document — this is real coverage of real code, not a stale
   reference. `tests/reused-js-iife-safety.test.js` is a separate static/doc-content check, not a
   behavioral test of `app.js`.
3. **Human approved deletion + waived the Test PR step for that follow-on work**, in this issue's
   thread (`@claude approved remove ส่วนที่ไม่ใช้งาน waiver Test PR`, 2026-08-31T04:05Z). Because
   #578's own scope forbids deleting `app.js` inside its own PR, that approval was routed into a
   **new issue, [#585](https://github.com/mekhal/aidlc-radio-calico/issues/585)**, seeded with the
   full AC (delete `app.js`, audit/remove only the 14 dependent tests, adjust
   `reused-js-iife-safety.test.js`, update the `config/cdn-sources.json:48` note) and the Test-PR
   waiver already recorded as a step-3 decision. This close turn additionally posted the decision as
   an explicit comment on #585 (not just carried in its issue body), per @mekhal's close-time
   instruction to record the decision on the related ticket.
4. **Result Satisfaction scored `5` directly by @mekhal in the close comment** ("satisfied 5").
   Not self-scored by the agent — recorded as given, consistent with the review-evaluation
   convention.
5. **No Instruction Fidelity score recorded.** @mekhal's close comment noted "coding no score on
   this issue" — this issue never wrote or shipped code (verification-only, by its own scope), so
   there is nothing to fidelity-score against a coding instruction. Left blank in the eval entry
   rather than guessed.
6. **New skill candidate drafted: presenting multi-item comparisons as a Markdown table.**
   @mekhal explicitly asked mid-thread for the dead-code findings "ทำเป็นตาราง" (as a table) instead
   of prose, and confirmed satisfaction with the result at close. Drafted as
   `docs/knowledge-asset/published/comparison-table-for-multi-item-reviews.md` per the write-guard
   workaround — @mekhal decides add/update/skip.
7. **Not proposed for the case-study showcase.** Same reasoning as #573's close: an audit/
   verification-only issue with no shipped code isn't the "clean, illustrative end-to-end loop" the
   showcase in `data/case-studies.json` is meant to hold. Left unchanged.

## Why

Decision 3 exists because #578's own scope (written at issue-open time) explicitly pre-committed to
"open a separate ticket if deletion is the call" — honoring that when the approval actually arrived
keeps `CLAUDE.md`'s "missed functionality becomes a NEW issue" rule intact even though the human's
approval and the verification work happened in the same thread.

Decision 6 exists because a table-formatted comparison is a repeatable pattern worth capturing:
whenever a review/close comment needs to communicate an N-item audit against the same set of
criteria (dead-code candidates, before/after migrations, option tradeoffs), a table lets the human
scan and decide in one pass instead of parsing repeated prose paragraphs — the same "capture the
decision so the agent improves next round" motivation behind every other published skill.

## Impact

- No files deleted, moved, or edited by #578's own verification turns (Out of scope honored).
- This close-step PR adds only: this decision doc, one `ai-review-evals/` entry, and the new
  knowledge-asset skill draft — no app/test/config file changes.
- Deletion work for `app.js` + its 14 dependent tests is fully scoped in
  [#585](https://github.com/mekhal/aidlc-radio-calico/issues/585), Test PR pre-waived per @mekhal's
  instruction in this issue's thread.
- `docs/knowledge-asset/published/comparison-table-for-multi-item-reviews.md` is a new file from
  this issue's own work, pending @mekhal's add/update/skip decision on formalizing it as
  `.claude/skills/comparison-table-for-multi-item-reviews/SKILL.md` (human-only copy, write-guard).
- `data/case-studies.json` left unchanged — not proposed as a showcase candidate, same reasoning as
  #573.
