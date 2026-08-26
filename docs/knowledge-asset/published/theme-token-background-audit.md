<!--
Per human decision on issue #294's close (2026-08-08, "เก็บ knowledge เรื่องการใช้ style ไว้" —
"keep/save the knowledge about using style"): kept in docs/knowledge-asset/published/ only, per
CLAUDE.md's "Using a skill" section treating this folder as live/approved guidance already, not a
draft awaiting a copy into .claude/skills/.
Surfaced while closing issue #294 (Test Report Dashboard dark-theme readability bug).
Decision record: docs/decisions/2026-08-08-issue-294-close-scores-and-style-token-skill.md
-->
<!-- BEGIN SKILL.md -->
---
name: theme-token-background-audit
description: Use at AI-DLC step 2/3 when a plan touches CSS that pairs a shared color token as a solid *background* with a separately-themed text color (e.g. `--chloe-ink`) — audit whether that background token has a `[data-chloe-theme="dark"]` override in `shared/tokens.css` before shipping; if not, either add the override or reuse a token pair that already flips (`--chloe-player-box-bg`/`-fg`).
---

When a CSS rule sets `background: var(--some-token)` and pairs it with `color: var(--chloe-ink)`
(or any other token whose value changes under `[data-chloe-theme="dark"]`), check whether
`--some-token` itself has a dark-theme override in `shared/tokens.css`. If it doesn't, the
background stays fixed while the text flips — producing unreadable low-contrast combinations in
one theme.

Two fixes, in reuse-first order:

1. Point the rule at an existing token pair that's already proven to flip correctly elsewhere on
   the same page (e.g. `--chloe-player-box-bg`/`--chloe-player-box-fg`) instead of inventing a new
   token.
2. If a fixed-hue accent still needs to distinguish state (e.g. pass vs. fail), express it as a
   border/accent rather than a full background — that isolates the state cue from text-contrast
   responsibility, so the background/text pairing stays theme-safe while the accent color stays
   constant.

Root-cause example this skill was extracted from: `tests/test-report-dashboard.css`'s
`.report-reload-button`, `.report-list__item.is-pass`/`.is-fail`, and `.report-category-modal` all
reused `--chloe-mint`/`--chloe-pink`/`--chloe-cream` as full backgrounds against `--chloe-ink`
text; none of the first three had a dark-theme override in `shared/tokens.css`, and
`--chloe-cream` was never defined at all. Fixed in #294 (#297) by switching to
`--chloe-player-box-bg`/`-fg` plus a `border-left` accent for the pass/fail distinction.

**Confirmed a second time (issue #506):** `.chloe-contact-form` in `contact/contact.css` hardcoded
`background-color: #ffffff` paired with `--chloe-ink` text, producing the same fixed-background/
flipping-text mismatch. Fixed by pointing it at the same `--chloe-sage`/`--chloe-ink` pair About's
cards already use. Closing this issue, @mekhal asked to note explicitly: any form/card color
shades must match the site's current theme (not just contact) — treat this as a standing check
whenever a plan touches a background color on a card, form, or modal.
<!-- END SKILL.md -->
