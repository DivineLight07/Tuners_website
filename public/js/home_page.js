// Home page script: auth-aware navbar and UI behavior only

// Auto-hide navbar on scroll
(function() {
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            navbar.classList.add('-translate-y-full');
        } else {
            navbar.classList.remove('-translate-y-full');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);
})();

function updateHomePageUI() {
    const userJson = localStorage.getItem('user');
    const heroJoinLink = document.getElementById('hero-join-link');
    const heroCoursesLink = document.getElementById('hero-courses-link');
    const homeCtaSection = document.getElementById('home-cta-section');

    if (userJson) {
        // User is logged in (member or admin)
        if (heroJoinLink) heroJoinLink.style.display = 'none';
        if (homeCtaSection) homeCtaSection.style.display = 'none';
        if (heroCoursesLink) heroCoursesLink.href = '/courses';
    } else {
        // Guest
        if (heroJoinLink) heroJoinLink.style.display = 'inline-block';
        if (homeCtaSection) homeCtaSection.style.display = 'block';
        if (heroCoursesLink) heroCoursesLink.href = '/apply';
    }
}

document.addEventListener('DOMContentLoaded', updateHomePageUI);
