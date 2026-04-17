const committee = document.getElementById('committee');
const musicianDiv = document.getElementById('musician_fields');
const form = document.getElementById('applicationForm');

// Show/hide instrument field
committee.addEventListener('change', function () {
    if (this.value === 'musician') {
        musicianDiv.style.display = 'block';
    } else {
        musicianDiv.style.display = 'none';
    }
});

// Form validation
form.addEventListener('submit', function (e) {
    e.preventDefault();

    let name = document.getElementById('fullname').value;
    let studentId = document.getElementById('student_id').value;
    let year = document.getElementById('year').value;
    let committeeVal = document.getElementById('committee').value;
    let major = document.getElementById('major').value;
    let instrument = document.getElementById('instrument').value;
    let hear = document.getElementById('hear_about').value;
    let reason = document.getElementById('reason').value;
    let email = document.getElementById('email').value;

    // Validation
    if (!name || !studentId || !year || !committeeVal || !major || !hear || !reason || !email) {
        alert('Please fill all required fields.');
        return;
    }

    if (committeeVal === 'musician' && !instrument) {
        alert('Please enter your instrument.');
        return;
    }

    if (reason.length < 20) {
        alert('Please write at least 20 characters.');
        return;
    }

    if (!email.includes('@')) {
        alert('Enter a valid email.');
        return;
    }

    // Success message
    let msg = `Application Submitted!\n\n
Name: ${name}
Student ID: ${studentId}
Year: ${year}
Committee: ${committeeVal}
Major: ${major}
Email: ${email}`;

    if (committeeVal === 'musician') {
        msg += `\nInstrument: ${instrument}`;
    }

    alert(msg);
});

// Reset confirmation
document.querySelector('button[type="reset"]').addEventListener('click', function (e) {
    if (!confirm('Reset all fields?')) {
        e.preventDefault();
    }
});