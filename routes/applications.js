const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const {
  submitApplication,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication
} = require('../controllers/applicationController');


const { protect, authorize } = require('../middleware/auth');


const validateApplication = [
  body('name')
    .notEmpty().withMessage('Full name is required')
    .trim()
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('studentId')
    .notEmpty().withMessage('Student ID is required'),

  body('phone')
    .matches(/^[0-9]{11}$/).withMessage('Phone must be exactly 11 digits'),

  body('reason')
    .notEmpty().withMessage('Reason for joining is required')
    .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),

  body('committee')
    .notEmpty().withMessage('Committee selection is required'),

  body('year')
    .isIn(['1st', '2nd', '3rd', '4th', '5th', 'graduate']).withMessage('Year must be 1st, 2nd, 3rd, 4th, 5th, or graduate'),

  body('major')
    .notEmpty().withMessage('Major is required')
];



const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};




router.post('/', validateApplication, runValidation, submitApplication);


router.get('/',     protect, authorize('admin'), getAllApplications);
router.patch('/:id', protect, authorize('admin'), updateApplicationStatus);
router.delete('/:id', protect, authorize('admin'), deleteApplication);

module.exports = router;
