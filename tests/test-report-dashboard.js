/**
 * Issue #205: Test Report Dashboard — an infographic view of the last test
 * run, sourced only from localStorage (tests/report-storage.js), never by
 * re-running the suite itself (AC3, confirmed at step-3 approval: the
 * dashboard must not depend on tests/test-runner.html as its data source).
 *
 * AC2: reuses the same header/sidebar/footer chrome (chloe-header/
 * chloe-sidebar/chloe-footer classes + album-promo.css) that index.html
 * ships via album-promo.js, so this page visually matches the live site.
 * Kept as its own self-contained script (mirrors album-promo.js's own
 * decision to duplicate rather than import from app.js) rather than pulling
 * in album-promo.js directly — that module also builds the Hero/Now
 * Playing/player-controls React island, none of which this page needs or
 * loads (AC2: "no player/now-playing/hero content").
 *
 * AC5: sidebar's "Test Report" link is replaced with a "Home" link back to
 * the live site, since linking to this page from itself has no purpose.
 *
 * Loaded as a plain <script> global (no npm/imports), like the rest of
 * tests/*.js. Functions stay small/testable via the DOM behavior they
 * produce, matching every other suite in this repo (see tests/README.md).
 */
(function () {
  "use strict";

  const SIDEBAR_LINKS = [
    {
      testid: "dashboard-sidebar-home-link",
      href: "../index.html",
      label: "Radio Calico Home",
      icon: "bi-house",
      external: false,
    },
    {
      testid: "dashboard-sidebar-site-link",
      href: "https://www.radio-calico.com/",
      label: "radio-calico.com",
      icon: "bi-broadcast",
      external: true,
    },
    {
      testid: "dashboard-sidebar-lint-report-link",
      href: "../reports/lint/megalinter-report.html",
      label: "Lint Report",
      icon: "bi-brush",
      external: true,
    },
    {
      testid: "dashboard-sidebar-security-report-link",
      href: "../reports/security/trivy.sarif",
      label: "Security Scan Report",
      icon: "bi-shield-check",
      external: true,
    },
    {
      testid: "dashboard-sidebar-github-link",
      href: "https://github.com/mekhal/aidlc-radio-calico",
      label: "GitHub",
      icon: "bi-github",
      external: true,
    },
    {
      testid: "dashboard-sidebar-linkedin-link",
      href: "https://www.linkedin.com/in/mekhalomlao/",
      label: "LinkedIn",
      icon: "bi-linkedin",
      external: true,
    },
  ];

  const EMPTY_STATE_MESSAGE = "No test run recorded yet — run tests/test-runner.html first.";

  function createIconLink({ testid, href, label, icon, external }) {
    const link = document.createElement("a");
    link.dataset.testid = testid;
    link.href = href;
    link.title = label;
    link.setAttribute("aria-label", label);
    if (external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    const iconEl = document.createElement("i");
    iconEl.className = `bi ${icon}`;
    iconEl.setAttribute("aria-hidden", "true");
    link.appendChild(iconEl);

    return link;
  }

  function buildHeader() {
    const header = document.createElement("header");
    header.className = "chloe-header";

    const wordmark = document.createElement("span");
    wordmark.className = "chloe-wordmark";

    const logo = document.createElement("img");
    logo.className = "chloe-wordmark__logo";
    logo.src = "../RadioCalicoStyle/RadioCalicoLogoTM.png";
    logo.alt = "Radio Calico logo";

    wordmark.appendChild(document.createTextNode("Radio"));
    wordmark.appendChild(logo);
    wordmark.appendChild(document.createTextNode("Calico"));

    const nav = document.createElement("nav");
    nav.className = "chloe-nav";
    nav.setAttribute("aria-label", "Primary");

    const homeLink = document.createElement("a");
    homeLink.href = "../index.html";
    homeLink.textContent = "Home";
    homeLink.dataset.testid = "dashboard-header-home-link";
    nav.appendChild(homeLink);

    header.appendChild(wordmark);
    header.appendChild(nav);

    return header;
  }

  function buildSidebar() {
    const aside = document.createElement("aside");
    aside.className = "chloe-sidebar";
    aside.setAttribute("aria-label", "Site links");

    const nav = document.createElement("nav");
    nav.className = "chloe-sidebar__icons";
    nav.setAttribute("aria-label", "Site links");
    SIDEBAR_LINKS.forEach((entry) => nav.appendChild(createIconLink(entry)));

    aside.appendChild(nav);
    return aside;
  }

  function buildFooter() {
    const footer = document.createElement("footer");
    footer.className = "chloe-footer";

    const disclaimer = document.createElement("p");
    disclaimer.className = "chloe-footer__disclaimer";
    disclaimer.textContent =
      "Radio Calico is an independent internet radio stream. All music remains the property of its respective owners.";

    const copy = document.createElement("p");
    copy.className = "chloe-footer__copy";
    copy.innerHTML = "&copy; 2026 Radio Calico. Released under the MIT License.";

    footer.appendChild(disclaimer);
    footer.appendChild(copy);

    return footer;
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

  function renderDashboardContent(container, report) {
    container.textContent = "";

    const heading = document.createElement("h1");
    heading.className = "report-heading";
    heading.textContent = "Test Report Dashboard";
    container.appendChild(heading);

    if (!report) {
      container.appendChild(buildEmptyState());
      return;
    }

    container.appendChild(buildTimestampLine(report.timestamp));
    container.appendChild(buildStatsRow(report.summary));
    container.appendChild(buildResultsList(report.results));
  }

  function initTestReportDashboard() {
    const root = document.getElementById("test-report-dashboard-root");
    if (!root) return;

    root.appendChild(buildSidebar());

    const page = document.createElement("div");
    page.className = "chloe-page";
    page.appendChild(buildHeader());

    const main = document.createElement("main");
    main.className = "chloe-main report-dashboard-main";
    main.dataset.testid = "report-dashboard-main";
    renderDashboardContent(main, window.TestReportStorage.loadTestReport());
    page.appendChild(main);

    page.appendChild(buildFooter());
    root.appendChild(page);
  }

  initTestReportDashboard();
})();
