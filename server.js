const express    = require('express');
const mongoose   = require('mongoose');
const dotenv     = require('dotenv');

dotenv.config({ path: '.env' });

const path       = require('path');
const cors       = require('cors');
const session    = require('express-session');  // ← ADD
const passport   = require('passport');          // ← ADD
require('./middleware/passport');                    // ← ADD

// Middleware
const errorHandler = require('./middleware/errorHandler');

// Routes
const applications = require('./routes/applications');
const auth = require('./routes/auth');
const users = require('./routes/users');
const room = require('./routes/room'); // ✅ Import room routes
const badges = require('./routes/badges');

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // ← ADD (needed for form posts)
app.use(session({                                  // ← ADD
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());                    // ← ADD
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── API ROUTES (MUST BE FIRST!) ─────────────────────────────────────────────
app.use('/api/v1/users', users);
app.use('/api/v1/applications', applications);
app.use('/api/v1/auth', auth);
app.use('/api/v1/room', room);
app.use('/api/v1/badges', badges);
app.use('/api/v1/board', require('./routes/board'));
app.use('/api/v1/courses', require('./routes/courses'));
app.use('/api/v1/gallery', require('./routes/gallery'));
app.use('/auth/google',         require('./routes/googleAuth'));  // ← ADD here


// ─── PAGE ROUTES ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.render('home_page'));
app.get('/home', (req, res) => res.render('home_page'));
app.get('/about', (req, res) => res.render('About_us'));
app.get('/apply', (req, res) => res.render('Apply_Form'));
app.get('/courses', (req, res) => res.render('Courses'));
app.get('/gallery', (req, res) => res.render('Gallery'));
app.get('/admin', (req, res) => res.render('Admin_Dashboard'));
app.get('/member', (req, res) => res.render('member_dashboard'));
app.get('/login', (req, res) => {          // ← REPLACE your current /login route
  const errorMessages = {
    google_failed: 'Google sign-in failed. Only approved MIU accounts are allowed.',
    not_registered: 'This google account isn\'t registered, still didnt join? <a href="/apply" style="color: red; font-weight: bold; text-decoration: none;">apply now</a>',
    pending:       'Your account is pending admin approval. Please wait.',
    banned:        'Your account has been banned. Contact an admin.'
  };
  const error = req.query.error ? (errorMessages[req.query.error] || req.query.error) : null;
  res.render('Login', { error, user: null });
});
// ─── CATCH-ALL (MUST BE LAST) ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('home_page');
});

app.use(errorHandler);

// ─── START SERVER ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/TunersWebsite';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected:', MONGO_URI);
    app.listen(PORT, () => console.log(`🚀  Server running → http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });
