const DEFAULT_USERS = [
  { email: 'admin@miuegypt.edu.eg',  password: 'Admin123!',  role: 'admin', name: 'Admin User', universityId: 'MIU000', badges: ['🎵 Perfect Pitch', '🎸 Guitar Hero'] },
  { email: 'member@miuegypt.edu.eg', password: 'Member123!', role: 'member', name: 'Farah', universityId: 'MIU123', badges: ['🎤 Vocal Virtuoso'] }
];

// Initialize users in localStorage if they don't exist
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}
 
function setErr(id, show) {
  const err = document.getElementById(id);
  if (err) err.style.display = show ? 'block' : 'none';
}
 
function clearErrors() {
  ['login-email-err', 'login-pass-err', 'login-wrong-err'].forEach(id => setErr(id, false));
}
 
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
 
function showMsg(message) {
  const Msg = document.getElementById('Msg');
  if (Msg) {
      Msg.textContent   = message;
      Msg.style.display = 'block';
      setTimeout(() => Msg.style.display = 'none', 3000);
  }
}
 
function handleLogin() {
  clearErrors();
  
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-pass');
  if (!emailInput || !passInput) return;

  const email = emailInput.value.trim();
  const pass  = passInput.value;
  let valid   = true;
 
  if (!isValidEmail(email)) { setErr('login-email-err', true); valid = false; }
  if (!pass)                 { setErr('login-pass-err',  true); valid = false; }
  if (!valid) return;
 
  const users = JSON.parse(localStorage.getItem('users'));
  const user = users.find(u => u.email === email && u.password === pass);
 
  if (!user) { setErr('login-wrong-err', true); return; }
 
  showMsg('Login successful! Redirecting…');
  localStorage.setItem('loggedInUser', JSON.stringify(user));
  setTimeout(() => {
      if (user.role === 'admin') {
          window.location.href = '../Nour/Admin_Dashboard.html';
      } else {
          window.location.href = '../Farah/member_dashboard.html';
      }
  }, 1500);
}
 
function logout() {
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-pass');
  if (emailInput) emailInput.value = '';
  if (passInput) passInput.value  = '';
  clearErrors();
  if (typeof globalLogout === 'function') {
      globalLogout();
  } else {
      localStorage.removeItem('loggedInUser');
      window.location.href = '../Mohamed/index.html';
  }
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
    const applyLink = document.querySelector('nav ul li a[href*="tuners.html"]');

    if (userJson) {
        const user = JSON.parse(userJson);
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (applyLink && applyLink.parentElement) applyLink.parentElement.style.display = 'none';
        if (dashboardLi && dashboardLink) {
            dashboardLi.style.display = 'inline-block';
            if (user.role === 'admin') {
                dashboardLink.href = '../Nour/Admin_Dashboard.html';
            } else {
                dashboardLink.href = '../Farah/member_dashboard.html';
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
    window.location.href = '../Mohamed/index.html';
}

document.addEventListener('DOMContentLoaded', updateNavAuth);
