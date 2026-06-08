/**
 * utils/generateToken.js — JWT Token Generator
 *
 * Generates a signed JWT token for a given user ID and role.
 */

const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token
 * @param {string} id - User's MongoDB ObjectId
 * @param {string} role - User's role ('student' | 'admin')
 * @returns {string} - Signed JWT token
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
      issuer: 'ai-career-assistant',
      audience: 'ai-career-assistant-users',
    }
  );
};

module.exports = { generateToken };
