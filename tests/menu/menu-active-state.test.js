/**
 * Issue #306: the nav item matching the currently open page/hash must be
 * visually distinguished from the others and non-navigable (no-op on
 * click), while every other item stays exactly as today (issue #255's
 * plain, clickable links) — see the AC posted on issue #306.
 *
 * Targets buildMenu(state) comparing window.location.hash against each nav
 * item's href (empty hash treated as "#home", since that's index.html's real
 * landing state), re-checked on "hashchange" — per the plan agreed on the
 * issue. Written before menu/menu.js implements this, per TDD — fails until
 * this ticket's Code PR (step 6) adds the active-state logic.
 *
 * No native API is overridden here (test-pr-native-api-and-self-ref-checklist):
 * window.location.hash is set the same way a real hash-link click would set
 * it, and "no navigation" is verified via the standard Event.defaultPrevented
 * flag, not by stubbing a native method. Each test restores
 * window.location.hash afterwards so it doesn't leak into later tests.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const NAV_KEYS = ["home", "about", "whatsThis", "contact"];
  const NAV_HREFS = { home: "#home", about: "#about", whatsThis: "#whats-this", contact: "#contact" };

  const SAMPLE_TRANSLATIONS = {
    en: { nav: { home: "Home", about: "About", whatsThis: "What's this", contact: "Contact" } },
  };

  async function loadMenuModule() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_TRANSLATIONS_JS_PATH__ || "../shared/translations.js");
    await loadSharedModule(window.__ALBUM_PROMO_MENU_JS_PATH__ || "../menu/menu.js");
  }

  function buildNav() {
    window.ALBUM_PROMO_TRANSLATIONS = SAMPLE_TRANSLATIONS;
    const state = window.createState();
    state.lang = "en";
    return window.buildMenu(state);
  }

  function linkFor(nav, key) {
    return nav.querySelector(`a[href="${NAV_HREFS[key]}"]`);
  }

  function clickAndCheckPrevented(link) {
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    return event.defaultPrevented;
  }

  function setHash(value) {
    window.location.hash = value;
  }

  async function withHash(value, fn) {
    const original = window.location.hash;
    try {
      setHash(value);
      await fn();
    } finally {
      setHash(original);
      window.ALBUM_PROMO_TRANSLATIONS = null;
    }
  }

  describe("menu/menu.js active nav state (issue #306)", () => {
    it("marks the nav item matching the current hash as active (aria-current=page)", async () => {
      await loadMenuModule();
      await withHash("#about", async () => {
        const nav = buildNav();
        const active = linkFor(nav, "about");
        expect(active.getAttribute("aria-current")).toBe("page");
      });
    });

    it("defaults to Home active when the hash is empty", async () => {
      await loadMenuModule();
      await withHash("", async () => {
        const nav = buildNav();
        const active = linkFor(nav, "home");
        expect(active.getAttribute("aria-current")).toBe("page");
      });
    });

    it("does not navigate when the active nav item is clicked", async () => {
      await loadMenuModule();
      await withHash("#about", async () => {
        const nav = buildNav();
        const active = linkFor(nav, "about");
        expect(clickAndCheckPrevented(active)).toBe(true);
      });
    });

    it("leaves every non-active nav item clickable and without aria-current", async () => {
      await loadMenuModule();
      await withHash("#about", async () => {
        const nav = buildNav();
        NAV_KEYS.filter((key) => key !== "about").forEach((key) => {
          const link = linkFor(nav, key);
          expect(link.getAttribute("aria-current")).toBe(null);
          expect(clickAndCheckPrevented(link)).toBe(false);
        });
      });
    });

    it("all nav items keep their href regardless of active state (AC unchanged from issue #255)", async () => {
      await loadMenuModule();
      await withHash("#about", async () => {
        const nav = buildNav();
        NAV_KEYS.forEach((key) => {
          expect(linkFor(nav, key).getAttribute("href")).toBe(NAV_HREFS[key]);
        });
      });
    });

    it("re-evaluates the active item on hashchange without rebuilding the nav", async () => {
      await loadMenuModule();
      await withHash("#home", async () => {
        const nav = buildNav();
        expect(linkFor(nav, "home").getAttribute("aria-current")).toBe("page");

        window.location.hash = "#contact";
        window.dispatchEvent(new HashChangeEvent("hashchange"));

        expect(linkFor(nav, "home").getAttribute("aria-current")).toBe(null);
        expect(linkFor(nav, "contact").getAttribute("aria-current")).toBe("page");
      });
    });
  });
})();
