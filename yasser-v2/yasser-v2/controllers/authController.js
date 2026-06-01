const User = require('../models/User');

// ─── GET /auth/login ──────────────────────────────────────────────────────────
const getLogin = (req, res) => {
  if (req.user) return res.redirect('/dashboard');
  res.render('login', { user: null, error: req.query.error || null });
};

// ─── POST /auth/login ─────────────────────────────────────────────────────────
const postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)           return res.redirect('/auth/login?error=invalid');
    if (!user.password)  return res.redirect('/auth/login?error=google');

    const isMatch = await user.comparePassword(password);
    if (!isMatch)        return res.redirect('/auth/login?error=invalid');

    req.login(user, err => {
      if (err) return res.redirect('/auth/login?error=server');
      res.redirect('/dashboard');
    });
  } catch (err) {
    console.error(err);
    res.redirect('/auth/login?error=server');
  }
};

// ─── GET /auth/logout ─────────────────────────────────────────────────────────
const logout = (req, res) => {
  req.logout(err => {
    if (err) console.error(err);
    req.session.destroy(() => res.redirect('/auth/login'));
  });
};

module.exports = { getLogin, postLogin, logout };
