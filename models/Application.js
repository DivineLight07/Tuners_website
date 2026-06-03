const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    trim: true
  },
  year: {
    type: String,
    required: [true, 'Year is required'],
    enum: {
      values: ['1st', '2nd', '3rd', '4th', '5th', "Graduate"],
      message: 'Year must be 1st, 2nd, 3rd, 4th, 5th, or Graduate'
    }
  },
  committee: {
    type: String,
    required: [true, 'Committee selection is required']
  },
  major: {
    type: String,
    required: [true, 'Major is required']
  },
  instrument: {
    type: String,
    default: ''
  },
  hear: {
    type: String,
    default: ''
  },
  reason: {
    type: String,
    required: [true, 'Reason for joining is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{11}$/, 'Phone must be exactly 11 digits']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Create separate indexes for faster duplicate checking
ApplicationSchema.index({ email: 1 });
ApplicationSchema.index({ studentId: 1 });
ApplicationSchema.index({ phone: 1 });
ApplicationSchema.index({ name: 1 });

// Compound unique index — one application per email+studentId combination (backup safety)
ApplicationSchema.index({ email: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);