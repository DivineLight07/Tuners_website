/**
 * utils.js — Shared fetch helper
 * Written by Yasser (Phase 0)
 * Used by all team members for API calls
 *
 * Usage:
 *   apiFetch('/admin/users')                          → GET
 *   apiFetch('/applications/submit', { method: 'POST', body: JSON.stringify(data) })
 *   apiFetch('/admin/users/123', { method: 'DELETE' })
 */

// Returns standard headers for all API requests
function getAuthHeaders() {
  return { 'Content-Type': 'application/json' };
}

/**
 * apiFetch — wrapper around fetch() that:
 * 1. Adds the correct headers automatically
 * 2. Sends the session cookie (credentials: 'include')
 * 3. Throws a proper error if the response is not OK
 * 4. Returns parsed JSON directly
 */
async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {})
      },
      credentials: 'include' // sends session cookie so server knows who you are
    });

    // If server returned an error status (4xx, 5xx), throw it
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `Request failed with status ${res.status}`);
    }

    return res.json();

  } catch (err) {
    console.error(`apiFetch error [${url}]:`, err.message);
    throw err;
  }
}

/**
 * showToast — show a small notification message
 * Pass type: 'success' or 'error'
 */
function showToast(message, type = 'success') {
  const existing = document.getElementById('Msg');
  if (!existing) return;
  existing.textContent = message;
  existing.style.background = type === 'error' ? '#c0392b' : '#133785';
  existing.style.display = 'block';
  setTimeout(() => { existing.style.display = 'none'; }, 3000);
}
