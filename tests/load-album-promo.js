/**
 * Loads album-promo.js into a fresh #album-promo-root element so each test
 * starts from a clean mount — mirrors tests/load-app.js's loadApp(). No
 * Babel transform needed here: album-promo.js already calls
 * React.createElement directly (no JSX), so the fetched source can run as
 * plain JS. See tests/README.md.
 */
(function (global) {
  function currentFixturesContainer() {
    const containers = document.querySelectorAll('[id="fixtures"]');
    return containers.length ? containers[containers.length - 1] : document.body;
  }

  async function loadAlbumPromo() {
    const fixtures = currentFixturesContainer();
    const previousRoot = fixtures.querySelector("#album-promo-root");
    if (previousRoot) previousRoot.parentNode.removeChild(previousRoot);

    const root = document.createElement("div");
    root.id = "album-promo-root";
    fixtures.appendChild(root);

    const response = await fetch(global.__ALBUM_PROMO_JS_PATH__ || "../album-promo.js");
    const source = await response.text();

    const script = document.createElement("script");
    script.textContent = source;
    document.body.appendChild(script);
    document.body.removeChild(script);

    if (global.__albumPromoI18nReady) await global.__albumPromoI18nReady;

    return root;
  }

  function unloadAlbumPromo(root) {
    if (root && root.parentNode) root.parentNode.removeChild(root);
  }

  global.AlbumPromoTestHelpers = { loadAlbumPromo, unloadAlbumPromo };
})(window);
