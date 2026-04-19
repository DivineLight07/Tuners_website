const USERS = [
  { email: 'admin@miuegypt.edu.eg',  password: 'Admin123!',  role: 'admin'  },
  { email: 'member@miuegypt.edu.eg', password: 'Member123!', role: 'member' }
];
 
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
 
function setErr(id, show) {
  document.getElementById(id).style.display = show ? 'block' : 'none';
}
 
function clearErrors() {
  ['login-email-err', 'login-pass-err', 'login-wrong-err'].forEach(id => setErr(id, false));
}
 
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
 
function showMsg(message) {
  const Msg = document.getElementById('Msg');
  Msg.textContent   = message;
  Msg.style.display = 'block';
  setTimeout(() => Msg.style.display = 'none', 3000);
}
 
function handleLogin() {
  clearErrors();
 
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  let valid   = true;
 
  if (!isValidEmail(email)) { setErr('login-email-err', true); valid = false; }
  if (!pass)                 { setErr('login-pass-err',  true); valid = false; }
  if (!valid) return;
 
  const user = USERS.find(u => u.email === email && u.password === pass);
 
  if (!user) { setErr('login-wrong-err', true); return; }
 
  showMsg('Login successful! Redirecting…');
  setTimeout(() => showPage('page-' + user.role), 1500);
}
 
function logout() {
  document.getElementById('login-email').value = '';
  document.getElementById('login-pass').value  = '';
  clearErrors();
  showPage('page-login');
}