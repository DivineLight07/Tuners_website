const express  = require('express');
const router   = express.Router();
const passport = require('passport');
const jwt      = require('jsonwebtoken');

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=google_failed', session: false }),
  (req, res) => {
    const user = req.user;

    if (user.status === 'pending') return res.redirect('/login?error=pending');
    if (user.status === 'banned')  return res.redirect('/login?error=banned');

    const token = user.getSignedJwt();

    res.send(`
      <script>
        sessionStorage.setItem('token', '${token}');
        sessionStorage.setItem('user', JSON.stringify(${JSON.stringify({
          id:           user._id,
          name:         user.name,
          email:        user.email,
          role:         user.role,
          status:       user.status,
          avatar:       user.avatar
        })}));
        window.location.href = '/dashboard';
      </script>
    `);
  }
);

module.exports = router;

