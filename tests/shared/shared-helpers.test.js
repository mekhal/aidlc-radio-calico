/**
 * Issue #253 (Ticket 1): shared/helpers.js — createIconLink() extracted out
 * of album-promo.js unchanged, so tickets 2-5 (logo/menu/sidebar/footer) can
 * reuse the same icon-link builder. AC1.
 *
 * Written before shared/helpers.js exists, per TDD — fails until Ticket 1's
 * Code PR (step 6) creates it.
 *
 * Issue #508 (Ticket 1 of the "What's this" bilingual story, part of #505),
 * AC1: resolveBilingualField(field, lang) moves out of about/about.js
 * (previously a private helper there, used by buildProductionStandardsTable()/
 * buildReferencesList()) into this shared module, following the same
 * extract-and-reuse precedent as createIconLink() above — a shared-extraction
 * call-site audit (docs/knowledge-asset/published/shared-extraction-call-site-audit.md)
 * confirmed about.js is the only file referencing it, so no other call site
 * needs an accessor/export change. about.js is updated to call the shared
 * global version instead of its own private copy, with no behavior change —
 * tests/about/*.test.js keep passing unmodified since they each assert
 * against about.js's own local `resolve()` test helper, not against
 * window.resolveBilingualField directly.
 *
 * Written before shared/helpers.js exports resolveBilingualField, per TDD —
 * fails until this issue's Code PR (step 6) adds it.
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

    it("resolveBilingualField(field, lang) returns a plain string unchanged, regardless of lang (fixed proper-noun/term-of-art fields)", async () => {
      await loadSharedHelpers();

      expect(window.resolveBilingualField("Mega-Linter", "en")).toBe("Mega-Linter");
      expect(window.resolveBilingualField("Mega-Linter", "th")).toBe("Mega-Linter");
    });

    it("resolveBilingualField(field, lang) resolves the matching language value from a { en, th } object", async () => {
      await loadSharedHelpers();

      const field = { en: "Production-grade Standards", th: "มาตรฐานระดับโปรดักชัน" };

      expect(window.resolveBilingualField(field, "en")).toBe("Production-grade Standards");
      expect(window.resolveBilingualField(field, "th")).toBe("มาตรฐานระดับโปรดักชัน");
    });
  });
})();
