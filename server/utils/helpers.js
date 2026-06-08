/**
 * utils/helpers.js — Backend Utility Functions
 */

/**
 * Get pagination parameters from query string
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {{ skip: number, limit: number, page: number }}
 */
const getPagination = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (p - 1) * l;
  return { skip, limit: l, page: p };
};

/**
 * Create pagination meta info for API responses
 * @param {number} total - Total document count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {{ total, page, pages, limit, hasMore }}
 */
const getPaginationMeta = (total, page, limit) => ({
  total,
  page,
  pages: Math.ceil(total / limit),
  limit,
  hasMore: page * limit < total,
});

/**
 * Remove sensitive fields from user object
 * @param {Object} user - Mongoose user document
 * @returns {Object} - User without password
 */
const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

/**
 * Calculate profile completion percentage
 * @param {Object} profile - Profile document
 * @returns {number} - Completion percentage (0-100)
 */
const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;

  const checks = [
    !!profile.bio && profile.bio.length > 10,
    !!profile.phone,
    !!profile.location,
    !!profile.github,
    !!profile.linkedin,
    Array.isArray(profile.skills) && profile.skills.length >= 3,
    Array.isArray(profile.education) && profile.education.length > 0,
    Array.isArray(profile.experience) && profile.experience.length > 0,
    !!profile.careerGoal,
    Array.isArray(profile.interests) && profile.interests.length > 0,
  ];

  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
};

/**
 * Format express-validator errors array into a readable message
 * @param {Array} errors - express-validator errors
 * @returns {string}
 */
const formatValidationErrors = (errors) => {
  return errors.array().map((e) => e.msg).join('. ');
};

/**
 * Create a simple error with a status code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error}
 */
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Calculate skill match score between user skills and job skills
 * @param {string[]} userSkills - User's skills
 * @param {string[]} jobSkills - Job's required skills
 * @returns {number} - Match percentage (0-100)
 */
const calculateSkillMatch = (userSkills, jobSkills) => {
  if (!jobSkills || jobSkills.length === 0) return 50;
  if (!userSkills || userSkills.length === 0) return 0;

  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  const matches = jobSkills.filter((skill) =>
    userSkillsLower.some(
      (us) => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us)
    )
  );

  return Math.round((matches.length / jobSkills.length) * 100);
};

/**
 * Generate a greeting based on current time
 * @returns {string}
 */
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const paginate = getPagination;
const getTotalPages = (total, limit) => Math.ceil(total / (limit || 10));

module.exports = {
  getPagination,
  getPaginationMeta,
  sanitizeUser,
  calculateProfileCompletion,
  formatValidationErrors,
  createError,
  calculateSkillMatch,
  getTimeGreeting,
  paginate,
  getTotalPages,
};
