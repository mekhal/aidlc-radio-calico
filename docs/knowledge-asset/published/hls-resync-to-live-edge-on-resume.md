<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/hls-resync-to-live-edge-on-resume/SKILL.md
Surfaced while closing issue #482 — Pause never tore down the hls.js instance, so a plain
audio.play() on resume continued from wherever the stale buffer had stopped instead of the live
edge. The issue's own body flags that #448's Audio Quality level-switch path reattaches/reloads
the stream in a similar way and may need the same treatment if it's ever found to drift.
-->
<!-- BEGIN SKILL.md -->
---
name: hls-resync-to-live-edge-on-resume
description: Use when any code path resumes, reattaches, or reloads an HLS stream on an already-mounted `<audio>`/`<video>` element (Pause→Play, quality/level switch, network-recovery reconnect) — seek back to the live edge instead of letting playback continue from a stale buffered position.
---

Pausing (or otherwise leaving an `hls.js` instance attached but temporarily not advancing) does
not destroy or reset the instance — its buffer just stops growing at whatever position it was at.
Resuming with a plain `.play()` continues from that stale position, which can be seconds to minutes
behind the actual live point depending on how long playback was stalled. Snap back to the live edge
whenever playback resumes:

```js
function resyncToLiveEdge(audio, hlsRef) {
  const hls = hlsRef.current;
  if (hls && Number.isFinite(hls.liveSyncPosition)) {
    audio.currentTime = hls.liveSyncPosition;
    return;
  }
  if (audio.seekable && audio.seekable.length > 0) {
    audio.currentTime = audio.seekable.end(audio.seekable.length - 1);
  }
}
```

- **hls.js path:** `hls.liveSyncPosition` is kept current by hls.js in the background even while
  the `<audio>` element itself is paused/stalled — it's the authoritative live point.
- **Native HLS fallback (e.g. Safari, no `hlsRef.current`):** there is no `liveSyncPosition`
  equivalent; seek to the end of the browser-reported `audio.seekable` range instead.
- Call this immediately before resuming/restarting playback, not after — seeking on an already-
  playing element causes an audible jump instead of a clean resume at the live point.
- Resync on every resume, not just after a long pause — a threshold-based resync (e.g. "only if
  paused > 10s") adds complexity for a distinction users generally can't perceive, unless a human
  explicitly asks for one.

Precedent: `togglePlayback`'s resume branch in `album-promo.js` (issue #482,
`resyncToLiveEdge()`). Not yet applied to the Audio Quality level-switch path (`selectAudioQuality`,
issue #448) — that path currently keeps hls.js's buffer continuous across a level switch rather than
stalling it, so it may not need this treatment, but check the buffer/timing behavior explicitly
before assuming the pause/resume fix generalizes.
<!-- END SKILL.md -->
