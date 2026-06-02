const User          = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');

const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array().map(e => e.msg).join(', '), 400));
  }
  const { name, email, password, universityId } = req.body;
  try {
    const user  = await User.create({ name, email, password, universityId });
    const token = user.getSignedJwt();
    res.status(201).json({ success: true, token, user: {
      id: user._id, name: user.name, email: user.email,
      role: user.role, status: user.status
    }});
  } catch (err) {
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

    if (user.status === 'pending') return next(new ErrorResponse('Your account is pending admin approval', 403));
    if (user.status === 'banned')  return next(new ErrorResponse('Your account has been banned', 403));

    const token = user.getSignedJwt();
    res.status(200).json({
      success: true, token,
      user: {
        id: user._id, name: user.name, email: user.email,
        role: user.role, status: user.status,
        universityId: user.universityId, avatar: user.avatar, badges: user.badges
      }
    });
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe };
