# Decision: Player elapsed-time counter is cumulative (not per-play), plus mid-loop autoplay-on-mount scope addition

**Issue:** [#228](https://github.com/mekhal/aidlc-radio-calico/issues/228)
**Decided by:** @mekhal, 2026-07-31

## Decision

1. **Elapsed-time counter counts cumulative listen time, not "time since this play started."**
   The step-2 plan first proposed resetting the counter to `0:00` on every pause→play transition,
   reasoned from how `audio.currentTime` behaves across `togglePlayback()` (it doesn't reset,
   since the same `<audio>`/`Hls` instance is reused — see the `@claude review` discussion on this
   issue). The human overrode that at step 3: pause holds the current value, resume continues from
   it (no reset), and the counter only returns to `0:00` on a genuine page reload / component
   remount. Implemented via a self-maintained `elapsedSeconds` state that a `startTimer()`/
   `stopTimer()` pair increments while playing — `togglePlayback()` never resets it, only
   `useState(0)`'s initial mount value does.
2. **Autoplay-on-mount added mid-loop, after the plan/AC had already been posted once.** Not in
   the original issue body — introduced in the human's second `@claude review` comment, alongside
   the cumulative-timer change. `PlayerControls`'s mount effect now calls `audio.play()`
   immediately after attaching the HLS source; a resolved promise starts playback state + the
   timer, a rejected one (browser autoplay policy) is caught silently so the component falls back
   to the normal paused UI with no thrown/unhandled error.
3. **Confirmed no conflict with issue #220's prior AC.** #220's Code PR (#224) asserted the HTML
   `autoplay` *attribute* is absent (`tests/player-real-audio-playback.test.js`, AC1 of #220) — that
   assertion is about markup, not JS-invoked `audio.play()`. Calling `.play()` programmatically in
   the mount effect doesn't set the attribute, so this is an intentional, distinct behavior, not a
   silent regression of #220's AC1. Flagged explicitly in the revised plan rather than left
   implicit, per `docs/decisions/2026-07-20-review-before-over-implementing.md`.
4. **#220's existing test needed a follow-up fix, done in the same Code PR rather than a new
   ticket.** `tests/player-real-audio-playback.test.js`'s AC3 case assumed the first play/pause
   click was a *play* click; once autoplay starts playback on mount, the first click is a *pause*
   click instead. Fixed in Code PR #233 alongside the new suite, since it's a direct, unavoidable
   consequence of this issue's own change to the same component — not scope creep into #220.

## Why

(1): matches user-visible intent — "how long has this listen been going" reads better as a running
cumulative total across pause/resume within one page load than a counter that snaps back to zero
on every click, and it also simplified the implementation (no reset branch needed in
`togglePlayback()`). (2): explicit human requirement, added at the review gate rather than assumed
by the agent — the agent's own initial plan (approved at `@claude approved setInterval`) did not
include autoplay; scope only expanded once the human asked for it directly, consistent with
"human decides, always." (3)-(4): both are outcomes of tracing autoplay through to its actual test
surface rather than treating it as an isolated addition — reusing/adjusting the one existing test
it broke was judged in scope for this Code PR since leaving it broken would ship a red suite.

## Impact

- `album-promo.js`: `PlayerControls` — `elapsedSeconds`/`timerIntervalRef` state,
  `startTimer()`/`stopTimer()`, `formatElapsed()`, `getPlayerTimerTickMs()`
  (`window.__ALBUM_PROMO_TIMER_TICK_MS__` override), autoplay call in the mount effect with a
  caught rejection, `stopPlayback()` extended to also clear the timer interval.
- `tests/player-timer-and-autoplay.test.js` (new): one test per AC1–AC9.
- `tests/player-real-audio-playback.test.js`: AC3 case adjusted for autoplay-on-mount shifting the
  first click from play to pause.
- `tests/test-runner.html`: new suite wired in.
- PRs: [#232](https://github.com/mekhal/aidlc-radio-calico/pull/232) (Test PR, merged),
  [#233](https://github.com/mekhal/aidlc-radio-calico/pull/233) (Code PR, merged).

## Open items at close (not decided / deferred)

- None — human confirmed satisfaction with the shipped result at close, with one caveat noted below.
- **Browser autoplay-policy friction, noted by the human at close but not treated as a defect to
  fix further:** many browsers block unmuted autoplay without prior user interaction, so AC2's
  fallback-to-paused path is expected to trigger often in real usage (not just the rejected-promise
  test case) — the human's close comment ("แม้จะติดปัญหาเรื่องการ autoplay จาก browser") called
  this out as an accepted platform limitation, not something this issue's implementation got wrong.
