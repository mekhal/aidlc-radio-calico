# Decision: `ReactDOM is not defined` root-caused to two issues — unpkg blocked by network, and `index.html`/`album-promo.html` drift

**Issue:** [#157](https://github.com/mekhal/aidlc-radio-calico/issues/157)
**Decided by:** @mekhal, 2026-07-25

## Decision

A reported `ReferenceError: ReactDOM is not defined` in the deployed page turned out to have **two
independent causes**, found and fixed in sequence rather than assumed to be one bug:

1. **`unpkg.com` was blocked by the reporting user's network**, not a code defect — confirmed only
   after asking direct diagnostic questions (browser vs. Node/bundler execution; network reachability)
   rather than guessing a fix from the error text alone. Resolved by switching
   `album-promo.html`'s React 18 / ReactDOM 18 `<script src>` from `unpkg.com` to
   `cdn.jsdelivr.net/npm/...` — the same CDN provider the file already used for Bootstrap (lines
   15-16) — instead of vendoring/self-hosting the files. Self-hosting was evaluated and explicitly
   rejected: it would have added binary files outside the `album-promo.*` scope AC6 already locked,
   and it conflicts with decision #20's literal "CDN `<script>` references only" wording, whereas an
   alternate CDN provider keeps both.
2. **After the CDN swap, the error persisted** because `index.html` — the file GitHub Pages actually
   serves at the site root — is a near-duplicate of `album-promo.html` (both load
   `album-promo.css`/`album-promo.js` into an `#album-promo-root` div, apparently created side-by-side
   since Ticket A) that had **drifted**: the React/ReactDOM `<script>` tags added to `album-promo.html`
   for Ticket C were never mirrored into `index.html`, so the live site had no React runtime loaded at
   all regardless of which CDN was used. Found by comparing the two files directly rather than
   re-checking `album-promo.html` a third time. Fixed by mirroring the same two `<script>` tags into
   `index.html`.

The question of whether `album-promo.html` should keep existing as a second, parallel entry point (or
be removed to prevent this class of drift recurring) was raised but **left open, not decided** — the
human confirmed `index.html` is the file downstream tickets (D, E) should treat as authoritative, but
did not choose between keeping or deleting `album-promo.html`.

## Why

Each diagnostic round changed only what the evidence supported (network-reachability question first,
file comparison second) instead of re-applying the same fix and hoping — `unpkg` was reachable per a
human-run diagnostic script, which correctly ruled out cause 1 as *the whole* explanation and pointed
at a second cause.

## Impact

- `album-promo.html`: CDN provider `unpkg.com` → `cdn.jsdelivr.net` (React/ReactDOM only).
- `index.html`: gained the same React/ReactDOM CDN `<script>` tags `album-promo.html` already had.
- PRs: [#185](https://github.com/mekhal/aidlc-radio-calico/pull/185) (CDN swap, merged),
  [#187](https://github.com/mekhal/aidlc-radio-calico/pull/187) (`index.html` fix, merged).
- Cross-reference: untagged comments left on [#158](https://github.com/mekhal/aidlc-radio-calico/issues/158)
  (Ticket D) and [#159](https://github.com/mekhal/aidlc-radio-calico/issues/159) (Ticket E) noting
  `index.html` is the file actually served and that `unpkg.com`-sourced CDN references elsewhere will
  likely need the same jsDelivr swap.

## Open item at close (not decided)

Whether `album-promo.html` should keep existing as a parallel, easily-drifting duplicate of
`index.html`, or be removed/redirected now that `index.html` is confirmed as the served file. Not
resolved in this thread — flagged for a human decision before Ticket E (#159) or any later ticket
adds more content that would need to be duplicated into both files again.
