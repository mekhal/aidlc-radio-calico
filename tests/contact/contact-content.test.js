/**
 * Issue #432: the Contact Info column's inspiration paragraph
 * (#contact-info-root) now follows the site-wide language toggle instead of
 * always rendering both Thai and English together — reversing the
 * "bilingual by design, no state.lang branching" decision #419/#153 shipped,
 * per @mekhal's feedback after seeing it live (see issue #432's body:
 * "ฝั่ง แรงบันดาลใจ ควรทำเป็น 2 ภาษา ล้อกับ toggle", and the 2026-08-21
 * review clarification "ผมต้องการให้แสดง 2 ภาษาตาม toggle ภาษา").
 *
 * Still sourced from data/contact-content.json's existing
 * inspiration.th/inspiration.en fields (AC3 from #419 — no schema change),
 * but buildContactInfoSection(content, state) now also takes `state`
 * (mirroring about/about.js's buildStandardsSection(state, standards)) and
 * renders a single inspiration <p> whose text/lang reflect state.lang,
 * pushing a render() callback onto state.onLanguageChange so it swaps live
 * on toggle — same pattern as about.js's buildStandardsSection().
 *
 * "Mekha Lomlao" / the email stay fixed, not language-dependent (issue #432
 * body, explicitly out of scope).
 *
 * See tests/contact/contact-form.test.js for the companion change to
 * buildContactFormSection(state)'s field labels/submit button, folded into
 * the same ticket per @mekhal's 2026-08-21 review comment ("รวมไว้ใน Ticket
 * นี้เลย ... ไปพร้อมกันใน PR เดียว").
 *
 * docs/knowledge-asset/published/test-pr-native-api-and-self-ref-checklist.md
 * consulted: no native API override in this file (n/a), and it is not a
 * candidate for the in-app Test Report modal's auto-run list — wired only
 * into tests/test-runner.html, same as before.
 *
 * Written before contact/contact.js's buildContactInfoSection() gains the
 * `state` parameter, per TDD — fails until this issue's Code PR (step 6)
 * makes that change.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const EXPECTED_TH =
    "แรงบันดาลใจของโปรเจกต์นี้เกิดจากความตั้งใจยกระดับประสิทธิภาพของ AI ให้สามารถผลิตผลงานที่มีคุณภาพ ตรงตามความต้องการของผู้พัฒนาระบบ และพร้อมสำหรับการใช้งานจริงบน Production หากพบปัญหา ก็สามารถตรวจสอบย้อนกลับได้อย่างมีประสิทธิภาพ หากท่านสนใจแลกเปลี่ยนความคิดเห็น สามารถส่งอีเมลติดต่อมาได้ผ่านฟอร์มนี้";
  const EXPECTED_EN =
    "This project was born from a drive to raise the quality bar for AI-produced work — output that meets what system developers actually need and is ready to ship to production, with problems traceable efficiently when they arise. If you'd like to share your thoughts, feel free to reach out through this form.";
  const EXPECTED_NAME = "Mekha Lomlao";
  const EXPECTED_EMAIL = "mekha.l@outlook.com";

  const SAMPLE_CONTENT = {
    inspiration: { th: "ตัวอย่างข้อความภาษาไทย", en: "Sample English copy." },
    name: "Sample Name",
    email: "sample@example.com",
  };

  async function loadContactContentModule() {
    await loadSharedModule(window.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadSharedModule(window.__CONTACT_JS_PATH__ || "../contact/contact.js");
  }

  function sampleState(lang) {
    const state = window.createState();
    state.lang = lang || "en";
    return state;
  }

  function inspirationParagraphs(section) {
    return Array.from(section.querySelectorAll("p")).filter((p) => p.className.includes("inspiration"));
  }

  describe("contact/contact.js (issue #432 — inspiration paragraph follows the language toggle)", () => {
    it("loadContactContent() fetches data/contact-content.json and returns the approved bilingual copy, name, and email (AC3 from #419, unchanged)", async () => {
      await loadContactContentModule();

      const content = await window.loadContactContent();

      expect(content.inspiration.th).toBe(EXPECTED_TH);
      expect(content.inspiration.en).toBe(EXPECTED_EN);
      expect(content.name).toBe(EXPECTED_NAME);
      expect(content.email).toBe(EXPECTED_EMAIL);
    });

    it("buildContactInfoSection(content, state) renders only the English inspiration paragraph when state.lang is 'en' (AC1)", async () => {
      await loadContactContentModule();
      const state = sampleState("en");

      const section = window.buildContactInfoSection(SAMPLE_CONTENT, state);

      expect(section.textContent).toContain(SAMPLE_CONTENT.inspiration.en);
      expect(section.textContent).not.toContain(SAMPLE_CONTENT.inspiration.th);
    });

    it("buildContactInfoSection(content, state) renders only the Thai inspiration paragraph when state.lang is 'th' (AC1)", async () => {
      await loadContactContentModule();
      const state = sampleState("th");

      const section = window.buildContactInfoSection(SAMPLE_CONTENT, state);

      expect(section.textContent).toContain(SAMPLE_CONTENT.inspiration.th);
      expect(section.textContent).not.toContain(SAMPLE_CONTENT.inspiration.en);
    });

    it("buildContactInfoSection(content, state) renders exactly one inspiration paragraph, never both at once (AC1)", async () => {
      await loadContactContentModule();
      const state = sampleState("en");

      const section = window.buildContactInfoSection(SAMPLE_CONTENT, state);

      expect(inspirationParagraphs(section).length).toBe(1);
    });

    it("buildContactInfoSection(content, state) sets the inspiration paragraph's lang attribute to state.lang (AC1, AC2)", async () => {
      await loadContactContentModule();
      const state = sampleState("th");

      const section = window.buildContactInfoSection(SAMPLE_CONTENT, state);
      const paragraph = inspirationParagraphs(section)[0];

      expect(paragraph.lang).toBe("th");
    });

    it("buildContactInfoSection(content, state) still renders the name and email regardless of language (AC5)", async () => {
      await loadContactContentModule();
      const state = sampleState("en");

      const section = window.buildContactInfoSection(SAMPLE_CONTENT, state);

      expect(section.textContent).toContain(SAMPLE_CONTENT.name);
      expect(section.textContent).toContain(SAMPLE_CONTENT.email);
    });

    it("buildContactInfoSection(content, state) orders its content top to bottom: inspiration paragraph, name, email (AC1, AC5)", async () => {
      await loadContactContentModule();
      const state = sampleState("en");

      const section = window.buildContactInfoSection(SAMPLE_CONTENT, state);
      const texts = Array.from(section.children).map((el) => el.textContent);

      const inspirationIndex = texts.findIndex((t) => t.includes(SAMPLE_CONTENT.inspiration.en));
      const nameIndex = texts.findIndex((t) => t.includes(SAMPLE_CONTENT.name));
      const emailIndex = texts.findIndex((t) => t.includes(SAMPLE_CONTENT.email));

      expect(inspirationIndex >= 0 && nameIndex >= 0 && emailIndex >= 0).toBeTruthy();
      expect(inspirationIndex < nameIndex).toBeTruthy();
      expect(nameIndex < emailIndex).toBeTruthy();
    });

    it("firing state.onLanguageChange swaps the inspiration paragraph from English to Thai without recreating the section (AC2)", async () => {
      await loadContactContentModule();
      const state = sampleState("en");

      const section = window.buildContactInfoSection(SAMPLE_CONTENT, state);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      expect(section.textContent).toContain(SAMPLE_CONTENT.inspiration.th);
      expect(section.textContent).not.toContain(SAMPLE_CONTENT.inspiration.en);
      expect(inspirationParagraphs(section).length).toBe(1);
    });

    it("firing state.onLanguageChange updates the inspiration paragraph's lang attribute too (AC2)", async () => {
      await loadContactContentModule();
      const state = sampleState("en");

      const section = window.buildContactInfoSection(SAMPLE_CONTENT, state);
      state.lang = "th";
      state.onLanguageChange.forEach((fn) => fn());

      expect(inspirationParagraphs(section)[0].lang).toBe("th");
    });
  });
})();
