# Issue #482 (Pause → Play doesn't resync to live edge) close — scored coding 5 / satisfied 5, live-edge-resync skill proposed

## Context

Issue #482 was opened during #421's close step (2026-08-24) to carry forward a bug @mekhal
confirmed three times during #421's own review — pausing playback never tore down the `hls.js`
instance, and resuming just called `audio.play()` from wherever the stale buffer had stopped,
without seeking back to the live edge.

1. **`@claude review`** — confirmed the bug against current code (`togglePlayback`,
   `album-promo.js:765-784`), traced that `hlsRef.current` is only ever `destroy()`-ed on unmount,
   not on pause, and flagged the related-but-distinct #448 Audio Quality level-switch path as
   worth confirming rather than assuming it needed the same fix. Raised three questions: resync on
   every resume vs. a pause-duration threshold, whether to fold in the #448 quality-switch path,
   and whether to waive the Test PR given this repo's browser-only test runner.
2. **@mekhal's answer (`@claude approved`)** — resync on every resume; scope strictly to
   Play/Pause, leave Audio Quality as a separate follow-up if it turns out to need it; waive the
   Test PR.
3. **[PR #487](https://github.com/mekhal/aidlc-radio-calico/pull/487)** (Code PR, Test PR waived
   per step 3) — added `resyncToLiveEdge(audio)`, called immediately before `audio.play()` in the
   resume branch: seeks to `hls.liveSyncPosition` on the `hls.js` path, or the end of
   `audio.seekable` on the native-HLS (Safari) fallback. Verified by code trace against
   `tests/player-real-audio-playback.test.js` and `tests/mock-hls.js` (documented in the PR body)
   rather than a live browser run, since the sandbox has no browser to run `tests/test-runner.html`.

PR #487 is merged to `develop`. @mekhal then posted `@claude close coding 5 satisfied 5
เพลงเลื่อนไปยังเวลาล่าสุดเมื่อกด play` (confirming the fix works as intended — the track jumps to the
live position on Play).

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 5, Result Satisfaction 5.** Per `CLAUDE.md`'s
   rule that the agent never self-scores. Logged in
   `ai-review-evals/2026-08-25_0918_issue-482_live-edge-resync-close.md`.

2. **No rework cycle** — one review round resolved all three open questions before any code was
   written, one approved round shipped the Code PR exactly per plan, merged clean. The diff is an
   11-line helper plus a single call site, scoped strictly to Play/Pause as instructed — no
   Audio Quality changes.

3. **New skill proposed** (`hls-resync-to-live-edge-on-resume`) — see the `SKILL.md` draft in this
   turn's issue comment. The two-path resync logic (`hls.liveSyncPosition` when an `hls.js`
   instance is attached, `audio.seekable`'s end otherwise) is a pattern this codebase will likely
   need again: the issue's own body flags that #448's Audio Quality level-switch path reattaches/
   reloads the stream in a similar way and may need the same live-edge snap if it's ever found to
   drift. Not previously captured — checked `media-autoplay-with-silent-catch-fallback.md` (covers
   the unrelated autoplay-rejection case) and found nothing else in
   `docs/knowledge-asset/published/` about live-edge/seek behavior.

4. **Not proposed as a Case Study candidate.** `data/case-studies.json` already holds an IF5/RS5
   Bug Fix entry (#294, Dark-theme Token Fix) that also produced a new skill at close; #482 is a
   smaller, single-file fix without a comparable independent angle (no new root-cause class, no
   multi-AC scope). Leaving the showcase set as-is rather than padding it with a similar-shaped
   entry.

## Why

Decision 3 matters because the issue body explicitly names the follow-up risk ("ควรพิจารณา
resync-to-live-edge ร่วมกันถ้ามีการแก้บั๊กนี้ในอนาคต" — consider resync-to-live-edge together if this
bug surfaces again) for the Audio Quality path (#448), which was deliberately scoped out of this
fix per @mekhal's answer #2. Recording the pattern as a skill now means a future turn touching
`selectAudioQuality` can reuse the same two-path logic (and reasoning for when each path applies)
instead of re-deriving it, and reduces the chance the parallel bug goes unnoticed a second time the
way #482 itself sat unopened for two days after #421 flagged it.

## Impact

- Issue #482 closes at its shipped scope: PR #487 merged to `develop`; `togglePlayback`'s resume
  branch now resyncs to the live edge on every Play, Audio Quality untouched.
- One new skill candidate proposed for @mekhal to decide (add/update/skip) — see the `SKILL.md`
  draft in this turn's comment, not yet copied into `.claude/skills/` per the write-guard
  workaround.
- No Case Study proposal this time (see Decision 4) — `data/case-studies.json` left unchanged.
