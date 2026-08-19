# Issue #397 close — Udemy course reference in README and About page

## Context

Issue #397 asked to add a reference to the Anthropic Claude Code course on Udemy under
**References & Acknowledgements** in both `README.md` and `pages/about.html`. Discovery at step 2
(`@claude review`) found the About page's References section is fully data-driven
(`data/about-content.json` → `about/about.js`'s `buildReferencesList()` → Bootstrap `list-group`)
and that **no existing reference rendered as a link** — `buildReferencesList()` only ever wrote
`name`/`description` as plain `textContent`. Making the new entry clickable was therefore new
behavior (conditional anchor rendering + `target="_blank" rel="noopener noreferrer"`), not a copy
of an existing pattern, so it needed a normal Test PR → Code PR loop rather than a content-only
edit.

Two open questions were raised at step 2 and answered at `@claude approved`:

- **Q1 (About page scope):** whether to add a 5th reference entry or replace an existing one.
  Answer: replace item 4 ("Style Guide") with the Udemy credit, with specific wording provided
  ("The ideas and process in this project were inspired by the Udemy course... thanks to Frank
  Kane.").
- **Q2 (README.th.md):** whether to mirror the change into the Thai README per `CLAUDE.md`'s
  mirror rule, since the issue only named `README.md`. Answer: yes.

The loop ran end to end:

1. `@claude review` — context discovery, plan + AC, both questions raised.
2. `@claude approved` (with Q1/Q2 answers) — Test PR
   [#398](https://github.com/mekhal/aidlc-radio-calico/pull/398): failing tests for the About-page
   link-rendering AC (`tests/about/about-references.test.js`). Interpretation of "แก้ไขรายการที่ 4"
   as *replace* (not *add a 5th item*) was flagged in the PR comment for review before the Code PR.
   Merged.
3. `@claude approved` — Code PR [#399](https://github.com/mekhal/aidlc-radio-calico/pull/399):
   `about/about.js` renders `reference.name` as a link when `reference.url` is present (existing
   entries without `url` unchanged); `data/about-content.json` item 4 replaced with the Udemy
   credit + `url`; `README.md`/`README.th.md` §13 hyperlinked the existing Frank Kane bullet to the
   same URL. Merged.
4. `@claude close coding 5 satisfied 5` — scores given directly in the close comment.

## Decision

1. **Replaced the "Style Guide" reference rather than adding a 5th entry**, per the literal reading
   of Q1's answer ("แก้ไขรายการที่ 4" = edit item 4). This was flagged explicitly in the Test PR
   comment as an interpretation call before the Code PR implemented it, rather than silently
   assumed — consistent with `docs/decisions/2026-07-20-review-before-over-implementing.md`'s
   "ask before over-implementing" guidance, applied here as "flag the interpretation and let the
   next approval confirm it" since the wording itself was reasonably unambiguous.
2. **Link rendering implemented as a generic `reference.url`-driven branch** in
   `buildReferencesList()`, not a one-off hardcoded anchor for the Udemy entry — so any future
   reference entry can opt into being a link by adding a `url` field, and the 3 existing non-link
   entries needed no change (regression-safe by construction, covered by Test PR #398's
   no-anchor-when-no-url assertion).
3. **README.md/README.th.md changes bundled into the Code PR, not the Test PR** — per
   `CLAUDE.md`'s "Test PR is tests only" rule, since a Markdown hyperlink edit isn't independently
   testable the way the About-page JS logic is.
4. **No case-studies.json entry proposed** — this loop is a small, single-fact content/reference
   addition (even though it touched `about.js` logic), not an architecturally illustrative example
   on the level of the 3 existing curated showcase entries. Per `CLAUDE.md`'s "not every closed
   issue belongs in the showcase" guidance, no entry was added; flagged as a candidate-but-declined
   in the close comment for the human's final call.

## Non-decision

No new skill was distilled from this issue at close — the two judgment calls above (interpret
"replace" vs "add", bundle README edits into the Code PR) both follow existing documented
guidance (`review-before-over-implementing`, `CLAUDE.md`'s Test-PR-is-tests-only rule) rather than
surfacing a new reusable pattern, so none was proposed as a skill candidate.
