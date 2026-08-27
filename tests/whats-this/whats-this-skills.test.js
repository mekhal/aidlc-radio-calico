/**
 * Issue #405 (Ticket 4 of the "What's this" page story, part of #152),
 * step 3 waiver approved (2026-08-20): Test PR skipped for this ticket, per
 * the human's "approved waiver Test PR. and start Code PR" - these tests are
 * bundled directly into the Code PR instead, demonstrating AC1-AC4 are met
 * (CLAUDE.md's Definition of Done, "tests bundled into the Code PR" option) -
 * same waiver pattern as tests/whats-this/whats-this-loop.test.js
 * (issue #404, Ticket 3).
 *
 * Section 3, "Skill Capture & Reuse" - a two-column "First Time" / "Next
 * Time" comparison (AC1), "First Time" paraphrasing a new skill being
 * captured from a human decision/feedback into .claude/skills/ (AC2), "Next
 * Time" paraphrasing the agent automatically reusing that stored skill in
 * later loops (AC3), all data-driven from data/whats-this-content.json's new
 * skillCapture field, general-audience paraphrase of README section 7 rather
 * than verbatim (AC4).
 *
 * buildSkillCaptureSection(content) takes the resolved skillCapture object as
 * a plain argument rather than calling loadWhatsThisContent() itself, same
 * synchronous/directly-testable convention as buildAiDlcLoopSection().
 *
 * Issue #508 (Ticket 1 of the "What's this" bilingual story, part of #505):
 * Section 3 becomes bilingual, per the ticket's plan/AC:
 *   - AC2/AC3: firstTime/nextTime's `title` AND `body` are now { en, th }
 *     objects, resolved via the shared resolveBilingualField().
 *   - The "SKILL CAPTURE & REUSE" heading moves out of the content JSON and
 *     into a new i18n key, `whatsThisSkillsHeading`, same precedent as
 *     Section 1/2's `whatsThisWhatHeading`/`whatsThisLoopHeading`.
 *     buildSkillCaptureSection(content) becomes
 *     buildSkillCaptureSection(state, content) — it, buildSkillCaptureGrid(),
 *     and buildSkillCaptureCard() self-render and self-subscribe to
 *     state.onLanguageChange, same pattern as buildAiDlcLoopSection(state, ...).
 *
 * The README-paraphrase content checks (".claude/skills/" / "automatically")
 * below are asserted against the English resolution only — they describe
 * wording constraints on the English copy (AC2/AC3/AC4), not a claim about
 * the Thai translation's literal substrings.
 *
 * Written before shared/helpers.js exports resolveBilingualField, before
 * about/about.js's ALBUM_PROMO_TRANSLATIONS gain the whatsThisSkillsHeading
 * key, and before whats-this/whats-this.js's signatures change, per TDD —
 * fails until this issue's Code PR (step 6) adds all three.
 *
 * Issue #509 (Ticket 2 of the "What's this" bilingual + diagram story, part
 * of #505): this section embeds one diagram image via the shared
 * `buildSectionImage(state, image)` helper (AC2, AC4; see
 * tests/whats-this/whats-this-images.test.js for that helper's own tests).
 * Per the issue's approved plan, this section's image is the renamed
 * `skill-reuse-gates.png` (Capture -> Distill -> Store -> Reuse -> Evolve
 * diagram — AC1 renames it from `code-pr-gates.png`, its pre-rename,
 * content-mismatched name).
 *
 * Written before data/whats-this-content.json's skillCapture object gains an
 * `image` field and before whats-this.js exports buildSectionImage, per
 * TDD — fails until this issue's Code PR (step 6) adds both.
 *
 * Issue #522 follow-up review (2026-08-27, kept in this same issue per
 * @mekhal's explicit request): skillCapture gains a new bilingual `intro`
 * field (AC4), rendered by buildSkillCaptureSection() as a paragraph right
 * after the heading, clarifying this capture-and-reuse cycle runs after the
 * 7-step loop closes rather than being folded into that loop's own
 * numbering (previously implied by a "Close & Capture Gate" 6th loop card,
 * now removed from tests/whats-this/whats-this-loop.test.js).
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const SAMPLE_TRANSLATIONS = {
    en: { whatsThisSkillsHeading: "SKILL CAPTURE & REUSE" },
    th: { whatsThisSkillsHeading: "การเก็บและใช้ทักษะซ้ำ" },
  };

  const SAMPLE_SKILL_IMAGE = {
    src: "skill-reuse-gates.png",
    alt: {
      en: "Diagram of the Capture, Distill, Store, Reuse, Evolve skill lifecycle",
      th: "แผนภาพวงจรทักษะ: เก็บ กลั่นกรอง จัดเก็บ นำกลับมาใช้ พัฒนา",
    },
    caption: {
      en: "Every human decision can become a reusable skill for next time.",
      th: "การตัดสินใจของมนุษย์ทุกครั้งสามารถกลายเป็นทักษะที่นำกลับมาใช้ใหม่ได้",
    },
  };

  const SAMPLE_INTRO = {
    en: "Sample intro: this cycle runs after the loop closes.",
    th: "ตัวอย่างบทนำ: วงจรนี้เกิดขึ้นหลังจากวงจรหลักปิดแล้ว",
  };

  const SAMPLE_CONTENT = {
    intro: SAMPLE_INTRO,
    firstTime: {
      title: { en: "First Time", th: "ครั้งแรก" },
      body: { en: "Sample first-time body copy.", th: "ตัวอย่างเนื้อหาครั้งแรก" },
    },
    nextTime: {
      title: { en: "Next Time", th: "ครั้งต่อไป" },
      body: { en: "Sample next-time body copy.", th: "ตัวอย่างเนื้อหาครั้งต่อไป" },
    },
    image: SAMPLE_SKILL_IMAGE,
  };

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

  describe('whats-this/whats-this.js (issue #405/#508, Ticket 4 — Section 3: Skill Capture & Reuse)', () => {
    it("loadWhatsThisContent() fetches data/whats-this-content.json and returns bilingual firstTime/nextTime title+body (issue #508 AC2, AC3)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();

      expect(content.skillCapture).toBeTruthy();
      expect(content.skillCapture.firstTime.title.en).toBe("First Time");
      expect(typeof content.skillCapture.firstTime.title.th).toBe("string");
      expect(content.skillCapture.firstTime.title.th.length > 0).toBeTruthy();
      expect(content.skillCapture.nextTime.title.en).toBe("Next Time");
      expect(typeof content.skillCapture.nextTime.title.th).toBe("string");
      expect(content.skillCapture.nextTime.title.th.length > 0).toBeTruthy();
      expect(typeof content.skillCapture.firstTime.body.en).toBe("string");
      expect(content.skillCapture.firstTime.body.en.length > 0).toBeTruthy();
      expect(typeof content.skillCapture.firstTime.body.th).toBe("string");
      expect(content.skillCapture.firstTime.body.th.length > 0).toBeTruthy();
      expect(typeof content.skillCapture.nextTime.body.en).toBe("string");
      expect(content.skillCapture.nextTime.body.en.length > 0).toBeTruthy();
      expect(typeof content.skillCapture.nextTime.body.th).toBe("string");
      expect(content.skillCapture.nextTime.body.th.length > 0).toBeTruthy();
    });

    it("loadWhatsThisContent() returns a bilingual skillCapture.intro clarifying this cycle runs after the loop closes (issue #522 follow-up AC4)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();

      expect(typeof content.skillCapture.intro.en).toBe("string");
      expect(content.skillCapture.intro.en.length > 0).toBeTruthy();
      expect(typeof content.skillCapture.intro.th).toBe("string");
      expect(content.skillCapture.intro.th.length > 0).toBeTruthy();
      expect(content.skillCapture.intro.en.toLowerCase()).not.toContain("close & capture gate");
    });

    it("buildSkillCaptureSection(state, content) renders the intro paragraph before the cards, re-rendering in Thai on language change (issue #522 follow-up AC4)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildSkillCaptureSection(state, SAMPLE_CONTENT);
      const intro = section.querySelector('[data-testid="whats-this-skills-intro"]');

      expect(intro).toBeTruthy();
      expect(intro.textContent).toBe(SAMPLE_INTRO.en);

      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      expect(intro.textContent).toBe(SAMPLE_INTRO.th);
    });

    it("buildSkillCaptureSection(state, content) renders a heading reading exactly SKILL CAPTURE & REUSE in English by default, sourced from i18n (issue #508)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildSkillCaptureSection(state, SAMPLE_CONTENT);
      const heading = section.querySelector("h2");

      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe("SKILL CAPTURE & REUSE");
    });

    it("buildSkillCaptureSection(state, content) renders exactly 2 cards titled First Time and Next Time, in that order, by default (AC1)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildSkillCaptureSection(state, SAMPLE_CONTENT);
      const titles = Array.from(section.querySelectorAll(".whats-this-skill-card__title")).map(
        (el) => el.textContent,
      );

      expect(titles).toEqual(["First Time", "Next Time"]);
    });

    it("buildSkillCaptureGrid(state, content) wraps both cards in a Bootstrap row of col-md-6 columns (AC1: stacks on mobile, 2-up on desktop)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const grid = window.buildSkillCaptureGrid(state, SAMPLE_CONTENT);
      const cols = Array.from(grid.querySelectorAll(".whats-this-skill-card-col"));

      expect(grid.className).toContain("row");
      expect(cols.length).toBe(2);
      cols.forEach((col) => expect(col.className).toContain("col-md-6"));
    });

    it("buildSkillCaptureSection(state, content) embeds the English First Time and Next Time body copy from the content argument, sourced from data not hardcoded, by default (AC2, AC3)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const content = await window.loadWhatsThisContent();
      const section = window.buildSkillCaptureSection(state, content.skillCapture);

      expect(section.textContent).toContain(content.skillCapture.firstTime.body.en);
      expect(section.textContent).toContain(content.skillCapture.nextTime.body.en);
    });

    it("buildSkillCaptureSection(state, content) re-renders the heading, both card titles, AND bodies in Thai when the language changes, without a reload (issue #508 AC2, AC3)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildSkillCaptureSection(state, SAMPLE_CONTENT);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const heading = section.querySelector("h2");
      expect(heading.textContent).toBe("การเก็บและใช้ทักษะซ้ำ");

      const titles = Array.from(section.querySelectorAll(".whats-this-skill-card__title")).map(
        (el) => el.textContent,
      );
      expect(titles).toEqual(["ครั้งแรก", "ครั้งต่อไป"]);

      expect(section.textContent).toContain(SAMPLE_CONTENT.firstTime.body.th);
      expect(section.textContent).toContain(SAMPLE_CONTENT.nextTime.body.th);
    });

    it("First Time English copy describes a new skill being captured into .claude/skills/ (AC2)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();

      expect(content.skillCapture.firstTime.body.en).toContain(".claude/skills/");
    });

    it("Next Time English copy describes the agent automatically reusing the stored skill (AC3)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();

      expect(content.skillCapture.nextTime.body.en.toLowerCase()).toContain("automatically");
    });

    it("buildSkillCaptureSection(state, content) does not render README section 7's literal language (AC4)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const content = await window.loadWhatsThisContent();
      const section = window.buildSkillCaptureSection(state, content.skillCapture);

      expect(section.textContent).not.toContain("The heart of making the agent");
      expect(section.textContent).not.toContain("turning **human decisions** into **reusable skills**");
      expect(section.textContent).not.toContain("clears the same kind of gates as a Code PR");
    });

    it("loadWhatsThisContent() returns the skillCapture section's image, renamed to skill-reuse-gates.png (the Capture/Distill/Store/Reuse/Evolve diagram), with bilingual alt/caption (issue #509 AC1, AC3)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();

      expect(content.skillCapture.image).toBeTruthy();
      expect(content.skillCapture.image.src).toBe("skill-reuse-gates.png");
      expect(typeof content.skillCapture.image.alt.en).toBe("string");
      expect(content.skillCapture.image.alt.en.length > 0).toBeTruthy();
      expect(typeof content.skillCapture.image.alt.th).toBe("string");
      expect(content.skillCapture.image.alt.th.length > 0).toBeTruthy();
      expect(typeof content.skillCapture.image.caption.en).toBe("string");
      expect(content.skillCapture.image.caption.en.length > 0).toBeTruthy();
      expect(typeof content.skillCapture.image.caption.th).toBe("string");
      expect(content.skillCapture.image.caption.th.length > 0).toBeTruthy();
    });

    it("buildSkillCaptureSection(state, content) embeds exactly one image matching the section's image field, via the shared buildSectionImage helper (issue #509 AC2, AC4)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildSkillCaptureSection(state, SAMPLE_CONTENT);
      const images = section.querySelectorAll('[data-testid="whats-this-image"]');

      expect(images.length).toBe(1);
      const img = images[0].querySelector("img");
      expect(img.getAttribute("src")).toBe(SAMPLE_SKILL_IMAGE.src);
      expect(img.getAttribute("alt")).toBe(SAMPLE_SKILL_IMAGE.alt.en);
    });

    it("buildSkillCaptureSection(state, content) re-renders the image caption in Thai when the language changes (issue #509 AC3)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildSkillCaptureSection(state, SAMPLE_CONTENT);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const caption = section.querySelector('[data-testid="whats-this-image-caption"]');
      expect(caption.textContent).toBe(SAMPLE_SKILL_IMAGE.caption.th);
    });
  });
})();
