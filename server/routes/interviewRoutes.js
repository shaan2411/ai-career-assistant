const express = require('express');
const router = express.Router();
const {
  createSession,
  getSessions,
  getSessionById,
  submitAnswers,
  deleteSession,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.post('/sessions', createSession);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSessionById);
router.post('/sessions/:id/submit', submitAnswers);
router.delete('/sessions/:id', deleteSession);

module.exports = router;
