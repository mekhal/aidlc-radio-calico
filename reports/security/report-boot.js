/* Bootstraps reports/security/security-report.html (issue #544): fetches
   the sibling reports/security/trivy.sarif over a same-directory relative
   path (works at any host depth, no SIDEBAR_BASE_PATH-style override
   needed), parses it via report-render.js, and renders the status card +
   category breakdown. Loaded after report-render.js, so it assumes
   window.SecurityReportRender already exists. Unlike reports/lint/
   report-boot.js, nothing here is inlined by CI — the data is fetched live
   at read time, so no workflow change was needed for this issue.

   Issue #544 follow-up (2026-08-27, mekhal): copy text is fetched from
   i18n/security-report-en.json + i18n/security-report-th.json
   (I18N_BASE_PATH mirrors shared/translations.js's window.
   __ALBUM_PROMO_I18N_BASE_PATH__ override pattern) rather than hardcoded
   here or in report-render.js.

   Issue #548 (follow-up to #544/#545): this page now mounts the app's real
   header/sidebar/footer chrome (reports/security/security-report-page.js),
   so it no longer keeps a private lang-state/localStorage key or its own
   #security-lang-toggle button — window.initSecurityReportBoot(state,
   container) takes the shared state object instead (createState(), shared/
   state.js) and builds its DOM into the <main> container
   security-report-page.js passes in, registering its render function on
   state.onLanguageChange the same way menu.js/sidebar.js/footer.js do so it
   re-renders when the sidebar's language toggle changes state.lang. */
(function () {
  var I18N_BASE_PATH = window.__SECURITY_REPORT_I18N_BASE_PATH__ || "../../i18n/";

  var CATEGORY_I18N_KEYS = {
    secrets: "categorySecrets",
    sca: "categorySca",
    misconfig: "categoryMisconfig",
    license: "categoryLicense",
  };

  function initSecurityReportBoot(state, container) {
    var data = { translations: null, parsed: null, failed: false };

    var headerRow = document.createElement("div");
    headerRow.className = "header-row";

    var titleEl = document.createElement("h1");
    titleEl.id = "security-title";
    titleEl.className = "security-report-title";

    var subtitleEl = document.createElement("div");
    subtitleEl.id = "security-subtitle";
    subtitleEl.className = "subtitle";

    var titleWrap = document.createElement("div");
    titleWrap.appendChild(titleEl);
    titleWrap.appendChild(subtitleEl);
    headerRow.appendChild(titleWrap);

    var statusCard = document.createElement("div");
    statusCard.className = "card";
    var statusEl = document.createElement("div");
    statusEl.id = "security-status";
    statusCard.appendChild(statusEl);

    var categoriesCard = document.createElement("div");
    categoriesCard.className = "card";
    var categoriesEl = document.createElement("div");
    categoriesEl.id = "security-categories";
    categoriesCard.appendChild(categoriesEl);

    var downloadRow = document.createElement("div");
    downloadRow.className = "download-row";
    var downloadLink = document.createElement("a");
    downloadLink.id = "security-download-link";
    downloadLink.className = "download-link";
    downloadLink.href = "trivy.sarif";
    downloadLink.setAttribute("download", "trivy-results.sarif");
    downloadRow.appendChild(downloadLink);

    container.appendChild(headerRow);
    container.appendChild(statusCard);
    container.appendChild(categoriesCard);
    container.appendChild(downloadRow);

    function t(key) {
      return data.translations[state.lang][key];
    }

    function renderChrome() {
      titleEl.textContent = t("title");
      subtitleEl.textContent = t("subtitle");
      downloadLink.textContent = t("downloadLink");
    }

    function renderLoading() {
      statusEl.innerHTML = "";
      const p = document.createElement("p");
      p.className = "empty-state";
      p.textContent = t("loading");
      statusEl.appendChild(p);
    }

    function renderError() {
      statusEl.innerHTML = "";
      const p = document.createElement("p");
      p.className = "empty-state";
      p.textContent = t("error");
      statusEl.appendChild(p);
      categoriesEl.innerHTML = "";
      downloadLink.style.display = "none";
    }

    function renderStatus(parsed) {
      const { formatFindingsCount } = window.SecurityReportRender;
      statusEl.innerHTML = "";
      const badge = document.createElement("span");
      badge.className = parsed.status === "passed" ? "status-badge status-passed" : "status-badge status-failed";
      const statusLabel = parsed.status === "passed" ? t("statusPassed") : t("statusFailed");
      badge.textContent = `${parsed.status === "passed" ? "✅" : "❌"} ${statusLabel}`;
      const meta = document.createElement("p");
      meta.className = "subtitle";
      meta.textContent = `${parsed.toolName} ${parsed.toolVersion} — ${formatFindingsCount(t("findingsCount"), parsed.results.length)}`;
      statusEl.appendChild(badge);
      statusEl.appendChild(meta);
    }

    function renderCategories(summary) {
      const { formatFindingsCount } = window.SecurityReportRender;
      categoriesEl.innerHTML = "";
      summary.forEach((category) => {
        const row = document.createElement("div");
        row.className = "category-row";
        const label = document.createElement("div");
        label.className = "category-label";
        label.textContent = t(CATEGORY_I18N_KEYS[category.key]);
        const count = document.createElement("div");
        count.className = "category-count";
        count.textContent = formatFindingsCount(t("findingsCount"), category.count);
        row.appendChild(label);
        row.appendChild(count);
        categoriesEl.appendChild(row);
      });
    }

    function render() {
      if (!data.translations) return;
      renderChrome();
      if (data.failed) {
        renderError();
        return;
      }
      if (!data.parsed) {
        renderLoading();
        return;
      }
      const { buildCategorySummary } = window.SecurityReportRender;
      renderStatus(data.parsed);
      renderCategories(buildCategorySummary(data.parsed.results));
    }

    function loadTranslations() {
      return Promise.all([
        fetch(`${I18N_BASE_PATH}security-report-en.json`).then((response) => response.json()),
        fetch(`${I18N_BASE_PATH}security-report-th.json`).then((response) => response.json()),
      ]).then(([en, th]) => {
        data.translations = { en, th };
      });
    }

    state.onLanguageChange.push(render);

    loadTranslations().then(() => {
      render();

      fetch("trivy.sarif")
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then((sarif) => {
          const { parseTrivySarif } = window.SecurityReportRender;
          data.parsed = parseTrivySarif(sarif);
          render();
        })
        .catch(() => {
          data.failed = true;
          render();
        });
    });
  }

  window.initSecurityReportBoot = initSecurityReportBoot;
})();
