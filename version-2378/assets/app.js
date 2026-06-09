(function () {
  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  all('.menu-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      var nav = one('.mobile-nav');
      if (nav) {
        nav.classList.toggle('open');
      }
    });
  });

  all('[data-carousel]').forEach(function (carousel) {
    var slides = all('.hero-slide', carousel);
    var dots = all('.hero-dot', carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function play() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        play();
      });
    });

    if (slides.length > 1) {
      play();
    }
  });

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupGlobalSearch(form) {
    var input = one('.global-search-input', form);
    var panel = one('.search-panel');
    if (!input || !panel) {
      return;
    }

    function render() {
      var query = normalize(input.value);
      panel.innerHTML = '';
      if (!query) {
        panel.classList.remove('open');
        return;
      }
      var source = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
      var results = source.filter(function (item) {
        return normalize(item.t + ' ' + item.y + ' ' + item.c + ' ' + item.g).indexOf(query) >= 0;
      }).slice(0, 12);
      if (!results.length) {
        var empty = document.createElement('span');
        empty.textContent = '暂无匹配内容';
        panel.appendChild(empty);
        panel.classList.add('open');
        return;
      }
      results.forEach(function (item) {
        var link = document.createElement('a');
        link.href = item.u;
        link.innerHTML = '<strong>' + item.t + '</strong><em>' + item.y + ' · ' + item.c + '</em>';
        panel.appendChild(link);
      });
      panel.classList.add('open');
    }

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var first = panel.querySelector('a');
      if (first) {
        window.location.href = first.href;
      }
    });
    document.addEventListener('click', function (event) {
      if (!form.contains(event.target) && !panel.contains(event.target)) {
        panel.classList.remove('open');
      }
    });
  }

  all('.global-search').forEach(setupGlobalSearch);

  all('.local-filter').forEach(function (input) {
    var section = input.closest('.content-section') || document;
    var cards = all('.movie-card', section);
    function apply() {
      var query = normalize(input.value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var year = card.getAttribute('data-year') || '';
        var activeYear = section.getAttribute('data-active-year') || 'all';
        var byText = !query || text.indexOf(query) >= 0;
        var byYear = activeYear === 'all' || year === activeYear;
        card.style.display = byText && byYear ? '' : 'none';
      });
    }
    input.addEventListener('input', apply);
    all('.filter-button', section).forEach(function (button) {
      button.addEventListener('click', function () {
        all('.filter-button', section).forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        section.setAttribute('data-active-year', button.getAttribute('data-filter-year') || 'all');
        apply();
      });
    });
  });

  function attachVideo(widget) {
    var video = one('video', widget);
    var button = one('.player-cover', widget);
    var url = widget.getAttribute('data-video-src');
    var started = false;
    if (!video || !button || !url) {
      return;
    }

    function start() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      widget.classList.add('playing');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.play().catch(function () {});
        return;
      }
      var Hls = window.Hls;
      if (Hls && Hls.isSupported && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        var eventName = Hls.Events && Hls.Events.MANIFEST_PARSED ? Hls.Events.MANIFEST_PARSED : 'hlsManifestParsed';
        hls.on(eventName, function () {
          video.play().catch(function () {});
        });
        return;
      }
      video.src = url;
      video.play().catch(function () {});
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
  }

  all('.player-widget').forEach(attachVideo);
})();
