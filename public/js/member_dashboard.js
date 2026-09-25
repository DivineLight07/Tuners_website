// member_dashboard.js — Member dashboard: profile, badges, application status,
// opened courses, room status

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

// Refresh the stored user from the server so badges/courses/status granted
// by an admin show up without logging out and back in.
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

// ─── APPLICATION STATUS ───────────────────────────────────────────────────────
// Swaps the "My Courses" card for an "Application Status" card while the
// member isn't approved yet, and pops up the accept/reject decision once.
async function loadApplicationStatus() {
    const user = getStoredUser();
    if (!user || user.role === 'admin') {
        showCoursesCard();
        return;
    }

    let application = null;
    try {
        ({ data: application } = await apiFetch('/api/v1/applications/me'));
    } catch (err) {
        console.error('Failed to load application status:', err);
    }

    // No application on file (e.g. an account an admin created directly), or
    // already approved and acknowledged: nothing to show here.
    if (!application || (application.status === 'approved' && application.acknowledged)) {
        showCoursesCard();
        return;
    }

    showStatusCard(application);

    if (application.status === 'approved' && !application.acknowledged) {
        showDecisionModal({
            icon: 'check',
            title: 'Application Accepted! 🎉',
            message: 'Congratulations — you\'re officially a Tuners member. Press OK to unlock your member courses.',
            onOk: acknowledgeAcceptance
        });
    } else if (application.status === 'rejected') {
        showDecisionModal({
            icon: 'x',
            title: 'Application Rejected',
            message: 'Unfortunately your application wasn\'t accepted this time. Pressing OK will delete this account — you\'re welcome to apply again in the future.',
            onOk: deleteAccountAfterRejection
        });
    }
}

function showCoursesCard() {
    document.getElementById('applicationStatusCard').style.display = 'none';
    document.getElementById('coursesCard').style.display = 'flex';
    loadCourses();
}

function showStatusCard(application) {
    document.getElementById('coursesCard').style.display = 'none';
    const card = document.getElementById('applicationStatusCard');
    card.style.display = 'flex';

    const copy = {
        pending: { cls: 'status-pending', label: 'Pending Review', body: 'Your application is being reviewed by the Tuners admin team. Check back here for updates!' },
        approved: { cls: 'status-available', label: 'Approved', body: 'Your application has been approved.' },
        rejected: { cls: 'status-occupied', label: 'Rejected', body: 'Your application was not approved.' }
    }[application.status];

    document.getElementById('applicationStatusData').innerHTML = `
        <p class="mb-4"><span class="${copy.cls}">${copy.label}</span></p>
        <p class="text-sm text-white/70 leading-relaxed">${copy.body}</p>
    `;
}

function showDecisionModal({ icon, title, message, onOk }) {
    const isAccept = icon === 'check';
    document.getElementById('decision-icon').innerHTML =
        `<i data-lucide="${isAccept ? 'check-circle' : 'x-circle'}" class="w-8 h-8 ${isAccept ? 'text-green-500' : 'text-destructive'}"></i>`;
    document.getElementById('decision-icon').className =
        `w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isAccept ? 'bg-green-500/20' : 'bg-destructive/20'}`;
    document.getElementById('decision-title').textContent = title;
    document.getElementById('decision-message').textContent = message;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const okBtn = document.getElementById('decision-ok-btn');
    // Replace the button so the previous listener (if any) doesn't stack.
    const freshBtn = okBtn.cloneNode(true);
    okBtn.replaceWith(freshBtn);
    freshBtn.addEventListener('click', async () => {
        freshBtn.disabled = true;
        try {
            await onOk();
        } finally {
            freshBtn.disabled = false;
        }
    });

    openModal('decisionModal');
}

async function acknowledgeAcceptance() {
    try {
        await apiFetch('/api/v1/applications/me/acknowledge', { method: 'PATCH' });
    } catch (err) {
        console.error('Failed to acknowledge acceptance:', err);
    }
    saveAuth(localStorage.getItem('token'), { ...getStoredUser(), status: 'approved' });
    closeModal('decisionModal');
    showCoursesCard();
}

async function deleteAccountAfterRejection() {
    try {
        await apiFetch('/api/v1/auth/me', { method: 'DELETE' });
    } catch (err) {
        console.error('Failed to delete account:', err);
    }
    clearAuth();
    window.location.href = '/home';
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
        loadApplicationStatus();
        loadRoomStatus();
    });
}
