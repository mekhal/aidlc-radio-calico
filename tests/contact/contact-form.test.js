/**
 * Issue #420 (Ticket 3 of the "Contact" page story, part of #153), plan
 * approved on #153's linked comment: the Contact Form column
 * (#contact-form-root) — a white/clean card with Name (text, required),
 * Email (email, required, type="email"), Message (textarea, required), and a
 * Submit button. Submitting opens the visitor's email client addressed to
 * mekha.l@outlook.com with the entered content (AC4) — no server endpoint,
 * no on-page confirmation fallback, no custom JS validation beyond the
 * native HTML5 required/type="email" constraints (per @mekhal's review
 * answers on #153, referenced in this ticket's issue body).
 *
 * Mirrors contact/contact.js's buildContactInfoSection() split
 * (tests/contact/contact-content.test.js): buildContactFormSection() is a
 * synchronous, directly-testable builder living in contact/contact.js
 * (not contact-page.js) — same reuse-first architecture Ticket 2 already
 * established for this page, so Ticket 3 follows it rather than
 * reintroducing a second pattern. Mounting the returned section into
 * #contact-form-root is Code PR-only wiring in contact-page.js, not
 * retested here (same split as contact-content.test.js's own comment).
 *
 * docs/knowledge-asset/published/test-pr-native-api-and-self-ref-checklist.md
 * consulted: submitting the form has a real side effect (navigating to a
 * mailto: URL), so — same as menu/click-and-check-prevented.js's guard
 * against a real anchor "click" following its href — this suite never lets
 * the real navigation fire. The submit handler this ticket's Code PR must
 * implement calls an application-level seam,
 * `(window.__contactFormMailtoNavigate__ || ((url) => { window.location.href = url; }))(url)`,
 * exactly as recorded below, so tests can stub the seam and assert on the
 * captured URL instead of stubbing `window.location` directly (issue #54's
 * flakiness). Self-referential-test-audit: n/a, this file opens no in-app UI
 * control (Test Report modal etc.), so it is wired only into
 * tests/test-runner.html, same as tests/contact/contact-content.test.js —
 * not a test-report-suite-files.js candidate.
 *
 * Recorded contract for the Code PR (step 6) to implement exactly:
 * - contact/contact.js exports `buildContactFormSection()` (no args) and
 *   `buildMailtoUrl({ name, email, message })` (pure function).
 * - buildContactFormSection() returns a container carrying the
 *   `chloe-contact-form` class (the Code PR's CSS hook for the white/clean
 *   card border + subtle shadow, AC4/AC5) with a `<form>` containing:
 *     - `input[type="text"][name="name"][required]`
 *     - `input[type="email"][name="email"][required]`
 *     - `textarea[name="message"][required]`
 *     - `button[type="submit"]`
 * - The form's "submit" listener calls `event.preventDefault()`, reads the
 *   three fields' current `.value`s, builds the URL via buildMailtoUrl(),
 *   then invokes the `window.__contactFormMailtoNavigate__` seam above with
 *   that URL (defaulting to a real `window.location.href` navigation in
 *   production, when the seam isn't stubbed).
 * - buildMailtoUrl({ name, email, message }) returns a string starting with
 *   `"mailto:mekha.l@outlook.com?"` whose (URI-decoded) `body` param
 *   contains the entered name, email, and message (AC4's "addressed to
 *   mekha.l@outlook.com with the entered content") — exact subject text and
 *   body formatting are left to the Code PR, not pinned here.
 *
 * Written before contact/contact.js exports these two functions, per TDD —
 * fails until this issue's Code PR (step 6) adds them.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  const SAMPLE_FIELDS = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Hello there — loved the stream!",
  };

  async function loadContactFormModule() {
    await loadSharedModule(window.__CONTACT_JS_PATH__ || "../contact/contact.js");
  }

  function decodedMailtoBody(url) {
    const bodyParam = url.split("?")[1].split("&").find((part) => part.startsWith("body="));
    return decodeURIComponent(bodyParam.slice("body=".length));
  }

  function fillForm(form, fields) {
    form.querySelector('[name="name"]').value = fields.name;
    form.querySelector('[name="email"]').value = fields.email;
    form.querySelector('[name="message"]').value = fields.message;
  }

  describe("contact/contact.js (issue #420, Ticket 3 — Contact Form column)", () => {
    it("buildContactFormSection() renders a Name text input, required (AC4)", async () => {
      await loadContactFormModule();

      const section = window.buildContactFormSection();
      const nameInput = section.querySelector('input[name="name"]');

      expect(nameInput).toBeTruthy();
      expect(nameInput.getAttribute("type")).toBe("text");
      expect(nameInput.hasAttribute("required")).toBeTruthy();
    });

    it("buildContactFormSection() renders an Email input, required, type=email (AC4)", async () => {
      await loadContactFormModule();

      const section = window.buildContactFormSection();
      const emailInput = section.querySelector('input[name="email"]');

      expect(emailInput).toBeTruthy();
      expect(emailInput.getAttribute("type")).toBe("email");
      expect(emailInput.hasAttribute("required")).toBeTruthy();
    });

    it("buildContactFormSection() renders a Message textarea, required (AC4)", async () => {
      await loadContactFormModule();

      const section = window.buildContactFormSection();
      const messageInput = section.querySelector('textarea[name="message"]');

      expect(messageInput).toBeTruthy();
      expect(messageInput.tagName).toBe("TEXTAREA");
      expect(messageInput.hasAttribute("required")).toBeTruthy();
    });

    it("buildContactFormSection() renders a Submit button (AC4)", async () => {
      await loadContactFormModule();

      const section = window.buildContactFormSection();
      const submitButton = section.querySelector("button[type=submit]");

      expect(submitButton).toBeTruthy();
    });

    it("buildContactFormSection() carries the chloe-contact-form white-card styling hook (AC4, AC5)", async () => {
      await loadContactFormModule();

      const section = window.buildContactFormSection();

      expect(section.classList.contains("chloe-contact-form")).toBeTruthy();
    });

    it("buildMailtoUrl(fields) addresses the email to mekha.l@outlook.com (AC4)", async () => {
      await loadContactFormModule();

      const url = window.buildMailtoUrl(SAMPLE_FIELDS);

      expect(url.startsWith("mailto:mekha.l@outlook.com?")).toBeTruthy();
    });

    it("buildMailtoUrl(fields) includes the entered name, email, and message in the encoded body (AC4)", async () => {
      await loadContactFormModule();

      const url = window.buildMailtoUrl(SAMPLE_FIELDS);
      const body = decodedMailtoBody(url);

      expect(body).toContain(SAMPLE_FIELDS.name);
      expect(body).toContain(SAMPLE_FIELDS.email);
      expect(body).toContain(SAMPLE_FIELDS.message);
    });

    it("submitting the form prevents the real browser submission (never navigates away from the page directly)", async () => {
      await loadContactFormModule();

      const section = window.buildContactFormSection();
      const form = section.querySelector("form");
      fillForm(form, SAMPLE_FIELDS);

      window.__contactFormMailtoNavigate__ = () => {};
      const event = new Event("submit", { bubbles: true, cancelable: true });
      form.dispatchEvent(event);
      delete window.__contactFormMailtoNavigate__;

      expect(event.defaultPrevented).toBeTruthy();
    });

    it("submitting the form calls the __contactFormMailtoNavigate__ seam with the mailto: URL built from the entered field values (AC4)", async () => {
      await loadContactFormModule();

      const section = window.buildContactFormSection();
      const form = section.querySelector("form");
      fillForm(form, SAMPLE_FIELDS);

      let capturedUrl = null;
      window.__contactFormMailtoNavigate__ = (url) => {
        capturedUrl = url;
      };
      const event = new Event("submit", { bubbles: true, cancelable: true });
      form.dispatchEvent(event);
      delete window.__contactFormMailtoNavigate__;

      expect(capturedUrl).toBe(window.buildMailtoUrl(SAMPLE_FIELDS));
    });
  });
})();
