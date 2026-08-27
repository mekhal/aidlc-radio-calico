# Issue #533 close — skeleton-loading scores and a general loading-skeleton skill candidate

## Context

Issue #533 asked for the Test Report Dashboard's full-screen loading backdrop to be replaced with
an in-place skeleton matching the stats-row/category-grid layout. The loop ran end to end:

- **Plan (review gate):** posted a mockup, drafted AC, and asked two open design questions
  (placeholder card count; whether Reload Test stays clickable during loading) plus which
  ticket-split mechanism to use.
- **Review (mid-loop scope request):** @mekhal asked, in the same review turn, to also split the
  Index/App test suite by page (Home / What's this / Case study / Contact) to reduce duplication.
  That request belongs to a different module than #533's loading-state scope, so per `CLAUDE.md`'s
  "missed functionality becomes a new issue" hard rule it was not folded into this loop — root
  cause was investigated (three of the four pages already have dedicated `tests/` folders but
  aren't recognized by `categorizeScriptPath()`'s taxonomy regex, so their results still fall into
  the generic `index/app` bucket) and two ticket drafts were written up for @mekhal to open.
- **Approved:** none of the three open questions were answered explicitly, so the agent picked the
  lower-risk default for each (documented below) rather than guessing further or stalling.
- **Test PR (#534):** failing AC tests for the skeleton behavior, merged to `develop`.
- **Code PR (#535):** implemented the skeleton per the merged tests, merged to `develop`.
- **Close:** `@claude close coding 5 satisfied 5` plus a screenshot and a request to capture a new
  skill: apply a loading skeleton (not a full-screen backdrop) to anything that takes load time.

## Decision

1. **Recorded Instruction Fidelity 5 / Result Satisfaction 5 verbatim** in a new
   `ai-review-evals/` entry — never self-scored, per the framework's own rule.
2. **Verified no PR gap before closing.** Both prior-turn branches
   (`claude/issue-533-20260827-1227`, `claude/issue-533-20260827-1245`) map to PR #534 and PR #535,
   both merged to `develop` — nothing stranded per the issue #135 mitigation.
3. **Flagging, not opening, the two Index/App test-taxonomy tickets drafted mid-loop.** Checked
   `gh issue list` — neither "Recognize existing page test folders…" nor "Split Home/App's
   root-level tests…" has been opened yet. Opening a GitHub issue is a human action (AI-DLC step
   1), and this close comment's trigger didn't ask for it, so both remain outstanding for @mekhal
   to create if still wanted.
4. **One new skill candidate proposed**: a general "use a loading skeleton, not a full-screen
   backdrop, for anything with load time" rule, generalized from this issue's specific Test Report
   Dashboard fix. This directly matches @mekhal's own framing at close ("อะไรที่ต้องใช้เวลาโหลด ให้ใส่
   สเกลเลตันโหลด ไปด้วย" — whatever needs load time, add a loading skeleton). See the `SKILL.md`
   draft in this issue's close comment (not yet copied into `.claude/skills/` per the write-guard
   workaround). Checked existing skills for overlap: `theme-token-background-audit` covers *how to
   color* a skeleton/shimmer once one exists (dark-theme-safe tokens), not *when to reach for one*
   — the two are complementary, so this is proposed as a new skill rather than folding into that
   one.
5. **Not proposing a Case Study showcase entry.** `data/case-studies.json` currently holds three
   IF5/RS5 entries (#245, #294, #158), each illustrating either a non-trivial mismatch caught
   before coding, a root-caused production bug, or a fix that produced a durable published skill.
   #533 is a clean, correctly-scored loop but a plainer one — a single UI-pattern swap with no
   surfaced mismatch or bug — so it doesn't add a materially different illustration to the existing
   set. Not flagged for @mekhal's confirmation this time (unlike prior closes where candidacy was
   ambiguous enough to ask).

### Defaults picked at the Test PR step (documented for traceability)

- **Ticket-split mechanism:** no split — kept as a single Test PR / Code PR pair under #533; the
  diff stayed review-sized.
- **Skeleton placeholder count:** mirrors the previous report's category count on Reload; falls
  back to 3 cards on a true first-ever load.
- **Reload Test button during loading:** disabled while the skeleton is showing, re-enabled on
  completion or timeout.

## Why

Decision 4 matters because this issue's fix (Test Report Dashboard specifically) is one instance
of a UI pattern the codebase is likely to need again — any future data-fetching view (a new
dashboard widget, a modal that loads content asynchronously) has the same choice between a
blocking backdrop and an in-place skeleton, and @mekhal's close comment states the general
preference explicitly rather than leaving it implicit in one fix. Capturing it as a skill means the
next occurrence starts from "use a skeleton" instead of re-deriving the same UX call.

Decision 5 matters for the same reason issue #465's close skipped case-study candidacy only when
ambiguous: the showcase is deliberately a small, curated set (per the issue #203 decision), not a
running log of every 5/5 close, so an unprompted "plainer than existing entries" entry would dilute
rather than strengthen it.

## Impact

- Issue #533 closes at its shipped scope: PR #534 (tests) and PR #535 (code) both merged to
  `develop`.
- One new skill candidate proposed for @mekhal to decide (add/update/skip) — see the `SKILL.md`
  draft in this turn's comment.
- Two Index/App test-taxonomy ticket drafts remain open action items for @mekhal, unrelated to
  #533's own scope.
