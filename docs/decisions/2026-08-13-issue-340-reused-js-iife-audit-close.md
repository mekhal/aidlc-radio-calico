# Issue #340 close — Reused-JS IIFE-safety standing audit → Option (c) regression test

## Context

Issue #340 was opened as the requested follow-up from #330's close ("please create a new task for
update other reuse JS"): re-run the top-level `const`/`let`/`class`-outside-IIFE audit against the
current `develop` tip, and decide how to make it a standing check rather than a one-off.

## What happened across the loop

1. Step 2 review: re-ran the grep-based audit (top-level `const`/`let`/`class` outside an IIFE)
   against every reused `*.js` file at `develop@73d206b`. Confirmed the codebase was still clean —
   nothing newly broken since #330's fix (menu/menu.js, sidebar/sidebar.js) landed.
2. Presented three standing-check options: (a) close as a one-time documented audit, (b) publish a
   checklist skill, (c) add an automated regression test wired into `tests/test-runner.html`.
3. Mid-thread scope creep: two turns asked for an unrelated directory restructuring (moving all JS,
   then JS+CSS+HTML, into `js/`/`css/`/subfolders). Per `CLAUDE.md`'s "missed functionality becomes
   a NEW issue" rule, this was flagged as out of scope for #340 and not implemented here — the human
   confirmed they'll open a separate issue for it.
4. A `review`-triggered comment asked to close with Option (a), but used the literal `review`
   trigger word. Per `docs/knowledge-asset/published/gate-trigger-vs-intent-mismatch.md`, the close
   action was held (literal trigger wins) rather than silently executed.
5. `@claude approved ยืนยันเลือก Option (c)` — human confirmed **Option (c)** instead of the
   earlier (a): add `tests/reused-js-iife-safety.test.js`, an automated check that fetches every
   app-source `*.js` file and fails if any declares a top-level `const`/`let`/`class` outside an
   IIFE. Test PR waived (approved directly to Code PR). Merged as
   [PR #343](https://github.com/mekhal/aidlc-radio-calico/pull/343).
6. Running the new suite surfaced an unrelated pre-existing bug: `ReferenceError: buildSidebar is
   not defined` across 11 test files using `tests/load-album-promo.js`. Root cause: issue #256
   moved `buildSidebar()`/`buildThemeToggle()`/`buildLanguageToggle()` out of `album-promo.js` into
   `sidebar/sidebar.js`, but `tests/load-album-promo.js` was never updated to fetch+inject
   `sidebar/sidebar.js` before `album-promo.js` — a call-site missed by that extraction's own
   audit. Fixed in [PR #350](https://github.com/mekhal/aidlc-radio-calico/pull/350) (step-7 rework
   on this issue, not a new loop) by adding the missing `loadScript(... sidebar/sidebar.js)` call.
7. `@claude close` — human closed the issue while noting a bug may still remain ("ทั้งที่ยังบัค") and
   that they will open a **new issue themselves** to track/fix it rather than continuing this loop.
   No further investigation of that remaining bug was performed as part of this close (per the
   human's own instruction to close and re-open separately).

## Outcome

- Standing regression check for reused-JS IIFE-safety: **implemented** (`tests/reused-js-iife-safety.test.js`,
  PR #343, merged).
- Pre-existing `buildSidebar` loader bug surfaced by that check: **fixed** (PR #350, merged).
- Directory restructuring (`js/`/`css/` reorg): **out of scope**, deferred to a new issue the human
  will open separately.
- Any bug the human still observed after PR #350 merged: **not further investigated** in this
  close — human will open a new issue.

## Human decision scores (issue #340 close comment)

- Instruction Fidelity (coding): 3/5 — "ให้กลางๆ เพราะปรับโครงสร้าง" (middle score; scope shifted
  mid-thread from a pure audit re-run to picking/implementing Option (c) and a follow-up fix).
- Result Satisfaction: 3/5 — "กลางๆ เหมือนกัน เพราะยังไม่เห็นความชัดเจน" (middle score; outcome not
  yet fully clear/verified by the human).

See `ai-review-evals/2026-08-13_1548_issue-340_reused-js-iife-audit-close.md` for the full
evaluation record.
