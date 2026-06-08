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
        if (heroCoursesLink) heroCoursesLink.href = '/login';
    }
}
// Load gallery preview images for the home page showcase
async function loadHomeGalleryPreview() {
    const grid = document.getElementById('home-gallery-grid');
    const section = document.getElementById('gallery-showcase');
    if (!grid || !section) return;

    try {
        const res = await fetch('/api/v1/gallery');
        const data = await res.json();
        const images = (data.data || []).slice(0, 6);

        if (images.length === 0) {
            // Hide the entire gallery section if no images
            section.style.display = 'none';
            return;
        }

        grid.innerHTML = images.map((item, index) => {
            const delay = index * 80;
            return `
            <div data-aos="fade-up" data-aos-delay="${delay}" class="group relative rounded-2xl overflow-hidden cursor-pointer border border-white/10 bg-black/40 aspect-[4/3] shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500" onclick="window.location.href='/gallery'">
                <img src="${item.imageUrl}" alt="Gallery moment" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <span class="text-white/90 text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        View
                    </span>
                </div>
            </div>
            `;
        }).join('');

        // Re-init AOS for newly added elements
        setTimeout(() => {
            if (typeof AOS !== 'undefined') AOS.refresh();
        }, 100);
    } catch (err) {
        console.error('Error loading gallery preview:', err);
        // Hide section on error
        if (section) section.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateHomePageUI();
    loadHomeGalleryPreview();
});
