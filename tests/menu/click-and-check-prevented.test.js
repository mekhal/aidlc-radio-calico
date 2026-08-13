/**
 * Issue #354 (root cause #1): dedicated coverage for the shared
 * clickAndCheckPrevented() helper (tests/menu/click-and-check-prevented.js).
 * Uses a real, same-document "#..." hash href rather than an external URL —
 * hash navigation is easy to detect (window.location.hash changes) and to
 * revert, unlike a real page navigation, so this suite never risks steering
 * test-runner.html away from itself even if the helper regresses.
 *
 * The second test below is the actual regression check for issue #354: it
 * fails on the pre-fix helper (the one duplicated in menu-active-state.test.js
 * / menu-case-study-link.test.js before this Test PR) because that version
 * never called preventDefault() itself, so an unprevented click's default
 * action ran and window.location.hash changed.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { clickAndCheckPrevented } = window.MenuTestHelpers;

  describe("tests/menu/click-and-check-prevented.js (issue #354)", () => {
    it("returns true and does not navigate when the link's own click handler calls preventDefault", () => {
      const originalHash = window.location.hash;
      const link = document.createElement("a");
      link.href = "#click-and-check-prevented-test-prevented";
      link.addEventListener("click", (event) => event.preventDefault());

      try {
        expect(clickAndCheckPrevented(link)).toBe(true);
        expect(window.location.hash).toBe(originalHash);
      } finally {
        window.location.hash = originalHash;
      }
    });

    it("returns false but still suppresses navigation when the link's own click handler does not call preventDefault", () => {
      const originalHash = window.location.hash;
      const link = document.createElement("a");
      link.href = "#click-and-check-prevented-test-not-prevented";

      try {
        expect(clickAndCheckPrevented(link)).toBe(false);
        expect(window.location.hash).toBe(originalHash);
      } finally {
        window.location.hash = originalHash;
      }
    });
  });
})();
