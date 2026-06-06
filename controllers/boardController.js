const BoardMember = require('../models/BoardMember');

// GET all board members (public)
exports.getAllBoardMembers = async (req, res, next) => {
  try {
    const members = await BoardMember.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (err) {
    next(err);
  }
};

// POST create new board member (admin only)
exports.createBoardMember = async (req, res, next) => {
  try {
    const { name, position, image, bio, socialMedia, order } = req.body;
    
    const member = await BoardMember.create({
      name,
      position,
      image: image || '/images/default-avatar.png',
      bio: bio || '',
      socialMedia: socialMedia || {},
      order: order || 0
    });

    res.status(201).json({
      success: true,
      message: 'Board member added successfully',
      data: member
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    next(err);
  }
};

// PUT update board member (admin only)
exports.updateBoardMember = async (req, res, next) => {
  try {
    const member = await BoardMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ success: false, error: 'Board member not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Board member updated successfully',
      data: member
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    next(err);
  }
};

// DELETE board member (admin only)
exports.deleteBoardMember = async (req, res, next) => {
  try {
    const member = await BoardMember.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ success: false, error: 'Board member not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Board member deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};