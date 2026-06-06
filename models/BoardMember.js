const mongoose = require('mongoose');

const boardMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  image: {
    type: String,
    default: '/images/default-avatar.png' // Fallback image
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  socialMedia: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  order: {
    type: Number,
    default: 0 // For sorting members (e.g., president first)
  }
}, { timestamps: true });

// Index for sorting
boardMemberSchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.model('BoardMember', boardMemberSchema);