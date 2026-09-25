// member_dashboard.js — Member dashboard: profile, badges, opened courses, room status

function renderWelcome() {
    const welcomeTitle = document.getElementById('welcomeTitle');
    const user = getStoredUser();
    if (welcomeTitle && user) {
        welcomeTitle.textContent = `Welcome back, ${user.name || user.email.split('@')[0]}!`;
    }
}

function renderProfile() {
    const container = document.getElementById('profileData');
    const user = getStoredUser();
    if (!container || !user) return;

    const badges = user.badges || [];
    const badgesHtml = badges.length
        ? badges.map(b => `<span class="badge-item">${escapeHtml(b)}</span>`).join('')
        : '<p class="text-sm text-white/50 italic">No badges earned yet.</p>';

    container.innerHTML = `
        <p>Name: ${escapeHtml(user.name || '—')}</p>
        <p>University ID: ${escapeHtml(user.universityId || '—')}</p>
        <p class="text-sm font-semibold tracking-wide uppercase text-white/80 mt-4 mb-2">My Badges</p>
        <div class="badge-container">${badgesHtml}</div>
    `;
}

// Refresh the stored user from the server so badges/courses granted by an
// admin show up without logging out and back in.
async function syncProfile() {
    try {
        const { user } = await apiFetch('/api/v1/auth/me');
        if (!user) return;
        saveAuth(localStorage.getItem('token'), {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            universityId: user.universityId,
            avatar: user.avatar,
            badges: user.badges,
            openedCourses: user.openedCourses
        });
        renderWelcome();
        renderProfile();
    } catch (err) {
        console.error('Failed to sync profile:', err);
    }
}

// ─── COURSES ─────────────────────────────────────────────────────────────────
async function loadCourses() {
    const container = document.getElementById('coursesList');
    if (!container) return;

    try {
        const { data: courses = [] } = await apiFetch('/api/v1/courses');
        const opened = getStoredUser()?.openedCourses || [];
        const enrolled = courses.filter(course => opened.includes(course._id));

        if (enrolled.length === 0) {
            container.innerHTML = '<p class="text-white/60 text-sm">You haven\'t started any courses yet. Browse the Courses page to get started!</p>';
            return;
        }

        container.innerHTML = enrolled.map(course => `
            <a href="https://www.youtube.com/watch?v=${encodeURIComponent(course.youtubeVideoId)}" target="_blank" rel="noopener"
               class="flex items-center justify-between hover:bg-white/5 transition-colors p-3 mb-2 rounded-lg bg-black/20 border border-white/10">
                <div>
                    <h4 class="font-bold text-white mb-0.5">${escapeHtml(course.title)}</h4>
                    <p class="text-xs text-white/60">${escapeHtml(course.instructor)}</p>
                </div>
                <span class="text-xs font-medium px-2 py-1 bg-green-500/20 text-green-400 rounded border border-green-500/30">✓ Opened</span>
            </a>
        `).join('');
    } catch (err) {
        container.innerHTML = '<p class="text-white/60 text-sm">Failed to load courses.</p>';
    }
}

// ─── ROOM STATUS ─────────────────────────────────────────────────────────────
async function loadRoomStatus() {
    const statusSpan = document.getElementById('currentRoomStatus');
    if (!statusSpan) return;

    try {
        const response = await apiFetch('/api/v1/room');
        const status = response.data?.status || 'Closed';
        statusSpan.textContent = status;
        statusSpan.className = status === 'Open' ? 'status-available' : 'status-occupied';
    } catch (err) {
        console.error('Failed to load room status:', err);
        statusSpan.textContent = 'Unknown';
        statusSpan.className = 'status-occupied';
    }
}

// ─── EDIT PROFILE ────────────────────────────────────────────────────────────
function openEditProfile() {
    const user = getStoredUser();
    if (!user) return;

    document.getElementById('editProfileForm').reset();
    document.getElementById('edit-name').value = user.name || '';
    document.getElementById('edit-email').value = user.email || '';
    document.getElementById('edit-uid').value = user.universityId || '';
    openModal('editProfileModal');
}

function closeEditProfile() {
    closeModal('editProfileModal');
}

async function saveProfile(event) {
    event.preventDefault();
    const user = getStoredUser();
    if (!user) return;

    const name = document.getElementById('edit-name').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const universityId = document.getElementById('edit-uid').value.trim();
    const oldPassword = document.getElementById('edit-old-pass').value;
    const password = document.getElementById('edit-pass').value;

    try {
        await apiFetch(`/api/v1/users/${user._id || user.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name, email, universityId, oldPassword: oldPassword || undefined, password: password || undefined })
        });

        saveAuth(localStorage.getItem('token'), { ...user, name, email, universityId });
        closeEditProfile();
        renderWelcome();
        renderProfile();
        showMsg('Profile updated successfully!');
    } catch (err) {
        showMsg('Failed to update profile: ' + err.message, 'error');
    }
}

// ─── INIT ────────────────────────────────────────────────────────────────────
if (requireLogin()) {
    document.addEventListener('DOMContentLoaded', () => {
        renderWelcome();
        renderProfile();
        syncProfile();
        loadCourses();
        loadRoomStatus();
    });
}
