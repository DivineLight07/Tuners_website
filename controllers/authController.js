const User          = require('../models/User');
const Application    = require('../models/Application');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');

const MIU_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)*miuegypt\.edu\.eg$/i;

// @desc    Create an account (step 1 of "sign up, then apply")
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array().map(e => e.msg).join(', '), 400));
  }

  const { name, email, password } = req.body;
  if (!MIU_EMAIL_REGEX.test(email)) {
    return next(new ErrorResponse('You must sign up with an MIU email address (e.g. your.name@miuegypt.edu.eg)', 400));
  }

  try {
    // status defaults to 'pending' — the account exists but isn't a member
    // until an admin approves the application submitted right after this.
    const user = await User.create({ name, email, password });
    const token = user.getSignedJwt();
    res.status(201).json({
      success: true, token,
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, status: user.status,
        universityId: user.universityId, avatar: user.avatar, badges: user.badges,
        openedCourses: user.openedCourses
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new ErrorResponse('An account with this email already exists', 409));
    }
    if (err.name === 'ValidationError') {
      return next(new ErrorResponse(Object.values(err.errors).map(e => e.message).join(', '), 400));
    }
    next(err);
  }
};

const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array().map(e => e.msg).join(', '), 400));
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user)          return next(new ErrorResponse('Invalid email or password', 401));
    if (!user.password) return next(new ErrorResponse('This account uses Google Sign-In', 401));

    const isMatch = await user.matchPassword(password);
    if (!isMatch)       return next(new ErrorResponse('Invalid email or password', 401));

    // 'pending' and 'rejected' can still log in — they need to reach their
    // dashboard to see their application status (or the rejection notice).
    if (user.status === 'banned') return next(new ErrorResponse('Your account has been banned', 403));

    const token = user.getSignedJwt();
    res.status(200).json({
      success: true, token,
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, status: user.status,
        universityId: user.universityId, avatar: user.avatar, badges: user.badges,
        openedCourses: user.openedCourses
      }
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete the logged-in account (used when a rejected applicant
//          dismisses the rejection notice — they go back to being a guest)
// @route   DELETE /api/v1/auth/me
// @access  Private
const deleteMe = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next(new ErrorResponse('Admin accounts can\'t be self-deleted', 400));
    }
    await Application.deleteOne({ user: req.user.id });
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, deleteMe };
