/**
 * Loads test-report-dashboard.js into a fresh #test-report-dashboard-root
 * element so each test starts from a clean mount — mirrors
 * tests/load-album-promo.js's loadAlbumPromo(). See tests/README.md.
 */
(function (global) {
  function currentFixturesContainer() {
    const containers = document.querySelectorAll('[id="fixtures"]');
    return containers.length ? containers[containers.length - 1] : document.body;
  }

  async function loadTestReportDashboard() {
    const fixtures = currentFixturesContainer();
    const previousRoot = fixtures.querySelector("#test-report-dashboard-root");
    if (previousRoot) previousRoot.parentNode.removeChild(previousRoot);

    const root = document.createElement("div");
    root.id = "test-report-dashboard-root";
    fixtures.appendChild(root);

    const response = await fetch(global.__TEST_REPORT_DASHBOARD_JS_PATH__ || "test-report-dashboard.js");
    const source = await response.text();

    const script = document.createElement("script");
    script.textContent = source;
    document.body.appendChild(script);
    document.body.removeChild(script);

    return root;
  }

  function unloadTestReportDashboard(root) {
    if (root && root.parentNode) root.parentNode.removeChild(root);
  }

  global.TestReportDashboardTestHelpers = { loadTestReportDashboard, unloadTestReportDashboard };
})(window);
