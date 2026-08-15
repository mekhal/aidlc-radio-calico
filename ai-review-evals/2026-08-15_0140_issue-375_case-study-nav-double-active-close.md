# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#375](https://github.com/mekhal/aidlc-radio-calico/issues/375) |
| PR | [#376](https://github.com/mekhal/aidlc-radio-calico/pull/376) (Test PR, merged), [#377](https://github.com/mekhal/aidlc-radio-calico/pull/377) (Code PR, merged) |
| Date | 2026-08-15 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | @mekhal |

---

## Task

Fixed a nav bar bug where opening `case-study.html` directly showed both Home and Case Study
boxed as active simultaneously, per a screenshot in the issue body. Diagnosed the root cause,
proposed a fix at review, added a failing test for the exact real-world trigger, then implemented
the fix.

---

## Original User Request

Turn 1 (issue body): screenshot showing both Home and Case Study active on `case-study.html`,
AC "menu ต้อง Active แค่หน้าที่เป็น (เคสนี้คือ Case Study)", plus `@claude review`. Turn 2:
`@claude approved AC` — Test PR. Turn 3: `@claude approved Test PR Ok Please continue` — Code PR.
Turn 4 (this entry): `@claude close coding 5 satisfied 5 เพิ่มการตัดสินใจนี้เข้า knowledge ด้วย`
(scores given directly, plus an explicit request to add this decision to knowledge/skills).

---

## AI Decision

1. Root-caused the bug directly from `menu/menu.js`'s `getActiveNavKeys()` before proposing any
   fix — traced it to an unconditional empty-hash-to-`"#home"` fallback that predates Case Study
   becoming a standalone page (#323), rather than guessing at the cause from the screenshot alone.
2. At review, proposed two functionally-equivalent fixes and stated a lean (option 2, the more
   general path-based gate) without picking unilaterally, since no preference had been stated yet.
3. At the Code PR, with still no preference stated at approval, picked the smaller of the two
   fixes (option 1 — gate the fallback on `!isCaseStudyActive()`) rather than the more general one,
   consistent with not over-implementing/generalizing beyond what was asked.
4. The Test PR's new case targeted the exact real-world trigger (hash empty because no anchor is
   ever set on `case-study.html`) rather than reusing the existing file's pattern of an explicit
   non-home hash — closing a real coverage gap identified during root-causing, not just satisfying
   the AC's literal wording.
5. Flagged, rather than silently skipped, that Code PR verification against the full test suite was
   done by manual trace instead of execution, since headless browser access isn't in this
   environment's `--allowedTools`.
6. At close, drafted a new-skill candidate (`standalone-page-nav-fallback-audit`) per @mekhal's
   explicit request to capture this as reusable knowledge, offered for add/update/skip rather than
   written directly to `.claude/skills/` (write-guard) or applied unprompted.

Suggested Keywords:

- root-cause-before-fix-proposal
- smaller-fix-over-general-fix when no preference stated at approval
- test-gap-closed-beyond-literal-AC-wording (real trigger, not just explicit hash case)
- allowedTools-gap-flagged-not-silently-skipped
- new-skill-drafted-on-explicit-request

---

## Decision Type

**Bug fix (single root cause, one full AI-DLC loop, no waivers) with a close-time explicit request
to capture a new skill.**

Suggested Keywords:

- full loop run, no Test PR waiver
- fix scope choice made without a stated human preference (chose narrower option)
- close-time explicit "add this to knowledge" request

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
5
```

(Score given directly by @mekhal in the close trigger: "coding 5".)

---

## Result Satisfaction (0–5)

```
5
```

(Score given directly by @mekhal in the close trigger: "satisfied 5".)

---

## Human Decision *(Optional)*

- No reason attached to either score — @mekhal posted `coding 5 satisfied 5` directly, alongside an
  explicit request to add this decision to knowledge (see the proposed `standalone-page-nav-fallback-audit`
  skill in the close comment).

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

- The "a shared component's fallback logic assumes only one page has empty state X" bug class had
  no existing skill in `docs/knowledge-asset/published/` to reuse — same gap shape as issue #354's
  close (a different global-state hazard with no prior skill). Captured here as
  `standalone-page-nav-fallback-audit`.
