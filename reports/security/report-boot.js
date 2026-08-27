/* Bootstraps reports/security/security-report.html (issue #544): fetches
   the sibling reports/security/trivy.sarif over a same-directory relative
   path (works at any host depth, no SIDEBAR_BASE_PATH-style override
   needed), parses it via report-render.js, and renders the status card +
   category breakdown. Loaded after report-render.js, so it assumes
   window.SecurityReportRender already exists and #security-title/
   #security-subtitle/#security-status/#security-categories/
   #security-download-link/#security-lang-toggle are present. Unlike
   reports/lint/report-boot.js, nothing here is inlined by CI — the data is
   fetched live at read time, so no workflow change was needed for this
   issue.

   Issue #544 follow-up (2026-08-27, mekhal): replaces the earlier
   "render EN and TH together" approach with a real language toggle button.
   Copy text is fetched from i18n/security-report-en.json +
   i18n/security-report-th.json (I18N_BASE_PATH mirrors shared/
   translations.js's window.__ALBUM_PROMO_I18N_BASE_PATH__ override
   pattern) rather than hardcoded here or in report-render.js. This page is
   standalone (no album-promo.js/shared/state.js mounted, same
   self-contained-page precedent sidebar.js's own createSwitch() copy
   follows) so it keeps its own small lang-state + localStorage key rather
   than reusing createState()/ALBUM_PROMO_TRANSLATIONS. */
(function () {
  var LANG_STORAGE_KEY = "radioCalicoSecurityReportLanguage";
  var I18N_BASE_PATH = window.__SECURITY_REPORT_I18N_BASE_PATH__ || "../../i18n/";

  var CATEGORY_I18N_KEYS = {
    secrets: "categorySecrets",
    sca: "categorySca",
    misconfig: "categoryMisconfig",
    license: "categoryLicense",
  };

  function getStoredLanguage() {
    return window.localStorage.getItem(LANG_STORAGE_KEY) === "th" ? "th" : "en";
  }

  var state = { lang: getStoredLanguage(), translations: null, parsed: null, failed: false };

  var titleEl = document.getElementById("security-title");
  var subtitleEl = document.getElementById("security-subtitle");
  var statusEl = document.getElementById("security-status");
  var categoriesEl = document.getElementById("security-categories");
  var downloadLink = document.getElementById("security-download-link");
  var langToggle = document.getElementById("security-lang-toggle");

  function t(key) {
    return state.translations[state.lang][key];
  }

  function renderChrome() {
    document.documentElement.lang = state.lang;
    titleEl.textContent = t("title");
    subtitleEl.textContent = t("subtitle");
    downloadLink.textContent = t("downloadLink");
    langToggle.textContent = state.lang === "en" ? "TH" : "EN";
    langToggle.setAttribute("aria-label", t("languageToggleLabel"));
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
    if (!state.translations) return;
    renderChrome();
    if (state.failed) {
      renderError();
      return;
    }
    if (!state.parsed) {
      renderLoading();
      return;
    }
    const { buildCategorySummary } = window.SecurityReportRender;
    renderStatus(state.parsed);
    renderCategories(buildCategorySummary(state.parsed.results));
  }

  function loadTranslations() {
    return Promise.all([
      fetch(`${I18N_BASE_PATH}security-report-en.json`).then((response) => response.json()),
      fetch(`${I18N_BASE_PATH}security-report-th.json`).then((response) => response.json()),
    ]).then(([en, th]) => {
      state.translations = { en, th };
    });
  }

  langToggle.addEventListener("click", () => {
    state.lang = state.lang === "en" ? "th" : "en";
    window.localStorage.setItem(LANG_STORAGE_KEY, state.lang);
    render();
  });

  loadTranslations().then(() => {
    render();

    fetch("trivy.sarif")
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((sarif) => {
        const { parseTrivySarif } = window.SecurityReportRender;
        state.parsed = parseTrivySarif(sarif);
        render();
      })
      .catch(() => {
        state.failed = true;
        render();
      });
  });
})();
