# Issue #432 close — scored coding 3 / satisfied 5; hard-reset rule formalized, two overlapping skill files deprecated

## Context

Issue #432 (split out from [#419](https://github.com/mekhal/aidlc-radio-calico/issues/419)'s close, per `CLAUDE.md`'s "missed functionality becomes a NEW issue" rule) asked for the Contact Info inspiration paragraph to follow the site-wide language toggle instead of always rendering both Thai and English. Two rounds of `@claude review` were needed to reconcile ambiguous feedback before the scope was confirmed as: (1) the inspiration paragraph follows `state.lang`, and (2) the contact form's Name/Email/Message labels + Send button, previously hardcoded English literals with zero i18n, also gain toggle-following i18n — both shipped together in one Code PR per @mekhal's explicit instruction ("รวมไว้ใน Ticket นี้เลย... ไปพร้อมกันใน PR เดียว"). Test PR [#440](https://github.com/mekhal/aidlc-radio-calico/pull/440) and Code PR [#442](https://github.com/mekhal/aidlc-radio-calico/pull/442) both merged to `develop`; @mekhal separately opened and merged [#443](https://github.com/mekhal/aidlc-radio-calico/pull/443) (`develop` → `main`) themselves — a human-only Production Release action, not something this agent did.

At close, @mekhal confirmed the language-toggle behavior now works ("เปลี่ยน ภาษาได้ตามที่ต้องการ" — "was able to change the language as wanted"), scored **coding 3, satisfied 5**, and added three notes:

1. ทุกครั้งที่ Test PR หรือ Code PR จะต้อง Reset hard ไป ที่ develop branch เสมอ ("every time there's a Test PR or Code PR, must always hard-reset to the develop branch")
2. ย้าย Knowledge ที่ทับซ้อนเข้า Deprecated ("move overlapping Knowledge into Deprecated")
3. ต้องทำ สอง ภาษา ตาม Toggle ภาษา ("must do two languages per the language toggle") — restating the AC that this issue's own Code PR already delivered.

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 3, Result Satisfaction 5.** Per `CLAUDE.md`'s rule that the agent never self-scores. Logged in `ai-review-evals/2026-08-21_1557_issue-432_contact-info-language-toggle-close.md`. The gap between a mediocre coding score and a high satisfaction score reads as: the shipped behavior is exactly right, but the process to get there had friction — consistent with note 1 below, and with the same coding/satisfied split already seen on the closely-related [[2026-08-11-issue-305-branch-hygiene-fresh-cut-from-develop]] (coding 4/satisfied 5 there).

2. **Note 1 formalizes an open question from [[2026-08-11-issue-305-branch-hygiene-fresh-cut-from-develop]].** That decision doc explicitly left "whether to formalize [always resetting fresh branches] as an explicit Hard rule... is left to the human to decide." This close comment is that decision. `CLAUDE.md`'s Hard rules sync-check bullet (and both README Branching rows) is amended: for a brand-new step-4/step-6 branch with no pushed remote history yet, the `git reset --hard origin/develop` is now unconditional — it no longer waits on `git diff HEAD origin/develop --stat` to show a content difference before resetting. This closes the actual gap #305 exposed: a locally-continued commit chain from an already-merged, rebase-squashed issue can have identical file content while still being ancestrally stale, so a content-diff gate can silently pass over the exact situation it exists to catch. The safety carve-out (never force-reset a branch that already has its own pushed commits — e.g. follow-up work on an open PR) is unchanged and still unconditional, since that's a different scenario (protecting real in-review work, not detecting staleness on a not-yet-pushed branch).

3. **Note 2 acted on directly.** Two files in `docs/knowledge-asset/published/` were found to be fully redundant with content already promoted into `CLAUDE.md`'s Hard rules verbatim, not just related to it:
   - `pr-followup-on-pr-not-issue.md` — duplicates the "Follow-up changes to an already-open PR must be commented on that PR itself" Hard rule.
   - `cross-reference-out-of-scope-findings-on-related-tickets.md` — duplicates the "missed functionality becomes a NEW issue" bullet's exception clause for a related, already-sequenced sibling ticket.

   Both are now Hard rules that `CLAUDE.md` (always loaded every turn) already states in full; keeping a second, separately-maintained `published/` copy of the same guidance was pure duplication with no added coverage, and a future edit to one copy risks drifting from the other. Moved both to `docs/knowledge-asset/deprecated/` with a note explaining why, per the "when a published file becomes outdated, move it" instruction in `CLAUDE.md`'s "Using a skill" section (this move is outside `.claude/`, so the agent can do it directly). The remaining 9 `published/` files were checked and are each about a distinct topic not otherwise covered verbatim in `CLAUDE.md` — no further moves made.

   Consistent with this same reasoning, note 1's fix was applied as a `CLAUDE.md` Hard-rule edit directly, **not** as a new companion skill file — creating one would immediately re-create the exact kind of duplication just removed.

4. **Note 3 is confirmation, not new scope.** #432's own AC (inspiration paragraph + contact form labels following `state.lang`) is exactly what Code PR #442 shipped; no further code change was made in this close turn.

5. **No new skill candidate captured from this issue's core work.** The two rounds of scope clarification during review were already handled by the existing `gate-trigger-vs-intent-mismatch` and `review-ui-changes-with-mockup` skills (both consulted and applied mid-thread); nothing new surfaced there worth a dedicated skill file.

6. **Not proposed as a Case Study showcase candidate this close.** Per [[2026-08-11-issue-203-case-study-data-source-and-ticket-breakdown]]'s curation guidance, a coding-3 score (even with satisfied-5) reflects real process friction across the thread — not the "clean, illustrative" example the showcase is meant to hold.

## Why

Formalizing the fresh-branch reset (decision 2) turns a repeated, human-flagged friction point ("ปัญหานี้ผมเคยเจอบ่อยมาก" on #305; recurring again here) into an unconditional rule rather than leaving it as agent judgment, which is exactly what caused it to be missed before. Deprecating the two duplicate skill files (decision 3) keeps `docs/knowledge-asset/published/` matching its own purpose — active guidance not already covered elsewhere — rather than accumulating copies that can silently drift from the Hard rules they duplicate.

## Impact

- `CLAUDE.md`, `README.md`, `README.th.md`: Hard rules sync-check bullet / Branching table rows amended to make the fresh-branch reset unconditional.
- `docs/knowledge-asset/published/pr-followup-on-pr-not-issue.md` and `.../cross-reference-out-of-scope-findings-on-related-tickets.md` moved to `docs/knowledge-asset/deprecated/`, each with a note explaining the deprecation reason.
- `ai-review-evals/2026-08-21_1557_issue-432_contact-info-language-toggle-close.md` added.
- No `src/`/`tests/` changes — issue #432's own Code PR (#442) already shipped and merged before this close turn.
- `data/case-studies.json` left unchanged.
