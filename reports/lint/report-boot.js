/* Bootstraps the generated reports/lint/megalinter-report.html (issue #195):
   reads the embedded Markdown summary, parses it via the also-inlined
   report-render.js, and renders the bar chart + readable list into the DOM.
   Inlined by the CI "Stage report" step (docs/ci-drafts/mega-linter.yml,
   write-guard) after report-render.js in the generated page — never loaded
   standalone, so it assumes window.MegaLinterReportRender already exists
   and #megalinter-markdown/#megalinter-chart/#megalinter-list are present. */
(function () {
  const markdown = document.getElementById("megalinter-markdown").textContent;
  const { parseMegaLinterMarkdownTable, buildChartBars, renderReadableList } = window.MegaLinterReportRender;

  const rows = parseMegaLinterMarkdownTable(markdown);
  const chart = document.getElementById("megalinter-chart");
  const list = document.getElementById("megalinter-list");

  if (rows.length === 0) {
    chart.textContent = "";
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No linter data found in this run's summary.";
    list.appendChild(empty);
    return;
  }

  const bars = buildChartBars(rows);
  bars.forEach((bar, i) => {
    const row = document.createElement("div");
    row.className = "bar-row";

    const label = document.createElement("div");
    label.className = "bar-label";
    label.textContent = `${bar.descriptor} / ${bar.linterName}`;

    const track = document.createElement("div");
    track.className = "bar-track";
    const errorFill = document.createElement("div");
    errorFill.className = "bar-fill-error";
    errorFill.style.width = `${bar.errorWidthPercent}%`;
    const warningFill = document.createElement("div");
    warningFill.className = "bar-fill-warning";
    warningFill.style.width = `${bar.warningWidthPercent}%`;
    track.appendChild(errorFill);
    track.appendChild(warningFill);

    const count = document.createElement("div");
    count.className = "bar-count";
    count.textContent = `${rows[i].errors} err / ${rows[i].warnings} warn`;

    row.appendChild(label);
    row.appendChild(track);
    row.appendChild(count);
    chart.appendChild(row);
  });

  list.appendChild(renderReadableList(rows));
})();
