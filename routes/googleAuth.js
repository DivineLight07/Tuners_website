const express  = require('express');
const router   = express.Router();
const passport = require('passport');

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // Pass the specific error message (e.g. 'not_registered') to the redirect
      const errorType = (info && info.message === 'not_registered') ? 'not_registered' : 'google_failed';
      return res.redirect(`/login?error=${errorType}`);
    }
    
    req.user = user;
    next();
  })(req, res, next);
}, (req, res) => {
    const user = req.user;

    if (user.status === 'pending') return res.redirect('/login?error=pending');
    if (user.status === 'banned')  return res.redirect('/login?error=banned');

    const token = user.getSignedJwt();
    const redirectTo = user.role === 'admin' ? '/admin' : '/member';

    res.send(`
      <script>
        localStorage.setItem('token', '${token}');
        localStorage.setItem('user', JSON.stringify(${JSON.stringify({
          id:     user._id,
          name:   user.name,
          email:  user.email,
          role:   user.role,
          status: user.status,
          avatar: user.avatar
        })}));
        window.location.href = '${redirectTo}';
      </script>
    `);
  }
);

module.exports = router;
