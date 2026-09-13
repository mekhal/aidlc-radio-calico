# The AI-DLC Loop

AI-DLC (AI-assisted Development Life Cycle) is a 7-step loop for producing
production-grade work with an AI coding agent, with a **human gate at every odd
step**. It is technology-agnostic — nothing here assumes a particular language,
framework, or hosting stack.

## Core principles

- **Human decides, always.** The agent proposes; a human decides at every gate.
  The agent never decides on the human's behalf.
- **TDD.** Write a failing test first, then the code that makes it pass — unless
  the Test PR is explicitly waived at step 3 (see below).
- **Test the Acceptance Criteria only.** Tests cover the AC and nothing more. If
  tests would exceed the AC, the agent stops and raises it rather than adding them.
- **Reuse-first.** Write reusable code and cover the reusable pieces with unit tests.
- **Review-sized PRs.** If a diff is too large to review, split it into multiple
  tickets before opening the PR.
- **Capture the decision.** Every human decision is recorded so the agent improves
  next round (see [Skill Capture](../../templates/skill-template.md)).
- **Production-grade.** Every Code PR must pass the Definition of Done before a
  human merges it.
- **Close the current issue.** Missed functionality becomes a *new* issue — never
  drag it into the current loop.

## The 7 steps

1. A human opens an issue (Story / Improvement / Task) using the templates in
   `.github/ISSUE_TEMPLATE/`.
2. The agent gathers context using the [5 questions](#the-5-questions-step-2-context-discovery),
   then posts a **plan + explicit Acceptance Criteria**. It does not write code or
   tests at this step.
3. A human reviews/approves the plan and specifies the tests — **or explicitly
   waives the Test PR** (step 4) and sends the agent straight to the Code PR (step
   6). The agent may *propose* the waiver (e.g. when the change is pure
   documentation/config with nothing meaningful to unit-test), but only the
   human's explicit answer at this gate makes the skip final. If there is any
   doubt, the agent asks before the human approves — it never assumes.
4. The agent writes **failing tests for the AC only** and opens a **Test PR**.
   Tests target the AC, nothing more. (Skipped if waived at step 3.)
5. A human approves the Test PR.
6. The agent writes code per the plan (reuse-first) and opens a separate **Code
   PR**.
7. A human reviews and merges into the trunk/integration branch.

Test PR and Code PR are always **separate PRs**, unless the human explicitly
waived the Test PR at step 3.

## The 5 questions (step 2 context discovery)

Before producing the plan, the agent gathers context and asks the human using
this frame to sharpen the Acceptance Criteria:

| # | Question | Seeks |
|---|---|---|
| 2.1 | **What's known?** | Facts/constraints already known for certain |
| 2.2 | **What if?** | Scenarios / edge cases that could arise |
| 2.3 | **Now what?** | The next step that should be taken |
| 2.4 | **So what?** | The impact/importance of each option |
| 2.5 | **What's unsaid?** | What hasn't been said / hidden assumptions |

See [`templates/acceptance-criteria.md`](../../templates/acceptance-criteria.md)
for an AC template built around this frame.

## The gate (how a human drives each turn)

A human drives every turn by posting a command. A minimal three-command set
covers the loop:

| Command | What the agent does |
|---|---|
| `approved` | Sync with the trunk/integration branch first (unconditional, every turn), then advance to the next step of the loop (plan → Test PR at step 4, or Test PR → Code PR at step 6). The agent never merges or approves on its own. |
| `review` | Answer the human's questions / adjust the plan. Discuss only — no code, no PR. |
| `close` | Summarize the issue for skill creation: record decisions, log one evaluation entry (see [`evaluation-template.md`](../../templates/evaluation-template.md)), and list new-skill candidates for the human to accept/reject. Does not close the issue itself — a human does that. |

Adapt the exact trigger syntax (`@ai-agent`, a slash command, a label, etc.) to
whatever tool executes the loop; the three-way split (approve / discuss / close)
is what matters, not the literal string.

## Reviewer role: human or AI

"Reviewer" at any gate does not have to be a human. An AI reviewer (a second
agent, or the same agent in a review pass) may fill the role, as long as the
**review policy** below is followed and every decision stays traceable to who
(human or which AI) made it.

## Review policy: default vs. exception-based

- **Default (out of the box): Human Review Everything.** Every odd step gate is
  a human decision. This is the safe starting point for a project with no track
  record yet.
- **Upgrade path (opt-in): exception-based review.** Once enough evaluations
  accumulate (see [AI Review Evaluations](#ai-review-evaluations) below) showing
  a class of decision is consistently high-fidelity, a project may graduate that
  class from "review every time" to "escalate only when the agent is uncertain,
  hits a conflict, or explicitly asks for a decision." This is a per-project,
  evidence-based decision — not a default — and should be recorded as a decision
  record (see [`decision-record.md`](../../templates/decision-record.md)) when
  adopted.

Whichever policy is active, **traceability is non-negotiable**: every decision
must be attributable after the fact to who or what made it and why.

## Definition of Done (every Code PR)

A Code PR is not done until all of these hold:

- **Security:** passes a security scan (dependency, secret, SAST); no secrets in
  the repo; least-privilege permissions.
- **Quality:** all AC tests pass (TDD); lint/format clean; code is reusable and
  covered by tests. If the Test PR was waived at step 3, the Code PR must still
  demonstrate the AC is met by whatever means the human agreed to (e.g. tests
  bundled into the Code PR, or documented manual verification).
- **Reviewability:** PR is a reasonable size; split into tickets when needed;
  description links to the AC.
- **Traceability:** the PR references the related issue and AC.

## Branching

- **feature branch** — where the Test PR / Code PR for each loop is opened. Sync
  it against the trunk/integration branch as the first action of every
  `approved` turn, and before editing anything more generally.
- **integration branch** (e.g. `develop`) — the destination of each completed
  loop; a human merges the PR here, never the agent.
- **release branch** (e.g. `main`) — promoting the integration branch to release
  is a human-only, org-level action. The agent never opens or merges a PR into it.

## AI Review Evaluations

See [`evaluation-template.md`](../../templates/evaluation-template.md) and its
companion process notes. Every `close` records one new evaluation entry: the
agent fills in the factual fields (task, request, decision, decision type) and
always leaves the fidelity/satisfaction scores blank for a human to fill in —
the agent never grades its own work.

## Skill Capture

See [`skill-template.md`](../../templates/skill-template.md). Skills turn a
human's decision into reusable guidance so the agent doesn't need to be told the
same thing twice.

## Ask when in doubt

Before a human approves at any gate, if the agent has any doubt about what was
asked, it asks first — it does not assume. This extends beyond gate approvals:
if the agent is tempted to add something beyond what was literally requested (an
unrequested fallback, a defensive edge case, a "nice to have" convention change),
it stops and reviews that with the human before implementing it, rather than
implementing first and finding out afterward whether it was wanted.
