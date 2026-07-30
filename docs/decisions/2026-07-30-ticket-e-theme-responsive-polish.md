# Decision: Ticket E theme & responsive polish — AC revisions, index.html as primary target, mobile hero-centering fix

**Issue:** [#159](https://github.com/mekhal/aidlc-radio-calico/issues/159)
**Decided by:** @mekhal, 2026-07-29 through 2026-07-30

## Decision

1. **AC2 narrowed — preserve the existing serif/sans-serif split, not "serif everywhere."**
   The issue's original AC2 read as forcing a serif font across header, hero, player card, and
   recently-played list. Tickets B/C/D had already established a deliberate split (branding/nav in
   Playfair Display/Cormorant Garamond serif; data-dense readouts — Now Playing lines, player
   controls — in `--chloe-sans`/Montserrat for legibility). Flagged before implementing; human
   confirmed keeping the split. Ticket E's job became verifying/finishing the split, not converting
   everything to serif.
2. **AC3 narrowed — dropped the recently-played-list responsive check.** `.chloe-recently-played`
   is `display: none` (hidden per the 2026-07-29 decision on #158,
   `docs/decisions/2026-07-29-ticket-d-hide-recently-played-and-cover-art-flicker-fix.md`), so
   there was nothing rendered to verify. That check moves to #209's Modal redesign instead.
3. **AC4 changed twice — final target is `index.html`, not `album-promo.html`.** Per #157's
   decision that `index.html` is the file actually deployed/served (cross-referenced onto this
   issue before work started), the human first kept AC4 as "no changes to `index.html`," then
   revised it again to make `index.html` the primary edit target and mark `album-promo.html` as
   deprecated instead. Since the two files were already near-identical (verified: only differed in
   two HTML comment lines) and both load the same `album-promo.css`/`.js`, this required no markup
   reconciliation — `album-promo.html` got a top-of-file deprecation banner comment (not deleted),
   per the human's confirmed preference for the minimal reversible option.
4. **Mobile hero-image centering — root cause and fix, in two rounds.** Round 1 (PR #216) added
   `justify-content: center` for both hero columns under `max-width: 991.98px`, based on
   CSS/breakpoint reading alone (no browser available in this environment). A follow-up real-device
   report (XPath-level detail from the human) showed the image was still off-center. Round 2
   (PR #218) found the deeper cause: `.chloe-hero__portrait-col`/`.chloe-hero__player-col` are flex
   items of a Bootstrap `.row`, and `col-lg-6` only applies at `>=992px` — below that the columns
   had no Bootstrap-applied width and shrank to content size, so `justify-content: center` had
   nothing full-width to center within. Fixed with `width: 100%` on both columns inside the existing
   `991.98px` breakpoint, plus a `margin: 0 auto` backstop on the portrait image. Breakpoint stayed
   at `991.98px`/`lg` (992px) per the human's explicit confirmation, to avoid regressing the
   tablet-width fix already shipped in round 1.
5. **Volume-slider mobile overflow — root cause diagnosed, fix proposed, left unimplemented at
   close.** `.chloe-player-controls__volume input[type="range"]` has no `min-width: 0` and no
   mobile media query at all, so on narrow phones its browser-default intrinsic width (~129px)
   pushes the player-controls row past the card edge. A fix was proposed (`min-width: 0` +
   `max-width: 100%` scoped to a mobile breakpoint) but never approved for implementation before the
   close comment landed — the human chose to close Ticket E with this bug open and have it tracked
   as a separate issue instead of extending this ticket further.

## Why

(1)-(2): matching AC wording to design decisions already locked in earlier, already-merged
sibling tickets was judged more valuable than the literal pre-existing AC text, per
`docs/decisions/2026-07-20-review-before-over-implementing.md` — confirmed explicitly at each
step rather than assumed. (3): `index.html` is the file GitHub Pages actually serves; editing
`album-promo.html` further would have kept fixing a file nobody loads. (4): a real device report
directly contradicted a CSS-reading-only verification, and the second round traced the fix to the
actual flex-sizing mechanism rather than re-guessing at the symptom. (5): this repo's process
treats "missed functionality becomes a new issue" as the default when a ticket is closing with
known follow-up work rather than open-endedly extending its scope — the human made that call
explicitly in the close comment.

## Impact

- `album-promo.css`: hero column/portrait centering rules (`.chloe-hero__portrait-col`,
  `.chloe-hero__player-col`, `.chloe-hero__portrait`) under the `991.98px` breakpoint.
- `album-promo.html`: top-of-file deprecation banner comment; no further markup edits.
- `index.html`: confirmed as the primary target for future theme/responsive edits; no HTML-level
  changes were needed for this ticket since all fixes were CSS-only in `album-promo.css`.
- PRs: [#216](https://github.com/mekhal/aidlc-radio-calico/pull/216) (merged, theme/responsive
  polish + `album-promo.html` deprecation banner),
  [#218](https://github.com/mekhal/aidlc-radio-calico/pull/218) (merged, mobile/tablet hero-image
  centering fix, round 2).

## Open items at close (not decided / deferred)

- **Volume-slider mobile overflow** — root cause diagnosed, fix proposed, not implemented. Filed
  as a new issue per the close comment (see issue link posted on #159's close comment).
- **Real audio playback** and **year/album/quality metadata field wiring** — Ticket D follow-ups,
  confirmed out of Ticket E's scope across multiple review rounds on this issue. Filed as two
  separate new issues at this close, per the plan agreed earlier in this issue's thread.
