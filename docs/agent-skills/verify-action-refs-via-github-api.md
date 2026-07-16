<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/verify-action-refs-via-github-api/SKILL.md
Surfaced closing issue #67: https://github.com/mekhal/aidlc-radio-calico/issues/67
-->
<!-- BEGIN SKILL.md -->
---
name: verify-action-refs-via-github-api
description: Use when pinning, bumping, or debugging a GitHub Actions `uses: owner/repo@ref` line — verify the ref actually resolves (and check what it transitively pulls in) instead of guessing at a version string.
---

1. Before proposing or fixing a version pin, confirm the tag actually exists upstream (e.g. `gh api repos/<owner>/<repo>/tags` or `git ls-remote --tags`) rather than pattern-matching a version number from memory or docs — tag prefixes (`v0.28.0` vs `0.28.0`) and tag deletions are both silent failure modes that only show up at CI run time.
2. If the action is a wrapper/composite action, check its `action.yml`/`action.yaml` at the pinned ref for further `uses:` lines it calls internally — a transitive pin can break even when the top-level pin is fine (e.g. `trivy-action@v0.28.0` resolving, but its internal `setup-trivy@v0.2.1` pin pointing at a tag since deleted upstream).
3. When a version bump is needed to fix a transitive break, check several candidate versions' internals (not just the next patch/minor) — the fix may require jumping further than expected if upstream changed *how* it pins its own dependencies partway through its release history (e.g. switching from tag-pins to commit-SHA-pins at a specific version).
4. Report findings with the evidence (tag list, `action.yml` excerpt) rather than "I bumped it to latest and it might work" — this makes the fix reviewable and distinguishes a confirmed root cause from a guess.
<!-- END SKILL.md -->
