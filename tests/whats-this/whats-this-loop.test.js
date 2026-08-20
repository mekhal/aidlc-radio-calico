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
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const EXPECTED_TITLES = [
    "Issue Trigger",
    "Plan & AC Gate",
    "TDD Gate",
    "Implementation Gate",
    "Review & Merge Gate",
    "Close & Capture Gate",
  ];

  const SAMPLE_STEPS = EXPECTED_TITLES.map((title) => ({
    title,
    description: `Sample description for ${title}.`,
  }));

  async function loadWhatsThisContentModule() {
    await loadSharedModule(window.__WHATS_THIS_JS_PATH__ || "../whats-this/whats-this.js");
  }

  describe('whats-this/whats-this.js (issue #404, Ticket 3 — Section 2: The AI-DLC Loop)', () => {
    it("loadWhatsThisContent() fetches data/whats-this-content.json and returns the aidlcLoop heading + 6 steps in order (AC1)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();

      expect(content.aidlcLoop).toBeTruthy();
      expect(content.aidlcLoop.heading).toBe("THE AI-DLC LOOP");
      expect(content.aidlcLoop.steps.length).toBe(6);
      expect(content.aidlcLoop.steps.map((step) => step.title)).toEqual(EXPECTED_TITLES);
      content.aidlcLoop.steps.forEach((step) => {
        expect(typeof step.description).toBe("string");
        expect(step.description.length > 0).toBeTruthy();
      });
    });

    it("buildAiDlcLoopSection(content) renders a heading reading exactly THE AI-DLC LOOP", async () => {
      await loadWhatsThisContentModule();

      const section = window.buildAiDlcLoopSection({ heading: "THE AI-DLC LOOP", steps: SAMPLE_STEPS });
      const heading = section.querySelector("h2");

      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe("THE AI-DLC LOOP");
    });

    it("buildAiDlcLoopGrid(steps) renders exactly 6 cards with these exact titles, in this exact order (AC1)", async () => {
      await loadWhatsThisContentModule();

      const grid = window.buildAiDlcLoopGrid(SAMPLE_STEPS);
      const titles = Array.from(grid.querySelectorAll(".whats-this-loop-card__title")).map((el) => el.textContent);

      expect(titles.length).toBe(6);
      expect(titles).toEqual(EXPECTED_TITLES);
    });

    it("buildAiDlcLoopSection(content) embeds all 6 cards from the content argument within the section, sourced from data not hardcoded (AC1, AC2)", async () => {
      await loadWhatsThisContentModule();

      const section = window.buildAiDlcLoopSection({ heading: "THE AI-DLC LOOP", steps: SAMPLE_STEPS });
      const cards = Array.from(section.querySelectorAll(".whats-this-loop-card"));

      expect(cards.length).toBe(6);
      cards.forEach((card, i) => {
        expect(card.querySelector(".whats-this-loop-card__title").textContent).toBe(EXPECTED_TITLES[i]);
        expect(card.querySelector(".whats-this-loop-card__description").textContent).toBe(
          SAMPLE_STEPS[i].description,
        );
      });
    });

    it("buildAiDlcLoopSection(content) does not render README section 4's literal step-table language (AC2)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();
      const section = window.buildAiDlcLoopSection(content.aidlcLoop);

      expect(section.textContent).not.toContain("Open an issue (type:");
      expect(section.textContent).not.toContain("spawns a **sub-agent**");
      expect(section.textContent).not.toContain("Review the plan again, then write");
    });

    it("buildAiDlcLoopCard(step, index) places each card in a Bootstrap col-md-4 column (AC3: stacks on mobile, grid on desktop)", async () => {
      await loadWhatsThisContentModule();

      const col = window.buildAiDlcLoopCard(SAMPLE_STEPS[0], 0);

      expect(col.className).toContain("col-md-4");
    });

    it("buildAiDlcLoopGrid(steps) wraps cards in a Bootstrap row for the responsive grid (AC3)", async () => {
      await loadWhatsThisContentModule();

      const grid = window.buildAiDlcLoopGrid(SAMPLE_STEPS);

      expect(grid.className).toContain("row");
    });
  });
})();
