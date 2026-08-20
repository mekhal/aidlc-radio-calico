/**
 * Issue #403 (Ticket 2 of the "What's this" page story, part of #152):
 * Section 1, "What is this?" - a serif "WHAT IS THIS?" heading, a
 * general-audience paragraph paraphrasing README section 1's core claim
 * (process demo / AI-DLC / 100% on GitHub / Claude GitHub agent - not
 * verbatim README text, per AC2), and a 4-badge highlight row
 * (Human-in-the-loop / TDD / Skill Capture & Reuse / Production-grade, per
 * AC3). Heading, body copy, and badge labels are all data-driven from
 * data/whats-this-content.json (per AC4) rather than hardcoded in JS - same
 * fetch-a-JSON-file pattern as about/about.js's loadAboutContent() and
 * case-study/case-study.js's loadCaseStudies().
 *
 * Unlike about/about.js's buildProjectSection() (i18n'd heading/description
 * via ALBUM_PROMO_TRANSLATIONS), this section has no i18n branching - AC4
 * sources all of its copy from whats-this-content.json directly, matching
 * about.js's Section 2/3 precedent of fixed-English-data-driven body content
 * (buildProductionStandardsTable()/buildReferencesList()), extended here to
 * the heading as well since AC1 fixes the heading text itself.
 *
 * buildWhatIsThisSection(content) takes the resolved whatIsThis object as a
 * plain argument rather than calling loadWhatsThisContent() itself, so the
 * section builder stays synchronous/directly testable - whats-this-page.js
 * is responsible for awaiting loadWhatsThisContent() once (mirrors the
 * already-shipped window.__aboutPageContentReady await pattern) and passing
 * the resolved object in.
 *
 * Plain <script> tag, no ES modules
 * (docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md), wrapped in an
 * IIFE per issue #330's IIFE-redeclaration lesson (the test harness
 * re-injects this file as a fresh <script> tag), with globals attached to
 * `window` explicitly. See tests/whats-this/whats-this-content.test.js.
 */
(function () {
  "use strict";

  const WHATS_THIS_DATA_PATH = window.__WHATS_THIS_DATA_PATH__ || "data/";

  async function loadWhatsThisContent() {
    const response = await fetch(`${WHATS_THIS_DATA_PATH}whats-this-content.json`);
    return response.json();
  }

  function buildBadgeRow(badges) {
    const row = document.createElement("div");
    row.className = "chloe-whats-this-badges";
    row.dataset.testid = "whats-this-badges";

    badges.forEach((label) => {
      const badge = document.createElement("span");
      badge.className = "badge chloe-whats-this-badge";
      badge.textContent = label;
      row.appendChild(badge);
    });

    return row;
  }

  function buildWhatIsThisSection(content) {
    const section = document.createElement("section");
    section.className = "chloe-whats-this-what";
    section.dataset.testid = "whats-this-what-section";

    const heading = document.createElement("h2");
    heading.className = "chloe-whats-this-what__heading";
    heading.textContent = content.heading;

    const body = document.createElement("p");
    body.className = "chloe-whats-this-what__body";
    body.textContent = content.body;

    section.appendChild(heading);
    section.appendChild(body);
    section.appendChild(buildBadgeRow(content.badges));

    return section;
  }

  window.loadWhatsThisContent = loadWhatsThisContent;
  window.buildBadgeRow = buildBadgeRow;
  window.buildWhatIsThisSection = buildWhatIsThisSection;
})();
