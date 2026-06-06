// utils.js — Shared fetch helper
// Written by Yasser (Phase 0)
// Used by ALL team members for every API call

function getAuthHeaders() {
  const token = localStorage.getItem('token');
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

    let data;
    try {
      data = await res.json();
    } catch {
      data = null; // fallback if response isn’t JSON
    }

    if (!res.ok) throw new Error(data?.error || `Request failed with status ${res.status}`);
    return data;
  } catch (err) {
    console.error('apiFetch error:', err.message);
    throw err;
  }
}


function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function getStoredUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function showToast(message, type = 'success') {
  const el = document.getElementById('Msg');
  if (!el) return;
  el.textContent      = message;
  el.style.background = type === 'error' ? '#c0392b' : '#133785';
  el.style.display    = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

