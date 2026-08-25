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
 * Issue #394 (split from #151's close): the table shipped by Ticket 3 above
 * was fixed English content with no theme-token styling — a human-reported
 * i18n/theme-color bug. Step-3 decisions confirmed on the issue on
 * 2026-08-25:
 *
 *   1. Tool-column i18n: `category`/`description` become bilingual
 *      `{ en, th }` objects per row (mirrors data/contact-content.json's
 *      `inspiration` field precedent). `tool` also becomes `{ en, th }` for
 *      translatable phrases ("100% AC pass rate", "Human decision gates"),
 *      but STAYS a fixed string for proper nouns ("Mega-Linter", "Trivy") —
 *      a per-row mixed shape, not a blanket rule.
 *   2. Theme colors: `.chloe-about-standards__table` body uses the
 *      `--chloe-sage`/`--chloe-ink` pair (already the page's own section
 *      background/text elsewhere); its `<thead>` uses
 *      `--chloe-player-box-bg`/`-fg` for contrast. Both pairs already flip
 *      under `[data-chloe-theme="dark"]` in shared/tokens.css (verified),
 *      per the theme-token-background-audit published skill — no new token
 *      invented, no reliance on Bootstrap defaults.
 *   3. "ลบ color code ออก ตามรูป" (remove color code, per the attached
 *      screenshot): the attached image could not be fetched/viewed in this
 *      headless run (no network-fetch tool permission available without a
 *      human to approve it), so this is a best-effort reading, NOT a
 *      confirmed AC — flagged for human correction at Test PR review. Read
 *      as: unlike Section 1's palette swatches (which intentionally render
 *      `"{name} {hex}"` as visible text), this table must never render a
 *      literal hex/color-code string as visible text — it should only use
 *      theme tokens for *styling*, never print a color value as content.
 *
 * Column headers ("Category"/"Tooling"/"Description") are UI chrome, not
 * row content, so they move into ALBUM_PROMO_TRANSLATIONS
 * (aboutStandardsColCategory/ColTooling/ColDescription), same as the
 * existing aboutStandardsHeading key — real i18n/album-promo-en.json /
 * -th.json keys are added by the Code PR (step 6), same "SAMPLE_TRANSLATIONS
 * mock, not fetched here" convention already used by this file and
 * tests/about/about-content.test.js.
 *
 * buildProductionStandardsTable(standards) becomes
 * buildProductionStandardsTable(state, standards) — it now needs state.lang
 * (for row content) and ALBUM_PROMO_TRANSLATIONS (for headers), so it
 * self-renders and self-subscribes to state.onLanguageChange, same pattern
 * as buildProjectSection(state, palette)'s render()/state.onLanguageChange.push().
 * buildStandardsSection(state, standards) passes state through instead of
 * building the table from plain data.
 *
 * Written before about/about.js's signature changes and
 * data/about-content.json's bilingual shape exist, per TDD — fails until
 * this issue's Code PR (step 6) adds both. See tests/about/about-standards-theme.test.js
 * for the AC3 (.chloe-about-standards__table theme-token) coverage.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const SAMPLE_TRANSLATIONS = {
    en: {
      aboutStandardsHeading: "Production-grade Standards",
      aboutStandardsColCategory: "Category",
      aboutStandardsColTooling: "Tooling",
      aboutStandardsColDescription: "Description",
    },
    th: {
      aboutStandardsHeading: "มาตรฐานระดับโปรดักชัน",
      aboutStandardsColCategory: "หมวดหมู่",
      aboutStandardsColTooling: "เครื่องมือ",
      aboutStandardsColDescription: "คำอธิบาย",
    },
  };

  // Fixed by the issue body — category/description are bilingual per the
  // 2026-08-25 decision; tool is bilingual only for the two translatable-
  // phrase rows (Test Coverage / Process Integrity) and stays a fixed
  // string for the two proper-noun rows (Mega-Linter / Trivy).
  const STANDARDS_FIXTURE = [
    {
      category: { en: "Code Quality & Linting", th: "คุณภาพโค้ดและการลินต์" },
      tool: "Mega-Linter",
      description: { en: "Code Quality & Linting description text.", th: "ข้อความอธิบายคุณภาพโค้ดและการลินต์" },
    },
    {
      category: { en: "Security Scan", th: "การสแกนความปลอดภัย" },
      tool: "Trivy",
      description: { en: "Security Scan description text.", th: "ข้อความอธิบายการสแกนความปลอดภัย" },
    },
    {
      category: { en: "Test Coverage", th: "ความครอบคลุมของการทดสอบ" },
      tool: { en: "100% AC pass rate", th: "ผ่านเกณฑ์ AC 100%" },
      description: { en: "Test Coverage description text.", th: "ข้อความอธิบายความครอบคลุมของการทดสอบ" },
    },
    {
      category: { en: "Process Integrity", th: "ความสมบูรณ์ของกระบวนการ" },
      tool: { en: "Human decision gates", th: "จุดตัดสินใจของมนุษย์" },
      description: { en: "Process Integrity description text.", th: "ข้อความอธิบายความสมบูรณ์ของกระบวนการ" },
    },
  ];

  // A row field is either a fixed string (proper nouns like "Mega-Linter")
  // or a bilingual { en, th } object — resolve() picks the right value for
  // the language under test, same shape the Code PR must implement.
  function resolve(field, lang) {
    return typeof field === "string" ? field : field[lang];
  }

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
    it("loadAboutContent() fetches data/about-content.json and returns the 4 production-grade standards, bilingual per row (issue #394)", async () => {
      await loadAboutContentModule();

      const content = await window.loadAboutContent();

      expect(content.productionStandards.length).toBe(4);

      const fixedToolRows = ["Code Quality & Linting", "Security Scan"];
      const translatableToolRows = ["Test Coverage", "Process Integrity"];

      STANDARDS_FIXTURE.forEach((expected) => {
        const match = content.productionStandards.find((row) => row.category && row.category.en === expected.category.en);
        expect(match).toBeTruthy();

        expect(typeof match.category.en).toBe("string");
        expect(typeof match.category.th).toBe("string");
        expect(match.category.th.length > 0).toBeTruthy();

        expect(typeof match.description.en).toBe("string");
        expect(match.description.en.length > 0).toBeTruthy();
        expect(typeof match.description.th).toBe("string");
        expect(match.description.th.length > 0).toBeTruthy();

        if (fixedToolRows.indexOf(expected.category.en) !== -1) {
          expect(typeof match.tool).toBe("string");
        } else if (translatableToolRows.indexOf(expected.category.en) !== -1) {
          expect(typeof match.tool.en).toBe("string");
          expect(typeof match.tool.th).toBe("string");
          expect(match.tool.th.length > 0).toBeTruthy();
        }
      });
    });

    it("buildProductionStandardsTable(state, standards) renders translated headers + one row per standard, in English by default", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const table = window.buildProductionStandardsTable(state, STANDARDS_FIXTURE);
      const headerCells = Array.from(table.querySelectorAll("thead th"));
      const rows = Array.from(table.querySelectorAll("tbody tr"));

      expect(table.tagName).toBe("TABLE");
      expect(table.classList.contains("table")).toBeTruthy();

      expect(headerCells.length).toBe(3);
      expect(headerCells[0].textContent).toBe(SAMPLE_TRANSLATIONS.en.aboutStandardsColCategory);
      expect(headerCells[1].textContent).toBe(SAMPLE_TRANSLATIONS.en.aboutStandardsColTooling);
      expect(headerCells[2].textContent).toBe(SAMPLE_TRANSLATIONS.en.aboutStandardsColDescription);

      expect(rows.length).toBe(4);
      rows.forEach((row, i) => {
        const fixture = STANDARDS_FIXTURE[i];
        expect(row.textContent).toContain(resolve(fixture.category, "en"));
        expect(row.textContent).toContain(resolve(fixture.tool, "en"));
        expect(row.textContent).toContain(resolve(fixture.description, "en"));
      });
    });

    it("buildProductionStandardsTable(state, standards) re-renders headers + row content in Thai when the language changes", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const table = window.buildProductionStandardsTable(state, STANDARDS_FIXTURE);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const headerCells = Array.from(table.querySelectorAll("thead th"));
      expect(headerCells[0].textContent).toBe(SAMPLE_TRANSLATIONS.th.aboutStandardsColCategory);
      expect(headerCells[1].textContent).toBe(SAMPLE_TRANSLATIONS.th.aboutStandardsColTooling);
      expect(headerCells[2].textContent).toBe(SAMPLE_TRANSLATIONS.th.aboutStandardsColDescription);

      const rows = Array.from(table.querySelectorAll("tbody tr"));
      rows.forEach((row, i) => {
        const fixture = STANDARDS_FIXTURE[i];
        expect(row.textContent).toContain(resolve(fixture.category, "th"));
        expect(row.textContent).toContain(resolve(fixture.tool, "th"));
        expect(row.textContent).toContain(resolve(fixture.description, "th"));
      });
    });

    // Issue #394 decision #3 ("ลบ color code ออก ตามรูป") — best-effort
    // reading since the attached screenshot could not be viewed (see file
    // header comment): unlike Section 1's palette swatches, this table must
    // never print a literal hex/color-code string as visible text.
    it("never renders a literal hex color code as visible text in the table (issue #394 decision #3)", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const table = window.buildProductionStandardsTable(state, STANDARDS_FIXTURE);
      const hexPattern = /#[0-9a-fA-F]{3,8}\b/;

      expect(hexPattern.test(table.textContent)).toBeFalsy();
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

    it("buildStandardsSection(state, standards) re-renders its heading AND its table content when the language changes", async () => {
      await loadAboutContentModule();
      const state = sampleState();

      const section = window.buildStandardsSection(state, STANDARDS_FIXTURE);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const heading = section.querySelector("h1, h2");
      expect(heading.textContent).toBe(SAMPLE_TRANSLATIONS.th.aboutStandardsHeading);

      const firstRow = section.querySelector("tbody tr");
      expect(firstRow.textContent).toContain(resolve(STANDARDS_FIXTURE[0].category, "th"));
    });
  });
})();
