require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/TunersWebsite';
const email = process.argv[2] || 'admin@miuegypt.edu.eg';
const password = process.argv[3] || 'Admin123!';
const name = process.argv[4] || 'Admin User';
const universityId = process.argv[5] || 'MIU0001';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✓ MongoDB connected to', MONGO_URI);

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      console.log('⚠️  User already exists:', existing.email);
      console.log('  role:', existing.role);
      console.log('  status:', existing.status);
      process.exit(0);
    }

    const user = await User.create({
      name,
      email,
      password,
      universityId,
      role: 'admin',
      status: 'approved'
    });

    console.log('✅ Admin user created successfully:');
    console.log('  email:', user.email);
    console.log('  password:', password);
    console.log('  role:', user.role);
    console.log('  status:', user.status);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Failed to create user:', err.message);
    process.exit(1);
  });
