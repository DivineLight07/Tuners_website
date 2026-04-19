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


let currentRoomStatus = "Available";
let pendingRequest = null;

function updateRoomStatusUI() {
    const statusSpan = document.getElementById("currentRoomStatus");
    if (!statusSpan) return;
    
    statusSpan.textContent = currentRoomStatus;
    statusSpan.className = '';
    
    if (currentRoomStatus === "Available") {
        statusSpan.classList.add("status-available");
    } else if (currentRoomStatus === "Occupied") {
        statusSpan.classList.add("status-occupied");
    } else {
        statusSpan.classList.add("status-maintenance");
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
        let statusClass = pendingRequest.status === "Approved" ? "status-available" : (pendingRequest.status === "Rejected" ? "status-occupied" : "status-maintenance");
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
            if (currentRoomStatus !== "Available") {
                alert("Room is currently " + currentRoomStatus + ". You cannot request it right now.");
                return;
            }
            
            pendingRequest = {
                member: student.name,
                time: new Date().toLocaleTimeString(),
                status: "Pending"
            };
            
            alert("Room requested successfully!");
            loadMemberRequestUI();
        });
    }
}


const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        if (confirm("Logout?")) {
            window.location.href = "home_page.html";
        }
    });
}


function loadWelcome() {
    const welcomeTitle = document.getElementById("welcomeTitle");
    if (welcomeTitle) {
        welcomeTitle.textContent = `Welcome back, ${student.name}!`;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    loadWelcome();
    loadCourses();
    loadProfile();
    updateRoomStatusUI();
    loadMemberRequestUI();
    setupRoomBooking();
});