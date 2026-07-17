# Knowledge Asset (skill drafts)

Scratch drafts of skill candidates, staged here per `CLAUDE.md`'s write-guard workaround before a
human copies them into `.claude/skills/<kebab-name>/SKILL.md`. Renamed from `docs/agent-skills/`
— see `docs/decisions/2026-07-17-knowledge-asset-published-deprecated-split.md`.

- **`published/`** — drafts that are still active: usable candidates, or newly proposed ones.
  Check this folder before starting work, per `CLAUDE.md`'s "Using a skill".
- **`deprecated/`** — drafts that are old or superseded and no longer applied. Kept for history,
  not read for guidance.

When a draft becomes outdated, move its file from `published/` to `deprecated/`. This folder sits
outside `.claude/`, so the agent can do that move directly — no write-guard applies here (only the
final promotion into `.claude/skills/` needs a human).
