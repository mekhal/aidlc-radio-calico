# Decision: `shared-extraction-call-site-audit` skill is stored in `docs/knowledge-asset/published/` only

**Issue:** [#253](https://github.com/mekhal/aidlc-radio-calico/issues/253)
**Decided by:** @mekhal, 2026-08-03

## Decision

The `shared-extraction-call-site-audit` skill candidate (surfaced at issue #253's close, see
`docs/decisions/2026-08-02-issue-253-shared-extraction-ac-and-test-scope.md`) is kept **only** at
`docs/knowledge-asset/published/shared-extraction-call-site-audit.md`. Unlike the closing turn's
default offer ("I'd write it to `docs/knowledge-asset/published/` for you to copy into
`.claude/skills/<kebab-name>/SKILL.md`"), the human explicitly declined the copy step this time:
> เก็บไว้ที่ knowledge-asset/published/ เท่านั้น เพราะ โฟลเดอร์นี้ถูกใช้งานจริง
> ("Keep it only at knowledge-asset/published/, because this folder is actually used [in
> practice].")

No further action (by a human or the agent) is needed to make this skill effective — it does not
sit in `.claude/skills/` and is not expected to move there.

## Why

This isn't a new rule — it's the human confirming, for this specific skill, the policy `CLAUDE.md`
already states in its "Using a skill" section: files under `docs/knowledge-asset/published/` are
"already approved and ready to use, not drafts awaiting a decision," and the only reason a skill
candidate isn't physically inside `.claude/skills/` is the write-guard's mechanical copy step (a
technical restriction — the agent cannot write under any `.claude/` path — not a pending human
approval). Prior close-comments still routinely *offered* the `.claude/skills/` copy as if it were
an open follow-up; this decision confirms that offer is optional per skill, not a required next
step, and that leaving a skill in `published/` is a complete, terminal state on its own.

## Impact

- `docs/knowledge-asset/published/shared-extraction-call-site-audit.md` — the skill's permanent
  home; no pending copy into `.claude/skills/` is expected or requested.
- Future close-comments should not treat "copy into `.claude/skills/`" as a default/implied next
  step for skill candidates already living in `published/` — per-skill, a human may still choose to
  promote one into `.claude/skills/` later, but the agent should not present it as an outstanding
  task by default.
- Docs-only change — no `src/`/`tests/` impact.
