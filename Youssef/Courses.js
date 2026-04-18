let courses = JSON.parse(localStorage.getItem("courses")) || [
  { id: 1, title: "Intro to Music Theory", desc: "Basics of music" }
];

function saveCourses() {
  localStorage.setItem("courses", JSON.stringify(courses));
}

function render() {
  let div = document.getElementById("courses");
  div.innerHTML = "";

  courses.forEach(c => {
    let el = document.createElement("div");

    el.innerHTML = `
      <h3>${c.title}</h3>
      <p>${c.desc}</p>
      <button onclick="preview()">Preview</button>
      <button onclick="deleteCourse(${c.id})">Delete</button>
    `;

    div.appendChild(el);
  });
}

function preview() {
  alert("Register as a member to access full courses.");
}

function addCourse() {
  let title = document.getElementById("title").value;
  let desc = document.getElementById("desc").value;

  if (title && desc) {
    courses.push({
      id: Date.now(),
      title,
      desc
    });

    saveCourses();
    render();
  }
}

function deleteCourse(id) {
  courses = courses.filter(c => c.id !== id);
  saveCourses();
  render();
}

render();