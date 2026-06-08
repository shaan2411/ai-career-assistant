const mongoose = require('mongoose');

const aiReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    reportType: {
      type: String,
      enum: [
        'resume-analysis',
        'career-paths',
        'skill-gap',
        'weekly-report',
        'learning-roadmap',
        'project-ideas',
        'cover-letter',
        'interview-questions',
        'interview-feedback',
        'summary-generation',
      ],
      required: [true, 'Report type is required'],
    },
    title: {
      type: String,
      trim: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed, // JSON object with AI response
    },
    exportedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

aiReportSchema.index({ userId: 1, reportType: 1, createdAt: -1 });

const AIReport = mongoose.model('AIReport', aiReportSchema);

module.exports = AIReport;
