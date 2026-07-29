# Decision: Ticket D — hide Recently Played (keep logic running) + fix cover-art flicker via hash compare

**Issue decided on:** [#158](https://github.com/mekhal/aidlc-radio-calico/issues/158) (Ticket D)
**Decided by:** @mekhal, 2026-07-29T00:43 and 2026-07-29T01:12 (two review→approved rounds after
the Code PR #204 merge)

## Decision 1 — hide Recently Played, don't remove it

After PR #204 merged, the human asked to hide the Recently Played section (planning to replace it
with a Modal later — tracked in #209) but did **not** ask to remove the underlying fetch/render
code. Two options were proposed at the review gate (CSS `display: none` vs. removing the section
from `buildMain()` entirely); the human picked **CSS hide**. Implemented as `display: none` on
`.chloe-recently-played` in `album-promo.css`, with `buildRecentlyPlayed()`/`refreshNowPlaying()`
left untouched so they keep populating the (now-hidden) list in the background — reusable as-is
once the Modal in #209 is built, rather than deleted and later re-written.

## Decision 2 — cover-art flicker: hash-based fingerprint, not ETag

The 10s poll loop cache-busted the cover-art `<img src>` (`?t=${Date.now()}`) on **every** tick to
defeat browser image caching, which caused a visible repaint/flicker even when the underlying JPEG
bytes hadn't changed. Two fix approaches were proposed at the review gate: fetch the image, hash it
(SHA-256 via `crypto.subtle`), and only reassign `src` when the digest differs; or compare the
CloudFront response's `ETag`/`Last-Modified` header instead (cheaper, but unverified whether the
CDN sends stable values for `cover.jpg`). The human chose **hash-based fingerprint compare**
(`@claude approved hash checked`, 2026-07-29T01:12). Implemented as `fetchCoverFingerprint()` in
`album-promo.js`, called each poll tick; `#album-cover`'s `src` is only reassigned (cache-busted)
when the new digest differs from `state.nowPlaying.lastCoverFingerprint`.

**Follow-up gap surfaced by this decision:** `fetchCoverFingerprint()` was implemented in PR #212
without a new unit test and without asking the human whether one was wanted. The human had to
explicitly request it as a separate PR #212 comment ("เขียน Unit test มาทดสอบ
`fetchCoverFingerprint` เพิ่มด้วย"), which was then added as a follow-up commit
(`tests/cover-art-fingerprint.test.js`). This is the basis for the Instruction Fidelity score (4/5)
recorded in `ai-review-evals/2026-07-29_1323_issue-158_ticket-d-now-playing-close.md` and for the
`ask-before-skipping-tests-on-new-function` skill candidate proposed at this issue's close.

## Why

Both decisions follow the same underlying pattern already used elsewhere in this ticket's thread:
present a labeled menu of concrete options at a `review` gate rather than picking one silently, and
only implement after explicit `approved`. Decision 1 additionally preserves reuse-first: keeping the
fetch/render logic alive avoids rebuilding it for #209. Decision 2's gap (no test proactively
offered for a genuinely new, non-trivial function — a SHA-256 digest comparison, not a trivial
one-liner) is recorded here as something to actively avoid repeating; the review-only work (e.g.,
the hash vs. ETag proposal within the same session) *was* handled well and drove the 5/5 Result
Satisfaction score, so the gap is specifically about the implementation turn, not the analysis turn.

## Impact

- PR #210 (`claude/issue-158-20260729-0043`, merged) — CSS hide of Recently Played.
- PR #212 (`claude/issue-158-20260729-0112`, merged) — hash-based fingerprint fix + follow-up test
  commit.
- Precedent for future "poll an external resource and update the DOM" work in this repo: compare a
  fingerprint before touching `src`/`textContent`, don't cache-bust unconditionally every tick.
- Precedent for future implementation turns that introduce a new non-trivial function outside the
  standard Test PR → Code PR loop (e.g., a `review`→`approved` fix): proactively ask whether a unit
  test is wanted, rather than waiting for the human to request it after the fact.
