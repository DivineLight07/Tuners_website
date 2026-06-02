document.addEventListener('DOMContentLoaded', function() {
    const committeeSelect = document.getElementById('committee');
    const musicianDiv = document.getElementById('musician_fields');
    const instrumentSelect = document.getElementById('instrument');
    const otherInstrumentContainer = document.getElementById('other_instrument_container');
    const otherInstrumentInput = document.getElementById('other_instrument');
    const form = document.getElementById('applicationForm');

    if (committeeSelect && musicianDiv) {
        committeeSelect.addEventListener('change', function() {
            if (this.value === 'musician') {
                musicianDiv.style.display = 'block';
            } else {
                musicianDiv.style.display = 'none';
                if (instrumentSelect) instrumentSelect.value = '';
                if (otherInstrumentContainer) otherInstrumentContainer.style.display = 'none';
                if (otherInstrumentInput) otherInstrumentInput.value = '';
            }
        });
    }

    if (instrumentSelect && otherInstrumentContainer) {
        instrumentSelect.addEventListener('change', function() {
            if (this.value === 'Other') {
                otherInstrumentContainer.style.display = 'block';
            } else {
                otherInstrumentContainer.style.display = 'none';
                if (otherInstrumentInput) otherInstrumentInput.value = '';
            }
        });
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            let name = document.getElementById('fullname').value.trim();
            let studentId = document.getElementById('student_id').value.trim();
            let year = document.getElementById('year').value;
            let committeeVal = document.getElementById('committee').value;
            let major = document.getElementById('major').value.trim();

            let instrument = '';
            if (committeeVal === 'musician' && instrumentSelect) {
                if (instrumentSelect.value === 'Other') {
                    instrument = otherInstrumentInput ? otherInstrumentInput.value.trim() : '';
                } else {
                    instrument = instrumentSelect.value.trim();
                }
            }

            let hear = document.getElementById('hear_about').value.trim();
            let reason = document.getElementById('reason').value.trim();
            let email = document.getElementById('email').value.trim();
            let phone = document.getElementById('phone').value.trim();

            if (!name || !studentId || !year || !committeeVal || !major || !hear || !reason || !email || !phone) {
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

            // Save to localStorage
            const applications = JSON.parse(localStorage.getItem('applications') || '[]');
            const newApp = {
                id: Date.now(),
                name,
                studentId,
                year,
                committee: committeeVal,
                major,
                instrument,
                hear,
                reason,
                email,
                phone,
                date: new Date().toLocaleString(),
                status: 'Pending'
            };
            applications.push(newApp);
            localStorage.setItem('applications', JSON.stringify(applications));

            let message = "Application Submitted Successfully!\n\n";
            message += "The admin will review your application soon.";
            alert(message);
            form.reset();
            if (musicianDiv) musicianDiv.style.display = 'none';
            if (otherInstrumentContainer) otherInstrumentContainer.style.display = 'none';
        });
    }

    const resetBtn = document.querySelector('button[type="reset"]');
    if (resetBtn) {
        resetBtn.addEventListener('click', function (e) {
            if (!confirm('Reset all fields?')) {
                e.preventDefault();
            } else {
                if (musicianDiv) musicianDiv.style.display = 'none';
                if (otherInstrumentContainer) otherInstrumentContainer.style.display = 'none';
            }
        });
    }

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
    const applyLink = document.querySelector('nav ul li a[href*="/apply"]');

    if (userJson) {
        const user = JSON.parse(userJson);
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (applyLink && applyLink.parentElement) applyLink.parentElement.style.display = 'none';
        if (dashboardLi && dashboardLink) {
            dashboardLi.style.display = 'inline-block';
            if (user.role === 'admin') {
                dashboardLink.href = '/admin';
            } else {
                dashboardLink.href = '/member';
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
    window.location.href = '/login';
}

document.addEventListener('DOMContentLoaded', updateNavAuth);
