/**
 * Issue #254 (Ticket 2 of #245, logo/logo.js): buildLogo() extracted out of
 * album-promo.js's buildHeader() (album-promo.js:222-264) — returns just the
 * wordmark `<span>`, no `<header>`/nav, no `state` param, since the current
 * markup (album-promo.js:226-236) reads nothing off state. AC1. The no-arg
 * signature is the "(a)" interpretation @mekhal confirmed on issue #254
 * (2026-08-03), over "(b)" `buildLogo(state)` kept unused for signature
 * consistency with menu/sidebar/footer.
 *
 * Loaded standalone via SharedModuleTestHelpers.loadSharedModule — reused
 * as-is from issue #253's tests/shared/load-shared-module.js rather than
 * duplicating it under tests/logo/, since that loader is a generic
 * fetch-and-inject-one-script helper with no shared/-specific logic
 * (reuse-first).
 *
 * Written before logo/logo.js exists, per TDD — fails until this ticket's
 * Code PR (step 6) creates it.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  async function loadLogoModule() {
    await loadSharedModule(window.__ALBUM_PROMO_LOGO_JS_PATH__ || "../logo/logo.js");
  }

  describe("logo/logo.js (issue #254, Ticket 2)", () => {
    it("buildLogo() returns a span.chloe-wordmark with 'Radio' text, the logo img, then 'Calico' text", async () => {
      await loadLogoModule();

      const wordmark = window.buildLogo();

      expect(wordmark.tagName).toBe("SPAN");
      expect(wordmark.className).toBe("chloe-wordmark");
      expect(wordmark.childNodes.length).toBe(3);

      expect(wordmark.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
      expect(wordmark.childNodes[0].textContent).toBe("Radio");

      const logo = wordmark.childNodes[1];
      expect(logo.tagName).toBe("IMG");
      expect(logo.className).toBe("chloe-wordmark__logo");
      expect(logo.getAttribute("src")).toBe("RadioCalicoStyle/RadioCalicoLogoTM.png");
      expect(logo.getAttribute("alt")).toBe("Radio Calico logo");

      expect(wordmark.childNodes[2].nodeType).toBe(Node.TEXT_NODE);
      expect(wordmark.childNodes[2].textContent).toBe("Calico");
    });

    it("buildLogo() takes no arguments and returns an independent node on each call", async () => {
      await loadLogoModule();

      expect(window.buildLogo.length).toBe(0);

      const first = window.buildLogo();
      const second = window.buildLogo();

      expect(first === second).toBeFalsy();
      expect(second.className).toBe("chloe-wordmark");
    });
  });
})();
