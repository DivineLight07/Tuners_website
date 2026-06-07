const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

gallerySchema.index({ order: 1, createdAt: -1 });

module.exports = mongoose.model('Gallery', gallerySchema);
