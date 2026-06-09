var MovieSite = (function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupCarousel() {
        var carousel = document.querySelector('[data-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var prev = carousel.querySelector('[data-carousel-prev]');
        var next = carousel.querySelector('[data-carousel-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-slide'), 10) || 0);
                restart();
            });
        });
        restart();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var selectors = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';

            if (scope.hasAttribute('data-read-query') && input && query) {
                input.value = query;
            }

            function run() {
                var term = input ? input.value.trim().toLowerCase() : '';
                cards.forEach(function (card) {
                    var ok = true;
                    var text = (card.getAttribute('data-search') || '').toLowerCase();
                    if (term && text.indexOf(term) === -1) {
                        ok = false;
                    }
                    selectors.forEach(function (select) {
                        var key = select.getAttribute('data-filter-select');
                        var value = select.value;
                        if (value && (card.getAttribute('data-' + key) || '') !== value) {
                            ok = false;
                        }
                    });
                    card.classList.toggle('is-hidden-by-filter', !ok);
                });
            }

            if (input) {
                input.addEventListener('input', run);
            }
            selectors.forEach(function (select) {
                select.addEventListener('change', run);
            });
            run();
        });
    }

    function player(streamUrl) {
        var video = document.getElementById('movie-player-video');
        var cover = document.getElementById('movie-player-cover');
        var attached = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function attach() {
            if (!attached) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                attached = true;
            }
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', attach);
        }
        video.addEventListener('click', function () {
            if (!attached) {
                attach();
            }
        });
        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupCarousel();
        setupFilters();
    });

    return {
        player: player
    };
}());
