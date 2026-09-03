/**
 * Formerly the single source of truth for which tests/*.test.js files made up
 * the footer's on-demand Test Report modal (app.js, issue #41) — shared with
 * tests/test-runner.html so adding a new test file only meant editing this
 * list once instead of two hand-maintained copies (issue #54).
 *
 * Issue #585: app.js (and its in-DOM modal) was deleted as dead code — no
 * deploy page ever loaded it. The Test Report UX moved to a separate
 * dashboard page (tests/test-report-dashboard.html/.js) that drives a full
 * tests/test-runner.html run via a hidden <iframe> instead of an in-DOM
 * modal scoped to this list, so the list is now permanently empty. Left in
 * place (rather than deleted) only because tests/test-runner.html still
 * loads it generically; the forEach loop there is a no-op with nothing here.
 */
(function (global) {
  global.TEST_REPORT_SUITE_FILES = [];
})(window);
