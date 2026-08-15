/**
 * Issue #205 (PR A / AC-A1-A3, 2026-08-05 revised AC): the Test Report
 * Dashboard must reuse the SAME chrome components index.html/album-promo.js
 * compose — createState() + buildHeader (buildLogo + buildMenu) +
 * buildSidebar(state) + buildFooter(state) — instead of its own private
 * duplicate buildHeader/buildSidebar/buildFooter (the AC2 interpretation
 * shipped in PR #207, before shared/logo/menu/sidebar/footer existed as
 * reusable modules).
 *
 * Written before test-report-dashboard.js is updated, per TDD — fails
 * until this PR's Code PR wires the dashboard through the shared modules.
 * See tests/load-test-report-dashboard.js (updated in this same PR to
 * fetch+inject shared/logo/menu/sidebar/footer ahead of
 * test-report-dashboard.js, mirroring tests/load-album-promo.js's own
 * precedent).
 *
 * Issue #322 (Ticket 1 of #203): the shared menu component gains a
 * `caseStudy` entry between `whatsThis` and `contact` (AC1); since this
 * dashboard reuses that component as-is (reuse-first), its rendered nav
 * picks up the same 5th link automatically (AC5 — no drift). Written before
 * menu/menu.js implements it, per TDD.
 *
 * Issue #323 (rework, 2026-08-13): caseStudy's href is now the real page
 * "case-study.html" (was the hash anchor "#case-study"), so this page's own
 * buildHeader() (test-report-dashboard.js) rewrites it to "../case-study.html"
 * instead of the "../index.html#..." rewrite the other four items get.
 *
 * Issue #151 (Ticket 1 of the About page story): about's href is now the
 * real page "pages/about.html" (was the hash anchor "#about") — this page's
 * generic non-hash rewrite rule (`../${href}`), already exercised by
 * caseStudy above, applies unchanged and produces "../pages/about.html".
 */
(function () {
  const { describe, it, expect } = window.TestHarness;
  const { loadTestReportDashboard, unloadTestReportDashboard } = window.TestReportDashboardTestHelpers;
  const { STORAGE_KEY } = window.TestReportStorage;

  function nextTick() {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  // Mirrors sidebar/sidebar.js's own SIDEBAR_LINKS (module-private — `const`
  // at script scope, so not reachable off `window` — hardcoded here the same
  // way tests/sidebar/sidebar.test.js hardcodes its own copy).
  const SHARED_SIDEBAR_LINK_TESTIDS = [
    "sidebar-footer-site-link",
    "sidebar-footer-test-report-link",
    "sidebar-footer-lint-report-link",
    "sidebar-footer-security-report-link",
    "sidebar-footer-github-link",
    "sidebar-footer-linkedin-link",
  ];

  describe("Test Report Dashboard reuses shared chrome (issue #205, PR A)", () => {
    it("renders the full primary nav menu (home/about/whats-this/case-study/contact) via the shared menu component", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      const root = await loadTestReportDashboard();
      await nextTick();

      const nav = root.querySelector(".chloe-nav");
      expect(nav).toBeTruthy();
      const links = nav.querySelectorAll("a");
      expect(links.length).toBe(5);

      unloadTestReportDashboard(root);
    });

    it("rewrites the shared menu's in-page anchors to point back at index.html (AC-A2)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      const root = await loadTestReportDashboard();
      await nextTick();

      const hrefs = Array.from(root.querySelectorAll(".chloe-nav a")).map((a) => a.getAttribute("href"));
      expect(hrefs).toEqual([
        "../index.html#home",
        "../pages/about.html",
        "../index.html#whats-this",
        "../case-study.html",
        "../index.html#contact",
      ]);

      unloadTestReportDashboard(root);
    });

    it("renders the shared sidebar's theme and language toggle switches (AC-A3)", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      const root = await loadTestReportDashboard();
      await nextTick();

      expect(root.querySelector('[data-testid="sidebar-theme-toggle"]')).toBeTruthy();
      expect(root.querySelector('[data-testid="sidebar-language-toggle"]')).toBeTruthy();

      unloadTestReportDashboard(root);
    });

    it("renders the same 6 sidebar footer links as index.html's sidebar, via the shared sidebar component", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      const root = await loadTestReportDashboard();
      await nextTick();

      SHARED_SIDEBAR_LINK_TESTIDS.forEach((testid) => {
        expect(root.querySelector(`[data-testid="${testid}"]`)).toBeTruthy();
      });

      unloadTestReportDashboard(root);
    });

    it("still renders the chloe-page/chloe-header/chloe-sidebar/chloe-footer chrome wrapper", async () => {
      window.localStorage.removeItem(STORAGE_KEY);
      const root = await loadTestReportDashboard();
      await nextTick();

      expect(root.querySelector(".chloe-header")).toBeTruthy();
      expect(root.querySelector(".chloe-sidebar")).toBeTruthy();
      expect(root.querySelector(".chloe-footer")).toBeTruthy();
      expect(root.querySelector(".chloe-page")).toBeTruthy();

      unloadTestReportDashboard(root);
    });
  });
})();
