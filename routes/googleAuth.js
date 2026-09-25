const express  = require('express');
const router   = express.Router();
const passport = require('passport');

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

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

    // 'pending' and 'rejected' can still sign in — they need to reach their
    // dashboard to see their application status (or the rejection notice).
    if (user.status === 'banned') return res.redirect('/login?error=banned');

    const token = user.getSignedJwt();
    const redirectTo = user.role === 'admin' ? '/admin' : '/member';

    // Hand the JWT to the browser the same way the password login does.
    // "<" is escaped so user-controlled values can't close the <script> tag.
    const session = JSON.stringify({
      token,
      user: {
        id:            user._id,
        name:          user.name,
        email:         user.email,
        role:          user.role,
        status:        user.status,
        universityId:  user.universityId,
        avatar:        user.avatar,
        badges:        user.badges,
        openedCourses: user.openedCourses
      }
    }).replace(/</g, '\\u003c');

    res.send(`<script>
      const session = ${session};
      localStorage.setItem('token', session.token);
      localStorage.setItem('user', JSON.stringify(session.user));
      window.location.replace('${redirectTo}');
    </script>`);
  }
);

module.exports = router;
