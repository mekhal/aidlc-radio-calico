# Issue #446 (Ticket 0) close — scored coding 4 / satisfied 3, bilingual-by-default skill proposed

## Context

Issue #446 ("Ticket 0: Shell — More Options button + Sub-menu", a sub-issue of #421) closed with
the Test PR waived at step 3. The loop ran through three implementation turns on the same shell:

1. **[PR #450](https://github.com/mekhal/aidlc-radio-calico/pull/450)** — initial shell: ⋮ button
   + one flat panel listing Sleep Timer and Audio Quality options together, plus Share.
2. **`@claude review`** — human asked to convert the flat panel into a sub-menu, attaching a
   screenshot. The agent could not load the screenshot (no `WebFetch`/outbound `curl` in that run)
   and posted a text-inferred reading of the request instead of implementing.
3. **[PR #452](https://github.com/mekhal/aidlc-radio-calico/pull/452)** — `@claude approved` (no
   correction to the agent's stated assumptions, taken as implicit confirmation): converted to a
   nested sub-menu (top-level rows for Sleep Timer/Audio Quality/Share, click-to-expand panels with
   a Back row).
4. **[PR #454](https://github.com/mekhal/aidlc-radio-calico/pull/454)** — human asked for the new
   menu's labels to be bilingual (EN/TH); agent wired them into the existing
   `shared/translations.js` / `i18n/album-promo-{en,th}.json` system already used elsewhere on the
   page.

All four PRs are merged to `develop` (and `develop` → `main` per #451/#453, human-only releases).
No stranded branches: `claude/issue-446-20260824-0117` (the review turn) was never pushed, matching
"discuss only, no code" for that gate.

@mekhal then posted `@claude close` with scores and two notes:

> Coding 4
> 1. เคยบอกเรื่องทำ 2 ภาษาไว้แล้ว แต่วันนี้ยยังต้องมาสั่งทำสองภาษาเพิ่มอีก บันทึกไว้เลยว่า อะไรที่ Fixed
>    ให้เสนอเป็น 2 ภาษา
> Satisfied 3
> ต้องสั่งแก้ UI หลายรอ

Translated: "Coding 4. (1) I already raised bilingual before, but today I still had to ask for it
again — record this: whatever is Fixed, propose it in 2 languages. Satisfied 3 — had to order UI
fixes multiple rounds."

## Decision

1. **Scores recorded verbatim: Instruction Fidelity 4, Result Satisfaction 3.** Per `CLAUDE.md`'s
   rule that the agent never self-scores. Logged in
   `ai-review-evals/2026-08-24_0252_issue-446_ticket0-shell-close.md`.

2. **Root cause, bilingual gap — this is the 4th recurrence, and the fix proposed for the 3rd was
   never adopted.** The same "shipped English-only, human has to ask for bilingual afterward"
   pattern was already flagged at
   [[2026-08-18-issue-151-about-page-close-scores-and-followups]] (#151),
   [[2026-08-20-issue-419-contact-info-close-scores-and-toggle-followup]] (#419), and
   [[2026-08-21-issue-152-whats-this-followup-close-scores-and-i18n-gap]] (#152 — where @mekhal
   gave the *identical* coding 4 / satisfied 3 scores for the *identical* complaint). That close
   proposed a new skill, `confirm-i18n-requirement-at-plan-time`, but it was only ever drafted in
   that close's write-up — never written to `docs/knowledge-asset/published/` or `.claude/skills/`
   (checked: neither location has it). Because nothing changed in the agent's actual behavior, #446
   repeated the exact same gap: Ticket 0's plan/AC (locked at #421, review-only at #446's step 2)
   never mentioned bilingual, so the shell shipped English-only in PR #450, and bilingual had to be
   requested as a same-day follow-up (PR #454).

3. **Skill proposed below, framed stronger than the #152 draft** — see "Adding a skill" section.
   @mekhal's own words this time ("อะไรที่ Fixed ให้เสนอเป็น 2 ภาษา" — "whatever is Fixed, propose it
   in 2 languages") ask for a *default*, not a plan-time question to remember to ask. This
   supersedes the never-adopted `confirm-i18n-requirement-at-plan-time` draft rather than adding a
   second, overlapping one.

4. **Root cause, "had to order UI fixes multiple rounds":** the `@claude review` turn between PR
   #450 and PR #452 could not load @mekhal's attached screenshot (`WebFetch` unavailable, `curl`
   blocked in that run), so it inferred the requested nested-menu structure from text alone and
   asked for confirmation rather than guessing silently — correct per "ask when in doubt," but it
   cost a full review round-trip that a working image view would likely have avoided. That review
   turn's comment also did not carry the "Skills consulted" audit-trail line that every other turn
   on this issue included, even though its ASCII sketch of the proposed nested menu was materially
   the same deliverable `docs/knowledge-asset/published/review-ui-changes-with-mockup.md` calls
   for. Not proposing a new skill for this — the image-loading gap is an environment/tooling
   limitation (already flagged in each affected turn's comment, asking whether `--allowedTools` can
   permit `node`/`python3`/image fetch for future runs), not a decision gap, and the missing
   audit-trail line is a one-off process slip already visible in this doc for future reviewers, not
   a new pattern.

5. **Not proposed as a Case Study showcase candidate.** `data/case-studies.json` exists, but a
   satisfaction score of 3 with an explicit "took multiple UI rounds" complaint doesn't read as the
   "clean, illustrative" example the showcase curation calls for — same reasoning used to skip #151
   (3/3) and to withdraw the tentative proposal at #152's second close (4/3). Nothing added to
   `data/case-studies.json`.

## Why

Decision 2's root-cause trace matters because it shows the gap isn't a one-off miss — it's the
*same* unadopted decision from #152 recurring on a different page. Re-proposing the same shape of
skill a fifth time without changing its framing would likely repeat again; going with @mekhal's own
"Fixed → 2 languages" framing (a default behavior, not a reminder-to-ask) is a more direct fix for
the actual complaint.

Decision 4 separates a real environment limitation (can't view images) from a process gap (missing
audit-trail line), since only the latter is something a skill or rule change could address, and it
isn't recurring enough on its own yet to warrant a new skill.

## Impact

- Issue #446 (Ticket 0, sub-issue of #421) closes at its shipped scope: all three PRs (#450, #452,
  #454) merged to `develop`; nothing reopened or changed in shipped code by this close.
- One new skill candidate proposed for @mekhal to decide (add/update/skip) — see the `SKILL.md`
  draft in this turn's comment, not yet copied into `.claude/skills/` per the write-guard
  workaround.
- `data/case-studies.json` left unchanged.
