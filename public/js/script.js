// Login now connects to MongoDB via API

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
 
async function handleLogin() {
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

  try {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error || data.message || 'Incorrect email or password.';
      const wrongEl = document.getElementById('login-wrong-err');
      if (wrongEl) {
        wrongEl.textContent = errMsg;
      }
      setErr('login-wrong-err', true);
      return;
    }

    showMsg('Login successful! Redirecting…');
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    setTimeout(() => {
      if (data.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/member';
      }
    }, 1500);
  } catch (err) {
    console.error('Login error:', err);
    setErr('login-wrong-err', true);
  }
}
 
function logout() {
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-pass');
  if (emailInput) emailInput.value = '';
  if (passInput) passInput.value  = '';
  clearErrors();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

// Auto-hide navbar on scroll
(function() {
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        let navbar = document.getElementById('navbar');
        if (!navbar) return;
        
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            navbar.classList.add('-translate-y-full');
        } else {
            navbar.classList.remove('-translate-y-full');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);
})();

// Global Authentication Logic
function updateNavAuth() {
    const userJson = localStorage.getItem('user');
    const loginBtn = document.getElementById('nav-login-btn');
    const logoutBtn = document.getElementById('nav-logout-btn');
    const dashboardLi = document.getElementById('nav-dashboard');
    const dashboardLink = document.getElementById('nav-dashboard-link');
    const applyLink = document.querySelector('nav ul li a[href*="/apply"]');

    if (userJson) {
        const user = JSON.parse(userJson);

        // Fix navbar instability on the login page
        if (window.location.pathname === '/login') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('error')) {
                // If they landed here with an error, clear their stale login state
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                updateNavAuth(); // re-run to update UI to logged-out state
                return;
            } else {
                // No error, they just navigated to /login while logged in. Redirect to dashboard!
                window.location.href = user.role === 'admin' ? '/admin' : '/member';
                return;
            }
        }

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

document.addEventListener('DOMContentLoaded', updateNavAuth);
