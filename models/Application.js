const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  // One application per account — created right after the applicant signs up.
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Denormalized copy of the account's name/email at submission time, so the
  // admin dashboard can list applications without an extra lookup.
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required']
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
      values: ['1st', '2nd', '3rd', '4th', '5th', 'Graduate'],
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
  // Mirrors the linked User's status. Kept on the application too so the
  // admin dashboard can list "pending" ones without joining against users.
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Flips to true once the applicant has dismissed the accept/reject popup
  // on their dashboard, so it only shows once.
  acknowledged: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', ApplicationSchema);
