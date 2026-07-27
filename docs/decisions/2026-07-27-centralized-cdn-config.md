# Decision: Centralized CDN source-of-truth config (`config/cdn-sources.json`)

**Issue decided on:** [#157](https://github.com/mekhal/aidlc-radio-calico/issues/157) (Ticket C thread)
**Decided by:** @mekhal, 2026-07-27T16:08
**Related prior decisions:** the `unpkg.com`-blocked / jsDelivr-swap incident recorded on this same
branch history (issue #157's several rework rounds), and the still-open skill draft
`docs/knowledge-asset/published/cdn-provider-fallback-before-vendoring.md` (carried in the not-yet-merged
PR #198, from this issue's earlier close step).

## Decision

Issue #157's close step (step 7 of the AI-DLC loop) had surfaced a new-skill candidate —
"cdn-provider-fallback-before-vendoring" — proposing that, before vendoring/self-hosting a
network-blocked CDN asset, the agent should first try an alternate CDN provider already used
elsewhere in the project. The human approved that candidate but asked for it to go further: instead
of only being a written skill instruction, the project should have an actual, committed
**centralized CDN mapping/fallback-list file**, and the agent must be required to read that file
first, before ever reaching for an external/other CDN provider.

That file is `config/cdn-sources.json` — for every externally-loaded library (`bootstrap`,
`bootstrap-icons`, `react`, `react-dom`, `babel-standalone`), it records the primary CDN URL, an
ordered fallback list, which files currently load it, and freeform `notes` capturing why a
particular provider was chosen (e.g. the `unpkg.com` network-block that originally caused this
issue's `ReferenceError: ReactDOM is not defined` bug).

`CLAUDE.md`'s "Tech stack" section, and both `README.md`/`README.th.md`, now point at this file and
state the rule: **read `config/cdn-sources.json` before adding or changing any CDN
`<script>`/`<link>` reference; add a new entry there as part of the same change if a library isn't
listed yet.**

A `knownDrift` entry was recorded in the config (not fixed) for `tests/test-runner.html`, which
still loads `react`/`react-dom` from `unpkg.com` and was never migrated to the jsDelivr primary —
flagged for visibility, left untouched to avoid unrequested scope creep in this change.

## Why

`config/cdn-sources.json` turns a fact that was previously only discoverable by re-debugging (which
CDN actually works for this environment) into a single, checkable artifact — the same
network-block/CDN-swap investigation had to be repeated multiple times across this issue's thread
before this decision. Documenting it as project config, not just a skill instruction, means any
future change to any CDN reference (by a human or the agent) has one obvious place to check first,
regardless of whether the relevant skill has been promoted into `.claude/skills/` yet.

## Impact

- New file: `config/cdn-sources.json`.
- `CLAUDE.md` (Tech stack section), `README.md`, `README.th.md` updated to reference it.
- No changes to `index.html` / `album-promo.html` / `album-promo.css` / `album-promo.js` — both
  files already load React/ReactDOM from the jsDelivr URLs now recorded as `primary` in the config,
  so no CDN URL actually changed as part of this decision.
- **Open item:** PR #198 (this issue's earlier close-step PR, still unmerged as of this decision)
  carries the original `cdn-provider-fallback-before-vendoring.md` skill draft, written before this
  centralized-config request. That draft should be updated to reference
  `config/cdn-sources.json` once #198 is reviewed — not duplicated here, to avoid a merge conflict
  between the two open PRs on the same file.
- **Open item:** `tests/test-runner.html`'s own `unpkg.com` references were not migrated — a future
  ticket should align it with `config/cdn-sources.json`'s primary URLs.
