# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#397](https://github.com/mekhal/aidlc-radio-calico/issues/397) |
| PR | [#398](https://github.com/mekhal/aidlc-radio-calico/pull/398), [#399](https://github.com/mekhal/aidlc-radio-calico/pull/399) |
| Date | 2026-08-19 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | @mekhal |

---

## Task

Add a reference to the Anthropic Claude Code Udemy course under **References & Acknowledgements**
in `README.md` and `pages/about.html`, with the About-page link opening in a new tab.

---

## Original User Request

Issue body: add a bullet in `README.md`'s References & Acknowledgements section linking the Udemy
course, and add a matching list item in `pages/about.html`'s References section styled like the
existing entries, with `target="_blank" rel="noopener noreferrer"`.

---

## AI Decision

Discovered at step 2 that the About page's References section is fully data-driven and that no
existing reference rendered as a link, so "match the visual style of existing references" had no
existing linked-reference pattern to copy — this was new behavior (conditional anchor rendering),
not a content-only edit. Raised two open questions before planning: whether to add a 5th reference
entry or replace an existing one, and whether to mirror the change into `README.th.md` per
`CLAUDE.md`'s mirror rule (the issue only named `README.md`). After the human answered both,
interpreted "แก้ไขรายการที่ 4" literally as *replace* item 4 ("Style Guide") rather than *add* a
5th entry, and flagged that interpretation explicitly in the Test PR comment for review before the
Code PR implemented it.

Suggested Keywords:

- ambiguous-gate-answer-flagged-before-implementing
- generic-url-driven-render-branch-over-one-off-anchor
- readme-mirror-sync-question-raised-proactively

---

## Decision Type

Suggested Keywords:

- making architectural assumptions
- changing project conventions

---

## Risk Level

Default

```
Medium
```

(Human may change later.)

---

## Instruction Fidelity (0–5)

- 5 (given directly by @mekhal in the close comment: "coding 5")

---

## Result Satisfaction (0–5)

- 5 (given directly by @mekhal in the close comment: "satisfied 5")

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

- Raising an ambiguity (replace vs. add) as an explicit question before planning, then still
  flagging the literal-reading interpretation again in the Test PR before the Code PR implemented
  it, avoided a rework cycle — the human's next `@claude approved` implicitly confirmed the
  reading rather than requiring a redirect. Contrast with issue #151's close, where a similarly
  short gate answer ("Sub ticket") was acted on without being echoed back and turned out to be
  misread — flagging twice here (at the question and again at the interpretation) is the safer
  default for single-word/short-phrase answers.
