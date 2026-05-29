require('dotenv').config();
const express  = require('express');
const session  = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');

require('./controllers/passportConfig');

const app = express();

// ─── Database ─────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 3000, () =>
      console.log(`🚀 Server running on http://localhost:${process.env.PORT || 3000}`)
    );
  })
  .catch(err => console.error('❌ DB connection error:', err));

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(passport.initialize());
app.use(passport.session());

// ─── View Engine ──────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');

// ─── Routes ───────────────────────────────────────────────────────────────────
// NOTE: Only Yasser's routes are here.
// Each teammate adds their own route file when they're ready.
// Example — Hussein adds:  app.use('/applications', require('./routes/applications'));
// Example — Nour adds:     app.use('/admin',        require('./routes/admin'));
// Example — Farah adds:    app.use('/dashboard',    require('./routes/dashboard'));
// Example — Youssef adds:  app.use('/courses',      require('./routes/courses'));

app.use('/auth', require('./routes/auth'));

// ─── Home (temporary until the team merges) ───────────────────────────────────
app.get('/', (req, res) => {
  res.render('home', { user: req.user || null });
});

// ─── Dashboard redirect based on role ─────────────────────────────────────────
const { isLoggedIn } = require('./middleware/authMiddleware');
app.get('/dashboard', isLoggedIn, (req, res) => {
  if (req.user.role === 'admin') return res.render('dashboard-admin', { user: req.user });
  res.render('dashboard-member', { user: req.user });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { user: req.user || null });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { user: req.user || null, err });
});
