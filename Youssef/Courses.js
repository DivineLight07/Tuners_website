let role = "guest";

let courses = [
    { id: 1, title: "Intro to Music Theory", desc: "Basics of music." },
    { id: 2, title: "Scales & Chords", desc: "Learn scales and chords." }
];

function setRole(r) {
    role = r;
    updateView();
}

function updateView() {
    document.getElementById("memberView").hidden = true;
    document.getElementById("adminView").hidden = true;

    if (role === "member" || role === "admin") {
        document.getElementById("memberView").hidden = false;
    }

    if (role === "admin") {
        document.getElementById("adminView").hidden = false;
    }

    loadcourses();
}

function loadcourses() {
    let pub = document.getElementById("publicCourses");
    let mem = document.getElementById("memberCourses");

    pub.innerHTML = "";
    mem.innerHTML = "";

    courses.forEach(c => {
        let p = document.createElement("div");
        p.innerHTML = `
            <h3>${c.title}</h3>
            <p>${c.desc}</p>
            <button onclick="preview()">Preview</button>
        `;
        pub.appendChild(p);

        if (role === "member" || role === "admin") {
            let m = document.createElement("div");
            m.innerHTML = `
                <h3>${c.title}</h3>
                <p>${c.desc}</p>
                <button onclick="comingSoon()">Open Course</button>
            `;
            mem.appendChild(m);
        }
    });
}

function preview() {
    alert("Preview coming soon!");
}

function comingSoon() {
    alert("Courses are currently being prepared. Stay tuned!");
}

function addCourse() {
    let title = document.getElementById("title").value;
    let desc = document.getElementById("desc").value;

    if (title && desc) {
        courses.push({
            id: courses.length + 1,
            title: title,
            desc: desc
        });
        renderCourses();
    }
}

updateView();