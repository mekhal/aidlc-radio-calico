<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/ci-workflow-draft-write-guard/SKILL.md
Surfaced closing issue #67: https://github.com/mekhal/aidlc-radio-calico/issues/67
-->
<!-- BEGIN SKILL.md -->
---
name: ci-workflow-draft-write-guard
description: Use whenever creating or fixing a GitHub Actions workflow in this repo — Claude cannot write under .github/workflows/, so draft/iterate in docs/ci-drafts/ and hand off each change for a human to copy in.
---

1. Draft new workflow YAML under `docs/ci-drafts/<name>.yml`, never attempt `.github/workflows/<name>.yml` directly (write-guard blocks it — confirmed empirically across issues #26, #43, #67).
2. Write/maintain a `docs/ci-drafts/README.md` alongside the drafts covering: how to install (exact `cp` commands into `.github/workflows/`), *why* the workflow is shaped the way it is (triggers, publish target, non-blocking-vs-blocking choice), and a running "fixes applied after live runs" changelog.
3. After the human copies a draft in and reports a CI failure, root-cause it against upstream sources (release tags via the GitHub API, the failing action's actual `action.yml`) rather than guessing — then fix the file under `docs/ci-drafts/`, never the live `.github/workflows/` copy.
4. If a fix was applied directly to the live `.github/workflows/` file by the human (out-of-band, since only they can write there), diff it against the draft and sync the draft to match — don't let `docs/ci-drafts/` silently drift out of sync with what's actually running, since it's the copy source for future re-installs.
5. State explicitly in each round's summary that the human still needs to re-copy the file(s) — this step is easy to forget since the draft "looks done" once committed.
<!-- END SKILL.md -->
