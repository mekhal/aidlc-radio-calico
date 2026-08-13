# AI Review Evaluation

## Metadata

| Field | Value |
|-------|-------|
| Issue | #340 |
| PR | #343, #350 |
| Date | 2026-08-13 |
| Agent | Claude |
| Model | Claude (claude-sonnet-5) |
| Reviewer | mekhal |

---

## Task

Re-run the reused-JS top-level-`const`/`let`/`class`-outside-IIFE audit (originally from #330's
fix) against the current `develop` tip, and decide how to make it a standing check instead of a
one-off manual audit.

---

## Original User Request

"Follow-up ticket requested at the close of #330 ('please create a new task for update other reuse
JS')." Later mid-thread: two turns asking for an unrelated JS/CSS/HTML directory restructuring
(deflected as out of scope, per `CLAUDE.md`), then a `review`-trigger/`close`-intent mismatch
(held per skill), then explicit confirmation of Option (c) and a step-7 rework request to fix a
bug the new check surfaced.

---

## AI Decision

Suggested Keywords:

- standing-regression-check
- test-loader-call-site-gap
- scope-deflection

Chose to present three standing-check options (audit doc, published skill, automated test) rather
than picking one; implemented Option (c) once the human confirmed it (automated
`tests/reused-js-iife-safety.test.js` wired into `tests/test-runner.html`); when that check
surfaced an unrelated pre-existing `buildSidebar` loader bug (from issue #256's extraction missing
`tests/load-album-promo.js` as a call site), fixed it as step-7 rework on the same issue rather than
opening a new one, per the human's explicit "fix it in this loop" instruction. Deflected two
scope-creep asks (directory restructuring) to a separate issue per `CLAUDE.md`'s scope rule,
without implementing them.

---

## Decision Type

Suggested Keywords:

- introducing additional improvements

The literal ask was "re-run the audit and make it standing" — implementing Option (c) added new
permanent test infrastructure (not just a one-time audit or a doc), which is a step beyond a pure
re-run, though it was proposed as an explicit option and confirmed by the human before being built.

---

## Risk Level

Default

```
Medium
```

(Human may change later.)

---

## Instruction Fidelity (0–5)

- 3 — human-provided score ("coding 3 (ให้กลางๆ เพราะปรับโครงสร้าง)")

---

## Result Satisfaction (0–5)

- 3 — human-provided score ("satisfied 3 กลางๆ เหมือนกัน เพราะยังไม่เห็นความชัดเจน")

---

## Human Decision *(Optional)*

- Close issue #340 despite a bug the human believes may still remain post-PR #350; human will open
  a new issue themselves to track/fix it rather than continuing this loop.

---

## Review Notes *(Optional)*

- Scope shifted several times within one thread (audit re-run → JS-only directory move → JS+CSS+HTML
  directory move → back to the original Option (c) audit ask). The final implemented scope matches
  the issue's original intent; the restructuring detours were correctly deflected but added
  thread noise, which may explain the middle scores.
- The `buildSidebar` bug the new regression check surfaced (and PR #350 fixed) was a real,
  previously-undetected gap from issue #256's extraction — evidence the standing check has value
  beyond the specific IIFE bug it was built to catch.

---

## Future Policy *(Optional)*

-

---

## Lessons Learned *(Optional)*

- Test-loader files (`tests/load-*.js`) that fetch+inject dependencies by filename are a call-site
  category that a plain "grep for the identifier" extraction audit can miss, since the loader
  doesn't reference the moved function by name — it just needs to inject the file that now defines
  it, in the right order. See the proposed skill update below.
