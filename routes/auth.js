const express     = require('express');
const router      = express.Router();
const { body }    = require('express-validator');

const { register, login, getMe, deleteMe } = require('../controllers/authController');

const { protect } = require('../middleware/auth');

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// (User management routes live in routes/users.js)
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.delete('/me', protect, deleteMe);

module.exports = router;
