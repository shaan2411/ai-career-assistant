const express = require('express');
const router = express.Router();
const {
  getLearningPlan,
  updateLearningPlan,
  markItemComplete,
  bookmarkResource,
  removeBookmark,
  getBookmarks,
} = require('../controllers/learningController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/plan', getLearningPlan);
router.put('/plan', updateLearningPlan);
router.post('/plan/complete/:weekIndex', markItemComplete);

router.get('/bookmarks', getBookmarks);
router.post('/bookmarks', bookmarkResource);
router.delete('/bookmarks/:resourceId', removeBookmark);

module.exports = router;
