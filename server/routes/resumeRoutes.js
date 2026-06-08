const express = require('express');
const router = express.Router();
const {
  uploadResume,
  getMyResumes,
  getResumeById,
  deleteResume,
  setActiveResume,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const { uploadResume: uploadResumeMiddleware } = require('../middleware/uploadMiddleware');

// All routes require authentication
router.use(protect);

router.post('/upload', uploadResumeMiddleware, uploadResume);
router.get('/my', getMyResumes);
router.get('/:id', getResumeById);
router.delete('/:id', deleteResume);
router.put('/:id/activate', setActiveResume);

module.exports = router;
