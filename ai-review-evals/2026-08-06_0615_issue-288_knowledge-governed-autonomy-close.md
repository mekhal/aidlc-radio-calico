# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#288](https://github.com/mekhal/aidlc-radio-calico/issues/288) |
| PR | [#290](https://github.com/mekhal/aidlc-radio-calico/pull/290) (merged), [#291](https://github.com/mekhal/aidlc-radio-calico/pull/291) (closed, redundant duplicate) |
| Date | 2026-08-06 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | |

---

## Task

Add a new README section explaining the repo's 80/20 knowledge-governed autonomy principle
(AI autonomously executes routine work as trusted knowledge accumulates; high-risk/low-confidence/
business-critical decisions stay with human review), positioned before the existing
"Production-grade Standards" section, in both `README.md` and `README.th.md`, with a matching
infographic.

---

## Original User Request

> ปรับหัวข้อที่ 10 ใน Readme และ ใส่ข้อความตามนี้ เพื่อสื่อว่า Process ใน Repo นี้มีจุดประสงค์อะไร
>
> As trusted knowledge accumulates, AI can autonomously execute up to 80% of routine work. The
> remaining 20% high-risk, low-confidence, or business-critical decisions continues to require
> human review and approval.

Refined across the thread to: insert as a *new* section 10 before "Production-grade Standards"
(not replacing it), renumber sections 10-12 to 11-13, and embed the attached infographic.

---

## AI Decision

Suggested Keywords:

- flagged a topic mismatch between the issue's request and the existing section 10 before planning, rather than guessing a placement
- added a confidence-routing table (High/Medium/Low/Fail-Policy-risk → action) to make the 80/20 split concrete, beyond the issue's verbatim paragraph
- proposed waiving the Test PR for a README-only content change
- surfaced a sandbox limitation (no network fetch, no cross-directory file copy) instead of silently dropping the image requirement, and proposed 3 concrete workaround options
- reused a prior branch's commit via cherry-pick instead of re-writing content, after detecting the branch had no PR opened yet

---

## Decision Type

Suggested Keywords:

- introducing additional improvements (confidence-routing table)
- making architectural assumptions (section placement disambiguation)

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

- GitHub comment-attachment images land at temp paths (`/tmp/github-images/...`) that the agent's
  sandbox cannot fetch over the network or copy cross-directory into the repo. The only working
  path is for the human to commit the asset directly to a repo branch/folder, then the agent
  references it normally. Proposed as a new skill at this issue's close.
