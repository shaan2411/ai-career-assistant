const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getPlatformAnalytics,
  getAIUsageStats,
  createJob,
  getAllJobs,
  updateJob,
  deleteJob,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes require authentication AND admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Analytics
router.get('/analytics', getPlatformAnalytics);
router.get('/ai-usage', getAIUsageStats);

// Job management (admin CRUD)
router.post('/jobs', createJob);
router.get('/jobs', getAllJobs);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);

module.exports = router;
