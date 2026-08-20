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
 *
 * Issue #404 (Ticket 3 of the "What's this" page story, part of #152), step 3
 * waiver approved (2026-08-20): Section 2, "The AI-DLC Loop" - a "THE AI-DLC
 * LOOP" heading and 6 step cards, titles locked per @mekhal's decision on
 * #152 (Issue Trigger -> Plan & AC Gate -> TDD Gate -> Implementation Gate ->
 * Review & Merge Gate -> Close & Capture Gate, AC1), each with a short
 * general-audience description paraphrasing README section 4's 7-step table
 * (AC2), sourced from data/whats-this-content.json's new aidlcLoop field.
 * Reuses case-study/case-study.js's buildCaseStudyCard()/buildCaseStudyGrid()
 * Bootstrap col-md-4 responsive-grid precedent (AC3: stacks vertically below
 * md, 3-per-row grid at md and up) rather than inventing a new layout.
 * buildAiDlcLoopSection(content) takes the resolved aidlcLoop object as a
 * plain argument, same synchronous/directly-testable convention as
 * buildWhatIsThisSection() above - whats-this-page.js awaits
 * loadWhatsThisContent() once and passes both resolved sub-objects in.
 *
 * Issue #405 (Ticket 4 of the "What's this" page story, part of #152), step 3
 * waiver approved (2026-08-20): Section 3, "Skill Capture & Reuse" - a
 * two-column "First Time" / "Next Time" comparison (AC1: stacks to a single
 * column below md, same Bootstrap row/col precedent as
 * buildAiDlcLoopSection() above, but col-md-6 for a 2-up rather than 3-up
 * grid). "First Time" paraphrases how a new skill gets captured from a human
 * decision/feedback into .claude/skills/ (AC2); "Next Time" paraphrases how
 * the agent automatically reuses that stored skill in later loops for more
 * consistent behavior (AC3) - both a general-audience paraphrase of README
 * section 7, not verbatim (AC4). Sourced from data/whats-this-content.json's
 * new skillCapture field. buildSkillCaptureSection(content) takes the
 * resolved skillCapture object as a plain argument, same
 * synchronous/directly-testable convention as the two section builders
 * above.
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

  function buildAiDlcLoopCard(step, index) {
    const col = document.createElement("div");
    col.className = "col-md-4 whats-this-loop-card-col";
    col.dataset.testid = "whats-this-loop-card-col";

    const card = document.createElement("div");
    card.className = "whats-this-loop-card";
    card.dataset.testid = "whats-this-loop-card";

    const number = document.createElement("p");
    number.className = "whats-this-loop-card__number";
    number.textContent = String(index + 1);

    const title = document.createElement("h3");
    title.className = "whats-this-loop-card__title";
    title.textContent = step.title;

    const description = document.createElement("p");
    description.className = "whats-this-loop-card__description";
    description.textContent = step.description;

    card.appendChild(number);
    card.appendChild(title);
    card.appendChild(description);
    col.appendChild(card);

    return col;
  }

  function buildAiDlcLoopGrid(steps) {
    const grid = document.createElement("div");
    grid.className = "row whats-this-loop-grid";
    grid.dataset.testid = "whats-this-loop-grid";

    steps.forEach((step, index) => grid.appendChild(buildAiDlcLoopCard(step, index)));

    return grid;
  }

  function buildAiDlcLoopSection(content) {
    const section = document.createElement("section");
    section.className = "chloe-whats-this-loop";
    section.dataset.testid = "whats-this-loop-section";

    const heading = document.createElement("h2");
    heading.className = "chloe-whats-this-loop__heading";
    heading.textContent = content.heading;

    section.appendChild(heading);
    section.appendChild(buildAiDlcLoopGrid(content.steps));

    return section;
  }

  function buildSkillCaptureCard(card, modifierClass) {
    const col = document.createElement("div");
    col.className = "col-md-6 whats-this-skill-card-col";
    col.dataset.testid = "whats-this-skill-card-col";

    const box = document.createElement("div");
    box.className = `whats-this-skill-card ${modifierClass}`;
    box.dataset.testid = "whats-this-skill-card";

    const title = document.createElement("h3");
    title.className = "whats-this-skill-card__title";
    title.textContent = card.title;

    const body = document.createElement("p");
    body.className = "whats-this-skill-card__body";
    body.textContent = card.body;

    box.appendChild(title);
    box.appendChild(body);
    col.appendChild(box);

    return col;
  }

  function buildSkillCaptureGrid(content) {
    const grid = document.createElement("div");
    grid.className = "row whats-this-skill-grid";
    grid.dataset.testid = "whats-this-skill-grid";

    grid.appendChild(buildSkillCaptureCard(content.firstTime, "whats-this-skill-card--first"));
    grid.appendChild(buildSkillCaptureCard(content.nextTime, "whats-this-skill-card--next"));

    return grid;
  }

  function buildSkillCaptureSection(content) {
    const section = document.createElement("section");
    section.className = "chloe-whats-this-skills";
    section.dataset.testid = "whats-this-skills-section";

    const heading = document.createElement("h2");
    heading.className = "chloe-whats-this-skills__heading";
    heading.textContent = content.heading;

    section.appendChild(heading);
    section.appendChild(buildSkillCaptureGrid(content));

    return section;
  }

  window.loadWhatsThisContent = loadWhatsThisContent;
  window.buildBadgeRow = buildBadgeRow;
  window.buildWhatIsThisSection = buildWhatIsThisSection;
  window.buildAiDlcLoopCard = buildAiDlcLoopCard;
  window.buildAiDlcLoopGrid = buildAiDlcLoopGrid;
  window.buildAiDlcLoopSection = buildAiDlcLoopSection;
  window.buildSkillCaptureCard = buildSkillCaptureCard;
  window.buildSkillCaptureGrid = buildSkillCaptureGrid;
  window.buildSkillCaptureSection = buildSkillCaptureSection;
  window.loadWhatsThisContent = loadWhatsThisContent;
  window.buildBadgeRow = buildBadgeRow;
  window.buildWhatIsThisSection = buildWhatIsThisSection;
  window.buildSkillCaptureCard = buildSkillCaptureCard;
  window.buildSkillCaptureGrid = buildSkillCaptureGrid;
  window.buildSkillCaptureSection = buildSkillCaptureSection;
})();
