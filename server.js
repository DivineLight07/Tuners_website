const express    = require('express');
const mongoose   = require('mongoose');
const dotenv     = require('dotenv');
const path       = require('path');
const cors       = require('cors');

// Middleware
const errorHandler = require('./middleware/errorHandler');

// Routes
const applications = require('./routes/applications');
const auth = require('./routes/auth');
const users = require('./routes/users');
const room = require('./routes/room'); // ✅ Import room routes

dotenv.config({ path: '.env' });

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── API ROUTES (MUST BE FIRST!) ─────────────────────────────────────────────
app.use('/api/v1/users', users);
app.use('/api/v1/applications', applications);
<<<<<<< HEAD
const authRoutes = require('./routes/auth');
app.use('/api/v1/auth', authRoutes);
=======
app.use('/api/v1/auth', auth);
app.use('/api/v1/room', room);
app.use('/api/v1/board', require('./routes/board'));
app.use('/api/v1/courses', require('./routes/courses'));
>>>>>>> 23162bc5d788d462c9ae4f16fcac3b564001a533

// ─── PAGE ROUTES ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.render('Apply_Form'));
app.get('/home', (req, res) => res.render('home_page'));
app.get('/about', (req, res) => res.render('About_us'));
app.get('/apply', (req, res) => res.render('Apply_Form'));
app.get('/courses', (req, res) => res.render('Courses'));
app.get('/login', (req, res) => res.render('Login'));
app.get('/admin', (req, res) => res.render('Admin_Dashboard'));
app.get('/member', (req, res) => res.render('member_dashboard'));

// ─── CATCH-ALL (MUST BE LAST) ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('Apply_Form');
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