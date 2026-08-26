# Decision: Issue #509 (What's this page — Ticket 2: diagram images) closed at Instruction Fidelity 4 / Result Satisfaction 4

**Issue:** [#509](https://github.com/mekhal/aidlc-radio-calico/issues/509) — Ticket 2 of the "What's this" bilingual + diagram embedding story, [#505](https://github.com/mekhal/aidlc-radio-calico/issues/505)
**PR:** [#514](https://github.com/mekhal/aidlc-radio-calico/pull/514) (Test PR), [#515](https://github.com/mekhal/aidlc-radio-calico/pull/515) (Code PR), [#517](https://github.com/mekhal/aidlc-radio-calico/pull/517) (GH Pages 404 follow-up fix) — all merged to `develop`
**Decided by:** @mekhal, 2026-08-26

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 4, Result Satisfaction 4.** Per `CLAUDE.md`'s
   rule that the agent never self-scores. Logged in
   `ai-review-evals/2026-08-26_0920_issue-509_ticket2-diagram-images-close.md`.

2. **Two concrete complaints behind the scores, recorded here for context:**
   - *"บางตำแหน่ง ไม่ต้องใส่รูปก็ได้"* ("some positions didn't need an image") — the plan's AC2
     ("exactly one matching diagram image" per section) mapped 1 image to all 3 sections uniformly.
     @mekhal had agreed to this 1:1 mapping at plan time (2026-08-25, recorded in the issue body),
     but on seeing the shipped result judged that not every section actually benefited from a
     diagram. No section is being reverted as part of this close — recorded as a lesson for how
     future "add N images to M sections" plans should be scoped (see Lessons Learned), not an
     open action item.
   - *"รูปไม่ขึ้น ต้องมาแก้ไล่เช็คเองให้ขึ้น"* ("images didn't show, had to debug/check it myself to
     get them to show") — refers to the GitHub Pages 404 bug fixed in follow-up PR #517: the new
     `image.src` values in `data/whats-this-content.json` are repo-root-relative, but
     `pages/whats-this.html` renders one directory below repo root, so the images 404'd until
     @mekhal reported it and a follow-up fix applied a page-level rewrite
     (`rewriteSectionImagePaths()` in `whats-this/whats-this-page.js`).

3. **Root cause of complaint 2 traced to a known, already-documented pattern that was not
   applied.** `docs/decisions/2026-08-10-issue-299-repo-relative-path-base-path-pattern.md`
   documents exactly this bug class — a root-relative path (image src, fetch URL, etc.) that only
   resolves correctly from the exact page depth its author had in mind — and lists three prior
   fixes for it (`window.__I18N_BASE_PATH__` in `app.js`/#101,
   `window.__ALBUM_PROMO_I18N_BASE_PATH__` in `shared/translations.js`/#253,
   `window.__SIDEBAR_BASE_PATH__` in `sidebar/sidebar.js`/#299). That decision doc even flagged
   itself as "a candidate for formal promotion to a skill... to be proposed at [#299's] close
   turn," but no skill file was ever published from it. Issue #509's Code PR (#515) added a new
   root-relative path (`image.src`) without checking for this pattern, reproducing the exact same
   bug for a 4th time — caught only after @mekhal saw it broken on the live page, not by the unit
   test suite (jsdom-style tests don't exercise real relative-URL resolution across page depths).

4. **New skill proposed, based on decision 3 — see the `SKILL.md` draft in
   `docs/knowledge-asset/published/root-relative-path-audit-for-nested-pages.md`, not yet copied
   into `.claude/skills/` per the write-guard workaround:** before merging any Code PR that adds a
   new root-relative asset path (`img src`, `fetch()` URL) rendered from a page below repo root,
   rewrite it immediately in that same PR using whichever of this codebase's two established
   patterns already fits (the `window.__MODULE_BASE_PATH__` override for shared modules, per
   `docs/decisions/2026-08-10-issue-299-repo-relative-path-base-path-pattern.md`; or the per-page
   `-page.js` mount-time rewrite already used for the logo in `buildHeader()`) — and do not rely on
   the unit test suite alone to catch a page-depth path bug, since it won't.

5. **Not proposed as a Case Study showcase candidate.** Real, unresolved-feeling complaints behind
   a 4/4 score don't read as the "clean, illustrative" example the showcase curation calls for —
   same reasoning used to skip the showcase at lower/mixed scores on #152's follow-up close and
   #151's close.

## Why

Decision 2 records both complaints faithfully without editorializing them into something more or
less severe than what @mekhal actually said.

Decision 3/4 exist because this is now the **fourth** occurrence of the identical root-relative-path
bug class (#101, #253, #299, #509) — including one prior explicit call to turn it into a skill that
never happened. Letting a documented, three-times-proven fix pattern sit undiscovered in
`docs/decisions/` instead of `docs/knowledge-asset/published/` is the direct, traceable cause of
complaint 2; promoting it now closes that gap rather than deferring a fifth time.

Decision 5 follows the established precedent (`docs/decisions/2026-08-21-issue-152-whats-this-followup-close-scores-and-i18n-gap.md`,
`docs/decisions/2026-08-18-issue-151-about-page-close-scores-and-followups.md`) of not curating a
showcase entry when the close itself surfaces real complaints, even at moderate scores.

## Impact

- Issue #509 stays closed at its shipped scope (Ticket 2's 3 diagram images + the #517 path fix),
  merged to `develop`. This close adds one evaluation entry and one proposed skill file — it does
  not reopen or change any shipped code.
- `docs/knowledge-asset/published/root-relative-path-audit-for-nested-pages.md` is a new file from
  this issue's own work, pending @mekhal's add/update/skip decision and, if added, a human copy
  into `.claude/skills/root-relative-path-audit-for-nested-pages/SKILL.md`.
- `data/case-studies.json` left unchanged.
- No new issue opened for the "some positions didn't need an image" complaint — it's a plan-time
  scoping lesson (Lessons Learned in the eval file), not a shippable bug; the sections are not
  being reworked as part of this close.
