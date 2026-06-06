// login.js — Frontend validation + fetch to API
// Real authentication happens server-side in authController.js

function setErr(id, show) {
  const el = document.getElementById(id);
  if (el) el.style.display = show ? 'block' : 'none';
}

function isValidMIUEmail(email) {
  return /^[^\s@]+@miuegypt\.edu\.eg$/.test(email);
}

function showServerErr(message) {
  const el = document.getElementById('server-err');
  if (el) { el.textContent = message; el.style.display = 'block'; }
}

function clearErrors() {
  setErr('login-email-err', false);
  setErr('login-pass-err', false);
  const s = document.getElementById('server-err');
  if (s) s.style.display = 'none';
}

document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  clearErrors();

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pass').value;
  let valid      = true;

  if (!isValidMIUEmail(email)) { setErr('login-email-err', true); valid = false; }
  if (!password)                { setErr('login-pass-err',  true); valid = false; }
  if (!valid) return;

  const btn = document.getElementById('loginBtn');
  if (btn) { btn.disabled = true; btn.textContent = 'Logging in...'; }

  try {
    const data = await apiFetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    saveAuth(data.token, data.user);
    showToast('Login successful! Redirecting…');
    setTimeout(() => { window.location.href = '/dashboard'; }, 1000);

  } catch (err) {
    showServerErr(err.message);
    if (btn) { btn.disabled = false; btn.textContent = 'Login'; }
  }
});

