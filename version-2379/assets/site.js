const MovieSite = (() => {
    let initialized = false;

    const findAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const normalize = (value) => String(value || "").toLowerCase().trim();

    function initMenu() {
        const button = document.querySelector("[data-menu-button]");
        const menu = document.querySelector("[data-main-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", () => {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        const slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        const slides = findAll("[data-hero-slide]", slider);
        const dots = findAll("[data-hero-dot]", slider);
        if (slides.length < 2) {
            return;
        }
        let index = 0;
        let timer = null;
        const show = (next) => {
            index = (next + slides.length) % slides.length;
            slides.forEach((slide, itemIndex) => {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach((dot, itemIndex) => {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        };
        const start = () => {
            clearInterval(timer);
            timer = setInterval(() => show(index + 1), 5200);
        };
        dots.forEach((dot, itemIndex) => {
            dot.addEventListener("click", () => {
                show(itemIndex);
                start();
            });
        });
        slider.addEventListener("mouseenter", () => clearInterval(timer));
        slider.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        const input = document.querySelector("[data-search-input]");
        const results = document.querySelector("[data-search-results]");
        if (!input || !results) {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");
        if (query) {
            input.value = query;
        }
        const typeSelect = document.querySelector("[data-type-filter]");
        const yearSelect = document.querySelector("[data-year-filter]");
        const categorySelect = document.querySelector("[data-category-filter]");
        const empty = document.querySelector("[data-empty-state]");
        const cards = findAll("[data-search-card]", results);
        const apply = () => {
            const text = normalize(input.value);
            const type = typeSelect ? normalize(typeSelect.value) : "";
            const year = yearSelect ? normalize(yearSelect.value) : "";
            const category = categorySelect ? normalize(categorySelect.value) : "";
            let visible = 0;
            cards.forEach((card) => {
                const haystack = normalize(card.getAttribute("data-search-text"));
                const cardType = normalize(card.getAttribute("data-type"));
                const cardYear = normalize(card.getAttribute("data-year"));
                const cardCategory = normalize(card.getAttribute("data-category"));
                const matched = (!text || haystack.includes(text)) &&
                    (!type || cardType.includes(type)) &&
                    (!year || cardYear === year) &&
                    (!category || cardCategory === category);
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        };
        [input, typeSelect, yearSelect, categorySelect].filter(Boolean).forEach((element) => {
            element.addEventListener("input", apply);
            element.addEventListener("change", apply);
        });
        apply();
    }

    function bindPlayer(options) {
        const video = document.querySelector(options.videoSelector || ".movie-video");
        const overlay = document.querySelector(options.overlaySelector || ".player-cover");
        const state = document.querySelector(options.stateSelector || ".player-state");
        const streamUrl = options.streamUrl;
        if (!video || !streamUrl) {
            return;
        }
        let attached = false;
        let hlsInstance = null;
        const setState = (text) => {
            if (!state) {
                return;
            }
            state.textContent = text || "";
            state.classList.toggle("is-visible", Boolean(text));
        };
        const attach = () => {
            if (attached) {
                return;
            }
            attached = true;
            setState("加载中");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", () => setState(""), { once: true });
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => setState(""));
                hlsInstance.on(window.Hls.Events.ERROR, (event, data) => {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setState("网络加载异常");
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setState("正在恢复播放");
                        hlsInstance.recoverMediaError();
                    } else {
                        setState("视频加载失败");
                        hlsInstance.destroy();
                    }
                });
            } else {
                setState("视频加载失败");
            }
        };
        const start = () => {
            attach();
            video.controls = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            const promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(() => setState("点击视频继续播放"));
            }
        };
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", () => {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener("pagehide", () => {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    function init() {
        if (initialized) {
            return;
        }
        initialized = true;
        initMenu();
        initHero();
        initFilters();
    }

    document.addEventListener("DOMContentLoaded", init);

    return {
        init,
        bindPlayer
    };
})();
