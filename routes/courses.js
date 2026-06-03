const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllCourses,
  getAllCoursesAdmin,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

// Public route - anyone can view published courses
router.get('/', getAllCourses);

// Admin-only routes
router.get('/admin', protect, authorize('admin'), getAllCoursesAdmin);
router.post('/', protect, authorize('admin'), createCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);

module.exports = router;