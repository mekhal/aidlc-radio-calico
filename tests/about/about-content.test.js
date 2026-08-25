/**
 * Issue #151 (Ticket 2 of the About page story), plan confirmed at step 3
 * re-approval (2026-08-16): Section 1, "The Radio Calico Project" — a
 * serif-styled heading + description (i18n, per the human's 2.5 answer
 * "reuse theme & use i18n"), data-driven from data/about-content.json (per
 * the human's 2.4 answer "content must reusable") — same fetch-a-JSON-file
 * pattern as case-study/case-study.js's loadCaseStudies() (see
 * tests/case-study/case-study.test.js).
 *
 * about/about.js is a new content-building module for About's sections
 * (mirrors the case-study.js / case-study-page.js split already shipped
 * under issue #323): about/about-page.js (Ticket 1, already shipped) stays
 * the thin page-init script; about.js holds the section builders and is
 * mounted into pages/about.html's <main data-testid="about-main"> by
 * about-page.js in this ticket's Code PR. That wiring is Code PR-only
 * (about-page.js's own scaffold behavior is Ticket 1's already-shipped
 * scope, see tests/about/about-page.test.js), so it is not re-tested here.
 *
 * Issue #394 (further review, 2026-08-25): the 5-swatch brand color palette
 * card grid was removed entirely per the human's explicit decision — this
 * suite no longer asserts palette/swatch rendering, and
 * buildProjectSection(state) no longer takes a palette argument. The fixed
 * palette values (Mint #D8F2D5, Forest Green #1F4E23, Teal #38A29D, Calico
 * Orange #EFA63C, Charcoal #231F20) still round-trip through
 * loadAboutContent() below since data/about-content.json's `colorPalette`
 * field itself wasn't the target of this fix.
 *
 * Written before about/about.js and data/about-content.json exist, per
 * TDD — fails until this ticket's Code PR (step 6) creates both.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const SAMPLE_TRANSLATIONS = {
    en: {
      aboutProjectHeading: "The Radio Calico Project",
      aboutProjectDescription: "Lossless (24-bit/48kHz), ad-free internet radio streaming.",
    },
    th: {
      aboutProjectHeading: "โปรเจกต์ Radio Calico",
      aboutProjectDescription: "สตรีมมิ่งวิทยุออนไลน์คุณภาพสูงแบบไม่มีโฆษณา",
    },
  };

  const EXPECTED_PALETTE = [
    { name: "Mint", hex: "#D8F2D5" },
    { name: "Forest Green", hex: "#1F4E23" },
    { name: "Teal", hex: "#38A29D" },
    { name: "Calico Orange", hex: "#EFA63C" },
    { name: "Charcoal", hex: "#231F20" },
  ];

  async function loadAboutContentModule() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_TRANSLATIONS_JS_PATH__ || "../shared/translations.js");
    await loadSharedModule(window.__ABOUT_JS_PATH__ || "../about/about.js");
  }

  function sampleState() {
    window.ALBUM_PROMO_TRANSLATIONS = SAMPLE_TRANSLATIONS;
    const state = window.createState();
    state.lang = "en";
    return state;
  }

  describe("about/about.js (issue #151, Ticket 2 — Section 1: The Radio Calico Project)", () => {
    it("loadAboutContent() fetches data/about-content.json and returns the fixed 5-swatch color palette", async () => {
      await loadAboutContentModule();

      const content = await window.loadAboutContent();

      expect(content.colorPalette.length).toBe(5);
      EXPECTED_PALETTE.forEach((expected) => {
        const match = content.colorPalette.find((swatch) => swatch.hex.toUpperCase() === expected.hex);
        expect(match).toBeTruthy();
        expect(match.name).toBe(expected.name);
      });
    });

    it("buildProjectSection(state) renders a serif-styled heading and description sourced from i18n", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const section = window.buildProjectSection(state);
      const heading = section.querySelector("h1, h2");

      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe(SAMPLE_TRANSLATIONS.en.aboutProjectHeading);
      expect(section.textContent).toContain(SAMPLE_TRANSLATIONS.en.aboutProjectDescription);
    });

    it("buildProjectSection(state) re-renders its heading/description text when the language changes", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const section = window.buildProjectSection(state);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const heading = section.querySelector("h1, h2");
      expect(heading.textContent).toBe(SAMPLE_TRANSLATIONS.th.aboutProjectHeading);
      expect(section.textContent).toContain(SAMPLE_TRANSLATIONS.th.aboutProjectDescription);
    });

    it("buildProjectSection(state) renders no color palette swatch card (removed per issue #394)", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const section = window.buildProjectSection(state);

      expect(section.querySelector(".about-palette__swatch")).toBeFalsy();
      expect(window.buildColorPalette).toBeFalsy();
    });
  });
})();
