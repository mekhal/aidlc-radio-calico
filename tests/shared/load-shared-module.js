/**
 * Fetches and injects a single shared/*.js file as a plain <script> tag, so
 * each tests/shared/*.test.js can load one module in isolation instead of
 * indirectly through album-promo.js — mirrors tests/load-album-promo.js's
 * own fetch+inject pattern. See tests/README.md.
 */
(function (global) {
  async function loadSharedModule(path) {
    const response = await fetch(path);
    const source = await response.text();

    const script = document.createElement("script");
    script.textContent = source;
    document.body.appendChild(script);
    document.body.removeChild(script);
  }

  global.SharedModuleTestHelpers = { loadSharedModule };
})(window);
