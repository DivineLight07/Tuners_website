const jwt          = require('jsonwebtoken');
const User         = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// ─── protect ──────────────────────────────────────────────────────────────────
// Reads the JWT from the Authorization header: "Bearer <token>"
// Verifies it, fetches the user from DB, attaches to req.user
// Used on any route that requires login

const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify the token using the secret — throws if expired or tampered
    const JWT_SECRET = process.env.JWT_SECRET || 'supersecretdevkey';
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach the full user object to req.user
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return next(new ErrorResponse('User no longer exists', 401));
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// ─── authorize ────────────────────────────────────────────────────────────────
// Used AFTER protect to check role
// Usage: router.get('/admin', protect, authorize('admin'), handler)
// Can accept multiple roles: authorize('admin', 'moderator')

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`Role '${req.user.role}' is not authorized to access this route`, 403)
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
