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
 *
 * Issue #508 (Ticket 1 of the "What's this" bilingual story, part of #505):
 * Section 1 becomes bilingual, per the ticket's plan/AC:
 *   - AC2: whatIsThis.body is now a { en, th } object, resolved via the
 *     shared resolveBilingualField() (see tests/shared/shared-helpers.test.js).
 *   - AC3: whatIsThis.badges stays a fixed array of English strings — same
 *     fixed-proper-noun/term-of-art treatment as about.js's "Mega-Linter"/
 *     "Trivy" — and must NOT change when the language toggles.
 *   - The "WHAT IS THIS?" heading moves out of the content JSON entirely and
 *     into a new i18n key, `whatsThisWhatHeading`, in
 *     i18n/album-promo-en.json / -th.json — same precedent as about.js's
 *     aboutProjectHeading (about.js's own data/about-content.json carries no
 *     heading field for that section either). buildWhatIsThisSection(content)
 *     becomes buildWhatIsThisSection(state, content) — it self-renders and
 *     self-subscribes to state.onLanguageChange, same pattern as
 *     about.js's buildProjectSection(state)/buildStandardsSection(state, ...).
 *
 * Written before shared/helpers.js exports resolveBilingualField, before
 * about/about.js's ALBUM_PROMO_TRANSLATIONS gain the whatsThisWhatHeading
 * key, and before whats-this/whats-this.js's signatures change, per TDD —
 * fails until this issue's Code PR (step 6) adds all three.
 *
 * Issue #509 (Ticket 2 of the "What's this" bilingual + diagram story, part
 * of #505): this section embeds one diagram image via the shared
 * `buildSectionImage(state, image)` helper (AC2, AC4; see
 * tests/whats-this/whats-this-images.test.js for that helper's own tests).
 * Per the issue's approved plan, this section's image is the renamed
 * `code-pr-gates.jpg` (Step 7 Code PR Gates diagram — AC1 renames it from
 * `skill-reuse-gates.jpg`, its pre-rename, content-mismatched name).
 *
 * Written before data/whats-this-content.json's whatIsThis object gains an
 * `image` field and before whats-this.js exports buildSectionImage, per
 * TDD — fails until this issue's Code PR (step 6) adds both.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const EXPECTED_BADGES = ["Human-in-the-loop", "TDD", "Skill Capture & Reuse", "Production-grade"];

  const SAMPLE_TRANSLATIONS = {
    en: { whatsThisWhatHeading: "WHAT IS THIS?" },
    th: { whatsThisWhatHeading: "นี่คืออะไร?" },
  };

  const SAMPLE_WHAT_IMAGE = {
    src: "code-pr-gates.jpg",
    alt: {
      en: "Diagram of the Step 7 Code PR review and merge gate",
      th: "แผนภาพขั้นตอนที่ 7 ประตูรีวิวและ merge ของ Code PR",
    },
    caption: {
      en: "Every Code PR clears human review before it merges.",
      th: "ทุก Code PR ต้องผ่านการรีวิวจากมนุษย์ก่อน merge",
    },
  };

  const SAMPLE_WHAT_IS_THIS = {
    body: { en: "A process demo, not just a radio app.", th: "การสาธิตกระบวนการ ไม่ใช่แค่แอปวิทยุ" },
    badges: EXPECTED_BADGES,
    image: SAMPLE_WHAT_IMAGE,
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

  describe("whats-this/whats-this.js (issue #403/#508, Ticket 2 — Section 1: What is this?)", () => {
    it("loadWhatsThisContent() fetches data/whats-this-content.json and returns the whatIsThis body (bilingual) + badges (fixed English) (issue #508 AC2, AC3)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();

      expect(content.whatIsThis).toBeTruthy();
      expect(typeof content.whatIsThis.body.en).toBe("string");
      expect(content.whatIsThis.body.en.length > 0).toBeTruthy();
      expect(typeof content.whatIsThis.body.th).toBe("string");
      expect(content.whatIsThis.body.th.length > 0).toBeTruthy();
      expect(content.whatIsThis.badges).toEqual(EXPECTED_BADGES);
    });

    it("buildWhatIsThisSection(state, content) renders a serif heading reading exactly WHAT IS THIS? in English by default, sourced from i18n not content (AC1, issue #508)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildWhatIsThisSection(state, SAMPLE_WHAT_IS_THIS);
      const heading = section.querySelector("h1, h2");

      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe("WHAT IS THIS?");
    });

    it("buildWhatIsThisSection(state, content) renders the English body copy resolved from the bilingual body field (AC2, AC4)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildWhatIsThisSection(state, SAMPLE_WHAT_IS_THIS);

      expect(section.textContent).toContain("A process demo, not just a radio app.");
    });

    it("buildWhatIsThisSection(state, content) re-renders the heading AND body copy in Thai when the language changes, without a reload (issue #508 AC2)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildWhatIsThisSection(state, SAMPLE_WHAT_IS_THIS);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const heading = section.querySelector("h1, h2");
      expect(heading.textContent).toBe("นี่คืออะไร?");
      expect(section.textContent).toContain("การสาธิตกระบวนการ ไม่ใช่แค่แอปวิทยุ");
    });

    it("buildWhatIsThisSection(state, content) keeps the badges fixed in English after switching to Thai (issue #508 AC3)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildWhatIsThisSection(state, SAMPLE_WHAT_IS_THIS);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const badges = Array.from(section.querySelectorAll(".chloe-whats-this-badge")).map((b) => b.textContent);
      expect(badges).toEqual(EXPECTED_BADGES);
    });

    it("buildWhatIsThisSection(state, content) does not render README's verbatim section 1 text (AC2)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const content = await window.loadWhatsThisContent();
      const section = window.buildWhatIsThisSection(state, content.whatIsThis);

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

    it("buildWhatIsThisSection(state, content) embeds all 4 badges from the content argument within the section (AC3, AC4)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildWhatIsThisSection(state, SAMPLE_WHAT_IS_THIS);
      const badges = Array.from(section.querySelectorAll(".chloe-whats-this-badge"));

      expect(badges.length).toBe(4);
      expect(badges.map((b) => b.textContent)).toEqual(EXPECTED_BADGES);
    });

    it("loadWhatsThisContent() returns the whatIsThis section's image, renamed to code-pr-gates.jpg (the Step 7 Code PR Gates diagram), with bilingual alt/caption (issue #509 AC1, AC3)", async () => {
      await loadWhatsThisContentModule();

      const content = await window.loadWhatsThisContent();

      expect(content.whatIsThis.image).toBeTruthy();
      expect(content.whatIsThis.image.src).toBe("code-pr-gates.jpg");
      expect(typeof content.whatIsThis.image.alt.en).toBe("string");
      expect(content.whatIsThis.image.alt.en.length > 0).toBeTruthy();
      expect(typeof content.whatIsThis.image.alt.th).toBe("string");
      expect(content.whatIsThis.image.alt.th.length > 0).toBeTruthy();
      expect(typeof content.whatIsThis.image.caption.en).toBe("string");
      expect(content.whatIsThis.image.caption.en.length > 0).toBeTruthy();
      expect(typeof content.whatIsThis.image.caption.th).toBe("string");
      expect(content.whatIsThis.image.caption.th.length > 0).toBeTruthy();
    });

    it("buildWhatIsThisSection(state, content) embeds exactly one image matching the section's image field, via the shared buildSectionImage helper (issue #509 AC2, AC4)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildWhatIsThisSection(state, SAMPLE_WHAT_IS_THIS);
      const images = section.querySelectorAll('[data-testid="whats-this-image"]');

      expect(images.length).toBe(1);
      const img = images[0].querySelector("img");
      expect(img.getAttribute("src")).toBe(SAMPLE_WHAT_IMAGE.src);
      expect(img.getAttribute("alt")).toBe(SAMPLE_WHAT_IMAGE.alt.en);
    });

    it("buildWhatIsThisSection(state, content) re-renders the image caption in Thai when the language changes (issue #509 AC3)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const section = window.buildWhatIsThisSection(state, SAMPLE_WHAT_IS_THIS);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const caption = section.querySelector('[data-testid="whats-this-image-caption"]');
      expect(caption.textContent).toBe(SAMPLE_WHAT_IMAGE.caption.th);
    });
  });
})();
