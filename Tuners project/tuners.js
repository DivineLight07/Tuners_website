document.addEventListener("DOMContentLoaded", function () {
    const committee = document.getElementById('committee');
    const musicianDiv = document.getElementById('musician_fields');
    const form = document.getElementById('applicationForm');
    const messageDiv = document.getElementById('form-messages');

    musicianDiv.style.display = "none";

    committee.addEventListener('change', function () {
        if (this.value === 'musician') {
            musicianDiv.style.display = 'block';
        } else {
            musicianDiv.style.display = 'none';
        }
    });

    function showMessage(message, isError) {
        messageDiv.style.display = 'block';
        messageDiv.textContent = message;
        
        if (isError) {
            messageDiv.className = 'error-msg';
        } else {
            messageDiv.className = 'success-msg';
        }
        
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        
        messageDiv.style.display = 'none';
        messageDiv.className = '';

        let name = document.getElementById('fullname').value.trim();
        let studentId = document.getElementById('student_id').value.trim();
        let year = document.getElementById('year').value.trim();
        let committeeVal = document.getElementById('committee').value.trim();
        let major = document.getElementById('major').value.trim();
        let instrument = document.getElementById('instrument').value.trim();
        let hear = document.getElementById('hear_about').value.trim();
        let reason = document.getElementById('reason').value.trim();
        let email = document.getElementById('email').value.trim();

        if (!name || !studentId || !year || !committeeVal || !major || !hear || !reason || !email) {
            showMessage('Please fill out all required fields.', true);
            return;
        }

        if (committeeVal === 'musician' && !instrument) {
            showMessage('Please enter your instrument.', true);
            return;
        }

        if (reason.length < 20) {
            showMessage('Please write at least 20 characters for your reason.', true);
            return;
        }

        if (!email.includes('@')) {
            showMessage('Please enter a valid email address.', true);
            return;
        }

        showMessage('Application Submitted Successfully! The admin will review your application.', false);
        
        form.reset();
        musicianDiv.style.display = 'none';
    });

    document.querySelector('button[type="reset"]').addEventListener('click', function (e) {
        if (!confirm('Reset all fields?')) {
            e.preventDefault();
        } else {
            messageDiv.style.display = 'none';
            musicianDiv.style.display = 'none';
        }
    });
});