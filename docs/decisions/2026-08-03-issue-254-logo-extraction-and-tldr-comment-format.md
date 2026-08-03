# Decision: Ticket 2 (`logo/` extraction) — no-arg `buildLogo()`, and TL;DR comment format

**Issue:** [#254](https://github.com/mekhal/aidlc-radio-calico/issues/254) (Ticket 2 of the `index.html` component-extraction story, #245)
**Decided by:** @mekhal, 2026-08-03

## Decision

1. **`buildLogo()` takes no `state` parameter.** The wordmark markup (`album-promo.js:226-236` at the time of extraction) reads nothing off `state`, so the signature stays a plain no-arg factory rather than matching the `state`-taking signature used by the other three planned components (menu/sidebar/footer) for consistency alone. Confirmed via the human's `approved A` reply to the plan turn's open question.
2. **`logo/` stays fully decoupled from `<header>`.** `buildHeader()` in `album-promo.js` still owns the `<header class="chloe-header">` shell and nav construction (`NAV_KEYS`/`NAV_HREFS`/`render()`); it now delegates only the wordmark piece to the new global `buildLogo()`. Full shell relocation is deferred until `menu/` (#255) also exists.
3. **Comments must lead with a TL;DR.** Going forward, every substantive `@claude` comment (plan, review, PR summary, close) opens with **1. Done / 2. Scope / 3. Action Required** before any other detail, and internal process bookkeeping (which gate/skill/rule was applied) is left out of the human-facing summary — codified in `CLAUDE.md`'s "Comment format: lead with a TL;DR" section and mirrored into `README.md`/`README.th.md`'s Rules of Engagement.

## Why

Item 1-2 follow directly from #245's "fully decouple logo and menu" decision and the call-site audit run at this issue's review step (`docs/knowledge-asset/published/shared-extraction-call-site-audit.md`), which found the wordmark has zero dependency on `state` or i18n.

Item 3 responds to explicit feedback given mid-issue (2026-08-03T02:44): earlier turns on this issue included verbose "Skill applied" / "Audit trail" sections that made the comments harder to scan for the actual decision needed. The human asked for a terse, consistent structure instead. Codifying it directly in `CLAUDE.md` (rather than leaving it as one-off feedback) makes it apply to all future issues, not just repeats of this one — and per `CLAUDE.md`'s own "Source of truth & keeping docs in sync" rule, an operating-rule change must be mirrored into both READMEs, which this decision does in the same change.

## Impact

- `logo/logo.js`, `logo/logo.css`: new files (Code PR #264, merged).
- `album-promo.js`, `index.html`: edited to call the new `buildLogo()` global (Code PR #264, merged).
- `tests/logo/`: new folder (Test PR #263, merged).
- `CLAUDE.md`: new "Comment format: lead with a TL;DR" subsection under "The @claude gate".
- `README.md` / `README.th.md`: new bullet under "Rules of Engagement" / "กติกาการทำงาน" mirroring the same rule.
