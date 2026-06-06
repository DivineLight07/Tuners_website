const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllBoardMembers,
  createBoardMember,
  updateBoardMember,
  deleteBoardMember
} = require('../controllers/boardController');

// Public route - anyone can view board members
router.get('/', getAllBoardMembers);

// Admin-only routes
router.post('/', protect, authorize('admin'), createBoardMember);
router.put('/:id', protect, authorize('admin'), updateBoardMember);
router.delete('/:id', protect, authorize('admin'), deleteBoardMember);

module.exports = router;