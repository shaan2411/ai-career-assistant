/**
 * middleware/errorMiddleware.js — Global Error Handler
 *
 * Handles all errors thrown in routes/controllers and returns
 * consistent JSON error responses.
 */

/**
 * notFound — 404 middleware for unmatched routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * errorHandler — Global error handling middleware
 * Must have 4 parameters to be recognized as error middleware by Express.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with id: ${err.value}`;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use a different value.`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join('. ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please login again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please login again.';
  }

  // Multer file size limit
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size too large. Maximum size is 5MB.';
  }

  // Multer file type error
  if (err.code === 'INVALID_FILE_TYPE') {
    statusCode = 400;
    message = err.message;
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`❌ [${statusCode}] ${message}`);
    if (statusCode === 500) console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && statusCode === 500
      ? { stack: err.stack }
      : {}),
  });
};

module.exports = { notFound, errorHandler };
