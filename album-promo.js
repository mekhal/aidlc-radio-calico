(function () {
  "use strict";

  // Mirrors app.js's footer `linksRow` (site link, Test/Lint/Security Report,
  // GitHub, LinkedIn) — see review decision on issue #155 (2026-07-24). This
  // is now the sidebar's only link group, replacing the social icons per the
  // follow-up review comment on PR #164 (2026-07-24). Test Report links
  // straight to the report page (tests/test-runner.html) rather than reusing
  // app.js's openTestReportModal in-page modal, since that modal drives
  // app.js's own TestHarness/test fixtures — logic this static landing page
  // doesn't load and has no use for; a direct link reaches the same report
  // without duplicating it.
  const FOOTER_LINKS = [
    {
      testid: "sidebar-footer-site-link",
      href: "https://www.radio-calico.com/",
      label: "radio-calico.com",
      icon: "bi-broadcast",
    },
    {
      testid: "sidebar-footer-test-report-link",
      href: "tests/test-runner.html",
      label: "Test Report",
      icon: "bi-clipboard-check",
    },
    {
      testid: "sidebar-footer-lint-report-link",
      href: "reports/lint/megalinter-report.html",
      label: "Lint Report",
      icon: "bi-brush",
    },
    {
      testid: "sidebar-footer-security-report-link",
      href: "reports/security/trivy.sarif",
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

  // Distinct localStorage keys from app.js's "radioCalicoLanguage" (see
  // app.js:39) — this page is standalone (AC6) and must not read/write the
  // main app's stored preferences even though both share an origin.
  const LANG_STORAGE_KEY = "chloeAlbumPromoLanguage";
  const THEME_STORAGE_KEY = "chloeAlbumPromoTheme";

  // Strings live in i18n/album-promo-en.json + i18n/album-promo-th.json,
  // fetched below — kept as separate files from app.js's i18n/en.json +
  // i18n/th.json (rather than merged in) so this page's copy set stays
  // decoupled from the main app's keys, per the self-contained-page
  // constraint from the issue #155 review. Follow-up review comment on PR
  // #166 (2026-07-24) asked for the strings to live under i18n/ rather than
  // inline in this file; mirrors app.js's loadTranslations() fetch pattern.
  const ALBUM_PROMO_I18N_BASE_PATH = window.__ALBUM_PROMO_I18N_BASE_PATH__ || "i18n/";
  let TRANSLATIONS = null;

  async function loadTranslations() {
    const [enResponse, thResponse] = await Promise.all([
      fetch(`${ALBUM_PROMO_I18N_BASE_PATH}album-promo-en.json`),
      fetch(`${ALBUM_PROMO_I18N_BASE_PATH}album-promo-th.json`),
    ]);
    const [en, th] = await Promise.all([enResponse.json(), thResponse.json()]);
    return { en, th };
  }

  const NAV_KEYS = ["home", "about", "whatsThis", "contact"];
  const NAV_HREFS = { home: "#home", about: "#about", whatsThis: "#whats-this", contact: "#contact" };

  function getStoredLanguage() {
    return window.localStorage.getItem(LANG_STORAGE_KEY) === "th" ? "th" : "en";
  }

  // Dark is the default template theme (issue #155 review, 2026-07-24) —
  // only an explicit stored "light" choice opts back out.
  function getStoredTheme() {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  }

  function createIconLink({ testid, href, label, icon, external }) {
    const link = document.createElement("a");
    link.dataset.testid = testid;
    link.href = href;
    link.title = label;
    link.setAttribute("aria-label", label);
    if (external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    const iconEl = document.createElement("i");
    iconEl.className = `bi ${icon}`;
    iconEl.setAttribute("aria-hidden", "true");
    link.appendChild(iconEl);

    return link;
  }

  // Follow-up review comment on PR #166 (2026-07-24): mirror app.js's sliding
  // "pill" switch (track + thumb, flanking on/off labels, role="switch")
  // instead of the plain icon-button/select pair, oriented vertically here
  // since the sidebar is a narrow fixed column rather than app.js's
  // horizontal masthead bar (a media-query override in album-promo.css
  // flips it back to horizontal on the mobile bottom-bar layout, where
  // there's width but not height to spare). Kept as this page's own
  // createSwitch()/FLAG_ICONS copy rather than imported from app.js, per the
  // AC6 self-contained-page constraint.
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
      if (!TRANSLATIONS) return;
      const t = TRANSLATIONS[state.lang];
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
      if (!TRANSLATIONS) return;
      const t = TRANSLATIONS[state.lang];
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
    FOOTER_LINKS.forEach((entry) => footerNav.appendChild(createIconLink({ ...entry, external: true })));

    const controls = document.createElement("div");
    controls.className = "chloe-sidebar__controls";
    controls.appendChild(buildThemeToggle(state));
    controls.appendChild(buildLanguageToggle(state));
    footerNav.appendChild(controls);

    aside.appendChild(footerNav);

    return aside;
  }

  function buildHeader(state) {
    const header = document.createElement("header");
    header.className = "chloe-header";

    const wordmark = document.createElement("span");
    wordmark.className = "chloe-wordmark";

    const logo = document.createElement("img");
    logo.className = "chloe-wordmark__logo";
    logo.src = "RadioCalicoStyle/RadioCalicoLogoTM.png";
    logo.alt = "Radio Calico logo";

    wordmark.appendChild(document.createTextNode("Radio"));
    wordmark.appendChild(logo);
    wordmark.appendChild(document.createTextNode("Calico"));

    const nav = document.createElement("nav");
    nav.className = "chloe-nav";
    nav.setAttribute("aria-label", "Primary");

    const navLinks = {};
    NAV_KEYS.forEach((key) => {
      const a = document.createElement("a");
      a.href = NAV_HREFS[key];
      navLinks[key] = a;
      nav.appendChild(a);
    });

    function render() {
      if (!TRANSLATIONS) return;
      NAV_KEYS.forEach((key) => {
        navLinks[key].textContent = TRANSLATIONS[state.lang].nav[key];
      });
    }

    render();
    state.onLanguageChange.push(render);

    header.appendChild(wordmark);
    header.appendChild(nav);

    return header;
  }

  // Ticket B (issue #156): Bootstrap 5 row/col-lg-6 hero. Ticket C (issue
  // #157) appends the Music Player Card into state.heroPlayerSlot rather
  // than this function returning the node directly, so Ticket C doesn't
  // need buildMain's call chain threaded through to reach it.
  //
  // #album-cover (issue #157 review, 2026-07-24): lives on THIS portrait
  // image, not on a second `<img>` inside the Music Player Card — the Hero
  // already shows the real cover art, so Ticket D (#158) binds/updates cover
  // art here directly instead of duplicating it in the card.
  function buildHero(state) {
    const hero = document.createElement("div");
    hero.className = "row chloe-hero";

    const portraitCol = document.createElement("div");
    portraitCol.className = "col-lg-6 chloe-hero__portrait-col";

    const portrait = document.createElement("img");
    portrait.id = "album-cover";
    portrait.className = "chloe-hero__portrait";
    portrait.dataset.testid = "hero-portrait-cover";
    portrait.src = "https://d3d4yli4hf5bmh.cloudfront.net/cover.jpg";
    portrait.alt = "Artist portrait";
    portraitCol.appendChild(portrait);

    const playerCol = document.createElement("div");
    playerCol.className = "col-lg-6 chloe-hero__player-col";
    playerCol.dataset.testid = "hero-player-slot";
    state.heroPlayerSlot = playerCol;
    playerCol.appendChild(buildMusicPlayerCard(state));

    hero.appendChild(portraitCol);
    hero.appendChild(playerCol);

    return hero;
  }

  // Ticket C (issue #157) — tracking hook only, per the issue #157 review
  // (2026-07-24): no analytics service is wired up in this repo yet.
  // Whichever ticket first wires a real analytics service should dispatch
  // through this same helper when it sets live title/artist text, passing
  // the same analyticsId ("track-title"/"track-artist") used below.
  function dispatchTrackAnalyticsEvent(analyticsId, value) {
    document.dispatchEvent(new CustomEvent("album-promo:track-metadata-view", { detail: { analyticsId, value } }));
  }

  // Ticket C (issue #157): Music Player Card UI shell. DOM hooks for Ticket D
  // (#158) to bind live data, none of which this ticket re-touches:
  //   - #album-cover        → set in buildHero() above (Hero portrait image)
  //   - #track-title        → this card's title element
  //   - #track-artist       → this card's artist element
  //   - [data-analytics-id="track-title"|"track-artist"] → tracking hook
  //     (AC2); dispatch via dispatchTrackAnalyticsEvent() above, don't
  //     re-wire a new mechanism.
  // Progress bar + time readout (AC3) and playback controls (AC4/AC5) are
  // static/visual-only per #150 — no real audio.
  function buildMusicPlayerCard(state) {
    const card = document.createElement("div");
    card.className = "chloe-player-card";
    card.dataset.testid = "music-player-card";

    const title = document.createElement("p");
    title.id = "track-title";
    title.className = "chloe-player-card__title";
    title.dataset.testid = "player-track-title";
    title.dataset.analyticsId = "track-title";

    const artist = document.createElement("p");
    artist.id = "track-artist";
    artist.className = "chloe-player-card__artist";
    artist.dataset.testid = "player-track-artist";
    artist.dataset.analyticsId = "track-artist";

    function renderMeta() {
      if (!TRANSLATIONS) return;
      const loadingText = TRANSLATIONS[state.lang].playerLoading;
      title.textContent = loadingText;
      artist.textContent = loadingText;
      dispatchTrackAnalyticsEvent("track-title", loadingText);
      dispatchTrackAnalyticsEvent("track-artist", loadingText);
    }

    renderMeta();
    state.onLanguageChange.push(renderMeta);

    const progress = document.createElement("div");
    progress.className = "chloe-player-card__progress";
    progress.dataset.testid = "player-progress";

    const progressTrack = document.createElement("div");
    progressTrack.className = "chloe-player-card__progress-track";
    const progressFill = document.createElement("div");
    progressFill.className = "chloe-player-card__progress-fill";
    progressTrack.appendChild(progressFill);

    const time = document.createElement("div");
    time.className = "chloe-player-card__time";
    time.dataset.testid = "player-time";
    time.textContent = "00:00 / 00:00";

    progress.appendChild(progressTrack);
    progress.appendChild(time);

    const controlsRoot = document.createElement("div");
    controlsRoot.dataset.testid = "player-controls-root";

    card.appendChild(title);
    card.appendChild(artist);
    card.appendChild(progress);
    card.appendChild(controlsRoot);

    mountPlayerControls(controlsRoot);

    return card;
  }

  // Ticket C (issue #157 review, 2026-07-24): playback controls are a React
  // DOM island (React.createElement + hooks via CDN UMD builds, no
  // JSX/build step) — a scoped exception to the vanilla-JS/jQuery stack
  // decision (issue #20), matching the same exception already locked for
  // Ticket D's cover-art component (issue #158). isPlaying/volume are local
  // component state only — visual toggles, no real audio (per #150).
  function PlayerControls() {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [volume, setVolume] = React.useState(80);

    return React.createElement(
      "div",
      { className: "chloe-player-controls", "data-testid": "player-controls" },
      React.createElement(
        "button",
        {
          type: "button",
          className: "chloe-player-controls__play",
          "data-testid": "player-play-pause",
          "aria-pressed": isPlaying,
          "aria-label": isPlaying ? "Pause" : "Play",
          onClick: () => setIsPlaying((playing) => !playing),
        },
        React.createElement("i", {
          className: `bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"}`,
          "aria-hidden": "true",
        })
      ),
      React.createElement(
        "span",
        { className: "chloe-player-controls__timer", "data-testid": "player-timer" },
        "0:00"
      ),
      React.createElement(
        "label",
        { className: "chloe-player-controls__volume", "data-testid": "player-volume" },
        React.createElement("i", { className: "bi bi-volume-up", "aria-hidden": "true" }),
        React.createElement("input", {
          type: "range",
          min: 0,
          max: 100,
          value: volume,
          "aria-label": "Volume",
          onChange: (event) => setVolume(Number(event.target.value)),
        })
      )
    );
  }

  function mountPlayerControls(container) {
    ReactDOM.createRoot(container).render(React.createElement(PlayerControls));
  }

  function buildMain(state) {
    const main = document.createElement("main");
    main.className = "chloe-main";
    main.appendChild(buildHero(state));
    // Live data binding (Ticket D) and theme polish (Ticket E) land next.
    return main;
  }

  function buildFooter(state) {
    const footer = document.createElement("footer");
    footer.className = "chloe-footer";

    const disclaimer = document.createElement("p");
    disclaimer.className = "chloe-footer__disclaimer";

    const copy = document.createElement("p");
    copy.className = "chloe-footer__copy";

    function render() {
      if (!TRANSLATIONS) return;
      disclaimer.textContent = TRANSLATIONS[state.lang].disclaimer;
      copy.innerHTML = TRANSLATIONS[state.lang].copyright;
    }

    render();
    state.onLanguageChange.push(render);

    footer.appendChild(disclaimer);
    footer.appendChild(copy);

    return footer;
  }

  function initAlbumPromo() {
    const root = document.getElementById("album-promo-root");
    if (!root) return;

    const state = { lang: getStoredLanguage(), theme: getStoredTheme(), onLanguageChange: [] };
    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-chloe-theme", state.theme);

    root.appendChild(buildSidebar(state));

    const page = document.createElement("div");
    page.className = "chloe-page";
    page.appendChild(buildHeader(state));
    page.appendChild(buildMain(state));
    page.appendChild(buildFooter(state));
    root.appendChild(page);

    // Exposed as a named promise (mirrors app.js's window.__i18nReady) so a
    // future test suite for this page could deterministically await it
    // instead of racing an arbitrary number of ticks against the fetch.
    window.__albumPromoI18nReady = loadTranslations().then((data) => {
      TRANSLATIONS = data;
      state.onLanguageChange.forEach((fn) => fn());
    });
  }

  initAlbumPromo();
})();
