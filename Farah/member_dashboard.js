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


let bookings = [];

function loadBookings() {
    const container = document.getElementById("bookingsList");
    if (!container) return;

    container.innerHTML = "";

    if (bookings.length === 0) {
        container.textContent = "No room bookings yet.";
        return;
    }

    bookings.forEach(b => {
        const div = document.createElement("div");
        div.textContent = `${b.date} at ${b.time} for ${b.duration}h - ${b.purpose}`;
        container.appendChild(div);
    });
}

const showFormBtn = document.getElementById("showBookingFormBtn");
const roomRequestDiv = document.getElementById("roomRequest");

if (showFormBtn && roomRequestDiv) {
    showFormBtn.addEventListener("click", function () {
        roomRequestDiv.style.display = roomRequestDiv.style.display === "none" ? "block" : "none";
    });
}

const form = document.getElementById("bookingForm");

if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const date = document.getElementById("bookingDate").value;
        const time = document.getElementById("bookingTime").value;
        const duration = document.getElementById("bookingDuration").value;
        const purpose = document.getElementById("bookingPurpose").value;

        if (!date || !time || !duration || !purpose) {
            alert("Please fill all fields.");
            return;
        }

        const booking = { date, time, duration, purpose };
        bookings.push(booking);
        
        loadBookings();

        alert("Booking submitted.");
        form.reset();
        roomRequestDiv.style.display = "none";
    });
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
    loadBookings();
});