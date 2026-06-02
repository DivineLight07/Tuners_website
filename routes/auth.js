const express     = require('express');
const router      = express.Router();
const { body }    = require('express-validator');
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { runValidation } = require('../middleware/validation');

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

router.post('/register', validateRegister, runValidation, register);
router.post('/login',    validateLogin,    runValidation, login);
router.get('/logout',                      logout);
router.get('/me',        protect,          getMe);

module.exports = router;

