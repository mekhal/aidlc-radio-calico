/**
 * Issue #205: Test Report Dashboard — an infographic view of the last test
 * run, sourced only from localStorage (tests/report-storage.js), never by
 * re-running the suite itself (AC3, confirmed at step-3 approval: the
 * dashboard must not depend on tests/test-runner.html as its data source).
 *
 * AC-A1/AC-A2/AC-A3 (2026-08-05 revised AC, issue #205 PR A): the header/
 * sidebar/footer chrome is no longer a private duplicate — this page now
 * composes the same reusable globals index.html/album-promo.js do:
 * createState() (shared/state.js), buildLogo() (logo/logo.js), buildMenu()
 * (menu/menu.js), buildSidebar(state) (sidebar/sidebar.js), buildFooter()
 * (footer/footer.js). This page's own buildHeader() mirrors album-promo.js's
 * private buildHeader(state) composition (there is no single reusable
 * "buildHeader" global — buildLogo/buildMenu are the reusable pieces).
 *
 * AC-A2: the shared menu's in-page anchors (#home/#about/...) only resolve
 * on index.html itself, so they're rewritten here to `../index.html#...`
 * once mounted on this page (which lives one directory down, in tests/).
 *
 * AC-A3: buildSidebar(state) brings its own theme/language toggle switches
 * along "for free" — no separate wiring needed here (a deliberate reversal
 * of PR #207's original no-toggle decision, confirmed at this AC revision).
 *
 * Loaded as a plain <script> global (no npm/imports), like the rest of
 * tests/*.js. Functions stay small/testable via the DOM behavior they
 * produce, matching every other suite in this repo (see tests/README.md).
 */
(function () {
  "use strict";

  const EMPTY_STATE_MESSAGE = "No test run recorded yet — run tests/test-runner.html first.";

  function buildHeader(state) {
    const header = document.createElement("header");
    header.className = "chloe-header";

    const wordmark = buildLogo();
    const logoImg = wordmark.querySelector("img");
    if (logoImg) logoImg.setAttribute("src", `../${logoImg.getAttribute("src")}`);

    const nav = buildMenu(state);
    Array.from(nav.querySelectorAll("a")).forEach((link) => {
      link.setAttribute("href", `../index.html${link.getAttribute("href")}`);
    });

    header.appendChild(wordmark);
    header.appendChild(nav);

    return header;
  }

  function buildStatTile(label, value, modifierClass) {
    const tile = document.createElement("div");
    tile.className = `report-stat-tile ${modifierClass}`;
    tile.dataset.testid = `report-stat-${modifierClass.replace("report-stat-tile--", "")}`;

    const valueEl = document.createElement("p");
    valueEl.className = "report-stat-tile__value";
    valueEl.textContent = String(value);

    const labelEl = document.createElement("p");
    labelEl.className = "report-stat-tile__label";
    labelEl.textContent = label;

    tile.appendChild(valueEl);
    tile.appendChild(labelEl);
    return tile;
  }

  function buildStatsRow(summary) {
    const row = document.createElement("div");
    row.className = "report-stats-row";
    row.dataset.testid = "report-stats-row";

    const passRate = summary.total ? Math.round((summary.passed / summary.total) * 100) : 0;

    row.appendChild(buildStatTile("Total", summary.total, "report-stat-tile--total"));
    row.appendChild(buildStatTile("Passed", summary.passed, "report-stat-tile--passed"));
    row.appendChild(buildStatTile("Failed", summary.failed, "report-stat-tile--failed"));
    row.appendChild(buildStatTile("Pass rate", `${passRate}%`, "report-stat-tile--rate"));

    return row;
  }

  function buildResultsList(results) {
    const list = document.createElement("ul");
    list.className = "report-list";
    list.dataset.testid = "report-results-list";

    results.forEach((result) => {
      const item = document.createElement("li");
      item.className = `report-list__item ${result.passed ? "is-pass" : "is-fail"}`;
      item.dataset.testid = "report-result-item";

      const name = document.createElement("span");
      name.className = "report-list__name";
      name.textContent = `${result.passed ? "✓" : "✗"} ${result.name}`;
      item.appendChild(name);

      if (!result.passed && result.error) {
        const error = document.createElement("span");
        error.className = "report-list__error";
        error.textContent = result.error;
        item.appendChild(error);
      }

      list.appendChild(item);
    });

    return list;
  }

  function buildTimestampLine(timestamp) {
    const line = document.createElement("p");
    line.className = "report-timestamp";
    line.dataset.testid = "report-timestamp";
    line.textContent = timestamp ? `Last run: ${new Date(timestamp).toLocaleString()}` : "";
    return line;
  }

  function buildEmptyState() {
    const empty = document.createElement("p");
    empty.className = "report-empty-state";
    empty.dataset.testid = "report-empty-state";
    empty.textContent = EMPTY_STATE_MESSAGE;
    return empty;
  }

  // AC-B1: "Reload Test" button — reused for both the manual click and the
  // AC-B3 auto-run, via the onReload callback passed in from initTestReportDashboard.
  function buildReloadButton(onReload) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "report-reload-button";
    button.dataset.testid = "report-reload-button";
    button.textContent = "Reload Test";
    button.addEventListener("click", onReload);
    return button;
  }

  function renderDashboardContent(container, report, onReload) {
    container.textContent = "";

    const heading = document.createElement("h1");
    heading.className = "report-heading";
    heading.textContent = "Test Report Dashboard";
    container.appendChild(heading);
    container.appendChild(buildReloadButton(onReload));

    if (!report) {
      container.appendChild(buildEmptyState());
      return;
    }

    container.appendChild(buildTimestampLine(report.timestamp));
    container.appendChild(buildStatsRow(report.summary));
    container.appendChild(buildResultsList(report.results));
  }

  // AC-B1: drives a fresh suite run through a hidden <iframe> pointed at
  // test-runner.html, rather than re-running the suite in this document —
  // this page already mounts its own chrome/globals, which would collide
  // with test-runner.html's fixtures if run inline (see the module doc
  // comment in tests/test-report-dashboard-reload.test.js).
  function buildLoadingBackdrop() {
    const backdrop = document.createElement("div");
    backdrop.className = "report-loading-backdrop";
    backdrop.dataset.testid = "report-loading-backdrop";

    const label = document.createElement("p");
    label.className = "report-loading-backdrop__label";
    label.textContent = "Running tests…";
    backdrop.appendChild(label);

    const iframe = document.createElement("iframe");
    iframe.dataset.testid = "report-test-runner-iframe";
    iframe.title = "Test suite runner";
    iframe.hidden = true;
    iframe.setAttribute("aria-hidden", "true");
    backdrop.appendChild(iframe);

    document.body.appendChild(backdrop);
    // AC-B2: test-runner.html calls window.parent.onTestRunComplete() (set
    // below) once it has saved its results — only meaningful once the
    // iframe is actually in the document, so src is set last.
    iframe.src = "test-runner.html";

    return backdrop;
  }

  // AC-B1/AC-B2/AC-B3: shared by the Reload Test button click and the
  // empty-storage auto-run — shows the backdrop+iframe, and wires
  // window.onTestRunComplete (AC-B2's contract with test-runner.html) to
  // hide the backdrop and re-render `main` from the freshly-saved report.
  function startTestRun(main) {
    if (document.querySelector('[data-testid="report-loading-backdrop"]')) return;

    const backdrop = buildLoadingBackdrop();

    window.onTestRunComplete = function () {
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      renderDashboardContent(main, window.TestReportStorage.loadTestReport(), () => startTestRun(main));
    };
  }

  function initTestReportDashboard() {
    const root = document.getElementById("test-report-dashboard-root");
    if (!root) return;

    const state = createState();
    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-chloe-theme", state.theme);

    root.appendChild(buildSidebar(state));

    const page = document.createElement("div");
    page.className = "chloe-page";
    page.appendChild(buildHeader(state));

    const main = document.createElement("main");
    main.className = "chloe-main report-dashboard-main";
    main.dataset.testid = "report-dashboard-main";

    const initialReport = window.TestReportStorage.loadTestReport();
    renderDashboardContent(main, initialReport, () => startTestRun(main));
    page.appendChild(main);

    page.appendChild(buildFooter(state));
    root.appendChild(page);

    // AC-B3: auto-run only when nothing has ever been stored yet; otherwise
    // require the human to press Reload Test themselves.
    if (!initialReport) {
      startTestRun(main);
    }
  }

  initTestReportDashboard();
})();
