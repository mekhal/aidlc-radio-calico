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
 * Issue #394 (further review, 2026-08-25, second pass): each reference's
 * `name`/`description` are now bilingual `{ en, th }` objects — proper nouns
 * ("Claude GitHub Agent", the Udemy course title) stay fixed strings, same
 * mixed-shape rule already applied to the Standards table's `tool` column.
 * buildReferencesList(references) becomes buildReferencesList(state,
 * references) — it self-renders and self-subscribes to
 * state.onLanguageChange, same pattern as buildProductionStandardsTable(state,
 * standards). Test PR waived this turn (human's step-3 decision); this
 * coverage is bundled directly into the Code PR per CLAUDE.md's Definition
 * of Done.
 *
 * Issue #397, plan approved at step 3 (2026-08-19): reference item 4
 * ("Style Guide") is replaced with a credit for the Udemy course "Claude
 * Code: Building Faster with AI, from Prototype to Prod" (Frank Kane) —
 * same text as the existing README.md/README.th.md §13 bullet, now with a
 * clickable link. This is the first reference entry with a `url` field, so
 * buildReferencesList() must render the resolved name as an
 * `<a href target="_blank" rel="noopener noreferrer">` when `url` is
 * present, while entries without `url` keep rendering as plain text (no
 * regression).
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

  // Fixed by the issue body — `name` is a fixed string for proper nouns, or
  // a bilingual { en, th } object (e.g. "Open Source Libraries").
  // `description` is always bilingual { en, th } (issue #394, second pass).
  const EXPECTED_REFERENCES = [
    { name: "Claude GitHub Agent" },
    { name: "AI-DLC Process" },
    { name: { en: "Open Source Libraries", th: "ไลบรารีโอเพนซอร์ส" } },
  ];

  // A field is either a fixed string (proper nouns) or a bilingual
  // { en, th } object — resolve() picks the right value for the language
  // under test, same shape the Code PR must implement.
  function resolve(field, lang) {
    return typeof field === "string" ? field : field[lang];
  }

  // Issue #397: item 4 ("Style Guide") is replaced with this Udemy course
  // credit — name/url are fixed by the human's step-3 answer (proper noun,
  // not translated); description is bilingual like the other entries.
  const UDEMY_COURSE_REFERENCE = {
    name: "Udemy Course – Claude Code: Building Faster with AI, from Prototype to Prod",
    description: {
      en: "The ideas and process in this project were inspired by the Udemy course \"Claude Code: Building Faster with AI, from Prototype to Prod\" thanks to Frank Kane.",
      th: "แนวคิดและกระบวนการในโปรเจกต์นี้ได้รับแรงบันดาลใจจากคอร์ส Udemy \"Claude Code: Building Faster with AI, from Prototype to Prod\" ขอขอบคุณ Frank Kane",
    },
    url: "https://www.udemy.com/course/anthropic-claude-code/?srsltid=AfmBOoq1FmiJvG_rDMQgx4J-4xfD1qbJy9rJ2-c44YEslEFGdG1TC_wR&couponCode=CP260817G2",
  };

  // Synthetic fixture (with description filled in) for exercising the pure
  // list/section builders directly, independent of the fetched JSON. Item 4
  // is the Udemy course entry (with `url`); the rest have no `url`.
  const REFERENCES_FIXTURE = [
    ...EXPECTED_REFERENCES.map((entry) => ({
      ...entry,
      description: {
        en: `${resolve(entry.name, "en")} description text (en).`,
        th: `${resolve(entry.name, "en")} description text (th).`,
      },
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
    it("loadAboutContent() fetches data/about-content.json and returns the 4 references, bilingual per row (issue #394)", async () => {
      await loadAboutContentModule();

      const content = await window.loadAboutContent();

      expect(content.references.length).toBe(4);
      EXPECTED_REFERENCES.forEach((expected) => {
        const expectedEnName = resolve(expected.name, "en");
        const match = content.references.find((row) => resolve(row.name, "en") === expectedEnName);
        expect(match).toBeTruthy();

        expect(typeof match.description.en).toBe("string");
        expect(match.description.en.length > 0).toBeTruthy();
        expect(typeof match.description.th).toBe("string");
        expect(match.description.th.length > 0).toBeTruthy();
      });
    });

    it("loadAboutContent()'s 4th reference is the Udemy course credit with a url, replacing 'Style Guide'", async () => {
      await loadAboutContentModule();

      const content = await window.loadAboutContent();
      const udemyEntry = content.references[3];

      expect(content.references.find((row) => resolve(row.name, "en") === "Style Guide")).toBeFalsy();
      expect(udemyEntry.name).toBe(UDEMY_COURSE_REFERENCE.name);
      expect(udemyEntry.description.en).toBe(UDEMY_COURSE_REFERENCE.description.en);
      expect(udemyEntry.description.th).toBe(UDEMY_COURSE_REFERENCE.description.th);
      expect(udemyEntry.url).toBe(UDEMY_COURSE_REFERENCE.url);
    });

    it("buildReferencesList(state, references) renders a Bootstrap list-group with one item per reference, in English by default", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const list = window.buildReferencesList(state, REFERENCES_FIXTURE);
      const items = Array.from(list.querySelectorAll(".list-group-item"));

      expect(list.classList.contains("list-group")).toBeTruthy();
      expect(items.length).toBe(4);
      items.forEach((item, i) => {
        const fixture = REFERENCES_FIXTURE[i];
        expect(item.textContent).toContain(resolve(fixture.name, "en"));
        expect(item.textContent).toContain(resolve(fixture.description, "en"));
      });
    });

    it("buildReferencesList(state, references) re-renders name/description in Thai when the language changes", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const list = window.buildReferencesList(state, REFERENCES_FIXTURE);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const items = Array.from(list.querySelectorAll(".list-group-item"));
      items.forEach((item, i) => {
        const fixture = REFERENCES_FIXTURE[i];
        expect(item.textContent).toContain(resolve(fixture.name, "th"));
        expect(item.textContent).toContain(resolve(fixture.description, "th"));
      });
    });

    it("buildReferencesList(state, references) renders a reference with a `url` as a link opening in a new tab", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const list = window.buildReferencesList(state, REFERENCES_FIXTURE);
      const items = Array.from(list.querySelectorAll(".list-group-item"));
      const udemyItem = items[3];
      const link = udemyItem.querySelector("a");

      expect(link).toBeTruthy();
      expect(link.getAttribute("href")).toBe(UDEMY_COURSE_REFERENCE.url);
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
      expect(link.textContent).toBe(UDEMY_COURSE_REFERENCE.name);
    });

    it("buildReferencesList(state, references) renders references without a `url` as plain text, not a link", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const list = window.buildReferencesList(state, REFERENCES_FIXTURE);
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

    it("buildReferencesSection(state, references) re-renders its heading AND its list content when the language changes", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const section = window.buildReferencesSection(state, REFERENCES_FIXTURE);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const heading = section.querySelector("h1, h2");
      expect(heading.textContent).toBe(SAMPLE_TRANSLATIONS.th.aboutReferencesHeading);

      const firstItem = section.querySelector(".list-group-item");
      expect(firstItem.textContent).toContain(resolve(REFERENCES_FIXTURE[0].name, "th"));
    });
  });
})();
