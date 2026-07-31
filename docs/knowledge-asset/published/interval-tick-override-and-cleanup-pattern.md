<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/interval-tick-override-and-cleanup-pattern/SKILL.md
Surfaced while closing issue #228 (player elapsed-time counter) — this is the second time this
repo has independently arrived at the same shape (first: the Ticket D Now Playing metadata poll,
`window.__ALBUM_PROMO_METADATA_POLL_MS__`, album-promo.js:822-832; second: this issue's timer,
`window.__ALBUM_PROMO_TIMER_TICK_MS__`), which is what makes it worth naming as a reusable skill
rather than a one-off.
-->
<!-- BEGIN SKILL.md -->
---
name: interval-tick-override-and-cleanup-pattern
description: Use when adding any setInterval-driven UI behavior (polling, ticking counter) in this repo's vanilla-JS/jQuery stack — make the cadence overridable via a window global for test control, and route teardown through the same cleanup path as any existing stop/unmount hook.
---

This repo has no fake-timer test utility (no Jest/npm test framework, per
`docs/decisions/2026-07-12-testing-framework-vanilla-runner.md`), so tests can't fast-forward a
hardcoded `setInterval` delay. Two independent features in this codebase converged on the same
workaround — treat it as the default, not something to re-derive each time:

1. Read the interval delay from a `window.__SOME_FEATURE_TICK_MS__` global with a sane default
   (e.g. `window.__SOME_FEATURE_TICK_MS__ || 1000`), so a test can set it to a tiny value before
   mounting the component and observe several ticks without a real-time wait.
2. Store the interval id in a `React.useRef(null)` (or equivalent), and clear it in every path that
   stops the behavior — pause, unmount, and any existing test-only stop hook (e.g.
   `window.__albumPromoStopPlayback`) — not just one of them. A `startTimer()`/`stopTimer()` pair
   that's idempotent (calling `stopTimer()` when nothing is running is a no-op) avoids leaked
   intervals surviving teardown.

Precedent: `window.__ALBUM_PROMO_METADATA_POLL_MS__` (Ticket D Now Playing poll,
`tests/now-playing-polling.test.js`) and `window.__ALBUM_PROMO_TIMER_TICK_MS__` (issue #228 player
timer, `tests/player-timer-and-autoplay.test.js`).
<!-- END SKILL.md -->
