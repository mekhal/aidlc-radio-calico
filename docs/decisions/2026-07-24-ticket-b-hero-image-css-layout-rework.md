# Decision: Ticket B hero image — box/center CSS rework, done in-issue (no new issue)

**Issue:** [#156](https://github.com/mekhal/aidlc-radio-calico/issues/156)
**Decided by:** @mekhal, 2026-07-24

## Decision

Resolves the "open item at close" flagged in
`docs/decisions/2026-07-24-ticket-b-hero-dom-construction-and-image-swap.md` (Ticket B's first
close pass): the `radio-calico.com`-style CSS/layout rework proposed in review (boxed image,
capped `max-width`, `clip-path` silhouette removed, centered in the column, mobile breakpoint) was
approved and implemented as **step-7 rework**, not spun into a new issue.

1. The human explicitly declined a new issue ("ไม่ต้องสร้าง issue ใหม่ ทำใน issue นี้เลย") even
   though a new issue was offered as an option at the previous close. This walks back Ticket B's own
   AC2 (approved earlier in the same issue), so continuing on #156 was judged in-scope even though
   the ticket had already gone through one `@claude close`.
2. Implemented exactly as previously proposed in the unanswered review comment:
   `.chloe-hero__portrait` capped at `max-width: 380px` (`240px` at `≤575.98px`), `height: auto`,
   `border-radius`, `box-shadow`, `clip-path: none`; `.chloe-hero__portrait-col` centers the image
   with padding instead of flush full-bleed.
3. Left-vs-center alignment was never picked explicitly in the approval — defaulted to
   **centered**, the option floated as the fallback default in the original review comment.
4. Shipped via PR [#180](https://github.com/mekhal/aidlc-radio-calico/pull/180) (merged) against
   `develop`, as rework on #156 rather than a new Code PR cycle.

## Why

The human weighed in directly on the open item flagged at the prior close rather than letting it
lapse, and explicitly chose "same issue" over "new issue" — consistent with `CLAUDE.md`'s scope
rule that missed functionality only becomes a new issue when the human doesn't fold it back into
the current one themselves.

## Impact

- `album-promo.css`: `.chloe-hero__portrait-col`, `.chloe-hero__portrait` reworked; new
  `@media (max-width: 575.98px)` rule added.
- `album-promo.js`: unchanged (`buildHero()` already emitted the classes this CSS targets).
- PR: [#180](https://github.com/mekhal/aidlc-radio-calico/pull/180) (merged).
- Supersedes the full-bleed/`clip-path` silhouette treatment from AC2 as originally approved —
  center-aligned, boxed image is now the shipped look. No explicit left/center call was made by the
  human; center was an assumed default.
