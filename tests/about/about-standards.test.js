/**
 * Issue #151 (Ticket 3 of the About page story), plan confirmed at step 3
 * (2026-08-15 answers, reconfirmed via "Sub ticket" sequencing on
 * 2026-08-16): Section 2, "Production-grade Standards" — a table listing the
 * four Code-PR gates from the issue body:
 *   - Code Quality & Linting (Mega-Linter)
 *   - Security Scan (Trivy)
 *   - Test Coverage (100% AC pass rate)
 *   - Process Integrity (Human decision gates)
 * sourced from README.md sections 11/12 (the four gates + their tooling),
 * data-driven from data/about-content.json's new `productionStandards`
 * field, per the human's 2.4 answer "content must reusable" — same
 * fetch-a-JSON-file pattern as Section 1's colorPalette (see
 * tests/about/about-content.test.js) rather than hardcoded per-row markup.
 *
 * Only `category`/`tool` are fixed by the issue body; each row's
 * `description` prose is not specified there, so this suite asserts it is
 * present/non-empty without pinning its exact wording, leaving the Code PR
 * free to source it from README.md sections 11/12.
 *
 * buildProductionStandardsTable(standards) takes a plain standards array
 * (not state) — the table content itself is not i18n (same "fixed English
 * data-driven content" precedent as case-study/case-study.js's cards,
 * plain data, no state.lang branching). buildStandardsSection(state,
 * standards) wraps it with an i18n'd heading (per the human's 2.5 answer
 * "reuse theme & use i18n"), mirroring about/about.js's existing
 * buildProjectSection(state, palette) split between i18n heading and
 * data-driven body content.
 *
 * Written before about/about.js gains these exports and
 * data/about-content.json gains `productionStandards`, per TDD — fails
 * until this ticket's Code PR (step 6) adds both.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const SAMPLE_TRANSLATIONS = {
    en: {
      aboutStandardsHeading: "Production-grade Standards",
    },
    th: {
      aboutStandardsHeading: "มาตรฐานระดับโปรดักชัน",
    },
  };

  // Fixed by the issue body — category + tool only; description is open.
  const EXPECTED_STANDARDS = [
    { category: "Code Quality & Linting", tool: "Mega-Linter" },
    { category: "Security Scan", tool: "Trivy" },
    { category: "Test Coverage", tool: "100% AC pass rate" },
    { category: "Process Integrity", tool: "Human decision gates" },
  ];

  // Synthetic fixture (with description filled in) for exercising the pure
  // table/section builders directly, independent of the fetched JSON.
  const STANDARDS_FIXTURE = EXPECTED_STANDARDS.map((entry) => ({
    ...entry,
    description: `${entry.category} description text.`,
  }));

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

  describe("about/about.js (issue #151, Ticket 3 — Section 2: Production-grade Standards)", () => {
    it("loadAboutContent() fetches data/about-content.json and returns the 4 production-grade standards", async () => {
      await loadAboutContentModule();

      const content = await window.loadAboutContent();

      expect(content.productionStandards.length).toBe(4);
      EXPECTED_STANDARDS.forEach((expected) => {
        const match = content.productionStandards.find((row) => row.category === expected.category);
        expect(match).toBeTruthy();
        expect(match.tool).toBe(expected.tool);
        expect(typeof match.description).toBe("string");
        expect(match.description.length > 0).toBeTruthy();
      });
    });

    it("buildProductionStandardsTable(standards) renders a Bootstrap table with one row per standard", async () => {
      await loadAboutContentModule();

      const table = window.buildProductionStandardsTable(STANDARDS_FIXTURE);
      const rows = Array.from(table.querySelectorAll("tbody tr"));

      expect(table.tagName).toBe("TABLE");
      expect(table.classList.contains("table")).toBeTruthy();
      expect(rows.length).toBe(4);
      rows.forEach((row, i) => {
        expect(row.textContent).toContain(STANDARDS_FIXTURE[i].category);
        expect(row.textContent).toContain(STANDARDS_FIXTURE[i].tool);
        expect(row.textContent).toContain(STANDARDS_FIXTURE[i].description);
      });
    });

    it("buildStandardsSection(state, standards) renders an i18n heading above the standards table", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const section = window.buildStandardsSection(state, STANDARDS_FIXTURE);
      const heading = section.querySelector("h1, h2");

      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe(SAMPLE_TRANSLATIONS.en.aboutStandardsHeading);
      expect(section.querySelector("table.table")).toBeTruthy();
    });

    it("buildStandardsSection(state, standards) re-renders its heading text when the language changes", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const section = window.buildStandardsSection(state, STANDARDS_FIXTURE);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const heading = section.querySelector("h1, h2");
      expect(heading.textContent).toBe(SAMPLE_TRANSLATIONS.th.aboutStandardsHeading);
    });
  });
})();
