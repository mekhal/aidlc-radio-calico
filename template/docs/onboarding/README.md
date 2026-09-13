# Onboarding: adopting this template

This is a **process template** — it packages the AI-DLC workflow (human gates,
issue/PR templates, decision and evaluation records) so it can be copied into a
new or existing repository. It intentionally does not scaffold any application
code, language, or framework.

## Adopt into a new or existing repository

1. Copy the whole `template/` tree's contents into the root of the target
   repository (i.e. `template/.github/` → `.github/`, `template/docs/` →
   `docs/`, `template/templates/` → `templates/`).
2. Fill in `templates/CLAUDE.md`'s placeholders:
   - `<your-trigger>` — the tag/command your agent tooling watches for.
   - `<integration-branch>` / `<release-branch>` — your branch names (e.g.
     `develop` / `main`).
   - `<release-owner-role>` — who owns production releases.
   - `<evaluations-dir>` — where evaluation entries live (e.g. `ai-review-evals/`).
   - The **Tech stack** and **Commands** sections — these are deliberately left
     blank; a generic template that guesses at your stack is worse than an
     honest blank to fill in.
3. Rename/move `templates/CLAUDE.md` to the repo root as `CLAUDE.md`.
4. Create the skills directory your agent tooling expects (e.g. `.claude/skills/`)
   and decide where `docs/decisions/` and the evaluations directory live (the
   defaults above assume they sit at the repo root).
5. Wire up `.github/workflows/ci-example.yml` to your actual lint/test/security
   tooling, or replace it with your existing CI if one already exists.
6. Confirm the gate commands in `docs/ai-dlc/README.md` and `CLAUDE.md` match
   whatever your agent tooling actually listens for.

## What you get

- `.github/ISSUE_TEMPLATE/` — Story / Improvement / Task issue forms.
- `.github/PULL_REQUEST_TEMPLATE.md` — Test PR / Code PR checklist.
- `.github/workflows/ci-example.yml` — a skeleton CI workflow to adapt.
- `docs/ai-dlc/README.md` — the full loop, gate table, and Definition of Done.
- `docs/decisions/`, `docs/architecture/` — empty folders with README
  conventions, ready to receive project-specific content.
- `templates/CLAUDE.md` — the agent's operating instructions, to fill in and
  move to the repo root.
- `templates/acceptance-criteria.md`, `decision-record.md`, `skill-template.md`,
  `evaluation-template.md` — the four recurring document shapes the loop
  produces.

## What is deliberately not included

- Any application code, language, or framework choice.
- A choice of AI agent/tool (Claude Code, or otherwise) — the loop and gate
  model are written tool-agnostically; wire up whichever tool you use to honor
  the same three-command gate (`approved` / `review` / `close`).
- A license file — choosing a license is a decision for the adopting project's
  owner, not something this template should decide on your behalf.
