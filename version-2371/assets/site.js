(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initImages() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        image.removeAttribute('src');
      }, { once: true });
    });
  }

  function initMenu() {
    var button = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeaderSearch() {
    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initCatalogFilter() {
    var panel = document.querySelector('[data-catalog-filter]');
    var grid = document.querySelector('[data-catalog-grid]');
    if (!panel || !grid) {
      return;
    }
    var textInput = panel.querySelector('[data-filter-text]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var resetButton = panel.querySelector('[data-filter-reset]');
    var countNode = document.querySelector('[data-filter-count]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

    function apply() {
      var query = normalize(textInput.value);
      var type = typeSelect.value;
      var region = regionSelect.value;
      var visible = 0;
      cards.forEach(function (card) {
        var matchesText = !query || normalize(card.getAttribute('data-title')).indexOf(query) !== -1;
        var matchesType = !type || card.getAttribute('data-type') === type;
        var matchesRegion = !region || card.getAttribute('data-region') === region;
        var shouldShow = matchesText && matchesType && matchesRegion;
        card.classList.toggle('is-hidden', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });
      if (countNode) {
        countNode.textContent = '显示 ' + visible + ' 部';
      }
    }

    [textInput, typeSelect, regionSelect].forEach(function (node) {
      node && node.addEventListener('input', apply);
      node && node.addEventListener('change', apply);
    });
    resetButton && resetButton.addEventListener('click', function () {
      textInput.value = '';
      typeSelect.value = '';
      regionSelect.value = '';
      apply();
    });
    apply();
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<a class="movie-card" href="./movies/' + escapeHtml(movie.id) + '.html">' +
        '<div class="poster-frame">' +
          '<img src="./' + escapeHtml(movie.cover) + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-fallback">高清影视</span>' +
          '<span class="score-badge">' + escapeHtml(movie.rating) + '</span>' +
        '</div>' +
        '<div class="movie-card-body">' +
          '<h3>' + escapeHtml(movie.title) + '</h3>' +
          '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
          '<p>' + escapeHtml(movie.oneLine || movie.summary || '') + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var panel = document.querySelector('[data-search-page]');
    var results = document.querySelector('[data-search-results]');
    if (!panel || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }
    var input = panel.querySelector('[data-search-input]');
    var typeSelect = panel.querySelector('[data-search-type]');
    var regionSelect = panel.querySelector('[data-search-region]');
    var button = panel.querySelector('[data-search-button]');
    var count = document.querySelector('[data-search-count]');
    var params = new URLSearchParams(window.location.search);
    input.value = params.get('q') || '';

    function render() {
      var query = normalize(input.value);
      var type = typeSelect.value;
      var region = regionSelect.value;
      var data = window.MOVIE_SEARCH_DATA || [];
      var filtered = data.filter(function (movie) {
        var text = normalize([movie.title, movie.region, movie.type, movie.genre, movie.tags.join(' '), movie.oneLine, movie.summary].join(' '));
        var matchesText = !query || text.indexOf(query) !== -1;
        var matchesType = !type || movie.type === type;
        var matchesRegion = !region || movie.region === region;
        return matchesText && matchesType && matchesRegion;
      });
      var display = filtered.slice(0, 240);
      results.innerHTML = display.map(movieCardTemplate).join('');
      initImages();
      if (count) {
        count.textContent = '找到 ' + filtered.length + ' 部，当前显示 ' + display.length + ' 部';
      }
    }

    button.addEventListener('click', render);
    input.addEventListener('input', render);
    typeSelect.addEventListener('change', render);
    regionSelect.addEventListener('change', render);
    render();
  }

  ready(function () {
    initImages();
    initMenu();
    initHeaderSearch();
    initHero();
    initCatalogFilter();
    initSearchPage();
  });
})();
