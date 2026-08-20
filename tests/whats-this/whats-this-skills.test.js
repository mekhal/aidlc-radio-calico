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
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const SAMPLE_CONTENT = {
    heading: "SKILL CAPTURE & REUSE",
    firstTime: { title: "First Time", body: "Sample first-time body copy." },
    nextTime: { title: "Next Time", body: "Sample next-time body copy." },
  };

  async function loadWhatsThisContentModule() {
    await loadSharedModule(window.__WHATS_THIS_JS_PATH__ || "../whats-this/whats-this.js");
  }

  describe('whats-this/whats-this.js (issue #405, Ticket 4 — Section 3: Skill Capture & Reuse)', () => {
    it("loadWhatsThisContent() fetches data/whats-this-content.json and returns the skillCapture heading + firstTime/nextTime cards", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();

      expect(content.skillCapture).toBeTruthy();
      expect(content.skillCapture.heading).toBe("SKILL CAPTURE & REUSE");
      expect(content.skillCapture.firstTime.title).toBe("First Time");
      expect(content.skillCapture.nextTime.title).toBe("Next Time");
      expect(typeof content.skillCapture.firstTime.body).toBe("string");
      expect(content.skillCapture.firstTime.body.length > 0).toBeTruthy();
      expect(typeof content.skillCapture.nextTime.body).toBe("string");
      expect(content.skillCapture.nextTime.body.length > 0).toBeTruthy();
    });

    it("buildSkillCaptureSection(content) renders a heading reading exactly SKILL CAPTURE & REUSE", async () => {
      await loadWhatsThisContentModule();

      const section = window.buildSkillCaptureSection(SAMPLE_CONTENT);
      const heading = section.querySelector("h2");

      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe("SKILL CAPTURE & REUSE");
    });

    it("buildSkillCaptureSection(content) renders exactly 2 cards titled First Time and Next Time, in that order (AC1)", async () => {
      await loadWhatsThisContentModule();

      const section = window.buildSkillCaptureSection(SAMPLE_CONTENT);
      const titles = Array.from(section.querySelectorAll(".whats-this-skill-card__title")).map(
        (el) => el.textContent,
      );

      expect(titles).toEqual(["First Time", "Next Time"]);
    });

    it("buildSkillCaptureGrid(content) wraps both cards in a Bootstrap row of col-md-6 columns (AC1: stacks on mobile, 2-up on desktop)", async () => {
      await loadWhatsThisContentModule();

      const grid = window.buildSkillCaptureGrid(SAMPLE_CONTENT);
      const cols = Array.from(grid.querySelectorAll(".whats-this-skill-card-col"));

      expect(grid.className).toContain("row");
      expect(cols.length).toBe(2);
      cols.forEach((col) => expect(col.className).toContain("col-md-6"));
    });

    it("buildSkillCaptureSection(content) embeds the First Time and Next Time body copy from the content argument, sourced from data not hardcoded (AC2, AC3)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();
      const section = window.buildSkillCaptureSection(content.skillCapture);

      expect(section.textContent).toContain(content.skillCapture.firstTime.body);
      expect(section.textContent).toContain(content.skillCapture.nextTime.body);
    });

    it("First Time copy describes a new skill being captured into .claude/skills/ (AC2)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();

      expect(content.skillCapture.firstTime.body).toContain(".claude/skills/");
    });

    it("Next Time copy describes the agent automatically reusing the stored skill (AC3)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();

      expect(content.skillCapture.nextTime.body.toLowerCase()).toContain("automatically");
    });

    it("buildSkillCaptureSection(content) does not render README section 7's literal language (AC4)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();
      const section = window.buildSkillCaptureSection(content.skillCapture);

      expect(section.textContent).not.toContain("The heart of making the agent");
      expect(section.textContent).not.toContain("turning **human decisions** into **reusable skills**");
      expect(section.textContent).not.toContain("clears the same kind of gates as a Code PR");
    });
  });
})();
