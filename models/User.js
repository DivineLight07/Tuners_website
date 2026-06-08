const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, required: function() { return !this.googleId; }, minlength: 6, select: false },
  googleId:     { type: String, default: null },
  role:         { type: String, enum: ['member', 'admin'], default: 'member' },
  status:       { type: String, enum: ['pending', 'approved', 'rejected', 'banned'], default: 'pending' },
  universityId: { type: String, default: '' },
  avatar:       { type: String, default: null },
  badges:       { type: [String], default: [] },
  openedCourses:{ type: [String], default: [] }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed one
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

// Generate signed JWT
userSchema.methods.getSignedJwt = function () {
  const JWT_SECRET = process.env.JWT_SECRET || 'supersecretdevkey';
  return jwt.sign(
    { id: this._id, role: this.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);

