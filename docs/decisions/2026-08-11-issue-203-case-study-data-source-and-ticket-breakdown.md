# Decision: Case Study tab data source, curated-showcase scope, and ticket breakdown

**Issue:** [#203](https://github.com/mekhal/aidlc-radio-calico/issues/203) (parent story)
**Decided by:** @mekhal, 2026-08-11

## Decision

1. **Data source: hand-curated `data/case-studies.json`** (Option 1 of the 3 raised in the step-2 review comment), not a client-side markdown parser over `ai-review-evals/*.md` and not any other generated-index mechanism. The file is authored/updated by hand alongside `@claude close` events, matching this repo's existing static-JSON pattern (i18n files) and its no-backend/no-build-step constraint.
2. **Curated showcase, not a full listing:** the Case Study dashboard shows only **2–3 highlight cards** for issues whose AI-DLC loop closed completely end to end — not every `ai-review-evals/` entry. Final case selection happens inside Ticket 2's own step-2 plan (see below), not decided on the parent thread.
3. **Summary Metrics & Trends sits at the top of the dashboard**, above the highlight cards — a short overview (aggregate metrics/trend visualization) first, curated case detail below.
4. **New standing rule added to `CLAUDE.md`** (see `## Case study showcase` section, synced to `README.md`/`README.th.md`): once `data/case-studies.json` exists, `@claude close` also considers whether the closing loop is a good showcase candidate and proposes an entry for human confirmation — it does not write to the file unprompted.
5. **Broken into 3 sub-tickets**, opened as plain GitHub issues referencing this parent (same pattern as issue #245's Ticket A–E breakdown — no native GitHub sub-issue linking used in this repo, just a `## Parent` section in the body):
   - **Ticket 1** (AC1, AC5): nav tab only — add `caseStudy` between `whatsThis` and `contact` in `menu/menu.js` (`NAV_KEYS`/`NAV_HREFS`), translations in both `i18n/album-promo-*.json` files, verify markup parity between `index.html` and `album-promo.html`. Unblocking; no dependents required first.
   - **Ticket 2** (AC2, part of AC4): `data/case-studies.json` + the curated Highlight Cards section rendering it. Case selection + the file's field shape are decided inside Ticket 2's own step 2, not here.
   - **Ticket 3** (AC3, part of AC4): Summary Metrics & Trends section (raw SVG/table, no new charting CDN dependency — following `tests/test-report-dashboard.js` precedent, since `config/cdn-sources.json` has no charting library registered). Depends on Ticket 2 landing first (same data shape).
   - AC4 (responsive) is not a standalone ticket — folds into Tickets 2 and 3's own PRs, split out only if review surfaces a real gap, matching the original review comment's proposal.

## Why

The step-2 review comment (2026-08-11T16:40:29Z) flagged that `ai-review-evals/` is a folder of human-authored Markdown files with no generated index, and this app has no backend/build step to turn that into page content — so the data-source choice had to be resolved before AC2/AC3 could be made concrete. The human's answer picked the simplest, most consistent-with-existing-patterns option and added the curated-showcase/summary-placement/CLAUDE.md-rule requirements in the same comment. Splitting into tickets follows the repo's established multi-part-story pattern (`docs/decisions/2026-08-04-issue-245-component-split-architecture-and-ticket-breakdown.md`) and the hard rule that large work must be split for reviewability.

## Impact

- `data/case-studies.json` does not exist yet — created in Ticket 2.
- `CLAUDE.md`, `README.md`, `README.th.md` gained a new `Case study showcase` rule effective immediately, but it is a no-op until Ticket 2 lands (there's no file to consider yet).
- Sub-issues for Tickets 1–3 are opened against this repo referencing #203 as parent; each runs its own step 3→7 loop independently.
