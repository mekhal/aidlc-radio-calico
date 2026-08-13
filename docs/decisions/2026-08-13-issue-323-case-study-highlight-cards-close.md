# Issue #323 close — Case Study Highlight Cards (AC2, part of AC4)

## Context

Issue #323 was Ticket 2 of #203 (Case Study tab) — `data/case-studies.json` plus a rendered
Highlight Cards section, per the AC drafted and approved by @mekhal on #203 (see
`docs/decisions/2026-08-11-issue-203-case-study-data-source-and-ticket-breakdown.md`).

The loop ran across many more review rounds than a typical ticket before reaching step 4:

1. AC review (2026-08-12T15:31) flagged that the issue's own Scope bullet ("update both
   `index.html` and `album-promo.html`") contradicted both the parent breakdown doc (AC5 belongs
   to Ticket 1/#322 only) and `album-promo.html`'s own "reference only, no new markup" header —
   @mekhal confirmed dropping `album-promo.html`, `index.html` only.
2. Candidate selection and the `data/case-studies.json` field shape went through several
   correction rounds: an invalid candidate (#203 — not closed, and self-referential as the parent
   story of this very ticket), a misidentified candidate (#296 — a PR belonging to #294's own
   loop, not a separate issue), a trigger comment with literal unfilled placeholders ("Issue
   #...", "field ...") that was correctly blocked and clarified rather than guessed, and a content
   restructure (flat `summary` replaced with a `problem` → `aiAction` → `outcome` flow plus a
   visual connector, at @mekhal's request for readability). Candidates settled on #245
   (Architecture), #294 (Bug Fix), #158 (Feature).
3. Step 4 Test PR [#341](https://github.com/mekhal/aidlc-radio-calico/pull/341) (merged) wrote
   failing AC tests for the finalized shape.
4. Step 6 Code PR [#342](https://github.com/mekhal/aidlc-radio-calico/pull/342) (merged)
   implemented `data/case-studies.json` + `case-study/case-study.js` + `case-study/case-study.css`,
   wired inline into `index.html` via `album-promo.js`'s `buildMain()`.
5. **Step-7 rework:** @mekhal viewed the merged result and asked to move Case Study to its own
   page rather than an in-page section. The first request ("แยกหน้าใครหน้ามันเลยซิ") was
   ambiguous between a real new HTML file vs. a same-page tab view — flagged for clarification
   rather than guessed, since it touches an already-closed ticket (#322's nav logic) and an
   unstarted one (#324's dashboard-layout assumption). @mekhal confirmed a real standalone
   `case-study.html` page. A mini step 4→6 loop followed: Test PR
   [#346](https://github.com/mekhal/aidlc-radio-calico/pull/346) (merged), Code PR
   [#347](https://github.com/mekhal/aidlc-radio-calico/pull/347) (merged) — moved
   `buildCaseStudySection()` from `album-promo.js` into `case-study/case-study.js` for reuse, added
   `case-study/case-study-page.js` to compose the shared header/sidebar/footer with a
   Case-Study-only `<main>`, reworked `menu/menu.js`'s nav href and active-state detection from
   hash-based to path-based for this one entry.
6. **Bug found after merge:** PR #347 was supposed to also stop `index.html` from rendering the
   section inline, and even added a regression test asserting exactly that
   (`tests/album-promo-case-study-removed.test.js`), but the actual line removal
   (`main.appendChild(buildCaseStudySection())` in `album-promo.js`'s `buildMain()`) was never
   made — the code comment above it described the intended change but the call itself stayed. The
   regression test therefore merged in a failing (red) state. @mekhal caught this from a
   screenshot of the live Home page. Fixed in PR
   [#349](https://github.com/mekhal/aidlc-radio-calico/pull/349) (merged) — a one-line removal,
   correctly scoped by @mekhal as a bug fix rather than a new step-7 rework.

All five PRs (#341, #342, #346, #347, #349) merged into `develop`; no stray branches without an
opened PR.

## Decision

1. **`album-promo.html` dropped from scope entirely**, matching #322's precedent and the file's
   own "reference only" header — Highlight Cards (and later, the standalone page) exist only on
   `index.html`/`case-study.html`.
2. **Case content model changed from a flat summary to Problem → AI Action → Outcome**, at
   @mekhal's explicit request, to make each card read as the AI-DLC loop's actual narrative
   rather than a plain description. Rendered as three labeled rows with a visual CSS connector —
   no new CDN dependency, per `config/cdn-sources.json` policy.
3. **Case Study moved from an in-page section to a standalone `case-study.html` page**, reversing
   the parent decision doc's original single-dashboard-page assumption
   (`docs/decisions/2026-08-11-issue-203-case-study-data-source-and-ticket-breakdown.md`, point 3)
   — recorded here as the override, per that turn's own suggestion. Same-tab navigation was kept
   (playback stops when leaving `index.html`); @mekhal did not ask for the new-tab alternative
   that was offered.
4. **#324 (Ticket 3, Summary Metrics & Trends) is not yet resolved** on whether it stays on
   `index.html` or also moves to `case-study.html` now that the page is split — flagged in-thread,
   left for #324's own step-2 plan since #324 hadn't started.
5. **Close-time scores were given directly with brief reasons:** `coding 4` (Instruction
   Fidelity) — "ยังมีบัคต้องแก้ เดี่ยวไปจัดการทีหลัง" (there's still a bug to fix, will handle it
   later — @mekhal's own follow-up, not raised as a new issue by this close); `satisfied 3`
   (Result Satisfaction) — "ทำ page รวน ต้องบอกให้แก้หลายรอบ" (the page came out unstable/messy,
   needed several rounds of correction). See the eval entry for full detail.
6. **Case Study showcase candidacy (`data/case-studies.json` now exists):** this issue's own
   closed loop was considered and **not** proposed as a showcase entry — it is the very ticket
   that built the showcase mechanism itself (self-referential, the same concern that ruled out
   #203 as a candidate earlier in this thread), and its Result Satisfaction (3) and the
   post-merge regression are not the "clean, illustrative" bar the showcase is meant to hold. Left
   for @mekhal to override if a "the framework catching its own regression" angle is wanted later.

## Non-decision

No change to `CLAUDE.md` from this close. Two new-skill candidates are proposed separately in the
close comment for @mekhal to decide add/update/skip — neither is written here since skill
candidates are the human's call, not a recorded decision by default.
