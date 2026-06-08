const Badge = require('../models/Badge');
const User = require('../models/User');

// GET all badges
exports.getBadges = async (req, res, next) => {
  try {
    const badges = await Badge.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, count: badges.length, data: badges });
  } catch (err) {
    next(err);
  }
};

// POST create a new badge
exports.createBadge = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Please provide a badge name' });
    }

    const badge = await Badge.create({ name });
    res.status(201).json({ success: true, data: badge });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'Badge already exists' });
    }
    next(err);
  }
};

// DELETE a badge
exports.deleteBadge = async (req, res, next) => {
  try {
    const badge = await Badge.findById(req.params.id);
    if (!badge) {
      return res.status(404).json({ success: false, error: 'Badge not found' });
    }

    // Remove this badge string from all users' badges array
    await User.updateMany(
      { badges: badge.name },
      { $pull: { badges: badge.name } }
    );

    await badge.deleteOne();
    res.status(200).json({ success: true, message: 'Badge deleted' });
  } catch (err) {
    next(err);
  }
};
