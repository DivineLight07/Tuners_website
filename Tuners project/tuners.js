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
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name         = document.getElementById('fullname').value.trim();
            const studentId    = document.getElementById('student_id').value.trim();
            const year         = document.getElementById('year').value;
            const committeeVal = document.getElementById('committee').value;
            const major        = document.getElementById('major').value.trim();

            let instrument = '';
            if (committeeVal === 'musician' && instrumentSelect) {
                if (instrumentSelect.value === 'Other') {
                    instrument = otherInstrumentInput ? otherInstrumentInput.value.trim() : '';
                } else {
                    instrument = instrumentSelect.value.trim();
                }
            }

            const hear   = document.getElementById('hear_about').value.trim();
            const reason = document.getElementById('reason').value.trim();
            const email  = document.getElementById('email').value.trim();
            const phone  = document.getElementById('phone').value.trim();

            // ── Client-side validation (improved) ──────────────────────────
            
            // Name validation: letters and spaces only
            const nameRegex = /^[A-Za-z\s]{3,}$/;
            if (!nameRegex.test(name)) {
                alert('Please enter a valid full name (letters and spaces only, at least 3 characters).');
                return;
            }

            // Student ID validation: format XX/XXXXX
            const studentIdRegex = /^\d{2}\/\d{4,5}$/;
            if (!studentIdRegex.test(studentId)) {
                alert('Student ID must be in format: XX/XXXXX (e.g., 24/12345)');
                return;
            }

            // Phone validation: exactly 11 digits starting with 01
            const phoneRegex = /^01[0-9]{9}$/;
            if (!phoneRegex.test(phone)) {
                alert('Phone number must be exactly 11 digits starting with 01 (e.g., 01234567890)');
                return;
            }

            if (!year || !committeeVal || !major || !hear || !reason || !email) {
                alert('Please fill all required fields.');
                return;
            }

            if (committeeVal === 'musician' && !instrument) {
                alert('Please enter your instrument.');
                return;
            }

            if (reason.length < 20) {
                alert('Please write at least 20 characters in the reason field.');
                return;
            }


            // Email validation - must end with @miu.edu.eg
if (!email) {
    alert('Please enter your email.');
    return;
}
if (!email.toLowerCase().endsWith('@miuegypt.edu.eg')) {
    alert('Email must end with @miu.edu.eg (use your MIU email)');
    return;
}

            // ── Clear previous error banners / field errors ──────────────────
            clearFormErrors();

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting…';

            // ── POST to backend ──────────────────────────────────────────────
            try {
                const response = await fetch('/api/v1/applications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name, email, studentId, year,
                        committee: committeeVal,
                        major, instrument, hear, reason, phone
                    })
                });

                const data = await response.json();

                if (response.status === 201) {
                    // ✅ Success
                    showBanner('success', '✅ Application submitted successfully! The admin will review it soon.');
                    form.reset();
                    if (musicianDiv) musicianDiv.style.display = 'none';
                    if (otherInstrumentContainer) otherInstrumentContainer.style.display = 'none';
                    submitBtn.textContent = 'Application Sent';

                } else if (response.status === 400) {
                    // ❌ Validation errors
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Application';
                    if (data.errors && Array.isArray(data.errors)) {
                        data.errors.forEach(err => showFieldError(err.field, err.message));
                    } else {
                        showBanner('error', data.error || 'Validation failed. Please check your inputs.');
                    }

                } else if (response.status === 409) {
                    // ❌ Duplicate application
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Application';
                    showBanner('error', '⚠️ You have already submitted an application.');

                } else {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Application';
                    showBanner('error', data.error || 'Something went wrong. Please try again.');
                }

            } catch (networkErr) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Application';
                showBanner('error', '⚠️ Could not reach the server. Please check your connection.');
            }
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
                clearFormErrors();
                const submitBtn = document.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Application';
                }
                // Clear name, student ID, phone error messages
                const nameError = document.getElementById('nameError');
                const studentIdError = document.getElementById('studentIdError');
                const phoneError = document.getElementById('phoneError');
                if (nameError) nameError.style.display = 'none';
                if (studentIdError) studentIdError.style.display = 'none';
                if (phoneError) phoneError.style.display = 'none';
            }
        });
    }

});

// ── Banner helpers ────────────────────────────────────────────────────────────

function showBanner(type, message) {
    clearFormErrors();
    const banner = document.getElementById('form-banner');
    if (banner) banner.remove();
    
    const newBanner = document.createElement('div');
    newBanner.id = 'form-banner';
    newBanner.style.cssText = `
        padding: 12px 16px;
        margin: 12px 0;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.95rem;
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color:       ${type === 'success' ? '#155724' : '#721c24'};
        border:      1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
    `;
    newBanner.textContent = message;
    const form = document.getElementById('applicationForm');
    form.insertAdjacentElement('beforebegin', newBanner);
    newBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showFieldError(fieldName, message) {
    const fieldMap = {
        name:       'fullname',
        studentId:  'student_id',
        year:       'year',
        committee:  'committee',
        major:      'major',
        instrument: 'instrument',
        hear:       'hear_about',
        reason:     'reason',
        email:      'email',
        phone:      'phone'
    };

    const inputId = fieldMap[fieldName] || fieldName;
    const input   = document.getElementById(inputId);
    if (!input) return;

    const existing = input.parentElement.querySelector('.field-error');
    if (existing) existing.remove();

    const errSpan = document.createElement('span');
    errSpan.className = 'field-error';
    errSpan.style.cssText = 'color:#dc3545; font-size:0.82rem; display:block; margin-top:4px;';
    errSpan.textContent = '⚠ ' + message;
    input.insertAdjacentElement('afterend', errSpan);
    input.style.borderColor = '#dc3545';
}

function clearFormErrors() {
    const banner = document.getElementById('form-banner');
    if (banner) banner.remove();

    document.querySelectorAll('.field-error').forEach(el => el.remove());
    document.querySelectorAll('#applicationForm input, #applicationForm select, #applicationForm textarea')
        .forEach(el => (el.style.borderColor = ''));
}

function getAuthHeaders() {
    const token = sessionStorage.getItem('token');
    return token ? { 'Authorization': 'Bearer ' + token } : {};
}

// ── Auto-hide navbar on scroll ────────────────────────────────────────────────

(function() {
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);
})();

// ── Navbar auth state ─────────────────────────────────────────────────────────

function updateNavAuth() {
    const token    = sessionStorage.getItem('token');
    const userJson = sessionStorage.getItem('user');

    const loginBtn     = document.getElementById('nav-login-btn');
    const logoutBtn    = document.getElementById('nav-logout-btn');
    const dashboardLi  = document.getElementById('nav-dashboard');
    const dashboardLink = document.getElementById('nav-dashboard-link');
    const applyLink    = document.querySelector('nav ul li a[href*="tuners.html"]');

    if (token && userJson) {
        const user = JSON.parse(userJson);
        if (loginBtn)  loginBtn.style.display  = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (applyLink && applyLink.parentElement) applyLink.parentElement.style.display = 'none';
        if (dashboardLi && dashboardLink) {
            dashboardLi.style.display = 'inline-block';
            dashboardLink.href = user.role === 'admin'
                ? '../Nour/Admin_Dashboard.html'
                : '../Farah/member_dashboard.html';
        }
    } else {
        if (loginBtn)  loginBtn.style.display  = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (applyLink && applyLink.parentElement) applyLink.parentElement.style.display = 'inline-block';
        if (dashboardLi) dashboardLi.style.display = 'none';
    }
}

function globalLogout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '../Mohamed/index.html';
}

document.addEventListener('DOMContentLoaded', updateNavAuth);