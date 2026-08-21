/**
 * Issue #419 (Ticket 2 of the "Contact" page story, part of #153): the
 * Contact Info column (#contact-info-root) — an inspiration paragraph
 * followed by "Mekha Lomlao" and "mekha.l@outlook.com", all data-driven from
 * data/contact-content.json (AC3) rather than hardcoded in JS — same
 * fetch-a-JSON-file pattern as about/about.js's loadAboutContent() and
 * whats-this/whats-this.js's loadWhatsThisContent().
 *
 * Issue #432: the inspiration paragraph now follows the site-wide language
 * toggle (one language visible at a time) instead of always rendering both
 * Thai and English together — reversing #419's original "bilingual by
 * design, no state.lang branching" decision, per @mekhal's feedback after
 * seeing it shipped live. buildContactInfoSection(content, state) takes the
 * resolved content object plus `state` (mirroring about.js's
 * buildStandardsSection(state, standards)), renders a single inspiration <p>
 * reflecting state.lang, and pushes a render() callback onto
 * state.onLanguageChange so it swaps live on toggle — same pattern as
 * about.js's buildStandardsSection(). It still takes `content` as a plain
 * argument rather than calling loadContactContent() itself, so it stays
 * synchronous/directly testable — contact-page.js is responsible for
 * awaiting loadContactContent() once (mirrors the already-shipped
 * window.__aboutPageContentReady/window.__whatsThisPageContentReady pattern)
 * and mounting the result into #contact-info-root.
 *
 * See tests/contact/contact-content.test.js.
 *
 * Issue #420 (Ticket 3 of the "Contact" page story, part of #153): the
 * Contact Form column (#contact-form-root) — Name/Email/Message/Submit,
 * addressed via mailto: to mekha.l@outlook.com (AC4), no server endpoint, no
 * on-page confirmation fallback, no custom JS validation beyond native HTML5
 * required/type="email" (per @mekhal's review answers on #153).
 * buildContactFormSection() mirrors buildContactInfoSection() above: a
 * synchronous, directly-testable builder living here rather than in
 * contact-page.js (reuse-first, same split Ticket 2 established).
 *
 * Issue #432 follow-up: the Name/Email/Message labels and the Send button,
 * previously hardcoded English literals with zero language support, now also
 * follow the toggle. buildContactFormSection(state) reads new i18n keys —
 * contactFormNameLabel/contactFormEmailLabel/contactFormMessageLabel/
 * contactFormSendLabel — from ALBUM_PROMO_TRANSLATIONS[state.lang], pushing
 * a render() callback onto state.onLanguageChange, same pattern as above.
 *
 * The submit handler never lets the browser follow the form's own
 * navigation — it calls buildMailtoUrl() (a pure function, easy to unit
 * test) and hands the result to an application-level seam,
 * window.__contactFormMailtoNavigate__, defaulting to a real
 * window.location.href navigation when unset. This mirrors
 * menu/click-and-check-prevented.js's guard against letting a real anchor
 * "click" fire during tests (docs/knowledge-asset/published/
 * test-pr-native-api-and-self-ref-checklist.md) instead of stubbing
 * window.location directly, which issue #54 found flaky.
 *
 * See tests/contact/contact-form.test.js for the recorded contract.
 */
(function () {
  "use strict";

  const CONTACT_DATA_PATH = window.__CONTACT_DATA_PATH__ || "data/";
  const CONTACT_EMAIL = "mekha.l@outlook.com";

  async function loadContactContent() {
    const response = await fetch(`${CONTACT_DATA_PATH}contact-content.json`);
    return response.json();
  }

  function buildContactInfoSection(content, state) {
    const section = document.createElement("div");
    section.className = "chloe-contact-info";
    section.dataset.testid = "contact-info-section";

    const inspiration = document.createElement("p");
    inspiration.className = "chloe-contact-info__inspiration";

    function render() {
      inspiration.lang = state.lang;
      inspiration.textContent = content.inspiration[state.lang];
    }

    render();
    state.onLanguageChange.push(render);

    const name = document.createElement("p");
    name.className = "chloe-contact-info__name";
    name.textContent = content.name;

    const email = document.createElement("p");
    email.className = "chloe-contact-info__email";
    const emailLink = document.createElement("a");
    emailLink.href = `mailto:${content.email}`;
    emailLink.textContent = content.email;
    email.appendChild(emailLink);

    section.appendChild(inspiration);
    section.appendChild(name);
    section.appendChild(email);

    return section;
  }

  function buildMailtoUrl({ name, email, message }) {
    const subject = encodeURIComponent(`Radio Calico contact form message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  function buildFormField({ id, tag, type, name }) {
    const group = document.createElement("div");
    group.className = "mb-3";

    const fieldLabel = document.createElement("label");
    fieldLabel.setAttribute("for", id);
    fieldLabel.className = "form-label";

    const field = document.createElement(tag);
    field.id = id;
    field.name = name;
    field.className = "form-control";
    field.required = true;
    if (type) field.type = type;

    group.appendChild(fieldLabel);
    group.appendChild(field);

    return { group, field, label: fieldLabel };
  }

  function buildContactFormSection(state) {
    const section = document.createElement("div");
    section.className = "chloe-contact-form";
    section.dataset.testid = "contact-form-section";

    const form = document.createElement("form");

    const nameField = buildFormField({ id: "contact-form-name", tag: "input", type: "text", name: "name" });
    const emailField = buildFormField({ id: "contact-form-email", tag: "input", type: "email", name: "email" });
    const messageField = buildFormField({ id: "contact-form-message", tag: "textarea", name: "message" });
    messageField.field.rows = 5;

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "btn chloe-contact-form__submit";

    function render() {
      if (!ALBUM_PROMO_TRANSLATIONS) return;
      const translations = ALBUM_PROMO_TRANSLATIONS[state.lang];
      nameField.label.textContent = translations.contactFormNameLabel;
      emailField.label.textContent = translations.contactFormEmailLabel;
      messageField.label.textContent = translations.contactFormMessageLabel;
      submitButton.textContent = translations.contactFormSendLabel;
    }

    render();
    state.onLanguageChange.push(render);

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const url = buildMailtoUrl({
        name: nameField.field.value,
        email: emailField.field.value,
        message: messageField.field.value,
      });

      (window.__contactFormMailtoNavigate__ || ((navigateUrl) => { window.location.href = navigateUrl; }))(url);
    });

    form.appendChild(nameField.group);
    form.appendChild(emailField.group);
    form.appendChild(messageField.group);
    form.appendChild(submitButton);

    section.appendChild(form);

    return section;
  }

  window.loadContactContent = loadContactContent;
  window.buildContactInfoSection = buildContactInfoSection;
  window.buildMailtoUrl = buildMailtoUrl;
  window.buildContactFormSection = buildContactFormSection;
})();
