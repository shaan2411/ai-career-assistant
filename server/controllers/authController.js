const { validationResult } = require('express-validator');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { generateToken } = require('../utils/generateToken');
const { sendWelcomeEmail } = require('../utils/emailService');
const { formatError } = require('../utils/helpers');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const { messages } = formatError(errors.array());
      return res.status(400).json({
        success: false,
        message: messages[0],
        errors: messages,
      });
    }

    const { name, email, password, role } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create user (password will be hashed by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role === 'admin' ? 'student' : (role || 'student'), // Prevent self-promotion to admin
    });

    // Create an empty profile for the new user
    await Profile.create({ userId: user._id });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch((err) =>
      console.error('Welcome email error:', err.message)
    );

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const { messages } = formatError(errors.array());
      return res.status(400).json({
        success: false,
        message: messages[0],
        errors: messages,
      });
    }

    const { email, password } = req.body;

    // Find user with password (select: false by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message:
          'Your account has been deactivated. Please contact support for assistance.',
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate JWT
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        aiUsageCount: user.aiUsageCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Fetch profile as well
    const profile = await Profile.findOne({ userId: user._id });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        aiUsageCount: user.aiUsageCount,
        createdAt: user.createdAt,
      },
      profile: profile || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update logged-in user's password
 * @route   PUT /api/auth/update-password
 * @access  Private
 */
const updatePassword = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const { messages } = formatError(errors.array());
      return res.status(400).json({
        success: false,
        message: messages[0],
        errors: messages,
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Fetch user with password field
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Ensure new password is different
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Return new token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updatePassword };
