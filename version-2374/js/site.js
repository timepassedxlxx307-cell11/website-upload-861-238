(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
      button.classList.toggle("open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function move(step) {
      show(index + step);
      restart();
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        move(1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    restart();
  }

  function initFilters() {
    var form = document.querySelector("[data-filter-form]");
    var list = document.querySelector("[data-card-list]");
    if (!form || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var keyword = form.querySelector("[data-filter-keyword]");
    var category = form.querySelector("[data-filter-category]");
    var region = form.querySelector("[data-filter-region]");
    var type = form.querySelector("[data-filter-type]");
    var year = form.querySelector("[data-filter-year]");
    var count = document.querySelector("[data-filter-count]");

    function valueOf(input) {
      return input ? input.value.trim().toLowerCase() : "";
    }

    function apply() {
      var q = valueOf(keyword);
      var categoryValue = valueOf(category);
      var regionValue = valueOf(region);
      var typeValue = valueOf(type);
      var yearValue = valueOf(year);
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var matched = true;
        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (categoryValue && (card.getAttribute("data-category") || "").toLowerCase() !== categoryValue) {
          matched = false;
        }
        if (regionValue && (card.getAttribute("data-region") || "").toLowerCase() !== regionValue) {
          matched = false;
        }
        if (typeValue && (card.getAttribute("data-type") || "").toLowerCase() !== typeValue) {
          matched = false;
        }
        if (yearValue && (card.getAttribute("data-year") || "").toLowerCase() !== yearValue) {
          matched = false;
        }
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible ? "符合条件：" + visible : "未找到匹配内容";
      }
    }

    form.addEventListener("input", apply);
    form.addEventListener("change", apply);
    form.addEventListener("reset", function () {
      window.setTimeout(apply, 0);
    });
    apply();
  }

  function initPlayers() {
    var videos = Array.prototype.slice.call(document.querySelectorAll(".movie-video"));
    videos.forEach(function (video) {
      setupVideo(video);
    });
  }

  function setupVideo(video) {
    var card = video.closest(".player-card");
    var source = video.querySelector("source");
    var src = source ? source.getAttribute("src") : video.getAttribute("src");
    var playButtons = card ? Array.prototype.slice.call(card.querySelectorAll("[data-player-toggle], [data-player-toggle-small]")) : [];
    var muteButton = card ? card.querySelector("[data-player-mute]") : null;
    var fullscreenButton = card ? card.querySelector("[data-player-fullscreen]") : null;

    if (src && window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (src && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (src && !video.getAttribute("src")) {
      video.src = src;
    }

    function syncState() {
      if (!card) {
        return;
      }
      var playing = !video.paused && !video.ended;
      card.classList.toggle("is-playing", playing);
      playButtons.forEach(function (button) {
        if (button.hasAttribute("data-player-toggle-small")) {
          button.textContent = playing ? "暂停" : "播放";
        }
      });
      if (muteButton) {
        muteButton.textContent = video.muted ? "取消静音" : "静音";
      }
    }

    function togglePlay(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (video.paused || video.ended) {
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {});
        }
      } else {
        video.pause();
      }
    }

    video.addEventListener("click", togglePlay);
    video.addEventListener("play", syncState);
    video.addEventListener("pause", syncState);
    video.addEventListener("ended", syncState);
    playButtons.forEach(function (button) {
      button.addEventListener("click", togglePlay);
    });
    if (muteButton) {
      muteButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        video.muted = !video.muted;
        syncState();
      });
    }
    if (fullscreenButton) {
      fullscreenButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (card && card.requestFullscreen) {
          card.requestFullscreen();
        }
      });
    }
    syncState();
  }
})();
