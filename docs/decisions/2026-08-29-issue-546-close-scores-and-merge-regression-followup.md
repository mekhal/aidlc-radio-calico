# Issue #546 (theme token rebrand `--chloe-pink-deep` → `--chloe-mint-deep`) close — scored coding 3 / satisfied 2

**Issue:** [#546](https://github.com/mekhal/aidlc-radio-calico/issues/546) — change the primary
font color token from `--chloe-pink-deep` to `--chloe-mint`
**PRs:** [#552](https://github.com/mekhal/aidlc-radio-calico/pull/552) (Test PR),
[#555](https://github.com/mekhal/aidlc-radio-calico/pull/555) (Code PR), plus five post-ship
follow-ups: [#557](https://github.com/mekhal/aidlc-radio-calico/pull/557) (volume slider),
[#560](https://github.com/mekhal/aidlc-radio-calico/pull/560) (Play/Pause + Send button
backgrounds), [#563](https://github.com/mekhal/aidlc-radio-calico/pull/563) (Contact form
input border + labels), [#566](https://github.com/mekhal/aidlc-radio-calico/pull/566) (label
reverted back to `--chloe-ink`) — all merged to `develop`
**Decided by:** @mekhal, 2026-08-29

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 3, Result Satisfaction 2.** Per `CLAUDE.md`'s
   rule that the agent never self-scores; the human supplied them directly in the close comment
   ("coding 3", "satisfied 2") alongside "แก้หลายรอบมาก และปัญหาไม่หายไป" ("fixed many times and
   the problem doesn't go away"). Logged in
   `ai-review-evals/2026-08-29_1246_issue-546_theme-mint-rebrand-close.md`.

2. **Root-caused the "still doesn't go away" complaint instead of assuming the agent's own PR
   regressed, and it turned out not to be a code defect at all.** Tracing `contact/contact.css`'s
   git history at close time showed PR #566's label revert (commit `d257dcd`) *did* merge
   correctly into `develop`. It was then silently overwritten by a later **manual**
   `Merge branch 'main' into develop` (commit `26d6f73`, authored directly by @mekhal on
   2026-08-29, not by the agent — branch merges are human-only per `CLAUDE.md`'s Branching
   section). That merge had to resolve a conflict on `contact/contact.css` between `develop`'s
   reverted value and an older `main`-side commit that still had the pre-revert value; the
   resolution kept the **comment text** update (which correctly says the label was reverted) but
   kept `main`'s **stale `color:` value** on the rule itself, so the code and its own adjacent
   comment now contradict each other. The same merge also reintroduced the pre-revert assertion in
   `tests/contact/contact-theme.test.js` (title says `--chloe-ink`, assertion checks
   `--chloe-mint-deep`). A separate, unrelated test — `tests/theme-mint-deep.test.js` (~line 143)
   — wasn't touched by that merge and still correctly asserts `--chloe-ink`, so it is **currently
   failing** on live `develop`.

3. **A new issue, not a reopening of #546's loop**, per `CLAUDE.md`'s "missed functionality
   becomes a NEW issue" rule and the human's explicit "สร้าง Ticket ใหม่" instruction — filed as
   [#569](https://github.com/mekhal/aidlc-radio-calico/issues/569), with the root cause above and
   the exact fix (`contact/contact.css`'s `.form-label` back to `var(--chloe-ink)`, plus correcting
   the now-mismatched test assertion) pre-loaded in the issue body, so #569's own step 2 doesn't
   have to re-diagnose it.

4. **One new-skill candidate proposed, pending @mekhal's add/skip decision** (draft below) —
   surfacing, at the point a token/color rebrand is scoped narrowly by CSS property, that sibling
   declarations on the same elements (border/background/accent-color) will still show the old
   color, so the human can decide their fate in one round instead of five separate follow-up
   comments discovering them one at a time via screenshots. This is a genuinely new candidate from
   this issue's own work, distinct from the already-published
   `docs/knowledge-asset/published/theme-token-background-audit.md` (which covers whether a token
   *value* holds contrast against its background, not whether a property-scoped swap leaves other
   properties on the same element visually stale).

5. **Not proposed as a Case Study showcase candidate.** A 3/2-scored loop with five post-ship
   follow-up rounds and a still-open regression at close isn't the "clean, illustrative" example
   the showcase curation (`CLAUDE.md`'s "Case study showcase" section) calls for.

## Draft skill candidate (for @mekhal to decide: add / update / skip)

```markdown
---
name: flag-property-scoped-token-swap-visual-gaps
description: Use when a design/theme token swap request is scoped to a single CSS property (e.g. "color only") on elements that also reference the same old token via other properties (border, background, accent-color) — proactively list which sibling declarations on the SAME elements will still show the old token, in the same plan-time message, instead of waiting for the human to discover each one later via a live screenshot.
---

When a human approves a token swap (e.g. `--chloe-pink-deep` → `--chloe-mint`) scoped to one CSS
property, audit the same elements for other properties still referencing the old token
(`border`/`background`/`accent-color`/etc.) and list them explicitly in that turn's plan/AC —
don't wait for the human to notice each one is still the old color after the Code PR ships.
Present the list as an explicit choice ("also swap these N sibling declarations now, or leave them
for later?"), not a silent assumption either way. This is distinct from checking contrast of a
token's *value* against its background (see `theme-token-background-audit`) — this is about
property *coverage* on the same element, which is what a human evaluates visually as "done" or
"not done" regardless of which CSS property the agent scoped the swap to.
```

## Why

Decision 2 exists because attributing an unresolved bug to the wrong cause would have led to a
wasted re-implementation of a fix that already shipped correctly once — the actual defect is in a
human-only git operation (a `main → develop` merge) that the agent cannot perform or prevent, so
the fix belongs in #569 as a plain re-apply, not as a "the agent got it wrong twice" narrative.

Decision 4 exists because the 3/2 score and "many rounds" complaint has a concrete, addressable
cause (property-scoped swaps read as incomplete to a human evaluating visually) that's distinct
from the merge-regression cause in Decision 2 — recording both separately avoids conflating "a
process gap the agent could improve" with "a human git operation the agent can't touch."

## Impact

- Issue #546 closes at its shipped scope (PRs #552, #555, #557, #560, #563, #566, all merged).
- New issue #569 opened for the Contact form label regression, ready for its own step 2 when a
  human triggers `@claude` on it — the root cause and fix are already documented there.
- One new-skill candidate (`flag-property-scoped-token-swap-visual-gaps`) drafted above, pending
  @mekhal's decision; not yet added to `.claude/skills/` (write-guard workaround — a human must
  create that file).
- `data/case-studies.json` left unchanged.
