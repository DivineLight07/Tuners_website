const User = require('../models/User');

// GET all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    next(err);
  }
};

// POST create a new user (admin adds manually)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, universityId } = req.body;
    
    // FIX 1: Set status to 'approved' so admin-created users can log in immediately
    const user = await User.create({ 
      name, 
      email, 
      password, 
      role, 
      universityId,
      status: 'approved' 
    });
    
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, data: userObj });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
  }
};

// PUT update a user
exports.updateUser = async (req, res, next) => {
  try {
    // ✅ FIX: Added 'oldPassword' to allowed list to pass validation
    const allowedUpdates = ['name', 'email', 'universityId', 'role', 'status', 'badges', 'password', 'openedCourses', 'oldPassword'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ success: false, error: 'Invalid updates!' });
    }

    const user = await User.findById(req.params.id).select('+password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // Permission checks
    if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this user' });
    }
    
    // Security check: Admin editing their own profile (and not using Google auth)
    if (req.user._id.toString() === user._id.toString() && !user.googleId) {
      if (!req.body.oldPassword) {
        return res.status(400).json({ success: false, error: 'Please provide your current password to save changes.' });
      }
      const isMatch = await user.matchPassword(req.body.oldPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Incorrect current password.' });
      }
    }
    
    if (user.email === 'admin@miuegypt.edu.eg' && req.user.email !== 'admin@miuegypt.edu.eg') {
      return res.status(403).json({ success: false, error: 'Cannot modify the system admin.' });
    }
    if (user.role === 'admin' && req.user.email !== 'admin@miuegypt.edu.eg' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Only system admin can modify other admins.' });
    }

    // Apply updates (skip password/oldPassword here)
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined && field !== 'password' && field !== 'oldPassword') {
        user[field] = req.body[field];
      }
    });

    // Handle password update specifically to trigger pre('save') hashing
    if (req.body.password) {
      user.password = req.body.password; 
    }

    await user.save();
// ... (leave the rest of the function as is)

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ success: true, data: userObj });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: err.message });
    }
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }
    next(err);
  }
};

// DELETE a user
exports.deleteUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ success: false, error: 'User not found' });

    if (targetUser.email === 'admin@miuegypt.edu.eg') {
      return res.status(403).json({ success: false, error: 'Cannot delete the system admin.' });
    }
    if (targetUser.role === 'admin' && req.user.email !== 'admin@miuegypt.edu.eg') {
      return res.status(403).json({ success: false, error: 'Only system admin can delete other admins.' });
    }

    await targetUser.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

// PATCH add a badge to a user
exports.addBadge = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { badges: req.body.badge } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};