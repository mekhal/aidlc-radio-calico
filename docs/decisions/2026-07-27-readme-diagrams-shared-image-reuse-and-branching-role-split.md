# Decision: README diagrams (issue #189) — shared image across 3 sections, and Branching role split synced into CLAUDE.md

**Issue decided on:** [#189](https://github.com/mekhal/aidlc-radio-calico/issues/189)
**PR:** [#190](https://github.com/mekhal/aidlc-radio-calico/pull/190) (merged 2026-07-27)
**Decided by:** @mekhal, 2026-07-27T00:36

## Decision

Four README sections (§4 AI-DLC Loop, §7 Skill Capture & Reuse, §8 Repository Structure →
Branching, §10 Production-grade Standards) were requested to each get a distinct uploaded image.
On inspection, only 2 visually distinct diagrams existed across all uploads: a "Branching
Overview" diagram (→ §8, clean match) and a 4-gate "Code PR Gates" diagram (Security / Quality /
Reviewability / Traceability → Human Merge) that was uploaded three separate times with only an
in-image step-number label differing ("Step 6" vs "Step 7"). Claude flagged this mismatch before
implementing (see the issue's review comments) rather than guessing a section assignment.

The human's resolution, given explicitly across two `@claude review` comments:

1. **§10** uses the gates diagram as originally intended (it already matches §10's existing
   Security/Quality/Reviewability/Traceability table).
2. **§7** reuses the *same* gates diagram, reframed textually around "Quality & Safety Gates for
   Skill Reuse" — explicitly stating that a Test-PR waiver (not every loop needs unit tests) does
   **not** exempt a skill from lint + security scan before reuse.
3. **§4** also reuses the same gates diagram (the newest upload), replacing the previous
   `aidlc-loop.png`, with text tying it to step 6 of the loop.
4. Additionally (added in the final approval comment, beyond the original image-swap ask):
   **sync `CLAUDE.md`'s own Branching section** to the same Developer/Tester-rebases-into-`develop`
   + MGT-releases-`develop`-to-`main` role split being written into the README, so the operating
   doc and the human-facing doc don't drift apart.

Net effect: three README sections (§4, §7, §10) now display the same picture with different
framing text, by explicit human choice, after Claude surfaced that they were duplicates rather
than silently assigning them. The old `aidlc-loop.png` and `skill-capture-reuse.png` files were
removed as no longer referenced.

## Why

Per `CLAUDE.md`'s "ask when in doubt" rule — the four uploads didn't match the four requested
slots 1:1, and guessing which diagram belonged where risked over-implementing (picking wrong and
writing text to justify it). The human, once shown the actual image content, decided the
duplication was acceptable rather than sourcing new distinct diagrams, since the gates diagram is
genuinely relevant to all three sections (loop step 6, skill reuse gating, and PR standards).

The CLAUDE.md sync (point 4) was an explicit human ask in the same turn as the AC-4 approval, not
an agent-initiated scope addition — it keeps `CLAUDE.md` (operating source of truth) and
`README.md`/`README.th.md` (human-facing mirror) in sync per the repo's existing
"Source of truth & keeping docs in sync" rule.

## Impact

- `README.md` / `README.th.md`: §4, §7, §8, §10 all updated in parity (Thai canonical, English
  mirrors); `branching-overview.png`, `code-pr-gates.png`, `aidlc-loop-gates.jpg`,
  `skill-reuse-gates.jpg` added; `aidlc-loop.png` / `skill-capture-reuse.png` removed.
- `CLAUDE.md`'s Branching section reworded to the same Developer/Tester + MGT role split.
- Test PR waived for this loop (documentation/image-only change, nothing testable by the
  vanilla-JS `tests/test-runner.html` runner) — confirmed by the human at the plan-approval step.
- No new architectural or code precedent set; purely a documentation-content and asset decision.
