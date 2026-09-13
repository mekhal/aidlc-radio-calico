# Skill Capture (template)

A skill turns one human decision into reusable guidance, so the agent doesn't
need to be told the same thing twice. One skill = one file with frontmatter:

```markdown
---
name: <kebab-name>
description: <when to use it / what it does — one line>
---

<skill body>
```

## Writing the body

- Ground it in the specific case that surfaced it (issue/PR number, what
  happened) so a future reader can judge whether it still applies.
- State the rule as a directive ("when X, do Y"), not just a narrative of what
  happened once.
- Keep it to the actual lesson — don't generalize past what the evidence
  supports.

## Where skills live

Store skills in this repo's own skills directory (e.g. `.claude/skills/` or the
equivalent for your agent tooling) — that is the single source of truth, not an
external skills repo.

## A known operational gotcha worth knowing about upfront

Some agent tool configurations block the agent itself from writing directly
into the skills directory (a deliberate safety boundary, not a bug to work
around by loosening permissions). If you hit this: have the agent draft the
`SKILL.md` content in a scratch location outside that directory (e.g. inline in
a PR/issue comment, or a scratch file elsewhere in the repo), and have a human
copy it into place. Don't treat the draft as unapproved just because it isn't
physically in the skills directory yet — the content itself may already be
human-approved; the copy step is a mechanical workaround, not a pending
decision.

## Adding a skill (capture flow)

1. **Capture** — every human decision (approach chosen, rule set, plan
   redirected) is recorded under `docs/decisions/`.
2. **Distill** — recurring/valuable decisions become a skill, drafted in this
   format.
3. **Store** — a human commits the file into the skills directory.
4. **Reuse** — the agent checks and applies relevant skills before starting new
   work.
