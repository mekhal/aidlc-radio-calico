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
 * Issue #559: buildLogo() now returns an `<a href="https://www.radio-calico.com">`
 * instead of a bare `<span>`, so the logo is clickable everywhere buildLogo()
 * is used (about/contact/whats-this/case-study pages too, not just index.html
 * — it's one shared factory, reuse-first). Opens in a new tab
 * (target="_blank" rel="noopener noreferrer") since radio-calico.com is an
 * external site. `chloe-wordmark` stays on the link itself (no extra wrapper)
 * so existing CSS selectors/layout keep working unchanged. An aria-label
 * is added because the link's accessible name would otherwise just be the
 * "Radio"/"Calico" text nodes plus the img's alt text, which doesn't convey
 * that activating it navigates to the Radio Calico website.
 *
 * Written before logo/logo.js is updated, per TDD — fails until this
 * ticket's Code PR (step 6) implements it.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  async function loadLogoModule() {
    await loadSharedModule(window.__ALBUM_PROMO_LOGO_JS_PATH__ || "../logo/logo.js");
  }

  describe("logo/logo.js (issue #254, Ticket 2)", () => {
    it("buildLogo() returns an a.chloe-wordmark with 'Radio' text, the logo img, then 'Calico' text", async () => {
      await loadLogoModule();

      const wordmark = window.buildLogo();

      expect(wordmark.tagName).toBe("A");
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

    it("buildLogo() links to https://www.radio-calico.com, opening in a new tab safely", async () => {
      await loadLogoModule();

      const wordmark = window.buildLogo();

      expect(wordmark.getAttribute("href")).toBe("https://www.radio-calico.com");
      expect(wordmark.getAttribute("target")).toBe("_blank");
      expect(wordmark.getAttribute("rel")).toBe("noopener noreferrer");
      expect(wordmark.getAttribute("aria-label")).toBe("Radio Calico website");
    });
  });
})();
