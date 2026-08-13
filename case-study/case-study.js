/**
 * Issue #323 (Ticket 2 of #203): Case Study Highlight Cards — fetches the
 * hand-curated data/case-studies.json (2-3 closed AI-DLC loops, picked at
 * step 2/3 of this issue's own loop, not every ai-review-evals/ entry) and
 * renders one card per entry. Plain <script> tag, no ES modules
 * (docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md).
 *
 * Cards render fixed English report text straight from the JSON (not
 * app-chrome i18n) and react to theme purely via CSS custom properties on
 * [data-chloe-theme], so — unlike menu/menu.js's buildMenu(state) or
 * footer/footer.js's buildFooter(state) — none of these functions take a
 * `state` argument. See tests/case-study/case-study.test.js.
 *
 * Issue #330's IIFE-redeclaration lesson (menu/menu.js, sidebar/sidebar.js)
 * applies here too: the test harness re-injects this file as a fresh
 * <script> tag, so CASE_STUDY_DATA_PATH must not be a top-level
 * const/let — wrapped in an IIFE, with the three globals attached to
 * `window` explicitly.
 *
 * Each card renders a Problem -> AI Action -> Outcome flow as three labeled
 * rows joined by a visual connector, per @mekhal's 2026-08-13T00:09
 * confirmation on issue #323, plus at least one quantitative metric
 * (Instruction Fidelity / Result Satisfaction) sourced from the entry.
 * Grid reuses the existing Bootstrap col-md-4 responsive class (same
 * precedent as tests/test-report-dashboard.js's buildCategoryCard()/
 * buildCategoryGrid()) rather than inventing new breakpoints, per AC4
 * (cards only).
 *
 * Issue #323 rework (2026-08-13): buildCaseStudySection() moved here from
 * album-promo.js's private helper of the same name — Case Study now lives on
 * its own standalone page (case-study.html, see
 * case-study/case-study-page.js) rather than an in-page section on
 * index.html, so the section wrapper (title + grid) needs to be reusable
 * from this module instead of album-promo.js's buildMain(). See
 * tests/album-promo-case-study-removed.test.js.
 */
(function () {
  "use strict";

  const CASE_STUDY_DATA_PATH = window.__CASE_STUDY_DATA_PATH__ || "data/";

  async function loadCaseStudies() {
    const response = await fetch(`${CASE_STUDY_DATA_PATH}case-studies.json`);
    const data = await response.json();
    return data.caseStudies;
  }

  function buildFlowStep(label, text) {
    const step = document.createElement("div");
    step.className = "case-study-card__step";

    const stepLabel = document.createElement("p");
    stepLabel.className = "case-study-card__step-label";
    stepLabel.textContent = label;

    const stepText = document.createElement("p");
    stepText.className = "case-study-card__step-text";
    stepText.textContent = text;

    step.appendChild(stepLabel);
    step.appendChild(stepText);
    return step;
  }

  function buildConnector() {
    const connector = document.createElement("div");
    connector.className = "case-study-card__connector";
    connector.setAttribute("aria-hidden", "true");
    connector.textContent = "▾";
    return connector;
  }

  function buildFlow(entry) {
    const flow = document.createElement("div");
    flow.className = "case-study-card__flow";

    flow.appendChild(buildFlowStep("Problem", entry.problem));
    flow.appendChild(buildConnector());
    flow.appendChild(buildFlowStep("AI Action", entry.aiAction));
    flow.appendChild(buildConnector());
    flow.appendChild(buildFlowStep("Outcome", entry.outcome));

    return flow;
  }

  function buildMetrics(entry) {
    const metrics = document.createElement("p");
    metrics.className = "case-study-card__metrics";

    const parts = [];
    if (typeof entry.metrics.instructionFidelity === "number") {
      parts.push(`Instruction Fidelity: ${entry.metrics.instructionFidelity}`);
    }
    if (typeof entry.metrics.resultSatisfaction === "number") {
      parts.push(`Result Satisfaction: ${entry.metrics.resultSatisfaction}`);
    }
    metrics.textContent = parts.join(" · ");

    return metrics;
  }

  function buildCaseStudyCard(entry) {
    const col = document.createElement("div");
    col.className = "col-md-4 case-study-card-col";
    col.dataset.testid = "case-study-card-col";

    const card = document.createElement("div");
    card.className = "case-study-card";
    card.dataset.testid = "case-study-card";

    const issue = document.createElement("p");
    issue.className = "case-study-card__issue";
    issue.textContent = `Issue #${entry.issue}`;

    const title = document.createElement("h3");
    title.className = "case-study-card__title";
    title.textContent = entry.title;

    const category = document.createElement("p");
    category.className = "case-study-card__category";
    category.textContent = entry.category;

    card.appendChild(issue);
    card.appendChild(title);
    card.appendChild(category);
    card.appendChild(buildFlow(entry));
    card.appendChild(buildMetrics(entry));

    col.appendChild(card);
    return col;
  }

  function buildCaseStudyGrid(entries) {
    const grid = document.createElement("div");
    grid.className = "row case-study-grid";
    grid.dataset.testid = "case-study-grid";

    entries.forEach((entry) => grid.appendChild(buildCaseStudyCard(entry)));

    return grid;
  }

  function buildCaseStudySection() {
    const section = document.createElement("section");
    section.id = "case-study";
    section.className = "chloe-case-study";

    const title = document.createElement("h2");
    title.className = "chloe-case-study__title";
    title.textContent = "Case Study";

    const grid = document.createElement("div");
    grid.className = "row case-study-grid";

    section.appendChild(title);
    section.appendChild(grid);

    loadCaseStudies().then((entries) => {
      grid.replaceWith(buildCaseStudyGrid(entries));
    });

    return section;
  }

  window.loadCaseStudies = loadCaseStudies;
  window.buildCaseStudyCard = buildCaseStudyCard;
  window.buildCaseStudyGrid = buildCaseStudyGrid;
  window.buildCaseStudySection = buildCaseStudySection;
})();
