const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
} = require('../controllers/galleryController');

const upload = require('../middleware/upload');

router.get('/', getAllGalleryItems);
router.post('/', protect, authorize('admin'), upload.single('imageFile'), createGalleryItem);
router.put('/:id', protect, authorize('admin'), upload.single('imageFile'), updateGalleryItem);
router.delete('/:id', protect, authorize('admin'), deleteGalleryItem);

module.exports = router;
