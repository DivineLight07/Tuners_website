// apply_form.js — Apply page: sign up, then fill out the application form

const signupStep = document.getElementById('signup-step');
const applicationStep = document.getElementById('application-step');

function showApplicationStep() {
    signupStep.classList.add('hidden');
    applicationStep.classList.remove('hidden');
    document.getElementById('apply-step-subtitle').textContent = 'Step 2 of 2 — tell us about yourself.';
    const user = getStoredUser();
    document.getElementById('application-step-email').textContent = user?.email || '';
}

// Decide which step to show on load, based on whether the visitor already
// has an account and/or has already submitted an application.
(async function initStep() {
    if (!isLoggedIn()) return; // signup step (already visible by default)

    const user = getStoredUser();
    if (user.role === 'admin') {
        window.location.replace('/admin');
        return;
    }

    try {
        const { data: application } = await apiFetch('/api/v1/applications/me');
        if (application) {
            // Already applied — nothing left to do here, the dashboard has
            // their status.
            window.location.replace('/member');
            return;
        }
        if (user.status !== 'pending') {
            // Account exists but isn't mid-application (e.g. an admin-created
            // member) — /apply has nothing for them.
            window.location.replace('/member');
            return;
        }
        showApplicationStep();
    } catch (err) {
        console.error('Failed to check application status:', err);
    }
})();

// ─── STEP 1: SIGN UP ──────────────────────────────────────────────────────────
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-pass').value;
    const confirm = document.getElementById('signup-pass-confirm').value;

    const emailOk = email.toLowerCase().endsWith('@miuegypt.edu.eg');
    document.getElementById('signup-email-err').classList.toggle('hidden', emailOk);

    const passwordsMatch = password === confirm;
    document.getElementById('signup-pass-err').classList.toggle('hidden', passwordsMatch);

    document.getElementById('signup-err').classList.add('hidden');
    if (!emailOk || !passwordsMatch || password.length < 6) return;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Sign up failed');

        saveAuth(result.token, result.user);
        updateNavAuth();
        showApplicationStep();
    } catch (err) {
        const errEl = document.getElementById('signup-err');
        errEl.textContent = err.message;
        errEl.classList.remove('hidden');
    } finally {
        submitBtn.disabled = false;
    }
});

// ─── STEP 2: APPLICATION FORM ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    const committeeSelect = document.getElementById('committee');
    const musicianDiv = document.getElementById('musician_fields');
    const instrumentSelect = document.getElementById('instrument');
    const otherInstrumentContainer = document.getElementById('other_instrument_container');
    const otherInstrumentInput = document.getElementById('other_instrument');
    const form = document.getElementById('applicationForm');

    // ─── MUSICIAN FIELDS TOGGLE ──────────────────────────────────────────────
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

    // ─── FORM SUBMISSION ──────────────────────────────────────────────────────
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const studentId = document.getElementById('student_id')?.value.trim() || '';
            const year = document.getElementById('year')?.value || '';
            const committeeVal = document.getElementById('committee')?.value || '';
            const major = document.getElementById('major')?.value.trim() || '';

            let instrument = '';
            if (committeeVal === 'musician' && instrumentSelect) {
                instrument = instrumentSelect.value === 'Other'
                    ? (otherInstrumentInput?.value.trim() || '')
                    : instrumentSelect.value.trim();
            }

            const hear = document.getElementById('hear_about')?.value.trim() || '';
            const reason = document.getElementById('reason')?.value.trim() || '';
            const phone = document.getElementById('phone')?.value.trim() || '';

            const requiredFields = { studentId, year, committeeVal, major, reason, phone };
            const missingFields = Object.entries(requiredFields).filter(([, val]) => !val).map(([key]) => key);
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

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn?.textContent || 'Submit';
            if (submitBtn) {
                submitBtn.textContent = 'Submitting...';
                submitBtn.disabled = true;
            }

            try {
                await apiFetch('/api/v1/applications', {
                    method: 'POST',
                    body: JSON.stringify({ studentId, year, committee: committeeVal, major, instrument, hear, reason, phone })
                });
                openModal('application-success-modal');
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                if (submitBtn) {
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    // ─── RESET BUTTON CONFIRMATION ───────────────────────────────────────────
    const resetBtn = form?.querySelector('button[type="reset"]');
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
