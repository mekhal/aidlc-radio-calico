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
 *
 * Issue #397, plan approved at step 3 (2026-08-19): reference item 4
 * ("Style Guide") is replaced with a credit for the Udemy course "Claude
 * Code: Building Faster with AI, from Prototype to Prod" (Frank Kane) —
 * same text as the existing README.md/README.th.md §13 bullet, now with a
 * clickable link. This is the first reference entry with a `url` field, so
 * buildReferencesList() must render `reference.name` as an
 * `<a href target="_blank" rel="noopener noreferrer">` when `url` is
 * present, while entries without `url` keep rendering as plain text (no
 * regression). Written before about/about.js gains this branch and
 * data/about-content.json's item 4 gains `url`, per TDD — fails until this
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
  ];

  // Issue #397: item 4 ("Style Guide") is replaced with this Udemy course
  // credit — name, description, and url are all fixed by the human's step-3
  // answer, not left open like the other entries.
  const UDEMY_COURSE_REFERENCE = {
    name: "Udemy Course – Claude Code: Building Faster with AI, from Prototype to Prod",
    description:
      "The ideas and process in this project were inspired by the Udemy course \"Claude Code: Building Faster with AI, from Prototype to Prod\" thanks to Frank Kane.",
    url: "https://www.udemy.com/course/anthropic-claude-code/?srsltid=AfmBOoq1FmiJvG_rDMQgx4J-4xfD1qbJy9rJ2-c44YEslEFGdG1TC_wR&couponCode=CP260817G2",
  };

  // Synthetic fixture (with description filled in) for exercising the pure
  // list/section builders directly, independent of the fetched JSON. Item 4
  // is the Udemy course entry (with `url`); the rest have no `url`.
  const REFERENCES_FIXTURE = [
    ...EXPECTED_REFERENCES.map((entry) => ({
      ...entry,
      description: `${entry.name} description text.`,
    })),
    UDEMY_COURSE_REFERENCE,
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

    it("loadAboutContent()'s 4th reference is the Udemy course credit with a url, replacing 'Style Guide'", async () => {
      await loadAboutContentModule();

      const content = await window.loadAboutContent();
      const udemyEntry = content.references[3];

      expect(content.references.find((row) => row.name === "Style Guide")).toBeFalsy();
      expect(udemyEntry.name).toBe(UDEMY_COURSE_REFERENCE.name);
      expect(udemyEntry.description).toBe(UDEMY_COURSE_REFERENCE.description);
      expect(udemyEntry.url).toBe(UDEMY_COURSE_REFERENCE.url);
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

    it("buildReferencesList(references) renders a reference with a `url` as a link opening in a new tab", async () => {
      await loadAboutContentModule();

      const list = window.buildReferencesList(REFERENCES_FIXTURE);
      const items = Array.from(list.querySelectorAll(".list-group-item"));
      const udemyItem = items[3];
      const link = udemyItem.querySelector("a");

      expect(link).toBeTruthy();
      expect(link.getAttribute("href")).toBe(UDEMY_COURSE_REFERENCE.url);
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
      expect(link.textContent).toBe(UDEMY_COURSE_REFERENCE.name);
    });

    it("buildReferencesList(references) renders references without a `url` as plain text, not a link", async () => {
      await loadAboutContentModule();

      const list = window.buildReferencesList(REFERENCES_FIXTURE);
      const items = Array.from(list.querySelectorAll(".list-group-item"));

      items.slice(0, 3).forEach((item) => {
        expect(item.querySelector("a")).toBeFalsy();
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
