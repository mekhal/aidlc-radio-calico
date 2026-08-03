(function () {
  "use strict";

  // Mirrors app.js's footer `linksRow` (site link, Test/Lint/Security Report,
  // GitHub, LinkedIn) — see review decision on issue #155 (2026-07-24). This
  // is now the sidebar's only link group, replacing the social icons per the
  // follow-up review comment on PR #164 (2026-07-24). Test Report links to
  // the Test Report Dashboard (tests/test-report-dashboard.html, issue #205
  // AC5) rather than tests/test-runner.html directly, or app.js's
  // openTestReportModal in-page modal — that modal drives app.js's own
  // TestHarness/test fixtures, logic this static landing page doesn't load
  // and has no use for.
  const FOOTER_LINKS = [
    {
      testid: "sidebar-footer-site-link",
      href: "https://www.radio-calico.com/",
      label: "radio-calico.com",
      icon: "bi-broadcast",
    },
    {
      testid: "sidebar-footer-test-report-link",
      href: "tests/test-report-dashboard.html",
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

  let TRANSLATIONS = null;

  const NAV_KEYS = ["home", "about", "whatsThis", "contact"];
  const NAV_HREFS = { home: "#home", about: "#about", whatsThis: "#whats-this", contact: "#contact" };

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

    const wordmark = buildLogo();

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
    portrait.src = NOW_PLAYING_COVER_URL;
    portrait.decoding = "async";
    portrait.alt = "Artist portrait";
    portraitCol.appendChild(portrait);
    state.nowPlaying.coverEl = portrait;

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

  function bindRatingToggle(upBtn, downBtn) {
    function setActive(btn, isActive) {
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    }
    function activate(target, other) {
      const willActivate = !target.classList.contains("is-active");
      setActive(target, willActivate);
      if (willActivate) setActive(other, false);
    }
    upBtn.addEventListener("click", () => activate(upBtn, downBtn));
    downBtn.addEventListener("click", () => activate(downBtn, upBtn));
  }

  // Ticket C (issue #157): Now Playing panel UI shell — no card wrapper
  // (2026-07-27 review: the RadioCalicoLayout.png reference floats this
  // content directly on the page background; only the playback strip below
  // is a themed surface). DOM hooks for downstream tickets to bind, none of
  // which this ticket re-touches:
  //   - #album-cover        → set in buildHero() above (Hero portrait image)
  //   - #track-title        → track title text
  //   - #track-year         → release year, bound to metadatav2.json's `date`
  //     field (issue #221 — confirmed via live sample there's no `year` key)
  //   - #track-artist       → artist name
  //   - #track-album        → album name, bound to metadatav2.json's `album`
  //     field (issue #221)
  //   - #track-quality-source → source quality metadata line, derived from
  //     metadatav2.json's `bit_depth`/`sample_rate` (issue #221). A
  //     #track-quality-stream line was dropped (issue #225 review) — deriving
  //     real per-stream quality would need extra requests beyond this
  //     ticket's scope, and a hardcoded placeholder value wasn't wanted.
  //   - [data-analytics-id="track-title"|"track-artist"] → tracking hook
  //     (AC2); dispatch via dispatchTrackAnalyticsEvent() above, don't
  //     re-wire a new mechanism.
  //   - [data-testid="player-rating-up"|"player-rating-down"] → rating
  //     buttons; this ticket only wires a local visual toggle (no
  //     persistence/counting) — see the 2026-07-27 review comment on #157
  //     for the follow-up ticket that owns the real vote-recording logic.
  // Progress bar + time readout (AC3) and playback controls (AC4/AC5) stay
  // static/visual-only per #150 — no real audio.
  function buildMusicPlayerCard(state) {
    const panel = document.createElement("div");
    panel.className = "chloe-now-playing";
    panel.dataset.testid = "now-playing-panel";

    const artist = document.createElement("p");
    artist.id = "track-artist";
    artist.className = "chloe-now-playing__artist";
    artist.dataset.testid = "player-track-artist";
    artist.dataset.analyticsId = "track-artist";

    const titleLine = document.createElement("p");
    titleLine.className = "chloe-now-playing__title-line";
    titleLine.dataset.testid = "player-title-line";

    const title = document.createElement("span");
    title.id = "track-title";
    title.className = "chloe-now-playing__title";
    title.dataset.testid = "player-track-title";
    title.dataset.analyticsId = "track-title";

    const year = document.createElement("span");
    year.id = "track-year";
    year.className = "chloe-now-playing__year";
    year.dataset.testid = "player-track-year";
    year.textContent = "(—)";

    titleLine.appendChild(title);
    titleLine.appendChild(document.createTextNode(" "));
    titleLine.appendChild(year);

    const album = document.createElement("p");
    album.id = "track-album";
    album.className = "chloe-now-playing__album";
    album.dataset.testid = "player-track-album";

    const quality = document.createElement("div");
    quality.className = "chloe-now-playing__quality";
    quality.dataset.testid = "player-quality";

    const qualitySource = document.createElement("p");
    qualitySource.id = "track-quality-source";
    qualitySource.className = "chloe-now-playing__quality-line";
    qualitySource.dataset.testid = "player-quality-source";

    quality.appendChild(qualitySource);

    const rating = document.createElement("div");
    rating.className = "chloe-now-playing__rating";
    rating.dataset.testid = "player-rating";

    const ratingLabel = document.createElement("span");
    ratingLabel.className = "chloe-now-playing__rating-label";
    ratingLabel.dataset.testid = "player-rating-label";

    const ratingUp = document.createElement("button");
    ratingUp.type = "button";
    ratingUp.className = "chloe-now-playing__rating-btn";
    ratingUp.dataset.testid = "player-rating-up";
    ratingUp.setAttribute("aria-pressed", "false");
    ratingUp.textContent = "👍";

    const ratingDown = document.createElement("button");
    ratingDown.type = "button";
    ratingDown.className = "chloe-now-playing__rating-btn";
    ratingDown.dataset.testid = "player-rating-down";
    ratingDown.setAttribute("aria-pressed", "false");
    ratingDown.textContent = "👎";

    bindRatingToggle(ratingUp, ratingDown);

    // Issue #209: Recently Played moved from an inline section into a Modal
    // — this button (flush-right via CSS margin-left: auto, per the
    // 2026-08-01 review thread) opens it. Kept in the same row as the
    // rating controls, above the audio-control row below.
    const recentlyPlayedTrigger = document.createElement("button");
    recentlyPlayedTrigger.type = "button";
    recentlyPlayedTrigger.className = "chloe-now-playing__recently-played-trigger";
    recentlyPlayedTrigger.dataset.testid = "recently-played-trigger";
    recentlyPlayedTrigger.setAttribute("aria-haspopup", "dialog");
    recentlyPlayedTrigger.addEventListener("click", () => {
      openRecentlyPlayedModal(state, recentlyPlayedTrigger);
    });

    rating.appendChild(ratingLabel);
    rating.appendChild(ratingUp);
    rating.appendChild(ratingDown);
    rating.appendChild(recentlyPlayedTrigger);

    // Ticket D (issue #158): title/artist reflect state.nowPlaying.lastMetadata
    // once a live fetch has landed, instead of the static loading placeholder
    // used before the first fetch — this stops a language toggle re-render
    // from stomping real Now Playing data back to "Loading…". Issue #221
    // extends the same lastMetadata-guard pattern to year/album/quality-source
    // once their real metadatav2.json field names were confirmed.
    const status = document.createElement("p");
    status.id = "now-playing-status";
    status.className = "chloe-now-playing__status";
    status.dataset.testid = "now-playing-status";
    status.hidden = true;

    function renderMeta() {
      if (!TRANSLATIONS) return;
      const t = TRANSLATIONS[state.lang];
      const md = state.nowPlaying.lastMetadata;
      title.textContent = md ? md.title || "" : t.playerLoading;
      artist.textContent = md ? md.artist || "" : t.playerLoading;
      year.textContent = md ? md.date || "" : "(—)";
      album.textContent = md ? md.album || "" : t.playerLoading;
      qualitySource.textContent = `${t.playerQualitySourceLabel}: ${
        md ? formatSourceQuality(md.bit_depth, md.sample_rate) : t.playerLoading
      }`;
      ratingLabel.textContent = t.playerRatingLabel;
      ratingUp.setAttribute("aria-label", t.playerRatingUpLabel);
      ratingDown.setAttribute("aria-label", t.playerRatingDownLabel);
      recentlyPlayedTrigger.textContent = `🗔 ${t.recentlyPlayedHeading}`;
      recentlyPlayedTrigger.setAttribute("aria-label", t.recentlyPlayedTriggerLabel);
      dispatchTrackAnalyticsEvent("track-title", title.textContent);
      dispatchTrackAnalyticsEvent("track-artist", artist.textContent);
    }

    renderMeta();
    state.onLanguageChange.push(renderMeta);

    const playerBox = document.createElement("div");
    playerBox.className = "chloe-now-playing__player-box";
    playerBox.dataset.testid = "player-box";

    const progressTrack = document.createElement("div");
    progressTrack.className = "chloe-now-playing__progress-track";
    progressTrack.dataset.testid = "player-progress";
    const progressFill = document.createElement("div");
    progressFill.className = "chloe-now-playing__progress-fill";
    progressTrack.appendChild(progressFill);

    const controlsRoot = document.createElement("div");
    controlsRoot.dataset.testid = "player-controls-root";

    playerBox.appendChild(progressTrack);
    playerBox.appendChild(controlsRoot);

    panel.appendChild(artist);
    panel.appendChild(titleLine);
    panel.appendChild(album);
    panel.appendChild(quality);
    panel.appendChild(rating);
    panel.appendChild(status);
    panel.appendChild(playerBox);

    mountPlayerControls(controlsRoot);

    state.nowPlaying.artistEl = artist;
    state.nowPlaying.titleEl = title;
    state.nowPlaying.yearEl = year;
    state.nowPlaying.albumEl = album;
    state.nowPlaying.qualitySourceEl = qualitySource;
    state.nowPlaying.statusEl = status;

    return panel;
  }

  // Ticket C (issue #157 review, 2026-07-24): playback controls are a React
  // DOM island (React.createElement + hooks via CDN UMD builds, no
  // JSX/build step) — a scoped exception to the vanilla-JS/jQuery stack
  // decision (issue #20), matching the same exception already locked for
  // Ticket D's cover-art component (issue #158). The timer (2026-07-27
  // review) doubles as AC3's time readout, formatted `<mm:ss> / ● Live`
  // since this is a live stream, not a fixed-length file.
  //
  // Issue #220 (Option B, confirmed 2026-07-30): real playback is wired up
  // here as a self-contained <audio>/hls.js path (not imported from
  // app.js), matching this page's existing standalone-page precedent
  // (AC6, #158). Mirrors app.js's own Hls setup (STREAM_URL, Hls.js primary
  // with Safari's native HLS support as fallback) rather than introducing a
  // second pattern.
  const STREAM_URL = "https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8";

  // Issue #228: elapsed-time counter tick cadence, overridable for tests —
  // mirrors the window.__ALBUM_PROMO_METADATA_POLL_MS__ convention used by
  // the Now Playing poll loop above.
  const PLAYER_TIMER_DEFAULT_TICK_MS = 1000;

  function getPlayerTimerTickMs() {
    return window.__ALBUM_PROMO_TIMER_TICK_MS__ || PLAYER_TIMER_DEFAULT_TICK_MS;
  }

  function formatElapsed(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  function PlayerControls() {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [volume, setVolume] = React.useState(80);
    const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
    const audioRef = React.useRef(null);
    const hlsRef = React.useRef(null);
    const timerIntervalRef = React.useRef(null);

    function stopTimer() {
      if (timerIntervalRef.current !== null) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    // Cumulative, not per-play: the counter is only ever reset by mounting
    // a fresh component (elapsedSeconds's initial useState(0)) — pause just
    // stops the tick and resume continues it from wherever it left off.
    function startTimer() {
      stopTimer();
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((seconds) => seconds + 1);
      }, getPlayerTimerTickMs());
    }

    React.useEffect(() => {
      const audio = audioRef.current;

      function stopPlayback() {
        stopTimer();
        audio.pause();
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls();
        hls.loadSource(STREAM_URL);
        hls.attachMedia(audio);
        hlsRef.current = hls;
      } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
        audio.src = STREAM_URL;
      }

      // Autoplay on mount, per the 2026-07-31 step-3 scope revision. A
      // rejected play() (browser autoplay policy) is caught so it falls
      // back to the normal paused UI instead of an unhandled rejection or
      // a stuck/broken state.
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          startTimer();
        })
        .catch(() => {});

      // tests/load-album-promo.js's unloadAlbumPromo() calls this before
      // removing the mounted root, mirroring window.__albumPromoStopNowPlaying
      // above, so no Hls instance survives across page loads/tests (AC6).
      window.__albumPromoStopPlayback = stopPlayback;

      return stopPlayback;
    }, []);

    React.useEffect(() => {
      if (audioRef.current) audioRef.current.volume = volume / 100;
    }, [volume]);

    function togglePlayback() {
      const audio = audioRef.current;
      if (isPlaying) {
        stopTimer();
        audio.pause();
      } else {
        audio.play();
        startTimer();
      }
      setIsPlaying((playing) => !playing);
    }

    return React.createElement(
      "div",
      { className: "chloe-player-controls", "data-testid": "player-controls" },
      React.createElement("audio", { ref: audioRef }),
      React.createElement(
        "button",
        {
          type: "button",
          className: "chloe-player-controls__play",
          "data-testid": "player-play-pause",
          "aria-pressed": isPlaying,
          "aria-label": isPlaying ? "Pause" : "Play",
          onClick: togglePlayback,
        },
        React.createElement("i", {
          className: `bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"}`,
          "aria-hidden": "true",
        })
      ),
      React.createElement(
        "span",
        {
          className: "chloe-player-controls__timer",
          "data-testid": "player-timer",
          "aria-label": "Elapsed time, live broadcast",
        },
        `${formatElapsed(elapsedSeconds)} / `,
        React.createElement("span", { className: "chloe-player-controls__live-dot", "aria-hidden": "true" }),
        "Live"
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

  // Ticket D (issue #158): Now Playing data fetch + Recently Played +
  // near-real-time polling. AC1/AC2 fetch metadatav2.json/cover.jpg and bind
  // them into the DOM hooks above; AC3 renders the 5-item Recently Played
  // list; AC4 falls back gracefully (placeholder cover + status message) on
  // fetch failure. Per the 2026-07-28 step-3 approval, cover art and all
  // other metadata refresh together on ONE shared poll loop (not two
  // independent cadences) — interval overridable via
  // window.__ALBUM_PROMO_METADATA_POLL_MS__ so tests don't wait a real 10s
  // (docs/decisions/2026-07-24-ticket-d-cover-art-react-dom-stack-and-polling-interval.md).
  // AC5: kept as small functions, each testable via the DOM behavior they
  // produce — matching every other suite in this repo (see tests/README.md);
  // nothing here is exposed on window purely for unit testing.
  const NOW_PLAYING_METADATA_URL = "https://d3d4yli4hf5bmh.cloudfront.net/metadatav2.json";
  const NOW_PLAYING_COVER_URL = "https://d3d4yli4hf5bmh.cloudfront.net/cover.jpg";
  // Reuse-first (AC4/AC5): same logo asset app.js/album-promo.js already use
  // elsewhere, rather than a new placeholder-cover asset.
  const NOW_PLAYING_COVER_FALLBACK_SRC = "RadioCalicoStyle/RadioCalicoLogoTM.png";
  const NOW_PLAYING_RECENT_COUNT = 5;
  const NOW_PLAYING_DEFAULT_POLL_MS = 10000;

  let nowPlayingIntervalId = null;

  function getNowPlayingPollMs() {
    return window.__ALBUM_PROMO_METADATA_POLL_MS__ || NOW_PLAYING_DEFAULT_POLL_MS;
  }

  async function fetchNowPlayingMetadata() {
    const response = await fetch(NOW_PLAYING_METADATA_URL);
    if (!response || !response.ok) throw new Error("Now Playing metadata fetch failed");
    return response.json();
  }

  function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  // Fetches cover.jpg and returns a SHA-256 hex digest of its bytes, so
  // refreshNowPlaying() can skip repainting #album-cover when the poll
  // fetches back the same image it already has (see the 2026-07-29 flicker
  // report on issue #158: cache-busting the src on every 10s tick caused a
  // repaint even when the cover art hadn't actually changed).
  async function fetchCoverFingerprint() {
    const response = await fetch(NOW_PLAYING_COVER_URL);
    if (!response || !response.ok) throw new Error("Now Playing cover fetch failed");
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    return bufferToHex(await crypto.subtle.digest("SHA-256", buffer));
  }

  function parseRecentlyPlayed(metadata) {
    const tracks = [];
    for (let n = 1; n <= NOW_PLAYING_RECENT_COUNT; n += 1) {
      tracks.push({
        artist: (metadata && metadata[`prev_artist_${n}`]) || "",
        title: (metadata && metadata[`prev_title_${n}`]) || "",
      });
    }
    return tracks;
  }

  // Issue #221: derives the #track-quality-source line from metadatav2.json's
  // bit_depth/sample_rate pair. A #track-quality-stream line was dropped
  // (issue #225 review) rather than hardcoded — see buildMusicPlayerCard's
  // DOM-hooks comment above.
  function formatSourceQuality(bitDepth, sampleRate) {
    if (!bitDepth || !sampleRate) return "";
    const khz = sampleRate / 1000;
    const khzText = Number.isInteger(khz) ? String(khz) : khz.toFixed(1);
    return `${bitDepth}-bit / ${khzText}kHz`;
  }

  function renderNowPlayingMetadata(elements, metadata, t) {
    elements.artistEl.textContent = metadata.artist || "";
    elements.titleEl.textContent = metadata.title || "";
    elements.yearEl.textContent = metadata.date || "";
    elements.albumEl.textContent = metadata.album || "";
    elements.qualitySourceEl.textContent = `${t.playerQualitySourceLabel}: ${formatSourceQuality(
      metadata.bit_depth,
      metadata.sample_rate
    )}`;
  }

  // Rebuilds the list from scratch on every successful fetch rather than
  // patching existing <li> nodes, so the item count and each item's text
  // always land in the DOM together — the AC3 tests assert both right after
  // the same waitFor, with no separate wait for content to fill in.
  function renderRecentlyPlayed(listEl, tracks) {
    listEl.textContent = "";
    tracks.forEach((track) => {
      const item = document.createElement("li");
      item.className = "chloe-recently-played__item";
      item.dataset.testid = "recently-played-item";

      const artistEl = document.createElement("span");
      artistEl.className = "chloe-recently-played__artist";
      artistEl.dataset.testid = "recently-played-artist";
      artistEl.textContent = track.artist;

      const titleEl = document.createElement("span");
      titleEl.className = "chloe-recently-played__title";
      titleEl.dataset.testid = "recently-played-title";
      titleEl.textContent = track.title;

      item.appendChild(artistEl);
      item.appendChild(titleEl);
      listEl.appendChild(item);
    });
  }

  function showNowPlayingStatus(elements, message) {
    elements.statusEl.textContent = message;
    elements.statusEl.hidden = false;
  }

  function hideNowPlayingStatus(elements) {
    elements.statusEl.hidden = true;
    elements.statusEl.textContent = "";
  }

  function setCoverSrc(coverEl, src) {
    coverEl.src = src;
  }

  async function refreshNowPlaying(state) {
    const elements = state.nowPlaying;
    const t = TRANSLATIONS[state.lang];

    try {
      const metadata = await fetchNowPlayingMetadata();
      state.nowPlaying.lastMetadata = metadata;
      renderNowPlayingMetadata(elements, metadata, t);
      renderRecentlyPlayed(elements.recentlyPlayedListEl, parseRecentlyPlayed(metadata));
      hideNowPlayingStatus(elements);
    } catch (err) {
      showNowPlayingStatus(elements, t.nowPlayingUnavailable);
    }

    try {
      const fingerprint = await fetchCoverFingerprint();
      if (fingerprint !== state.nowPlaying.lastCoverFingerprint) {
        state.nowPlaying.lastCoverFingerprint = fingerprint;
        // Cache-bust only on a real change, so the browser doesn't reuse a
        // stale cached response once the cover art does change, but also
        // doesn't repaint (flicker) the <img> on every tick when it hasn't.
        setCoverSrc(elements.coverEl, `${NOW_PLAYING_COVER_URL}?t=${Date.now()}`);
      }
    } catch (err) {
      setCoverSrc(elements.coverEl, NOW_PLAYING_COVER_FALLBACK_SRC);
    }
  }

  function stopNowPlayingUpdates() {
    if (nowPlayingIntervalId !== null) {
      clearInterval(nowPlayingIntervalId);
      nowPlayingIntervalId = null;
    }
  }

  function startNowPlayingUpdates(state) {
    stopNowPlayingUpdates();
    refreshNowPlaying(state);
    nowPlayingIntervalId = setInterval(() => refreshNowPlaying(state), getNowPlayingPollMs());
  }

  // tests/load-album-promo.js's unloadAlbumPromo() calls this before removing
  // the mounted root, so a leftover interval from one test doesn't keep
  // polling (against the real network, once the next test's mock is
  // installed/removed) after that test has finished.
  window.__albumPromoStopNowPlaying = stopNowPlayingUpdates;

  // Issue #209: the inline Recently Played section (formerly built here) was
  // deleted per the human's step-3 review decision ("ลบ code เดิมออกเลย") —
  // renderRecentlyPlayed()/parseRecentlyPlayed()/refreshNowPlaying() are
  // unchanged and keep polling every 10s (AC4), now targeting this list
  // element. It's kept detached from the page until openRecentlyPlayedModal()
  // below appends it into the modal, and stays the SAME node across
  // open/close cycles so its content (and live updates) survive a close.
  function createRecentlyPlayedListElement(state) {
    const list = document.createElement("ol");
    list.className = "chloe-recently-played-modal__list";
    list.dataset.testid = "recently-played-list";
    state.nowPlaying.recentlyPlayedListEl = list;
  }

  // Modeled on app.js's openTestReportModal() (issue #41) per the 2026-08-01
  // review's reuse-first decision: backdrop + centered role="dialog" panel,
  // Escape/backdrop-click/close-button all close it, focus returns to the
  // trigger, and the modal/backdrop nodes are fully removed from the DOM on
  // close (AC2). Colors come from the page's existing --chloe-* custom
  // properties (album-promo.css) rather than a hardcoded palette, so the
  // modal tracks the light/dark toggle automatically (AC5).
  function openRecentlyPlayedModal(state, trigger) {
    const t = TRANSLATIONS[state.lang];
    let closed = false;

    const backdrop = document.createElement("div");
    backdrop.className = "chloe-recently-played-modal-backdrop";
    backdrop.dataset.testid = "recently-played-modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "chloe-recently-played-modal";
    modal.dataset.testid = "recently-played-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", t.recentlyPlayedHeading);
    modal.tabIndex = -1;

    const header = document.createElement("div");
    header.className = "chloe-recently-played-modal__header";

    const title = document.createElement("h2");
    title.className = "chloe-recently-played-modal__title";
    title.textContent = t.recentlyPlayedHeading;

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "chloe-recently-played-modal__close";
    closeButton.dataset.testid = "recently-played-modal-close";
    closeButton.setAttribute("aria-label", t.recentlyPlayedModalCloseLabel);
    closeButton.textContent = "✕";

    header.appendChild(title);
    header.appendChild(closeButton);

    modal.appendChild(header);
    // Reuses the SAME live list node the 10s poll already targets (AC4) —
    // moving it here (rather than cloning) means the modal shows whatever
    // it already holds and keeps receiving refreshNowPlaying()'s updates
    // while open, with no second fetch path.
    modal.appendChild(state.nowPlaying.recentlyPlayedListEl);

    function closeModal() {
      if (closed) return;
      closed = true;
      document.removeEventListener("keydown", onKeyDown);
      if (modal.parentNode) modal.parentNode.removeChild(modal);
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
      if (trigger && typeof trigger.focus === "function") trigger.focus();
    }

    function onKeyDown(event) {
      if (event.key === "Escape") closeModal();
    }

    backdrop.addEventListener("click", closeModal);
    closeButton.addEventListener("click", closeModal);
    document.addEventListener("keydown", onKeyDown);

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    modal.focus();
  }

  function buildMain(state) {
    const main = document.createElement("main");
    main.className = "chloe-main";
    main.appendChild(buildHero(state));
    createRecentlyPlayedListElement(state);
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

    const state = createState();
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
      startNowPlayingUpdates(state);
    });
  }

  initAlbumPromo();
})();
