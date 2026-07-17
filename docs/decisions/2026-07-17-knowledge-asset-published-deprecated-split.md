# Decision: Skill-draft staging folder renamed to `docs/knowledge-asset/`, split into `published/` / `deprecated/`

**Issue:** [#98](https://github.com/mekhal/aidlc-radio-calico/issues/98) (Ticket A, #99, Code PR [#102](https://github.com/mekhal/aidlc-radio-calico/pull/102))
**Decided by:** @mekhal, 2026-07-17

## Decision

The scratch-draft staging folder for skill candidates (previously `docs/agent-skills/`, itself
renamed from `docs/skill-drafts/` per the 2026-07-15 decision) is renamed to `docs/knowledge-asset/`
and split into two subfolders:

- `docs/knowledge-asset/published/` — drafts still in use, or newly added candidates. This is what
  `CLAUDE.md`'s "Using a skill" step checks before starting work.
- `docs/knowledge-asset/deprecated/` — drafts that are old or superseded. Kept for history, not
  read for guidance.

All three pre-existing drafts (`code-pr-implements-test-pr-contract.md`,
`cross-reference-out-of-scope-findings-on-related-tickets.md`,
`test-pr-native-api-and-self-ref-checklist.md`) moved into `published/` — none had been marked
outdated, so none qualified for `deprecated/` yet.

Moving a draft from `published/` to `deprecated/` is a plain file move the agent can do directly:
this folder sits outside `.claude/`, so the write-guard workaround (which only blocks writes
*inside* `.claude/`) does not apply here.

## Why

Requested by the human while reviewing PR #102, to make draft status (still-relevant vs.
outdated) visible in the folder structure itself instead of implicitly, so a stale draft's
guidance doesn't get silently re-applied.

## Impact

- `docs/agent-skills/*.md` → `docs/knowledge-asset/published/*.md` (git mv, history preserved).
- `docs/knowledge-asset/README.md` documents the two subfolders.
- `docs/knowledge-asset/deprecated/.gitkeep` keeps the empty folder tracked in git.
- `CLAUDE.md`'s "Adding a skill" (write-guard workaround) and "Using a skill" sections updated to
  reference `docs/knowledge-asset/published/` and `deprecated/`.
- `README.md` / `README.th.md` Skill Capture & Reuse sections synced with the same note.
