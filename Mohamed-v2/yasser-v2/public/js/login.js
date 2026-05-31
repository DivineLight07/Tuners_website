// Frontend validation for login form
// Real authentication happens server-side in authController.js

function setErr(id, show) {
  document.getElementById(id).style.display = show ? 'block' : 'none';
}

function isValidEmail(email) {
  return /^[^\s@]+@miuegypt\.edu\.eg$/.test(email);
}

document.getElementById('loginForm').addEventListener('submit', function (e) {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  let valid   = true;

  setErr('login-email-err', false);
  setErr('login-pass-err',  false);

  if (!isValidEmail(email)) { setErr('login-email-err', true); valid = false; }
  if (!pass)                 { setErr('login-pass-err',  true); valid = false; }

  if (!valid) e.preventDefault();
});
