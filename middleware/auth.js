const ErrorResponse = require('../utils/errorResponse');

/**
 * protect — verifies the JWT from the Authorization header.
 * Replace this stub with the real implementation from Yasser when available.
 */
exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ErrorResponse('Not authorised to access this route', 401));
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(
      authHeader.split(' ')[1],
      process.env.JWT_SECRET || 'CHANGE_THIS_SECRET'
    );
    req.user = decoded;
    next();
  } catch (err) {
    return next(new ErrorResponse('Invalid or expired token', 401));
  }
};

/**
 * authorize(...roles) — restricts access to specific roles.
 */
exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(
      new ErrorResponse(
        `User role '${req.user?.role}' is not authorised for this route`,
        403
      )
    );
  }
  next();
};
