<!--
Scratch draft per CLAUDE.md's write-guard workaround: agent writes cannot land inside .claude/.
A human copies the content between the markers below verbatim into:
  .claude/skills/cdn-provider-fallback-before-vendoring/SKILL.md
Surfaced while working issue #157 (Ticket C, `ReactDOM is not defined` — unpkg.com network-blocked).
Decision record: docs/decisions/2026-07-25-ticket-c-cdn-jsdelivr-swap-and-index-html-drift.md
-->
<!-- BEGIN SKILL.md -->
---
name: cdn-provider-fallback-before-vendoring
description: Use when a CDN-loaded asset (script/stylesheet) fails to load in a CDN-only, no-build-step project — before proposing to vendor/self-host the file, check whether another CDN provider already used elsewhere in the same project can serve it instead.
---

When a CDN `<script>`/`<link>` fails to load (console error, "X is not defined", 404, or a reported
network-block) in a project whose tech-stack decision is "CDN `<script>` references only, no
npm/bundler":

1. First rule out a code defect: check load order (dependency scripts before the code that uses
   their globals) and the exact global name expected — don't assume the CDN is at fault before this
   is confirmed.
2. If the code is correct, ask whether the failure is reachability (network/firewall blocking that
   specific CDN host) rather than assuming it's universal — a CDN reachable from your own environment
   may still be blocked for the reporting user's network.
3. Before proposing to vendor/self-host the file (commit it into the repo as a static asset), check
   whether the project already loads a *different* dependency from a *different* CDN provider (e.g.
   jsDelivr for one library, unpkg for another). If so, propose switching the failing dependency to
   the provider already proven to work in the same file/project first — it fixes the specific
   blocked-host case without adding new vendored files or touching the "CDN-only" wording of any
   locked stack decision.
4. Only fall back to vendoring if no alternate CDN provider resolves it, and flag explicitly that
   vendoring is a deviation from a "CDN-only" decision (if one is locked) so a human signs off on the
   tradeoff rather than it happening silently.
<!-- END SKILL.md -->
