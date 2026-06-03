const express     = require('express');
const router      = express.Router();
const { body }    = require('express-validator');

// Import auth functions
const { register, login, logout, getMe } = require('../controllers/authController');

// Import user management functions from userController.js
const { getAllUsers, createUser, updateUser, deleteUser, addBadge } = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

const validateRegister = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('universityId').notEmpty().withMessage('University ID is required')
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// ─── USER MANAGEMENT ROUTES (Admin Only) ────────────────────────────────────
router.get('/users', protect, authorize('admin'), getAllUsers);
router.post('/users', protect, authorize('admin'), createUser);
router.patch('/users/:id', protect, authorize('admin'), updateUser);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);
router.patch('/users/:id/badge', protect, authorize('admin'), addBadge);

// ─── AUTH ROUTES ────────────────────────────────────────────────────────────
router.post('/register', validateRegister, register);
router.post('/login',    validateLogin,    login);
router.get('/logout',                      logout);
router.get('/me',        protect,          getMe);

module.exports = router;