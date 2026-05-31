# Yasser's Part — Phase 0 + Auth

## What's in here
This is the shared foundation everyone builds on top of.

---

## Files I own
```
app.js                          ← server entry, wire your routes here
.env.example                    ← copy to .env and fill in values
package.json                    ← all dependencies
models/User.js                  ← User schema (everyone uses this)
controllers/authController.js   ← login, signup, logout logic
controllers/passportConfig.js   ← Google OAuth setup
middleware/authMiddleware.js     ← isLoggedIn + isAdmin guards
routes/auth.js                  ← /auth/login, /auth/signup, /auth/google
views/login.ejs                 ← login page
views/signup.ejs                ← signup page
views/partials/nav.ejs          ← shared navbar (include in ALL your views)
public/css/style.css            ← shared styles (use in ALL your views)
public/js/utils.js              ← apiFetch helper (use in ALL your JS files)
public/js/login.js              ← login form frontend validation
public/js/signup.js             ← signup form frontend validation
```

---

## How to set up (do this once)

```bash
npm install
copy .env.example .env        # Windows
# cp .env.example .env        # Mac/Linux
```

Fill in your `.env`:
```
MONGO_URI=mongodb+srv://tuners_admin:Tuners123@tunersweb.eqhpjop.mongodb.net/tuners?retryWrites=true&w=majority
SESSION_SECRET=t8Kx#mP2$qL9vR4nW7jY6uZ3cF1sBhD0eA5gN
GOOGLE_CLIENT_ID=           ← fill when ready
GOOGLE_CLIENT_SECRET=       ← fill when ready
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

```bash
npm run dev
```

---

## How to protect your routes (use my middleware)

```javascript
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');

// Any logged-in user
router.get('/dashboard', isLoggedIn, (req, res) => { ... });

// Admins only
router.get('/admin', isLoggedIn, isAdmin, (req, res) => { ... });
```

---

## How to use my apiFetch helper in your JS files

Add this to the top of your HTML/EJS:
```html
<script src="/js/utils.js"></script>
```

Then use it in your own JS:
```javascript
// GET request
const data = await apiFetch('/admin/users');

// POST request
const result = await apiFetch('/applications/submit', {
  method: 'POST',
  body: JSON.stringify({ name, email, ... })
});

// DELETE request
await apiFetch(`/admin/users/${id}`, { method: 'DELETE' });

// Show a toast message
showToast('Done!', 'success');
showToast('Something went wrong', 'error');
```

---

## How to include the shared navbar in your views

At the top of every EJS file:
```ejs
<%- include('./partials/nav.ejs') %>
```

Make sure you pass `user` to every render call:
```javascript
res.render('your-page', { user: req.user || null });
```

---

## How to add your routes to app.js

Open `app.js` and add your route file:
```javascript
app.use('/your-prefix', require('./routes/yourRoute'));
```

---

## Auth routes available
| Method | URL | What it does |
|--------|-----|--------------|
| GET | /auth/login | Show login page |
| POST | /auth/login | Submit login form |
| GET | /auth/signup | Show signup page |
| POST | /auth/signup | Submit signup form |
| GET | /auth/logout | Logout and destroy session |
| GET | /auth/google | Redirect to Google login |
| GET | /auth/google/callback | Google redirects back here |
