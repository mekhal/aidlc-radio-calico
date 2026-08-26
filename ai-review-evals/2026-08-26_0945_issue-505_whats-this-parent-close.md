# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#505](https://github.com/mekhal/aidlc-radio-calico/issues/505) |
| PR | via sub-issues [#508](https://github.com/mekhal/aidlc-radio-calico/issues/508) (Test PR #512, Code PR #513) and [#509](https://github.com/mekhal/aidlc-radio-calico/issues/509) (Test PR #514, Code PR #515, follow-up PR #517) — all merged to `develop` |
| Date | 2026-08-26 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | @mekhal |

---

## Task

Close of issue #505, the parent tracking issue for the "What's this" page bilingual (TH/EN) +
diagram embedding story, after both of its sub-issues (#508, #509) already closed individually.
Covers @mekhal's parent-level close scores plus 3 newly-reported follow-up problems with the
shipped diagram images.

---

## Original User Request

> @claude close coding 4 satisfied 4
>
> รุปไม่ขึ้นต้องไปไล่แก้เอง
>
> ช่วยสร้าง Ticket ใหม่ เพื่อแก้ปัญหาตามนี้
> 1. ลบภาพแรกออก
> 2. ปรับขนาดภาพ และปรับ description เพื่ออธิบายภาพ
> 3. ปรับขนาดภาพ และปรับ description เพื่ออธิบายภาพ

Translated: "close, coding 4, satisfied 4 — the images didn't show, I had to go debug/fix it
myself. Please create a new ticket to fix these problems: 1. remove the first image. 2. resize the
image and adjust the description to explain it. 3. resize the image and adjust the description to
explain it." (each numbered item accompanied by a screenshot of the corresponding section.)

---

## AI Decision

Recorded the scores verbatim (never self-scored). Recognized the "images didn't show" complaint as
a repeat of the exact complaint already root-caused and fixed at sub-issue #509's own close
(GitHub Pages 404 from a root-relative `image.src`, fixed in PR #517, with a skill already drafted
and still pending human decision) rather than re-diagnosing or re-proposing a duplicate fix/skill.
Mapped each of the 3 numbered screenshots to its actual section/file by reading the shipped
`data/whats-this-content.json` and `whats-this/whats-this.js`: image 1 = `whatIsThis` section's
`code-pr-gates.jpg` (remove), image 2 = `aidlcLoop` section's `aidlc-loop-gates.jpg` (resize +
re-caption), image 3 = `skillCapture` section's `skill-reuse-gates.png` (resize + re-caption).
Confirmed the "too large" complaint against actual evidence (checked real image pixel dimensions —
1024×683 and 1536×1024 — against the page's `img-fluid` CSS and the text column's `max-width: 42rem`)
rather than taking the complaint at face value without verifying a plausible cause. Opened a new,
standalone GitHub issue (#522) for the 3 problems — per `CLAUDE.md`'s "missed functionality becomes
a NEW issue" rule — rather than reopening #505's already-closed loop, and scoped #522 to explicitly
exclude the already-fixed 404 bug and the already-decided image-density question so a future
`@claude review` on it doesn't re-litigate either.

Suggested Keywords:

- duplicate-complaint cross-reference (avoided re-diagnosing an already-fixed bug)
- root-cause verification against real evidence (image pixel dimensions, CSS rules) before scoping a new ticket
- new issue opened per "missed functionality becomes a new issue" rule
- parent-issue close after both sub-issues already independently closed

---

## Decision Type

Suggested Keywords:

- scope boundary enforcement (new ticket instead of reopening closed loop)
- avoiding duplicate skill/fix proposals across related issues

---

## Risk Level

Default

```
Medium
```

(Human may change later.)

---

## Instruction Fidelity (0–5)

- 4

---

## Result Satisfaction (0–5)

- 4

---

## Human Decision *(Optional)*

-

---

## Review Notes *(Optional)*

- The "images didn't show" complaint at this parent close is the same one already recorded and
  fixed at #509's close (PR #517) — no new bug found here, just carried-over frustration repeated
  at the parent level. Worth watching whether the pending
  `root-relative-path-audit-for-nested-pages` skill (still awaiting @mekhal's add/update/skip
  decision from #509's close) gets acted on, since that's the actual lever to stop this class of
  bug recurring a 5th time.
- New issue #522 covers 3 concrete, independently actionable fixes (remove one image, resize +
  re-caption two others) — small enough it likely doesn't need its own sub-issue split.

---

## Future Policy *(Optional)*

-

---

## Lessons Learned *(Optional)*

- When a parent tracking issue closes after its sub-issues already closed individually, check
  whether the human's close-comment feedback duplicates a complaint already recorded (and possibly
  already fixed) at a sub-issue's own close before treating it as new — cross-reference rather than
  re-diagnose.
- When a human's UI complaint is a subjective judgment ("too big", "doesn't show"), verify it
  against concrete evidence (actual asset dimensions, actual CSS rules in effect) before scoping a
  fix ticket, rather than passing the complaint through as-is without a diagnosis a future
  implementer can act on directly.
