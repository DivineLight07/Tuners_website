const Room = require('../models/Room');

// GET room status
exports.getRoomStatus = async (req, res, next) => {
  try {
    let room = await Room.findOne();
    if (!room) room = await Room.create({ status: 'Closed' });
    res.status(200).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

// PUT room status
exports.setRoomStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['Open', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    let room = await Room.findOne();
    if (!room) {
      room = await Room.create({ status });
    } else {
      room.status = status;
      room.updatedAt = Date.now();
      await room.save();
    }

    res.status(200).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};