const express = require('express');
const router = express.Router();
const {
  analyzeResume,
  generateSummary,
  generateCoverLetter,
  skillGapAnalysis,
  careerPathSuggestions,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  generateLearningRoadmap,
  generateProjectIdeas,
  generateWeeklyReport,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// All AI routes require authentication (student or admin)
router.use(protect);

router.post('/analyze-resume', analyzeResume);
router.post('/generate-summary', generateSummary);
router.post('/generate-cover-letter', generateCoverLetter);
router.post('/skill-gap', skillGapAnalysis);
router.post('/career-paths', careerPathSuggestions);
router.post('/interview-questions', generateInterviewQuestions);
router.post('/interview-feedback', evaluateInterviewAnswer);
router.post('/learning-roadmap', generateLearningRoadmap);
router.post('/project-ideas', generateProjectIdeas);
router.post('/weekly-report', generateWeeklyReport);

module.exports = router;
