/* Bootstraps reports/security/security-report.html (issue #544): fetches
   the sibling reports/security/trivy.sarif over a same-directory relative
   path (works at any host depth, no SIDEBAR_BASE_PATH-style override
   needed), parses it via report-render.js, and renders the status card +
   category breakdown. Loaded after report-render.js, so it assumes
   window.SecurityReportRender already exists and #security-status/
   #security-categories/#security-download-link are present. Unlike
   reports/lint/report-boot.js, nothing here is inlined by CI — the data is
   fetched live at read time, so no workflow change was needed for this
   issue. */
(function () {
  const statusEl = document.getElementById("security-status");
  const categoriesEl = document.getElementById("security-categories");
  const downloadLink = document.getElementById("security-download-link");

  function renderLoading() {
    statusEl.innerHTML = "";
    const p = document.createElement("p");
    p.className = "empty-state";
    p.textContent = "Loading scan results...";
    statusEl.appendChild(p);
  }

  function renderError() {
    statusEl.innerHTML = "";
    const p = document.createElement("p");
    p.className = "empty-state";
    p.textContent = "Could not load trivy.sarif — the scan report may not have been published for this build yet.";
    statusEl.appendChild(p);
    categoriesEl.innerHTML = "";
    downloadLink.style.display = "none";
  }

  function renderStatus(parsed) {
    statusEl.innerHTML = "";
    const badge = document.createElement("span");
    badge.className = parsed.status === "passed" ? "status-badge status-passed" : "status-badge status-failed";
    badge.textContent = parsed.status === "passed" ? "✅ Passed" : "❌ Failed";
    const meta = document.createElement("p");
    meta.className = "subtitle";
    meta.textContent = `${parsed.toolName} ${parsed.toolVersion} — ${parsed.results.length} finding(s)`;
    statusEl.appendChild(badge);
    statusEl.appendChild(meta);
  }

  function renderCategories(summary) {
    categoriesEl.innerHTML = "";
    summary.forEach((category) => {
      const row = document.createElement("div");
      row.className = "category-row";
      const label = document.createElement("div");
      label.className = "category-label";
      label.textContent = category.label;
      const count = document.createElement("div");
      count.className = "category-count";
      count.textContent = category.count === 0 ? "0 findings" : `${category.count} finding(s)`;
      row.appendChild(label);
      row.appendChild(count);
      categoriesEl.appendChild(row);
    });
  }

  renderLoading();

  fetch("trivy.sarif")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((sarif) => {
      const { parseTrivySarif, buildCategorySummary } = window.SecurityReportRender;
      const parsed = parseTrivySarif(sarif);
      renderStatus(parsed);
      renderCategories(buildCategorySummary(parsed.results));
    })
    .catch(() => {
      renderError();
    });
})();
