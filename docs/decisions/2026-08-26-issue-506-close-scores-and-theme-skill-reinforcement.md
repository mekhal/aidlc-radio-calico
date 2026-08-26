# Issue #506 close — contact form theme scores and skill reinforcement

## Context

Issue #506 flagged that the contact form's card stayed a hardcoded white box under
`[data-chloe-theme="dark"]` while the rest of the page flipped to dark, with labels/inputs
rendered in unstyled Bootstrap defaults. The loop ran cleanly end to end:

- **Plan (review gate):** root-caused `.chloe-contact-form` in `contact/contact.css` hardcoding
  `background-color: #ffffff` instead of a theme token, paired with `--chloe-ink` text that does
  flip — the exact bug class already captured in the published
  `theme-token-background-audit.md` skill (extracted from issue #294). Proposed AC1–AC5
  (token-driven background/text, contrast, brand-palette borders/focus, brand typography, no
  behavior change).
- **Approved:** @mekhal confirmed layout stays as-is, scope is theme tokens/color/font/contrast
  per the proposed plan and AC.
- **Test PR (#507):** failing tests for AC1–AC4 against `contact/contact.css`, merged to
  `develop`.
- **Code PR (#510):** replaced the hardcoded `#ffffff` with `var(--chloe-sage)`/
  `var(--chloe-ink)` (the same pair About's cards use), styled `.form-label`/`.form-control`
  with `--chloe-pink`/`--chloe-pink-deep` borders and `--chloe-sans` typography, merged to
  `develop`.
- **Close:** `@claude close coding 5 satisfied 5` — @mekhal confirmed the form now matches the
  theme (screenshot attached) and scored the loop 5/5, plus asked to note that form color shades
  must match the current theme going forward.

## Decision

1. **Recorded Instruction Fidelity 5 / Result Satisfaction 5 verbatim** in a new
   `ai-review-evals/` entry — never self-scored, per the framework's own rule. No rework cycles
   occurred across plan → Test PR → Code PR.
2. **Verified no PR gap before closing.** Checked both prior-turn branches
   (`claude/issue-506-20260825-1419`, `claude/issue-506-20260825-1455`): PR #507 (Test PR) and
   PR #510 (Code PR) both merged to `develop`; `develop`'s current tip already contains the
   `--chloe-sage`/`--chloe-ink`/`--chloe-pink-deep`/`--chloe-sans` rules — nothing stranded.
3. **No new skill candidate proposed.** @mekhal's closing note — "form color shades must match
   the current theme" — restates the exact rule the published
   `docs/knowledge-asset/published/theme-token-background-audit.md` skill already encodes
   (audit any hardcoded/fixed-hue background paired with a theme-flipping text color; reuse an
   already-flipping token pair). Issue #506 is a second confirmed occurrence of that same bug
   class (first: issue #294's Test Report Dashboard), not a new pattern, so per `CLAUDE.md`'s
   close-step instruction to list only *new* candidates, none is proposed here.
4. **Reinforced the existing published skill instead of proposing a new one.** Appended a short
   "confirmed a second time" note to `theme-token-background-audit.md` recording issue #506 as a
   second occurrence and @mekhal's explicit directive, so the guidance carries more weight the
   next time a plan touches a form/card background. This directly fulfills @mekhal's "note it
   down" instruction in the close comment; it edits a file under `docs/knowledge-asset/published/`
   (outside `.claude/`, and already treated as approved/live guidance per `CLAUDE.md`'s "Using a
   skill" section), not `.claude/skills/` itself, so it isn't the kind of unprompted pre-existing
   skill re-proposal the close-step protocol asks the agent to avoid.
5. **Case Study showcase:** not proposed this time. #506 is a straightforward second application
   of an already-showcased pattern (issue #294 is already one of the three curated entries in
   `data/case-studies.json`); adding a near-duplicate example would dilute rather than strengthen
   the curated set.

## Why

Decision 3/4 matter because the value of `theme-token-background-audit.md` comes from being
consulted *before* writing CSS, not just from existing — a confirmed second real-world hit
(#294 → #506) is stronger evidence the pattern is worth enforcing than either occurrence alone,
and recording that reinforces confidence in the skill without fragmenting the same lesson across
multiple files.

Decision 5 matters because the Case Study set is deliberately small and curated per the issue
#203 decision — every entry should illustrate something the existing set doesn't already show.

## Impact

- Issue #506 closes at its shipped scope: PR #507 (tests) and PR #510 (code) both merged to
  `develop`; nothing reopened or changed in shipped code by this close.
- `docs/knowledge-asset/published/theme-token-background-audit.md` gains a short reinforcement
  note (second confirmed occurrence); no new skill file proposed.
- `data/case-studies.json` left unchanged.
