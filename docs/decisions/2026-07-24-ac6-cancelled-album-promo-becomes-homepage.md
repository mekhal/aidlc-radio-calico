# Decision: AC6 cancelled — `index.html` now serves the album-promo page, streaming app orphaned

**Issue:** [#155](https://github.com/mekhal/aidlc-radio-calico/issues/155) (Ticket A of parent story [#150](https://github.com/mekhal/aidlc-radio-calico/issues/150))
**Decided by:** @mekhal, 2026-07-24 (07:59–08:16)

## Decision

Issue #155's AC6 ("`album-promo.html` + its own `album-promo.css`/`album-promo.js` only — no
changes to `index.html`, `app.js`, or `styles.css`") is **cancelled**. `index.html` now loads
`album-promo.css`/`album-promo.js` instead of `styles.css`/`app.js` — visiting `/` shows the
album-promo landing page (header, fixed sidebar, bottom footer, dark-theme default) instead of the
live HLS radio-streaming app.

**Direct consequence:** the streaming app (`app.js`, previously mounted at `/`) is no longer
linked from any page on the site. `app.js`, `styles.css`, and `i18n/*.json` are left in the repo
untouched but are now orphaned — nothing loads or references them. `album-promo.html` is also left
in place, now a duplicate of `index.html`'s content at a second URL.

## Why

The human first asked (2026-07-24T07:59, trigger `approved`) to "เปลี่ยน album-promo.html ให้เป็น
หน้า index.html ทับของเดิม" (make `album-promo.html` become `index.html`, overwriting the
original). The agent declined to act on the bare `approved` trigger because there was no pending
plan on the table matching that scope — this was a brand-new, unplanned, AC6-reversing request,
not an approval of anything already discussed. Per `CLAUDE.md`'s "ask when in doubt" rule, the
agent laid out three concrete interpretations (keep both pages with a URL swap; literally overwrite
`index.html`, dropping the streaming app entirely; or have `album-promo.html` link out to the
existing player) and asked which was intended, given how large and hard-to-reverse the literal
reading would be.

The human's next reply (08:16) picked option **(b)** explicitly and additionally cancelled AC6 by
name: "ยกเลิก AC 6 ออก แล้วเปลี่ยนไฟล์นี้เป็นหน้าหลัก" (cancel AC6, make this file the homepage).
With both the option and the AC cancellation now explicit, the agent implemented it in a single
pass ([#172](https://github.com/mekhal/aidlc-radio-calico/pull/172)).

## Impact

- `index.html`: content replaced to mount `album-promo.js`/`album-promo.css` instead of
  `app.js`/`styles.css`. See [#172](https://github.com/mekhal/aidlc-radio-calico/pull/172),
  merged into `develop`.
- `app.js`, `styles.css`, `i18n/en.json`, `i18n/th.json`: **not deleted**, but orphaned — no page
  references them anymore. The existing test suite (`tests/`) is unaffected, since it loads
  `app.js` directly via `fetch()` into an isolated fixture root rather than through `index.html`.
- `album-promo.html`: left in place, now duplicate content reachable at a second URL.
- **Open, not yet decided:** what to do with the now-orphaned `app.js`/`styles.css`/`i18n/` and the
  duplicate `album-promo.html` — delete them, move the streaming player to a new URL (e.g.
  `player.html`), or leave them as dead code. This was flagged by the agent at implementation time
  and intentionally left as a follow-up rather than decided unilaterally.
- Issue #155's AC6 text is now superseded by this doc for anyone reading the issue after the fact —
  the literal AC wording was not edited retroactively.
