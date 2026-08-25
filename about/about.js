/**
 * Issue #151 (Ticket 2 of the About page story): Section 1, "The Radio
 * Calico Project" — a serif-styled heading + description (i18n, per the
 * human's 2.5 answer "reuse theme & use i18n"), data-driven from
 * data/about-content.json (per the human's 2.4 answer "content must
 * reusable") — same fetch-a-JSON-file pattern as case-study/case-study.js's
 * loadCaseStudies().
 *
 * Issue #394 (further review, 2026-08-25): the 5-swatch brand color palette
 * card grid originally shipped in this section was removed entirely per the
 * human's explicit decision ("ลบ swatch card ออกไปทั้งหมด ไม่ต้องแสดงผล
 * swatch") — buildProjectSection(state) no longer takes/renders a palette
 * argument. data/about-content.json's `colorPalette` field and
 * loadAboutContent()'s fetch of it are left as-is (unused by rendering, not
 * itself the target of this fix).
 *
 * Plain <script> tag, no ES modules
 * (docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md); wrapped in an
 * IIFE per issue #330's IIFE-redeclaration lesson (the test harness
 * re-injects this file as a fresh <script> tag), with globals attached to
 * `window` explicitly. See tests/about/about-content.test.js.
 *
 * Issue #151 (Ticket 3 of the About page story): Section 2, "Production-grade
 * Standards" — a Bootstrap table listing the four Code-PR gates from the
 * issue body, data-driven from data/about-content.json's new
 * `productionStandards` field (category/tool fixed by the issue body,
 * description sourced from README.md sections 11/12). See
 * tests/about/about-standards.test.js.
 *
 * Issue #394 (split from #151's close): the table's `category`/`description`
 * are now bilingual `{ en, th }` objects per row, and `tool` is bilingual for
 * translatable phrases but stays a fixed string for proper nouns
 * ("Mega-Linter", "Trivy") — resolve() below picks the right value for
 * state.lang. Column headers move into ALBUM_PROMO_TRANSLATIONS
 * (aboutStandardsColCategory/ColTooling/ColDescription), same as
 * aboutStandardsHeading. buildProductionStandardsTable(standards) becomes
 * buildProductionStandardsTable(state, standards) — it self-renders and
 * self-subscribes to state.onLanguageChange, same pattern as
 * buildProjectSection(state). The table also gets its own theme
 * tokens in about.css instead of relying on Bootstrap defaults.
 *
 * Issue #151 (Ticket 4 of the About page story): Section 3, "References &
 * Acknowledgements" — a Bootstrap list-group crediting the tools/concepts
 * named by the issue body, data-driven from data/about-content.json's new
 * `references` field (name fixed by the issue body, description drafted for
 * this PR). Same fixed-English-data-driven-body / i18n-heading split as
 * Section 2's buildProductionStandardsTable()/buildStandardsSection(). See
 * tests/about/about-references.test.js.
 *
 * Issue #394 (further review, 2026-08-25): the list-group itself (rendered
 * by buildReferencesList() above) gets the same theme-token treatment
 * Section 2's table got — see about.css's .chloe-about-references__list
 * rule and tests/about/about-references-theme.test.js.
 *
 * Issue #394 (further review, 2026-08-25, second pass): each reference's
 * `name`/`description` are now bilingual `{ en, th }` objects (proper nouns
 * like "Claude GitHub Agent" and the Udemy course title stay fixed strings,
 * same mixed-shape rule already applied to the Standards table's `tool`
 * column) — resolveBilingualField() picks the right value for state.lang.
 * buildReferencesList(references) becomes buildReferencesList(state,
 * references) — it self-renders and self-subscribes to
 * state.onLanguageChange, same pattern as buildProductionStandardsTable().
 * Test PR waived this turn; coverage bundled into this Code PR instead —
 * see tests/about/about-references.test.js.
 */
(function () {
  "use strict";

  const ABOUT_DATA_PATH = window.__ABOUT_DATA_PATH__ || "data/";

  async function loadAboutContent() {
    const response = await fetch(`${ABOUT_DATA_PATH}about-content.json`);
    return response.json();
  }

  function buildProjectSection(state) {
    const section = document.createElement("section");
    section.className = "chloe-about-project";
    section.dataset.testid = "about-project-section";

    const heading = document.createElement("h2");
    heading.className = "chloe-about-project__heading";

    const description = document.createElement("p");
    description.className = "chloe-about-project__description";

    function render() {
      if (!ALBUM_PROMO_TRANSLATIONS) return;
      heading.textContent = ALBUM_PROMO_TRANSLATIONS[state.lang].aboutProjectHeading;
      description.textContent = ALBUM_PROMO_TRANSLATIONS[state.lang].aboutProjectDescription;
    }

    render();
    state.onLanguageChange.push(render);

    section.appendChild(heading);
    section.appendChild(description);

    return section;
  }

  // A field is either a fixed string (proper nouns like "Mega-Linter") or a
  // bilingual { en, th } object — resolve() picks the right value for
  // state.lang. Shared by the Standards table and the References list.
  function resolveBilingualField(field, lang) {
    return typeof field === "string" ? field : field[lang];
  }

  function buildProductionStandardsTable(state, standards) {
    const table = document.createElement("table");
    table.className = "table chloe-about-standards__table";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const categoryHeader = document.createElement("th");
    categoryHeader.scope = "col";
    const toolingHeader = document.createElement("th");
    toolingHeader.scope = "col";
    const descriptionHeader = document.createElement("th");
    descriptionHeader.scope = "col";
    headerRow.appendChild(categoryHeader);
    headerRow.appendChild(toolingHeader);
    headerRow.appendChild(descriptionHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    standards.forEach((standard) => {
      const row = document.createElement("tr");

      const category = document.createElement("td");
      const tool = document.createElement("td");
      const description = document.createElement("td");

      row.appendChild(category);
      row.appendChild(tool);
      row.appendChild(description);
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    function render() {
      if (!ALBUM_PROMO_TRANSLATIONS) return;
      const t = ALBUM_PROMO_TRANSLATIONS[state.lang];
      categoryHeader.textContent = t.aboutStandardsColCategory;
      toolingHeader.textContent = t.aboutStandardsColTooling;
      descriptionHeader.textContent = t.aboutStandardsColDescription;

      Array.from(tbody.children).forEach((row, i) => {
        const standard = standards[i];
        row.children[0].textContent = resolveBilingualField(standard.category, state.lang);
        row.children[1].textContent = resolveBilingualField(standard.tool, state.lang);
        row.children[2].textContent = resolveBilingualField(standard.description, state.lang);
      });
    }

    render();
    state.onLanguageChange.push(render);

    return table;
  }

  function buildStandardsSection(state, standards) {
    const section = document.createElement("section");
    section.className = "chloe-about-standards";
    section.dataset.testid = "about-standards-section";

    const heading = document.createElement("h2");
    heading.className = "chloe-about-standards__heading";

    function render() {
      if (!ALBUM_PROMO_TRANSLATIONS) return;
      heading.textContent = ALBUM_PROMO_TRANSLATIONS[state.lang].aboutStandardsHeading;
    }

    render();
    state.onLanguageChange.push(render);

    section.appendChild(heading);
    section.appendChild(buildProductionStandardsTable(state, standards));

    return section;
  }

  // Issue #394 (further review, 2026-08-25): each reference's `name`/
  // `description` is now either a fixed string (proper nouns like "Claude
  // GitHub Agent") or a bilingual { en, th } object — resolveBilingualField()
  // picks the right value for state.lang, same pattern as
  // buildProductionStandardsTable() above. The list self-renders and
  // self-subscribes to state.onLanguageChange, same pattern as
  // buildProjectSection(state)/buildProductionStandardsTable(state, ...).
  //
  // Issue #397: a reference may carry a `url` (currently only the Udemy
  // course credit) — when present, its name renders as a link that opens in
  // a new tab; entries without `url` keep rendering as plain text.
  function buildReferencesList(state, references) {
    const list = document.createElement("div");
    list.className = "list-group chloe-about-references__list";

    const items = references.map((reference) => {
      const item = document.createElement("div");
      item.className = "list-group-item chloe-about-references__item";

      const name = document.createElement("div");
      name.className = "chloe-about-references__name";

      const description = document.createElement("div");
      description.className = "chloe-about-references__description";

      item.appendChild(name);
      item.appendChild(description);
      list.appendChild(item);

      return { item, name, description };
    });

    function render() {
      items.forEach(({ name, description }, i) => {
        const reference = references[i];
        const nameText = resolveBilingualField(reference.name, state.lang);
        const descriptionText = resolveBilingualField(reference.description, state.lang);

        name.textContent = "";
        if (reference.url) {
          const link = document.createElement("a");
          link.href = reference.url;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = nameText;
          name.appendChild(link);
        } else {
          name.textContent = nameText;
        }

        description.textContent = descriptionText;
      });
    }

    render();
    state.onLanguageChange.push(render);

    return list;
  }

  function buildReferencesSection(state, references) {
    const section = document.createElement("section");
    section.className = "chloe-about-references";
    section.dataset.testid = "about-references-section";

    const heading = document.createElement("h2");
    heading.className = "chloe-about-references__heading";

    function render() {
      if (!ALBUM_PROMO_TRANSLATIONS) return;
      heading.textContent = ALBUM_PROMO_TRANSLATIONS[state.lang].aboutReferencesHeading;
    }

    render();
    state.onLanguageChange.push(render);

    section.appendChild(heading);
    section.appendChild(buildReferencesList(state, references));

    return section;
  }

  window.loadAboutContent = loadAboutContent;
  window.buildProjectSection = buildProjectSection;
  window.buildProductionStandardsTable = buildProductionStandardsTable;
  window.buildStandardsSection = buildStandardsSection;
  window.buildReferencesList = buildReferencesList;
  window.buildReferencesSection = buildReferencesSection;
})();
