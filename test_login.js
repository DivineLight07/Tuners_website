const fetch = globalThis.fetch || require('node-fetch');

const url = 'http://localhost:5000/api/v1/auth/login';
const body = { email: 'admin@miuegypt.edu.eg', password: 'Admin123!' };

(async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    console.log('status:', res.status);
    console.log('body:', text);
  } catch (err) {
    console.error('error:', err.message || err);
  }
})();
