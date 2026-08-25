/**
 * Renders Mega-Linter's Markdown summary table (MARKDOWN_SUMMARY_REPORTER,
 * already enabled) as a single-file HTML report: a dependency-free CSS bar
 * chart plus a readable per-linter list. Issue #195.
 *
 * Loaded as a plain <script> global (no npm/imports), like the rest of this
 * repo's browser code. The CI "Stage report" step embeds this file's source
 * plus the raw Markdown summary directly into the generated
 * reports/lint/megalinter-report.html, so parsing/rendering happens in the
 * reader's browser when the report is opened — the file stays a single,
 * self-contained static page with no build step.
 */
(function (global) {
  const STATUS_ICONS = { success: "✅", warning: "⚠️", error: "❌" };

  function statusFromIcon(icon) {
    if (icon === "✅") return "success";
    if (icon === "❌") return "error";
    if (icon === "⚠️") return "warning";
    return "unknown";
  }

  function isSeparatorRow(line) {
    return /^\|[-:\s|]+\|$/.test(line);
  }

  function parseMegaLinterMarkdownTable(markdown) {
    const lines = markdown
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("|"));

    const rows = [];
    for (const line of lines) {
      if (isSeparatorRow(line)) continue;

      const cells = line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());
      if (cells.length < 6) continue;
      if (/^descriptor$/i.test(cells[0])) continue;

      const [icon, ...descriptorParts] = cells[0].split(/\s+/);
      const linkMatch = cells[1].match(/\[(.*?)\]\((.*?)\)/);
      if (!linkMatch) continue;

      rows.push({
        status: statusFromIcon(icon),
        descriptor: descriptorParts.join(" "),
        linterName: linkMatch[1],
        linterUrl: linkMatch[2],
        files: parseInt(cells[2], 10) || 0,
        errors: parseInt(cells[4], 10) || 0,
        warnings: parseInt(cells[5], 10) || 0,
      });
    }
    return rows;
  }

  function widthPercent(value, max) {
    return max > 0 ? Math.round((value / max) * 100) : 0;
  }

  function buildChartBars(rows) {
    const maxErrors = Math.max(0, ...rows.map((r) => r.errors));
    const maxWarnings = Math.max(0, ...rows.map((r) => r.warnings));
    return rows.map((r) => ({
      descriptor: r.descriptor,
      linterName: r.linterName,
      errorWidthPercent: widthPercent(r.errors, maxErrors),
      warningWidthPercent: widthPercent(r.warnings, maxWarnings),
    }));
  }

  function renderReadableList(rows) {
    const ul = document.createElement("ul");
    rows.forEach((r) => {
      const li = document.createElement("li");
      const icon = STATUS_ICONS[r.status] || "";
      const link = document.createElement("a");
      link.href = r.linterUrl;
      link.textContent = r.linterName;

      li.appendChild(document.createTextNode(`${icon} ${r.descriptor} — `.trim() + " "));
      li.appendChild(link);
      li.appendChild(document.createTextNode(`: ${r.files} files, ${r.errors} errors, ${r.warnings} warnings`));
      ul.appendChild(li);
    });
    return ul;
  }

  global.MegaLinterReportRender = {
    parseMegaLinterMarkdownTable,
    buildChartBars,
    renderReadableList,
  };
})(window);
