const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String },
    category: { type: String },
    difficulty: { type: String },
  },
  { _id: true }
);

const answerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number },
    answer: { type: String },
    aiFeedback: { type: String },
    score: { type: Number, min: 0, max: 10 },
  },
  { _id: true }
);

const interviewHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    sessionTitle: {
      type: String,
      default: 'Mock Interview',
      trim: true,
    },
    interviewType: {
      type: String,
      enum: ['technical', 'hr', 'mixed'],
      default: 'mixed',
    },
    targetRole: {
      type: String,
      trim: true,
    },
    questions: [questionSchema],
    answers: [answerSchema],
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    completedAt: {
      type: Date,
    },
    duration: {
      type: Number, // minutes
    },
  },
  {
    timestamps: true,
  }
);

interviewHistorySchema.index({ userId: 1, createdAt: -1 });

const InterviewHistory = mongoose.model(
  'InterviewHistory',
  interviewHistorySchema
);

module.exports = InterviewHistory;
