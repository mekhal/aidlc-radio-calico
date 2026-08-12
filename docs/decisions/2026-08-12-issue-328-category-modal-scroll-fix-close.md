# Issue #328 close — category modal fixed header / scrollable body

## Context

Issue #328 reported that the Test Report Dashboard's category drill-down popup
(`.report-category-modal`) let its Close button scroll out of view on long test lists, because the
whole popup box — heading, Close button, and results list together — was one scrollable region
(`max-height: 80vh; overflow-y: auto` on the outer dialog).

The loop ran across two turns:

1. Step 2 plan + AC posted (5 ACs: fixed header, list-only scroll, Close always clickable, no
   visual/color changes, existing test suites keep passing) — see the plan comment on the issue.
   Flagged as out-of-scope-for-this-loop that `.chloe-recently-played-modal`
   (`RadioCalicoStyle`/`album-promo.css:260-275`) has the identical single-scrollable-box pattern
   and may have the same bug, per "missed functionality becomes a new issue."
2. `@claude approved  skip Test PR` — Test PR waived directly by @mekhal at step 3, per
   `CLAUDE.md`'s explicit-waiver allowance. Code PR
   [#331](https://github.com/mekhal/aidlc-radio-calico/pull/331) split `openCategoryModal()`'s
   markup into a `.report-category-modal__header` (heading + Close, `flex-shrink: 0`, never
   scrolls) and a `.report-category-modal__body` (results list only, carries the `overflow-y:
   auto` that used to live on the whole dialog). Outer dialog became `display: flex;
   flex-direction: column`, same `max-height: 80vh`, no background/padding/border-radius/color
   changes. PR #331 merged into `develop`.
3. `@claude close  coding 5 satisfied 5` — scores given directly, with a screenshot, no reason
   attached.

## Decision

1. **Test PR waived, not proposed by the agent.** @mekhal's own words at step 3 ("skip Test PR")
   made the waiver explicit and final, consistent with `CLAUDE.md`'s rule that only the human's
   explicit answer at that gate makes a skip final.
2. **AC verified by manual review, not an automated run.** This repo's test suite only executes by
   opening `tests/test-runner.html` in a browser (`docs/decisions/2026-07-12-testing-framework-vanilla-runner.md`);
   the agent's sandbox has no browser tooling, so the Code PR comment documented AC-by-AC manual
   verification against the new DOM/CSS structure instead, and asked @mekhal to confirm green after
   merge — which the close-turn screenshot (test report dashboard, category modal with header/Close
   fixed and only the results list under the scrollbar-area annotation) satisfies.
3. **Recently Played modal's identical pattern was flagged again but not touched.** It was already
   flagged out-of-scope at step 2; no later turn asked for it to be pulled into this loop, so the
   Code PR left `album-promo.css`'s `.chloe-recently-played-modal` untouched. Whether to open a new
   issue for it is left to @mekhal (asked directly in the close-turn comment) rather than decided
   unilaterally by the agent.
4. **Case Study showcase (`data/case-studies.json`) — not yet applicable.** The file doesn't exist
   yet, so this close does not propose a showcase entry.

## Non-decision

No skill is being auto-added — a candidate (a reusable "modal fixed-header / scrollable-body"
pattern, given the Recently Played modal shares the same underlying structure) is proposed in the
close-turn comment for @mekhal to accept, update an existing skill instead, or skip.
