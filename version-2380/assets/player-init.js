(function() {
  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  nodes.forEach(function(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var stream = player.getAttribute('data-stream-url');
    var attached = false;
    var hls = null;

    var attach = function() {
      if (attached || !video || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        attached = true;
        return;
      }

      video.src = stream;
      attached = true;
    };

    var play = function() {
      attach();
      if (overlay) {
        overlay.hidden = true;
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function() {
          if (overlay) {
            overlay.hidden = false;
          }
        });
      }
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function() {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function() {
        if (overlay) {
          overlay.hidden = true;
        }
      });
      video.addEventListener('pause', function() {
        if (overlay && video.currentTime === 0) {
          overlay.hidden = false;
        }
      });
    }

    window.addEventListener('beforeunload', function() {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
