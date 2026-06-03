require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/TunersWebsite';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✓ MongoDB connected');
    
    // Get all users
    const users = await User.find({}).select('+password');
    
    console.log('\n=== ALL USERS IN DATABASE ===\n');
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  _id: ${user._id}`);
      console.log(`  name: ${user.name}`);
      console.log(`  email: ${user.email}`);
      console.log(`  password: ${user.password ? '(hashed)' : 'MISSING'}`);
      console.log(`  role: ${user.role}`);
      console.log(`  status: ${user.status} ⚠️ ${user.status === 'pending' ? '❌ PENDING - MUST BE approved' : '✓'}`);
      console.log(`  universityId: ${user.universityId || '(empty)'}`);
      console.log('');
    });

    if (users.length === 0) {
      console.log('❌ NO USERS FOUND IN DATABASE!\n');
      console.log('You need to add a user. Use the register endpoint or add one manually:');
      console.log('POST /api/v1/auth/register');
      console.log('Body: { "name": "Your Name", "email": "you@miuegypt.edu.eg", "password": "Password123", "universityId": "ID123" }');
    }

    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });
