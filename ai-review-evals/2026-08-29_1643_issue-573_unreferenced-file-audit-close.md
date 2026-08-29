# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#573](https://github.com/mekhal/aidlc-radio-calico/issues/573) |
| PR | none for the audit turn (comment-only, task scope forbade file changes); this close-step PR carries only decision/knowledge-asset/eval bookkeeping |
| Date | 2026-08-29 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | @mekhal |

---

## Task

Close of issue #573, a task-only audit of unreferenced files across the repo (AC1–AC5), with an
explicit Out-of-scope forbidding any delete/move/edit in this issue's own PR. The audit turn
proposed 3 confirmed DELETE candidates, 3 ASK items, and KEEP for `reports/**` and systematically-
referenced directories. This close comment reviewed those proposals, added a 4th DELETE
(`album-promo.html`, previously not surfaced), re-routed one ASK item to a human-only deletion,
deferred two ASK items to a future ticket, and recorded a methodology gap in the audit's own DELETE
criterion for the next round.

---

## Original User Request

> AC1-AC5 ครบแล้ว ตัดสินใจตามนี้ และปิด issue
>
> ## กฎใหม่ (บันทึกเป็น knowledge asset ตอน close)
> ไฟล์ที่ deprecated ต้องถูกลบออกจากชิ้นงานพร้อม test ของมัน ประวัติเก็บไว้ที่
> docs/knowledge-asset/deprecated/ และ docs/decisions/ เท่านั้น ไม่เก็บไฟล์ deprecated ไว้ในโค้ด
>
> [4 pre-deletion conditions, confirmed DELETE list including album-promo.html + cdn-sources.json
> cleanup, human-only deletion for the stray skill file, DEFER for src/README.md and
> specs/README.md, KEEP for the rest, an audit-methodology gap to record, and 4 new follow-up
> issues to open]
>
> @claude close

(Full Thai text preserved in the issue's trigger comment; summarized here for length — see
issue #573's comment history for the verbatim close instruction.)

---

## AI Decision

Recorded all of @mekhal's close-time decisions into a single decision doc rather than re-litigating
any of them. Independently verified (not just transcribed) the two claims that determine file
safety before writing them down: (1) `album-promo.js`/`.css` are still loaded live from
`index.html:20,75` while `album-promo.html` itself has no inbound load-path reference anywhere
(only a comment mention in `menu/menu.js:33`) — confirms the file-level-not-prefix-level
distinction the new rule is built on; (2) `app.js` has no `<script src="app.js">` in any deploy
page (`index.html`, `pages/*.html`) — only a code comment at `index.html:30` — matching
`config/cdn-sources.json:48`'s own issue #220 dead-code note. Drafted the new knowledge asset
(`deprecated-file-removal-before-close`) under `docs/knowledge-asset/published/` per the
write-guard workaround, grounded in the `album-promo.html` case rather than written as generic
advice. Opened 4 new GitHub issues per the close comment's explicit list rather than folding any
of that work into this already-audit-only issue, per `CLAUDE.md`'s "missed functionality becomes a
NEW issue" rule. Did not action any of the confirmed DELETEs myself — this issue's own scope
forbids it; deletion is issue 3 of the 4 new issues.

Suggested Keywords:

- decisions transcribed faithfully, but load-path claims independently re-verified via grep before being written into a decision doc
- new knowledge asset grounded in a concrete in-repo case, not generic advice
- scope split into 4 new issues per human's own explicit list
- no code/file changes made in the issue this close belongs to (audit-only scope honored)

---

## Decision Type

Suggested Keywords:

- knowledge-asset capture of a newly-stated policy (deprecated files must be removed, not left as dead references)
- audit-methodology gap self-reported by the human and formally logged for the next round
- deferred decision-capture (two ASK items pushed to a future README-alignment ticket rather than decided now)

---

## Risk Level

Default

```
Medium
```

(Human may change later.)

---

## Instruction Fidelity (0–5)

-

---

## Result Satisfaction (0–5)

-

---

## Human Decision *(Optional)*

-

---

## Review Notes *(Optional)*

- The audit turn's AC2 criterion ("referenced anywhere + not used by a workflow") is proven
  insufficient by this close: it correctly kept `album-promo.js`/`.css` (real references) but
  couldn't distinguish `album-promo.html`'s deprecated status from its live siblings without the
  human's explicit call-out, and it silently passed over `app.js` as safe because tests reference
  it, without checking whether it's still shipped. See decision 6 in the linked decision doc for
  the proposed second criterion for the next audit round.

---

## Future Policy *(Optional)*

-

---

## Lessons Learned *(Optional)*

- "Referenced somewhere in the repo" and "loaded from a live deploy page" are different claims,
  and an audit's DELETE criterion needs to check both before it's trustworthy — a decision doc
  comment or a config manifest's `usedIn` listing counts as "referenced" but not as "still ships."
- Deprecation banners/decisions should be read as applying to the literal file named, never
  generalized to every file sharing its basename stem, without an explicit check of each sibling.
