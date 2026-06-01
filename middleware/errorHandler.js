const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId (CastError) → 404
  if (err.name === 'CastError') {
    error = new ErrorResponse(`Resource not found`, 404);
  }

  // Mongoose duplicate key → 409
  if (err.code === 11000) {
    error = new ErrorResponse('You have already submitted an application.', 409);
  }

  // Mongoose validation errors → 400
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message);
    error = new ErrorResponse(message, 400);
  }

  // JWT errors → 401
  if (err.name === 'JsonWebTokenError') {
    error = new ErrorResponse('Invalid token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new ErrorResponse('Token expired. Please log in again.', 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
