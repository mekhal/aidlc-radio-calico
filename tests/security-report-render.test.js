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
 * Issue #544 follow-up (2026-08-27 review): mekhal asked for bilingual
 * (EN/TH) body labels on this page — formatBilingualLabel()/
 * formatFindingsCount() are the pure functions that produce that text, so
 * they're covered here alongside the existing parse/categorize tests.
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

    it("buildCategorySummary() renders each category's label bilingually (EN / TH)", async () => {
      await loadReportRender();
      const { buildCategorySummary } = window.SecurityReportRender;

      const summary = buildCategorySummary([]);
      const byKey = Object.fromEntries(summary.map((category) => [category.key, category.label]));

      expect(byKey.secrets).toBe("Secrets Detection / การตรวจจับข้อมูลลับ");
      expect(byKey.sca).toBe("Dependencies (SCA) / การพึ่งพา (SCA)");
      expect(byKey.misconfig).toBe("Misconfigurations / การตั้งค่าที่ผิดพลาด");
      expect(byKey.license).toBe("License Compliance / การปฏิบัติตามสัญญาอนุญาต");
    });

    it("formatBilingualLabel() joins an { en, th } field as 'EN / TH'", async () => {
      await loadReportRender();
      const { formatBilingualLabel } = window.SecurityReportRender;

      expect(formatBilingualLabel({ en: "Passed", th: "ผ่าน" })).toBe("Passed / ผ่าน");
    });

    it("formatFindingsCount() renders a bilingual count for zero and non-zero", async () => {
      await loadReportRender();
      const { formatFindingsCount } = window.SecurityReportRender;

      expect(formatFindingsCount(0)).toBe("0 finding(s) / พบ 0 รายการ");
      expect(formatFindingsCount(3)).toBe("3 finding(s) / พบ 3 รายการ");
    });

    it("STRINGS exposes bilingual loading/error/status text", async () => {
      await loadReportRender();
      const { STRINGS } = window.SecurityReportRender;

      expect(STRINGS.loading.en).toBe("Loading scan results...");
      expect(STRINGS.loading.th).toBeTruthy();
      expect(STRINGS.error.th).toBeTruthy();
      expect(STRINGS.statusPassed).toEqual({ en: "Passed", th: "ผ่าน" });
      expect(STRINGS.statusFailed).toEqual({ en: "Failed", th: "ไม่ผ่าน" });
    });
  });
})();
