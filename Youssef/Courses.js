let courses = JSON.parse(localStorage.getItem("courses")) || [
  {
    id: 1,
    title: "Intro to Music Theory",
    desc: "Learn notes, rhythm, and scales.",
    img: "music.png"
  },
  {
    id: 2,
    title: "Chord Progressions",
    desc: "Understand how chords work together.",
    img: "chord.webp"
  }
];

let currentUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;
let role = currentUser ? currentUser.role : "guest";

function save() {
  localStorage.setItem("courses", JSON.stringify(courses));
}

function render() {
  let div = document.getElementById("courses");
  if (!div) return;
  div.innerHTML = "";

  const adminPanel = document.getElementById("adminPanel");
  if (adminPanel) {
    adminPanel.classList.toggle("hidden", role !== "admin");
  }

  courses.forEach(c => {
    let el = document.createElement("div");
    el.className = "course-card";

    el.innerHTML = `
      <img src="${c.img}">
      <h3>${c.title}</h3>
      <p>${c.desc}</p>
      <button onclick="preview()">Preview</button>
      ${role === "member" ? `<button onclick="openCourse()">Open</button>` : ""}
      ${role === "admin" ? `<button onclick="deleteCourse(${c.id})">Delete</button>` : ""}
    `;

    div.appendChild(el);
  });
}

function preview() {
  if (role === "guest") {
    alert("Register to access full courses.");
  } else {
    alert("Preview lesson coming soon.");
  }
}

function openCourse() {
  alert("Full course content (videos, PDFs) coming soon.");
}

function addCourse() {
  let title = document.getElementById("title").value;
  let desc = document.getElementById("desc").value;
  let img = document.getElementById("img").value || "https://via.placeholder.com/250";

  if (title && desc) {
    courses.push({
      id: Date.now(),
      title,
      desc,
      img
    });

    save();
    render();
  }
}

function deleteCourse(id) {
  courses = courses.filter(c => c.id !== id);
  save();
  render();
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
        currentUser = user;
        role = user.role;
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
        currentUser = null;
        role = "guest";
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (applyLink && applyLink.parentElement) applyLink.parentElement.style.display = 'inline-block';
        if (dashboardLi) {
            dashboardLi.style.display = 'none';
        }
    }
    render();
}

function globalLogout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = '../Mohamed/index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavAuth();
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
