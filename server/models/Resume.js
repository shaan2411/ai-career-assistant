const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
    },
    parsedText: {
      type: String,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    analysis: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      suggestions: [{ type: String }],
      keywords: [{ type: String }],
      atsCompatibility: { type: String },
      overallVerdict: { type: String },
    },
    generatedSummary: {
      type: String,
    },
    extractedSkills: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
resumeSchema.index({ userId: 1, createdAt: -1 });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
