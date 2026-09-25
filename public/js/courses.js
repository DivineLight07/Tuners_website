// public/js/courses.js
// ─── GLOBAL STATE ────────────────────────────────────────────────────────────
let allCourses = [];
let currentFilter = 'all';

const CATEGORY_COLORS = {
    Theory: '#9b59b6',
    Instrument: '#e74c3c',
    Vocal: '#f39c12',
    Production: '#1abc9c'
};

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
            emptyState?.classList.remove('hidden');
            return;
        }

        grid.style.display = 'grid';
        emptyState?.classList.add('hidden');
        
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

    const isAdmin = getStoredUser()?.role === 'admin';

    grid.innerHTML = courses.map(course => {
        const categoryColor = CATEGORY_COLORS[course.category] || '#95a5a6';
        const title = escapeHtml(course.title);

        return `
            <div class="bg-card backdrop-blur-md overflow-hidden rounded-2xl group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 border border-white/10" data-category="${escapeHtml(course.category)}">
                <!-- YouTube Video Thumbnail with Play Button -->
                <div class="h-48 overflow-hidden bg-black/50 relative cursor-pointer group/vid" onclick="playCourse('${course._id}', '${escapeHtml(course.youtubeVideoId)}')">
                    <img src="https://img.youtube.com/vi/${course.youtubeVideoId}/hqdefault.jpg" alt="${title}" class="w-full h-full object-cover group-hover/vid:scale-105 transition-transform duration-500 opacity-80 group-hover/vid:opacity-100">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm shadow-lg group-hover/vid:bg-primary transition-colors group-hover/vid:scale-110">
                            <i data-lucide="play" class="w-5 h-5 text-white ml-1"></i>
                        </div>
                    </div>
                </div>
                
                <!-- Course Info -->
                <div class="p-5">
                    <div class="flex items-start justify-between gap-2 mb-2">
                        <h3 class="font-semibold text-lg leading-tight text-white">${title}</h3>
                        <span class="shrink-0 text-xs px-2.5 py-0.5 rounded-full font-medium" style="background-color: ${categoryColor}20; color: ${categoryColor}; border: 1px solid ${categoryColor}40">
                            ${escapeHtml(course.category)}
                        </span>
                    </div>
                    
                    ${course.description ? `<p class="text-sm text-white/70 line-clamp-2 mb-4">${escapeHtml(course.description)}</p>` : ''}
                    
                    <div class="flex items-center gap-4 text-xs text-white/50 mb-4">
                        ${course.instructor ? `
                        <span class="flex items-center gap-1">
                            <i data-lucide="users" class="w-3.5 h-3.5"></i>
                            ${escapeHtml(course.instructor)}
                        </span>` : ''}
                        
                        ${course.duration ? `
                        <span class="flex items-center gap-1">
                            <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                            ${escapeHtml(course.duration)}
                        </span>` : ''}
                    </div>
                    
                    ${isAdmin ? `
                    <div class="flex gap-2 mt-2">
                        <button onclick="openEditCourse('${course._id}')" class="flex-1 py-2 bg-primary/20 hover:bg-primary/40 text-primary rounded-lg text-sm font-medium transition-all">Edit</button>
                        <button onclick="deleteCourse('${course._id}')" class="flex-1 py-2 bg-destructive/20 hover:bg-destructive/40 text-destructive rounded-lg text-sm font-medium transition-all">Delete</button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
}

// ─── PLAY VIDEO & TRACK COURSES ──────────────────────────────────────────────
async function playCourse(courseId, youtubeId) {
    // 1. Mark as opened for dashboard tracking
    const user = getStoredUser();
    if (user) {
        const openedCourses = user.openedCourses || [];
        if (!openedCourses.includes(courseId)) {
            openedCourses.push(courseId);
            user.openedCourses = openedCourses;
            localStorage.setItem('user', JSON.stringify(user));
            
            // Background sync; the video plays either way
            apiFetch(`/api/v1/users/${user._id || user.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ openedCourses })
                }).catch(err => console.error('Failed to sync opened courses', err));
        }
    }

    // 2. Open modal and play
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('videoPlayerIframe');
    if (modal && iframe) {
        // We add autoplay to start video immediately
        iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
        openModal('videoModal');
    } else {
        // Fallback
        window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
    }
}

function closeVideoModal(event) {
    if (event) event.stopPropagation();
    closeModal('videoModal');
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
        .find(btn => btn.textContent.trim() === category || (category === 'all' && btn.textContent.trim() === 'All'));
    
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

// ─── ADMIN EDIT FUNCTIONS ───────────────────────────────────────────────────
function openAddCourseModal() {
    document.getElementById('courseModalTitle').textContent = 'Add Course';
    document.getElementById('courseForm').reset();
    document.getElementById('course-id').value = '';
    document.getElementById('course-published').checked = true;
    openModal('courseModal');
}

function openEditCourse(id) {
    const course = allCourses.find(c => c._id === id);
    if (!course) return;

    document.getElementById('courseModalTitle').textContent = 'Edit Course';
    document.getElementById('course-id').value = course._id;
    document.getElementById('course-title').value = course.title || '';
    document.getElementById('course-instructor').value = course.instructor || '';
    document.getElementById('course-youtube-url').value = course.youtubeVideoId || '';
    document.getElementById('course-description').value = course.description || '';
    document.getElementById('course-category').value = course.category || 'Theory';
    document.getElementById('course-duration').value = course.duration || '';
    document.getElementById('course-order').value = course.order || 0;
    document.getElementById('course-published').checked = course.isPublished !== false;
    
    openModal('courseModal');
}

function closeCourseModal() {
    closeModal('courseModal');
}

async function saveCourse(event) {
    event.preventDefault();
    const id = document.getElementById('course-id').value;
    const formData = {
        title: document.getElementById('course-title').value.trim(),
        instructor: document.getElementById('course-instructor').value.trim(),
        youtubeVideoId: document.getElementById('course-youtube-url').value.trim(),
        description: document.getElementById('course-description').value.trim(),
        category: document.getElementById('course-category').value,
        duration: document.getElementById('course-duration').value.trim(),
        order: parseInt(document.getElementById('course-order').value) || 0,
        isPublished: document.getElementById('course-published').checked
    };

    try {
        const url = id ? `/api/v1/courses/${id}` : '/api/v1/courses';
        const method = id ? 'PUT' : 'POST';
        await apiFetch(url, {
            method: method,
            body: JSON.stringify(formData)
        });

        closeCourseModal();
        await loadCourses(); // Reload list
        showMsg(id ? 'Course updated!' : 'Course added!');
    } catch (err) {
        showMsg(err.message || 'Failed to save course', 'error');
    }
}

async function deleteCourse(id) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
        const url = `/api/v1/courses/${id}`;
        await apiFetch(url, { method: 'DELETE' });
        await loadCourses();
        showMsg('Course deleted!');
    } catch (err) {
        showMsg('Failed to delete course', 'error');
    }
}

// ─── INITIALIZATION ─────────────────────────────────────────────────────────
if (requireApprovedMember()) {
    document.addEventListener('DOMContentLoaded', () => {
        // Stop the video when the player is closed by Escape or a backdrop click too
        document.getElementById('videoModal')?.addEventListener('modalclose', () => {
            document.getElementById('videoPlayerIframe').src = '';
        });
        loadCourses();
    });
}