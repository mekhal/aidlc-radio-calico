/**
 * Issue #419 (Ticket 2 of the "Contact" page story, part of #153), plan
 * approved on #153's linked comment: the Contact Info column
 * (#contact-info-root) — a bilingual inspiration paragraph (Thai, then
 * English, both always rendered — no language toggle, confirmed with
 * @mekhal in #153's review), followed by "Mekha Lomlao" and
 * "mekha.l@outlook.com", all sourced from a new data/contact-content.json
 * (AC3) rather than hardcoded in JS — same fetch-a-JSON-file pattern as
 * about/about.js's loadAboutContent() and whats-this/whats-this.js's
 * loadWhatsThisContent().
 *
 * Unlike about.js's buildProjectSection() (i18n'd via
 * ALBUM_PROMO_TRANSLATIONS/state.lang, one language visible at a time) or
 * whats-this.js's fixed-English-only sections, this content is bilingual by
 * design: both the Thai and English paragraphs render together, always, with
 * no state.lang branching at all — see the correction posted in #153's plan
 * comment. buildContactInfoSection(content) takes the resolved content
 * object as a plain argument rather than calling loadContactContent() itself,
 * so it stays synchronous/directly testable — contact-page.js is responsible
 * for awaiting loadContactContent() once (mirrors the already-shipped
 * window.__aboutPageContentReady/window.__whatsThisPageContentReady await
 * pattern) and mounting the result into #contact-info-root. That mounting
 * wiring is Code PR-only, not re-tested here (mirrors
 * tests/about/about-content.test.js's split from
 * tests/about/about-page.test.js).
 *
 * docs/knowledge-asset/published/test-pr-native-api-and-self-ref-checklist.md
 * consulted: no native API override in this file (n/a), and it is not a
 * candidate for the in-app Test Report modal's auto-run list
 * (tests/test-report-suite-files.js is scoped to app.js's own DOM interface
 * functions) — wired only into tests/test-runner.html, same as
 * tests/about/about-content.test.js and tests/whats-this/whats-this-content.test.js.
 *
 * Written before contact/contact.js and data/contact-content.json exist, per
 * TDD — fails until this issue's Code PR (step 6) creates both.
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
    await loadSharedModule(window.__CONTACT_JS_PATH__ || "../contact/contact.js");
  }

  describe("contact/contact.js (issue #419, Ticket 2 — Contact Info column)", () => {
    it("loadContactContent() fetches data/contact-content.json and returns the approved bilingual copy, name, and email (AC3)", async () => {
      await loadContactContentModule();

      const content = await window.loadContactContent();

      expect(content.inspiration.th).toBe(EXPECTED_TH);
      expect(content.inspiration.en).toBe(EXPECTED_EN);
      expect(content.name).toBe(EXPECTED_NAME);
      expect(content.email).toBe(EXPECTED_EMAIL);
    });

    it("buildContactInfoSection(content) renders both the Thai and English inspiration paragraphs from the content argument (AC3)", async () => {
      await loadContactContentModule();

      const section = window.buildContactInfoSection(SAMPLE_CONTENT);

      expect(section.textContent).toContain(SAMPLE_CONTENT.inspiration.th);
      expect(section.textContent).toContain(SAMPLE_CONTENT.inspiration.en);
    });

    it("buildContactInfoSection(content) renders the name and email from the content argument, not hardcoded (AC3)", async () => {
      await loadContactContentModule();

      const section = window.buildContactInfoSection(SAMPLE_CONTENT);

      expect(section.textContent).toContain(SAMPLE_CONTENT.name);
      expect(section.textContent).toContain(SAMPLE_CONTENT.email);
    });

    it("buildContactInfoSection(content) orders its content top to bottom: Thai paragraph, English paragraph, name, email (AC3)", async () => {
      await loadContactContentModule();

      const section = window.buildContactInfoSection(SAMPLE_CONTENT);
      const texts = Array.from(section.children).map((el) => el.textContent);

      const thIndex = texts.findIndex((t) => t.includes(SAMPLE_CONTENT.inspiration.th));
      const enIndex = texts.findIndex((t) => t.includes(SAMPLE_CONTENT.inspiration.en));
      const nameIndex = texts.findIndex((t) => t.includes(SAMPLE_CONTENT.name));
      const emailIndex = texts.findIndex((t) => t.includes(SAMPLE_CONTENT.email));

      expect(thIndex >= 0 && enIndex >= 0 && nameIndex >= 0 && emailIndex >= 0).toBeTruthy();
      expect(thIndex < enIndex).toBeTruthy();
      expect(enIndex < nameIndex).toBeTruthy();
      expect(nameIndex < emailIndex).toBeTruthy();
    });

    it("buildContactInfoSection(content) never renders both languages' paragraphs behind a toggle — both are always present in the DOM at once (AC3, no language toggle)", async () => {
      await loadContactContentModule();

      const section = window.buildContactInfoSection(SAMPLE_CONTENT);
      const thParagraph = Array.from(section.querySelectorAll("*")).find(
        (el) => el.textContent === SAMPLE_CONTENT.inspiration.th,
      );
      const enParagraph = Array.from(section.querySelectorAll("*")).find(
        (el) => el.textContent === SAMPLE_CONTENT.inspiration.en,
      );

      expect(thParagraph).toBeTruthy();
      expect(enParagraph).toBeTruthy();
      expect(thParagraph.hidden).toBeFalsy();
      expect(enParagraph.hidden).toBeFalsy();
    });
  });
})();
