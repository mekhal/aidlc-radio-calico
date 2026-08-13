/**
 * Issue #256 (Ticket 4 of #245): sidebar component extracted out of
 * album-promo.js's buildSidebar() (previously album-promo.js:201-220),
 * along with buildThemeToggle/buildLanguageToggle (previously :134-199) and
 * their private helpers (createSwitch/setSwitchActiveSide/
 * bindSwitchActivation/FLAG_ICONS/setLangThumbFlag) — confirmed via grep
 * that none of those are used outside buildSidebar()'s call chain — plain
 * <script> tag, no ES modules
 * (docs/decisions/2026-07-12-tech-stack-vanilla-js-jquery.md); a plain
 * function declaration attaches to `window` automatically. Reads
 * createIconLink() from shared/helpers.js (issue #253) and the shared
 * ALBUM_PROMO_TRANSLATIONS cache (shared/translations.js). See
 * tests/sidebar/sidebar.test.js.
 *
 * FOOTER_LINKS renamed SIDEBAR_LINKS in this move (issue #256 AC2): it only
 * ever rendered inside buildSidebar(), never app.js's actual <footer>, so
 * the old name was misleading (see issue #256's review discussion).
 *
 * Issue #299 (AC1-AC4): the Test Report/Lint Report/Security Scan Report
 * hrefs are relative to the site root, so they 404 on pages one directory
 * below root (e.g. tests/test-report-dashboard.html). SIDEBAR_BASE_PATH
 * mirrors shared/translations.js's window.__ALBUM_PROMO_I18N_BASE_PATH__
 * override pattern, defaulting to "" (root-relative, unchanged behavior)
 * and set to "../" on pages one level below root. Only those three hrefs
 * are prefixed; the absolute Site/GitHub/LinkedIn links are untouched.
 *
 * Issue #330: wrapped in an IIFE (matching album-promo.js's pattern) so
 * SIDEBAR_LINKS/FLAG_ICONS don't live in the shared global lexical
 * environment — the test harness re-injects this file as a fresh <script>
 * tag on every test that mounts it, and a second injection of a top-level
 * `const` throws an uncaught global redeclaration SyntaxError, which
 * previously also froze SIDEBAR_BASE_PATH at whatever the first injection
 * computed. buildSidebar() and SIDEBAR_BASE_PATH are exposed on `window`
 * explicitly since they no longer auto-attach from inside a function scope.
 */
(function () {
  "use strict";

  var SIDEBAR_BASE_PATH = window.__SIDEBAR_BASE_PATH__ || "";

  const SIDEBAR_LINKS = [
    {
      testid: "sidebar-footer-site-link",
      href: "https://www.radio-calico.com/",
      label: "radio-calico.com",
      icon: "bi-broadcast",
    },
    {
      testid: "sidebar-footer-test-report-link",
      href: `${SIDEBAR_BASE_PATH}tests/test-report-dashboard.html`,
      label: "Test Report",
      icon: "bi-clipboard-check",
    },
    {
      testid: "sidebar-footer-lint-report-link",
      href: `${SIDEBAR_BASE_PATH}reports/lint/megalinter-report.html`,
      label: "Lint Report",
      icon: "bi-brush",
    },
    {
      testid: "sidebar-footer-security-report-link",
      href: `${SIDEBAR_BASE_PATH}reports/security/trivy.sarif`,
      label: "Security Scan Report",
      icon: "bi-shield-check",
    },
    {
      testid: "sidebar-footer-github-link",
      href: "https://github.com/mekhal/aidlc-radio-calico",
      label: "GitHub",
      icon: "bi-github",
    },
    {
      testid: "sidebar-footer-linkedin-link",
      href: "https://www.linkedin.com/in/mekhalomlao/",
      label: "LinkedIn",
      icon: "bi-linkedin",
    },
  ];

  // Follow-up review comment on PR #166 (2026-07-24): mirror app.js's sliding
  // "pill" switch (track + thumb, flanking on/off labels, role="switch")
  // instead of the plain icon-button/select pair, oriented vertically here
  // since the sidebar is a narrow fixed column rather than app.js's
  // horizontal masthead bar (a media-query override in sidebar.css flips it
  // back to horizontal on the mobile bottom-bar layout, where there's width
  // but not height to spare). Kept as this page's own createSwitch()/
  // FLAG_ICONS copy rather than imported from app.js, per the AC6
  // self-contained-page constraint.
  function createSwitch(testid, ariaLabel, variantClass) {
    const wrapper = document.createElement("div");
    wrapper.dataset.testid = testid;
    wrapper.className = `chloe-switch ${variantClass}`;
    wrapper.setAttribute("role", "switch");
    wrapper.setAttribute("tabindex", "0");
    wrapper.setAttribute("aria-label", ariaLabel);
    wrapper.setAttribute("aria-checked", "false");

    const offLabel = document.createElement("span");
    offLabel.className = "chloe-switch-label is-active";

    const track = document.createElement("span");
    track.className = "chloe-switch-track";
    const thumb = document.createElement("span");
    thumb.className = "chloe-switch-thumb";
    track.appendChild(thumb);

    const onLabel = document.createElement("span");
    onLabel.className = "chloe-switch-label";

    wrapper.appendChild(offLabel);
    wrapper.appendChild(track);
    wrapper.appendChild(onLabel);

    return { wrapper, offLabel, onLabel, thumb };
  }

  function setSwitchActiveSide(control, isOnActive) {
    control.offLabel.classList.toggle("is-active", !isOnActive);
    control.onLabel.classList.toggle("is-active", isOnActive);
  }

  function bindSwitchActivation(wrapper, onActivate) {
    wrapper.addEventListener("click", onActivate);
    wrapper.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        onActivate();
      }
    });
  }

  // Same flag art as app.js's FLAG_ICONS (issue #101 follow-up review):
  // inline SVG so the language switch's thumb renders identically across
  // platforms with no color-emoji font, cropped to fill the circular thumb
  // via preserveAspectRatio="xMidYMid slice".
  const FLAG_ICONS = {
    en:
      '<svg viewBox="0 0 60 36" width="16" height="16" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      '<rect width="60" height="36" fill="#012169"/>' +
      '<path d="M0,0 L60,36 M60,0 L0,36" stroke="#FFFFFF" stroke-width="6"/>' +
      '<path d="M0,0 L60,36 M60,0 L0,36" stroke="#C8102E" stroke-width="2"/>' +
      '<path d="M30,0 L30,36 M0,18 L60,18" stroke="#FFFFFF" stroke-width="10"/>' +
      '<path d="M30,0 L30,36 M0,18 L60,18" stroke="#C8102E" stroke-width="6"/>' +
      "</svg>",
    th:
      '<svg viewBox="0 0 60 36" width="16" height="16" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      '<rect width="60" height="36" fill="#A51931"/>' +
      '<rect y="6" width="60" height="24" fill="#F4F5F8"/>' +
      '<rect y="12" width="60" height="12" fill="#2D2A4A"/>' +
      "</svg>",
  };

  function setLangThumbFlag(thumb, lang) {
    thumb.innerHTML = FLAG_ICONS[lang === "th" ? "th" : "en"];
  }

  function buildThemeToggle(state) {
    const themeSwitch = createSwitch("sidebar-theme-toggle", "Toggle dark theme", "chloe-switch--theme");
    const { wrapper, offLabel, onLabel, thumb } = themeSwitch;

    function applyThemeState() {
      const isDark = state.theme === "dark";
      wrapper.setAttribute("aria-checked", String(isDark));
      setSwitchActiveSide(themeSwitch, isDark);
      thumb.textContent = isDark ? "🌙" : "☀️";
    }

    applyThemeState();

    function render() {
      if (!ALBUM_PROMO_TRANSLATIONS) return;
      const t = ALBUM_PROMO_TRANSLATIONS[state.lang];
      wrapper.setAttribute("aria-label", t.themeToggleLabel);
      offLabel.textContent = t.themeLabelLight;
      onLabel.textContent = t.themeLabelDark;
    }

    bindSwitchActivation(wrapper, () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      window.localStorage.setItem(THEME_STORAGE_KEY, state.theme);
      document.documentElement.setAttribute("data-chloe-theme", state.theme);
      applyThemeState();
    });

    render();
    state.onLanguageChange.push(render);
    return wrapper;
  }

  function buildLanguageToggle(state) {
    const langSwitch = createSwitch("sidebar-language-toggle", "Switch language", "chloe-switch--lang");
    const { wrapper, offLabel, onLabel, thumb } = langSwitch;

    function applyLangState() {
      const isTh = state.lang === "th";
      wrapper.setAttribute("aria-checked", String(isTh));
      setSwitchActiveSide(langSwitch, isTh);
      setLangThumbFlag(thumb, state.lang);
    }

    applyLangState();

    function render() {
      if (!ALBUM_PROMO_TRANSLATIONS) return;
      const t = ALBUM_PROMO_TRANSLATIONS[state.lang];
      wrapper.setAttribute("aria-label", t.languageToggleLabel);
      offLabel.textContent = t.langLabelEn;
      onLabel.textContent = t.langLabelTh;
    }

    bindSwitchActivation(wrapper, () => {
      state.lang = state.lang === "th" ? "en" : "th";
      window.localStorage.setItem(LANG_STORAGE_KEY, state.lang);
      document.documentElement.lang = state.lang;
      applyLangState();
      state.onLanguageChange.forEach((fn) => fn());
    });

    render();
    state.onLanguageChange.push(render);
    return wrapper;
  }

  function buildSidebar(state) {
    const aside = document.createElement("aside");
    aside.className = "chloe-sidebar";
    aside.setAttribute("aria-label", "Site footer links");

    const footerNav = document.createElement("nav");
    footerNav.className = "chloe-sidebar__icons";
    footerNav.setAttribute("aria-label", "Site links");
    SIDEBAR_LINKS.forEach((entry) => footerNav.appendChild(createIconLink({ ...entry, external: true })));

    const controls = document.createElement("div");
    controls.className = "chloe-sidebar__controls";
    controls.appendChild(buildThemeToggle(state));
    controls.appendChild(buildLanguageToggle(state));
    footerNav.appendChild(controls);

    aside.appendChild(footerNav);

    return aside;
  }

  window.buildSidebar = buildSidebar;
  window.SIDEBAR_BASE_PATH = SIDEBAR_BASE_PATH;
})();
