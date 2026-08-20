/**
 * Issue #418 (Ticket 1 of the "Contact" page story, part of #153): pages/contact.html
 * loads Bootstrap 5.3.3 + Bootstrap Icons 1.11.3 from the same CDN entries
 * index.html/album-promo.html/pages/whats-this.html already use (reuse-first,
 * no new dependency) — per docs/decisions/2026-07-27-centralized-cdn-config.md,
 * any page that loads a config/cdn-sources.json-listed library must be
 * recorded in that library's `usedIn` list, so this asserts config/cdn-sources.json
 * itself is kept in sync rather than re-deriving it from the page's own
 * <link> tags (a plain JSON-content check, same "fetch a sibling repo file
 * and assert on it" pattern as tests/whats-this/whats-this-cdn-sources.test.js
 * and tests/skills-storage-in-repo.test.js — no app/DOM behavior).
 *
 * Written before this issue's Code PR adds "pages/contact.html" to the
 * bootstrap/bootstrap-icons `usedIn` arrays, per TDD — fails until then.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;

  async function readCdnSources() {
    const response = await fetch("../config/cdn-sources.json");
    if (!response.ok) {
      throw new Error(`Expected to fetch config/cdn-sources.json, got HTTP ${response.status}`);
    }
    return response.json();
  }

  describe("config/cdn-sources.json lists pages/contact.html as a bootstrap/bootstrap-icons consumer (issue #418, Ticket 1)", () => {
    it("bootstrap's usedIn includes pages/contact.html", async () => {
      const config = await readCdnSources();
      expect(config.libraries.bootstrap.usedIn.includes("pages/contact.html")).toBeTruthy();
    });

    it("bootstrap-icons's usedIn includes pages/contact.html", async () => {
      const config = await readCdnSources();
      expect(config.libraries["bootstrap-icons"].usedIn.includes("pages/contact.html")).toBeTruthy();
    });
  });
})();
