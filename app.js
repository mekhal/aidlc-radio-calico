(function () {
  const STREAM_URL = "https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8";

  const REST_BACKGROUND = "#1F4E23";
  const HOVER_BACKGROUND = "#38A29D";

  function initApp() {
    const root = document.getElementById("root");

    const heading = document.createElement("h1");
    heading.textContent = "Radio Calico";

    const status = document.createElement("p");
    status.textContent = "Status: loading";

    const audio = document.createElement("audio");

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Listen Now";
    Object.assign(button.style, {
      background: REST_BACKGROUND,
      color: "#FFFFFF",
      borderRadius: "4px",
      border: "none",
      padding: "0.75rem 1.5rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      cursor: "pointer",
    });

    let isPlaying = false;

    function togglePlayback() {
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        button.textContent = "Listen Now";
      } else {
        audio.play();
        isPlaying = true;
        button.textContent = "Pause";
      }
    }

    button.addEventListener("click", togglePlayback);
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        togglePlayback();
      }
    });
    button.addEventListener("mouseenter", () => {
      button.style.background = HOVER_BACKGROUND;
    });
    button.addEventListener("mouseleave", () => {
      button.style.background = REST_BACKGROUND;
    });

    root.appendChild(heading);
    root.appendChild(status);
    root.appendChild(button);
    root.appendChild(audio);

    let hls;

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(STREAM_URL);
      hls.attachMedia(audio);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        status.textContent = "Status: ready";
      });
      hls.on(window.Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          status.textContent = "Status: error";
        }
      });
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari has native HLS support
      audio.src = STREAM_URL;
      audio.addEventListener("loadedmetadata", () => {
        status.textContent = "Status: ready";
      });
      audio.addEventListener("error", () => {
        status.textContent = "Status: error";
      });
    } else {
      status.textContent = "Status: unsupported";
    }
  }

  initApp();
})();
