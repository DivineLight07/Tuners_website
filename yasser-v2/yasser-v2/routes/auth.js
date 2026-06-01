const express  = require('express');
const passport = require('passport');
const router   = express.Router();
const auth     = require('../controllers/authController');

// ─── Login ────────────────────────────────────────────────────────────────────
router.get('/login',  auth.getLogin);
router.post('/login', auth.postLogin);

// ─── Logout ───────────────────────────────────────────────────────────────────
router.get('/logout', auth.logout);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login?error=google_failed' }),
  (req, res) => res.redirect('/dashboard')
);

module.exports = router;
