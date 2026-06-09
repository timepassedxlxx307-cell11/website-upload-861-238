(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var url = "./search.html";

        if (query) {
          url += "?q=" + encodeURIComponent(query);
        }

        window.location.href = url;
      });
    });

    var filterInput = document.querySelector("[data-filter-input]");
    var filterSelect = document.querySelector("[data-filter-select]");
    var filterCards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
    var emptyState = document.querySelector("[data-empty-state]");

    if (filterInput && filterCards.length) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (initialQuery) {
        filterInput.value = initialQuery;
      }

      var applyFilter = function () {
        var query = normalize(filterInput.value);
        var year = filterSelect ? normalize(filterSelect.value) : "";
        var visible = 0;

        filterCards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search"));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesYear = !year || haystack.indexOf(year) !== -1;
          var show = matchesQuery && matchesYear;
          card.hidden = !show;

          if (show) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      };

      filterInput.addEventListener("input", applyFilter);

      if (filterSelect) {
        filterSelect.addEventListener("change", applyFilter);
      }

      applyFilter();
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var previous = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      var show = function (nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      };

      var start = function () {
        if (timer) {
          window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      };

      if (previous) {
        previous.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      show(0);
      start();
    }
  });
})();
