const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).render('error', { user: req.user || null, err: { message: 'Access denied. Admins only.' } });
};

module.exports = { isLoggedIn, isAdmin };
