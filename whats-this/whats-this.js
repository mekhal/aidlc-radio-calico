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
 *
 * Issue #522 follow-up review (2026-08-27, kept in this same issue per
 * @mekhal's explicit "ทำใน Issue นี้" direction rather than a new ticket -
 * see this turn's PR/issue comment for the scope-rule note): the loop cards
 * are expanded from 6 to CLAUDE.md's actual 7 numbered steps
 * (aidlcLoop.steps), each now also naming its artifact (Plan+AC/Test
 * PR/Code PR) and whether it's an AI action or a human gate. Step 3's card
 * spells out the Test PR waiver condition (AI may propose, only the
 * human's explicit answer makes it final); step 7's card covers the
 * step-7-rework-loops-back-to-6 rule and the missed-functionality-becomes-
 * a-new-issue scope-drift rule. skillCapture gains a new bilingual `intro`
 * field, rendered by buildSkillCaptureSection() as a paragraph before the
 * image/cards, clarifying this capture-and-reuse cycle runs after the loop
 * closes rather than being one of the 7 numbered steps (previously the old
 * 6th "Close & Capture Gate" card blurred this into the loop's own
 * numbering).
 *
 * Issue #529 (follow-up from #522's close): @mekhal reported the aidlcLoop/
 * skillCapture diagram images sat flush left instead of centered on wide
 * viewports (whats-this.css's .whats-this-image had no horizontal
 * auto-margin), and asked for both the AI-DLC Loop and Skill Capture
 * sections to render as tables instead of card grids. buildAiDlcLoopCard/
 * Grid and buildSkillCaptureCard/Grid are replaced by a single shared
 * buildWhatsThisTable(state, rows, headingKeys) - modeled on about.js's
 * buildProductionStandardsTable(state, standards) (reuse-first) - a
 * <table> with a <thead> (two bilingual column headers, i18n keys per
 * section) and one <tbody> row per item, self-rendering/self-subscribing to
 * state.onLanguageChange like every other builder here. Per @mekhal's
 * follow-up review comment, the Skill Capture table also gains more detail:
 * `skillCapture.firstTime`/`nextTime` (2 rows) are replaced by a `stages`
 * array of 5 rows (Capture/Distill/Store/Reuse/Evolve), matching the
 * section's own diagram (skill-reuse-gates.png) and CLAUDE.md's "Skill
 * capture flow" - a content-shape change, called out explicitly since the
 * original plan's AC4 had said "no shape change".
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

  function buildWhatsThisTable(state, rows, headingKeys) {
    const table = document.createElement("table");
    table.className = "table whats-this-table";
    table.dataset.testid = "whats-this-table";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const firstHeader = document.createElement("th");
    firstHeader.scope = "col";
    const secondHeader = document.createElement("th");
    secondHeader.scope = "col";
    headerRow.appendChild(firstHeader);
    headerRow.appendChild(secondHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const cells = rows.map(() => {
      const row = document.createElement("tr");
      const title = document.createElement("td");
      title.className = "whats-this-table__title";
      const description = document.createElement("td");
      description.className = "whats-this-table__description";
      row.appendChild(title);
      row.appendChild(description);
      tbody.appendChild(row);
      return { title, description };
    });
    table.appendChild(tbody);

    function render() {
      if (!ALBUM_PROMO_TRANSLATIONS) return;
      const t = ALBUM_PROMO_TRANSLATIONS[state.lang];
      firstHeader.textContent = t[headingKeys.first];
      secondHeader.textContent = t[headingKeys.second];

      cells.forEach(({ title, description }, i) => {
        title.textContent = resolveBilingualField(rows[i].title, state.lang);
        description.textContent = resolveBilingualField(rows[i].description ?? rows[i].body, state.lang);
      });
    }

    render();
    state.onLanguageChange.push(render);

    return table;
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
    section.appendChild(
      buildWhatsThisTable(state, content.steps, {
        first: "whatsThisLoopColStep",
        second: "whatsThisLoopColDescription",
      }),
    );

    return section;
  }

  function buildSkillCaptureSection(state, content) {
    const section = document.createElement("section");
    section.className = "chloe-whats-this-skills";
    section.dataset.testid = "whats-this-skills-section";

    const heading = document.createElement("h2");
    heading.className = "chloe-whats-this-skills__heading";

    const intro = document.createElement("p");
    intro.className = "chloe-whats-this-skills__intro";
    intro.dataset.testid = "whats-this-skills-intro";

    function render() {
      if (!ALBUM_PROMO_TRANSLATIONS) return;
      heading.textContent = ALBUM_PROMO_TRANSLATIONS[state.lang].whatsThisSkillsHeading;
      intro.textContent = resolveBilingualField(content.intro, state.lang);
    }

    render();
    state.onLanguageChange.push(render);

    section.appendChild(heading);
    section.appendChild(intro);
    section.appendChild(buildSectionImage(state, content.image));
    section.appendChild(
      buildWhatsThisTable(state, content.stages, {
        first: "whatsThisSkillsColStage",
        second: "whatsThisSkillsColDescription",
      }),
    );

    return section;
  }

  window.loadWhatsThisContent = loadWhatsThisContent;
  window.buildBadgeRow = buildBadgeRow;
  window.buildSectionImage = buildSectionImage;
  window.buildWhatIsThisSection = buildWhatIsThisSection;
  window.buildWhatsThisTable = buildWhatsThisTable;
  window.buildAiDlcLoopSection = buildAiDlcLoopSection;
  window.buildSkillCaptureSection = buildSkillCaptureSection;
})();
