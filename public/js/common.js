// common.js — shared by every page. Loaded in <head> (not deferred) so the
// logged-in state is applied to <html> before the navbar is painted.

// ─── AUTH STATE ──────────────────────────────────────────────────────────────
function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

function saveAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function isLoggedIn() {
    return !!(localStorage.getItem('token') && getStoredUser());
}

function dashboardUrl(user) {
    return user && user.role === 'admin' ? '/admin' : '/member';
}

function globalLogout() {
    clearAuth();
    window.location.href = '/login';
}

// Redirects away from pages the current visitor can't use.
// Returns false when a redirect was triggered so callers can stop early.
function requireLogin(role) {
    if (!isLoggedIn()) {
        clearAuth();
        window.location.replace('/login');
        return false;
    }
    if (role && getStoredUser().role !== role) {
        window.location.replace(dashboardUrl(getStoredUser()));
        return false;
    }
    return true;
}

// Like requireLogin(), but also blocks members whose application isn't
// approved yet (pending/rejected) — used by member-only pages like Courses.
// Admins always pass.
function requireApprovedMember() {
    if (!requireLogin()) return false;
    const user = getStoredUser();
    if (user.role !== 'admin' && user.status !== 'approved') {
        alert('Your membership application is still pending admin approval.');
        window.location.replace('/member');
        return false;
    }
    return true;
}

// Runs immediately (before <body> exists): common.css uses these classes to
// show the right navbar buttons on first paint, so there is no flash of the
// logged-out navbar while the rest of the page's scripts load.
function applyAuthClasses() {
    const root = document.documentElement;
    const user = isLoggedIn() ? getStoredUser() : null;
    root.classList.toggle('logged-in', !!user);
    root.classList.toggle('logged-out', !user);
    root.classList.toggle('is-admin', !!user && user.role === 'admin');
}
applyAuthClasses();

function updateNavAuth() {
    applyAuthClasses();
    const dashboardLink = document.getElementById('nav-dashboard-link');
    if (dashboardLink) dashboardLink.href = dashboardUrl(getStoredUser());
}

// Keep every open tab in sync when the user logs in/out in another tab.
window.addEventListener('storage', (e) => {
    if (e.key === 'user' || e.key === 'token' || e.key === null) updateNavAuth();
});

// Pages restored from the back/forward cache don't re-run scripts.
window.addEventListener('pageshow', (e) => {
    if (e.persisted) updateNavAuth();
});

// ─── API ─────────────────────────────────────────────────────────────────────
async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const isFormData = options.body instanceof FormData;
    const res = await fetch(url, {
        ...options,
        headers: {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {})
        }
    });

    let data = null;
    try {
        data = await res.json();
    } catch {
        // Response had no JSON body
    }

    // Expired or revoked token: log out cleanly instead of showing a
    // "logged in" navbar that can't actually do anything.
    if (res.status === 401 && token) {
        clearAuth();
        window.location.href = '/login';
    }

    if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
    return data;
}

// ─── UI HELPERS ──────────────────────────────────────────────────────────────
function showMsg(message, type = 'success') {
    const el = document.getElementById('Msg');
    if (!el) return;
    el.textContent = message;
    el.style.backgroundColor = type === 'error' ? 'rgba(220, 38, 38, 0.9)' : '';
    el.style.display = 'block';
    clearTimeout(showMsg._timer);
    showMsg._timer = setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// Modals are hidden with an inline style in the markup, so they stay hidden
// no matter when (or whether) the stylesheets and Tailwind finish loading.
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
}

// Fires a 'modalclose' event so pages can clean up (e.g. stop a video)
// however the modal was closed.
function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal || modal.style.display === 'none') return;
    modal.style.display = 'none';
    modal.dispatchEvent(new Event('modalclose'));
}

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.querySelector('.icon-eye')?.classList.toggle('hidden', show);
    btn.querySelector('.icon-eye-off')?.classList.toggle('hidden', !show);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ─── PAGE SETUP ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateNavAuth();

    // Close any open modal by clicking its backdrop or pressing Escape
    document.addEventListener('click', (e) => {
        if (e.target.classList?.contains('modal-overlay')) closeModal(e.target.id);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('.modal-overlay').forEach(m => closeModal(m.id));
    });

    // Auto-hide navbar on scroll down, show on scroll up
    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        if (!navbar) return;
        const scrollTop = Math.max(window.scrollY, 0);
        navbar.classList.toggle('-translate-y-full', scrollTop > lastScrollTop);
        lastScrollTop = scrollTop;
    }, { passive: true });
});
