(function() {
  var menuButton = document.querySelector('.mobile-menu-button');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    var show = function(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };

    var start = function() {
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    };

    var restart = function(index) {
      window.clearInterval(timer);
      show(index);
      start();
    };

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        restart(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        restart(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        restart(current + 1);
      });
    }

    start();
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.filter-input'));
  var filterSelects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
  var lists = Array.prototype.slice.call(document.querySelectorAll('.filter-list'));

  filterInputs.forEach(function(input) {
    if (initialQuery) {
      input.value = initialQuery;
    }
  });

  var runFilter = function() {
    var query = filterInputs.length ? filterInputs[0].value.trim().toLowerCase() : '';
    var values = {};

    filterSelects.forEach(function(select) {
      var field = select.getAttribute('data-filter-field');
      values[field] = select.value;
    });

    lists.forEach(function(list) {
      var items = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .wide-card'));
      items.forEach(function(item) {
        var text = item.getAttribute('data-search') || '';
        var year = item.getAttribute('data-year') || '';
        var category = item.getAttribute('data-category') || '';
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesYear = !values.year || year === values.year || (values.year === '2020' && Number(year) <= 2020);
        var matchesCategory = !values.category || category === values.category;
        item.classList.toggle('is-hidden', !(matchesQuery && matchesYear && matchesCategory));
      });
    });
  };

  filterInputs.forEach(function(input) {
    input.addEventListener('input', runFilter);
  });

  filterSelects.forEach(function(select) {
    select.addEventListener('change', runFilter);
  });

  if (initialQuery) {
    runFilter();
  }
})();
