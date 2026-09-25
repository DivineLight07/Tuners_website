// ─── GLOBAL STATE ────────────────────────────────────────────────────────────
let usersCache = [];
let boardMembersCache = [];
let coursesCache = [];
let globalBadgesCache = [];

// ─── APPLICATIONS MANAGEMENT ─────────────────────────────────────────────────
async function loadApplications() {
    const appsList = document.getElementById('applications-list');
    if (!appsList) return;

    try {
        const data = await apiFetch('/api/v1/applications?status=pending');
        const apps = data.data || [];

        if (apps.length === 0) {
            appsList.innerHTML = '<p class="text-white/60">No pending applications.</p>';
            return;
        }

        appsList.innerHTML = apps.reverse().map(raw => {
            const app = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, escapeHtml(v)]));
            return `
            <div class="bg-black/20 p-5 rounded-xl border border-white/10 hover:border-primary/50 transition-colors">
                <div class="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                    <h3 class="font-bold text-lg text-white">${app.name}</h3>
                    <span class="text-xs font-medium px-2 py-1 bg-white/10 rounded-md text-white/80">${new Date(raw.date || raw.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="space-y-1.5 text-sm mb-4 text-white/80">
                    <p><strong class="text-white">Email:</strong> ${app.email}</p>
                    <p><strong class="text-white">Phone:</strong> ${app.phone || 'N/A'}</p>
                    <p><strong class="text-white">Student ID:</strong> ${app.studentId}</p>
                    <p><strong class="text-white">Year:</strong> ${app.year}</p>
                    <p><strong class="text-white">Committee:</strong> ${app.committee}</p>
                    ${app.instrument ? `<p><strong class="text-white">Instrument:</strong> ${app.instrument}</p>` : ''}
                    <p><strong class="text-white">Major:</strong> ${app.major}</p>
                </div>
                <div class="bg-white/5 p-3 rounded-lg text-sm mb-4 break-words">
                    <strong class="text-white text-xs uppercase tracking-wider mb-1 block">Reason for joining:</strong>
                    <span class="text-white/70 italic">"${app.reason}"</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="decideApplication('${app._id}', 'approved')" class="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium transition-all">Accept</button>
                    <button onclick="decideApplication('${app._id}', 'rejected')" class="flex-1 py-2 bg-destructive/80 hover:bg-destructive text-white rounded-lg text-sm font-medium transition-all">Reject</button>
                </div>
            </div>
        `;
        }).join('');
    } catch (err) {
        console.error('Error loading applications:', err);
        appsList.innerHTML = '<p class="text-white/60">Failed to load applications.</p>';
    }
}

async function decideApplication(id, status) {
    const verb = status === 'approved' ? 'accept' : 'reject';
    if (!confirm(`Are you sure you want to ${verb} this application?`)) return;
    try {
        await apiFetch(`/api/v1/applications/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
        await Promise.all([loadApplications(), loadUsers()]);
        showMsg(`Application ${status}.`);
    } catch (err) {
        showMsg(err.message || `Failed to ${verb} application.`, 'error');
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
      <div class="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/10 mb-3 hover:bg-black/30 transition-colors">
        <div class="flex-1">
          <h4 class="font-bold text-lg text-white mb-1 leading-tight">${escapeHtml(course.title)}</h4>
          <p class="text-sm text-white/60">
            ${escapeHtml(course.instructor)} • ${escapeHtml(course.category)} 
            ${course.isPublished ? '<span class="text-green-400 ml-2">✓ Published</span>' : '<span class="text-amber-400 ml-2">○ Draft</span>'}
          </p>
        </div>
        <div class="flex gap-2">
          <button onclick="editCourse('${course._id}')" class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-sm font-medium transition-colors">Edit</button>
          <button onclick="deleteCourse('${course._id}')" class="px-3 py-1.5 bg-destructive/80 hover:bg-destructive text-white rounded text-sm font-medium transition-colors">Delete</button>
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
  openModal('courseModal');
}

function closeCourseModal() {
  closeModal('courseModal');
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
  
  openModal('courseModal');
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

// ─── GALLERY MANAGEMENT ──────────────────────────────────────────────────────
let galleryCache = [];

async function loadGalleryAdmin() {
    const container = document.getElementById('galleryAdminList');
    if (!container) return;

    try {
        const response = await apiFetch('/api/v1/gallery');
        galleryCache = response.data || [];

        if (galleryCache.length === 0) {
            container.innerHTML = '<p class="text-center text-white/60 col-span-2">No images yet.</p>';
            return;
        }

        container.innerHTML = galleryCache.map(item => `
            <div class="relative bg-black/20 rounded-xl border border-white/10 overflow-hidden group aspect-[4/3]">
                <img src="${escapeHtml(item.imageUrl)}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onclick="editGallery('${item._id}')" class="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors" title="Edit"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                    <button onclick="deleteGallery('${item._id}')" class="p-2 bg-destructive/80 hover:bg-destructive text-white rounded-full transition-colors" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
        console.error('Error loading gallery:', err);
        container.innerHTML = '<p class="text-center text-white/60 col-span-2">Failed to load gallery.</p>';
    }
}

function openAddGalleryModal() {
    document.getElementById('galleryModalTitle').textContent = 'Add Gallery Image';
    document.getElementById('galleryForm').reset();
    document.getElementById('gallery-id').value = '';
    openModal('galleryModal');
}

function closeGalleryModal() {
    closeModal('galleryModal');
}

function editGallery(id) {
    if (!id) return;
    const item = galleryCache.find(g => g._id === id);
    if (!item) return;

    document.getElementById('galleryModalTitle').textContent = 'Edit Gallery Image';
    document.getElementById('gallery-id').value = item._id;
    document.getElementById('gallery-image-url').value = item.imageUrl || '';
    document.getElementById('gallery-order').value = item.order || 0;
    
    openModal('galleryModal');
}

async function saveGallery(event) {
    event.preventDefault();
    
    const id = document.getElementById('gallery-id').value;
    const formData = new FormData();
    formData.append('imageUrl', document.getElementById('gallery-image-url').value.trim());
    formData.append('order', parseInt(document.getElementById('gallery-order').value) || 0);

    const fileInput = document.getElementById('gallery-image-file');
    if (fileInput.files[0]) {
        formData.append('imageFile', fileInput.files[0]);
    }

    try {
        const url = id ? `/api/v1/gallery/${id}` : '/api/v1/gallery';
        const method = id ? 'PUT' : 'POST';
        
        await apiFetch(url, { method, body: formData });

        closeGalleryModal();
        await loadGalleryAdmin();
        showMsg(id ? 'Image updated!' : 'Image added!');
    } catch (err) {
        showMsg(err.message || 'Failed to save image');
    }
}

async function deleteGallery(id) {
    if (!confirm('Delete this image from the gallery?')) return;

    try {
        await apiFetch(`/api/v1/gallery/${id}`, { method: 'DELETE' });
        await loadGalleryAdmin();
        showMsg('Image deleted');
    } catch (err) {
        showMsg(err.message || 'Failed to delete image');
    }
}

// ─── BADGES MANAGEMENT ───────────────────────────────────────────────────────
async function loadBadgesAdmin() {
    const container = document.getElementById('badgesAdminList');
    if (!container) return;

    try {
        const response = await apiFetch('/api/v1/badges');
        globalBadgesCache = response.data || [];

        if (globalBadgesCache.length === 0) {
            container.innerHTML = '<p class="text-center text-white/60">No badges yet.</p>';
            return;
        }

        container.innerHTML = globalBadgesCache.map(badge => `
            <div class="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/10 hover:bg-black/30 transition-colors mb-2">
                <span class="text-white font-medium text-sm">${escapeHtml(badge.name)}</span>
                <button type="button" onclick="deleteGlobalBadge('${badge._id}')" class="p-1.5 bg-destructive/80 hover:bg-destructive text-white rounded transition-colors" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
        console.error('Error loading badges:', err);
        container.innerHTML = '<p class="text-center text-white/60">Failed to load badges.</p>';
    }
}

async function createGlobalBadge(event) {
    event.preventDefault();
    const nameInput = document.getElementById('new-badge-name');
    const name = nameInput.value.trim();
    if (!name) return;

    try {
        await apiFetch('/api/v1/badges', {
            method: 'POST',
            body: JSON.stringify({ name })
        });
        nameInput.value = '';
        await loadBadgesAdmin();
        showMsg('Badge created!');
    } catch (err) {
        showMsg(err.message || 'Failed to create badge');
    }
}

async function deleteGlobalBadge(id) {
    if (!confirm('Delete this badge globally? It will also be removed from all users.')) return;
    try {
        await apiFetch(`/api/v1/badges/${id}`, { method: 'DELETE' });
        await loadBadgesAdmin();
        await loadUsers();
        showMsg('Badge deleted.');
    } catch (err) {
        showMsg(err.message || 'Failed to delete badge');
    }
}

function populateBadgesCheckboxes(containerId, userBadges) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = globalBadgesCache.map(badge => `
        <label class="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
          <input type="checkbox" value="${escapeHtml(badge.name)}" class="w-4 h-4" ${userBadges.includes(badge.name) ? 'checked' : ''}> <span class="text-sm">${escapeHtml(badge.name)}</span>
        </label>
    `).join('');
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
            userList.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#fff;">No users found.</td></tr>';
            return;
        }

        const currentUser = getStoredUser();
        const currentUserId = currentUser ? (currentUser._id || currentUser.id) : null;
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

            const statusColors = {
                approved: 'bg-green-500/20 text-green-400 border-green-500/30',
                pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                rejected: 'bg-destructive/20 text-destructive border-destructive/30',
                banned: 'bg-white/10 text-white/50 border-white/20'
            };

            return `
            <tr class="hover:bg-white/5 transition-colors">
                <td class="p-3 text-white/90 border-t border-white/5">${escapeHtml(user.email)}</td>
                <td class="p-3 border-t border-white/5"><span class="px-2 py-0.5 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-primary/20 text-primary-400 border border-primary/30' : 'bg-white/10 text-white/70'} capitalize">${user.role}</span></td>
                <td class="p-3 border-t border-white/5"><span class="px-2 py-0.5 rounded text-xs font-medium border capitalize ${statusColors[user.status] || statusColors.pending}">${escapeHtml(user.status)}</span></td>
                <td class="p-3 text-right border-t border-white/5">${actionsHtml.replace(/btn-primary/g, 'px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors text-white mr-2').replace(/btn-delete/g, 'px-3 py-1 bg-destructive/80 hover:bg-destructive rounded text-xs transition-colors text-white')}</td>
            </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading users:', err);
        userList.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#fff;">Unable to load users.</td></tr>';
    }
}

function editUser(userId) {
    // ✅ STRICT CHECK: Exit if no userId or userId is "undefined"/"null"
    if (!userId || userId === 'undefined' || userId === 'null') {
        console.warn('editUser blocked: Invalid userId:', userId);
        return;
    }

    const userToEdit = usersCache.find(u => u._id === userId);
    if (!userToEdit) {
        console.warn('editUser blocked: User not found:', userId);
        return;
    }

    const currentUser = getStoredUser();
    const isSelf = (currentUser && (currentUser._id === userId || currentUser.id === userId));
    const isSystemAdmin = (currentUser && currentUser.email === 'admin@miuegypt.edu.eg');

    if (!isSelf && userToEdit.role === 'admin' && !isSystemAdmin) {
        alert("You cannot edit other admins' information.");
        return;
    }

    if (isSelf) {
        document.getElementById('edit-self-original-email').value = userToEdit.email;
        document.getElementById('edit-self-name').value = userToEdit.name || '';
        document.getElementById('edit-self-email').value = userToEdit.email;
        document.getElementById('edit-self-pass').value = '';
        document.getElementById('edit-self-uid').value = userToEdit.universityId || '';
        
        const userBadges = userToEdit.badges || [];
        populateBadgesCheckboxes('edit-self-badges', userBadges);
        
        const oldPassContainer = document.getElementById('edit-self-old-pass-container');
        const oldPassInput = document.getElementById('edit-self-old-pass');
        if (oldPassContainer && oldPassInput) {
            oldPassInput.value = '';
            // Always require old password to save changes for security
            oldPassContainer.style.display = 'block';
            oldPassInput.required = true;
        }

        openModal('editSelfModal');
        return;
    }

    // Fill form fields for other users
    document.getElementById('edit-original-email').value = userToEdit.email;
    document.getElementById('edit-user-name').value = userToEdit.name || '';
    document.getElementById('edit-user-email').value = userToEdit.email;
    document.getElementById('edit-user-pass').value = '';
    document.getElementById('edit-user-uid').value = userToEdit.universityId || '';
    
    const roleSelect = document.getElementById('edit-user-role');
    roleSelect.value = userToEdit.role || 'member';
    
    // Fill badges
    const userBadges = userToEdit.badges || [];
    populateBadgesCheckboxes('edit-user-badges', userBadges);
    
    openModal('editUserModal');
}

function closeEditUserModal() {
    closeModal('editUserModal');
    document.getElementById('editUserForm')?.reset();
}

function closeEditSelfModal() {
    closeModal('editSelfModal');
    document.getElementById('editSelfForm')?.reset();
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

async function saveSelfEdit(event) {
    event.preventDefault();
    
    const originalEmail = document.getElementById('edit-self-original-email').value;
    const newName = document.getElementById('edit-self-name').value.trim();
    const newEmail = document.getElementById('edit-self-email').value.trim();
    const newPass = document.getElementById('edit-self-pass').value;
    const newUid = document.getElementById('edit-self-uid').value.trim();
    const oldPassword = document.getElementById('edit-self-old-pass') ? document.getElementById('edit-self-old-pass').value : '';
    
    const badgeCheckboxes = document.querySelectorAll('#edit-self-badges input[type="checkbox"]:checked');
    const newBadges = Array.from(badgeCheckboxes).map(cb => cb.value);
    
    const user = usersCache.find(u => u.email === originalEmail);
    if (!user) return;

    // Enforce old password requirement
    if (!oldPassword) {
        showMsg('Please enter your current password to save changes.');
        const oldPassInput = document.getElementById('edit-self-old-pass');
        if (oldPassInput) {
            oldPassInput.focus();
            oldPassInput.style.borderColor = '#ff6b6b';
            setTimeout(() => oldPassInput.style.borderColor = '', 3000);
        }
        return;
    }

    try {
        await apiFetch(`/api/v1/users/${user._id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                name: newName,
                email: newEmail,
                password: newPass || undefined,
                oldPassword: oldPassword || undefined,
                universityId: newUid,
                badges: newBadges
                // Role is strictly omitted
            })
        });

        closeEditSelfModal();
        await loadUsers();
        
        // Keep the stored session in sync with the edited profile
        saveAuth(localStorage.getItem('token'), { ...getStoredUser(), name: newName, email: newEmail, universityId: newUid });
        
        showMsg('Your profile updated successfully.');
    } catch (err) {
        showMsg(err.message || 'Unable to update profile.');
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
            <div class="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/10 mb-3 hover:bg-black/30 transition-colors">
                <div class="flex items-center gap-4">
                    <img src="${escapeHtml(member.image)}" alt="${escapeHtml(member.name)}" class="w-12 h-12 rounded-full object-cover border-2 border-white/10">
                    <div>
                        <h4 class="font-bold text-lg text-white mb-0.5 leading-tight">${escapeHtml(member.name)}</h4>
                        <p class="text-sm text-primary-400 text-primary font-medium m-0">${escapeHtml(member.position)}</p>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="editBoardMember('${member._id}')" class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-sm font-medium transition-colors">Edit</button>
                    <button onclick="deleteBoardMember('${member._id}')" class="px-3 py-1.5 bg-destructive/80 hover:bg-destructive text-white rounded text-sm font-medium transition-colors">Delete</button>
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
    openModal('boardMemberModal');
}

function closeBoardMemberModal() {
    closeModal('boardMemberModal');
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
    document.getElementById('board-member-order').value = member.order || 0;
    
    openModal('boardMemberModal');
}

async function saveBoardMember(event) {
    event.preventDefault();
    
    const id = document.getElementById('board-member-id').value;
    
    const formData = new FormData();
    formData.append('name', document.getElementById('board-member-name').value.trim());
    formData.append('position', document.getElementById('board-member-position').value.trim());
    formData.append('image', document.getElementById('board-member-image').value.trim() || '/images/Default-pfp.png');
    formData.append('order', parseInt(document.getElementById('board-member-order').value) || 0);

    const fileInput = document.getElementById('board-member-file');
    if (fileInput && fileInput.files[0]) {
        formData.append('imageFile', fileInput.files[0]);
    }

    try {
        const url = id ? `/api/v1/board/${id}` : '/api/v1/board';
        const method = id ? 'PUT' : 'POST';
        
        await apiFetch(url, { method, body: formData });

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

// ─── INITIALIZATION (Runs once on page load) ─────────────────────────────────
if (requireLogin('admin')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Independent sections load in parallel; each handles its own errors
        loadApplications();
        updateRoomStatusDisplay();
        loadBoardMembers();
        loadCoursesAdmin();
        loadGalleryAdmin();
        // Users need the badge list to render their badge checkboxes
        loadBadgesAdmin().then(loadUsers);
    });
}
