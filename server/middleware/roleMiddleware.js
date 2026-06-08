/**
 * middleware/roleMiddleware.js — Role-Based Authorization
 *
 * Factory function that creates middleware to restrict access based on user roles.
 * Must be used AFTER the protect middleware.
 *
 * Usage:
 *   router.get('/admin', protect, authorize('admin'), handler)
 *   router.get('/both', protect, authorize('admin', 'student'), handler)
 */

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please login first.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This resource requires one of these roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

module.exports = { authorize };
