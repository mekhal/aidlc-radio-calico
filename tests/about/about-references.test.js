/**
 * Issue #151 (Ticket 4 of the About page story), plan confirmed at step 3
 * (2026-08-15 answers, reconfirmed via "Sub ticket" sequencing on
 * 2026-08-16): Section 3, "References & Acknowledgements" — a list of the
 * tools/concepts credited by the issue body:
 *   - Claude GitHub Agent
 *   - AI-DLC Process
 *   - Open Source Libraries
 *   - Style Guide
 * sourced into data/about-content.json's new `references` field, per the
 * human's 2.4 answer "content must reusable" — same fetch-a-JSON-file
 * pattern as Sections 1/2 (see tests/about/about-content.test.js and
 * tests/about/about-standards.test.js) rather than hardcoded per-item
 * markup.
 *
 * Only each entry's `name` is fixed by the issue body; the accompanying
 * `description` prose is not specified there, so this suite asserts it is
 * present/non-empty without pinning its exact wording, leaving the Code PR
 * free to draft it.
 *
 * buildReferencesList(references) takes a plain references array (not
 * state) — the list content itself is not i18n (same "fixed English
 * data-driven content" precedent as Section 2's buildProductionStandardsTable,
 * plain data, no state.lang branching). buildReferencesSection(state,
 * references) wraps it with an i18n'd heading (per the human's 2.5 answer
 * "reuse theme & use i18n"), mirroring about/about.js's existing
 * buildProjectSection(state, palette) / buildStandardsSection(state,
 * standards) split between i18n heading and data-driven body content.
 *
 * Written before about/about.js gains these exports and
 * data/about-content.json gains `references`, per TDD — fails until this
 * ticket's Code PR (step 6) adds both.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const SAMPLE_TRANSLATIONS = {
    en: {
      aboutReferencesHeading: "References & Acknowledgements",
    },
    th: {
      aboutReferencesHeading: "การอ้างอิงและคำขอบคุณ",
    },
  };

  // Fixed by the issue body — name only; description is open.
  const EXPECTED_REFERENCES = [
    { name: "Claude GitHub Agent" },
    { name: "AI-DLC Process" },
    { name: "Open Source Libraries" },
    { name: "Style Guide" },
  ];

  // Synthetic fixture (with description filled in) for exercising the pure
  // list/section builders directly, independent of the fetched JSON.
  const REFERENCES_FIXTURE = EXPECTED_REFERENCES.map((entry) => ({
    ...entry,
    description: `${entry.name} description text.`,
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

  describe("about/about.js (issue #151, Ticket 4 — Section 3: References & Acknowledgements)", () => {
    it("loadAboutContent() fetches data/about-content.json and returns the 4 references", async () => {
      await loadAboutContentModule();

      const content = await window.loadAboutContent();

      expect(content.references.length).toBe(4);
      EXPECTED_REFERENCES.forEach((expected) => {
        const match = content.references.find((row) => row.name === expected.name);
        expect(match).toBeTruthy();
        expect(typeof match.description).toBe("string");
        expect(match.description.length > 0).toBeTruthy();
      });
    });

    it("buildReferencesList(references) renders a Bootstrap list-group with one item per reference", async () => {
      await loadAboutContentModule();

      const list = window.buildReferencesList(REFERENCES_FIXTURE);
      const items = Array.from(list.querySelectorAll(".list-group-item"));

      expect(list.classList.contains("list-group")).toBeTruthy();
      expect(items.length).toBe(4);
      items.forEach((item, i) => {
        expect(item.textContent).toContain(REFERENCES_FIXTURE[i].name);
        expect(item.textContent).toContain(REFERENCES_FIXTURE[i].description);
      });
    });

    it("buildReferencesSection(state, references) renders an i18n heading above the references list", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const section = window.buildReferencesSection(state, REFERENCES_FIXTURE);
      const heading = section.querySelector("h1, h2");

      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe(SAMPLE_TRANSLATIONS.en.aboutReferencesHeading);
      expect(section.querySelector(".list-group")).toBeTruthy();
    });

    it("buildReferencesSection(state, references) re-renders its heading text when the language changes", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const section = window.buildReferencesSection(state, REFERENCES_FIXTURE);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const heading = section.querySelector("h1, h2");
      expect(heading.textContent).toBe(SAMPLE_TRANSLATIONS.th.aboutReferencesHeading);
    });
  });
})();
