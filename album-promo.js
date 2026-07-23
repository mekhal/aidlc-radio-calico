/* Issue #150: static mockup only — no real audio stream. Play/pause just
   toggles the icon/animation and drives a fake progress bar so the card
   demonstrates its states without playing sound. */
(function () {
  "use strict";

  var TRACK_SECONDS = 171; // 02:51

  var playToggle = document.getElementById("chloePlayToggle");
  var playIcon = document.getElementById("chloePlayIcon");
  var diamond = document.getElementById("chloeDiamond");
  var progressBar = document.getElementById("chloeProgressBar");
  var timeCurrent = document.getElementById("chloeTimeCurrent");

  if (!playToggle) {
    return;
  }

  var elapsed = 0;
  var timerId = null;

  function formatTime(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = Math.floor(totalSeconds % 60);
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function tick() {
    elapsed += 1;
    if (elapsed >= TRACK_SECONDS) {
      elapsed = TRACK_SECONDS;
      stop();
    }
    var percent = (elapsed / TRACK_SECONDS) * 100;
    progressBar.style.width = percent + "%";
    progressBar.closest(".progress").setAttribute("aria-valuenow", String(Math.round(percent)));
    timeCurrent.textContent = formatTime(elapsed);
  }

  function stop() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
    playIcon.classList.remove("bi-pause-fill");
    playIcon.classList.add("bi-play-fill");
    diamond.classList.remove("is-playing");
    playToggle.setAttribute("aria-label", "Play");
    playToggle.setAttribute("aria-pressed", "false");
  }

  function play() {
    playIcon.classList.remove("bi-play-fill");
    playIcon.classList.add("bi-pause-fill");
    diamond.classList.add("is-playing");
    playToggle.setAttribute("aria-label", "Pause");
    playToggle.setAttribute("aria-pressed", "true");
    timerId = window.setInterval(tick, 1000);
  }

  playToggle.addEventListener("click", function () {
    if (timerId) {
      stop();
    } else {
      if (elapsed >= TRACK_SECONDS) {
        elapsed = 0;
      }
      play();
    }
  });
})();
