# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#253](https://github.com/mekhal/aidlc-radio-calico/issues/253) |
| PR | [#259](https://github.com/mekhal/aidlc-radio-calico/pull/259) (Test PR, merged), [#260](https://github.com/mekhal/aidlc-radio-calico/pull/260) (Code PR, merged) |
| Date | 2026-08-02 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | @mekhal |

---

## Task

Ticket 1 of the `index.html` component-extraction story (#245): move the pieces of `album-promo.js`
shared across the upcoming logo/menu/sidebar/footer tickets into a new `shared/` folder
(`shared/state.js`, `shared/translations.js`, `shared/helpers.js`), with no behavior change, as
plain `<script>` globals (no ES modules/build step per the repo's vanilla-JS tech-stack decision).
This is the unblocking ticket — Tickets 2-5 depend on it landing first.

---

## Original User Request

Issue body (already carrying an AC drafted and approved by @mekhal in #245's thread) proposed 5
items to relocate. Two `@claude review` rounds followed: round 1 surfaced a gap (two storage-key
constants used by non-moving functions weren't in AC1's export list) and a wording mismatch
("the `state` factory" didn't match the actual inline-literal code); round 2 answered both plus
asked about reorganizing `tests/` into per-module folders. `@claude approved with 1` (2026-08-02
15:48) approved the revised AC and picked option (i) — keep Ticket 1's test scope to `tests/shared/`
only, defer per-module folders to Tickets 2-5. `@claude approved Code PR Mark 1` (23:22) also
reminded the agent to sync to `origin/develop` before editing. At close:
`@claude close coding 5 Work satisfaction 5 again, please save knowledge sync to origin/develop
branch before edit code` (scores given directly; see Human Decision below).

---

## AI Decision

1. In round-1 review, grepped every call site of the 5 items named in the original AC before
   agreeing the plan was complete — found `LANG_STORAGE_KEY`/`THEME_STORAGE_KEY` were needed by
   `buildThemeToggle`/`buildLanguageToggle` (not moving) even though those two consts weren't named
   in AC1, and flagged it as a gap to close before proceeding rather than silently adding or
   silently omitting them.
2. Flagged that AC1's "the `state` factory" phrasing didn't match the actual code (an inline
   literal, not a factory) instead of quietly implementing whichever reading seemed more likely,
   since it bore on whether `createState()` was in-scope "relocation" or new code against AC4's
   framing.
3. When round 2 asked for a full per-module test-folder reorg, checked it against actual code first
   (found `footer-*.test.js` tests a different, no-longer-loaded file, and Tickets 2-5's own files
   don't exist yet) and presented three scoped options instead of either implementing the full
   reorg or refusing outright; the human picked the narrowest.
4. At both the Test PR and Code PR turns, the mandatory `origin/develop` sync check
   (`docs/decisions/2026-07-17-sync-to-develop-before-work-mitigation.md`,
   `docs/decisions/2026-08-02-issue-248-mandatory-published-skills-and-unconditional-develop-sync.md`)
   caught the checkout-lands-on-`main` bug (issue #106) and reset before any edits, both times
   before making any file changes — no manual intervention needed beyond the human's own reminder.
5. Test PR (#259) implemented AC1/AC3 only (failing tests + updated loader); Code PR (#260)
   implemented exactly the contract the merged tests pinned down (`createState()`,
   `LANG_STORAGE_KEY`/`THEME_STORAGE_KEY` as globals, verbatim moves for the rest), per
   `docs/knowledge-asset/published/code-pr-implements-test-pr-contract.md`.

Suggested Keywords:

- grepped call sites repo-wide before finalizing a shared-module extraction's AC export list
- flagged AC wording ("factory") that didn't match actual code instead of guessing the reading
- scoped down an ask (full test-folder reorg) to what current code/tickets actually support
- sync-to-develop mitigation (issue #106) caught and self-corrected twice in one issue's turns
- Code PR implemented exactly the Test PR's merged contract, no re-derived mechanism

---

## Decision Type

No unrequested scope was introduced — the two AC gaps (storage keys, factory wording) were
surfaced as questions and resolved by the human's explicit choice, and the test-reorg ask was
scoped down via human-picked option, not agent judgment alone. The agent's own initiative was
limited to *finding* the gaps (via call-site audit) and *presenting* options, not deciding among
them.

Suggested Keywords:

- scope entirely human-directed across two review rounds
- reuse-first / relocation-only extraction with one explicitly-scoped exception (`createState()`)
- verification limited by environment (no headless browser / no build tooling)

---

## Risk Level

Default

```
Medium
```

(Human may change later.)

---

## Instruction Fidelity (0–5)

5

---

## Result Satisfaction (0–5)

5

---

## Human Decision *(Optional)*

- Scores given directly in the `@claude close` comment rather than left blank: Instruction
  Fidelity 5, Result Satisfaction 5.
- Verbatim feedback: "close coding 5 Work satisfaction 5 again, please save knowledge sync to
  origin/develop branch before edit code."

---

## Review Notes *(Optional)*

> close coding 5 Work satisfaction 5
> again, please save knowledge sync to origin/develop branch before edit code.
>
> — @mekhal, 2026-08-02

The "again" refers to the sync-to-`origin/develop` mitigation (issue #106) recurring twice within
this single issue's own turns (Test PR at 15:48, Code PR at 23:22) — both caught and corrected
automatically before any edits, per the existing mandatory check. No new rule was needed; recorded
as a same-issue evidence point in
`docs/decisions/2026-08-02-issue-253-shared-extraction-ac-and-test-scope.md` per the human's
explicit request to keep this documented, since the underlying checkout bug (#106) is still
unresolved upstream.

---

## Future Policy *(Optional)*

- Human Review (unchanged) — a clean 5/5 close on a relocation-only ticket is a positive data
  point, but Tickets 2-5 under #245 will exercise the same pattern (shared-module extraction,
  call-site audits, deferred test-folder scope) several more times before there's enough evidence
  to consider lighter review for this specific class of ticket.

---

## Lessons Learned *(Optional)*

- Grepping every call site of an item before it's marked "moving" (not just the items literally
  named in the AC) caught a real gap here (`LANG_STORAGE_KEY`/`THEME_STORAGE_KEY`) that would have
  otherwise broken `buildThemeToggle`/`buildLanguageToggle` silently after the Code PR landed.
  Proposed as a skill candidate at this close (see the close comment on #253) since Tickets 2-5
  will do the same kind of extraction.
- The `origin/develop` sync mitigation continues to work exactly as designed on every turn it's
  triggered on, including twice within one issue — no change to the existing rule is needed, only
  continued unconditional application.
