# Decision: Issue #559 (logo wordmark links to radio-calico.com) closed at Instruction Fidelity 5 / Result Satisfaction 5

**Issue:** [#559](https://github.com/mekhal/aidlc-radio-calico/issues/559) — make the header logo
wordmark clickable, linking to `https://www.radio-calico.com`
**PRs:** [#562](https://github.com/mekhal/aidlc-radio-calico/pull/562) (Test PR) and
[#564](https://github.com/mekhal/aidlc-radio-calico/pull/564) (Code PR), both merged to `develop`
**Decided by:** @mekhal, 2026-08-29

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 5, Result Satisfaction 5.** Per `CLAUDE.md`'s
   rule that the agent never self-scores; the human supplied them directly in the close comment
   ("coding 5", "satisfied 5") alongside confirmation that the shipped link works, with a
   screenshot. Logged in
   `ai-review-evals/2026-08-29_1231_issue-559_logo-link-close.md`.

2. **Full loop ran clean, reusing two pre-existing published skills correctly, no rework cycle.**
   The step-2 plan surfaced 3 open questions (scope: all pages vs. index-only; new tab vs. same
   tab; accessibility label). The next comment was a bare `@claude approved` that didn't answer
   any of them individually — per `open-questions-survive-approval`, the agent proceeded on its
   own stated fallback/defaults (all pages, new tab, `aria-label`) and disclosed each assumption
   explicitly in the Test PR turn's comment rather than silently folding them into "approved".
   At step 6, `code-pr-implements-test-pr-contract` was applied: the Code PR implemented exactly
   the `<a href/target/rel/aria-label>` attribute contract the merged Test PR (#562) had already
   recorded, with no invented mechanism. Both skills already existed in
   `docs/knowledge-asset/published/` from prior issues (#529 and an earlier issue respectively) —
   this issue is a reuse/reinforcement of them, not their origin.

3. **No new skill candidates surfaced by this issue's own work.** The change was a straightforward
   reuse-first edit to a single shared factory function (`buildLogo()` in `logo/logo.js`), applied
   everywhere it's called. One minor observation, not rising to a skill: `logo/logo.js` hand-rolls
   `target="_blank"`/`rel="noopener noreferrer"`/`aria-label` rather than calling the existing
   `createIconLink()` helper (`shared/helpers.js`) that already centralizes that exact attribute
   trio — but `createIconLink()`'s DOM shape (a single `<i>` icon child, `dataset.testid`, `title`)
   doesn't match the wordmark's shape (text node + `<img>` + text node), so reusing it as-is would
   have required changing the helper's contract for one caller. Not flagged as a defect; left as-is
   since the Test PR (#562) had already locked in the attribute contract before this was noticed.
   Per `CLAUDE.md`, this closes with **zero skill changes**.

4. **Case Study showcase: proposed but flagged as a weak candidate, pending @mekhal's call.** The
   loop itself was clean (no rework, 5/5), but the change is small (one attribute set on one
   existing element, no new UI, no design decision beyond the 3 open questions above) compared to
   the existing showcase entries (#245 architecture split, #294 dark-theme bug, #158 flicker fix).
   Not added to `data/case-studies.json` — see the "Ask when in doubt" rule; a human confirmation is
   requested before adding, and the recommendation here leans toward skipping it as too minor for a
   curated showcase.

## Why

Decision 2 exists to give this issue's outcome a data point independent of #529's: the
`open-questions-survive-approval` skill was applied a second time, on a different kind of ticket
(styling/UX choices for #529 vs. simple attribute defaults here), and still produced a 5/5 result —
some early evidence the skill generalizes rather than being a one-off fix for #529's specific
situation.

Decision 3 exists so the "hand-rolled vs. shared helper" duplication is on record even though it
isn't being changed now — if `logo/logo.js` or `shared/helpers.js` is touched again later, this
note explains why the duplication exists rather than looking like an oversight.

Decision 4 exists because the case-study curation criteria (`CLAUDE.md`'s "Case study showcase"
section) explicitly says not every closed issue belongs — recording the reasoning here rather than
silently skipping it keeps the "why not" auditable the same way an "add" decision would be.

## Impact

- Issue #559 stays closed at its shipped scope (PRs #562 and #564, both merged) — no further code
  changes result from this close.
- No files added under `.claude/skills/` or `docs/knowledge-asset/published/` from this issue.
- `data/case-studies.json` left unchanged pending @mekhal's confirmation (lean: skip).
