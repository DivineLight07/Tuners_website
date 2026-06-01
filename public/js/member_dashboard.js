const student = {
    name: "Farah",
    universityId: "MIU123"
};

const courses = [
    { title: "Music Theory Basics", instructor: "Dr. Ahmed", progress: 75 },
    { title: "Advanced Composition", instructor: "Ms. Sara", progress: 40 }
];


function loadCourses() {
    const container = document.getElementById("coursesList");
    if (!container) return;

    container.innerHTML = "";

    if (courses.length === 0) {
        container.textContent = "No courses enrolled.";
        return;
    }

    courses.forEach(course => {
        const div = document.createElement("div");
        div.textContent = `${course.title} - ${course.instructor} (${course.progress}%)`;
        container.appendChild(div);
    });
}


function loadProfile() {
    const container = document.getElementById("profileData");
    if (!container) return;

    container.innerHTML = "";

    const userJson = localStorage.getItem('loggedInUser');
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
    
    const badgesDiv = document.createElement("div");
    badgesDiv.className = "badges-container";
    
    const pBadgesLabel = document.createElement("p");
    pBadgesLabel.textContent = "My Badges:";
    pBadgesLabel.style.fontWeight = "bold";
    pBadgesLabel.style.marginTop = "15px";
    pBadgesLabel.style.marginBottom = "8px";
    badgesDiv.appendChild(pBadgesLabel);
    
    if (uBadges.length > 0) {
        uBadges.forEach(badge => {
            const span = document.createElement("span");
            span.className = "badge-pill";
            span.textContent = badge;
            badgesDiv.appendChild(span);
        });
    } else {
        const pNone = document.createElement("p");
        pNone.textContent = "No badges earned yet.";
        pNone.style.fontSize = "0.9rem";
        pNone.style.color = "rgba(255,255,255,0.7)";
        badgesDiv.appendChild(pNone);
    }
    
    container.appendChild(badgesDiv);
}

// Profile Editing Logic
function openEditProfile() {
    const userJson = localStorage.getItem('loggedInUser');
    if (!userJson) return;
    const user = JSON.parse(userJson);
    
    document.getElementById('edit-name').value = user.name || student.name;
    document.getElementById('edit-email').value = user.email || '';
    document.getElementById('edit-old-pass').value = '';
    document.getElementById('edit-pass').value = user.password || '';
    document.getElementById('edit-uid').value = user.universityId || student.universityId;
    
    document.getElementById('profileData').style.display = 'none';
    document.getElementById('editProfileBtn').style.display = 'none';
    document.getElementById('inlineEditProfile').style.display = 'block';
}

function closeEditProfile() {
    document.getElementById('profileData').style.display = 'block';
    document.getElementById('editProfileBtn').style.display = 'inline-block';
    document.getElementById('inlineEditProfile').style.display = 'none';
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

function saveProfile(event) {
    event.preventDefault();
    
    const userJson = localStorage.getItem('loggedInUser');
    if (!userJson) return;
    const user = JSON.parse(userJson);
    const originalEmail = user.email;
    
    const oldPass = document.getElementById('edit-old-pass').value;
    if (oldPass !== user.password) {
        alert('Incorrect old password. Changes not saved.');
        return;
    }
    
    const newName = document.getElementById('edit-name').value;
    const newEmail = document.getElementById('edit-email').value;
    const newPass = document.getElementById('edit-pass').value;
    const newUid = document.getElementById('edit-uid').value;
    
    user.name = newName;
    user.email = newEmail;
    user.password = newPass;
    user.universityId = newUid;
    
    // Update loggedInUser
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    
    // Update main users array
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === originalEmail);
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...user };
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    closeEditProfile();
    loadProfile();
    loadWelcome();
    alert('Profile updated successfully!');
}



let currentRoomStatus = localStorage.getItem('roomStatus') || "Available";
let pendingRequest = JSON.parse(localStorage.getItem('pendingRequest')) || null;

function updateRoomStatusUI() {
    currentRoomStatus = localStorage.getItem('roomStatus') || "Open";
    const statusSpan = document.getElementById("currentRoomStatus");
    if (!statusSpan) return;
    
    statusSpan.textContent = currentRoomStatus;
    statusSpan.className = '';
    
    if (currentRoomStatus === "Open") {
        statusSpan.classList.add("status-available");
    } else {
        statusSpan.classList.add("status-occupied");
    }
}

function loadMemberRequestUI() {
    const container = document.getElementById("bookingsList");
    const requestBtn = document.getElementById("requestRoomBtn");
    if (!container || !requestBtn) return;

    if (!pendingRequest) {
        container.innerHTML = "<p>No active room requests.</p>";
        requestBtn.style.display = "block";
    } else {
        let statusClass = pendingRequest.status === "Approved" ? "status-available" : "status-occupied";
        container.innerHTML = `
            <div class="request-card">
                <strong>My Request Status:</strong> <span class="request-status-text ${statusClass}">${pendingRequest.status}</span>
                <p class="request-time">Requested at: ${pendingRequest.time}</p>
            </div>
        `;
        requestBtn.style.display = "none";
    }
}



function setupRoomBooking() {
    const requestBtn = document.getElementById("requestRoomBtn");
    if (requestBtn) {
        requestBtn.addEventListener("click", () => {
            currentRoomStatus = localStorage.getItem('roomStatus') || "Open";
            if (currentRoomStatus !== "Open") {
                alert("Room is currently " + currentRoomStatus + ". You cannot request it right now.");
                return;
            }
            
            pendingRequest = {
                member: student.name,
                time: new Date().toLocaleTimeString(),
                status: "Pending"
            };
            
            localStorage.setItem('pendingRequest', JSON.stringify(pendingRequest));
            alert("Room requested successfully!");
            loadMemberRequestUI();
        });
    }
}


function loadWelcome() {
    const welcomeTitle = document.getElementById("welcomeTitle");
    if (welcomeTitle) {
        const userJson = localStorage.getItem('loggedInUser');
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
    updateRoomStatusUI();
    loadMemberRequestUI();
    setupRoomBooking();
    
    // Listen for storage changes to update room status in real-time if multiple tabs are open
    window.addEventListener('storage', (e) => {
        if (e.key === 'roomStatus') {
            updateRoomStatusUI();
        }
    });
});

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

// Global Authentication Logic
function updateNavAuth() {
    const userJson = localStorage.getItem('loggedInUser');
    const loginBtn = document.getElementById('nav-login-btn');
    const logoutBtn = document.getElementById('nav-logout-btn');
    const dashboardLi = document.getElementById('nav-dashboard');
    const dashboardLink = document.getElementById('nav-dashboard-link');
    const applyLink = document.querySelector('nav ul li a[href*="tuners.ejs"]');

    if (userJson) {
        const user = JSON.parse(userJson);
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (applyLink && applyLink.parentElement) applyLink.parentElement.style.display = 'none';
        if (dashboardLi && dashboardLink) {
            dashboardLi.style.display = 'inline-block';
            if (user.role === 'admin') {
                dashboardLink.href = '../Nour/Admin_Dashboard.ejs';
            } else {
                dashboardLink.href = '../Farah/member_dashboard.ejs';
            }
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (applyLink && applyLink.parentElement) applyLink.parentElement.style.display = 'inline-block';
        if (dashboardLi) {
            dashboardLi.style.display = 'none';
        }
    }
}

function globalLogout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = '../Mohamed/index.ejs';
}

document.addEventListener('DOMContentLoaded', updateNavAuth);
