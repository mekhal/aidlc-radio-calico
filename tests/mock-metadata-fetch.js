/**
 * Minimal stand-in for window.fetch scoped to Ticket D's (issue #158) two
 * live endpoints — metadatav2.json and cover.jpg — so tests don't depend on
 * the real network or CloudFront. Mirrors tests/mock-hls.js's install*()
 * pattern (a plain factory that swaps a global, returns a handle for
 * assertions). Any URL that isn't metadatav2.json/cover.jpg (e.g. this
 * page's own i18n/*.json fetches) passes through to the real fetch
 * untouched. See tests/README.md.
 *
 * `coverResponses` (issue #158 follow-up: fetchCoverFingerprint coverage) is
 * an optional queue of Blob bodies (strings) for the cover.jpg response, so a
 * test can control whether consecutive polls return identical or different
 * bytes — that's what drives fetchCoverFingerprint's SHA-256 digest, and in
 * turn whether refreshNowPlaying() repaints #album-cover. Defaults to the
 * same empty-Blob body every call, matching the previous behavior.
 */
(function (global) {
  function installMockMetadataFetch(options) {
    const opts = options || {};
    const metadataQueue = (
      opts.metadataResponses || (opts.metadataResponse ? [opts.metadataResponse] : [])
    ).slice();
    const coverQueue = (
      opts.coverResponses || (opts.coverResponse !== undefined ? [opts.coverResponse] : [])
    ).slice();
    const originalFetch = global.fetch.bind(global);

    const state = {
      metadataCalls: 0,
      coverCalls: 0,
      metadataShouldFail: !!opts.metadataShouldFail,
      coverShouldFail: !!opts.coverShouldFail,
    };

    function nextMetadataResponse() {
      if (!metadataQueue.length) return opts.metadataResponse || {};
      return metadataQueue.length > 1 ? metadataQueue.shift() : metadataQueue[0];
    }

    function nextCoverResponse() {
      if (!coverQueue.length) return opts.coverResponse !== undefined ? opts.coverResponse : "";
      return coverQueue.length > 1 ? coverQueue.shift() : coverQueue[0];
    }

    global.fetch = function (url, init) {
      const href = String(url);

      if (href.includes("metadatav2.json")) {
        state.metadataCalls += 1;
        if (state.metadataShouldFail) {
          return Promise.reject(new Error("mock metadata fetch failure"));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(nextMetadataResponse()),
        });
      }

      if (href.includes("cover.jpg")) {
        state.coverCalls += 1;
        if (state.coverShouldFail) {
          return Promise.reject(new Error("mock cover fetch failure"));
        }
        return Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob([nextCoverResponse()])) });
      }

      return originalFetch(url, init);
    };

    state.restore = function () {
      global.fetch = originalFetch;
    };

    return state;
  }

  global.installMockMetadataFetch = installMockMetadataFetch;
})(window);
