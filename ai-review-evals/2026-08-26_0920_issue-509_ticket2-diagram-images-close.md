# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#509](https://github.com/mekhal/aidlc-radio-calico/issues/509) |
| PR | #514 (Test PR), #515 (Code PR), #517 (GH Pages 404 follow-up fix) — all merged to `develop` |
| Date | 2026-08-26 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | @mekhal |

---

## Task

Close of issue #509 ("What's this" page — Ticket 2: embed 3 diagram images with bilingual
captions), part of the #505 bilingual + diagram embedding follow-up story. Covers the Test PR
(#514), Code PR (#515), and a same-issue follow-up fix (#517) for a GitHub Pages 404 bug reported
by @mekhal after the Code PR shipped.

---

## Original User Request

> @claude close coding 4 satisfied 4
> เพราะ บางตำแหน่ง ไม่ต้องใส่รูปก็ได้ แล้วก็ รูปไม่ขึ้น ต้องมาแก้ไล่เช็คเองให้ขึ้น

Translated: "close, coding 4, satisfied 4 — because some positions didn't need to have an image,
and also the images didn't show up, I had to go debug/check it myself to get them to show."

---

## AI Decision

Recorded the scores verbatim (never self-scored). Traced the image-404 complaint to a specific,
already-documented root cause: `docs/decisions/2026-08-10-issue-299-repo-relative-path-base-path-pattern.md`
describes the exact same bug class (root-relative asset path breaking on a page rendered below
repo root), already fixed three times before (#101, #253, #299), including an explicit note in
that doc that it should be promoted to a skill — which never happened. Issue #509's Code PR (#515)
reproduced the same bug a 4th time by not checking for it. Proposed publishing that pattern as a
new skill now, rather than re-proposing an existing skill or letting it recur a 5th time. Recorded
the "some positions didn't need an image" complaint as a plan-time scoping lesson rather than
reopening the shipped sections, since @mekhal had explicitly agreed to the 1-image-per-section
mapping at plan time and no specific section was named for removal. Did not propose a Case Study
showcase entry, consistent with precedent of skipping the showcase when a close surfaces real
complaints even at moderate/passing scores.

Suggested Keywords:

- root-cause traced to a previously-documented-but-never-published pattern
- recurring bug class (4th occurrence: #101, #253, #299, #509)
- proposed (not applied) skill candidate
- plan-time agreement later reconsidered by the human after seeing shipped result

---

## Decision Type

Suggested Keywords:

- recurring gap identification (root-relative asset paths on nested pages)
- deferred skill promotion (documented in #299, never published, recurred)
- scope/density judgment revisited post-ship (1 image per section)

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

- Fourth occurrence of the same root-relative-path-on-nested-page bug class across #101
  (`app.js` i18n fetch), #253 (`shared/translations.js`), #299 (`sidebar/sidebar.js`), and now
  #509 (`whats-this/whats-this-page.js` image src). The fix pattern was documented after #299 but
  never turned into a checkable skill — this is the direct, traceable cause of the bug shipping a
  4th time.
- The image-density complaint ("some positions didn't need an image") was a plan-time decision
  @mekhal explicitly agreed to (2026-08-25, recorded in #509's issue body) and only reconsidered
  after seeing it live — worth factoring into how future "N images across M sections" plans get
  scoped, without necessarily meaning this instance needs rework.

---

## Future Policy *(Optional)*

-

---

## Lessons Learned *(Optional)*

- When a decision doc under `docs/decisions/` explicitly flags itself as "candidate for skill
  promotion" (as #299's did), that flag should be tracked to actual completion — not left to be
  rediscovered only after the same bug recurs. A candidate skill sitting unpublished is exactly as
  useless as one never written down once a repeat bug ships.
- When a plan proposes a uniform 1:1 mapping (e.g. "one image per section") across several items,
  it's worth asking at plan time which specific items the image actually strengthens vs. which are
  filler-for-symmetry, rather than defaulting to full uniform coverage just because it's simpler to
  specify as an AC.
