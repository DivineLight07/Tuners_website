const ErrorResponse = require('../utils/errorResponse');

// Central error handler — registered LAST in server.js
// Every controller calls next(err) or next(new ErrorResponse(...)) to land here
//
// The 4 parameters (err, req, res, next) are what makes Express treat
// this as an error-handling middleware vs a normal middleware

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log for dev
  console.error('❌', err.message);

  // ── Mongoose bad ObjectId (e.g. /api/v1/users/not-a-real-id) ──────────────
  if (err.name === 'CastError') {
    error = new ErrorResponse('Resource not found', 404);
  }

  // ── Mongoose validation error (required field missing, enum invalid) ───────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    error = new ErrorResponse(messages.join(', '), 400);
  }

  // ── MongoDB duplicate key (unique index violation — e.g. email taken) ──────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ErrorResponse(`${field} already exists`, 409);
  }

  // ── JWT invalid signature ─────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error = new ErrorResponse('Invalid token', 401);
  }

  // ── JWT expired ───────────────────────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    error = new ErrorResponse('Token expired, please log in again', 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error:   error.message || 'Server Error'
  });
};

module.exports = errorHandler;
