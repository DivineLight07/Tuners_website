const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, default: null },
  googleId:     { type: String, default: null },

  // 'member' by default — manually promote to 'admin' in MongoDB Atlas
  role:         { type: String, enum: ['member', 'admin'], default: 'member' },

  // 'pending' until admin approves — only approved members can book rooms
  status:       { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },

  universityId: { type: String, default: '' },
  avatar:       { type: String, default: null },
  badges:       { type: [String], default: [] }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
