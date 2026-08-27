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
 * new skillCapture field.
 *
 * Issue #508 (Ticket 1 of the "What's this" bilingual story, part of #505),
 * AC1-AC5: all 3 sections become bilingual. Each content field is now either
 * a fixed string (badges - proper nouns/terms-of-art, same treatment as
 * about.js's "Mega-Linter"/"Trivy") or a bilingual { en, th } object,
 * resolved via the shared resolveBilingualField() (shared/helpers.js). The
 * 3 section headings and the 6 AI-DLC loop step names (per @mekhal's
 * 2026-08-25 decision to translate everything) move out of the content JSON
 * into ALBUM_PROMO_TRANSLATIONS i18n keys (whatsThisWhatHeading/
 * whatsThisLoopHeading/whatsThisSkillsHeading). Every builder that renders
 * translatable text now takes `state` first, self-renders, and
 * self-subscribes to state.onLanguageChange - same pattern as about.js's
 * buildProjectSection(state)/buildProductionStandardsTable(state, standards).
 *
 * Issue #509 (Ticket 2 of the "What's this" bilingual + diagram story, part
 * of #505), AC1-AC5: each of the 3 sections embeds one diagram image via a
 * new shared buildSectionImage(state, image) helper (reuse-first, AC4) -
 * a responsive <img> (img-fluid) plus a bilingual caption underneath,
 * self-rendering/self-subscribing to state.onLanguageChange like every
 * other builder here (AC3). The two content-mismatched image files were
 * renamed via git mv to match their actual diagram content (AC1):
 * code-pr-gates.png -> skill-reuse-gates.png, skill-reuse-gates.jpg ->
 * code-pr-gates.jpg; aidlc-loop-gates.jpg was already correctly named.
 *
 * Issue #522 (follow-up from #505, reported after #509 shipped): per
 * @mekhal's live review, all 3 images rendered close to full page width,
 * uncropped, and 2 of the 3 captions/alt text were too generic. AC1:
 * buildWhatIsThisSection stops calling buildSectionImage entirely -
 * whatIsThis has no image field anymore. code-pr-gates.jpg itself is kept
 * (not deleted) because README.md/README.th.md independently embed the
 * same file in their own "Production-grade Standards" section - see
 * tests/whats-this/whats-this-content.test.js's header comment. AC2:
 * the remaining aidlcLoop/skillCapture images are capped at
 * max-width: 42rem via .whats-this-image (whats-this.css), matching the
 * text column - buildSectionImage itself is unchanged. AC3/AC4: their
 * alt/caption copy (data/whats-this-content.json) was rewritten to
 * describe each diagram's actual content instead of a generic summary.
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

  function buildSectionImage(state, image) {
    const wrapper = document.createElement("div");
    wrapper.className = "whats-this-image";
    wrapper.dataset.testid = "whats-this-image";

    const img = document.createElement("img");
    img.className = "img-fluid whats-this-image__img";
    img.src = image.src;

    const caption = document.createElement("p");
    caption.className = "whats-this-image__caption";
    caption.dataset.testid = "whats-this-image-caption";

    function render() {
      img.alt = resolveBilingualField(image.alt, state.lang);
      caption.textContent = resolveBilingualField(image.caption, state.lang);
    }

    render();
    state.onLanguageChange.push(render);

    wrapper.appendChild(img);
    wrapper.appendChild(caption);

    return wrapper;
  }

  function buildWhatIsThisSection(state, content) {
    const section = document.createElement("section");
    section.className = "chloe-whats-this-what";
    section.dataset.testid = "whats-this-what-section";

    const heading = document.createElement("h2");
    heading.className = "chloe-whats-this-what__heading";

    const body = document.createElement("p");
    body.className = "chloe-whats-this-what__body";

    function render() {
      if (!ALBUM_PROMO_TRANSLATIONS) return;
      heading.textContent = ALBUM_PROMO_TRANSLATIONS[state.lang].whatsThisWhatHeading;
      body.textContent = resolveBilingualField(content.body, state.lang);
    }

    render();
    state.onLanguageChange.push(render);

    section.appendChild(heading);
    section.appendChild(body);
    section.appendChild(buildBadgeRow(content.badges));

    return section;
  }

  function buildAiDlcLoopCard(state, step, index) {
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

    const description = document.createElement("p");
    description.className = "whats-this-loop-card__description";

    function render() {
      title.textContent = resolveBilingualField(step.title, state.lang);
      description.textContent = resolveBilingualField(step.description, state.lang);
    }

    render();
    state.onLanguageChange.push(render);

    card.appendChild(number);
    card.appendChild(title);
    card.appendChild(description);
    col.appendChild(card);

    return col;
  }

  function buildAiDlcLoopGrid(state, steps) {
    const grid = document.createElement("div");
    grid.className = "row whats-this-loop-grid";
    grid.dataset.testid = "whats-this-loop-grid";

    steps.forEach((step, index) => grid.appendChild(buildAiDlcLoopCard(state, step, index)));

    return grid;
  }

  function buildAiDlcLoopSection(state, content) {
    const section = document.createElement("section");
    section.className = "chloe-whats-this-loop";
    section.dataset.testid = "whats-this-loop-section";

    const heading = document.createElement("h2");
    heading.className = "chloe-whats-this-loop__heading";

    function render() {
      if (!ALBUM_PROMO_TRANSLATIONS) return;
      heading.textContent = ALBUM_PROMO_TRANSLATIONS[state.lang].whatsThisLoopHeading;
    }

    render();
    state.onLanguageChange.push(render);

    section.appendChild(heading);
    section.appendChild(buildSectionImage(state, content.image));
    section.appendChild(buildAiDlcLoopGrid(state, content.steps));

    return section;
  }

  function buildSkillCaptureCard(state, card, modifierClass) {
    const col = document.createElement("div");
    col.className = "col-md-6 whats-this-skill-card-col";
    col.dataset.testid = "whats-this-skill-card-col";

    const box = document.createElement("div");
    box.className = `whats-this-skill-card ${modifierClass}`;
    box.dataset.testid = "whats-this-skill-card";

    const title = document.createElement("h3");
    title.className = "whats-this-skill-card__title";

    const body = document.createElement("p");
    body.className = "whats-this-skill-card__body";

    function render() {
      title.textContent = resolveBilingualField(card.title, state.lang);
      body.textContent = resolveBilingualField(card.body, state.lang);
    }

    render();
    state.onLanguageChange.push(render);

    box.appendChild(title);
    box.appendChild(body);
    col.appendChild(box);

    return col;
  }

  function buildSkillCaptureGrid(state, content) {
    const grid = document.createElement("div");
    grid.className = "row whats-this-skill-grid";
    grid.dataset.testid = "whats-this-skill-grid";

    grid.appendChild(buildSkillCaptureCard(state, content.firstTime, "whats-this-skill-card--first"));
    grid.appendChild(buildSkillCaptureCard(state, content.nextTime, "whats-this-skill-card--next"));

    return grid;
  }

  function buildSkillCaptureSection(state, content) {
    const section = document.createElement("section");
    section.className = "chloe-whats-this-skills";
    section.dataset.testid = "whats-this-skills-section";

    const heading = document.createElement("h2");
    heading.className = "chloe-whats-this-skills__heading";

    function render() {
      if (!ALBUM_PROMO_TRANSLATIONS) return;
      heading.textContent = ALBUM_PROMO_TRANSLATIONS[state.lang].whatsThisSkillsHeading;
    }

    render();
    state.onLanguageChange.push(render);

    section.appendChild(heading);
    section.appendChild(buildSectionImage(state, content.image));
    section.appendChild(buildSkillCaptureGrid(state, content));

    return section;
  }

  window.loadWhatsThisContent = loadWhatsThisContent;
  window.buildBadgeRow = buildBadgeRow;
  window.buildSectionImage = buildSectionImage;
  window.buildWhatIsThisSection = buildWhatIsThisSection;
  window.buildAiDlcLoopCard = buildAiDlcLoopCard;
  window.buildAiDlcLoopGrid = buildAiDlcLoopGrid;
  window.buildAiDlcLoopSection = buildAiDlcLoopSection;
  window.buildSkillCaptureCard = buildSkillCaptureCard;
  window.buildSkillCaptureGrid = buildSkillCaptureGrid;
  window.buildSkillCaptureSection = buildSkillCaptureSection;
})();
