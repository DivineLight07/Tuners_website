const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getRoomStatus, setRoomStatus } = require('../controllers/roomController');

// Anyone can GET the status
router.get('/', getRoomStatus);

// Only admins can change the status
router.put('/', protect, authorize('admin'), setRoomStatus);

module.exports = router;