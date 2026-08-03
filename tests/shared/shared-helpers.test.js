/**
 * Issue #253 (Ticket 1): shared/helpers.js — createIconLink() extracted out
 * of album-promo.js unchanged, so tickets 2-5 (logo/menu/sidebar/footer) can
 * reuse the same icon-link builder. AC1.
 *
 * Written before shared/helpers.js exists, per TDD — fails until Ticket 1's
 * Code PR (step 6) creates it.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  async function loadSharedHelpers() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_HELPERS_JS_PATH__ || "../shared/helpers.js");
  }

  describe("shared/helpers.js (issue #253, Ticket 1)", () => {
    it("createIconLink() builds an <a> with the given testid/href/label and an aria-hidden <i> icon", async () => {
      await loadSharedHelpers();

      const link = window.createIconLink({
        testid: "sample-link",
        href: "https://example.com/",
        label: "Example",
        icon: "bi-example",
      });

      expect(link.tagName).toBe("A");
      expect(link.dataset.testid).toBe("sample-link");
      expect(link.href).toBe("https://example.com/");
      expect(link.title).toBe("Example");
      expect(link.getAttribute("aria-label")).toBe("Example");
      expect(link.target).toBe("");

      const icon = link.querySelector("i");
      expect(icon.className).toBe("bi bi-example");
      expect(icon.getAttribute("aria-hidden")).toBe("true");
    });

    it("createIconLink() sets target=_blank and rel=noopener when external is true", async () => {
      await loadSharedHelpers();

      const link = window.createIconLink({
        testid: "sample-external-link",
        href: "https://example.com/",
        label: "Example",
        icon: "bi-example",
        external: true,
      });

      expect(link.target).toBe("_blank");
      expect(link.rel).toBe("noopener noreferrer");
    });
  });
})();
