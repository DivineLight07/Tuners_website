// Custom error class that extends the built-in Error
// Adds a statusCode property so the error handler knows which HTTP code to send
//
// Usage anywhere in a controller:
//   return next(new ErrorResponse('User not found', 404));

class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);       // sets this.message
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
