# Decision: Issue #402 (What's this page — Ticket 1: scaffold + nav wiring) closed at Instruction Fidelity 5 / Result Satisfaction 5

**Issue:** [#402](https://github.com/mekhal/aidlc-radio-calico/issues/402) — Ticket 1 of parent story [#152](https://github.com/mekhal/aidlc-radio-calico/issues/152) ("What's this" page)
**PR:** [#406](https://github.com/mekhal/aidlc-radio-calico/pull/406) (Test PR) · [#407](https://github.com/mekhal/aidlc-radio-calico/pull/407) (Code PR) — both merged to `develop`
**Decided by:** @mekhal, 2026-08-20

## Decision

1. **Scores given directly at close:** Instruction Fidelity 5, Result Satisfaction 5 ("approved coding 5 satisfied 5"), with explicit praise for the Test PR / Code PR split being clean and easy to review ("แบ่งได้ clean ดี ง่ายในการเช็ค Test PR และก็ Code PR"). Recorded as-is per `CLAUDE.md`'s rule that the agent never self-scores — same precedent as [[2026-08-20-issue-152-whats-this-page-close-scores-and-ticket-splitting-skill]].
2. **No new skill candidate captured from this issue's own work.** #402 is the concrete instance of the ticket-splitting pattern already distilled into a skill at the parent #152's close (`docs/knowledge-asset/published/split-story-into-review-sized-sub-issues.md`); the human's positive feedback here confirms that skill worked as intended rather than surfacing a new one. The one #402-local judgment call — verifying that `about-page.js`/`case-study-page.js`/`test-report-dashboard.js` needed no changes because their existing generic non-hash href-rewrite logic already covered `whatsThis`'s new path, rather than editing them defensively — was a routine reuse-first check, not a decision with consequences beyond the literal AC, so it isn't logged as a separate skill candidate.
3. **Case Study showcase already considered at the parent level.** #152's own close doc proposed the full 4-ticket "What's this" story as a showcase candidate (left for human confirmation); no separate consideration is needed at this sub-issue level.

## Why

Decision 1 follows the same "never grade its own homework" principle already established in the `ai-review-evals` framework.

Decision 2 avoids skill-list churn: `CLAUDE.md`'s close-step instructions ask only for candidates *surfaced by this issue's own work*, not a re-review of skills already captured elsewhere. #402 executed the pattern #152 already named — repeating that capture here would just duplicate [[2026-08-20-issue-152-whats-this-page-close-scores-and-ticket-splitting-skill]] without adding new information.

Decision 3 avoids duplicating a showcase proposal that's already pending the human's confirmation at the parent story's close doc.

## Impact

- Issue #402 (Ticket 1: `pages/whats-this.html` scaffold, `whats-this/whats-this-page.js`, `menu/menu.js` nav wiring, `config/cdn-sources.json` `usedIn` updates) is fully merged to `develop` via #406/#407.
- No new file added under `docs/knowledge-asset/published/` from this close — the existing `split-story-into-review-sized-sub-issues` skill already covers what this ticket demonstrated.
- Tickets 2-4 (#403, #404, #405) proceed independently; their own `@claude close` turns record their own decision docs/eval entries when the human triggers them.
