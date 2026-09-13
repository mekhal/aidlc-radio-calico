# CLAUDE.md (template)

This file tells an AI coding agent how to operate in this repository. Copy it to
the root of your project and fill in the `<...>` placeholders. It is the
operating source of truth for the agent — keep any human-facing README in sync
with it, but this file is what the agent actually reads and follows.

## What this repo is

<!-- One paragraph: what the project is, and what "done" looks like for it. -->

## The AI-DLC loop (how work must proceed)

Work is driven by issues tagged `<your-trigger>` (e.g. `@ai-agent`), through a
7-step loop with a **human gate at every odd step**. Full detail:
`docs/ai-dlc/README.md`. When operating as the agent, follow this order
strictly and stop at each gate — never skip ahead:

1. A human opens an issue (Story / Improvement / Task).
2. The agent gathers context using the 5 questions (What's known / What if / Now
   what / So what / What's unsaid), then posts a **plan + explicit Acceptance
   Criteria**. No code or tests at this step.
3. A human reviews/approves the plan and specifies the tests — or tells the
   agent to skip the Test PR (step 4) and go straight to the Code PR (step 6).
   The agent may propose the waiver but never decides it unilaterally.
4. The agent writes **failing tests for the AC only** and opens a **Test PR**.
   (Skipped if waived at step 3.)
5. A human approves the Test PR.
6. The agent writes code per the plan (reuse-first) and opens a separate **Code
   PR**.
7. A human reviews and merges into `<integration-branch>`.

## The gate (how humans drive each turn)

| Command | What the agent does |
|---|---|
| `approved` | Sync with `<integration-branch>` first (unconditional, every turn — see Hard rules), then advance to the next loop step. Never merge or approve on its own. |
| `review` | Discuss/adjust the plan only — no code, no PR. |
| `close` | Summarize the issue for skill creation: record decisions under `docs/decisions/`, log one entry in `<evaluations-dir>/`, list new-skill candidates for the human to accept/reject. Does not close the issue itself. |

**Reviewer role:** may be filled by a human or an AI — see
`docs/ai-dlc/README.md#reviewer-role-human-or-ai`.

**Review policy default:** Human Review Everything. See
`docs/ai-dlc/README.md#review-policy-default-vs-exception-based` for the
opt-in, evidence-based upgrade path to exception-based review.

## Hard rules (do not violate)

- **Never merge or approve on your own.** Every merge/approval is a human action.
- **Test PR and Code PR are separate PRs**, unless the human explicitly waives
  the Test PR at step 3.
- **Split large work into multiple tickets** so a human can actually review each
  PR. Reviewability is a requirement, not a nicety.
- **Reuse-first**, and cover reusable pieces with unit tests.
- **Missed functionality becomes a NEW issue** — never expand scope inside the
  current loop.
- On step-7 rework requests, **loop back to step 6** (fix the code) and open a
  new Code PR; do not reopen the whole loop.
- `<integration-branch>` → `<release-branch>` is a **release**, done by
  `<release-owner-role>`, human-only. Never open or merge a PR into
  `<release-branch>`.
- **Always explicitly set the PR base branch to `<integration-branch>`** when
  opening a Test PR or Code PR — never rely on the tool's default base branch.
- **Sync check is mandatory and automatic** — run it as the first action of
  every `approved` turn, and before making any edits generally. For a brand-new
  feature branch with no pushed remote history, reset it to
  `<integration-branch>`'s tip before editing. If the branch already has its own
  pushed commits (follow-up work on an open PR), do not force-reset — flag the
  mismatch to the human instead.

## Operating rules (imperative)

### Core principles

- **Human decides, always.**
- **TDD.** Failing test first, then code.
- **Test the AC only.**
- **Reuse-first.**
- **Review-sized PRs.**
- **Capture the decision** (see Skills below).
- **Production-grade** — every Code PR passes the Definition of Done.
- **Close the current issue** — no scope creep.

### Definition of Done (every Code PR)

- **Security:** passes a security scan (dependency, secret, SAST); no secrets;
  least-privilege permissions.
- **Quality:** all AC tests pass; lint/format clean; reusable code covered by
  tests. If the Test PR was waived, the AC is demonstrated by whatever means the
  human agreed to at step 3.
- **Reviewability:** reasonable PR size; description links to the AC.
- **Traceability:** the PR references the related issue and AC.

### Branching

- **feature branch** — Test PR / Code PR for each loop.
- **`<integration-branch>`** — destination of each completed loop; a human
  merges here, never the agent.
- **`<release-branch>`** — human-only, org-level release action. Never touched
  by the agent.

### Ask when in doubt

If the agent is not fully sure what an instruction means, or is tempted to add
something beyond what was literally asked, it stops and reviews it with the
human before implementing — it does not implement first and find out afterward
whether it was wanted.

## Tech stack

<!-- Fill in: language(s), framework(s), package manager, how dependencies are
managed, how the app is run/built, and any constraints (e.g. no build step,
CDN-only dependencies, etc.). Be explicit — this is the section most templates
get wrong by leaving generic. -->

## Skills

Skills turn a human's decision into reusable capability so the agent improves
each round.

1. **Capture** — every time the human decides (chooses an approach, sets a rule,
   redirects a plan), record it under `docs/decisions/`.
2. **Distill** — recurring/valuable decisions become a skill.
3. **Store** — skills live in this repo's own skills directory (e.g.
   `.claude/skills/` or the equivalent for your agent tooling) — the source of
   truth, no external skills repo.
4. **Reuse** — the agent invokes these skills in later loops.

See `templates/skill-template.md` for the skill file format.

## AI review evaluations

Every `close` records one new file in `<evaluations-dir>/` using
`templates/evaluation-template.md`. The agent fills in the factual fields; the
fidelity/satisfaction scores are always left blank for a human to fill in later.

## Source of truth & keeping docs in sync

`CLAUDE.md` is the operating source of truth for the agent's practical rules.
Any human-facing README should mirror it — when an operating rule changes here,
sync the change into the README too.

## Commands

<!-- Fill in: how to run tests, lint, build, and start the app locally. -->
