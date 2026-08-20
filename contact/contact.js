/**
 * Issue #419 (Ticket 2 of the "Contact" page story, part of #153): the
 * Contact Info column (#contact-info-root) — a bilingual inspiration
 * paragraph (Thai, then English, both always rendered — no language toggle,
 * confirmed with @mekhal in #153's review) followed by "Mekha Lomlao" and
 * "mekha.l@outlook.com", all data-driven from data/contact-content.json
 * (AC3) rather than hardcoded in JS — same fetch-a-JSON-file pattern as
 * about/about.js's loadAboutContent() and whats-this/whats-this.js's
 * loadWhatsThisContent().
 *
 * Unlike about.js's i18n'd sections (ALBUM_PROMO_TRANSLATIONS/state.lang, one
 * language visible at a time), this content is bilingual by design: both the
 * Thai and English paragraphs render together, always, with no state.lang
 * branching at all — see the correction posted in #153's plan comment.
 * buildContactInfoSection(content) takes the resolved content object as a
 * plain argument rather than calling loadContactContent() itself, so it
 * stays synchronous/directly testable — contact-page.js is responsible for
 * awaiting loadContactContent() once (mirrors the already-shipped
 * window.__aboutPageContentReady/window.__whatsThisPageContentReady pattern)
 * and mounting the result into #contact-info-root.
 *
 * See tests/contact/contact-content.test.js.
 */
(function () {
  "use strict";

  const CONTACT_DATA_PATH = window.__CONTACT_DATA_PATH__ || "data/";

  async function loadContactContent() {
    const response = await fetch(`${CONTACT_DATA_PATH}contact-content.json`);
    return response.json();
  }

  function buildContactInfoSection(content) {
    const section = document.createElement("div");
    section.className = "chloe-contact-info";
    section.dataset.testid = "contact-info-section";

    const inspirationTh = document.createElement("p");
    inspirationTh.className = "chloe-contact-info__inspiration chloe-contact-info__inspiration--th";
    inspirationTh.lang = "th";
    inspirationTh.textContent = content.inspiration.th;

    const inspirationEn = document.createElement("p");
    inspirationEn.className = "chloe-contact-info__inspiration chloe-contact-info__inspiration--en";
    inspirationEn.lang = "en";
    inspirationEn.textContent = content.inspiration.en;

    const name = document.createElement("p");
    name.className = "chloe-contact-info__name";
    name.textContent = content.name;

    const email = document.createElement("p");
    email.className = "chloe-contact-info__email";
    const emailLink = document.createElement("a");
    emailLink.href = `mailto:${content.email}`;
    emailLink.textContent = content.email;
    email.appendChild(emailLink);

    section.appendChild(inspirationTh);
    section.appendChild(inspirationEn);
    section.appendChild(name);
    section.appendChild(email);

    return section;
  }

  window.loadContactContent = loadContactContent;
  window.buildContactInfoSection = buildContactInfoSection;
})();
