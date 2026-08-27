/**
 * Parses the Trivy SARIF report (reports/security/trivy.sarif, already
 * published by .github/workflows/trivy.yml on every run — issue #544) into
 * the summary reports/security/report-boot.js renders: a Passed/Failed
 * status plus a fixed 4-category breakdown (Secrets / SCA / Misconfig /
 * License), matching the issue's Option A decision to ship the category
 * labels now rather than build/test real bucketing logic against a scan
 * that currently has zero results.
 *
 * Same pure-function / DOM-wiring split as reports/lint/report-render.js +
 * report-boot.js (issue #195): loaded as a plain <script> global, no
 * npm/imports.
 */
(function (global) {
  const CATEGORIES = [
    { key: "secrets", label: "Secrets Detection" },
    { key: "sca", label: "Dependencies (SCA)" },
    { key: "misconfig", label: "Misconfigurations" },
    { key: "license", label: "License Compliance" },
  ];

  function parseTrivySarif(sarif) {
    const run = (sarif && sarif.runs && sarif.runs[0]) || {};
    const driver = (run.tool && run.tool.driver) || {};
    const results = run.results || [];
    return {
      toolName: driver.name || "Trivy",
      toolVersion: driver.version || "",
      results,
      status: results.length === 0 ? "passed" : "failed",
    };
  }

  // Trivy's SARIF ruleIds follow a loose convention: CVE-* for dependency
  // vulnerabilities (SCA) and AVD-* for misconfiguration checks; license
  // findings carry "license" in the ruleId. Everything else falls back to
  // Secrets, since Trivy's secret-scanner ruleIds (e.g. "aws-access-key-id")
  // have no fixed prefix to match on. Untested against a real finding today
  // since the current scan is clean (results: []) — revisit this mapping
  // once real data exists to write a fixture against.
  function categoryForResult(result) {
    const ruleId = (result && result.ruleId) || "";
    if (/^CVE-/i.test(ruleId)) return "sca";
    if (/^AVD-/i.test(ruleId)) return "misconfig";
    if (/license/i.test(ruleId)) return "license";
    return "secrets";
  }

  function buildCategorySummary(results) {
    const counts = { secrets: 0, sca: 0, misconfig: 0, license: 0 };
    (results || []).forEach((result) => {
      counts[categoryForResult(result)] += 1;
    });
    return CATEGORIES.map((category) => ({
      key: category.key,
      label: category.label,
      count: counts[category.key],
    }));
  }

  global.SecurityReportRender = {
    parseTrivySarif,
    categoryForResult,
    buildCategorySummary,
  };
})(window);
