# Decision: Issue #579 (execute #573's confirmed DELETE list) closed

**Issue:** [#579](https://github.com/mekhal/aidlc-radio-calico/issues/579) — delete the 4 files
confirmed at #573's close (`trivy.yml` root copy, `images/ai-autonomy-goal.jfif`,
`images/knowledge_growth_over_time.png`, `album-promo.html`) and strip `"album-promo.html"` from
`usedIn` at all 5 sites in `config/cdn-sources.json`, per AC1–AC4.
**PR:** [#587](https://github.com/mekhal/aidlc-radio-calico/pull/587) (Test PR, opened then
closed — see decision 1) and [#588](https://github.com/mekhal/aidlc-radio-calico/pull/588) (Code
PR, merged to `develop` by @mekhal); this close-step PR carries only the decision doc / eval /
knowledge-asset bookkeeping below.
**Decided by:** @mekhal, 2026-09-01

## Decision

1. **Test PR waived after being opened, not before.** The step-3 gate (`@claude approved Test
   PR`) was read literally as step 4 ("write failing tests, open a Test PR"), producing PR #587
   with existence-check tests for AC1–AC3. @mekhal then clarified the intent was "remove unused
   [files]," not "add tests for a clean-up issue" — the agent flagged the ambiguity back
   (per `gate-trigger-vs-intent-mismatch`) instead of guessing further, @mekhal confirmed waiving
   the Test PR and closing #587 by hand, and the agent proceeded straight to a Code PR (#588,
   merged). Net effect: one extra round-trip that a proactive waiver proposal at step 3 would have
   avoided (see decision 2).
2. **New rule captured as a knowledge asset** (see
   `docs/knowledge-asset/published/propose-test-pr-waiver-for-pure-cleanup-issues.md`): for an
   issue whose entire AC is file deletion/removal with no new runtime logic, the step-3 plan must
   proactively flag it as a Test-PR-waiver candidate and ask, rather than defaulting to writing
   existence-check tests and waiting for the human to walk it back. This is the human's literal
   close-comment feedback: "ไม่ควรใส่ Unit Test ใน issue Clean up (ควรถามก่อนถ้าไม่แน่ใจ)" — don't add
   unit tests in a Clean-up issue; ask first if unsure.
3. **PR #587 disposition:** closed by @mekhal directly, per their own earlier offer in-thread
   ("I will close PR #587 myself"). Not reused/turned green — superseded by #588's direct
   deletion instead.
4. **Scores as given in the close comment:** Instruction Fidelity 4, Result Satisfaction 4 (see
   linked eval entry) — reflects the extra round-trip in decision 1, not the eventual AC1–AC4
   delivery in #588, which matched the issue's plan exactly.
5. **Case Study showcase:** not proposed. The loop needed a mid-course human correction rather
   than running clean end-to-end, so it doesn't fit the showcase's "clean, illustrative" bar
   (same reasoning `data/case-studies.json`'s existing entries use) — the underlying deletion work
   itself is exactly the kind of literal AC1–AC4 delivery those existing entries show, but the
   process detour is the more useful thing to keep, and that already lives in this decision doc.

## Why

Decision 2 exists because this is a distinct failure mode from `gate-trigger-vs-intent-mismatch`
(which the agent *did* apply correctly mid-thread, asking rather than guessing once the mismatch
surfaced). That skill fires only after an ambiguous trigger is already in front of the agent; it
doesn't prevent the ambiguity from being created in the first place. The gap here is upstream, at
step 3's plan-time: a pure-deletion issue shape should trigger a proactive waiver proposal before
any `@claude approved` reply can be misread, the same way CLAUDE.md's step 3 already allows for
"too complex to test in isolation" — cleanup-with-no-new-logic is a second, equally valid category
for that same carve-out, and it wasn't being checked for.

## Impact

- No further app/test/config changes — #588 already delivered AC1–AC4 and is merged to `develop`.
- This close-step PR adds only: this decision doc, one `ai-review-evals/` entry, and one new
  knowledge asset draft under `docs/knowledge-asset/published/` (write-guard workaround — a human
  still needs to copy it into `.claude/skills/propose-test-pr-waiver-for-pure-cleanup-issues/SKILL.md`
  if kept).
- `data/case-studies.json` left unchanged (see decision 5).
