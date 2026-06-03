const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  status: { 
    type: String, 
    enum: ['Open', 'Closed'], 
    default: 'Closed' 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Room', roomSchema);