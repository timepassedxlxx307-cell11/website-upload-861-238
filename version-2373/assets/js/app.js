(() => {
    const ready = (callback) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    };

    ready(() => {
        const toggle = document.querySelector(".js-menu-toggle");
        const mobileNav = document.querySelector(".js-mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", () => {
                const open = mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", String(open));
            });
        }

        document.querySelectorAll(".js-hero-carousel").forEach((carousel) => {
            const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
            const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
            const prev = carousel.querySelector(".js-hero-prev");
            const next = carousel.querySelector(".js-hero-next");
            let active = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
            let timer = null;

            const show = (index) => {
                active = (index + slides.length) % slides.length;
                slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === active));
                dots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === active));
            };

            const start = () => {
                window.clearInterval(timer);
                if (slides.length > 1) {
                    timer = window.setInterval(() => show(active + 1), 5200);
                }
            };

            dots.forEach((dot, index) => {
                dot.addEventListener("click", () => {
                    show(index);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", () => {
                    show(active - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", () => {
                    show(active + 1);
                    start();
                });
            }

            show(active);
            start();
        });

        const normalize = (value) => (value || "").toString().toLowerCase().trim();

        document.querySelectorAll(".js-filter-list").forEach((list) => {
            const scope = list.closest("main") || document;
            const search = scope.querySelector(".js-search");
            const chips = Array.from(scope.querySelectorAll(".filter-chip"));
            const cards = Array.from(list.querySelectorAll(".movie-card, .rank-item"));
            let selected = "all";

            const apply = () => {
                const keyword = normalize(search ? search.value : "");
                cards.forEach((card) => {
                    const haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" "));
                    const filterMatch = selected === "all" || haystack.includes(normalize(selected));
                    const keywordMatch = !keyword || haystack.includes(keyword);
                    card.classList.toggle("is-hidden", !(filterMatch && keywordMatch));
                });
            };

            if (search) {
                search.addEventListener("input", apply);
            }

            chips.forEach((chip) => {
                chip.addEventListener("click", () => {
                    chips.forEach((item) => item.classList.remove("is-active"));
                    chip.classList.add("is-active");
                    selected = chip.dataset.filter || "all";
                    apply();
                });
            });

            apply();
        });

        document.querySelectorAll(".js-query-sync").forEach((input) => {
            const params = new URLSearchParams(window.location.search);
            const value = params.get("q");
            if (value) {
                input.value = value;
                input.dispatchEvent(new Event("input", { bubbles: true }));
            }
        });

        document.querySelectorAll(".js-player").forEach((player) => {
            const video = player.querySelector(".js-video");
            const button = player.querySelector(".js-play-button");
            const source = player.getAttribute("data-hls");
            let loaded = false;
            let hls = null;

            if (!video || !button || !source) {
                return;
            }

            const load = () => {
                if (loaded) {
                    return;
                }
                loaded = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            };

            const play = () => {
                load();
                button.classList.add("is-hidden");
                video.controls = true;
                const action = video.play();
                if (action && typeof action.catch === "function") {
                    action.catch(() => {});
                }
            };

            button.addEventListener("click", play);
            player.addEventListener("click", (event) => {
                if (event.target === video) {
                    if (!loaded || video.paused) {
                        play();
                    } else {
                        video.pause();
                    }
                }
            });

            window.addEventListener("pagehide", () => {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    });
})();
