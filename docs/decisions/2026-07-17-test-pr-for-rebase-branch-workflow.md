# Decision: Open a throwaway PR to exercise the `/rebase` workflow trigger

**Issue:** [#106](https://github.com/mekhal/aidlc-radio-calico/issues/106)
**Decided by:** @mekhal, 2026-07-17

## Decision

@mekhal asked for a PR to look at after uploading `.github/workflows/rebase-branch.yml` (see the prior review comment on issue #106, which confirmed the file is structurally valid but noted it can only be exercised once a real PR is open to comment `/rebase` on). This PR exists to satisfy that: it is not a Test PR in the step-4 AI-DLC sense (no AC to test — see the `index.html`-surface Test PR scope rule already recorded on this issue) and not a Code PR delivering new product functionality. Its only purpose is to give @mekhal an open PR to comment `/rebase` on, to manually confirm the rebase workflow triggers, resolves the head ref, rebases onto `develop`, and force-pushes as designed.

## Why

Issue #106's core bug (jobs triggered from an issue comment landing on `origin/main` instead of `origin/develop`) is being reported to Anthropic directly and is out of agent scope. The `/rebase` mitigation workflow was drafted and uploaded in earlier rounds on this issue but never actually triggered, since triggering it requires an open PR and a human-authored `/rebase` comment (the agent should not simulate that force-push action on the human's behalf — see the prior review comment explaining why the agent declined to trigger it itself).

## Impact

- No `CLAUDE.md` / README changes and no product code changes — this is a standalone decision doc plus this PR itself.
- Does not touch `index.html` or any script it loads, so no Test PR is required per the existing Test PR scope rule.
- Once @mekhal has tested `/rebase` against this PR, it can be closed without merging (or merged if a maintainer prefers to keep the record) — either action is fine for this ticket's purpose.
