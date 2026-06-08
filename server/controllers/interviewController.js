const InterviewHistory = require('../models/InterviewHistory');
const { generateAIResponse } = require('../config/aiProvider');
const { parseAIJSON, paginate, getTotalPages } = require('../utils/helpers');

/**
 * @desc    Create a new interview session
 * @route   POST /api/interviews/sessions
 * @access  Private
 */
const createSession = async (req, res, next) => {
  try {
    const {
      sessionTitle,
      interviewType = 'mixed',
      targetRole,
      questions = [],
    } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'targetRole is required to create an interview session',
      });
    }

    const session = await InterviewHistory.create({
      userId: req.user._id,
      sessionTitle: sessionTitle || `${targetRole} - Mock Interview`,
      interviewType,
      targetRole,
      questions,
    });

    res.status(201).json({
      success: true,
      message: 'Interview session created successfully',
      session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all interview sessions for the current user
 * @route   GET /api/interviews/sessions
 * @access  Private
 */
const getSessions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    const [sessions, total] = await Promise.all([
      InterviewHistory.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .select('-answers'), // Exclude large answers in list view
      InterviewHistory.countDocuments({ userId: req.user._id }),
    ]);

    // Calculate average score
    const allSessions = await InterviewHistory.find({
      userId: req.user._id,
      overallScore: { $exists: true, $ne: null },
    }).select('overallScore');

    const avgScore =
      allSessions.length > 0
        ? Math.round(
            allSessions.reduce((sum, s) => sum + (s.overallScore || 0), 0) /
              allSessions.length
          )
        : 0;

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      page: pg,
      totalPages: getTotalPages(total, lim),
      averageScore: avgScore,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single interview session by ID
 * @route   GET /api/interviews/sessions/:id
 * @access  Private
 */
const getSessionById = async (req, res, next) => {
  try {
    const session = await InterviewHistory.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit answers for a session with AI evaluation
 * @route   POST /api/interviews/sessions/:id/submit
 * @access  Private
 */
const submitAnswers = async (req, res, next) => {
  try {
    const { answers, duration } = req.body; // answers: [{ questionIndex, answer }]

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'answers array is required',
      });
    }

    const session = await InterviewHistory.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    // Evaluate each answer with AI
    const evaluatedAnswers = [];
    let totalScore = 0;
    let evaluatedCount = 0;

    for (const answerObj of answers) {
      const { questionIndex, answer } = answerObj;

      if (
        questionIndex === undefined ||
        !answer ||
        answer.trim().length < 5
      ) {
        evaluatedAnswers.push({
          questionIndex,
          answer: answer || '',
          aiFeedback: 'Answer too short for evaluation.',
          score: 0,
        });
        continue;
      }

      const question = session.questions[questionIndex];
      if (!question) {
        continue;
      }

      try {
        const systemInstruction = `You are an expert interviewer. Evaluate interview answers concisely and fairly. 
Always respond ONLY with valid JSON.`;

        const prompt = `Evaluate this interview answer for a ${session.targetRole} position.

QUESTION: "${question.question}"
CATEGORY: ${question.category || 'General'}
DIFFICULTY: ${question.difficulty || 'medium'}

ANSWER: "${answer}"

Return ONLY valid JSON:
{
  "score": <1-10>,
  "feedback": "<2-3 sentence specific feedback>",
  "strengths": [<1-2 strengths>],
  "improvements": [<1-2 improvements>]
}`;

        const aiResponse = await generateAIResponse(prompt, systemInstruction);
        const parsed = parseAIJSON(aiResponse);

        const score = parsed ? Math.min(10, Math.max(0, parsed.score || 5)) : 5;
        totalScore += score;
        evaluatedCount++;

        evaluatedAnswers.push({
          questionIndex,
          answer,
          aiFeedback: parsed
            ? parsed.feedback
            : 'Could not evaluate this answer.',
          score,
          strengths: parsed ? parsed.strengths : [],
          improvements: parsed ? parsed.improvements : [],
        });
      } catch (aiError) {
        console.error('AI evaluation error for answer:', aiError.message);
        evaluatedAnswers.push({
          questionIndex,
          answer,
          aiFeedback: 'AI evaluation unavailable for this answer.',
          score: 5,
        });
        totalScore += 5;
        evaluatedCount++;
      }
    }

    // Calculate overall score (out of 100)
    const overallScore =
      evaluatedCount > 0
        ? Math.round((totalScore / (evaluatedCount * 10)) * 100)
        : 0;

    // Update session
    session.answers = evaluatedAnswers;
    session.overallScore = overallScore;
    session.completedAt = new Date();
    if (duration) session.duration = duration;

    await session.save();

    res.status(200).json({
      success: true,
      message: 'Answers submitted and evaluated successfully',
      overallScore,
      answersEvaluated: evaluatedCount,
      answers: evaluatedAnswers,
      sessionId: session._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an interview session
 * @route   DELETE /api/interviews/sessions/:id
 * @access  Private
 */
const deleteSession = async (req, res, next) => {
  try {
    const session = await InterviewHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Interview session deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  submitAnswers,
  deleteSession,
};
