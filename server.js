const dns      = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

// In production the host provides env vars directly; .env is only for local dev.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const path     = require('path');
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const passport = require('passport');
require('./middleware/passport');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── GLOBAL MIDDLEWARE ───────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── API ROUTES ──────────────────────────────────────────────────────────────
app.use('/api/v1/users',        require('./routes/users'));
app.use('/api/v1/applications', require('./routes/applications'));
app.use('/api/v1/auth',         require('./routes/auth'));
app.use('/api/v1/room',         require('./routes/room'));
app.use('/api/v1/badges',       require('./routes/badges'));
app.use('/api/v1/board',        require('./routes/board'));
app.use('/api/v1/courses',      require('./routes/courses'));
app.use('/api/v1/gallery',      require('./routes/gallery'));
app.use('/auth/google',         require('./routes/googleAuth'));

// ─── PAGE ROUTES ─────────────────────────────────────────────────────────────
app.get(['/', '/home'], (req, res) => res.render('home_page'));
app.get('/about',   (req, res) => res.render('About_us'));
app.get('/apply',   (req, res) => res.render('Apply_Form'));
app.get('/courses', (req, res) => res.render('Courses'));
app.get('/gallery', (req, res) => res.render('Gallery'));
app.get('/admin',   (req, res) => res.render('Admin_Dashboard'));
app.get('/member',  (req, res) => res.render('member_dashboard'));

// Only known error codes are shown; the messages are trusted HTML.
const loginErrors = {
  google_failed:  'Google sign-in failed. Only approved MIU accounts are allowed.',
  not_registered: 'This Google account isn\'t registered. Still didn\'t join? <a href="/apply" style="color: red; font-weight: bold; text-decoration: none;">Apply now</a>',
  banned:         'Your account has been banned. Contact an admin.'
};
app.get('/login', (req, res) => {
  const error = req.query.error ? (loginErrors[req.query.error] || loginErrors.google_failed) : null;
  res.render('Login', { error });
});

// ─── CATCH-ALL (MUST BE LAST) ────────────────────────────────────────────────
app.use((req, res) => res.status(404).render('home_page'));

app.use(errorHandler);

// ─── START SERVER ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  console.error('❌  MONGO_URI is not set. Add it to your .env file.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => console.log(`🚀  Server running → http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });
