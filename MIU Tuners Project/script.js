
function switchTab(tab) {
  document.getElementById('section-login').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('section-register').style.display = tab === 'register' ? 'block' : 'none';
  clearErrors();
}


function setErr(id, show) {
  document.getElementById(id).style.display = show ? 'inline' : 'none';
}

function clearErrors() {
  const errorIds = [
    'login-email-err', 'login-pass-err',
    'reg-fname-err', 'reg-lname-err', 'reg-email-err',
    'reg-sid-err', 'reg-pass-err', 'reg-pass2-err'
  ];
  errorIds.forEach(id => document.getElementById(id).style.display = 'none');

  document.getElementById('login-success').style.display = 'none';
  document.getElementById('reg-success').style.display   = 'none';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isMIUEmail(email) {
  return /^[^\s@]+@miuegypt\.edu\.eg$/i.test(email);
}


function updateStrength(value) {
  const label = document.getElementById('strength-label');

  let score = 0;
  if (value.length >= 8)          score++;
  if (/[A-Z]/.test(value))        score++;
  if (/[0-9]/.test(value))        score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const levels = ['—', 'Weak', 'Fair', 'Good', 'Strong'];
  label.textContent = levels[score];
}


function showMsg(message) {
  const Msg = document.getElementById('Msg');
  Msg.textContent    = message;
  Msg.style.display  = 'block';
  setTimeout(() => Msg.style.display = 'none', 3000);
}


function handleLogin(e) {
  clearErrors();

  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  let valid   = true;

  if (!isValidEmail(email)) { setErr('login-email-err', true); valid = false; }
  if (!pass)                 { setErr('login-pass-err',  true); valid = false; }

  if (!valid) return;

  
  document.getElementById('login-success').style.display = 'block';
  showMsg('Welcome back to Tuners!');
}


function handleRegister(e) {
  clearErrors();

  const fname = document.getElementById('reg-fname').value;
  const lname = document.getElementById('reg-lname').value;
  const email = document.getElementById('reg-email').value;
  const sid   = document.getElementById('reg-sid').value;
  const pass  = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  let valid   = true;

  if (!fname)              { setErr('reg-fname-err', true); valid = false; }
  if (!lname)              { setErr('reg-lname-err', true); valid = false; }
  if (!isMIUEmail(email))  { setErr('reg-email-err', true); valid = false; }
  if (!sid)                { setErr('reg-sid-err',   true); valid = false; }
  if (pass.length < 8)     { setErr('reg-pass-err',  true); valid = false; }
  if (pass !== pass2)      { setErr('reg-pass2-err', true); valid = false; }

  if (!valid) return;

  
  document.getElementById('reg-success').style.display = 'block';
  showMsg('Account created!');
}