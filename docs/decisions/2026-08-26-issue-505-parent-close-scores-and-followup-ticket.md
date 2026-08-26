# Issue #505 (parent: "What's this" page bilingual + diagram embedding) close — scored coding 4 / satisfied 4

## Context

Issue #505 is the parent tracking issue for the "What's this" page bilingual (TH/EN) + diagram
embedding story, split at step 3 into two independently-run sub-issues per
`docs/knowledge-asset/published/split-story-into-review-sized-sub-issues.md`:

- **#508** (Ticket 1: bilingual TH/EN infrastructure + content) — closed 2026-08-26 at
  Instruction Fidelity 4 / Result Satisfaction 4, no defect reported
  (`docs/decisions/2026-08-26-issue-508-ticket1-close-scores.md`).
- **#509** (Ticket 2: embed 3 diagram images with bilingual captions) — closed 2026-08-26 at
  Instruction Fidelity 4 / Result Satisfaction 4, with two concrete complaints recorded: some
  sections didn't need an image, and the images 404'd on GitHub Pages until a follow-up fix
  (PR #517) rewrote the root-relative `image.src` paths
  (`docs/decisions/2026-08-26-issue-509-ticket2-close-scores-and-path-audit-skill.md`).

@mekhal then posted `@claude close coding 4 satisfied 4` on the **parent** issue #505 itself,
repeating the "รูปไม่ขึ้นต้องไปไล่แก้เอง" ("images didn't show, had to debug it myself") complaint
already recorded at #509's close, and reporting 3 new concrete follow-up problems found after
using the shipped page:

1. Remove the `whatIsThis` section's image (`code-pr-gates.jpg`) entirely.
2. The `aidlcLoop` section's image (`aidlc-loop-gates.jpg`) renders too large and its
   caption/alt text needs to actually explain the diagram.
3. The `skillCapture` section's image (`skill-reuse-gates.png`) has the same two problems.

## Decision

1. **Scores recorded verbatim on the parent close: Instruction Fidelity 4, Result Satisfaction 4.**
   Per `CLAUDE.md`'s rule that the agent never self-scores. Logged in
   `ai-review-evals/2026-08-26_0945_issue-505_whats-this-parent-close.md`.

2. **The repeated "images didn't show" complaint is not a new bug and gets no new fix here.**
   It's the same GitHub Pages 404 already root-caused and fixed at #509's Code PR follow-up
   (PR #517), and already produced a proposed (not yet human-decided) skill,
   `docs/knowledge-asset/published/root-relative-path-audit-for-nested-pages.md`. Recording it a
   second time at the parent close without a new diagnosis would duplicate that work rather than
   add to it — this close cross-references it instead of re-deriving it.

3. **The 3 new follow-up problems become a new issue, not a reopening of #505's loop**, per
   `CLAUDE.md`'s "missed functionality becomes a NEW issue" rule — filed as
   [#522](https://github.com/mekhal/aidlc-radio-calico/issues/522), a standalone ticket (not a
   sub-issue of #505, since #505 is closing) that references #505/#508/#509 for context and
   explicitly excludes the already-fixed 404 bug and the already-decided image-density question
   from its scope, so a future `@claude review` on #522 doesn't re-litigate either.

4. **No new-skill candidates from #505's own close-turn work.** The one relevant lesson (the
   root-relative-path bug class) was already surfaced and drafted as a skill at #509's own close
   and is still pending @mekhal's add/update/skip decision — this turn does not re-propose it or
   invent a duplicate.

5. **Not proposed as a Case Study showcase candidate**, consistent with #509's close precedent:
   a parent close carrying forward an unresolved-feeling complaint plus 3 fresh follow-up problems
   doesn't read as the "clean, illustrative" example the showcase curation calls for.

## Why

Decision 2 avoids two failure modes: silently ignoring feedback the human repeated (which would
look like the agent wasn't listening), and re-diagnosing/re-proposing a fix or skill that already
exists and is already awaiting a human decision (which would create a confusing duplicate trail
across two decision docs for the same root cause).

Decision 3 keeps the parent issue's closing scope limited to what was actually shipped and
evaluated (#508 + #509), rather than letting new UI polish requests silently reopen or extend a
loop that's otherwise done — matching the same reasoning already applied when #509's own
"some positions didn't need an image" complaint was recorded as a lesson rather than reworked
in-place.

## Impact

- Issue #505 (parent) closes at its shipped scope: sub-issues #508 and #509, both merged to
  `develop`. Nothing in shipped code is reopened or changed by this close.
- New issue #522 opened for the 3 image-sizing/removal/caption problems, ready for its own step 2
  (5 questions + plan) when a human triggers `@claude` on it.
- No new skill files from this issue's own close-turn work; `root-relative-path-audit-for-nested-pages`
  stays pending from #509's close, unchanged by this decision.
- `data/case-studies.json` left unchanged.
