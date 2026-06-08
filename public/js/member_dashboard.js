
// API Fetch Helper
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

const student = {
    name: "Member",
    universityId: "MIU000"
};


async function loadCourses() {
    const container = document.getElementById("coursesList");
    if (!container) return;

    try {
        const response = await apiFetch('/api/v1/courses');
        const courses = response.data || [];
        
        container.innerHTML = "";

        if (courses.length === 0) {
            container.innerHTML = '<p class="text-white/60 text-sm">No courses available.</p>';
            return;
        }

        const userJson = localStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;
        const openedCourses = user?.openedCourses || [];

        // Only show courses that the user has already opened
        const enrolledCourses = courses.filter(course => openedCourses.includes(course._id));

        if (enrolledCourses.length === 0) {
            container.innerHTML = '<p class="text-white/60 text-sm">You haven\'t started any courses yet. Browse the Courses page to get started!</p>';
            return;
        }

        enrolledCourses.forEach(course => {
            const div = document.createElement("div");
            div.className = "flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors p-3 mb-2 rounded-lg bg-black/20 border border-white/10";
            
            div.innerHTML = `
                <div>
                    <h4 class="font-bold text-white mb-0.5">${course.title}</h4>
                    <p class="text-xs text-white/60">${course.instructor}</p>
                </div>
                <div><span class="text-xs font-medium px-2 py-1 bg-green-500/20 text-green-400 rounded border border-green-500/30">✓ Opened</span></div>
            `;
            
            div.onclick = () => openCourse(course._id, course.youtubeVideoId);
            container.appendChild(div);
        });
    } catch (err) {
        container.innerHTML = '<p class="text-white/60 text-sm">Failed to load courses.</p>';
    }
}

async function openCourse(courseId, youtubeId) {
    const userJson = localStorage.getItem('user');
    if (!userJson) return;
    const user = JSON.parse(userJson);
    const openedCourses = user.openedCourses || [];

    // If not already opened, update backend and local storage
    if (!openedCourses.includes(courseId)) {
        openedCourses.push(courseId);
        user.openedCourses = openedCourses;
        localStorage.setItem('user', JSON.stringify(user));
        
        try {
            await apiFetch(`/api/v1/users/${user._id || user.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ openedCourses })
            });
            // Reload UI to show checkmark
            loadCourses();
        } catch (err) {
            console.error('Failed to update opened courses', err);
        }
    }
    
    // Open the youtube link (or handle however courses are opened)
    if (youtubeId) {
        window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank');
    }
}


async function loadProfile() {
    const container = document.getElementById("profileData");
    if (!container) return;

    // Load from local storage initially for instant UI
    renderProfileData(container);

    // Fetch latest from backend to sync badges and other data
    try {
        const response = await apiFetch('/api/v1/auth/me');
        if (response.success && response.user) {
            const updatedUser = {
                id: response.user._id,
                name: response.user.name,
                email: response.user.email,
                role: response.user.role,
                status: response.user.status,
                universityId: response.user.universityId,
                avatar: response.user.avatar,
                badges: response.user.badges,
                openedCourses: response.user.openedCourses
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            

            // Re-render UI with latest data
            renderProfileData(container);
            
            // Also refresh welcome title since name might have changed
            loadWelcome();
        }
    } catch (err) {
        console.error("Failed to sync profile:", err);
    }
}

function renderProfileData(container) {
    container.innerHTML = "";

    const userJson = localStorage.getItem('user');
    let uName = student.name;
    let uid = student.universityId;
    let uBadges = [];
    
    if (userJson) {
        const user = JSON.parse(userJson);
        uName = user.name || uName;
        uid = user.universityId || uid;
        uBadges = user.badges || [];
    }

    const pName = document.createElement("p");
    pName.textContent = `Name: ${uName}`;
    container.appendChild(pName);
    
    const pUid = document.createElement("p");
    pUid.textContent = `University ID: ${uid}`;
    container.appendChild(pUid);
    
    const pBadgesLabel = document.createElement("p");
    pBadgesLabel.textContent = "My Badges";
    pBadgesLabel.className = "text-sm font-semibold tracking-wide uppercase text-white/80 mt-4 mb-2";
    container.appendChild(pBadgesLabel);
    
    const badgesDiv = document.createElement("div");
    badgesDiv.className = "badges-container";
    
    if (uBadges.length > 0) {
        uBadges.forEach(badge => {
            const span = document.createElement("span");
            span.className = "badge-pill";
            span.innerHTML = badge; // in case badge has icons
            badgesDiv.appendChild(span);
        });
    } else {
        const pNone = document.createElement("p");
        pNone.textContent = "No badges earned yet.";
        pNone.className = "text-sm text-white/50 italic";
        badgesDiv.appendChild(pNone);
    }
    
    container.appendChild(badgesDiv);
}

// Profile Editing Logic
function openEditProfile() {
    const userJson = localStorage.getItem('user');
    if (!userJson) return;
    const user = JSON.parse(userJson);
    
    document.getElementById('edit-name').value = user.name || student.name;
    document.getElementById('edit-email').value = user.email || '';
    document.getElementById('edit-old-pass').value = '';
    document.getElementById('edit-pass').value = '';
    document.getElementById('edit-uid').value = user.universityId || student.universityId;
    
    const el = document.getElementById('editProfileModal');
    if(el) {
        el.classList.remove('hidden');
        el.style.display = 'flex';
    }
}

function closeEditProfile() {
    const el = document.getElementById('editProfileModal');
    if(el) {
        el.classList.add('hidden');
        el.style.display = 'none';
    }
}

function togglePasswordVisibility() {
    const passInput = document.getElementById('edit-pass');
    const toggleBtn = document.getElementById('toggle-pass-btn');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        toggleBtn.textContent = 'Hide';
    } else {
        passInput.type = 'password';
        toggleBtn.textContent = 'Show';
    }
}

async function saveProfile(event) {
    event.preventDefault();
    
    const userJson = localStorage.getItem('user');
    if (!userJson) return;
    const user = JSON.parse(userJson);
    
    const newName = document.getElementById('edit-name').value;
    const newEmail = document.getElementById('edit-email').value;
    const newUid = document.getElementById('edit-uid').value;
    const oldPassword = document.getElementById('edit-old-pass').value;
    const newPass = document.getElementById('edit-pass').value;
    
    try {
        await apiFetch(`/api/v1/users/${user._id || user.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name: newName, email: newEmail, universityId: newUid, oldPassword: oldPassword || undefined, password: newPass || undefined })
        });
        
        user.name = newName;
        user.email = newEmail;
        user.universityId = newUid;
        
        localStorage.setItem('user', JSON.stringify(user));
        
        closeEditProfile();
        loadProfile();
        loadWelcome();
        alert('Profile updated successfully!');
    } catch (err) {
        alert('Failed to update profile: ' + err.message);
    }
}

// ✅ NEW: Load room status from database
async function loadRoomStatusFromDB() {
    const statusSpan = document.getElementById("currentRoomStatus");
    if (!statusSpan) return;
    
    try {
        const response = await apiFetch('/api/v1/room');
        const roomStatus = response.data?.status || "Closed";
        
        statusSpan.textContent = roomStatus;
        statusSpan.className = '';
        
        if (roomStatus === "Open") {
            statusSpan.classList.add("status-available");
        } else {
            statusSpan.classList.add("status-occupied");
        }
    } catch (err) {
        console.error('Failed to load room status:', err);
        statusSpan.textContent = "Unknown";
        statusSpan.className = "status-occupied";
    }
}

// Removed room booking request functions

function loadWelcome() {
    const welcomeTitle = document.getElementById("welcomeTitle");
    if (welcomeTitle) {
        const userJson = localStorage.getItem('user');
        if (userJson) {
            const user = JSON.parse(userJson);
            welcomeTitle.textContent = `Welcome back, ${user.email.split('@')[0]}!`;
        } else {
            welcomeTitle.textContent = `Welcome back, ${student.name}!`;
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    loadWelcome();
    loadCourses();
    loadProfile();
    loadRoomStatusFromDB();
});

// Auto-hide navbar on scroll
(function() {
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        let navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            navbar.classList.add('-translate-y-full');
        } else {
            navbar.classList.remove('-translate-y-full');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);
})();

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

document.addEventListener('DOMContentLoaded', updateNavAuth);