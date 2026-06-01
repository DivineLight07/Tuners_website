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
    const applyLink = document.querySelector('nav ul li a[href*="tuners.ejs"]');

    if (userJson) {
        const user = JSON.parse(userJson);
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (applyLink && applyLink.parentElement) applyLink.parentElement.style.display = 'none';
        if (dashboardLi && dashboardLink) {
            dashboardLi.style.display = 'inline-block';
            if (user.role === 'admin') {
                dashboardLink.href = '../Nour/Admin_Dashboard.ejs';
            } else {
                dashboardLink.href = '../Farah/member_dashboard.ejs';
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
    window.location.href = '../Mohamed/index.ejs';
}

document.addEventListener('DOMContentLoaded', updateNavAuth);
