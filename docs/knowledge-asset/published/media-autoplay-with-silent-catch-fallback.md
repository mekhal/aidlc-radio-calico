<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/media-autoplay-with-silent-catch-fallback/SKILL.md
Surfaced while closing issue #228 — the human's own close comment called out browser
autoplay-policy friction as an expected, accepted limitation rather than a defect, which is the
judgment call this skill is meant to encode for future audio/video work in this repo.
-->
<!-- BEGIN SKILL.md -->
---
name: media-autoplay-with-silent-catch-fallback
description: Use when calling `<audio>`/`<video>`.play() programmatically (e.g. on mount, for autoplay) — treat a rejected play() promise as an expected outcome, not an error, and fall back to the normal paused UI state with no thrown/logged error.
---

Browsers routinely block unmuted `play()` calls that aren't triggered by a user gesture
(autoplay policy). When implementing autoplay-on-mount:

- Call `.play()` and attach `.then()`/`.catch()` — never call it fire-and-forget or wrap it in
  code that would produce an unhandled promise rejection.
- On success (`.then()`): set playing state, start any dependent behavior (e.g. a tick interval).
- On rejection (`.catch()`): do nothing but let the component's initial/default state (paused)
  stand — no `console.error`, no thrown error, no broken/half-initialized state. The user still
  sees a normal "Play" button and can start playback with a real click, which browsers always
  permit.
- Do not treat a rejected autoplay promise as a bug to work around (e.g. retrying, muting to force
  it through) unless the human explicitly asks for that — it's a deliberate browser policy, and
  silently falling back to the paused state is the correct, expected behavior.

Precedent: `PlayerControls`'s mount effect in `album-promo.js` (issue #228,
`tests/player-timer-and-autoplay.test.js` AC2).
<!-- END SKILL.md -->
