// login.js — Login page only

// Landing here with ?error=... means a Google sign-in was rejected, so any
// stored session is stale. Otherwise a logged-in user has no business here.
if (new URLSearchParams(window.location.search).has('error')) {
    clearAuth();
    updateNavAuth();
} else if (isLoggedIn()) {
    window.location.replace(dashboardUrl(getStoredUser()));
}

function setErr(id, show) {
    document.getElementById(id)?.classList.toggle('hidden', !show);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleLogin(event) {
    event.preventDefault();
    ['login-email-err', 'login-pass-err', 'login-wrong-err'].forEach(id => setErr(id, false));

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-pass').value;

    const emailOk = isValidEmail(email);
    setErr('login-email-err', !emailOk);
    setErr('login-pass-err', !password);
    if (!emailOk || !password) return;

    try {
        const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (!response.ok) {
            document.getElementById('login-wrong-err').textContent = data.error || 'Incorrect email or password.';
            setErr('login-wrong-err', true);
            return;
        }

        saveAuth(data.token, data.user);
        updateNavAuth();
        showMsg('Login successful! Redirecting…');
        setTimeout(() => { window.location.href = dashboardUrl(data.user); }, 1000);
    } catch (err) {
        console.error('Login error:', err);
        setErr('login-wrong-err', true);
    }
}

document.getElementById('login-form').addEventListener('submit', handleLogin);
