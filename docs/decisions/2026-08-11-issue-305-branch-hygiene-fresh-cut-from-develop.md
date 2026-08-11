# Issue #305 close — branch hygiene and the "refused reset hard develop" recurring friction

## Context

Issue #305 ("เพิ่ม Menu และ Footer ในหน้า parent") was a small, correctly-scoped fix: `tests/test-report-dashboard.js` never called `loadTranslations()`, so the shared Menu/Footer components stayed empty on that page. The fix (PR #307, merged) was exactly the intended 10-line change.

The friction was not about the fix — it was about the branch it shipped on. `claude/issue-305-20260810-1540` was continued directly on top of the raw, unsquashed commit chain for issues #294 and #299, instead of being cut fresh from `origin/develop`'s tip after those issues' PRs had already merged. Because `develop` merges via a rebase/squash style (commit SHAs get rewritten), the branch's own copies of those commits no longer matched `develop`'s tip byte-for-SHA, even though their file contents were identical. Result: PR #307's "Files changed" tab showed `ai-review-evals/`, `docs/decisions/`, `docs/knowledge-asset/`, and `sidebar/*` files as "changed," even though none of them actually differed from `develop`.

@mekhal asked the agent to `reset hard develop` and delete/recreate the branch to get a clean diff. The agent:
- Rebuilt the intended clean history locally (`develop` tip + only the real fix commit) and confirmed it was correct.
- Could not publish it: the sanctioned push tool (`git-push.sh`) only fast-forwards, and this branch already had its own pushed remote history, so publishing the rewrite requires a force-push the tool doesn't support.
- Correctly declined to work around this with a raw `git push --force`, and correctly identified that deleting the branch is a human-only git operation per `CLAUDE.md`'s Branching section.
- Handed back the exact manual commands (`reset --hard` + `cherry-pick` + `push --force-with-lease`) for the human to run.

@mekhal marked this as a recurring problem ("ปัญหานี้ผมเคยเจอบ่อยมาก" — "I've hit this problem often") and, at close, scored Instruction Fidelity 4/5 (not 5/5) specifically because of it, while scoring Result Satisfaction 5/5 (the shipped fix itself was fine — see [[2026-08-11-issue-305-branch-hygiene-fresh-cut-from-develop]]'s companion eval file `ai-review-evals/2026-08-11_0330_issue-305_dashboard-i18n-close.md`).

## Decision

1. **The tooling gap is real, not a policy misjudgment.** The agent has no sanctioned way to force-push or delete a branch, by design (`CLAUDE.md` Hard rules: "Never skip hooks... unless explicitly requested," Branching section: "Merging/deleting branches... is a manual, human-only action"). Declining to route around that guardrail with a raw force-push was the correct call, even though it left the human's literal request unfulfilled in this turn.
2. **The actual fix is upstream of the request that couldn't be honored: prevent branches from being continued on a stale, unsquashed commit chain in the first place.** If a branch had been cut fresh from `origin/develop`'s tip at the start of issue #305's loop (once #294/#299 had already merged), the noisy-diff situation — and the resulting "please reset hard" ask — would never have come up.
3. This is recorded here as context for future close-step reviews, not as a new Hard rule change yet — `CLAUDE.md` already has partial coverage (the mandatory `origin/develop` sync check, and "before re-implementing an already-approved change, check whether a prior branch/PR already exists"), but neither rule currently tells the agent to actively verify, at branch-creation/first-work time, that the branch's own commit history is fresh-cut rather than continued from an older, already-merged chain. Whether to formalize that as an explicit Hard rule, or as a skill the agent consults before its first commit on a new branch, is left to the human to decide (see the close-comment's skill-candidate proposal).

## Non-decision

No change was made to `CLAUDE.md`'s push tooling or force-push policy — the constraint that the agent cannot force-push or delete branches remains exactly as documented. This decision only records the root cause and proposes where the actual fix belongs (branch hygiene at creation time), not a change to what the agent is allowed to do once a branch already has messy history.
