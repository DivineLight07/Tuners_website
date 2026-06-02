// utils.js — Shared fetch helper
// Written by Yasser (Phase 0)
// Used by ALL team members for every API call

function getAuthHeaders() {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: { ...getAuthHeaders(), ...(options.headers || {}) }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Request failed with status ${res.status}`);
    return data;
  } catch (err) {
    console.error(`apiFetch error [${url}]:`, err.message);
    throw err;
  }
}

function isLoggedIn() {
  return !!sessionStorage.getItem('token');
}

function getStoredUser() {
  const u = sessionStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function saveAuth(token, user) {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
}

function showToast(message, type = 'success') {
  const el = document.getElementById('Msg');
  if (!el) return;
  el.textContent      = message;
  el.style.background = type === 'error' ? '#c0392b' : '#133785';
  el.style.display    = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

