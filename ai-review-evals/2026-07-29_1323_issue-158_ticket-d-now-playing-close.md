# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | [#158](https://github.com/mekhal/aidlc-radio-calico/issues/158) |
| PR | [#201](https://github.com/mekhal/aidlc-radio-calico/pull/201) (Test PR, merged) · [#204](https://github.com/mekhal/aidlc-radio-calico/pull/204) (Code PR, merged) · [#210](https://github.com/mekhal/aidlc-radio-calico/pull/210) (hide Recently Played, merged) · [#212](https://github.com/mekhal/aidlc-radio-calico/pull/212) (cover-art flicker fix, merged) |
| Date | 2026-07-29 |
| Agent | Claude |
| Model | claude-sonnet-5 |
| Reviewer | @mekhal |

---

## Task

Ticket D of the "Landing Page โปรโมตอัลบั้มเพลง" story (#150): fetch live stream metadata
(`metadatav2.json`/`cover.jpg`) and bind it into Ticket C's Music Player Card, plus render a
Recently Played list. Went through a step-3 AC6/polling-scope resolution, a Test PR, a Code PR,
one out-of-scope-request triage (no real audio, no real quality/year fields — cross-referenced to
Ticket E), a hide-Recently-Played review round, and a cover-art flicker review round.

---

## Original User Request

Original AC1–AC6 (fetch metadata + cover on load, bind into Ticket C's DOM hooks, Recently Played
list, graceful fallback, small testable functions, `album-promo.*`-only). Followed by step-3
clarifying answers (AC6 dual-file mirroring, shared 10s poll for all fields), a request to add
console.log + `localStorage` persistence of test results (redirected to a new issue, #205), a
report of no audio / stuck "Loading…" fields / a request to hide Recently Played (triaged: audio
and quality/year fields cross-referenced to Ticket E as pre-existing scope gaps, Recently Played
hidden via CSS per human choice), and a report of cover-art flicker on the 10s poll (fixed via
SHA-256 fingerprint compare, per human's explicit choice of hash over ETag). This close comment
itself supplies the Instruction Fidelity (4) and Result Satisfaction (5) scores directly, each with
a one-line reason.

---

## AI Decision

1. At the step-3 gate, correctly surfaced the AC6/`index.html` conflict left over from #157's
   entry-point decision, and the ambiguity of one-shot vs. polling cadence across AC1–AC3, as two
   explicit questions rather than picking an interpretation silently — see
   `docs/decisions/2026-07-28-ticket-d-ac6-revision-and-near-real-time-polling.md`.
2. Correctly redirected the human's console.log/`localStorage` test-results request to a new issue
   (#205) rather than folding it into the Code PR, per `CLAUDE.md`'s "missed functionality becomes
   a NEW issue" rule — it was unrelated to Ticket D's own AC.
3. On the no-audio / stuck-Loading-fields / hide-Recently-Played review turn, correctly answered the
   first two as "working as designed, out of this ticket's AC, here's why" with code citations
   rather than silently patching them, and presented the third (hide Recently Played) as a
   two-option menu (CSS hide vs. DOM removal) — implemented only after the human's `approved`
   picked CSS hide. See
   `docs/decisions/2026-07-29-ticket-d-hide-recently-played-and-cover-art-flicker-fix.md`.
4. On the cover-art-flicker review turn, correctly diagnosed the root cause (unconditional
   cache-bust on every poll tick) before proposing a fix, and proactively offered two concrete
   fix approaches (SHA-256 hash compare vs. ETag/Last-Modified) with an explicit tradeoff for each,
   rather than picking one silently — this is what the human's Result Satisfaction (5) score
   credits.
5. **Gap:** when implementing the hash-compare fix (PR #212) after `@claude approved hash checked`,
   added a genuinely new, non-trivial function (`fetchCoverFingerprint()`, a SHA-256 digest over a
   fetched blob) without writing a unit test for it and without asking the human whether one was
   wanted. The human had to explicitly request it as a follow-up PR comment
   ("เขียน Unit test มาทดสอบ `fetchCoverFingerprint` เพิ่มด้วย"), which then landed as a second
   commit on the same PR. This is what the human's Instruction Fidelity (4, not 5) score docks —
   confirmed directly by the close-comment's own reason ("สร้าง function ใหม่แต่ไม่ถามว่าจะเขียน
   Unit test ไหม").

Suggested Keywords:

- proactive multi-option proposal at a `review` gate (cover-art flicker root-cause + hash-vs-ETag)

- correctly gated implementation on explicit `approved`, twice in a row

- new non-trivial function shipped in a review→approved fix without proactively offering/asking
  about a unit test — surfaced by the human as a fidelity gap, not caught by the agent itself

---

## Decision Type

A mix of correctly-gated AC amendments (AC6/polling), correctly-scoped out-of-scope triage
(console.log/localStorage → new issue #205; no-audio/quality-fields → cross-reference to Ticket E),
a properly human-gated UI change (hide Recently Played), and one recurring process gap: skipping a
proactive test-coverage question for a new function added outside the standard Test PR → Code PR
loop (i.e., during a `review`→`approved` fix cycle rather than through step 4's failing-tests-first
flow).

Suggested Keywords:

- out-of-scope requests correctly split to a new issue vs. cross-referenced to a sequenced sibling
  ticket, per which applied

- UI visibility change correctly presented as a lettered menu, implemented only after `approved`

- test coverage for new functions added outside the Test PR step was not proactively offered — the
  human had to ask for it after the fact

---

## Risk Level

Default

```
Medium
```

(Human may change later.)

---

## Instruction Fidelity (0–5)

4

---

## Result Satisfaction (0–5)

5

---

## Human Decision *(Optional)*

Scores provided directly in the `@claude close` trigger comment itself, each with its own reason:

> coding 4 เพราะสร้าง function ใหม่แต่ไม่ถามว่าจะเขียน Unit test ไหม
> ความพอใจ ให้ 5 เพราะมีการแนะนำก่อนว่าให้ลองใช้ hash เช็ค แทน Etag

Interpreted as Instruction Fidelity 4 / Result Satisfaction 5, filled in as given per `CLAUDE.md`'s
"if the human provides these scores directly in the close comment, the agent fills them in as
given."

---

## Review Notes *(Optional)*

-

---

## Future Policy *(Optional)*

-

---

## Lessons Learned *(Optional)*

- When a fix implemented during a `review`→`approved` cycle (i.e., outside the normal step-4
  Test-PR-first flow) introduces a genuinely new, non-trivial function, proactively ask whether a
  unit test is wanted (or just write one) before opening the PR — don't wait for the human to
  request it afterward. This is distinct from trivial one-line fixes, which don't need the same
  prompt.
- Root-causing before proposing, and offering a labeled menu of concrete fix options with tradeoffs
  (as in the hash-vs-ETag proposal), is the behavior that earned the 5/5 satisfaction score here —
  worth continuing deliberately, not just as a side effect of being thorough.
