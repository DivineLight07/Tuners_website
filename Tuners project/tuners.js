document.addEventListener("DOMContentLoaded", function () {

    const committee = document.getElementById('committee');
    const musicianDiv = document.getElementById('musician_fields');
    const form = document.getElementById('applicationForm');

    musicianDiv.style.display = "none";

    committee.addEventListener('change', function () {
        if (this.value === 'musician') {
            musicianDiv.style.display = 'block';
        } else {
            musicianDiv.style.display = 'none';
        }
    });


    form.addEventListener('submit', function (e) {
        e.preventDefault();

        let name = document.getElementById('fullname').value.trim();
        let studentId = document.getElementById('student_id').value.trim();
        let year = document.getElementById('year').value;
        let committeeVal = document.getElementById('committee').value;
        let major = document.getElementById('major').value.trim();
        let instrument = document.getElementById('instrument').value.trim();
        let hear = document.getElementById('hear_about').value.trim();
        let reason = document.getElementById('reason').value.trim();
        let email = document.getElementById('email').value.trim();

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
            alert('Please enter a valid email.');
            return;
        }

        let message = "Application Submitted!\n\n";
        message += "Name: " + name + "\n";
        message += "Student ID: " + studentId + "\n";
        message += "Year: " + year + "\n";
        message += "Committee: " + committeeVal + "\n";
        message += "Major: " + major + "\n";

        if (committeeVal === 'musician') {
            message += "Instrument: " + instrument + "\n";
        }

        message += "Email: " + email + "\n\n";
        message += "The admin will review your application.";

        alert(message);
    });

    document.querySelector('button[type="reset"]').addEventListener('click', function (e) {
        if (!confirm('Reset all fields?')) {
            e.preventDefault();
        }
    });

});