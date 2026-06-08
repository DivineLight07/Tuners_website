const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  instructor: {
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true
  },
  youtubeVideoId: {
    type: String,
    required: [true, 'YouTube video ID is required'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  category: {
    type: String,
    enum: ['Theory', 'Instrument', 'Vocal', 'Production', 'Other'],
    default: 'Other'
  },
  duration: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

courseSchema.index({ category: 1, order: 1 });

module.exports = mongoose.model('Course', courseSchema);