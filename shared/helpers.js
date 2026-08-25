/**
 * Issue #253 (Ticket 1): shared DOM-building helpers extracted out of
 * album-promo.js so tickets 2-5 (logo/menu/sidebar/footer) can reuse the
 * same globals — plain <script> tag, no ES modules
 * (docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md); a plain
 * function declaration attaches to `window` automatically. See
 * tests/shared/shared-helpers.test.js.
 *
 * Issue #508 (Ticket 1 of the "What's this" bilingual story, part of #505),
 * AC1: resolveBilingualField() moves here from about/about.js (previously a
 * private helper there) so whats-this/whats-this.js can reuse it too — a
 * call-site audit confirmed about.js was the only other reference, so it now
 * calls this shared global instead of its own local copy.
 */
"use strict";

function createIconLink({ testid, href, label, icon, external }) {
  const link = document.createElement("a");
  link.dataset.testid = testid;
  link.href = href;
  link.title = label;
  link.setAttribute("aria-label", label);
  if (external) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  const iconEl = document.createElement("i");
  iconEl.className = `bi ${icon}`;
  iconEl.setAttribute("aria-hidden", "true");
  link.appendChild(iconEl);

  return link;
}

// A field is either a fixed string (proper nouns/terms-of-art like
// "Mega-Linter") or a bilingual { en, th } object — resolveBilingualField()
// picks the right value for lang.
function resolveBilingualField(field, lang) {
  return typeof field === "string" ? field : field[lang];
}
