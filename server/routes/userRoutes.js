const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  getActivityHistory,
  deleteAccount,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');

// All routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/avatar', uploadResume, uploadAvatar); // Reuse multer for avatar upload
router.get('/activity', getActivityHistory);
router.delete('/account', deleteAccount);

module.exports = router;
