const student = {
    name: "Farah",
    universityId: "MIU123"
};

const courses = [
    { title: "Music Theory Basics", instructor: "Dr. Ahmed", progress: 75 },
    { title: "Advanced Composition", instructor: "Ms. Sara", progress: 40 }
];

const profile = {
    xp: 1200,
    badges: 5,
    level: 3
};


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

    const info = [
        `Name: ${student.name}`,
        `University ID: ${student.universityId}`,
        `XP: ${profile.xp}`,
        `Badges: ${profile.badges}`,
        `Level: ${profile.level}`
    ];

    info.forEach(text => {
        const p = document.createElement("p");
        p.textContent = text;
        container.appendChild(p);
    });
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
    }
}

function globalLogout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = '../Mohamed/index.html';
}

document.addEventListener('DOMContentLoaded', updateNavAuth);
