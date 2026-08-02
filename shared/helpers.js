/**
 * Issue #253 (Ticket 1): shared DOM-building helpers extracted out of
 * album-promo.js so tickets 2-5 (logo/menu/sidebar/footer) can reuse the
 * same globals — plain <script> tag, no ES modules
 * (docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md); a plain
 * function declaration attaches to `window` automatically. See
 * tests/shared/shared-helpers.test.js.
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
