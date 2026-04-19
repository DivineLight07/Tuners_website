// Data Loaders
function loadApplications() {
    const appsList = document.getElementById('applications-list');
    if (!appsList) return;

    const apps = JSON.parse(localStorage.getItem('applications') || '[]');
    
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
            <p><strong>Date:</strong> ${app.date}</p>
            <div class="reason"><strong>Reason for joining:</strong><br>${app.reason}</div>
            <button onclick="deleteApp(${app.id})" class="btn-delete" style="margin-top:15px; width:100%">Delete Application</button>
        </div>
    `).join('');
}

function deleteApp(id) {
    if (!confirm('Are you sure you want to delete this application?')) return;
    let apps = JSON.parse(localStorage.getItem('applications') || '[]');
    apps = apps.filter(a => a.id !== id);
    localStorage.setItem('applications', JSON.stringify(apps));
    loadApplications();
    showMsg('Application deleted.');
}

function loadUsers() {
    const userList = document.getElementById('user-list');
    if (!userList) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    userList.innerHTML = users.map(user => `
        <tr>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                ${user.email !== 'admin@miuegypt.edu.eg' ? `<button onclick="deleteUser('${user.email}')" class="btn-delete">Delete</button>` : 'System'}
            </td>
        </tr>
    `).join('');
}

function addUser() {
    const email = document.getElementById('new-user-email').value.trim();
    const pass = document.getElementById('new-user-pass').value.trim();
    const role = document.getElementById('new-user-role').value;

    if (!email || !pass) {
        showMsg('Please fill all fields.');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        showMsg('User already exists.');
        return;
    }

    users.push({ email, password: pass, role });
    localStorage.setItem('users', JSON.stringify(users));
    
    document.getElementById('new-user-email').value = '';
    document.getElementById('new-user-pass').value = '';
    
    loadUsers();
    showMsg('User account created!');
}

function deleteUser(email) {
    if (!confirm('Delete this account?')) return;
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users = users.filter(u => u.email !== email);
    localStorage.setItem('users', JSON.stringify(users));
    loadUsers();
    showMsg('User deleted.');
}

function updateRoomStatusDisplay() {
    const status = localStorage.getItem('roomStatus') || "Open";
    const statusSpan = document.getElementById('adminRoomStatus');
    if (!statusSpan) return;

    statusSpan.textContent = status;
    statusSpan.className = '';
    if (status === 'Open') {
        statusSpan.classList.add('status-available');
    } else {
        statusSpan.classList.add('status-occupied');
    }
}

function setRoomStatus(status) {
    localStorage.setItem('roomStatus', status);
    updateRoomStatusDisplay();
    showMsg('Room status updated to ' + status);
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
    const userJson = localStorage.getItem('loggedInUser');
    const loginBtn = document.getElementById('nav-login-btn');
    const logoutBtn = document.getElementById('nav-logout-btn');
    const dashboardLi = document.getElementById('nav-dashboard');
    const dashboardLink = document.getElementById('nav-dashboard-link');
    const applyLink = document.querySelector('nav ul li a[href*="tuners.html"]');

    if (userJson) {
        const user = JSON.parse(userJson);
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (applyLink && applyLink.parentElement) applyLink.parentElement.style.display = 'none';
        if (dashboardLi && dashboardLink) {
            dashboardLi.style.display = 'inline-block';
            if (user.role === 'admin') {
                dashboardLink.href = '../Nour/Admin_Dashboard.html';
            } else {
                dashboardLink.href = '../Farah/member_dashboard.html';
            }
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (applyLink && applyLink.parentElement) applyLink.parentElement.style.display = 'inline-block';
        if (dashboardLi) {
            dashboardLi.style.display = 'none';
        }
        // If not logged in as admin, redirect to login
        window.location.href = '../Mohamed/index.html';
    }
}

function globalLogout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = '../Mohamed/index.html';
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

document.addEventListener('DOMContentLoaded', () => {
    updateNavAuth();
    loadApplications();
    loadUsers();
    updateRoomStatusDisplay();
});
