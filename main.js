(function () {
    const navLinksSelector = ".nav-links a[href*='#']";
    const sections = document.querySelectorAll("section[id]");

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
            return;
        }

        const nav = document.querySelector(".site-nav-bar");
        if (nav && !nav.contains(event.target)) {
            closeMenu();
        }
    });

    if (sections.length) {
        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    const id = entry.target.getAttribute("id");
                    document.querySelectorAll(navLinksSelector).forEach(function (link) {
                        const href = link.getAttribute("href") || "";
                        link.classList.toggle("active", href === "#" + id || href.endsWith("#" + id));
                    });
                });
            },
            { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
        );

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    document.querySelector(".back-to-top")?.addEventListener("click", function (event) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
})();
