const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
    },
    status: {
      type: String,
      enum: ['saved', 'applied', 'interviewing', 'offered', 'rejected'],
      default: 'saved',
    },
    notes: {
      type: String,
      trim: true,
    },
    appliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index to prevent duplicate saves
savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

const SavedJob = mongoose.model('SavedJob', savedJobSchema);

module.exports = SavedJob;
