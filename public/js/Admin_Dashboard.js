// ─── GLOBAL STATE ────────────────────────────────────────────────────────────
let usersCache = [];
let boardMembersCache = [];
let coursesCache = [];

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

// ─── UI HELPERS ──────────────────────────────────────────────────────────────
function showMsg(message) {
    const Msg = document.getElementById('Msg');
    if (Msg) {
        Msg.textContent = message;
        Msg.style.display = 'block';
        setTimeout(() => Msg.style.display = 'none', 3000);
    }
}

// ─── APPLICATIONS MANAGEMENT ─────────────────────────────────────────────────
async function loadApplications() {
    const appsList = document.getElementById('applications-list');
    if (!appsList) return;

    try {
        const data = await apiFetch('/api/v1/applications');
        const apps = data.data || [];

        if (apps.length === 0) {
            appsList.innerHTML = '<p class="empty-msg">No applications received yet.</p>';
            return;
        }

        appsList.innerHTML = apps.reverse().map(app => `
            <div class="app-card">
                <h3>${app.name}</h3>
                <p><strong>Email:</strong> ${app.email}</p>
                <p><strong>Phone:</strong> ${app.phone || 'N/A'}</p>
                <p><strong>Student ID:</strong> ${app.studentId}</p>
                <p><strong>Year:</strong> ${app.year}</p>
                <p><strong>Committee:</strong> ${app.committee}</p>
                ${app.instrument ? `<p><strong>Instrument:</strong> ${app.instrument}</p>` : ''}
                <p><strong>Major:</strong> ${app.major}</p>
                <p><strong>Date:</strong> ${new Date(app.createdAt).toLocaleDateString()}</p>
                <div class="reason"><strong>Reason for joining:</strong><br>${app.reason}</div>
                <button onclick="deleteApp('${app._id}')" class="btn-delete" style="margin-top:15px; width:100%">Delete Application</button>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading applications:', err);
        appsList.innerHTML = '<p class="empty-msg">Failed to load applications.</p>';
    }
}

async function deleteApp(id) {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
        await apiFetch(`/api/v1/applications/${id}`, { method: 'DELETE' });
        await loadApplications();
        showMsg('Application deleted.');
    } catch (err) {
        showMsg('Failed to delete application.');
    }
}

// ─── COURSES MANAGEMENT ──────────────────────────────────────────────────────
async function loadCoursesAdmin() {
  const container = document.getElementById('coursesList');
  if (!container) return;

  try {
    const response = await apiFetch('/api/v1/courses/admin');
    coursesCache = response.data || [];

    if (coursesCache.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6);">No courses yet.</p>';
      return;
    }

    container.innerHTML = coursesCache.map(course => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="flex: 1;">
          <h4 style="margin: 0 0 5px; color: #fff; font-family: 'Bebas Neue', cursive; font-size: 1.2rem;">${course.title}</h4>
          <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 0.9rem;">
            ${course.instructor} • ${course.category} 
            ${course.isPublished ? '<span style="color: #00d4aa;">✓ Published</span>' : '<span style="color: #ffa500;">○ Draft</span>'}
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button onclick="editCourse('${course._id}')" class="btn-primary" style="padding: 8px 15px; font-size: 0.85rem;">Edit</button>
          <button onclick="deleteCourse('${course._id}')" class="btn-primary" style="padding: 8px 15px; font-size: 0.85rem; background: rgba(220, 53, 69, 0.8);">Delete</button>
        </div>
      </div>
    `).join('');
    
  } catch (err) {
    console.error('Error loading courses:', err);
    container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6);">Failed to load courses.</p>';
  }
}

function openAddCourseModal() {
  document.getElementById('courseModalTitle').textContent = 'Add Course';
  document.getElementById('courseForm').reset();
  document.getElementById('course-id').value = '';
  document.getElementById('course-published').checked = true;
  document.getElementById('courseModal').style.display = 'flex';
}

function closeCourseModal() {
  document.getElementById('courseModal').style.display = 'none';
}

function editCourse(id) {
  const course = coursesCache.find(c => c._id === id);
  if (!course) return;

  document.getElementById('courseModalTitle').textContent = 'Edit Course';
  document.getElementById('course-id').value = course._id;
  document.getElementById('course-title').value = course.title;
  document.getElementById('course-instructor').value = course.instructor;
  document.getElementById('course-youtube-url').value = course.youtubeVideoId;
  document.getElementById('course-description').value = course.description || '';
  document.getElementById('course-category').value = course.category;
  document.getElementById('course-duration').value = course.duration || '';
  document.getElementById('course-order').value = course.order || 0;
  document.getElementById('course-published').checked = course.isPublished;
  
  document.getElementById('courseModal').style.display = 'flex';
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
    await loadCoursesAdmin();
    showMsg(id ? 'Course updated!' : 'Course added!');
  } catch (err) {
    showMsg(err.message || 'Failed to save course');
  }
}

async function deleteCourse(id) {
  const course = coursesCache.find(c => c._id === id);
  if (!course) return;

  if (!confirm(`Delete "${course.title}"?`)) return;

  try {
    await apiFetch(`/api/v1/courses/${id}`, { method: 'DELETE' });
    await loadCoursesAdmin();
    showMsg('Course deleted');
  } catch (err) {
    showMsg(err.message || 'Failed to delete course');
  }
}

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────
async function loadUsers() {
    const userList = document.getElementById('user-list');
    if (!userList) return;

    try {
        const response = await apiFetch('/api/v1/users');
        const users = response.data || []; 
        usersCache = users;

        if (usersCache.length === 0) {
            userList.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#fff;">No users found.</td></tr>';
            return;
        }

        const currentUserStr = localStorage.getItem('user');
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
        const currentUserId = currentUser ? currentUser.id : null;
        const currentUserEmail = currentUser ? currentUser.email : null;

        userList.innerHTML = usersCache.map(user => {
            let actionsHtml = '';

            if (user.email === 'admin@miuegypt.edu.eg') {
                if (currentUserEmail === 'admin@miuegypt.edu.eg') {
                    actionsHtml = `
                        <button onclick="editUser('${user._id}')" class="btn-primary" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">Edit</button>
                        <span style="font-size:0.8rem;color:#888;">System</span>
                    `;
                } else {
                    actionsHtml = '<span style="font-size:0.8rem;color:#888;">System</span>';
                }
            } else if (user._id === currentUserId) {
                actionsHtml = `
                    <button onclick="editUser('${user._id}')" class="btn-primary" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">Edit</button>
                    <span style="font-size:0.8rem;color:#888;">You</span>
                `;
            } else if (user.role === 'admin') {
                if (currentUserEmail === 'admin@miuegypt.edu.eg') {
                    actionsHtml = `
                        <button onclick="editUser('${user._id}')" class="btn-primary" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">Edit</button>
                        <button onclick="deleteUser('${user._id}')" class="btn-delete">Delete</button>
                    `;
                } else {
                    actionsHtml = '<span style="font-size:0.8rem;color:#888;">Admin</span>';
                }
            } else {
                actionsHtml = `
                    <button onclick="editUser('${user._id}')" class="btn-primary" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">Edit</button>
                    <button onclick="deleteUser('${user._id}')" class="btn-delete">Delete</button>
                `;
            }

            return `
            <tr>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${actionsHtml}</td>
            </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading users:', err);
        userList.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#fff;">Unable to load users.</td></tr>';
    }
}

function editUser(userId) {
    // ✅ STRICT CHECK: Exit if no userId or userId is "undefined"/"null"
    if (!userId || userId === 'undefined' || userId === 'null') {
        console.warn('editUser blocked: Invalid userId:', userId);
        return;
    }

    const user = usersCache.find(u => u._id === userId);
    if (!user) {
        console.warn('editUser blocked: User not found:', userId);
        return;
    }

    // Fill form fields
    document.getElementById('edit-original-email').value = user.email;
    document.getElementById('edit-user-name').value = user.name || '';
    document.getElementById('edit-user-email').value = user.email;
    document.getElementById('edit-user-pass').value = '';
    document.getElementById('edit-user-role').value = user.role;
    document.getElementById('edit-user-uid').value = user.universityId || '';
    
    // Fill badges
    const badgeCheckboxes = document.querySelectorAll('#edit-user-badges input[type="checkbox"]');
    const userBadges = user.badges || [];
    badgeCheckboxes.forEach(cb => {
        cb.checked = userBadges.includes(cb.value);
    });
    
    // Show modal with flex for centering
    const modal = document.getElementById('editUserModal');
    if (modal) {
        modal.style.display = 'flex';
        // Force reflow to ensure CSS applies
        void modal.offsetHeight;
    }
}

function closeEditUserModal() {
    const modal = document.getElementById('editUserModal');
    if (modal) {
        modal.style.display = 'none';
    }
    document.getElementById('editUserForm')?.reset();
}

async function saveUserEdit(event) {
    event.preventDefault();
    
    const originalEmail = document.getElementById('edit-original-email').value;
    const newName = document.getElementById('edit-user-name').value.trim();
    const newEmail = document.getElementById('edit-user-email').value.trim();
    const newPass = document.getElementById('edit-user-pass').value;
    const newRole = document.getElementById('edit-user-role').value;
    const newUid = document.getElementById('edit-user-uid').value.trim();
    
    const badgeCheckboxes = document.querySelectorAll('#edit-user-badges input[type="checkbox"]:checked');
    const newBadges = Array.from(badgeCheckboxes).map(cb => cb.value);
    
    const user = usersCache.find(u => u.email === originalEmail);
    if (!user) return;

    try {
        await apiFetch(`/api/v1/users/${user._id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                name: newName,
                email: newEmail,
                password: newPass || undefined,
                universityId: newUid,
                role: newRole,
                badges: newBadges
            })
        });

        closeEditUserModal();
        await loadUsers();
        showMsg('User details updated.');
    } catch (err) {
        showMsg(err.message || 'Unable to update user.');
    }
}

async function addUser() {
    const name = document.getElementById('new-user-name').value.trim();
    const email = document.getElementById('new-user-email').value.trim();
    const role = document.getElementById('new-user-role').value;
    const pass = document.getElementById('new-user-pass').value.trim(); 
    const uid = document.getElementById('new-user-uid').value.trim();

    if (!name || !email || !role) {
        showMsg('Please fill all required fields.');
        return;
    }

    try {
        await apiFetch('/api/v1/users/add', { 
            method: 'POST',
            body: JSON.stringify({ name, email, password: pass, universityId: uid, role }),
        });

        // Clear form
        document.getElementById('new-user-name').value = '';
        document.getElementById('new-user-email').value = '';
        document.getElementById('new-user-pass').value = '';
        document.getElementById('new-user-role').value = 'member';

        await loadUsers();
        showMsg('User account created!');
    } catch (err) {
        showMsg(err.message || 'Failed to create user.');
    }
}

async function deleteUser(userId) {
    const user = usersCache.find(u => u._id === userId);
    if (!user) return;

    if (!confirm(`Delete ${user.email}?`)) return;

    try {
        await apiFetch(`/api/v1/users/${userId}`, { method: 'DELETE' });
        await loadUsers();
        showMsg('User deleted.');
    } catch (err) {
        showMsg(err.message || 'Failed to delete user.');
    }
}

// ─── BOARD MEMBERS MANAGEMENT ────────────────────────────────────────────────
async function loadBoardMembers() {
    const container = document.getElementById('boardMembersList');
    if (!container) return;

    try {
        const response = await apiFetch('/api/v1/board');
        boardMembersCache = response.data || [];

        if (boardMembersCache.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6);">No board members yet.</p>';
            return;
        }

        container.innerHTML = boardMembersCache.map(member => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${member.image}" alt="${member.name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.2);">
                    <div>
                        <h4 style="margin: 0 0 3px; color: #fff; font-family: 'Bebas Neue', cursive; font-size: 1.2rem;">${member.name}</h4>
                        <p style="margin: 0; color: #00d4aa; font-size: 0.9rem;">${member.position}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="editBoardMember('${member._id}')" class="btn-primary" style="padding: 8px 15px; font-size: 0.85rem;">Edit</button>
                    <button onclick="deleteBoardMember('${member._id}')" class="btn-primary" style="padding: 8px 15px; font-size: 0.85rem; background: rgba(220, 53, 69, 0.8);">Delete</button>
                </div>
            </div>
        `).join('');
        
    } catch (err) {
        console.error('Error loading board members:', err);
        container.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6);">Failed to load board members.</p>';
    }
}

function openAddBoardMemberModal() {
    document.getElementById('boardModalTitle').textContent = 'Add Board Member';
    document.getElementById('boardMemberForm').reset();
    document.getElementById('board-member-id').value = '';
    const modal = document.getElementById('boardMemberModal');
    if (modal) modal.style.display = 'flex';
}

function closeBoardMemberModal() {
    const modal = document.getElementById('boardMemberModal');
    if (modal) modal.style.display = 'none';
}

function editBoardMember(id) {
    if (!id) return;
    const member = boardMembersCache.find(m => m._id === id);
    if (!member) return;

    document.getElementById('boardModalTitle').textContent = 'Edit Board Member';
    document.getElementById('board-member-id').value = member._id;
    document.getElementById('board-member-name').value = member.name;
    document.getElementById('board-member-position').value = member.position;
    document.getElementById('board-member-image').value = member.image || '';
    document.getElementById('board-member-bio').value = member.bio || '';
    document.getElementById('board-member-order').value = member.order || 0;
    document.getElementById('board-member-instagram').value = member.socialMedia?.instagram || '';
    document.getElementById('board-member-facebook').value = member.socialMedia?.facebook || '';
    document.getElementById('board-member-linkedin').value = member.socialMedia?.linkedin || '';
    
    const modal = document.getElementById('boardMemberModal');
    if (modal) modal.style.display = 'flex';
}

async function saveBoardMember(event) {
    event.preventDefault();
    
    const id = document.getElementById('board-member-id').value;
    const formData = {
        name: document.getElementById('board-member-name').value.trim(),
        position: document.getElementById('board-member-position').value.trim(),
        image: document.getElementById('board-member-image').value.trim() || '/images/default-avatar.png',
        bio: document.getElementById('board-member-bio').value.trim(),
        order: parseInt(document.getElementById('board-member-order').value) || 0,
        socialMedia: {
            instagram: document.getElementById('board-member-instagram').value.trim(),
            facebook: document.getElementById('board-member-facebook').value.trim(),
            linkedin: document.getElementById('board-member-linkedin').value.trim()
        }
    };

    try {
        const url = id ? `/api/v1/board/${id}` : '/api/v1/board';
        const method = id ? 'PUT' : 'POST';
        
        await apiFetch(url, {
            method: method,
            body: JSON.stringify(formData)
        });

        closeBoardMemberModal();
        await loadBoardMembers();
        showMsg(id ? 'Board member updated!' : 'Board member added!');
    } catch (err) {
        showMsg(err.message || 'Failed to save board member');
    }
}

async function deleteBoardMember(id) {
    const member = boardMembersCache.find(m => m._id === id);
    if (!member) return;

    if (!confirm(`Delete ${member.name} from the board?`)) return;

    try {
        await apiFetch(`/api/v1/board/${id}`, { method: 'DELETE' });
        await loadBoardMembers();
        showMsg('Board member deleted');
    } catch (err) {
        showMsg(err.message || 'Failed to delete board member');
    }
}

// ─── ROOM STATUS MANAGEMENT ──────────────────────────────────────────────────
async function updateRoomStatusDisplay() {
    const statusSpan = document.getElementById('adminRoomStatus');
    if (!statusSpan) return;

    try {
        const data = await apiFetch('/api/v1/room');
        const status = data.data?.status || 'Closed';
        statusSpan.textContent = status;
        statusSpan.className = status === 'Open' ? 'status-available' : 'status-occupied';
    } catch (err) {
        statusSpan.textContent = 'Unknown';
    }
}

async function setRoomStatus(status) {
    try {
        await apiFetch('/api/v1/room', {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        await updateRoomStatusDisplay();
        showMsg('Room status updated to ' + status);
    } catch (err) {
        showMsg('Failed to update: ' + err.message);
    }
}

// ─── AUTH & NAVIGATION ───────────────────────────────────────────────────────
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
        window.location.href = '/login';
    }
}

function globalLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// ─── AUTO-HIDE NAVBAR ────────────────────────────────────────────────────────
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

// ─── MODAL CLICK/KEYBOARD HANDLERS ───────────────────────────────────────────
document.addEventListener('click', function(e) {
    // Close edit user modal when clicking outside
    const editModal = document.getElementById('editUserModal');
    if (editModal && e.target === editModal) {
        closeEditUserModal();
    }
    
    // Close board member modal when clicking outside
    const boardModal = document.getElementById('boardMemberModal');
    if (boardModal && e.target === boardModal) {
        closeBoardMemberModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeEditUserModal();
        closeBoardMemberModal();
    }
});

// ─── INITIALIZATION (Runs once on page load) ─────────────────────────────────
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🎬 Admin Dashboard initialized');
    
    // 🔒 FORCE HIDE MODALS ON LOAD (Prevents accidental popups)
    const editModal = document.getElementById('editUserModal');
    const boardModal = document.getElementById('boardMemberModal');
    if (editModal) editModal.style.display = 'none';
    if (boardModal) boardModal.style.display = 'none';
    
    // Load all data
    updateNavAuth();
    await loadApplications();
    await loadUsers();
    await updateRoomStatusDisplay();
    await loadBoardMembers();
    await loadCoursesAdmin();
    
    console.log('✅ All dashboard data loaded');
});