const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const {
  submitApplication,
  getMyApplication,
  acknowledgeMyApplication,
  getAllApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');

const { protect, authorize } = require('../middleware/auth');

const validateApplication = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('phone').matches(/^[0-9]{11}$/).withMessage('Phone must be exactly 11 digits'),
  body('reason')
    .notEmpty().withMessage('Reason for joining is required')
    .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
  body('committee').notEmpty().withMessage('Committee selection is required'),
  body('year').isIn(['1st', '2nd', '3rd', '4th', '5th', 'Graduate']).withMessage('Year must be 1st, 2nd, 3rd, 4th, 5th, or Graduate'),
  body('major').notEmpty().withMessage('Major is required')
];

const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });
  }
  next();
};

router.use(protect);

// ─── APPLICANT ────────────────────────────────────────────────────────────────
router.post('/', validateApplication, runValidation, submitApplication);
router.get('/me', getMyApplication);
router.patch('/me/acknowledge', acknowledgeMyApplication);

// ─── ADMIN ──────────────────────────────────────────────────────────────────
router.get('/', authorize('admin'), getAllApplications);
router.patch('/:id', authorize('admin'), updateApplicationStatus);

module.exports = router;
