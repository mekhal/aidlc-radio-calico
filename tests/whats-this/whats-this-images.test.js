/**
 * Issue #509 (Ticket 2 of the "What's this" bilingual + diagram story,
 * part of #505), step 3 decision (2026-08-25): this ticket gets its own
 * Test PR (step 4) before its Code PR (step 6) — see the issue body's
 * "Test PR" section.
 *
 * whats-this/whats-this.js's new shared `buildSectionImage(state, image)`
 * helper (AC4) — reused by all 3 "What's this" sections instead of each
 * section duplicating its own <img>/caption markup. Renders a responsive
 * image (`img-fluid`) plus a bilingual caption underneath (AC3), with an
 * `alt` attribute for accessibility (AC3). The `image` argument matches the
 * shape added to each section object in data/whats-this-content.json:
 * `{ src, alt: {en, th}, caption: {en, th} }`.
 *
 * Contract for the Code PR (step 6) to implement, per
 * docs/knowledge-asset/published/code-pr-implements-test-pr-contract.md:
 *   - `buildSectionImage(state, image)` returns a wrapper element with
 *     `dataset.testid === "whats-this-image"` and class `whats-this-image`.
 *   - It contains one `<img class="img-fluid whats-this-image__img">` whose
 *     `src` is `image.src` verbatim (not a bilingual field) and whose `alt`
 *     is `resolveBilingualField(image.alt, state.lang)`.
 *   - It contains one caption element with
 *     `dataset.testid === "whats-this-image-caption"` and class
 *     `whats-this-image__caption`, text = `resolveBilingualField(image.caption, state.lang)`.
 *   - Self-renders and self-subscribes to `state.onLanguageChange`, same
 *     pattern as every other builder in this file — both the caption AND
 *     the alt text update on language switch (both fields are bilingual in
 *     the data shape, and every other builder's `render()` updates all of
 *     its translatable fields together, not a subset).
 *   - `src` never changes across a language switch (it has no en/th split).
 *
 * test-pr-native-api-and-self-ref-checklist.md: no native browser API is
 * intercepted here (n/a), and this file is not added to
 * tests/test-report-suite-files.js's in-app auto-run list — same as the
 * other 3 whats-this/*.test.js files, wired only into tests/test-runner.html.
 *
 * Written before whats-this/whats-this.js exports buildSectionImage, per
 * TDD — fails until this issue's Code PR (step 6) adds it.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const SAMPLE_IMAGE = {
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

  async function loadWhatsThisContentModule() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_TRANSLATIONS_JS_PATH__ || "../shared/translations.js");
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_HELPERS_JS_PATH__ || "../shared/helpers.js");
    await loadSharedModule(window.__WHATS_THIS_JS_PATH__ || "../whats-this/whats-this.js");
  }

  function sampleState() {
    window.ALBUM_PROMO_TRANSLATIONS = { en: {}, th: {} };
    const state = window.createState();
    state.lang = "en";
    return state;
  }

  describe("whats-this/whats-this.js (issue #509, Ticket 2 — shared buildSectionImage helper)", () => {
    it("buildSectionImage(state, image) renders a responsive <img> with the image's src and the English alt text by default (AC3, AC4)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const el = window.buildSectionImage(state, SAMPLE_IMAGE);

      expect(el.dataset.testid).toBe("whats-this-image");

      const img = el.querySelector("img");
      expect(img).toBeTruthy();
      expect(img.className).toContain("img-fluid");
      expect(img.getAttribute("src")).toBe(SAMPLE_IMAGE.src);
      expect(img.getAttribute("alt")).toBe(SAMPLE_IMAGE.alt.en);
    });

    it("buildSectionImage(state, image) renders the English caption underneath the image by default (AC3)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const el = window.buildSectionImage(state, SAMPLE_IMAGE);
      const caption = el.querySelector('[data-testid="whats-this-image-caption"]');

      expect(caption).toBeTruthy();
      expect(caption.textContent).toBe(SAMPLE_IMAGE.caption.en);
    });

    it("buildSectionImage(state, image) re-renders both the caption AND the alt text in Thai when the language changes, without a reload (AC3)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const el = window.buildSectionImage(state, SAMPLE_IMAGE);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const img = el.querySelector("img");
      const caption = el.querySelector('[data-testid="whats-this-image-caption"]');

      expect(img.getAttribute("alt")).toBe(SAMPLE_IMAGE.alt.th);
      expect(caption.textContent).toBe(SAMPLE_IMAGE.caption.th);
    });

    it("buildSectionImage(state, image) never changes the img src when the language toggles (src has no en/th split)", async () => {
      await loadWhatsThisContentModule();
      const state = sampleState();

      const el = window.buildSectionImage(state, SAMPLE_IMAGE);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      const img = el.querySelector("img");
      expect(img.getAttribute("src")).toBe(SAMPLE_IMAGE.src);
    });
  });
})();
