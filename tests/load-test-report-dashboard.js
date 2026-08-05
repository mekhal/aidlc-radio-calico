/**
 * Loads test-report-dashboard.js into a fresh #test-report-dashboard-root
 * element so each test starts from a clean mount — mirrors
 * tests/load-album-promo.js's loadAlbumPromo(). See tests/README.md.
 *
 * Issue #205 (PR A, 2026-08-05 revised AC): fetches+injects the same
 * shared/logo/menu/sidebar/footer modules index.html loads ahead of
 * album-promo.js, in the same dependency order, so test-report-dashboard.js
 * can call the real global buildHeader (buildLogo+buildMenu)/buildSidebar/
 * buildFooter once its own Code PR wires it through them — mirrors
 * tests/load-album-promo.js's own fetch+inject list.
 */
(function (global) {
  function currentFixturesContainer() {
    const containers = document.querySelectorAll('[id="fixtures"]');
    return containers.length ? containers[containers.length - 1] : document.body;
  }

  async function loadScript(path) {
    const response = await fetch(path);
    const source = await response.text();
    const script = document.createElement("script");
    script.textContent = source;
    document.body.appendChild(script);
    document.body.removeChild(script);
  }

  async function loadTestReportDashboard() {
    const fixtures = currentFixturesContainer();
    const previousRoot = fixtures.querySelector("#test-report-dashboard-root");
    if (previousRoot) previousRoot.parentNode.removeChild(previousRoot);

    const root = document.createElement("div");
    root.id = "test-report-dashboard-root";
    fixtures.appendChild(root);

    await loadScript(global.__TEST_REPORT_DASHBOARD_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadScript(global.__TEST_REPORT_DASHBOARD_SHARED_TRANSLATIONS_JS_PATH__ || "../shared/translations.js");
    await loadScript(global.__TEST_REPORT_DASHBOARD_SHARED_HELPERS_JS_PATH__ || "../shared/helpers.js");
    await loadScript(global.__TEST_REPORT_DASHBOARD_LOGO_JS_PATH__ || "../logo/logo.js");
    await loadScript(global.__TEST_REPORT_DASHBOARD_MENU_JS_PATH__ || "../menu/menu.js");
    await loadScript(global.__TEST_REPORT_DASHBOARD_SIDEBAR_JS_PATH__ || "../sidebar/sidebar.js");
    await loadScript(global.__TEST_REPORT_DASHBOARD_FOOTER_JS_PATH__ || "../footer/footer.js");
    await loadScript(global.__TEST_REPORT_DASHBOARD_JS_PATH__ || "test-report-dashboard.js");

    return root;
  }

  function unloadTestReportDashboard(root) {
    if (root && root.parentNode) root.parentNode.removeChild(root);
  }

  global.TestReportDashboardTestHelpers = { loadTestReportDashboard, unloadTestReportDashboard };
})(window);
