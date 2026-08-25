/**
 * Issue #195: single-file HTML Mega-Linter report (CSS/SVG bar chart +
 * readable list), scoped to CSS + JavaScript + YAML per @mekhal's approval
 * comment. reports/lint/report-render.js is the pure-function module the
 * "Stage report" CI step (docs/ci-drafts/mega-linter.yml, write-guard) will
 * inline into the generated reports/lint/megalinter-report.html so the file
 * stays a single self-contained page — same pattern already used by
 * shared/*.js (loaded standalone here via SharedModuleTestHelpers).
 *
 * Written before reports/lint/report-render.js exists, per TDD — fails until
 * this issue's Code PR (step 6) creates it.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  // Trimmed fixture mirroring the real Mega-Linter markdown summary table
  // format (see reports/lint/megalinter-report.html) — one row per status
  // (warning, warning, success) across the CSS/JAVASCRIPT/YAML descriptors
  // this issue scopes to.
  const SAMPLE_TABLE = [
    "| Descriptor  |                              Linter                               |Files|Fixed|Errors|Warnings|Elapsed time|",
    "|-------------|-------------------------------------------------------------------|----:|----:|-----:|-------:|-----------:|",
    "|⚠️ CSS       |[stylelint](https://megalinter.io/8.8.0/descriptors/css_stylelint) |   12|     |    49|       0|       3.08s|",
    "|⚠️ JAVASCRIPT|[eslint](https://megalinter.io/8.8.0/descriptors/javascript_eslint)|   91|     |    31|       0|       3.01s|",
    "|✅ YAML      |[v8r](https://megalinter.io/8.8.0/descriptors/yaml_v8r)            |    8|     |     0|       0|       5.52s|",
  ].join("\n");

  async function loadReportRender() {
    await loadSharedModule(window.__LINT_REPORT_RENDER_JS_PATH__ || "../reports/lint/report-render.js");
  }

  describe("reports/lint/report-render.js (issue #195)", () => {
    it("parseMegaLinterMarkdownTable() extracts one row per linter with status/descriptor/counts", async () => {
      await loadReportRender();
      const { parseMegaLinterMarkdownTable } = window.MegaLinterReportRender;

      const rows = parseMegaLinterMarkdownTable(SAMPLE_TABLE);

      expect(rows.length).toBe(3);

      expect(rows[0].status).toBe("warning");
      expect(rows[0].descriptor).toBe("CSS");
      expect(rows[0].linterName).toBe("stylelint");
      expect(rows[0].linterUrl).toBe("https://megalinter.io/8.8.0/descriptors/css_stylelint");
      expect(rows[0].files).toBe(12);
      expect(rows[0].errors).toBe(49);
      expect(rows[0].warnings).toBe(0);

      expect(rows[1].descriptor).toBe("JAVASCRIPT");
      expect(rows[1].linterName).toBe("eslint");
      expect(rows[1].errors).toBe(31);

      expect(rows[2].status).toBe("success");
      expect(rows[2].descriptor).toBe("YAML");
      expect(rows[2].linterName).toBe("v8r");
      expect(rows[2].errors).toBe(0);
    });

    it("parseMegaLinterMarkdownTable() returns an empty array for a table with no data rows", async () => {
      await loadReportRender();
      const { parseMegaLinterMarkdownTable } = window.MegaLinterReportRender;

      const rows = parseMegaLinterMarkdownTable("| Descriptor | Linter |\n|---|---|\n");

      expect(rows.length).toBe(0);
    });

    it("buildChartBars() scales each row's error/warning bar width against the largest count, with no dependency (plain %)", async () => {
      await loadReportRender();
      const { parseMegaLinterMarkdownTable, buildChartBars } = window.MegaLinterReportRender;

      const rows = parseMegaLinterMarkdownTable(SAMPLE_TABLE);
      const bars = buildChartBars(rows);

      expect(bars.length).toBe(3);
      // stylelint has the highest error count (49) among the sample rows,
      // so its bar is the full-width reference.
      expect(bars[0].errorWidthPercent).toBe(100);
      // eslint's 31 errors relative to stylelint's 49.
      expect(bars[1].errorWidthPercent).toBe(Math.round((31 / 49) * 100));
      // v8r has 0 errors -> 0-width bar, no divide-by-zero throw.
      expect(bars[2].errorWidthPercent).toBe(0);
    });

    it("buildChartBars() does not throw and returns all-zero widths when every row has 0 errors/warnings", async () => {
      await loadReportRender();
      const { buildChartBars } = window.MegaLinterReportRender;

      const bars = buildChartBars([
        { status: "success", descriptor: "YAML", linterName: "v8r", linterUrl: "#", files: 8, errors: 0, warnings: 0 },
      ]);

      expect(bars.length).toBe(1);
      expect(bars[0].errorWidthPercent).toBe(0);
      expect(bars[0].warningWidthPercent).toBe(0);
    });

    it("renderReadableList() builds one readable, non-empty text line per row including linter name and counts", async () => {
      await loadReportRender();
      const { parseMegaLinterMarkdownTable, renderReadableList } = window.MegaLinterReportRender;

      const rows = parseMegaLinterMarkdownTable(SAMPLE_TABLE);
      const list = renderReadableList(rows);

      expect(list.tagName).toBe("UL");
      expect(list.children.length).toBe(3);

      const firstItemText = list.children[0].textContent;
      expect(firstItemText).toContain("CSS");
      expect(firstItemText).toContain("stylelint");
      expect(firstItemText).toContain("49");

      const link = list.children[0].querySelector("a");
      expect(link).toBeTruthy();
      expect(link.getAttribute("href")).toBe("https://megalinter.io/8.8.0/descriptors/css_stylelint");
    });
  });
})();
