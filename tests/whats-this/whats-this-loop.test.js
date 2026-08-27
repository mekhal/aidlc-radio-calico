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
 *
 * Issue #509 (Ticket 2 of the "What's this" bilingual + diagram story, part
 * of #505): this section embeds one diagram image via the shared
 * `buildSectionImage(state, image)` helper (AC2, AC4; see
 * tests/whats-this/whats-this-images.test.js for that helper's own tests).
 * Per the issue's approved plan, this section's image is the (untouched)
 * `aidlc-loop-gates.jpg` — the full 7-step loop diagram.
 *
 * Written before data/whats-this-content.json's aidlcLoop object gains an
 * `image` field and before whats-this.js exports buildSectionImage, per
 * TDD — fails until this issue's Code PR (step 6) adds both.
 *
 * Issue #522 follow-up review (2026-08-27, kept in this same issue per
 * @mekhal's explicit request): steps expand from 6 to CLAUDE.md's actual
 * 7 numbered loop steps, each title now prefixed with its step number.
 * EXPECTED_TITLES_EN/TH below are the new locked 7 titles, superseding the
 * 6 from #404/#152. Two content assertions were added to test the new
 * step 3 (Test PR waiver conditions) and step 7 (rework-loops-back-to-6 +
 * missed-functionality-becomes-a-new-issue) copy against CLAUDE.md's own
 * wording, same README-paraphrase-content-check precedent as
 * tests/whats-this/whats-this-skills.test.js's ".claude/skills/"/
 * "automatically" checks.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const EXPECTED_TITLES_EN = [
    "1. Issue Trigger",
    "2. Plan & AC",
    "3. Plan Approval Gate",
    "4. Test PR",
    "5. Test PR Approval Gate",
    "6. Code PR",
    "7. Review & Merge Gate",
  ];

  const EXPECTED_TITLES_TH = [
    "1. จุดเริ่ม Issue",
    "2. แผนงาน & เกณฑ์ (AC)",
    "3. ประตูอนุมัติแผน",
    "4. Test PR",
    "5. ประตูอนุมัติ Test PR",
    "6. Code PR",
    "7. ประตูรีวิว & Merge",
  ];

  const SAMPLE_TRANSLATIONS = {
    en: { whatsThisLoopHeading: "THE AI-DLC LOOP" },
    th: { whatsThisLoopHeading: "วงจร AI-DLC" },
  };

  const SAMPLE_STEPS = EXPECTED_TITLES_EN.map((titleEn, i) => ({
    title: { en: titleEn, th: EXPECTED_TITLES_TH[i] },
    description: { en: `Sample description for ${titleEn}.`, th: `คำอธิบายตัวอย่างสำหรับ ${titleEn}` },
  }));

  const SAMPLE_LOOP_IMAGE = {
    src: "aidlc-loop-gates.jpg",
    alt: {
      en: "Diagram of the full 7-step AI-DLC loop with human gates at every odd step",
      th: "แผนภาพวงจร AI-DLC ทั้ง 7 ขั้นตอน พร้อมประตูอนุมัติของมนุษย์ในทุกขั้นตอนคี่",
    },
    caption: {
      en: "A human gate sits at every odd step of the loop.",
      th: "ทุกขั้นตอนคี่ของวงจรมีประตูอนุมัติของมนุษย์",
    },
  };

  const SAMPLE_AIDLC_CONTENT = { steps: SAMPLE_STEPS, image: SAMPLE_LOOP_IMAGE };

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
    it("loadWhatsThisContent() fetches data/whats-this-content.json and returns 7 bilingual steps, English resolution equal to the locked titles, in order (AC1, issue #522 follow-up)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();

      expect(content.aidlcLoop).toBeTruthy();
      expect(content.aidlcLoop.steps.length).toBe(7);
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

      const section = window.buildAiDlcLoopSection(state, SAMPLE_AIDLC_CONTENT);
      const heading = section.querySelector("h2");

      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe("THE AI-DLC LOOP");
    });

    it("buildAiDlcLoopGrid(state, steps) renders exactly 7 cards with these exact English titles, in this exact order, by default (AC1)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const grid = window.buildAiDlcLoopGrid(state, SAMPLE_STEPS);
      const titles = Array.from(grid.querySelectorAll(".whats-this-loop-card__title")).map((el) => el.textContent);

      expect(titles.length).toBe(7);
      expect(titles).toEqual(EXPECTED_TITLES_EN);
    });

    it("buildAiDlcLoopSection(state, content) re-renders the heading, all 7 step titles, AND descriptions in Thai when the language changes, without a reload (issue #508 AC2, per @mekhal's 2026-08-25 decision to translate step names too)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildAiDlcLoopSection(state, SAMPLE_AIDLC_CONTENT);
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

    it("buildAiDlcLoopSection(state, content) embeds all 7 cards from the content argument within the section, sourced from data not hardcoded (AC1, AC2)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildAiDlcLoopSection(state, SAMPLE_AIDLC_CONTENT);
      const cards = Array.from(section.querySelectorAll(".whats-this-loop-card"));

      expect(cards.length).toBe(7);
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

    it("step 3's (Plan Approval Gate) English copy explains the Test PR waiver: the AI may propose it, but only the human's decision makes it final (issue #522 follow-up AC2)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();
      const planApprovalStep = content.aidlcLoop.steps[2];

      expect(planApprovalStep.title.en).toBe("3. Plan Approval Gate");
      expect(planApprovalStep.description.en.toLowerCase()).toContain("waive");
      expect(planApprovalStep.description.en.toLowerCase()).toContain("human");
    });

    it("step 7's (Review & Merge Gate) English copy covers rework looping back to step 6 and out-of-scope findings becoming a new issue (issue #522 follow-up AC3)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();
      const reviewMergeStep = content.aidlcLoop.steps[6];

      expect(reviewMergeStep.title.en).toBe("7. Review & Merge Gate");
      expect(reviewMergeStep.description.en.toLowerCase()).toContain("step 6");
      expect(reviewMergeStep.description.en.toLowerCase()).toContain("new issue");
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

    it("loadWhatsThisContent() returns the aidlcLoop section's image, aidlc-loop-gates.jpg (unchanged, already correctly named), with bilingual alt/caption (issue #509 AC1, AC3)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();

      expect(content.aidlcLoop.image).toBeTruthy();
      expect(content.aidlcLoop.image.src).toBe("aidlc-loop-gates.jpg");
      expect(typeof content.aidlcLoop.image.alt.en).toBe("string");
      expect(content.aidlcLoop.image.alt.en.length > 0).toBeTruthy();
      expect(typeof content.aidlcLoop.image.alt.th).toBe("string");
      expect(content.aidlcLoop.image.alt.th.length > 0).toBeTruthy();
      expect(typeof content.aidlcLoop.image.caption.en).toBe("string");
      expect(content.aidlcLoop.image.caption.en.length > 0).toBeTruthy();
      expect(typeof content.aidlcLoop.image.caption.th).toBe("string");
      expect(content.aidlcLoop.image.caption.th.length > 0).toBeTruthy();
    });

    it("buildAiDlcLoopSection(state, content) embeds exactly one image matching the section's image field, via the shared buildSectionImage helper (issue #509 AC2, AC4)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildAiDlcLoopSection(state, SAMPLE_AIDLC_CONTENT);
      const images = section.querySelectorAll('[data-testid="whats-this-image"]');

      expect(images.length).toBe(1);
      const img = images[0].querySelector("img");
      expect(img.getAttribute("src")).toBe(SAMPLE_LOOP_IMAGE.src);
      expect(img.getAttribute("alt")).toBe(SAMPLE_LOOP_IMAGE.alt.en);
    });

    it("buildAiDlcLoopSection(state, content) re-renders the image caption in Thai when the language changes (issue #509 AC3)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildAiDlcLoopSection(state, SAMPLE_AIDLC_CONTENT);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const caption = section.querySelector('[data-testid="whats-this-image-caption"]');
      expect(caption.textContent).toBe(SAMPLE_LOOP_IMAGE.caption.th);
    });
  });
})();
