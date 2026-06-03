// public/js/courses.js
// ─── GLOBAL STATE ────────────────────────────────────────────────────────────
let allCourses = [];
let currentFilter = 'all';

// ─── API HELPER ──────────────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {})
        }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
}

// ─── LOAD COURSES FROM DATABASE ─────────────────────────────────────────────
async function loadCourses() {
    const grid = document.getElementById('coursesGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!grid) return;

    try {
        const response = await apiFetch('/api/v1/courses');
        allCourses = response.data || [];
        
        if (allCourses.length === 0) {
            grid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';
        
        displayCourses(allCourses);
        
    } catch (err) {
        console.error('Error loading courses:', err);
        if (grid) {
            grid.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6); grid-column: 1/-1; padding: 40px;">Failed to load courses. Please try again later.</p>';
        }
    }
}

// ─── DISPLAY COURSES WITH YOUTUBE EMBEDS ────────────────────────────────────
function displayCourses(courses) {
    const grid = document.getElementById('coursesGrid');
    if (!grid) return;

    if (courses.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6); grid-column: 1/-1; padding: 40px;">No courses match this category.</p>';
        return;
    }

    grid.innerHTML = courses.map(course => {
        // Category colors for badges
        const categoryColors = {
            'Music Theory': '#9b59b6',
            'Instrument': '#e74c3c', 
            'Vocal': '#f39c12',
            'Workshop': '#1abc9c',
            'Other': '#95a5a6'
        };
        const categoryColor = categoryColors[course.category] || '#95a5a6';

        return `
            <article class="course-card" data-category="${course.category}">
                <!-- YouTube Video Embed (Responsive 16:9) -->
                <div class="video-container">
                    <iframe 
                        src="https://www.youtube.com/embed/${course.youtubeVideoId}?rel=0&modestbranding=1" 
                        title="${course.title}"
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowfullscreen
                        loading="lazy">
                    </iframe>
                </div>
                
                <!-- Course Info -->
                <div class="course-info">
                    <!-- Category Badge -->
                    <span class="category-badge" style="--category-color: ${categoryColor}">
                        ${course.category}
                    </span>
                    
                    <!-- Title -->
                    <h3>${course.title}</h3>
                    
                    <!-- Instructor -->
                    <p class="instructor">👨‍🏫 ${course.instructor}</p>
                    
                    <!-- Duration (if available) -->
                    ${course.duration ? `<p class="duration">⏱️ <strong>Duration:</strong> ${course.duration}</p>` : ''}
                    
                    <!-- Description (if available) -->
                    ${course.description ? `<p class="description">${course.description}</p>` : ''}
                </div>
            </article>
        `;
    }).join('');
}

// ─── FILTER COURSES BY CATEGORY ─────────────────────────────────────────────
function filterCourses(category) {
    currentFilter = category;
    
    // Update active button style
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the clicked button
    const clickedBtn = Array.from(document.querySelectorAll('.filter-btn'))
        .find(btn => btn.textContent.includes(category) || (category === 'all' && btn.textContent === 'All Courses'));
    
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }

    // Filter and display
    if (category === 'all') {
        displayCourses(allCourses);
    } else {
        const filtered = allCourses.filter(course => course.category === category);
        displayCourses(filtered);
    }
}

// ─── AUTH & NAVIGATION (Shared logic) ───────────────────────────────────────
function updateNavAuth() {
    const userJson = localStorage.getItem('user');
    const loginBtn = document.getElementById('nav-login-btn');
    const logoutBtn = document.getElementById('nav-logout-btn');
    const dashboardLi = document.getElementById('nav-dashboard');
    const dashboardLink = document.getElementById('nav-dashboard-link');
    const applyLink = document.querySelector('nav ul li a[href*="/apply"]');

    if (userJson) {
        const user = JSON.parse(userJson);
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (applyLink && applyLink.parentElement) applyLink.parentElement.style.display = 'none';
        if (dashboardLi && dashboardLink) {
            dashboardLi.style.display = 'inline-block';
            dashboardLink.href = user.role === 'admin' ? '/admin' : '/member';
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (applyLink && applyLink.parentElement) applyLink.parentElement.style.display = 'inline-block';
        if (dashboardLi) dashboardLi.style.display = 'none';
    }
}

function globalLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// ─── AUTO-HIDE NAVBAR ON SCROLL ─────────────────────────────────────────────
(function() {
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);
})();

// ─── INITIALIZATION ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 Courses page loaded');
    updateNavAuth();
    loadCourses();
});