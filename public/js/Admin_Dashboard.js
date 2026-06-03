let usersCache = [];

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

// Data Loaders
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

async function loadUsers() {
    const userList = document.getElementById('user-list');
    if (!userList) return;

    try {
        const users = await apiFetch('/api/v1/users');
        usersCache = users;


        if (usersCache.length === 0) {
            userList.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#fff;">No users found.</td></tr>';
            return;
        }

        userList.innerHTML = usersCache.map(user => `
            <tr>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button onclick="editUser('${user._id}')" class="btn-primary" style="padding: 5px 10px; font-size: 0.8rem; margin-right: 5px;">Edit</button>
                    ${user.email !== 'admin@miuegypt.edu.eg' ? `<button onclick="deleteUser('${user._id}')" class="btn-delete">Delete</button>` : '<span style="font-size:0.8rem;color:#888;">System</span>'}
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        userList.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#fff;">Unable to load users.</td></tr>';
    }
}

function editUser(userId) {
    const user = usersCache.find(u => u._id === userId);
    if (!user) return;

    document.getElementById('edit-original-email').value = user.email;
    document.getElementById('edit-user-name').value = user.name || '';
    document.getElementById('edit-user-email').value = user.email;
    document.getElementById('edit-user-pass').value = '';
    document.getElementById('edit-user-role').value = user.role;
    document.getElementById('edit-user-uid').value = user.universityId || '';
    
    const badgeCheckboxes = document.querySelectorAll('#edit-user-badges input[type="checkbox"]');
    const userBadges = user.badges || [];
    badgeCheckboxes.forEach(cb => {
        cb.checked = userBadges.includes(cb.value);
    });
    
    document.getElementById('editUserModal').style.display = 'block';
}

function closeEditUserModal() {
    document.getElementById('editUserModal').style.display = 'none';
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
  const phone = document.getElementById('new-user-phone').value.trim(); // ✅ add this field
  const role = document.getElementById('new-user-role').value;
  const pass = document.getElementById('new-user-password').value.trim();
  const uid = document.getElementById('new-user-universityId').value.trim();


  if (!name || !email || !phone || !role) {
    showMsg('Please fill all fields.');
    return;
  }

  try {
    await apiFetch('/api/v1/users/add', { // ✅ match backend route
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass, universityId: uid, role }),
    });

    // clear form
    document.getElementById('new-user-name').value = '';
    document.getElementById('new-user-email').value = '';
    document.getElementById('new-user-phone').value = '';
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
        await apiFetch(`/api/v1/users/${userId}`, {
            method: 'DELETE'
        });
        await loadUsers();
        showMsg('User deleted.');
    } catch (err) {
        showMsg(err.message || 'Failed to delete user.');
    }
}

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
        showMsg('Failed to update room status.');
    }
}

function showMsg(message) {
    const Msg = document.getElementById('Msg');
    if (Msg) {
        Msg.textContent = message;
        Msg.style.display = 'block';
        setTimeout(() => Msg.style.display = 'none', 3000);
    }
}

// Global Authentication Logic
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
            if (user.role === 'admin') {
                dashboardLink.href = '/admin';
            } else {
                dashboardLink.href = '/member';
            }
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (applyLink && applyLink.parentElement) applyLink.parentElement.style.display = 'inline-block';
        if (dashboardLi) {
            dashboardLi.style.display = 'none';
        }
        window.location.href = '/login';
    }
}

function globalLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// Auto-hide navbar on scroll
(function() {
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        let navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);
})();

document.addEventListener('DOMContentLoaded', async () => {
    updateNavAuth();
    await loadApplications();
    await loadUsers();
    await updateRoomStatusDisplay();  // was sync, now async
});