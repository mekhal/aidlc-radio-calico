# Decision: Issue #205 closed at Instruction Fidelity 4 / Result Satisfaction 4; dark-theme readability bug split into new issue #294

**Issue:** [#205](https://github.com/mekhal/aidlc-radio-calico/issues/205)
**PR:** [#206](https://github.com/mekhal/aidlc-radio-calico/pull/206), [#207](https://github.com/mekhal/aidlc-radio-calico/pull/207), [#282](https://github.com/mekhal/aidlc-radio-calico/pull/282), [#283](https://github.com/mekhal/aidlc-radio-calico/pull/283), [#284](https://github.com/mekhal/aidlc-radio-calico/pull/284), [#286](https://github.com/mekhal/aidlc-radio-calico/pull/286) (all merged)
**New issue split out:** [#294](https://github.com/mekhal/aidlc-radio-calico/issues/294) — dark-theme readability bug
**Decided by:** @mekhal, 2026-08-06

## Decision

1. **Scores given directly at close:** Instruction Fidelity 4, Result Satisfaction 4 — not 5/5, "เพราะยังเจอบัคเหมือนกัน" ("because [I] still found bugs the same way"). Recorded as-is per `CLAUDE.md`'s rule that the agent never self-scores.
2. **Dark-theme readability problem split into a new issue (#294)**, not reopened inside #205's loop, per `CLAUDE.md`'s "missed functionality becomes a NEW issue" rule — the request ("ปรับ background ของปุ่ม หรือ card ให้เหมาะกับ dark theme") is a distinct visual/theming bug on top of #205's already-merged AC1–AC5 (persistence + infographic dashboard), not a failure of those AC.
3. **The screenshot's `Uncaught ReferenceError: buildReloadButton is not defined`** — the second symptom in the trigger comment ("coding 4 ยังเจอบัค") — was **not** re-filed as a separate bug. It was root-caused at close time: GitHub Pages serves this repo from the `main` branch (`gh api repos/.../pages` → `source.branch: "main"`), and `main` already carries the exact fix from PR #286/#287 (`buildReloadButton` restored, `renderDashboardContent(container, report, onReload)` call site corrected — confirmed present in `origin/main`'s current `tests/test-report-dashboard.js`). The screenshot's stack trace references `test-report-dashboard.js:277:15`, which doesn't match current `main`'s line numbers for that call site (line 289) — consistent with the screenshot being a stale cached bundle (browser or CDN) rather than a live regression. Flagged in the close comment as likely explanation, not filed as a new ticket, since there's nothing in the current source to fix.

## Why

Decision 1 follows the same "never grade its own homework" principle already established in the `ai-review-evals` framework — the human's literal scores and stated reason are recorded verbatim rather than the agent inferring or rounding them.

Decision 2 keeps #205's own AC (all merged, confirmed working end-to-end via #207/#282/#283/#284/#286) from being reopened for a problem those AC never claimed to cover — AC2's "same theme as `index.html`" was about chrome/layout parity, not dark-theme contrast auditing of the dashboard's own pass/fail styling, which reuses `--chloe-mint`/`--chloe-pink` in a way the shared token set never anticipated (see #294's root-cause section for the exact CSS rules).

Decision 3 avoids filing a duplicate bug ticket for something that isn't actually broken in the shipped code — re-fixing already-correct `main` source in response to a stale-cache symptom would have been wasted work, and doing so silently (without explaining the cache theory) would have left the discrepancy between "code is fixed" and "screenshot shows it broken" unresolved for the next reader of this issue.

## Impact

- Issue #205 stays closed at its originally-approved AC1–AC5 scope; no further code changes made in this close turn.
- New issue [#294](https://github.com/mekhal/aidlc-radio-calico/issues/294) tracks the dark-theme contrast bug (button/list-item/modal backgrounds using theme-invariant `--chloe-mint`/`--chloe-pink` tokens against theme-variant `--chloe-ink` text), with the exact CSS rules and a root-cause already identified for whoever starts that ticket's step 2.
- No fix applied for the `ReferenceError` screenshot — root-caused as a likely stale-cache artifact against already-correct `main` source, not a code defect.
