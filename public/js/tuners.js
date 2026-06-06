document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 tuners.js loaded');
    
    // ─── ELEMENT SELECTORS ───────────────────────────────────────────────────
    const committeeSelect = document.getElementById('committee');
    const musicianDiv = document.getElementById('musician_fields');
    const instrumentSelect = document.getElementById('instrument');
    const otherInstrumentContainer = document.getElementById('other_instrument_container');
    const otherInstrumentInput = document.getElementById('other_instrument');
    const form = document.getElementById('applicationForm');

    // ─── MUSICIAN FIELDS TOGGLE ──────────────────────────────────────────────
    if (committeeSelect && musicianDiv) {
        console.log('🎸 Committee select and musician div found');
        
        // Initial check: show musician fields if already selected (e.g., after page refresh)
        if (committeeSelect.value === 'musician') {
            musicianDiv.style.display = 'block';
        }
        
        committeeSelect.addEventListener('change', function() {
            console.log('🔄 Committee changed to:', this.value);
            
            if (this.value === 'musician') {
                musicianDiv.style.display = 'block';
                console.log('✅ Showing musician fields');
            } else {
                musicianDiv.style.display = 'none';
                if (instrumentSelect) instrumentSelect.value = '';
                if (otherInstrumentContainer) otherInstrumentContainer.style.display = 'none';
                if (otherInstrumentInput) otherInstrumentInput.value = '';
                console.log('✅ Hiding musician fields');
            }
        });
    } else {
        console.log('⚠️ Committee select or musician div not found on this page');
    }

    // ─── OTHER INSTRUMENT TOGGLE ─────────────────────────────────────────────
    if (instrumentSelect && otherInstrumentContainer) {
        instrumentSelect.addEventListener('change', function() {
            if (this.value === 'Other') {
                otherInstrumentContainer.style.display = 'block';
                if (otherInstrumentInput) otherInstrumentInput.focus();
            } else {
                otherInstrumentContainer.style.display = 'none';
                if (otherInstrumentInput) otherInstrumentInput.value = '';
            }
        });
    }

    // ─── FORM SUBMISSION (API-based) ─────────────────────────────────────────
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            console.log('📤 Form submitted');

            // Gather form data
            let name = document.getElementById('fullname')?.value.trim() || '';
            let studentId = document.getElementById('student_id')?.value.trim() || '';
            let year = document.getElementById('year')?.value || '';
            let committeeVal = document.getElementById('committee')?.value || '';
            let major = document.getElementById('major')?.value.trim() || '';

            let instrument = '';
            if (committeeVal === 'musician' && instrumentSelect) {
                if (instrumentSelect.value === 'Other') {
                    instrument = otherInstrumentInput?.value.trim() || '';
                } else {
                    instrument = instrumentSelect.value.trim();
                }
            }

            let hear = document.getElementById('hear_about')?.value.trim() || '';
            let reason = document.getElementById('reason')?.value.trim() || '';
            let email = document.getElementById('email')?.value.trim() || '';
            let phone = document.getElementById('phone')?.value.trim() || '';

            // Client-side validation
            const requiredFields = { name, studentId, year, committeeVal, major, hear, reason, email, phone };
            const missingFields = Object.entries(requiredFields)
                .filter(([_, val]) => !val)
                .map(([key]) => key);
            
            if (missingFields.length > 0) {
                alert('Please fill all required fields: ' + missingFields.join(', '));
                return;
            }

            if (committeeVal === 'musician' && !instrument) {
                alert('Please select or specify your instrument.');
                return;
            }

            if (reason.length < 20) {
                alert('Please write at least 20 characters explaining why you want to join.');
                return;
            }

            if (!email.toLowerCase().endsWith('@miuegypt.edu.eg')) {
                alert('Email must end with @miuegypt.edu.eg');
                return;
            }

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn?.textContent || 'Submit';
            if (submitBtn) {
                submitBtn.textContent = 'Submitting...';
                submitBtn.disabled = true;
            }

            try {
                console.log('🌐 Sending application to API...');
                
                // Send to backend API
                const response = await fetch('/api/v1/applications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name, email, studentId, year, committee: committeeVal, major,
                        instrument, hear, reason, phone
                    })
                });

                const result = await response.json();
                console.log('📡 API Response:', result);

                if (!response.ok) {
                    throw new Error(result.error || result.message || 'Submission failed');
                }

                // Success!
                alert('✅ Application submitted successfully!\nThe admin will review it soon.');
                
                // Reset form
                form.reset();
                if (musicianDiv) musicianDiv.style.display = 'none';
                if (otherInstrumentContainer) otherInstrumentContainer.style.display = 'none';
                
                // Optional: notify admin dashboard if open in another tab
                try {
                    localStorage.setItem('newApplicationSubmitted', Date.now().toString());
                    setTimeout(() => localStorage.removeItem('newApplicationSubmitted'), 100);
                } catch (e) {
                    // Ignore localStorage errors
                }

            } catch (err) {
                console.error('❌ Submission error:', err);
                alert('❌ Error: ' + err.message);
            } finally {
                // Restore button
                if (submitBtn) {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    // ─── RESET BUTTON CONFIRMATION ───────────────────────────────────────────
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

// ─── AUTO-HIDE NAVBAR ON SCROLL ──────────────────────────────────────────────
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

// ─── GLOBAL AUTHENTICATION LOGIC ─────────────────────────────────────────────
function updateNavAuth() {
    const userJson = localStorage.getItem('user');
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// Call updateNavAuth on DOM load
document.addEventListener('DOMContentLoaded', updateNavAuth);