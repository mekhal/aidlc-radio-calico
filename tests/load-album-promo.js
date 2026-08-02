/**
 * Loads album-promo.js into a fresh #album-promo-root element so each test
 * starts from a clean mount — mirrors tests/load-app.js's loadApp(). No
 * Babel transform needed here: album-promo.js already calls
 * React.createElement directly (no JSX), so the fetched source can run as
 * plain JS. See tests/README.md.
 *
 * Issue #253 (Ticket 1): shared/state.js, shared/translations.js, and
 * shared/helpers.js are fetched and injected ahead of album-promo.js, in
 * dependency order, mirroring album-promo.js's own fetch+inject below (AC3)
 * — each has a path-override hook, same convention as
 * window.__ALBUM_PROMO_JS_PATH__. Injecting them here even before Ticket 1's
 * shared/ files exist is harmless: a 404 response's .text() resolves to an
 * empty string, so the injected <script> is a no-op and album-promo.js (which
 * still defines these itself until Ticket 1's Code PR lands) is unaffected.
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

  async function loadAlbumPromo() {
    const fixtures = currentFixturesContainer();
    const previousRoot = fixtures.querySelector("#album-promo-root");
    if (previousRoot) previousRoot.parentNode.removeChild(previousRoot);

    const root = document.createElement("div");
    root.id = "album-promo-root";
    fixtures.appendChild(root);

    await loadScript(global.__ALBUM_PROMO_SHARED_STATE_JS_PATH__ || "../shared/state.js");
    await loadScript(global.__ALBUM_PROMO_SHARED_TRANSLATIONS_JS_PATH__ || "../shared/translations.js");
    await loadScript(global.__ALBUM_PROMO_SHARED_HELPERS_JS_PATH__ || "../shared/helpers.js");
    await loadScript(global.__ALBUM_PROMO_JS_PATH__ || "../album-promo.js");

    if (global.__albumPromoI18nReady) await global.__albumPromoI18nReady;

    return root;
  }

  function unloadAlbumPromo(root) {
    // Ticket D (issue #158): stop the Now Playing poll loop before tearing
    // down, so a leftover setInterval doesn't keep firing (against whatever
    // fetch happens to be installed — real network once the test's mock is
    // restored) after this test has finished.
    if (global.__albumPromoStopNowPlaying) global.__albumPromoStopNowPlaying();
    // Issue #220 (Option B): pause playback and destroy the Hls instance
    // before tearing down, so a leftover instance doesn't survive across
    // tests. Guarded like the hook above — a no-op until album-promo.js
    // defines it (this test helper is written before that code exists, per
    // TDD).
    if (global.__albumPromoStopPlayback) global.__albumPromoStopPlayback();
    if (root && root.parentNode) root.parentNode.removeChild(root);
  }

  global.AlbumPromoTestHelpers = { loadAlbumPromo, unloadAlbumPromo };
})(window);
