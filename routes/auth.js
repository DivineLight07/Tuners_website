const express     = require('express');
const router      = express.Router();
const { body }    = require('express-validator');

const { login, getMe } = require('../controllers/authController');

const { protect } = require('../middleware/auth');

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// (User management routes live in routes/users.js)
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);

module.exports = router;