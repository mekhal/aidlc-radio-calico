# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | #317 |
| PR | #320, #321 |
| Date | 2026-08-13 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | |

---

## Task

Bring the 59 JS files into lint compliance after issue #314's close revealed 5,693 `standard`
violation lines (not the "1 error" a stale report had suggested). Decide among (a) mechanical
`standard --fix` reformat, (b) leave report-only/deferred, (c) swap the Mega-Linter JS flavor to a
custom ESLint config matching the codebase's actual house style.

---

## Original User Request

`@claude approved c ปรับ lint ให้เหมาะสมกับการทำงานปัจจุบัน เพิ่มความยืดหยุ่นในการทำงาน และก็ปรับ
Report ด้วย อะไรที่ไม่จำเป็นก็ไม่ต้องใส่ใน lint report เอาเท่าที่เฉพาะจำเป็น และ Human สามารถ review
ได้` — approved option (c), with two added requirements: keep the lint setup flexible, and trim
the report to only what's necessary.

At close: `@claude close no score เพราะ ผลลัพท์ยังไม่เปลี่ยนแปลง ช่วยสร้าง Ticket ใหม่ สำหรับรอการ
ตรวจสอบอีกครั้งภายหลัง` — close with no score because the result hadn't changed yet; requested a
new ticket to re-check later.

---

## AI Decision

- Implemented option (c): new `.eslintrc.json` matching house style + `.mega-linter.yml` rescoped
  via `DISABLE_LINTERS` (not the plan's originally-sketched `ENABLE_LINTERS`, corrected
  mid-implementation once its global-whitelist scope was understood) to drop
  `JAVASCRIPT_STANDARD`/`JAVASCRIPT_PRETTIER`, plus `FILTER_REGEX_EXCLUDE` extended to
  `.claude/skills/`.
- At close: investigated *why* the human still saw an unchanged result even though PR #320/#321
  were merged, rather than treating "no score" as just a data point to record. Found the root
  cause — `reports/lint/megalinter-report.html` only regenerates on the weekly `cron` job in
  `.github/workflows/mega-linter.yml`, not on the `pull_request`/`push` triggers those PRs ran
  under — and recorded it in `docs/decisions/2026-08-13-issue-317-js-lint-close-report-cadence.md`.
- Opened a new follow-up issue ([#355](https://github.com/mekhal/aidlc-radio-calico/issues/355))
  to re-verify the report after its next weekly refresh, without an `@claude` mention in the body
  (so it doesn't self-trigger before the wait condition — a report refresh — is even met).
- Raised one new-skill candidate (Mega-Linter report refresh cadence) for the human to decide on.

Suggested Keywords:

- root-cause investigation beyond the literal request
- CI/report cadence
- deferred verification

---

## Decision Type

Suggested Keywords:

- making architectural assumptions (root-causing the stale-report question instead of just
  logging "no score" as given)
- introducing additional improvements (skill candidate proposal)

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

-

---

## Future Policy *(Optional)*

Examples

- Always Auto
- Auto with Review
- Human Review
- Human Only

---

## Lessons Learned *(Optional)*

-
