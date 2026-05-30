const express    = require('express');
const mongoose   = require('mongoose');
const dotenv     = require('dotenv');
const path       = require('path');
const cors       = require('cors');

const errorHandler = require('./middleware/errorHandler');

// ── Load env vars ─────────────────────────────────────────────────────────────
dotenv.config({ path: '.env' });

// ── App setup ─────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ── Serve frontend static files from /public ──────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ────────────────────────────────────────────────────────────────
const applications = require('./routes/applications');
app.use('/api/v1/applications', applications);

// ── Catch-all: serve tuners.html for any non-API route ───────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tuners.html'));
});

// ── Error handler middleware (must be last) ───────────────────────────────────
app.use(errorHandler);

// ── Connect to MongoDB & start server ────────────────────────────────────────
const PORT     = process.env.PORT     || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tuners_db';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected:', MONGO_URI);
    app.listen(PORT, () =>
      console.log(`🚀  Server running → http://localhost:${PORT}`)
    );
  })
  .catch(err => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });
