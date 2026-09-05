# Issue #585 (`app.js` deletion) closed at Instruction Fidelity 5 / Result Satisfaction 5; table-comparison skill confirmed for adoption; #577's CI-regression attribution corrected

**Issue:** [#585](https://github.com/mekhal/aidlc-radio-calico/issues/585) — delete dead-code `app.js`
(928 lines, confirmed unreferenced by any production deploy path at #578's close) plus the tests
that depended on it via `AppTestHelpers.loadApp()`. Test PR (step 4) pre-waived by @mekhal at #578's
close.
**PR:** [#593](https://github.com/mekhal/aidlc-radio-calico/pull/593) — merged to `develop`
2026-09-03T04:20:54Z. Single Code PR (Test PR waived); this close-step PR carries only the decision
doc / eval / skill-confirmation below.
**Decided by:** @mekhal, 2026-09-05.

## Decision

1. **Scores recorded verbatim from the close comment:** Instruction Fidelity 5, Result
   Satisfaction 5 ("coding 5 satisfied 5") — not self-scored, per the `ai-review-evals` convention.

2. **Deletion count corrected from #578's estimate: 12 dependent test files, not 14.** #578's
   count of 14 files calling `AppTestHelpers.loadApp()` included `tests/load-app.js` itself (the
   loader that *defines* `loadApp()`, not a caller) and `tests/load-album-promo.js` (only a
   comment cross-referencing `loadApp()`, no actual call). PR #593's own turn re-verified with a
   broader grep and found 12 real callers, all deleted along with `tests/load-app.js`.

3. **Coverage-parity audit table (11 safe deletions, 1 real gap) — reused the
   `comparison-table-for-multi-item-reviews` pattern from #578's close.** All 12 dependent test
   files were checked file-by-file for parallel coverage in the current component architecture
   before deletion; the table is in PR #593's opening comment (2026-09-03T03:49:27Z). Result:
   `tests/status-indicators-error-recovery.test.js` had no successor anywhere — `album-promo.js`
   has no LIVE indicator, buffering indicator, or fatal-error+Refresh UI. Deleted per the AC (not
   blocking), with the gap flagged rather than silently dropped. **Not expanded into a new issue
   in this close step** — left for @mekhal to decide whether that missing UI still matters enough
   to open one, since #585's own scope was deletion, not restoring lost features.

4. **New-skill decision requested by @mekhal this close turn: `comparison-table-for-multi-item-reviews`.**
   This skill was already drafted (not yet adopted) at
   [#578's close](2026-08-31-issue-578-close-scores-and-tabular-comparison-skill.md) as
   `docs/knowledge-asset/published/comparison-table-for-multi-item-reviews.md`. @mekhal's close
   instruction here ("save skill แสดงรายละเอียดเป็นตารางที่ Human can read ไว้ด้วย") is read as
   confirming that same draft for adoption, reinforced by this issue's own PR #593 turn
   independently reusing the exact pattern (the 12-row coverage-parity table in Decision 3) before
   this close turn ever mentioned it. No new draft is needed — see "Adding a skill" below for the
   human-only copy step.

5. **Corrected #577's close-doc attribution of the 27 failing tests to this issue's deletion.**
   [#577's close](2026-09-03-issue-577-close-scores-yaml-quoting-skill-and-585-regression.md#decision)
   (Decision 6) flagged the headless CI workflow's first-ever run against real code
   (run [`33714708740`](https://github.com/mekhal/aidlc-radio-calico/actions/runs/33714708740),
   331/358 passed) as "consistent with a mount target #585 removed (`app.js`)". Re-checked while
   closing #585 itself, since the claim is directly about this issue's own blast radius:
   - The 27 failures are fully accounted for by two unrelated groups: `player-sleep-timer.test.js`
     (12 cases), `player-audio-quality.test.js` (7), and `player-share.test.js` (7) — 26 total —
     plus 1 in `tests/contact/contact-theme.test.js` (`.chloe-contact-form theme tokens`, issue
     #506). 26 + 1 = 27, matching the reported count exactly.
   - **None of these four files call `AppTestHelpers.loadApp()` or reference `app.js`.** The three
     player suites mount through `AlbumPromoTestHelpers.loadAlbumPromo()` — a completely separate,
     still-present loader that #593 did not touch. The contact-theme suite doesn't mount an app
     shell at all.
   - The three player suites' own header comments ("These fail today (RED) for AC2-AC6 ...") date
     from their original Test PRs (#457, #467/#471) written before the corresponding Code PRs
     shipped — but issues #447, #448, and #449 (and their parent #421) are all closed with every
     Code PR merged to `develop`, so in principle these should pass now, independent of #585.
   - Critically, **run `33714708740` was this workflow's first-ever execution against real code**
     (per #577's own close doc) — there is no prior green baseline proving these 27 tests ever
     passed on `develop`. Calling this a "regression... consistent with" #585 presumes a before/
     after comparison that doesn't exist.
   - **Conclusion:** the 27 failures are very likely a pre-existing issue unrelated to `app.js`'s
     removal (most plausibly in `album-promo.js`'s Sleep Timer/Audio Quality/Share menu wiring or
     the contact-form theme tokens), coincidentally first surfaced by the same CI run that #593
     triggered. This close step does not attempt to root-cause it further — that would expand
     #585's own scope (a pure deletion issue) into unrelated feature debugging. **Recommendation
     for @mekhal:** open a new issue to investigate the real cause of the 27 failures, rather than
     tracking it as follow-up work on #585 (which is closing) or leaving the incorrect attribution
     standing in #577's decision doc.

6. **Case Study showcase: proposed as a candidate.** Unlike #578 (verification-only) and #579
   (needed a mid-course human correction), #585 ran as a single clean Code-PR loop end-to-end: no
   `@claude review` rounds, no rework, a self-caught estimate correction (12 vs. 14), one flagged
   coverage gap handled per-AC instead of silently dropped, and (per Decision 5) a self-caught
   correction of an unrelated issue's mistaken attribution — all landing 5/5. Left for @mekhal to
   confirm before adding to `data/case-studies.json`, per
   [[2026-08-11-issue-203-case-study-data-source-and-ticket-breakdown]].

## Why

Decision 5 exists because `CLAUDE.md`'s Definition of Done and the `ai-review-evals` framework
both depend on accurate blast-radius attribution — if #585's Result Satisfaction is scored 5/5
partly on the belief that it introduced a 27-test regression that was in fact pre-existing, that
belief should be corrected in the record it appears in, not left standing just because it was
convenient for #577's own close turn to close a loop. This does not retroactively change #577's or
#585's already-recorded scores (both given directly by @mekhal); it corrects the causal claim so a
future reader of either decision doc doesn't act on a wrong root cause (e.g. someone re-adding
`app.js` to "fix" these 27 tests, when the actual fix is in `album-promo.js` or unrelated).

Decision 4 avoids re-drafting a skill that already has a fully-formed, humanreadable draft sitting
in `docs/knowledge-asset/published/` — the write-guard workaround only requires a human copy step,
not a second agent draft.

## Adding a skill

**Confirming existing draft: `comparison-table-for-multi-item-reviews`** (no new content — already
published at `docs/knowledge-asset/published/comparison-table-for-multi-item-reviews.md`, drafted
at #578's close). @mekhal's instruction this turn is read as approving it for adoption. A human
still needs to copy it verbatim into
`.claude/skills/comparison-table-for-multi-item-reviews/SKILL.md` (write-guard — the agent cannot
write inside `.claude/`).

## Impact

- `app.js` and its 12 real dependent test files are gone from `develop` (via #593); the 14-file
  estimate from #578 is corrected to 12 for the historical record.
- One coverage gap (LIVE/buffering/fatal-error indicators) flagged, not silently dropped — decision
  on whether to open a new issue for it left to @mekhal.
- `docs/decisions/2026-09-03-issue-577-close-scores-yaml-quoting-skill-and-585-regression.md`'s
  Decision 6 is superseded by Decision 5 above regarding root cause (not regarding the workflow's
  own mechanism/fix, which stands) — the 27 failing tests are very likely pre-existing and
  unrelated to `app.js`'s removal; @mekhal to decide whether to open a new issue to investigate.
- `comparison-table-for-multi-item-reviews` confirmed ready for adoption; no new skill content
  produced this turn.
- `data/case-studies.json` left unchanged pending @mekhal's confirmation (Decision 6).
