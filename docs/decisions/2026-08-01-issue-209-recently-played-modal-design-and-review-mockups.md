# Decision: Recently Played Modal — design decisions and a "show mockups in review" habit

**Issue decided on:** [#209](https://github.com/mekhal/aidlc-radio-calico/issues/209)
**Decided by:** @mekhal, across six `@claude review` rounds on 2026-08-01 (12:18–13:20 UTC), then
`@claude approved` (13:27 UTC) and `@claude approved create test pr only ac 2` (15:17 UTC) and
`@claude approved code pr full plan` (15:39 UTC)

## Decision 1 — Modal design, settled incrementally at the review gate

Split from #158/Ticket D (whose own AC3 scope was only the inline 5-item list, shipped in PR
#204). This issue picked up "replace the inline list with a Modal," and the design was worked out
across five discussion-only `@claude review` rounds before any plan/AC was written:

1. **Trigger placement** — a button inside the existing `.chloe-now-playing__rating` row,
   flush-right via `margin-left: auto`, above the audio-control row (no reordering needed — the
   rating row already sits above `chloe-player-controls` in DOM order).
2. **Item format** — numbered (`<ol>`/`list-style: decimal`), `Artist : Title` per row (not the
   inline section's original "Artist left / Title right" layout).
3. **Theming** — the modal follows the app's existing light/dark toggle via the `--chloe-*` CSS
   custom properties, deliberately diverging from the fixed-dark `openTestReportModal()` pattern it
   otherwise reuses structurally (that modal is dev-only and intentionally theme-independent; this
   one is user-facing content).
4. **Live updates** — the modal reads the *same* `state.nowPlaying.recentlyPlayedListEl` node that
   `refreshNowPlaying()` already repaints every 10s, moved (not cloned) into the modal on open — no
   second fetch path, no snapshot-at-open-time.
5. **Inline section fate** — deleted outright (`ลบ code เดิมออกเลย`), not kept as a fallback. The
   underlying `renderRecentlyPlayed`/`parseRecentlyPlayed`/`refreshNowPlaying` functions were kept
   and retargeted to the modal, since `docs/decisions/2026-07-29-ticket-d-hide-recently-played-and-cover-art-flicker-fix.md`
   had already deliberately preserved them (rather than deleting early) for exactly this reuse.

## Decision 2 — Test PR scoped to AC2 only, Code PR implements the full plan

At step 3/4, the human asked for a Test PR covering **AC2 only** (modal open/close behavior) —
narrower than the full AC1–AC7 plan approved moments earlier. Rather than assume the Code PR should
match that same narrow scope, the agent flagged the ambiguity explicitly at the next `review` turn
(two readings: AC2-only Code PR with a placeholder body, or full-plan Code PR with AC2 verified by
the merged tests and AC1/AC3–AC7 verified manually) and let the human resolve it. The human chose
**full plan** (`@claude approved code pr full plan`). AC1, AC3–AC7 shipped with documented manual
verification (traced by hand against each AC's text) rather than automated tests, per `CLAUDE.md`'s
allowance for step-3-waived-Test-PR ACs.

## Decision 3 — proactively include mockups in `@claude review` turns for UI changes

Across this issue's review rounds, mockups/example renderings were only produced when the human
explicitly asked for one (`คุณลองแสดงตัวอย่างให้ผมดูได้ไหม` — "can you show me an example?", and
again with a hand-drawn ASCII layout the human wanted matched). At close, the human's feedback
(`ปรับปรุง Review ให้ แสดงตัวอย่างให้ดูด้วย กรณี ที่มีการเปลี่ยนแปลง UI` — "improve review [turns]
to also show an example/mockup, in cases where there's a UI change") makes this a standing
expectation rather than an on-request extra: any `@claude review` turn discussing a UI/visual
change should include a mockup (ASCII layout, before/after diagram, or similar) by default, without
waiting to be asked. See the `review-ui-changes-with-mockup` skill candidate proposed at this
issue's close.

## Why

Decisions 1 and 2 both follow the pattern already established in this repo's thread history:
propose labeled options at a `review` gate, implement only after explicit `approved`, and flag
ambiguity (the AC2-only vs. full-plan question) rather than silently picking one. Decision 3 is a
process correction, not a design decision — the mockups produced *when asked* were well-received (no
pushback on any of them), so the gap was in when they were offered, not in their quality.

## Impact

- PR #243 (`claude/issue-209-20260801-1518`, merged) — Test PR, AC2 only.
- PR #244 (`claude/issue-209-20260801-1539`, merged) — Code PR, full plan AC1–AC7.
- Precedent for future `@claude review` turns on any issue: when the discussion involves a UI/visual
  change, include a mockup by default rather than waiting for an explicit "show me an example"
  request.
- Precedent for step-6 scope questions: when a Test PR's approved scope (e.g. "only AC2") is
  narrower than the full approved plan, surface the AC2-only vs. full-plan choice explicitly at the
  next gate instead of assuming either default.
