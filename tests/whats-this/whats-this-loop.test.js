/**
 * Issue #404 (Ticket 3 of the "What's this" page story, part of #152),
 * step 3 waiver approved (2026-08-20): Test PR skipped for this ticket, per
 * the human's "approved waiver Test PR. and start Code PR" — these tests are
 * bundled directly into the Code PR instead, demonstrating AC1-AC3 are met
 * (CLAUDE.md's Definition of Done, "tests bundled into the Code PR" option) —
 * same waiver pattern as tests/whats-this/whats-this-content.test.js
 * (issue #403, Ticket 2).
 *
 * Section 2, "The AI-DLC Loop" — a "THE AI-DLC LOOP" heading and 6 step
 * cards, titles locked per @mekhal's decision on #152 (AC1), each with a
 * short general-audience description paraphrasing README section 4's
 * 7-step table (AC2), laid out in a responsive Bootstrap grid (AC3), all
 * data-driven from data/whats-this-content.json's new aidlcLoop field —
 * same fetch-a-JSON-file pattern as tests/whats-this/whats-this-content.test.js.
 *
 * buildAiDlcLoopSection(content) takes the resolved aidlcLoop object as a
 * plain argument rather than calling loadWhatsThisContent() itself, same
 * synchronous/directly-testable convention as buildWhatIsThisSection().
 *
 * Issue #508 (Ticket 1 of the "What's this" bilingual story, part of #505):
 * Section 2 becomes bilingual, per the ticket's plan/AC and @mekhal's
 * 2026-08-25 decision to translate the 6 step names too (supersedes the
 * "keep step names fixed English" default proposed in the plan draft):
 *   - AC2: each step's `title` AND `description` are now { en, th } objects,
 *     resolved via the shared resolveBilingualField().
 *   - The "THE AI-DLC LOOP" heading moves out of the content JSON and into a
 *     new i18n key, `whatsThisLoopHeading`, same precedent as Section 1's
 *     `whatsThisWhatHeading`. buildAiDlcLoopSection(content) becomes
 *     buildAiDlcLoopSection(state, content) — it, buildAiDlcLoopGrid(), and
 *     buildAiDlcLoopCard() self-render and self-subscribe to
 *     state.onLanguageChange, same pattern as about.js's
 *     buildProductionStandardsTable(state, standards).
 *
 * EXPECTED_TITLES below is now the English resolution of each step's
 * bilingual title — the exact locked English wording from @mekhal's decision
 * on #152 is preserved unchanged; only the Thai counterpart is new.
 *
 * Written before shared/helpers.js exports resolveBilingualField, before
 * about/about.js's ALBUM_PROMO_TRANSLATIONS gain the whatsThisLoopHeading
 * key, and before whats-this/whats-this.js's signatures change, per TDD —
 * fails until this issue's Code PR (step 6) adds all three.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const EXPECTED_TITLES_EN = [
    "Issue Trigger",
    "Plan & AC Gate",
    "TDD Gate",
    "Implementation Gate",
    "Review & Merge Gate",
    "Close & Capture Gate",
  ];

  const EXPECTED_TITLES_TH = [
    "จุดเริ่ม Issue",
    "ประตูแผน & AC",
    "ประตู TDD",
    "ประตูการพัฒนาโค้ด",
    "ประตูรีวิว & Merge",
    "ประตูปิดงาน & บันทึกทักษะ",
  ];

  const SAMPLE_TRANSLATIONS = {
    en: { whatsThisLoopHeading: "THE AI-DLC LOOP" },
    th: { whatsThisLoopHeading: "วงจร AI-DLC" },
  };

  const SAMPLE_STEPS = EXPECTED_TITLES_EN.map((titleEn, i) => ({
    title: { en: titleEn, th: EXPECTED_TITLES_TH[i] },
    description: { en: `Sample description for ${titleEn}.`, th: `คำอธิบายตัวอย่างสำหรับ ${titleEn}` },
  }));

  async function loadWhatsThisContentModule() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_TRANSLATIONS_JS_PATH__ || "../shared/translations.js");
    await loadSharedModule(window.__WHATS_THIS_JS_PATH__ || "../whats-this/whats-this.js");
  }

  function sampleState() {
    window.ALBUM_PROMO_TRANSLATIONS = SAMPLE_TRANSLATIONS;
    const state = window.createState();
    state.lang = "en";
    return state;
  }

  describe('whats-this/whats-this.js (issue #404/#508, Ticket 3 — Section 2: The AI-DLC Loop)', () => {
    it("loadWhatsThisContent() fetches data/whats-this-content.json and returns 6 bilingual steps, English resolution equal to the locked titles, in order (AC1, issue #508 AC2)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();

      expect(content.aidlcLoop).toBeTruthy();
      expect(content.aidlcLoop.steps.length).toBe(6);
      expect(content.aidlcLoop.steps.map((step) => step.title.en)).toEqual(EXPECTED_TITLES_EN);
      content.aidlcLoop.steps.forEach((step) => {
        expect(typeof step.title.th).toBe("string");
        expect(step.title.th.length > 0).toBeTruthy();
        expect(typeof step.description.en).toBe("string");
        expect(step.description.en.length > 0).toBeTruthy();
        expect(typeof step.description.th).toBe("string");
        expect(step.description.th.length > 0).toBeTruthy();
      });
    });

    it("buildAiDlcLoopSection(state, content) renders a heading reading exactly THE AI-DLC LOOP in English by default, sourced from i18n (issue #508)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildAiDlcLoopSection(state, { steps: SAMPLE_STEPS });
      const heading = section.querySelector("h2");

      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe("THE AI-DLC LOOP");
    });

    it("buildAiDlcLoopGrid(state, steps) renders exactly 6 cards with these exact English titles, in this exact order, by default (AC1)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const grid = window.buildAiDlcLoopGrid(state, SAMPLE_STEPS);
      const titles = Array.from(grid.querySelectorAll(".whats-this-loop-card__title")).map((el) => el.textContent);

      expect(titles.length).toBe(6);
      expect(titles).toEqual(EXPECTED_TITLES_EN);
    });

    it("buildAiDlcLoopSection(state, content) re-renders the heading, all 6 step titles, AND descriptions in Thai when the language changes, without a reload (issue #508 AC2, per @mekhal's 2026-08-25 decision to translate step names too)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildAiDlcLoopSection(state, { steps: SAMPLE_STEPS });
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const heading = section.querySelector("h2");
      expect(heading.textContent).toBe("วงจร AI-DLC");

      const titles = Array.from(section.querySelectorAll(".whats-this-loop-card__title")).map((el) => el.textContent);
      expect(titles).toEqual(EXPECTED_TITLES_TH);

      const descriptions = Array.from(section.querySelectorAll(".whats-this-loop-card__description")).map(
        (el) => el.textContent,
      );
      descriptions.forEach((text, i) => {
        expect(text).toBe(SAMPLE_STEPS[i].description.th);
      });
    });

    it("buildAiDlcLoopSection(state, content) embeds all 6 cards from the content argument within the section, sourced from data not hardcoded (AC1, AC2)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildAiDlcLoopSection(state, { steps: SAMPLE_STEPS });
      const cards = Array.from(section.querySelectorAll(".whats-this-loop-card"));

      expect(cards.length).toBe(6);
      cards.forEach((card, i) => {
        expect(card.querySelector(".whats-this-loop-card__title").textContent).toBe(EXPECTED_TITLES_EN[i]);
        expect(card.querySelector(".whats-this-loop-card__description").textContent).toBe(
          SAMPLE_STEPS[i].description.en,
        );
      });
    });

    it("buildAiDlcLoopSection(state, content) does not render README section 4's literal step-table language (AC2)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const content = await window.loadWhatsThisContent();
      const section = window.buildAiDlcLoopSection(state, content.aidlcLoop);

      expect(section.textContent).not.toContain("Open an issue (type:");
      expect(section.textContent).not.toContain("spawns a **sub-agent**");
      expect(section.textContent).not.toContain("Review the plan again, then write");
    });

    it("buildAiDlcLoopCard(state, step, index) places each card in a Bootstrap col-md-4 column (AC3: stacks on mobile, grid on desktop)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const col = window.buildAiDlcLoopCard(state, SAMPLE_STEPS[0], 0);

      expect(col.className).toContain("col-md-4");
    });

    it("buildAiDlcLoopGrid(state, steps) wraps cards in a Bootstrap row for the responsive grid (AC3)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const grid = window.buildAiDlcLoopGrid(state, SAMPLE_STEPS);

      expect(grid.className).toContain("row");
    });
  });
})();
