# Decision: Issue #573 (unreferenced-file audit, DELETE-not-yet) closed

**Issue:** [#573](https://github.com/mekhal/aidlc-radio-calico/issues/573) — task-only audit of
files with no in-repo reference, per AC1–AC5. No file was deleted, moved, or edited inside this
issue's own scope (explicit Out of scope).
**PR:** none for the audit turn itself (comment-only, per scope) — this close-step PR carries only
the decision doc / knowledge asset / eval bookkeeping below.
**Decided by:** @mekhal, 2026-08-29

## Decision

1. **Confirmed DELETE (4 items, to be executed in a new follow-up issue, not this one):**
   - `trivy.yml` (root) — stale duplicate of `.github/workflows/trivy.yml` /
     `docs/ci-drafts/trivy.yml`, not wired into any workflow trigger.
   - `images/ai-autonomy-goal.jfif` — zero references outside a decision doc that itself says
     "not currently referenced from the README."
   - `images/knowledge_growth_over_time.png` — same as above.
   - `album-promo.html` — deprecated per issue #159. Per the new rule (decision 3 below),
     deprecated *files* must be removed from the codebase, not kept as a dead reference. Verified
     independently before adding it to this list: `index.html:75` and `index.html:20` load
     `album-promo.js`/`album-promo.css` directly as live `<script src>`/`<link href>` — those two
     files are NOT deprecated and must stay. Only `album-promo.html` itself (the standalone page)
     has no inbound reference from any deploy page or nav (`menu/menu.js:33` only *mentions* it in
     a comment, not a link). Deleting it also requires removing the string `"album-promo.html"`
     from `usedIn` in `config/cdn-sources.json` (5 occurrences: lines 9, 16, 23, 31, 47) — those
     entries also list `index.html` etc., which stay.

2. **Human will delete directly, outside any ticket (write-guard path):**
   `.claude/skills/pr-followup-on-pr-not-issue.md`. Re-classified from this issue's own ASK
   proposal: not a skill awaiting deprecation, but a stray duplicate left over from issue #432's
   migration into `docs/knowledge-asset/deprecated/pr-followup-on-pr-not-issue.md` (content
   identical except the deprecation banner). @mekhal deletes it personally since the agent cannot
   write under `.claude/` either way.

3. **New rule captured as a knowledge asset (see `docs/knowledge-asset/published/`
   `deprecated-file-removal-before-close.md`):** once a file is marked deprecated, it must be
   removed from the codebase together with its tests — history lives only in
   `docs/knowledge-asset/deprecated/` and `docs/decisions/`, never as a dead file left in the
   working tree. Four conditions gate any such deletion, all must have evidence in the PR:
   1. Deprecation is a *file*-level judgment, not a filename-*prefix*-level one — sibling files
      sharing a basename stem can have different live/deprecated status. Grounding case:
      `album-promo.html` is deprecated but `album-promo.js`/`.css` are not (`index.html:20,75`
      load them live).
   2. Confirm no `<script src>` / `<link href>` in an actual deploy page (`index.html`,
      `pages/*.html`) points at the file before deleting it.
   3. Identify what each `tests/` suite actually exercises via its loader
      (`tests/load-*.js`/`tests/test-runner.html`'s `<script src>` list), not by guessing from the
      test's filename.
   4. Anything unclear stops the deletion and asks the human first.

4. **DEFER:** `src/README.md`, `specs/README.md` stay as-is, tied to the not-yet-opened README §8
   fix ticket (issue 4 below) rather than decided here.

5. **KEEP confirmed as originally proposed:** `reports/**`, `docs/ci-drafts/*`, config files
   (`.eslintrc.json`, `.stylelintrc.json`, `.mega-linter.yml`), and the systematically-referenced
   directories (`tests/**`, `docs/decisions/**`, `ai-review-evals/**`,
   `docs/knowledge-asset/**`, `.claude/skills/{brainstorming,...}/**`, component folders,
   `.github/**`).

6. **Audit-methodology gap recorded for the next audit round.** AC2's criterion ("is this file
   referenced by anything, and is it used by a `.github/workflows/` workflow") only measures
   *reference existence*, not *whether the reference is a live deploy-page load path*. This missed
   two real cases in the audit turn:
   - `album-promo.*` was judged as one legacy bundle because `album-promo.html` (deprecated) and
     `album-promo.js`/`.css` (still live) share a name stem — see decision 1/3 above.
   - `app.js` (928 lines) has **no** `<script src="app.js">` in any deploy page — verified:
     `grep -n "app\.js" index.html pages/*.html` returns only a comment at `index.html:30`, no
     actual tag. `config/cdn-sources.json:48`'s own note already flags this under issue #220
     ("app.js itself has no `<script>` tag of its own in either HTML file"). The audit did not
     surface `app.js` as DELETE-risk because it has `tests/` coverage, but test coverage alone
     doesn't establish the file still ships. Filed as its own issue (issue 2 below) to confirm
     status rather than deleted sight-unseen.
   Next audit round must add a second, independent criterion — "is this file loaded from an
   actual deploy page's `<script src>`/`<link href>`, not just referenced somewhere in the repo" —
   alongside AC2's existing "is it referenced at all" check.

## Why

Decision 1's `album-promo.html` addition is the direct trigger for decision 3: applying the
existing audit's own DELETE criteria (AC2, "no reference anywhere + not used by a workflow") to
`album-promo.html` in isolation would have missed that its sibling `.js`/`.css` files are still
live — the new rule exists specifically to stop file-vs-prefix conflation from recurring, since
the original October audit comment did not need to reason about this case at all (it wasn't in
scope of AC3's four groups).

Decision 6 exists because the human traced a real gap in the audit methodology this issue itself
produced — the audit's own AC2 wording is sufficient to justify keeping `app.js` since it *is*
referenced (by tests), but that doesn't establish it's still shipped to users. Recording this now,
rather than letting the gap silently repeat, is the same "capture the decision" motivation as
`shared-asset-reference-audit-before-delete` from issue #522's close.

## Impact

- No files deleted, moved, or edited by this issue's own audit turn (Out of scope honored).
- This close-step PR adds only: this decision doc, the new knowledge asset draft, and one
  `ai-review-evals/` entry — no app/test/config file changes.
- Four new issues opened per @mekhal's close-comment instruction (see close comment for links):
  headless `tests/test-runner.html` CI run, `app.js` dead-code-status confirmation (no deletion
  yet), execute the DELETE list above, and README §8/§7 + `CLAUDE.md` Skills section alignment.
- `docs/knowledge-asset/published/deprecated-file-removal-before-close.md` is a new file from this
  issue's own work, pending @mekhal's add/update/skip decision on whether to also formalize it as
  `.claude/skills/deprecated-file-removal-before-close/SKILL.md` (human-only copy, write-guard).
- `data/case-studies.json` left unchanged — not proposed as a showcase candidate (an audit-only
  task with no shipped code isn't the "clean, illustrative end-to-end loop" the showcase calls
  for).
