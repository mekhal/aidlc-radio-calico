/**
 * Issue #544: text/summary Security Scan Report. reports/security/report-render.js
 * is the pure-function module reports/security/report-boot.js uses to parse
 * the Trivy SARIF file (reports/security/trivy.sarif, already published by
 * .github/workflows/trivy.yml) into a Passed/Failed status and a fixed
 * 4-category breakdown. Same pure-function/DOM-wiring split as
 * reports/lint/report-render.js + report-boot.js (issue #195) —
 * report-boot.js itself stays untested for the same reason that one does
 * (fetch + DOM wiring, not logic).
 *
 * Test PR waived at step 3 (mekhal, issue #544) — bundled into the Code PR.
 *
 * Issue #544 follow-up (2026-08-27, mekhal): the page moved from showing
 * EN/TH together to a real language toggle, with copy text moved into
 * i18n/security-report-en.json + i18n/security-report-th.json (fetched by
 * report-boot.js, untested for the same reason as its DOM wiring). The old
 * formatBilingualLabel()/STRINGS/per-category-label coverage is replaced by
 * a formatFindingsCount() test (the one small pure string-templating
 * function that still lives in report-render.js) and buildCategorySummary()
 * dropping its `label` field (labels now resolve from i18n at render time).
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadSharedModule } = window.SharedModuleTestHelpers;

  async function loadReportRender() {
    await loadSharedModule(window.__SECURITY_REPORT_RENDER_JS_PATH__ || "../reports/security/report-render.js");
  }

  const CLEAN_SARIF = {
    runs: [
      {
        tool: { driver: { name: "Trivy", version: "0.70.0", rules: [] } },
        results: [],
      },
    ],
  };

  describe("reports/security/report-render.js (issue #544)", () => {
    it("parseTrivySarif() reads tool name/version and marks a clean scan as passed", async () => {
      await loadReportRender();
      const { parseTrivySarif } = window.SecurityReportRender;

      const parsed = parseTrivySarif(CLEAN_SARIF);

      expect(parsed.toolName).toBe("Trivy");
      expect(parsed.toolVersion).toBe("0.70.0");
      expect(parsed.results.length).toBe(0);
      expect(parsed.status).toBe("passed");
    });

    it("parseTrivySarif() marks a scan with results as failed", async () => {
      await loadReportRender();
      const { parseTrivySarif } = window.SecurityReportRender;

      const parsed = parseTrivySarif({
        runs: [
          {
            tool: { driver: { name: "Trivy", version: "0.70.0" } },
            results: [{ ruleId: "CVE-2024-0001" }],
          },
        ],
      });

      expect(parsed.status).toBe("failed");
      expect(parsed.results.length).toBe(1);
    });

    it("buildCategorySummary() returns all 4 fixed categories at 0 for a clean scan", async () => {
      await loadReportRender();
      const { buildCategorySummary } = window.SecurityReportRender;

      const summary = buildCategorySummary([]);

      expect(summary.length).toBe(4);
      expect(summary.map((category) => category.key)).toEqual(["secrets", "sca", "misconfig", "license"]);
      summary.forEach((category) => expect(category.count).toBe(0));
    });

    it("buildCategorySummary() buckets CVE-*/AVD-*/license/other ruleIds into SCA/Misconfig/License/Secrets", async () => {
      await loadReportRender();
      const { buildCategorySummary } = window.SecurityReportRender;

      const summary = buildCategorySummary([
        { ruleId: "CVE-2024-0001" },
        { ruleId: "AVD-AWS-0132" },
        { ruleId: "license-mit" },
        { ruleId: "aws-access-key-id" },
      ]);

      const byKey = Object.fromEntries(summary.map((category) => [category.key, category.count]));
      expect(byKey.sca).toBe(1);
      expect(byKey.misconfig).toBe(1);
      expect(byKey.license).toBe(1);
      expect(byKey.secrets).toBe(1);
    });

    it("formatFindingsCount() substitutes {count} into an EN or TH template", async () => {
      await loadReportRender();
      const { formatFindingsCount } = window.SecurityReportRender;

      expect(formatFindingsCount("{count} finding(s)", 0)).toBe("0 finding(s)");
      expect(formatFindingsCount("{count} finding(s)", 3)).toBe("3 finding(s)");
      expect(formatFindingsCount("พบ {count} รายการ", 3)).toBe("พบ 3 รายการ");
    });

    it("CATEGORY_KEYS exposes the 4 fixed category keys in display order", async () => {
      await loadReportRender();
      const { CATEGORY_KEYS } = window.SecurityReportRender;

      expect(CATEGORY_KEYS).toEqual(["secrets", "sca", "misconfig", "license"]);
    });
  });
})();
