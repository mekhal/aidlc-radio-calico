# Decision: Mandatory `published/` skill usage with audit trail, unconditional `origin/develop` sync check, and a one-off waiver of the `ai-review-evals` close step

**Issue:** [#248](https://github.com/mekhal/aidlc-radio-calico/issues/248)
**Decided by:** @mekhal, 2026-08-01 / 2026-08-02

## Decision

1. **`docs/knowledge-asset/published/` consultation is now mandatory, not optional**, in `CLAUDE.md`'s "Using a skill" section — files there are already approved guidance, not drafts awaiting promotion. Every agent turn's comment must now include a one-line audit trail stating which `published/` file(s) were consulted/applied, or "none applicable this turn."
2. **The `origin/develop` sync check is now unconditional and automatic** as the first action of every `@claude approved` turn (Hard rules) — the agent no longer has discretion to skip it based on an assumption the branch "looks fine." The existing safety carve-out (never force-reset a branch that already has its own pushed commits, e.g. follow-up work on an open PR) is explicitly preserved.
3. **One-off waiver of the `ai-review-evals` entry for this issue's close:** the human's close-trigger comment on #248 explicitly said "ไม่ต้องเก็บคะแนนประเมินใน issue นี้" (no need to keep an evaluation record for this issue). Per `CLAUDE.md`'s "Human decides, always" principle, the agent honored this and did **not** create an `ai-review-evals/` entry for this close event — this is a deviation from the otherwise-mandatory "every `@claude close` records one new file in `ai-review-evals/`" practice (see `docs/decisions/2026-07-20-ai-review-evaluation-framework-promoted-to-mandatory.md`), scoped to this issue only. The underlying mandatory practice is unchanged for future closes unless a human waives it again explicitly.

## Why

Sub-asks 1–2 came from a human observation (via #209's thread) that `docs/knowledge-asset/published/` guidance existed in `CLAUDE.md` but wasn't being visibly, consistently applied, and that the existing `origin/develop` sync check (added for issue #106) left too much room for the agent to judge "looks fine" and skip it. Both were tightened to remove agent discretion while explicitly preserving the safety carve-out the original issue #106 rule was written for (never force-reset a branch with real pushed history).

Item 3 is a direct, explicit human instruction given at the close gate itself — not an agent assumption — so it was followed per "Human decides, always." It is recorded here (rather than silently skipped) so the deviation from standard practice is traceable, consistent with why this framework exists in the first place (see `ai-review-evals/README.md`).

## Impact

- `CLAUDE.md`, `README.md`, `README.th.md`: edited in PR [#249](https://github.com/mekhal/aidlc-radio-calico/pull/249) (merged into `develop` 2026-08-02) — "Using a skill" section, Hard rules `origin/develop` sync bullet, `@claude approved` gate-table row, Branching section.
- `ai-review-evals/`: **no new file added for this close**, per the explicit waiver above — a deliberate exception, not an oversight.
- Still outstanding, flagged but not resolved: `.claude/skills/pr-followup-on-pr-not-issue.md` remains a stray loose file (not wrapped in `<kebab-name>/SKILL.md` folder form) duplicating the correct draft at `docs/knowledge-asset/published/pr-followup-on-pr-not-issue.md`. Per the write-guard (agent writes under any `.claude/` path are blocked), this still needs a human to either delete the stray file or move it into proper folder form.
- Docs-only change — no `src/`/`tests/` impact.
