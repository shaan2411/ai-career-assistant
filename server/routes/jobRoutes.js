const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  getJobRecommendations,
  saveJob,
  getSavedJobs,
  updateSavedJobStatus,
  removeSavedJob,
  applyToJob,
} = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getJobs);

// Protected routes (must come before /:id to avoid route conflicts)
router.get('/recommendations', protect, getJobRecommendations);
router.get('/saved', protect, getSavedJobs);
router.post('/save/:id', protect, saveJob);
router.put('/saved/:id/status', protect, updateSavedJobStatus);
router.delete('/saved/:id', protect, removeSavedJob);
router.post('/apply/:id', protect, applyToJob);

// Public route — must come last to avoid conflicting with named routes above
router.get('/:id', getJobById);

module.exports = router;
