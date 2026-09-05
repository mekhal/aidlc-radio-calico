/**
 * Issue #506 ("contact form ไม่เข้ากับ theme"): `.chloe-contact-form`
 * hardcoded a literal `#ffffff` background (contact/contact.css, from issue
 * #420's original AC5) instead of the page's `--chloe-*` theme tokens. Its
 * labels/input text already inherit `--chloe-ink` from body (album-promo.css),
 * which flips to a light cream color under `[data-chloe-theme="dark"]`
 * (shared/tokens.css) — rendered on the fixed-white card, that's nearly
 * unreadable, the same hardcoded-background-vs-token-text bug class as
 * `docs/knowledge-asset/published/theme-token-background-audit.md` (from
 * issue #294). Step-3 decision (2026-08-25, "@claude approved... เน้นแก้เรื่อง
 * Theme Token, สี, Font และ Contrast"): layout stays as-is; fix is
 * background/text tokens (AC1/AC2), input border/focus brand palette (AC3),
 * and typography (AC4) only.
 *
 * Fix reuses the `--chloe-sage`/`--chloe-ink` pair already proven to flip
 * correctly (same pair About's table/list-group cards use — see
 * tests/about/about-standards-theme.test.js /
 * tests/about/about-references-theme.test.js), and the existing
 * `--chloe-sans` (Montserrat/Open Sans) token already used site-wide for
 * chrome/UI text (shared/tokens.css) for labels/the submit button, so no new
 * tokens are introduced.
 *
 * Asserted against the CSS source itself, not computed styles — same
 * rationale and pattern as tests/about/about-standards-theme.test.js (this
 * suite runs inside tests/test-runner.html, which never links
 * contact/contact.css).
 *
 * Written before contact/contact.css's fix lands, per TDD — fails until this
 * issue's Code PR (step 6) updates it.
 */
(function () {
  "use strict";

  const { describe, it, expect } = window.TestHarness;

  async function readContactCss() {
    const response = await fetch(window.__CONTACT_CSS_PATH__ || "../contact/contact.css");
    if (!response.ok) {
      throw new Error(`Expected to fetch contact/contact.css, got HTTP ${response.status}`);
    }
    return response.text();
  }

  function extractRule(cssText, selector) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = cssText.match(new RegExp(escaped + "\\s*\\{([^}]*)\\}"));
    if (!match) {
      throw new Error(`Expected to find a "${selector}" rule in contact/contact.css`);
    }
    return match[1];
  }

  describe(".chloe-contact-form theme tokens (issue #506)", () => {
    it("styles the card with the --chloe-sage/--chloe-ink token pair instead of a hardcoded #ffffff background (AC1)", async () => {
      const css = await readContactCss();
      const formRule = extractRule(css, ".chloe-contact-form");

      expect(formRule.includes("var(--chloe-sage)")).toBeTruthy();
      expect(formRule.includes("var(--chloe-ink)")).toBeTruthy();
      expect(formRule.includes("#ffffff")).toBeFalsy();
    });

    it("styles the Name/Email/Message labels with --chloe-ink text and the site's --chloe-sans font stack (issue #546)", async () => {
      const css = await readContactCss();
      const labelRule = extractRule(css, ".chloe-contact-form .form-label");

      // A further #546 follow-up (see contact.css's header comment) reverted
      // the field labels from --chloe-mint-deep back to --chloe-ink — only
      // the input/textarea border stays on --chloe-mint-deep (covered by the
      // next test below). This assertion was left stale after that revert
      // (issue #599); the test's own title already said --chloe-ink.
      expect(labelRule.includes("var(--chloe-ink)")).toBeTruthy();
      expect(labelRule.includes("var(--chloe-sans)")).toBeTruthy();
    });

    it("styles the input/textarea borders with the --chloe-mint-deep brand token instead of Bootstrap defaults (issue #546)", async () => {
      const css = await readContactCss();
      const controlRule = extractRule(css, ".chloe-contact-form .form-control");

      expect(controlRule.includes("var(--chloe-mint-deep)")).toBeTruthy();
    });

    it("styles the input/textarea focus state with --chloe-mint-deep border and --chloe-pink focus ring (issue #546)", async () => {
      const css = await readContactCss();
      const focusRule = extractRule(css, ".chloe-contact-form .form-control:focus");

      expect(focusRule.includes("var(--chloe-mint-deep)")).toBeTruthy();
      expect(focusRule.includes("var(--chloe-pink)")).toBeTruthy();
    });

    it("styles the submit button with the site's --chloe-sans font stack instead of Bootstrap's default (AC4)", async () => {
      const css = await readContactCss();
      const submitRule = extractRule(css, ".chloe-contact-form__submit");

      expect(submitRule.includes("var(--chloe-sans)")).toBeTruthy();
    });
  });
})();
