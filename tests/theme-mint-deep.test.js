/**
 * Issue #546 ("primary font color token --chloe-pink-deep -> --chloe-mint"):
 * scope was narrowed at step 3 to `color:`-property declarations only
 * (border/background/accent-color declarations on the same selectors stay
 * on --chloe-pink-deep). --chloe-mint itself (#d8f2d5) is ~1.04:1 against
 * --chloe-sage (the page background nearly all of these declarations sit
 * on) — unreadable as text — so a new --chloe-mint-deep (#2f7a52) token
 * was introduced instead, per the theme-token-background-audit skill
 * (check what background a swapped text token actually renders on before
 * assuming the swap is safe).
 *
 * The Test Report Dashboard's failed-stat-tile/fail-row text
 * (tests/test-report-dashboard.css) is excluded from this swap: it already
 * uses --chloe-mint for the *passed* state, and --chloe-pink-deep encodes
 * "failed" there rather than being general brand text. Swapping it too
 * would make passed/failed color-identical and break the existing
 * assertion in tests/test-report-dashboard-dark-theme.test.js (AC3 requires
 * all existing tests keep passing).
 *
 * Asserted against the CSS source itself, not computed styles — same
 * pattern as tests/contact/contact-theme.test.js and
 * tests/test-report-dashboard-dark-theme.test.js (this suite runs inside
 * tests/test-runner.html, which never links these page stylesheets).
 *
 * Follow-up (same issue #546, human request "button slider bar" -> mint
 * tone): the volume slider's accent-color (previously excluded from scope
 * as a non-`color:` declaration) also moves to --chloe-mint-deep.
 *
 * Second follow-up (same issue #546, human confirmed the circled elements
 * are the Album Promo page's Play/Pause button and the Contact page's Send
 * button): both buttons' background moves from --chloe-pink-deep to
 * --chloe-mint-deep too.
 *
 * Third follow-up (same issue #546, Contact form input/textarea border +
 * labels moved to --chloe-mint-deep) was partially reverted: the field
 * labels move back to --chloe-ink, per human request. The input/textarea
 * border stays on --chloe-mint-deep.
 */
(function () {
  "use strict";

  const { describe, it, expect } = window.TestHarness;

  async function readCss(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Expected to fetch ${path}, got HTTP ${response.status}`);
    }
    return response.text();
  }

  function extractRule(cssText, selector) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = cssText.match(new RegExp(escaped + "\\s*\\{([^}]*)\\}"));
    if (!match) {
      throw new Error(`Expected to find a "${selector}" rule`);
    }
    return match[1];
  }

  describe("--chloe-mint-deep text token (issue #546)", () => {
    it("defines --chloe-mint-deep: #2f7a52 in shared/tokens.css (AC1)", async () => {
      const css = await readCss("../shared/tokens.css");
      expect(css.includes("--chloe-mint-deep: #2f7a52")).toBeTruthy();
    });

    it("styles the case study category pill and connector text with --chloe-mint-deep, borders unchanged (AC1)", async () => {
      const css = await readCss("../case-study/case-study.css");
      const categoryRule = extractRule(css, ".case-study-card__category");
      expect(categoryRule.includes("color: var(--chloe-mint-deep);")).toBeTruthy();
      expect(categoryRule.includes("var(--chloe-pink-deep)")).toBeTruthy();

      const connectorRule = extractRule(css, ".case-study-card__connector");
      expect(connectorRule.includes("color: var(--chloe-mint-deep);")).toBeTruthy();
    });

    it("styles the nav hover/active text with --chloe-mint-deep (AC1)", async () => {
      const css = await readCss("../menu/menu.css");
      const hoverRule = extractRule(css, ".chloe-nav a:hover");
      expect(hoverRule.includes("var(--chloe-mint-deep)")).toBeTruthy();

      const activeRule = extractRule(css, ".chloe-nav a.chloe-nav-active");
      expect(activeRule.includes("var(--chloe-mint-deep)")).toBeTruthy();
    });

    it("styles the sidebar icon hover text with --chloe-mint-deep (AC1)", async () => {
      const css = await readCss("../sidebar/sidebar.css");
      const hoverRule = extractRule(css, ".chloe-sidebar__icons a:hover");
      expect(hoverRule.includes("var(--chloe-mint-deep)")).toBeTruthy();
    });

    it("styles the now-playing status line, active menu item, and sleep-timer cancel text with --chloe-mint-deep (AC1)", async () => {
      const css = await readCss("../album-promo.css");

      const statusRule = extractRule(css, ".chloe-now-playing__status");
      expect(statusRule.includes("var(--chloe-mint-deep)")).toBeTruthy();

      const activeMenuRule = extractRule(css, ".chloe-player-controls__menu-item.is-active");
      expect(activeMenuRule.includes("border-left-color: var(--chloe-pink-deep);")).toBeTruthy();
      expect(activeMenuRule.includes("color: var(--chloe-mint-deep);")).toBeTruthy();

      const cancelRule = extractRule(css, ".chloe-player-controls__sleep-timer-cancel");
      expect(cancelRule.includes("var(--chloe-mint-deep)")).toBeTruthy();
    });

    it("keeps the Test Report Dashboard's failed-stat text on --chloe-pink-deep, not swapped (AC2/AC3)", async () => {
      const css = await readCss("test-report-dashboard.css");
      const failedRule = extractRule(css, ".report-stat-tile--failed .report-stat-tile__value");
      expect(failedRule.includes("var(--chloe-pink-deep)")).toBeTruthy();
      expect(failedRule.includes("var(--chloe-mint-deep)")).toBeFalsy();
    });

    it("styles the volume slider with --chloe-mint-deep (follow-up)", async () => {
      const css = await readCss("../album-promo.css");

      const volumeRule = extractRule(css, '.chloe-player-controls__volume input[type="range"]');
      expect(volumeRule.includes("accent-color: var(--chloe-mint-deep);")).toBeTruthy();
      expect(volumeRule.includes("chloe-pink-deep")).toBeFalsy();
    });

    it("styles the Play/Pause button background with --chloe-mint-deep (follow-up)", async () => {
      const css = await readCss("../album-promo.css");
      const playRule = extractRule(css, ".chloe-player-controls__play");
      expect(playRule.includes("background: var(--chloe-mint-deep);")).toBeTruthy();
      expect(playRule.includes("chloe-pink-deep")).toBeFalsy();
    });

    it("styles the Contact page's Send button background with --chloe-mint-deep (follow-up)", async () => {
      const css = await readCss("../contact/contact.css");
      const submitRule = extractRule(css, ".chloe-contact-form__submit");
      expect(submitRule.includes("background-color: var(--chloe-mint-deep);")).toBeTruthy();
      expect(submitRule.includes("chloe-pink-deep")).toBeFalsy();
    });

    it("styles the Contact form's input/textarea border with --chloe-mint-deep, labels stay --chloe-ink (follow-up)", async () => {
      const css = await readCss("../contact/contact.css");

      const controlRule = extractRule(css, ".chloe-contact-form .form-control");
      expect(controlRule.includes("var(--chloe-mint-deep)")).toBeTruthy();
      expect(controlRule.includes("chloe-pink-deep")).toBeFalsy();

      const labelRule = extractRule(css, ".chloe-contact-form .form-label");
      expect(labelRule.includes("var(--chloe-ink)")).toBeTruthy();
      expect(labelRule.includes("chloe-mint-deep")).toBeFalsy();
    });
  });
})();
