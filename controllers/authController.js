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

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  const { name, email, password, universityId, role } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorResponse('Name, email and password are required', 400));
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return next(new ErrorResponse('User already exists', 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      universityId,
      role: role || 'member',
      status: 'approved'
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        universityId: user.universityId,
        avatar: user.avatar,
        badges: user.badges
      }
    });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const { name, email, password, universityId, role, status, badges } = req.body;

  try {
    const user = await User.findById(id).select('+password');
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
      if (emailExists && emailExists._id.toString() !== id) {
        return next(new ErrorResponse('Email already exists', 400));
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (password) user.password = password;
    if (universityId !== undefined) user.universityId = universityId;
    if (role) user.role = role;
    if (status) user.status = status;
    if (badges !== undefined) user.badges = badges;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        universityId: user.universityId,
        avatar: user.avatar,
        badges: user.badges
      }
    });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted' });
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

module.exports = { register, login, logout, getMe, getUsers, createUser, updateUser, deleteUser };
