/**
 * Issue #151 (Ticket 2 of the About page story): Section 1, "The Radio
 * Calico Project" — a serif-styled heading + description (i18n, per the
 * human's 2.5 answer "reuse theme & use i18n") plus the 5-swatch brand
 * color palette from the issue body, data-driven from
 * data/about-content.json (per the human's 2.4 answer "content must
 * reusable") rather than hardcoded per-swatch markup — same fetch-a-JSON-file
 * pattern as case-study/case-study.js's loadCaseStudies().
 *
 * Palette values are fixed by the issue body: Mint #D8F2D5, Forest Green
 * #1F4E23, Teal #38A29D, Calico Orange #EFA63C, Charcoal #231F20.
 *
 * buildProjectSection(state, palette) takes the resolved palette array as a
 * plain argument rather than calling loadAboutContent() itself, so the
 * section builder stays synchronous/directly testable — about-page.js is
 * responsible for awaiting loadAboutContent() once (mirrors the already-
 * shipped window.__aboutPageI18nReady await pattern) and passing the
 * resolved array in.
 *
 * Plain <script> tag, no ES modules
 * (docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md); wrapped in an
 * IIFE per issue #330's IIFE-redeclaration lesson (the test harness
 * re-injects this file as a fresh <script> tag), with globals attached to
 * `window` explicitly. See tests/about/about-content.test.js.
 */
(function () {
  "use strict";

  const ABOUT_DATA_PATH = window.__ABOUT_DATA_PATH__ || "data/";

  async function loadAboutContent() {
    const response = await fetch(`${ABOUT_DATA_PATH}about-content.json`);
    return response.json();
  }

  // Relative-luminance check (WCAG-style) so each swatch's own name/hex
  // label stays readable against light (Mint) and dark (Charcoal) fills
  // alike, without needing a separate contrast value in about-content.json.
  function contrastTextColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.55 ? "#231F20" : "#FFFFFF";
  }

  function buildColorPalette(palette) {
    const grid = document.createElement("div");
    grid.className = "row about-palette";
    grid.dataset.testid = "about-palette";

    palette.forEach((swatch) => {
      const col = document.createElement("div");
      col.className = "col-6 col-md-4 col-lg-2 about-palette__col";

      const el = document.createElement("div");
      el.className = "about-palette__swatch";
      el.style.backgroundColor = swatch.hex;
      el.style.color = contrastTextColor(swatch.hex);
      el.textContent = `${swatch.name} ${swatch.hex}`;

      col.appendChild(el);
      grid.appendChild(col);
    });

    return grid;
  }

  function buildProjectSection(state, palette) {
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
    section.appendChild(buildColorPalette(palette));

    return section;
  }

  window.loadAboutContent = loadAboutContent;
  window.buildColorPalette = buildColorPalette;
  window.buildProjectSection = buildProjectSection;
})();
