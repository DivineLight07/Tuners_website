require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const session      = require('express-session');
require('./config/passport');
const passport     = require('passport');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

connectDB();

app.use(helmet({ contentSecurityPolicy: false })); 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.set('view engine', 'ejs');

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Tuners API is running' });
});

app.use('/api/v1/auth',   require('./routes/auth'));
app.use('/auth/google',   require('./routes/googleAuth'));

app.get('/', (req, res) => res.render('home', { user: null }));

app.get('/login', (req, res) => {
  const errorMessages = {
    google_failed: 'Google sign-in failed. Only approved MIU accounts are allowed.',
    pending:       'Your account is pending admin approval. Please wait.',
    banned:        'Your account has been banned. Contact an admin.'
  };
  const error = req.query.error ? (errorMessages[req.query.error] || req.query.error) : null;
  res.render('login', { error, user: null });
});

app.get('/dashboard', (req, res) => res.render('dashboard', {}));
app.get('/admin',     (req, res) => res.render('admin',     { user: {} }));
app.get('/member',    (req, res) => res.render('member',    { user: {} }));

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'Route not found' });
  }
  res.status(404).render('404', { user: null });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

