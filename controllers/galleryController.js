const Gallery = require('../models/Gallery');
const ErrorResponse = require('../utils/errorResponse');
const fs = require('fs');
const path = require('path');

exports.getAllGalleryItems = async (req, res, next) => {
  try {
    const items = await Gallery.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
};

exports.createGalleryItem = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }
    const item = await Gallery.create(data);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

exports.updateGalleryItem = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
    }

    const item = await Gallery.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!item) {
      return next(new ErrorResponse(`Gallery item not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

exports.deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return next(new ErrorResponse(`Gallery item not found with id of ${req.params.id}`, 404));
    }
    
    if (item.imageUrl && item.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', 'public', item.imageUrl);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Failed to delete image file:', err);
      });
    }

    await item.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
