/**
 * Issue #579 (AC1, AC2, AC3): confirmed-DELETE cleanup from the #573 audit —
 * root trivy.yml, images/ai-autonomy-goal.jfif,
 * images/knowledge_growth_over_time.png, and album-promo.html are
 * unreferenced and get removed; config/cdn-sources.json's five usedIn
 * arrays (bootstrap, bootstrap-icons, react, react-dom, hls.js) drop the
 * "album-promo.html" entry accordingly, with every other entry untouched.
 * Doc/asset-only change with no app/DOM behavior, so this fetches sibling
 * repo files directly — same pattern as tests/skills-storage-in-repo.test.js
 * — rather than exercising app.js. Needs tests/test-runner.html served over
 * http(s) (file:// blocks these fetches via CORS).
 *
 * RED against the current repo (all 4 files still exist, cdn-sources.json
 * still lists album-promo.html in all 5 usedIn arrays); the issue #579 Code
 * PR deletes the files and edits cdn-sources.json to make AC1/AC2 pass.
 * AC3's assertions already pass today and stay passing — a regression guard
 * confirming album-promo.js/.css (distinct files, not in the DELETE list)
 * stay wired into index.html.
 */
(function () {
  const { describe, it, expect } = window.TestHarness;

  async function fileExists(relativePath) {
    const response = await fetch(relativePath);
    return response.ok;
  }

  async function readRepoFile(relativePath) {
    const response = await fetch(relativePath);
    if (!response.ok) {
      throw new Error(`Expected to fetch ${relativePath}, got HTTP ${response.status}`);
    }
    return response.text();
  }

  async function readCdnSources() {
    return JSON.parse(await readRepoFile("../config/cdn-sources.json"));
  }

  describe("Confirmed-DELETE cleanup from the #573 audit (issue #579, AC1)", () => {
    it("root trivy.yml no longer exists", async () => {
      expect(await fileExists("../trivy.yml")).toBeFalsy();
    });

    it("images/ai-autonomy-goal.jfif no longer exists", async () => {
      expect(await fileExists("../images/ai-autonomy-goal.jfif")).toBeFalsy();
    });

    it("images/knowledge_growth_over_time.png no longer exists", async () => {
      expect(await fileExists("../images/knowledge_growth_over_time.png")).toBeFalsy();
    });

    it("album-promo.html no longer exists", async () => {
      expect(await fileExists("../album-promo.html")).toBeFalsy();
    });
  });

  describe("config/cdn-sources.json drops album-promo.html from usedIn, other entries untouched (issue #579, AC2)", () => {
    it("bootstrap's usedIn no longer lists album-promo.html", async () => {
      const config = await readCdnSources();
      expect(config.libraries.bootstrap.usedIn).toEqual([
        "index.html",
        "pages/whats-this.html",
        "pages/contact.html",
        "reports/security/security-report.html",
      ]);
    });

    it("bootstrap-icons's usedIn no longer lists album-promo.html", async () => {
      const config = await readCdnSources();
      expect(config.libraries["bootstrap-icons"].usedIn).toEqual([
        "index.html",
        "pages/whats-this.html",
        "pages/contact.html",
        "reports/security/security-report.html",
      ]);
    });

    it("react's usedIn no longer lists album-promo.html", async () => {
      const config = await readCdnSources();
      expect(config.libraries.react.usedIn).toEqual([
        "index.html",
        "tests/test-runner.html",
        "app.js (TEST_REPORT_CDN_DEPS)",
      ]);
    });

    it("react-dom's usedIn no longer lists album-promo.html", async () => {
      const config = await readCdnSources();
      expect(config.libraries["react-dom"].usedIn).toEqual([
        "index.html",
        "tests/test-runner.html",
        "app.js (TEST_REPORT_CDN_DEPS)",
      ]);
    });

    it("hls.js's usedIn no longer lists album-promo.html", async () => {
      const config = await readCdnSources();
      expect(config.libraries["hls.js"].usedIn).toEqual(["index.html"]);
    });

    it("babel-standalone's usedIn is untouched (it never listed album-promo.html)", async () => {
      const config = await readCdnSources();
      expect(config.libraries["babel-standalone"].usedIn).toEqual([
        "tests/test-runner.html",
        "app.js (TEST_REPORT_CDN_DEPS)",
      ]);
    });
  });

  describe("album-promo.js/.css stay wired into index.html (issue #579, AC3)", () => {
    it("index.html still loads album-promo.css", async () => {
      const html = await readRepoFile("../index.html");
      expect(html.includes("album-promo.css")).toBeTruthy();
    });

    it("index.html still loads album-promo.js", async () => {
      const html = await readRepoFile("../index.html");
      expect(html.includes("album-promo.js")).toBeTruthy();
    });
  });
})();
