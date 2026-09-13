# AI-DLC Project Template

A reusable **process template** for AI-assisted software development: the
AI-DLC workflow, its human-in-the-loop gates, and the recurring artifacts it
produces (issue/PR templates, decision records, skill captures, review
evaluations). It contains no application code and no technology-specific
implementation detail — it is meant to be copied into a new or existing
repository regardless of language or stack.

## Start here

- [`docs/onboarding/README.md`](docs/onboarding/README.md) — how to adopt this
  template into your repository.
- [`docs/ai-dlc/README.md`](docs/ai-dlc/README.md) — the full 7-step loop, gate
  model, review policy, and Definition of Done.
- [`templates/CLAUDE.md`](templates/CLAUDE.md) — the agent-facing operating
  instructions to fill in and place at your repo's root.

## Layout

```
template/
├── .github/
│   ├── ISSUE_TEMPLATE/        Story / Improvement / Task issue forms
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       └── ci-example.yml     Skeleton CI (lint / test / security scan)
├── docs/
│   ├── ai-dlc/README.md       The loop, gates, review policy, Definition of Done
│   ├── architecture/README.md Convention for recording architecture references
│   ├── decisions/README.md    Convention for recording human decisions (ADRs)
│   └── onboarding/README.md   Step-by-step adoption guide
├── templates/
│   ├── CLAUDE.md               Agent operating instructions (fill in placeholders)
│   ├── acceptance-criteria.md  Step-2 plan + AC template (5-questions frame)
│   ├── decision-record.md      ADR template
│   ├── skill-template.md       Skill Capture template
│   └── evaluation-template.md  AI Review Evaluation template
└── README.md                   This file
```

## Design goals

- **Human-in-the-loop by default.** The review policy defaults to Human Review
  Everything; exception-based review is an explicit, evidence-based opt-in — see
  `docs/ai-dlc/README.md`.
- **Reviewer-agnostic.** The Reviewer role can be a human or an AI, as long as
  every decision stays traceable.
- **Tool-agnostic.** The gate model is three commands (`approved` / `review` /
  `close`); wire up whichever agent tooling you use to honor them.
- **Lean.** No repo-bootstrap CLI, no scaffolding automation — this is a
  file-set to copy, not a generator. See "What is deliberately not included" in
  the onboarding guide.

## License

This template does not ship a `LICENSE` file — choosing one is a decision for
whoever adopts the template into their own repository, not something to bake in
here.
