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
 *
 * Issue #322 (Ticket 1 of #203): NAV_KEYS/NAV_HREFS gain the `caseStudy`
 * entry (AC1); the existing `.forEach(NAV_KEYS)` assertions below cover its
 * active/inactive behavior automatically (AC5 — no drift from the other
 * items). Written before menu/menu.js implements it, per TDD.
 *
 * Issue #323 (rework, 2026-08-13): caseStudy's href changes from the hash
 * anchor "#case-study" to the real page "case-study.html" (Case Study moves
 * to its own page). The generic assertions below still hold unchanged for
 * every item, including caseStudy, since none of them set
 * window.__MENU_CURRENT_PATH__ (the seam the caseStudy item's own
 * page-based active-state check reads) — caseStudy simply stays inactive
 * here the same way it always did under a hash it doesn't match. The
 * caseStudy-specific active-state behavior (path-based, not hash-based) has
 * its own dedicated coverage in tests/menu/menu-case-study-link.test.js,
 * matching this file's existing convention of one dedicated file per nav
 * item's special-cased behavior.
 *
 * Issue #354 (root cause #1): clickAndCheckPrevented() moved to the shared
 * tests/menu/click-and-check-prevented.js (reuse-first, was duplicated
 * verbatim in this file and menu-case-study-link.test.js) — see that file
 * for why a plain "did menu.js call preventDefault()" check was unsafe on
 * its own.
 *
 * Issue #151 (Ticket 1 of the About page story): About moves off index.html
 * onto its own standalone page (pages/about.html), the same rework caseStudy
 * went through under issue #323 — its href changes from the hash anchor
 * "#about" to the real page "pages/about.html", and NAV_HREFS.about is
 * updated to match. The generic hash-driven cases below no longer use
 * "about" as their representative example (a real page has no hash to
 * compare) — they now drive off "whatsThis" (#whats-this), which stays a
 * hash placeholder, mirroring how this file already excluded caseStudy from
 * its hash-based examples after issue #323. About's own path-based
 * active-state check has its own dedicated coverage in the new
 * tests/menu/menu-about-link.test.js, matching this file's existing
 * convention of one dedicated file per nav item's special-cased behavior.
 * Written before menu/menu.js implements this, per TDD — fails until this
 * issue's Code PR (step 6) adds the path-based check for about.
 *
 * Issue #402 (Ticket 1 of the "What's this" page story): whatsThis goes
 * through the same rework — its href changes from "#whats-this" to the real
 * page "pages/whats-this.html", and NAV_HREFS.whatsThis is updated to match.
 * "whatsThis" was the last remaining hash-based representative example
 * (chosen when About made this same move under issue #151), so the generic
 * hash-driven cases below switch to "contact" — the only nav item still hash-
 * based once Home/About/What's this/Case Study are all covered by either the
 * empty-hash-defaults-to-home fallback or a real page. whatsThis's own
 * path-based active-state check has its own dedicated coverage in the new
 * tests/menu/menu-whats-this-link.test.js. Written before menu/menu.js
 * implements this, per TDD — fails until this issue's Code PR (step 6) adds
 * the path-based check for whatsThis.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;
  const { clickAndCheckPrevented } = window.MenuTestHelpers;

  const NAV_KEYS = ["home", "about", "whatsThis", "caseStudy", "contact"];
  const NAV_HREFS = {
    home: "#home",
    about: "pages/about.html",
    whatsThis: "pages/whats-this.html",
    caseStudy: "case-study.html",
    contact: "#contact",
  };

  const SAMPLE_TRANSLATIONS = {
    en: {
      nav: { home: "Home", about: "About", whatsThis: "What's this", caseStudy: "Case Study", contact: "Contact" },
    },
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
      await withHash("#contact", async () => {
        const nav = buildNav();
        const active = linkFor(nav, "contact");
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
      await withHash("#contact", async () => {
        const nav = buildNav();
        const active = linkFor(nav, "contact");
        expect(clickAndCheckPrevented(active)).toBe(true);
      });
    });

    it("leaves every non-active nav item clickable and without aria-current", async () => {
      await loadMenuModule();
      await withHash("#contact", async () => {
        const nav = buildNav();
        NAV_KEYS.filter((key) => key !== "contact").forEach((key) => {
          const link = linkFor(nav, key);
          expect(link.getAttribute("aria-current")).toBe(null);
          expect(clickAndCheckPrevented(link)).toBe(false);
        });
      });
    });

    it("all nav items keep their href regardless of active state (AC unchanged from issue #255)", async () => {
      await loadMenuModule();
      await withHash("#contact", async () => {
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
