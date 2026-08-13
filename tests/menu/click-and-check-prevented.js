/**
 * Issue #354 (root cause #1): shared clickAndCheckPrevented() helper for nav
 * link click tests, extracted out of tests/menu/menu-active-state.test.js
 * and tests/menu/menu-case-study-link.test.js, which each duplicated an
 * identical, unsafe copy (reuse-first).
 *
 * Dispatching a real "click" MouseEvent on an <a> triggers the browser's
 * "follow hyperlink" activation behavior whenever the event ends up not
 * canceled — even when the <a> is still detached from the document, since
 * that activation behavior is tied to the event's target/defaultPrevented
 * flag, not to document attachment. The two test files only ever wanted to
 * know whether menu.js's own click listener called preventDefault() for a
 * given link — not to actually let the browser navigate — so every
 * non-active-link assertion (`clickAndCheckPrevented(link)` expected to
 * return false) was a real, unprevented click on a real href, and the
 * browser followed it, navigating test-runner.html to case-study.html (a
 * 404) and killing the suite (see issue #354).
 *
 * Fixed by adding a second listener here, registered right before dispatch
 * (so it runs after whatever menu.js already attached at nav-build time —
 * same-target/phase listeners run in registration order) that captures
 * event.defaultPrevented — i.e. whatever menu.js's own listener decided —
 * then unconditionally calls preventDefault() itself, guaranteeing no real
 * navigation regardless of that decision. No native API is stubbed/ overridden
 * (test-pr-native-api-and-self-ref-checklist) — this is a plain listener
 * calling the standard Event.preventDefault().
 */
(function (global) {
  function clickAndCheckPrevented(link) {
    let preventedByOwnHandler;
    const guard = (event) => {
      preventedByOwnHandler = event.defaultPrevented;
      event.preventDefault();
    };
    link.addEventListener("click", guard);
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    link.removeEventListener("click", guard);
    return preventedByOwnHandler;
  }

  global.MenuTestHelpers = Object.assign({}, global.MenuTestHelpers, { clickAndCheckPrevented });
})(window);
