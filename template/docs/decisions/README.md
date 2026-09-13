# Decision Records

Every human decision made during an AI-DLC loop (an approach chosen, a rule set,
a plan redirected, a waiver granted) gets recorded here as it happens — not
retroactively. Use [`templates/decision-record.md`](../../templates/decision-record.md).

## Filename convention

```
YYYY-MM-DD-<short-title>.md
```

Example

```
2026-07-12-tech-stack-choice.md
```

## Why this exists

This is the raw material for skill capture: recurring or high-value decisions
recorded here get distilled into a skill (see
[`templates/skill-template.md`](../../templates/skill-template.md)) so the agent
doesn't need the same instruction twice. It is also the audit trail behind any
move from Human Review Everything to exception-based review — see
`../ai-dlc/README.md#review-policy-default-vs-exception-based`.
