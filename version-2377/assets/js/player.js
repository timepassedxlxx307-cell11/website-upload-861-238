(function () {
  window.initCinemaPlayer = function (videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hls = null;
    var loaded = false;

    if (!video || !button || !streamUrl) {
      return;
    }

    var attemptPlay = function () {
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    };

    var load = function (playAfterLoad) {
      if (loaded) {
        if (playAfterLoad) {
          attemptPlay();
        }
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        if (playAfterLoad) {
          attemptPlay();
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        if (playAfterLoad) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            attemptPlay();
          });
        }
        return;
      }

      video.src = streamUrl;
      if (playAfterLoad) {
        attemptPlay();
      }
    };

    var play = function () {
      button.classList.add("is-hidden");
      load(true);
    };

    button.addEventListener("click", play);

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
  };
})();
