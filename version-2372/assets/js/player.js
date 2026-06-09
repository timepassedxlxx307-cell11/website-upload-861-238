(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  window.initMoviePlayer = function (sourceUrl, videoId, buttonId, layerId) {
    ready(function () {
      var video = document.getElementById(videoId);
      var button = document.getElementById(buttonId);
      var layer = document.getElementById(layerId);
      var prepared = false;
      var hls = null;

      if (!video || !button || !layer || !sourceUrl) {
        return;
      }

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          return;
        }

        video.src = sourceUrl;
      }

      function playMovie(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        prepare();
        layer.classList.add("is-hidden");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            layer.classList.remove("is-hidden");
          });
        }
      }

      button.addEventListener("click", playMovie);
      layer.addEventListener("click", playMovie);
      video.addEventListener("click", function () {
        if (video.paused) {
          playMovie();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        layer.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          layer.classList.remove("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  };
})();
