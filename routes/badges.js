const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getBadges, createBadge, deleteBadge } = require('../controllers/badgeController');

// GET all badges (requires authentication)
router.get('/', protect, getBadges);

// POST create new badge (admin only)
router.post('/', protect, authorize('admin'), createBadge);

// DELETE badge (admin only)
router.delete('/:id', protect, authorize('admin'), deleteBadge);

module.exports = router;
