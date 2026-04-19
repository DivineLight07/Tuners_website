let role = localStorage.getItem("role") || "guest";

let courses = JSON.parse(localStorage.getItem("courses")) || [
  {
    id: 1,
    title: "Intro to Music Theory",
    desc: "Learn notes, rhythm, and scales.",
    img: "https://via.placeholder.com/250"
  },
  {
    id: 2,
    title: "Chord Progressions",
    desc: "Understand how chords work together.",
    img: "https://via.placeholder.com/250"
  }
];

function save() {
  localStorage.setItem("courses", JSON.stringify(courses));
}

function setRole(r) {
  role = r;
  localStorage.setItem("role", role);
  render();
}

function render() {
  let div = document.getElementById("courses");
  div.innerHTML = "";

  document.getElementById("adminPanel").classList.toggle("hidden", role !== "admin");

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

render();