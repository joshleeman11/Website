(function () {
    const navLinksSelector = ".nav-links a[href*='#']";
    let navSpyInitialized = false;

    function getNavLinks() {
        return document.querySelectorAll(navLinksSelector);
    }

    function getSections() {
        return Array.from(document.querySelectorAll("section[id]"));
    }

    function hashFromHref(href) {
        const hashIndex = href.indexOf("#");
        return hashIndex === -1 ? "" : href.slice(hashIndex + 1);
    }

    function setActiveNav(activeId) {
        getNavLinks().forEach(function (link) {
            const href = link.getAttribute("href") || "";
            link.classList.toggle("active", activeId && hashFromHref(href) === activeId);
        });
    }

    function getNavHeight() {
        return (
            parseInt(
                getComputedStyle(document.documentElement).getPropertyValue(
                    "--nav-height"
                ),
                10
            ) || 72
        );
    }

    function updateActiveNavFromScroll() {
        const sections = getSections();
        if (!sections.length || !getNavLinks().length) return;

        const navHeight = getNavHeight();
        const probeY = navHeight + window.innerHeight * 0.32;
        const atPageBottom =
            window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 8;

        let activeId = null;

        if (atPageBottom) {
            activeId = sections[sections.length - 1].getAttribute("id");
        } else {
            sections.forEach(function (section) {
                const id = section.getAttribute("id");
                if (!id) return;

                const rect = section.getBoundingClientRect();
                if (rect.top <= probeY && rect.bottom > probeY) {
                    activeId = id;
                }
            });

            if (!activeId) {
                let bestVisible = 0;
                sections.forEach(function (section) {
                    const id = section.getAttribute("id");
                    if (!id) return;

                    const rect = section.getBoundingClientRect();
                    const visible =
                        Math.min(rect.bottom, window.innerHeight) -
                        Math.max(rect.top, navHeight);
                    if (visible > bestVisible) {
                        bestVisible = visible;
                        activeId = id;
                    }
                });
            }
        }

        setActiveNav(activeId);
    }

    function initNavSpy() {
        if (navSpyInitialized || !getNavLinks().length || !getSections().length) {
            return navSpyInitialized;
        }

        navSpyInitialized = true;
        window.addEventListener("scroll", updateActiveNavFromScroll, {
            passive: true,
        });
        window.addEventListener("hashchange", updateActiveNavFromScroll);
        window.addEventListener("resize", updateActiveNavFromScroll);
        updateActiveNavFromScroll();
        return true;
    }

    function closeMenu() {
        const navMenu = document.getElementById("nav-menu");
        const toggle = document.querySelector(".nav-toggle");
        navMenu?.classList.remove("open");
        toggle?.setAttribute("aria-expanded", "false");
    }

    document.addEventListener("click", function (event) {
        const toggle = event.target.closest(".nav-toggle");
        if (toggle) {
            const navMenu = document.getElementById("nav-menu");
            const isOpen = navMenu.classList.toggle("open");
            toggle.setAttribute("aria-expanded", String(isOpen));
            return;
        }

        const navLink = event.target.closest(navLinksSelector);
        if (navLink) {
            closeMenu();
            const hash = hashFromHref(navLink.getAttribute("href") || "");
            if (hash) {
                setActiveNav(hash);
                window.requestAnimationFrame(updateActiveNavFromScroll);
                window.setTimeout(updateActiveNavFromScroll, 100);
                window.setTimeout(updateActiveNavFromScroll, 400);
                window.setTimeout(updateActiveNavFromScroll, 800);
            }
            return;
        }

        const nav = document.querySelector(".site-nav-bar");
        if (nav && !nav.contains(event.target)) {
            closeMenu();
        }
    });

    if (!initNavSpy()) {
        const header = document.getElementById("header");
        if (header) {
            new MutationObserver(function () {
                initNavSpy();
                updateActiveNavFromScroll();
            }).observe(header, { childList: true });
        }
    }

    document.querySelector(".back-to-top")?.addEventListener("click", function (event) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
})();
