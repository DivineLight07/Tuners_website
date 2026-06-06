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
    // ✅ FIX: Added 'badges', 'status', and 'password' to the allowed list!
    const allowedUpdates = ['name', 'email', 'universityId', 'role', 'status', 'badges', 'password'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ success: false, error: 'Invalid updates!' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // Apply updates (skip password here, we handle it below so it gets hashed)
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined && field !== 'password') {
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
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
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