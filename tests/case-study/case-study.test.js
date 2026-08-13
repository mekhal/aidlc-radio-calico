/**
 * Issue #323 (Ticket 2 of #203), AC2 + part of AC4: case-study/case-study.js
 * fetches the hand-curated data/case-studies.json (2-3 closed AI-DLC loops)
 * and renders one Highlight Card per entry — issue number, title, category,
 * a Problem -> AI Action -> Outcome flow (three labeled rows joined by a
 * visual connector, per @mekhal's 2026-08-13T00:09 confirmation), and at
 * least one quantitative metric (Instruction Fidelity / Result
 * Satisfaction), each sourced from the matching JSON entry.
 *
 * Card grid reuses the same Bootstrap col-md-4 responsive class already
 * used by tests/test-report-dashboard.js's buildCategoryCard()/
 * buildCategoryGrid() (see tests/test-report-dashboard-taxonomy.test.js's
 * ".className.toContain('col-md-4')" precedent) rather than inventing new
 * breakpoints, per the finalized plan's AC2 (responsive) wording.
 *
 * loadCaseStudies() follows shared/translations.js's loadTranslations()
 * fetch pattern (plain fetch + .json(), no XHR) and is tested against the
 * real data/case-studies.json on disk (not mocked), same as
 * tests/shared/shared-translations.test.js does for the real i18n files.
 *
 * Written before case-study/case-study.js and data/case-studies.json exist,
 * per TDD — fails until this ticket's Code PR (step 6) creates both. The
 * curated candidates (#245/#294/#158) and JSON field shape were finalized
 * across this issue's review turns (2026-08-12/13) — see the issue #323
 * thread and its linked ai-review-evals/decision docs for each entry's
 * source values.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  // No shared/state.js load: case-study cards render fixed English report
  // text straight from data/case-studies.json (not app-chrome i18n), and
  // theme reacts purely via CSS custom properties on [data-chloe-theme] —
  // so this module takes no `state` argument, unlike buildMenu(state).
  async function loadCaseStudyModule() {
    await loadSharedModule(window.__CASE_STUDY_JS_PATH__ || "../case-study/case-study.js");
  }

  const FINALIZED_ISSUES = [245, 294, 158];
  const FINALIZED_CATEGORIES = { 245: "Architecture", 294: "Bug Fix", 158: "Feature" };

  describe("case-study/case-study.js (issue #323, Ticket 2 of #203)", () => {
    it("loadCaseStudies() fetches data/case-studies.json and returns 2-3 curated entries", async () => {
      await loadCaseStudyModule();

      const entries = await window.loadCaseStudies();

      expect(entries.length).toBeGreaterThan(1);
      expect(entries.length < 4).toBeTruthy();
    });

    it("loadCaseStudies() returns the finalized curated issues (#245, #294, #158)", async () => {
      await loadCaseStudyModule();

      const entries = await window.loadCaseStudies();
      const issues = entries.map((entry) => entry.issue);

      FINALIZED_ISSUES.forEach((issue) => {
        expect(issues).toContain(issue);
      });
    });

    it("each curated entry has issue, title, category, problem, aiAction, outcome, metrics, decisionDocUrl, evalUrl, and date", async () => {
      await loadCaseStudyModule();

      const entries = await window.loadCaseStudies();

      entries.forEach((entry) => {
        expect(typeof entry.issue).toBe("number");
        expect(typeof entry.title).toBe("string");
        expect(typeof entry.category).toBe("string");
        expect(typeof entry.problem).toBe("string");
        expect(typeof entry.aiAction).toBe("string");
        expect(typeof entry.outcome).toBe("string");
        expect(typeof entry.decisionDocUrl).toBe("string");
        expect(typeof entry.evalUrl).toBe("string");
        expect(typeof entry.date).toBe("string");
        const hasMetric =
          typeof entry.metrics.instructionFidelity === "number" ||
          typeof entry.metrics.resultSatisfaction === "number";
        expect(hasMetric).toBeTruthy();
      });
    });

    it("assigns the finalized category per curated issue (Architecture/Bug Fix/Feature)", async () => {
      await loadCaseStudyModule();

      const entries = await window.loadCaseStudies();

      entries.forEach((entry) => {
        if (FINALIZED_CATEGORIES[entry.issue]) {
          expect(entry.category).toBe(FINALIZED_CATEGORIES[entry.issue]);
        }
      });
    });

    it("buildCaseStudyCard(entry) renders issue number, title, and category", async () => {
      await loadCaseStudyModule();
      const entry = {
        issue: 245,
        title: "Component Split Architecture",
        category: "Architecture",
        problem: "P",
        aiAction: "A",
        outcome: "O",
        metrics: { instructionFidelity: 5, resultSatisfaction: 5 },
        decisionDocUrl: "https://example.com/decision",
        evalUrl: "https://example.com/eval",
        date: "2026-08-04",
      };

      const col = window.buildCaseStudyCard(entry);
      const card = col.querySelector('[data-testid="case-study-card"]');

      expect(card).toBeTruthy();
      expect(card.querySelector(".case-study-card__issue").textContent).toContain("245");
      expect(card.querySelector(".case-study-card__title").textContent).toBe(entry.title);
      expect(card.querySelector(".case-study-card__category").textContent).toBe(entry.category);
    });

    it("buildCaseStudyCard(entry) renders a Problem -> AI Action -> Outcome flow as three labeled rows joined by a visual connector", async () => {
      await loadCaseStudyModule();
      const entry = {
        issue: 294,
        title: "Dark-theme Token Fix",
        category: "Bug Fix",
        problem: "The problem text",
        aiAction: "The AI action text",
        outcome: "The outcome text",
        metrics: { instructionFidelity: 5, resultSatisfaction: 5 },
        decisionDocUrl: "https://example.com/decision",
        evalUrl: "https://example.com/eval",
        date: "2026-08-08",
      };

      const col = window.buildCaseStudyCard(entry);
      const steps = col.querySelectorAll(".case-study-card__step");
      const connectors = col.querySelectorAll(".case-study-card__connector");

      expect(steps.length).toBe(3);
      expect(steps[0].textContent).toContain(entry.problem);
      expect(steps[1].textContent).toContain(entry.aiAction);
      expect(steps[2].textContent).toContain(entry.outcome);
      expect(connectors.length).toBeGreaterThan(1);
    });

    it("buildCaseStudyCard(entry) renders at least one quantitative metric (Instruction Fidelity / Result Satisfaction)", async () => {
      await loadCaseStudyModule();
      const entry = {
        issue: 158,
        title: "Now Playing & Recently Played",
        category: "Feature",
        problem: "P",
        aiAction: "A",
        outcome: "O",
        metrics: { instructionFidelity: 4, resultSatisfaction: 5 },
        decisionDocUrl: "https://example.com/decision",
        evalUrl: "https://example.com/eval",
        date: "2026-07-29",
      };

      const col = window.buildCaseStudyCard(entry);
      const metrics = col.querySelector(".case-study-card__metrics");

      expect(metrics).toBeTruthy();
      expect(metrics.textContent).toContain("4");
      expect(metrics.textContent).toContain("5");
    });

    it("buildCaseStudyGrid(entries) lays out one card per entry in a Bootstrap col-md-4 grid (AC4, cards only)", async () => {
      await loadCaseStudyModule();
      const entries = [
        { issue: 1, title: "A", category: "X", problem: "p", aiAction: "a", outcome: "o", metrics: { instructionFidelity: 5 }, decisionDocUrl: "u", evalUrl: "u", date: "2026-01-01" },
        { issue: 2, title: "B", category: "X", problem: "p", aiAction: "a", outcome: "o", metrics: { instructionFidelity: 5 }, decisionDocUrl: "u", evalUrl: "u", date: "2026-01-01" },
        { issue: 3, title: "C", category: "X", problem: "p", aiAction: "a", outcome: "o", metrics: { instructionFidelity: 5 }, decisionDocUrl: "u", evalUrl: "u", date: "2026-01-01" },
      ];

      const grid = window.buildCaseStudyGrid(entries);
      const cols = grid.querySelectorAll('[data-testid="case-study-card-col"]');

      expect(grid.className).toContain("row");
      expect(cols.length).toBe(entries.length);
      cols.forEach((col) => expect(col.className).toContain("col-md-4"));
    });

    it("buildCaseStudyGrid(entries) returns an independent node on each call", async () => {
      await loadCaseStudyModule();
      const entries = [
        { issue: 1, title: "A", category: "X", problem: "p", aiAction: "a", outcome: "o", metrics: { instructionFidelity: 5 }, decisionDocUrl: "u", evalUrl: "u", date: "2026-01-01" },
      ];

      const first = window.buildCaseStudyGrid(entries);
      const second = window.buildCaseStudyGrid(entries);

      expect(first === second).toBeFalsy();
    });

    // Issue #330's IIFE-redeclaration lesson (recorded for menu.js) applies
    // to every module reused via loadSharedModule's fetch+inject-<script>
    // pattern, so the same regression guard is written in here up front
    // rather than discovered later.
    it("can be injected as a <script> more than once without an uncaught global redeclaration error", async () => {
      let caught = null;
      const onError = (event) => {
        caught = (event.error && event.error.message) || event.message;
      };
      window.addEventListener("error", onError);

      await loadCaseStudyModule();
      await loadCaseStudyModule();

      window.removeEventListener("error", onError);
      expect(caught).toBeFalsy();
    });
  });
})();
