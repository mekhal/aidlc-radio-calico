# Decision: Issue #522 ("What's this" diagram fixes + 7-step loop expansion) closed at Instruction Fidelity 4 / Result Satisfaction 3

**Issue:** [#522](https://github.com/mekhal/aidlc-radio-calico/issues/522) — follow-up from
[#505](https://github.com/mekhal/aidlc-radio-calico/issues/505) / [#509](https://github.com/mekhal/aidlc-radio-calico/issues/509)
**PR:** [#524](https://github.com/mekhal/aidlc-radio-calico/pull/524) (Code PR, Test PR waived —
image removal + resize/recaption), [#526](https://github.com/mekhal/aidlc-radio-calico/pull/526)
(Code PR, Test PR waived — 7-step loop expansion + `skillCapture.intro`) — both merged to `develop`
**Decided by:** @mekhal, 2026-08-27

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 4, Result Satisfaction 3.** Per `CLAUDE.md`'s
   rule that the agent never self-scores. Logged in
   `ai-review-evals/2026-08-27_0633_issue-522_diagram-fixes-and-loop-expansion-close.md`.

2. **Three concrete complaints behind the scores, recorded here verbatim for context (not
   actioned in this close — see Impact for the new issue that covers them):**
   - *"การปรับรูปภาพยังไม่ถูกปรับเป็น Center"* ("the resized images still aren't centered") — root
     cause: PR #524's `.whats-this-image { max-width: 42rem; margin: 0 0 1.5rem; }`
     (`whats-this/whats-this.css:170-173`) caps the width but never centers the block (no
     `margin: 0 auto`), so on any viewport wider than ~42rem the image sits flush against the left
     edge of its section rather than centered on the page. The plan's AC2 only specified the width
     cap, not centering, and neither the plan mockup nor the bundled test
     (`tests/whats-this/whats-this-image-width.test.js`) checked horizontal alignment.
   - *"เปลี่ยนรายละเอียด AI-DLC เป็นตารางแทน Card"* ("change the AI-DLC step details from cards to
     a table").
   - *"เปลี่ยน Skill capture เป็นตารางแทน Card"* ("change the Skill Capture section from cards to a
     table").

3. **Scope-rule override from the 2026-08-27T03:50 turn, formally recorded here.** That turn
   expanded `aidlcLoop.steps`/added `skillCapture.intro` *inside* issue #522 after @mekhal replied
   "ทำใน Issue นี้" ("do it in this issue") to the agent's own recommendation to open a new issue
   instead. `CLAUDE.md`'s "missed functionality becomes a NEW issue" rule is listed under Hard
   rules with only one stated exception (an already-sequenced downstream ticket), unlike the Test
   PR waiver which has an explicit human-override clause built into step 3. The agent flagged this
   as a deliberate, informed override under "Human decides, always" rather than silently complying
   or refusing — this decision doc is that flag's follow-through, per `CLAUDE.md`'s "Capture the
   decision" principle.

4. **New skill proposed: `shared-asset-reference-audit-before-delete`** — grounded in this issue's
   own 2026-08-27T02:02 turn. @mekhal approved deleting `code-pr-gates.jpg` after it was removed
   from `whatIsThis`'s section, but before acting on that approval the agent grepped the repo and
   found `README.md`/`README.th.md` §11 independently embed the *same* file for an unrelated
   purpose (the Step 6/7 Code PR Gates illustration in the AI-DLC docs, not the "What's this"
   page). Deleting it would have broken both READMEs' rendered images. The approval itself was
   given without that context — the plan's open question ("delete the file too, or just stop
   referencing it?") had assumed the file would be orphaned without checking for other referrers
   first. See the draft `SKILL.md` in
   `docs/knowledge-asset/published/shared-asset-reference-audit-before-delete.md`, not yet copied
   into `.claude/skills/` per the write-guard workaround.

5. **Not proposed as a Case Study showcase candidate.** Real, unresolved complaints behind a 4/3
   score don't read as the "clean, illustrative" example the showcase curation calls for — same
   reasoning used to skip the showcase at #509's and #152's follow-up closes.

## Why

Decision 2 records the three complaints faithfully without editorializing them into something
more or less severe than what @mekhal actually said, and without folding them into this already-
merged loop — per `CLAUDE.md`, they become a new issue instead (see Impact).

Decision 3 exists because the Hard rules list treats the Test PR waiver and the scope-expansion
rule asymmetrically (one has a built-in override clause, the other doesn't), and the agent already
flagged this live in the 2026-08-27T03:50 comment. Recording it here turns that inline flag into
the durable decision record `CLAUDE.md`'s "Capture the decision" principle calls for, instead of
letting it live only in a PR-body sentence.

Decision 4 exists because this is the second time in this repo's history that a plan's approval
was granted without the agent first checking whether an asset was actually safe to act on — the
first time (issue #509's root-relative path bug) shipped the bug and needed a follow-up fix; this
time the agent caught it *before* deleting, but only because it happened to grep first, not
because of any established check. Publishing the check now closes that gap prospectively instead
of relying on it happening to get caught again.

## Impact

- Issue #522 stays closed at its shipped scope (PRs #524, #526) — no further code changes result
  from this close.
- New issue opened per @mekhal's request in the close comment, covering the 3 complaints in
  decision 2 (image centering, AI-DLC steps as a table, Skill Capture as a table) — see the issue
  link posted in the close comment.
- `docs/knowledge-asset/published/shared-asset-reference-audit-before-delete.md` is a new file
  from this issue's own work, pending @mekhal's add/update/skip decision and, if added, a human
  copy into `.claude/skills/shared-asset-reference-audit-before-delete/SKILL.md`.
- `data/case-studies.json` left unchanged.
