# Decision: Ticket A — album-promo becomes JS-rendered, AC1/AC3/AC4 amendments, toggles added

**Issue:** [#155](https://github.com/mekhal/aidlc-radio-calico/issues/155) (Ticket A of parent story [#150](https://github.com/mekhal/aidlc-radio-calico/issues/150))
**Decided by:** @mekhal, 2026-07-24 (01:59 through 07:51)

## Decision

Ticket A's originally-approved plan (static `album-promo.html` + `album-promo.css`, Test PR
waived as "static markup/CSS only") was revised through several review rounds into:

1. **Brand text finalized as "Radio Calico"**, not the placeholder "Chloe" used in the first pass —
   applied to the header wordmark, the `<title>`, and the footer copyright line across three
   separate small fixes (PR [#160](https://github.com/mekhal/aidlc-radio-calico/pull/160) shipped
   with "Chloe"; corrected via [#162](https://github.com/mekhal/aidlc-radio-calico/pull/162) and
   folded into [#164](https://github.com/mekhal/aidlc-radio-calico/pull/164)).
2. **Declined, then reframed:** a request to also sync this branding into `index.html`/`app.js`
   was declined outright (2026-07-24T03:19) as a direct conflict with this ticket's own AC6 and a
   much larger, differently-scoped change (redesigning the live, i18n/theme-aware streaming app's
   header/footer). The human's next round (03:27) reframed the ask to keep `index.html`/`app.js`/
   `styles.css` untouched and instead **adapt `album-promo.js` to reuse `app.js`'s DOM-rendering
   pattern** (`document.createElement`-based construction) — this resolved the conflict and was
   implemented in [#164](https://github.com/mekhal/aidlc-radio-calico/pull/164).
3. **Footer link set — full mirror, not social-only.** When asked to mirror `app.js`'s footer
   links into the sidebar, the agent flagged that `app.js`'s footer includes CI/build artifacts
   (Test Report, Lint Report, Security Scan Report) that don't obviously belong on a marketing
   landing page, and offered a choice. The human chose the full set ("เพื่อแสดงความเป็น Production
   Grade") over social-links-only — implemented in #164, linking Test Report directly to
   `tests/test-runner.html` rather than reusing `app.js`'s in-page modal (that modal is wired to
   `app.js`'s own test-fixture system, which this page doesn't load).
4. **Test-PR waiver reconfirmed despite the page becoming dynamic.** The original waiver
   ("static markup/CSS only") was flagged as weakening once `album-promo.js` gained real
   interactive state (theme toggle, language switch, both with `localStorage` persistence) — the
   human explicitly kept the waiver rather than requesting AC-scoped tests.
5. **AC3 restyled, not replaced.** The fixed-left-rail requirement was kept; the icon/control
   group inside it was vertically centered (`justify-content: center`) and the sidebar background
   made transparent, per the human's clarified choice (option "1a") over relocating the sidebar to
   the viewport center (which would have replaced AC3 outright).
6. **AC4 revised — no longer "no separate footer."** The original AC4 ("the sidebar fully absorbs
   the footer") was explicitly reversed: the copyright line was pulled out of `.chloe-sidebar` into
   a new, separate `<footer>` element, bottom-centered on the page, with a disclaimer line above
   it. The human confirmed this was an intentional AC change, not a styling request on top of the
   existing structure.
7. **AC1 exception — brand Mint (`#D8F2D5`) scoped to the logo lockup only.** The wordmark markup
   was restructured to `Radio` + `<img src="RadioCalicoStyle/RadioCalicoLogoTM.png">` + `Calico`,
   colored in the site's Mint brand color rather than AC1's pastel pink — but only for that lockup;
   nav links, icons, and footer text keep the pastel pink AC1 requires elsewhere. This color was
   later made theme-aware (`var(--chloe-ink)` in light mode, `var(--chloe-mint)` in dark mode) after
   the human reported the original fixed-mint value had poor contrast against the light-mode
   background.
8. **Theme + language toggles added — reversing an earlier same-thread decision.** Two review
   rounds prior, the human had explicitly declined adding language/theme toggles to `album-promo`
   ("ไม่ต้องใส่ Language/Theme Toggles"). This request reversed that: a functional dark-theme toggle
   and an EN/TH `<select>` were added into the sidebar's icon group, using `localStorage` keys
   distinct from `app.js`'s own key so the two pages' stored preferences can't cross-contaminate.
   Dark was later made the page's default theme (light only when explicitly stored).
9. **Outer sidebar border removed**, keeping the internal divider between the icon-link group and
   the theme/language controls.

## Why

Each amendment was raised by the human across iterative `@claude review` → `@claude approved`
rounds on 2026-07-24 (01:59–07:51 UTC). Where a request conflicted with a locked AC or an earlier
decision in the same thread, the agent paused and asked before implementing (per `CLAUDE.md`'s
"ask before over-implementing" rule) rather than silently picking an interpretation — this
happened for the footer-link-set scope, the AC3/AC4/AC1 conflicts, and the toggle reversal. All
were confirmed explicitly before any code changed.

## Impact

- `album-promo.html` / `album-promo.js` / `album-promo.css`: see PRs
  [#160](https://github.com/mekhal/aidlc-radio-calico/pull/160),
  [#162](https://github.com/mekhal/aidlc-radio-calico/pull/162),
  [#164](https://github.com/mekhal/aidlc-radio-calico/pull/164),
  [#166](https://github.com/mekhal/aidlc-radio-calico/pull/166),
  [#169](https://github.com/mekhal/aidlc-radio-calico/pull/169),
  [#171](https://github.com/mekhal/aidlc-radio-calico/pull/171) (all merged into `develop`).
- `index.html` / `app.js` / `styles.css` remained untouched by all of the above — see the separate
  decision doc `2026-07-24-ac6-cancelled-album-promo-becomes-homepage.md` for the later, larger
  change that did touch `index.html`.
- Issue #155's AC1, AC3, AC4 text is now superseded by this doc for anyone reading the issue after
  the fact — the literal AC wording was not edited retroactively.
