/**
 * Issue #403 (Ticket 2 of the "What's this" page story, part of #152),
 * step 3 waiver approved (2026-08-20): Test PR skipped for this ticket, per
 * the human's "approved waiver Test PR. Please start Code PR" — these tests
 * are bundled directly into the Code PR instead, demonstrating AC1-AC4 are
 * met (CLAUDE.md's Definition of Done, "tests bundled into the Code PR"
 * option).
 *
 * Section 1, "What is this?" — a serif "WHAT IS THIS?" heading (AC1), a
 * general-audience paragraph paraphrasing README section 1's core claim
 * (AC2), and a 4-badge highlight row (AC3), all data-driven from
 * data/whats-this-content.json (AC4) rather than hardcoded in JS — same
 * fetch-a-JSON-file pattern as tests/about/about-content.test.js.
 *
 * buildWhatIsThisSection(content) takes the resolved whatIsThis object as a
 * plain argument rather than calling loadWhatsThisContent() itself, so the
 * section builder stays synchronous/directly testable — whats-this-page.js's
 * own wiring (awaiting loadWhatsThisContent() once and appending the result)
 * is Ticket 1-shipped-page scope, not re-tested here (mirrors
 * tests/about/about-content.test.js's split from tests/about/about-page.test.js).
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const EXPECTED_BADGES = ["Human-in-the-loop", "TDD", "Skill Capture & Reuse", "Production-grade"];

  async function loadWhatsThisContentModule() {
    await loadSharedModule(window.__WHATS_THIS_JS_PATH__ || "../whats-this/whats-this.js");
  }

  describe("whats-this/whats-this.js (issue #403, Ticket 2 — Section 1: What is this?)", () => {
    it("loadWhatsThisContent() fetches data/whats-this-content.json and returns the whatIsThis heading/body/badges", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();

      expect(content.whatIsThis).toBeTruthy();
      expect(content.whatIsThis.heading).toBe("WHAT IS THIS?");
      expect(typeof content.whatIsThis.body).toBe("string");
      expect(content.whatIsThis.body.length > 0).toBeTruthy();
      expect(content.whatIsThis.badges).toEqual(EXPECTED_BADGES);
    });

    it("buildWhatIsThisSection(content) renders a serif heading reading exactly WHAT IS THIS? (AC1)", async () => {
      await loadWhatsThisContentModule();

      const section = window.buildWhatIsThisSection({
        heading: "WHAT IS THIS?",
        body: "Sample body copy.",
        badges: EXPECTED_BADGES,
      });
      const heading = section.querySelector("h1, h2");

      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe("WHAT IS THIS?");
    });

    it("buildWhatIsThisSection(content) renders the body copy sourced from the content argument, not hardcoded (AC2, AC4)", async () => {
      await loadWhatsThisContentModule();

      const section = window.buildWhatIsThisSection({
        heading: "WHAT IS THIS?",
        body: "A process demo, not just a radio app.",
        badges: EXPECTED_BADGES,
      });

      expect(section.textContent).toContain("A process demo, not just a radio app.");
    });

    it("buildWhatIsThisSection(content) does not render README's verbatim section 1 text (AC2)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();
      const section = window.buildWhatIsThisSection(content.whatIsThis);

      expect(section.textContent).not.toContain("This repo is **not an application**");
      expect(section.textContent).not.toContain("it is a **process demo**");
    });

    it("buildBadgeRow(badges) renders one badge per label, in order (AC3)", async () => {
      await loadWhatsThisContentModule();

      const row = window.buildBadgeRow(EXPECTED_BADGES);
      const badges = Array.from(row.querySelectorAll(".chloe-whats-this-badge"));

      expect(badges.length).toBe(4);
      badges.forEach((badge, i) => {
        expect(badge.textContent).toBe(EXPECTED_BADGES[i]);
      });
    });

    it("buildWhatIsThisSection(content) embeds all 4 badges from the content argument within the section (AC3, AC4)", async () => {
      await loadWhatsThisContentModule();

      const section = window.buildWhatIsThisSection({
        heading: "WHAT IS THIS?",
        body: "Sample body copy.",
        badges: EXPECTED_BADGES,
      });
      const badges = Array.from(section.querySelectorAll(".chloe-whats-this-badge"));

      expect(badges.length).toBe(4);
      expect(badges.map((b) => b.textContent)).toEqual(EXPECTED_BADGES);
    });
  });
})();
