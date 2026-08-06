# Decision: New README section 10 "Knowledge-Governed Autonomy (Human-in-the-Loop)"

**Issue:** [#288](https://github.com/mekhal/aidlc-radio-calico/issues/288)
**Decided by:** @mekhal, 2026-08-05 / 2026-08-06

## Decision

1. **Placement — Option B, not a replacement.** A new conceptual section is inserted *before* the
   existing "Production-grade Standards" section rather than replacing it or being appended into
   section 1 ("What is this?"). Final flow: `9. The Radio Calico Project` → `10. Knowledge-Governed
   Autonomy (Human-in-the-Loop)` → `11. Production-grade Standards` → `12. Quality & Safety Gates`
   → `13. References & Acknowledgements`.
2. **Content.** The 80/20 autonomous-execution principle from the issue body, verbatim, plus a
   paragraph tying it to the existing Quality & Safety Gates / Traceability guarantees, plus a
   confidence-routing table (High confidence → Auto-execute, Medium/Low → Human review, Fail/Policy
   risk → Escalate) that the agent added to make the 80/20 split concrete — not explicitly requested
   in the issue text, called out here as an added-value decision rather than silently introduced.
3. **Renumbering.** Old sections 10–12 become 11–13 in both `README.md` and `README.th.md`,
   including the internal cross-reference at old `README.md:281` ("back the four gates in Section 10
   above" → "Section 11") and all markdown anchors.
4. **Thai title:** `10. Autonomy ที่ควบคุมด้วยความรู้ (Human-in-the-Loop)` — keeps the English term
   with a Thai gloss, matching the doc's existing pattern (e.g. section 6).
5. **Test PR waived** for this issue — README-only content/doc change with nothing to unit-test, per
   the human's explicit approval at the `@claude approved` gate.
6. **Image embedding — sandbox limitation and workaround.** The agent could not embed the
   "Transition Flow" infographic from the issue/comment attachments directly: those images live at
   temp paths (`/tmp/github-images/...`) outside the repo working directory, and both fetching them
   over the network (`curl`/`WebFetch`) and copying them cross-directory (`cp`/`cat` from `/tmp`)
   were blocked by the sandbox's file-access boundary. The human resolved this by committing the
   image files directly to `images/` on `develop` (`knowledge_growth_over_time.png`,
   `ai-autonomy-goal.jfif`, `knowledge-governed-autonomy.jfif`); the agent then referenced
   `images/knowledge-governed-autonomy.jfif` with a normal `<img>` tag, matching the existing
   `code-pr-gates.png` `<div align="center"><img ... width="900" /></div>` convention.
7. **Branch housekeeping.** An intermediate branch (`claude/issue-288-20260806-0531`) was created
   for the initial text-only version of this change but never got a PR opened before the next
   `@claude` trigger landed on the issue (spawning a fresh branch, `claude/issue-288-20260806-0559`,
   per the harness's issue-vs-PR branching rule). Per reuse-first, the agent cherry-picked the prior
   branch's commit onto the new branch instead of re-writing the content. The human subsequently
   opened and closed PR [#291](https://github.com/mekhal/aidlc-radio-calico/pull/291) for the
   now-redundant branch, so no orphaned close-step-branch gap (issue #135's pattern) resulted.

## Why

The topic mismatch flagged at the first `@claude review` turn (issue's 80/20-autonomy text didn't
match the existing section 10 "Production-grade Standards" topic) required explicit human
disambiguation before a plan was possible — resolved as "new section, not a replacement," because
"Production-grade Standards" serves a different purpose (the Code PR quality gates) than the
autonomy-over-time narrative the human wanted to add.

The image-embedding blocker is a sandbox/tooling constraint, not a judgment call: the agent has no
path to move a file from an attachment's temp location into the repo without either network access
or cross-directory file operations, both of which are denied by design in this environment. Having
the human commit the asset directly to a repo branch is the only available workaround, and is worth
recording so a future issue with the same need doesn't re-discover it from scratch (see this issue's
close-step skill proposal for the reusable form of this workaround).

## Impact

- `README.md`, `README.th.md`: new section 10 (renumbered flow 9/10/11/12/13), image embed — Code
  PR [#290](https://github.com/mekhal/aidlc-radio-calico/pull/290) (merged into `develop`
  2026-08-06), superseding the now-closed duplicate PR
  [#291](https://github.com/mekhal/aidlc-radio-calico/pull/291).
- `images/knowledge-governed-autonomy.jfif` (plus two sibling image files not currently referenced
  from the README: `images/knowledge_growth_over_time.png`, `images/ai-autonomy-goal.jfif`):
  committed directly to `develop` by the human.
- `develop` → `main`: merged via PR [#292](https://github.com/mekhal/aidlc-radio-calico/pull/292)
  (human/MGT action, outside this issue's loop).
