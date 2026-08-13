# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#323](https://github.com/mekhal/aidlc-radio-calico/issues/323) |
| PR | [#341](https://github.com/mekhal/aidlc-radio-calico/pull/341) (Test PR, merged), [#342](https://github.com/mekhal/aidlc-radio-calico/pull/342) (Code PR, merged), [#346](https://github.com/mekhal/aidlc-radio-calico/pull/346) (Test PR, rework, merged), [#347](https://github.com/mekhal/aidlc-radio-calico/pull/347) (Code PR, rework, merged), [#349](https://github.com/mekhal/aidlc-radio-calico/pull/349) (bug fix, merged) |
| Date | 2026-08-13 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | @mekhal |

---

## Task

Ticket 2 of #203 — `data/case-studies.json` (3 curated, closed AI-DLC loops: #245/#294/#158, each
with a Problem → AI Action → Outcome narrative plus metrics) and a Highlight Cards renderer.
Originally shipped inline on `index.html`, then reworked mid-loop into a standalone
`case-study.html` page after @mekhal reviewed the merged result and asked for a real separate
page rather than an in-page section.

---

## Original User Request

Spanned many turns. Notable ones: `@claude review` AC (flagged `album-promo.html` conflict,
resolved to index-only); repeated `@claude review` rounds narrowing 3 case-study candidates and
the JSON field shape, including one trigger comment with literal unfilled placeholders ("Issue
#...", "field ..."); `@claude review` requesting a Problem → AI Action → Outcome card layout with
a visual connector; `@claude approved` through Test PR → Code PR (#341/#342); `@claude review`
"สร้างเป็นหน้าใหม่ แยกหน้าใครหน้ามันเลยซิ" (make it a separate page) with a screenshot; `@claude
approved` confirming a real `case-study.html` page and a mini Test PR → Code PR loop
(#346/#347); `@claude review` "ลบ Case study ในหน้า Home ออกด้วย" (remove Case Study from Home
too) with a screenshot showing it still there; `@claude approve` clarifying that was a bug fix,
not a rework (#349). This entry: `@claude close  coding 4 ยังมีบัคต้องแก้ เดี่ยวไปจัดการทีหลัง 
satisfied 3 ทำ page รวน ต้องบอกให้แก้หลายรอบ` — scores given directly with brief reasons.

---

## AI Decision

1. Correctly blocked and asked for clarification twice rather than guessing: once when a trigger
   comment contained literal placeholder text ("Issue #...", "field ...") instead of real values,
   and once when "แยกหน้าใครหน้ามันเลยซิ" (separate page) was ambiguous between a real new HTML
   file and a same-page tab view — the latter distinction mattered because it changed whether an
   already-closed ticket's (#322) nav logic needed reopening and whether an unstarted ticket's
   (#324) layout assumption needed to be flagged.
2. Rejected two invalid case-study candidates the human proposed (#203 — still open, and
   self-referential as this ticket's own parent story; #296 — a PR belonging to #294's own loop,
   not a distinct issue) rather than silently substituting them, explaining the specific
   disqualifying reason each time.
3. Treated the step-7 "separate page" request as a real architecture change requiring its own
   mini Test PR → Code PR loop (not folded into a quick edit), and surfaced the playback-stops
   tradeoff (leaving `index.html` kills the live stream) as an explicit choice rather than
   deciding it silently — @mekhal accepted the simpler same-tab default.
4. **Missed a regression before merging PR #347:** the code comment in `album-promo.js` described
   removing the inline `buildCaseStudySection()` call, and a regression test
   (`tests/album-promo-case-study-removed.test.js`) was written asserting exactly that, but the
   actual line removal was never made — verification was a manual line-by-line trace against the
   test assertions (sandbox blocked running the test suite/browser), and that trace did not catch
   the one line that contradicted its own adjacent comment. The bug shipped to `develop`/Home and
   was only caught when @mekhal viewed the live page.
5. Once flagged, correctly identified root cause immediately and produced a minimal one-line fix
   (PR #349), and accepted @mekhal's correction that this was a bug fix rather than a new step-7
   rework rather than re-litigating the classification.

Suggested Keywords:

- correctly blocked on literal placeholder text in a trigger comment rather than guessing
- correctly blocked on an ambiguous step-7 request (new page vs. same-page view) given cross-ticket impact
- rejected invalid case-study candidates with a stated, specific reason each time
- missed a self-contradicting line (comment said "removed", call was still present) during manual-trace verification when the sandbox blocked running the actual test suite, letting a regression reach `develop`

---

## Decision Type

**Feature implementation across two loop passes** (original in-page cards, then a step-7
architecture rework to a standalone page), with one real production regression from
manual-trace-only verification, caught and fixed in a follow-up turn.

Suggested Keywords:

- multi-round candidate/shape negotiation before step 4, several rounds correctly blocked rather than guessed
- step-7 architecture rework (in-page section → standalone page) run as its own mini Test PR → Code PR loop
- regression shipped past manual-trace verification when real test execution was unavailable, caught by human review of the live page

---

## Risk Level

Default

```
Medium
```

(Human may change later.)

---

## Instruction Fidelity (0–5)

```
4
```

(Score given directly by @mekhal in the close trigger — reason given: "ยังมีบัคต้องแก้ เดี่ยวไปจัดการทีหลัง" / there's still a bug to fix, will handle it later.)

---

## Result Satisfaction (0–5)

```
3
```

(Score given directly by @mekhal in the close trigger — reason given: "ทำ page รวน ต้องบอกให้แก้หลายรอบ" / the page came out unstable, needed to be told to fix it over several rounds.)

---

## Human Decision *(Optional)*

- @mekhal closed the issue accepting a known outstanding bug as their own follow-up ("เดี๋ยวไปจัดการทีหลัง") rather than asking this turn to investigate or fix it — no new issue was opened for it in this close, since the human did not ask for one.

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

- This is the second time in this issue's own history that "verified by manual line-by-line trace
  because the sandbox blocked test execution" preceded a real bug reaching `develop` (the PR #347
  stray-call regression). The manual trace checked assertions against the diff but did not
  specifically search for lines that contradicted the diff's own adjacent comments. A proposed
  new-skill candidate (see close comment) is to add a targeted grep-for-leftover-references check
  as a supplement to manual trace whenever execution is unavailable.
- Two literal-placeholder / misidentified-candidate corrections in the same thread (candidate
  #203, candidate #296, and one turn with literal "..." placeholders) suggest step-3 candidate
  proposals for future showcase-style tickets should be double-checked against `gh issue view
  --json state` before presenting them, not just sourced from `ai-review-evals/` filenames.
