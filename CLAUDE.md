# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

This is a **process demo**, not an application. The deliverable is the *workflow* — proving a human + the Claude GitHub agent can produce production-grade work end-to-end on GitHub. Do not treat requests as "build the Radio Calico app locally"; treat them as steps in the AI-DLC loop. There is no product source code yet — `src/` and `tests/` are created only when the first loop begins.

The full process is defined in `README.md` (Thai, canonical) and `README.en.md` (English). Read the README before acting on any issue.

## The AI-DLC loop (how work must proceed)

Work is driven by GitHub issues tagged `@claude`, through a 7-step loop with a **human gate at every odd step**. When operating as the `@claude` agent, follow this order strictly and stop at each gate — never skip ahead:

1. Human opens an issue (Story / Improvement / Task).
2. AI spawns a **sub-agent** to gather context using the 5 questions (What's known / What if / Now what / So what / What's unsaid), then posts a **plan + explicit Acceptance Criteria**. Do not write code or tests here.
3. Human reviews/approves the plan and specifies the tests — **or tells the agent to skip the Test PR** (step 4) and go straight to the Code PR (step 6). The agent may also propose skipping it, when the step is too complex to test in isolation, genuinely hard to test, or needs a build/scaffold to exist before anything is testable — but only the human's explicit answer at this gate makes the skip final; the agent must never decide this unilaterally. **If you have any doubt, ask the human before they approve** — do not assume.
4. AI writes **failing tests for the AC only** → opens a **Test PR**. Tests target AC, nothing more. (Skipped if waived at step 3.)
5. Human approves the Test PR.
6. AI writes code per the plan (reuse-first) → opens a separate **Code PR**.
7. Human reviews and merges into `develop`.

## The @claude gate (how humans drive each turn)

A human drives every turn by posting a command comment. **End every answer you post in an issue or PR by appending the gate block below** (as a comment), so the human can copy the command they want, paste it as a new comment, add any detail, and submit it themselves. The **only exception**: do NOT append the gate block after handling `@claude close`.

The gate block to append verbatim (each command is its own code block so GitHub shows a copy button):

`````markdown
---
### 👉 ขั้นถัดไป — คัดลอกคำสั่งที่ต้องการ วางเป็นคอมเมนต์ใหม่ (เติมรายละเอียดต่อได้)

**✅ อนุมัติ — เดินหน้า step ถัดไปของ loop**
```
@claude approved
```
**🔍 รีวิว — มีคำถาม/ขอปรับ (ยังไม่อนุมัติ ไม่เขียนโค้ด)**
```
@claude review
```
**🏁 ปิดงาน — สรุปการตัดสินใจ + เสนอ skill ชิ้นถัดไป**
```
@claude close
```
---
`````

### Comment format: lead with a TL;DR

Per @mekhal's decision at issue #254's close (see `docs/decisions/2026-08-03-issue-254-tldr-comment-format.md`), every substantive comment (plan, review, Test PR / Code PR summary, close) leads with a short TL;DR before any other detail:

1. **Done** — สิ่งที่ทำเสร็จแล้ว (what's already done)
2. **Scope** — สิ่งที่จะทำต่อใน PR นี้ (what happens next / what this PR covers)
3. **Action Required** — สิ่งที่ต้องการให้คนตัดสินใจ (the decision needed from the human)

Do not lead with or dwell on internal process detail (which gate/skill/rule was applied, audit-trail bookkeeping) — that belongs in the commit history and `docs/decisions/`/`ai-review-evals/` files, not the human-facing summary. If a published skill materially shaped the output, a single short mention is fine, but it must not crowd out the TL;DR.

### What each command means

| Command | What you do | Append gate block after? |
|---|---|---|
| `@claude approved` | First, automatically run the `origin/develop` sync check (see Hard rules) as the turn's first action — unconditional, never skipped based on an assumption that the branch "looks fine". Then advance to the next step of the AI-DLC loop (plan → Test PR at step 4, or Test PR → Code PR at step 6). **Never merge or approve on your own.** | Yes |
| `@claude review` | Answer the human's questions / adjust the plan. **Discuss only — do not write code and do not open a PR.** Then append the gate block again. | Yes |
| `@claude close` | Used **only to summarize the issue for skill creation**: record the decisions made in this work under `docs/decisions/`, log one new entry in `ai-review-evals/` for this close event (see "AI review evaluations"), then list any new-skill candidates surfaced by this issue's own work and ask the human whether to add/update/skip (see "Adding a skill"). **Before the close comment is done, actually open a PR (`gh pr create --base develop`) for the close-step branch carrying those files** — a posted compare link alone is not enough; without an opened PR the decision doc/eval entry can stay stranded on the branch and never reach `develop` (see issue #135). **Do NOT close the issue yourself — the human closes the issue manually.** | No |
| Any other trigger (opening a task / first question) | Follow the AI-DLC loop: at step 2, spawn a sub-agent to ask the 5 questions, then post **plan + Acceptance Criteria only** — do not write code or tests. | Yes |

## Hard rules (do not violate)

- **Never merge or approve on your own.** Every merge/approval is a human action.
- **Test PR and Code PR are separate PRs** (steps 4 and 6). Never combine them, unless the human explicitly waives the Test PR at step 3 (see step 3 above) — the agent may propose the waiver but never decide it unilaterally.
- **Split large work into multiple tickets** in steps 4 and 6 so a human can actually review each PR. Reviewability is a requirement, not a nicety.
- **Reuse-first**, and cover reusable pieces with unit tests.
- **Missed functionality becomes a NEW issue** — never expand scope inside the current loop. Keep the focus on closing the current issue. **Exception:** if the out-of-scope finding belongs to a related ticket that's already sequenced (e.g. Ticket A → B → C under the same parent story), post it as a plain comment on that downstream ticket instead of opening a new issue — **do not tag `@claude`** in that comment; the human tags the agent themselves when they start work on that ticket. See `docs/decisions/2026-07-17-cross-reference-out-of-scope-findings-on-related-tickets.md`.
- On step-7 rework requests, **loop back to step 6** (fix the code) and open a new Code PR; do not reopen the whole loop.
- `develop` → `main` is a **Production Release done by MGT** and is human-only. Never open or merge a PR into `main`.
- **Always explicitly set the PR base branch to `develop`** when opening a Test PR or Code PR (e.g. `gh pr create --base develop`) — never rely on the default base branch, which may be `main`. This also applies to any **manually-posted "Create PR" compare link** in a comment before a PR object exists — use `compare/develop...branch`, never `compare/main...branch`. A `main`-based compare link hides commits that only exist on `main` (e.g. an automated report-publish commit) from the diff preview, so a branch accidentally cut from `main`'s tip (see the issue #106 mitigation below) can look clean right up until a PR is actually opened against the correct base, at which point unrelated commits appear mixed in. See `docs/decisions/2026-07-12-pr-base-branch-must-be-develop.md` and `docs/decisions/2026-07-20-pr-create-links-must-target-develop-check-existing-branches-first.md`.
- **Before re-implementing an already-approved change, check whether a prior branch/PR for the same instruction already exists** (`gh pr list --state all --search "<issue> in:body"`, or branches matching `claude/issue-<N>-*`). If one exists and its diff is still valid against the current `develop` tip, reuse it (e.g. cherry-pick the relevant commit onto a fresh `develop`-based branch) instead of writing the change again from scratch. See `docs/decisions/2026-07-20-pr-create-links-must-target-develop-check-existing-branches-first.md`.
- **Follow-up changes to an already-open PR must be commented on that PR itself, not on the parent issue.** The harness always creates a brand-new branch when triggered from an issue comment, but pushes directly onto the existing branch when triggered from an open PR's comment — commenting on the issue instead spawns a stray duplicate branch. Merging or deleting branches is outside the agent's capability; if duplicate branches ever need consolidating, the human does that merge/delete manually. See `docs/decisions/2026-07-16-pr-followups-on-pr-not-issue.md`.
- **The `origin/develop` sync check is mandatory and automatic — run it as the first action of every `@claude approved` turn (and before making any edits generally), unconditionally, never skipped based on an assumption that the branch "looks fine".** A confirmed, root-cause-unresolved bug (issue #106) sometimes checks a job out at the repo's default branch (`main`) instead of `develop`, even though the workflow's first checkout step specifies `ref: develop`. Always run `git diff HEAD origin/develop --stat` and `git ls-remote origin <branch>` — do not judge from appearances whether this step is needed. **For a brand-new step-4 (Test PR) or step-6 (Code PR) branch that has no pushed remote history yet (`git ls-remote origin <branch>` is empty), always run `git reset --hard origin/develop` unconditionally before editing anything — do not gate the reset on `git diff HEAD origin/develop --stat` showing a content difference.** A locally-continued commit chain from an earlier, already-merged/rebase-squashed issue can carry identical file content while still being ancestrally stale, producing a noisy PR diff later even though the content-diff check showed nothing at the time (issue #305). Content-diff is still the right tool for the *re-verify* step: after resetting, run `git diff origin/develop --stat` again before staging/committing, to confirm only the intended files changed. If the branch already has its own pushed commits (follow-up work on an open PR), do not force-reset — flag the mismatch to the human instead; this carve-out is unconditional and stays in force even though the reset itself is now unconditional for fresh branches. See `docs/decisions/2026-07-17-sync-to-develop-before-work-mitigation.md` and `docs/decisions/2026-08-11-issue-305-branch-hygiene-fresh-cut-from-develop.md`.
- **On any new `@claude` trigger for a thread, check that branches referenced in that thread's earlier turns actually got an opened PR.** Scan prior comments on the issue/PR for branch names or compare links posted before this turn; for each, check `git ls-remote origin <branch>` and `gh pr list --state all --head <branch>`. If a branch exists with no PR ever opened for it (the issue #135 gap — a close-step branch's decision doc + eval entry were pushed but no PR followed), flag it in this turn's comment rather than silently proceeding — do not open a PR for it yourself unless the current turn's own instructions call for one. See `docs/decisions/2026-07-21-verify-close-step-branches-get-a-pr-opened.md`.

## Operating rules (imperative)

These are the README's principles restated as directives you must act on. `README.md` (English) and `README.th.md` (Thai) remain the human-facing explanation; this section is the operating copy. (Thai is canonical.)

### Core principles

- **Human decides, always.** You propose; the human decides at every gate. Never decide on the human's behalf.
- **TDD.** Write a failing test first, then the code that makes it pass.
- **Test the AC only.** Write tests that cover the Acceptance Criteria and nothing more. If tests would exceed the AC, stop and raise it — do not add them.
- **Reuse-first.** Write reusable code and cover the reusable pieces with unit tests.
- **Review-sized PRs.** Before opening a PR, if the diff is too large to review, split it into multiple tickets first.
- **Capture the decision.** Every human decision is recorded so the agent improves next round (see "Skills").
- **Production-grade.** Every Code PR must pass the Definition of Done below before a human merges.
- **Close the current issue.** Missed functionality becomes a NEW issue — never drag it into the current loop, unless a related downstream ticket already exists, in which case comment the finding there instead (untagged — see Hard rules).

### The 5 questions (step 2 context discovery)

Before producing the plan, the sub-agent gathers context and asks the human using this frame to sharpen the AC:

| # | Question | Seeks |
|---|---|---|
| 2.1 | **What's known?** | Facts/constraints already known for certain |
| 2.2 | **What if?** | Scenarios / edge cases that could arise |
| 2.3 | **Now what?** | The next step that should be taken |
| 2.4 | **So what?** | The impact/importance of each option |
| 2.5 | **What's unsaid?** | What hasn't been said / hidden assumptions |

### Definition of Done (every Code PR at step 6)

A Code PR is not done until all of these hold:

- **Security:** passes security scan (dependency, secret, SAST); no secrets in the repo; least-privilege permissions.
- **Quality:** all AC tests pass (TDD); lint/format clean; code is reusable and covered by tests. If the Test PR was waived at step 3, the Code PR must still demonstrate the AC is met by whatever means the human agreed to at step 3 (e.g. tests bundled into the Code PR, or documented manual verification).
- **Reviewability:** PR is a reasonable size; split into tickets when needed; description links to the AC.
- **Traceability:** the PR references the related issue and AC.

### Branching

- **feature branch** — where you open the Test PR / Code PR for each loop. The working tree's sync against `origin/develop` (see Hard rules) is checked automatically and unconditionally as the first action of every `@claude approved` turn, and before editing anything more generally — reset if it doesn't match and the branch has no remote history yet. Once its PR is open, comment on that PR (not the parent issue) for any follow-up changes so commits land on the same branch instead of a new one.
- **`develop`** — the destination of each completed loop; a **Developer or Tester** rebases the feature branch in and merges the PR here — **a human**, never you.
- **`main`** — merging `develop` → `main` is a **Production Release**, done by **MGT** (release owner) — human-only. Never open or merge a PR into `main`.
- Merging/deleting branches (e.g. consolidating two duplicate branches) is a git operation the agent cannot perform — it is a manual, human-only action.

### Ask when in doubt

Before a human approves at any gate, if you have any doubt, **ask the human to clarify first** — do not assume.

This is not limited to gate approvals. If you are not fully sure what an instruction means, or you are tempted to add something beyond what was literally asked (an unrequested accessibility fallback, a defensive edge case, a "nice to have" convention change), **stop and review it with the human before implementing it** — do not implement it first and find out afterward whether it was wanted. Over-implementing ("over requirement") reads as not following instructions even when well-intentioned, and it slows delivery down rather than speeding it up. See `docs/decisions/2026-07-20-review-before-over-implementing.md`.

## Tech stack

Decided under issue #20 (see `docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md`):

- **App code:** HTML + vanilla JavaScript + jQuery. No build step, no bundler. If any React remains, it is limited to bare `ReactDOM`/`React.createElement` with no extra npm packages and no JSX/Babel transform.
- **Dependencies:** CDN `<script>` references only — the app never runs `npm install`. Before adding or changing any CDN `<script>`/`<link>` reference, read `config/cdn-sources.json` first and use its listed primary/fallback order for that library; if a library isn't listed there yet, add an entry as part of the same change rather than hardcoding a one-off URL. See `docs/decisions/2026-07-27-centralized-cdn-config.md`.
- **Data:** `localStorage` is the "database"; there is no backend/server-side store.
- **Tests:** hand-written vanilla JavaScript (no Jest/npm test framework) under `tests/`. If a test needs "the database," mock `localStorage` — only as far as the AC under test requires. Tests run only when `tests/test-runner.html` is opened directly in a browser (never on app load, never via an `npm test` script); `index.html` links to that report page. See `docs/decisions/2026-07-12-testing-framework-vanilla-runner.md` and `tests/README.md`.

## Skills

Skills turn human decisions into reusable capability so the agent improves each round.

### Skill capture flow

1. **Capture** — every time the human decides (chooses an approach, sets a rule, redirects a plan), record it under `docs/decisions/`.
2. **Distill** — recurring/valuable decisions are written up as a skill.
3. **Store** — skills live in **this repo's own `.claude/skills/`** — the source of truth. There is no external skills repo.
4. **Reuse** — the agent invokes these skills in later loops to work better and stay consistent with prior human decisions.

### Store vs runtime

- **Store:** this repo's `.claude/skills/` folder holds the skill files — store and runtime are the same location, so there is no separate checkout/sync step.

### Skill format

One skill = a folder `.claude/skills/<kebab-name>/SKILL.md` with frontmatter:

```markdown
---
name: <kebab-name>
description: <when to use it / what it does — one line>
---

<skill body>
```

### Adding a skill

When you handle `@claude close`:

1. List **only the new-skill candidates surfaced by this issue's own work** — do not review or re-propose changes to pre-existing skills already in `.claude/skills/`; whether to touch those is the human's independent call and never gates closing the issue.
2. For each candidate, draft its `SKILL.md` content (in the format above) and ask the human to decide: add it, update a named existing skill, or skip — the issue can be closed with zero skill changes.

**Write-guard workaround (structural, not a permissions gap):** any file path containing a `.claude/` segment is blocked from agent writes — confirmed empirically (issue #26, issue #43) against this repo's actual `permissions.allow`/`--allowedTools` config, so it cannot be opened by adding an allowlist entry. This is a deliberate Claude Code safety boundary (same category as the `.github/workflows/` restriction), not something to fix later. The workaround: the agent drafts `SKILL.md` content **outside** `.claude/` (inline in the PR/issue body, or a scratch file under `docs/knowledge-asset/published/`), and a **human** creates/commits the file at `.claude/skills/<kebab-name>/SKILL.md`.

### Using a skill

Skills are stored in this repo's own `.claude/skills/` (source of truth). Before starting any piece of work, check the skills available on the runner and invoke the relevant skill first. **Consulting `docs/knowledge-asset/published/` is mandatory, not optional** (see the write-guard workaround above) — files there are already **approved and ready to use**, not drafts awaiting a decision. The only reason a file isn't yet physically inside `.claude/skills/` is the write-guard's mechanical copy step (a human still has to create the `.claude/skills/<kebab-name>/SKILL.md` file), not a pending approval, so published guidance must be read and applied the same as a skill already in `.claude/skills/`. **Audit trail:** every turn's comment must state, in one line, which `docs/knowledge-asset/published/` file(s) were consulted and applied this turn, or say "none applicable this turn" if none were relevant — mirroring the audit-trail style already used for the branch/PR check in Hard rules. Files in `docs/knowledge-asset/deprecated/` are old/superseded — kept for history, not applied. When a published file becomes outdated, move it from `published/` to `deprecated/`; this folder is outside `.claude/`, so the agent can do that move directly.

## AI review evaluations

Introduced as an experimental trial under issue #119, **promoted to standard practice at issue #99's close** (2026-07-20, see `docs/decisions/2026-07-20-ai-review-evaluation-framework-promoted-to-mandatory.md`): every `@claude close` records one new file in `ai-review-evals/` (see `ai-review-evals/README.md` for the full convention — filename pattern, what counts as a "meaningful decision," the taxonomy) using `ai-review-evals/TEMPLATE.md`.

- The agent fills in `Metadata`, `Task`, `Original User Request`, `AI Decision`, and `Decision Type` at close time; `Risk Level` defaults to `Medium`.
- `Instruction Fidelity` and `Result Satisfaction` are always left blank for the human to score afterward — the agent never self-scores, so the framework doesn't grade its own homework. If the human provides these scores directly in the `@claude close` comment, the agent fills them in as given.
- This is the evidence trail behind the "Ask when in doubt" rule above: low scores or review notes recorded here are what justify (or don't yet justify) moving a class of AI decision from Human Review Everything to Human Review Risk.
- **The close-step branch carrying the decision doc + eval entry must get a real PR opened (`gh pr create --base develop`) before the close comment is considered done** — see the `@claude close` row above and `docs/decisions/2026-07-21-verify-close-step-branches-get-a-pr-opened.md`. A branch with these files committed and pushed but no PR opened leaves them stranded and never reaching `develop` (issue #135).

## Case study showcase

Decided under issue #203 (see `docs/decisions/2026-08-11-issue-203-case-study-data-source-and-ticket-breakdown.md`): the Case Study nav tab renders from a hand-curated `data/case-studies.json` (2–3 highlight cards of fully closed loops, not every issue) rather than parsing `ai-review-evals/` at runtime.

- When handling `@claude close`, once `data/case-studies.json` exists, also consider whether this issue's closed loop is a good candidate for that showcase — a clean, illustrative end-to-end example of the AI-DLC loop.
- If it is, propose an entry (or an update to an existing one) and ask the human to confirm before adding it — do not write to `data/case-studies.json` unprompted, same as any other over-implementing risk under "Ask when in doubt."
- Not every closed issue belongs in the showcase; it stays a small, curated set, not a running log.

## Source of truth & keeping docs in sync

**`CLAUDE.md` is the operating source of truth** for the agent's practical rules — read and act on it. `README.md` (English) and `README.th.md` (Thai) are the human-facing explanation and mirror each other section-for-section; **Thai is canonical**. When you change an operating rule in `CLAUDE.md`, sync the change back into both README files so the human docs stay consistent.

## Commands

Scaffold the planned folder structure (`.github/`, `docs/`, `specs/`, `src/`, `tests/`) — run from the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/scaffold.ps1
```

It is idempotent and never overwrites existing files. There is no build, lint, or test tooling yet; add it (with commands documented here) when the first product code lands in step 6.

## Assets

Brand and product references are in `RadioCalicoStyle/`: `RadioCalico_Style_Guide.txt` (colors, typography, components), `stream_URL.txt` (HLS stream), and logo/layout PNGs. Use the style guide's palette and type scale for any Radio Calico UI work.
