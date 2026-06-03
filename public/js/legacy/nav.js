// nav.js — dynamically fills the nav auth section
// Include this in every EJS page: <script src="/js/nav.js"></script>

document.addEventListener('DOMContentLoaded', () => {
  const navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;

  const user = getStoredUser();

  if (user) {
    navAuth.innerHTML = `
      <a href="/dashboard" id="nav-dashboard-btn">Dashboard</a>
      <a href="#" id="nav-logout-btn" onclick="handleLogout()">Logout</a>
    `;
  } else {
    navAuth.innerHTML = `
      <a href="/login" id="nav-login-btn">Login</a>
    `;
  }
});

async function handleLogout() {
  try {
    await apiFetch('/api/v1/auth/logout');
  } catch (e) {
    // even if it fails, clear local storage
  }
  clearAuth();
  window.location.href = '/login';
}
