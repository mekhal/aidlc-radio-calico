# Decision: Issue #420 (Contact page — Ticket 3: Contact Form column + mailto submit) closed at Instruction Fidelity 5 / Result Satisfaction 5

**Issue:** [#420](https://github.com/mekhal/aidlc-radio-calico/issues/420) — Ticket 3 of the "Contact" page story, [#153](https://github.com/mekhal/aidlc-radio-calico/issues/153)
**Test PR:** [#427](https://github.com/mekhal/aidlc-radio-calico/pull/427) (merged to `develop`)
**Code PR:** [#428](https://github.com/mekhal/aidlc-radio-calico/pull/428) (merged to `develop`)
**Decided by:** @mekhal, 2026-08-20

## Decision

1. **Scores given directly at close:** Instruction Fidelity 5, Result Satisfaction 5 ("coding 5 satisfied 5"). Recorded as-is per `CLAUDE.md`'s rule that the agent never self-scores.
2. **Full Test PR → Code PR loop run, not waived** — unlike Ticket 3 of the sibling "What's this" story (#404), this ticket kept the standard step 4/5/6 split: failing tests for AC4 in #427, approved, then #428 implemented exactly the seam/shape #427's Test PR description recorded.
3. **Architecture flag resolved by following established precedent, not a new human decision.** The issue's plan text said the form would render from `contact-page.js`; Ticket 2 (#419) had already put its content-builder in `contact/contact.js` with `contact-page.js` doing only page-init mounting. The Test PR flagged this mismatch rather than silently deviating from the issue text, and — since no correction came back before the Code PR — the Code PR followed Ticket 2's already-established split for consistency (reuse-first).
4. **Mailto submit uses the already-published native-API seam pattern**, not a new one: `window.__contactFormMailtoNavigate__` guards the real `window.location.href` navigation, mirroring the `test-pr-native-api-and-self-ref-checklist.md` skill captured at issue #54. No new skill candidate surfaced by this issue's own work — it is a straightforward application of that existing skill to a new seam name.
5. **Case Study showcase candidacy is not proposed from this ticket individually.** Following the same convention already set at the "What's this" story (see #404's decision doc), per-ticket closes within a multi-ticket page story don't separately curate `data/case-studies.json` — that candidacy is considered once at the parent story's own close (#153), not at each ticket.

## Why

Decision 1 follows the "never grade its own homework" principle already established in the `ai-review-evals` framework.

Decision 2 reflects that this ticket's AC (form field types/attributes, mailto URL shape, submit seam) was judged worth a dedicated Test PR review cycle — no waiver was requested or proposed at step 3.

Decision 3 keeps the agent from unilaterally overriding an issue's plan text; flagging + defaulting to the sibling ticket's precedent avoided a review round-trip while leaving the human free to correct it (they did not).

Decision 4 avoids inventing a new pattern where an existing, already-reviewed one (from issue #54) already fits.

Decision 5 keeps `data/case-studies.json` a small, curated set (per its own issue #203 decision) rather than one entry per sub-ticket.

## Impact

- Issue #420 closes with its scope shipped: Contact Form column (`#contact-form-root`) — Name/Email/Message/Submit with mailto: submission to `mekha.l@outlook.com`, white/clean card styling (AC4/AC5), merged via #427 + #428.
- Contact page story (#153) now has all three tickets (#418, #419, #420) merged into `develop`; AC6 (2-column responsive layout) and AC7 (nav regression) are covered by existing tests per #428's PR description, completing the end-to-end check.
- No new file added to `docs/knowledge-asset/published/` from this issue's own work.
- Case Study candidacy for the Contact page story deferred to #153's own close, not raised here.
