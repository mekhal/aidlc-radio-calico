# Issue #419 close — Contact Info column scored coding 5 / satisfied 4, bilingual-paragraph decision reversed into a new issue

## Context

Issue #419 (Ticket 2 of the "Contact" page story, [#153](https://github.com/mekhal/aidlc-radio-calico/issues/153)) shipped the Contact Info column (`#contact-info-root`): a bilingual (Thai + English, both always visible, no language toggle) inspiration paragraph, followed by "Mekha Lomlao" and "mekha.l@outlook.com", sourced from `data/contact-content.json`. The "always both languages, no toggle" behavior was an explicit decision confirmed with @mekhal during #153's plan review — called out directly in `contact/contact.js`'s file header as a deliberate deviation from the rest of the site's `state.lang`/toggle-driven i18n pattern (e.g. `about/about.js`). Test PR [#424](https://github.com/mekhal/aidlc-radio-calico/pull/424) and Code PR [#426](https://github.com/mekhal/aidlc-radio-calico/pull/426) both merged to `develop`.

At close, @mekhal scored the ticket **coding 5, satisfied 4** and added one note:

> ฝั่ง แรงบันดาลใจ ควรทำเป็น 2 ภาษา ล้อกับ toggle

Translated: the inspiration paragraph should follow (mirror) the site's language toggle, rather than always showing both languages at once.

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 5, Result Satisfaction 4.** Per `CLAUDE.md`'s rule that the agent never self-scores — same precedent as [[2026-08-20-issue-402-whats-this-scaffold-close-scores]]. Logged in `ai-review-evals/2026-08-20_1621_issue-419_contact-info-close.md`.

2. **The toggle note is new/changed scope, not a missed AC — split into a new issue, [#432](https://github.com/mekhal/aidlc-radio-calico/issues/432), rather than reopening #419's loop.** Same "missed functionality becomes a NEW issue" pattern as [[2026-08-18-issue-151-about-page-close-scores-and-followups]]'s #151 → #394 split. Root cause: the "both languages, always, no toggle" behavior was a real decision, explicitly confirmed with @mekhal during #153's plan review at the time — but that confirmed reading doesn't match what @mekhal actually wants once the page shipped and was viewed live. No existing open ticket under #153 (#418 scaffold, #420 Contact Form) already covers this, so a fresh issue was opened directly (not just proposed) rather than left pending — same immediate-action pattern #151's close used for #394, per the "ask when in doubt" guidance not requiring a *second* confirmation round for a correction the human already stated plainly.

3. **No new skill candidate captured from this issue's own work.** This is a one-off content-behavior decision reversal (the human changed their mind after seeing the shipped result), not a repeatable process gap — #419's own execution (Test PR → Code PR, `data/contact-content.json` shape, `contact/contact.js` structure) followed the established reuse-first patterns cleanly, which the coding-5 score reflects. `docs/knowledge-asset/published/review-ui-changes-with-mockup.md` already covers the adjacent "surface UI decisions concretely during review" concern; nothing new to add here.

4. **Not proposed as a Case Study showcase candidate this close.** Per [[2026-08-11-issue-203-case-study-data-source-and-ticket-breakdown]]'s curation guidance ("clean, illustrative end-to-end example"), a ticket whose shipped behavior needed a same-day reversal into a follow-up issue isn't the cleanest example, even at coding 5/satisfied 4 — same reasoning #151 used to skip the showcase at 3/3.

## Why

Decision 2 keeps #419's own AC (fully met — the bilingual-always-both behavior was exactly what was planned and approved before the Code PR shipped) from being reopened for a preference that only became clear after seeing the live result. Opening #432 immediately (rather than only proposing it and waiting for a further confirmation) mirrors the #151 → #394 precedent: the human's close comment already states the correction plainly enough to act on, and the new issue itself is scoped as "not decided — for step 2 discussion" on the fix direction, so nothing is implemented prematurely.

## Impact

- Issue #419 closes at its original AC3 scope; no further code changes made in this close turn (per `CLAUDE.md`'s `@claude close` scope — "used only to summarize the issue for skill creation").
- New issue [#432](https://github.com/mekhal/aidlc-radio-calico/issues/432) tracks making the inspiration paragraph follow `state.lang`/the site's language toggle instead of always rendering both languages, with root cause and a suggested fix direction already recorded for its own step-2 plan.
- `data/case-studies.json` left unchanged.
