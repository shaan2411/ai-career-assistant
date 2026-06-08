/**
 * middleware/authMiddleware.js — JWT Authentication Middleware
 *
 * Protects routes by verifying the JWT token from the Authorization header.
 * Attaches the authenticated user object to req.user.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — Middleware to verify JWT and authenticate user
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID (exclude password field)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User not found.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please login again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.',
    });
  }
};

module.exports = { protect };
