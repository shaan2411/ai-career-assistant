const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'remote', 'contract'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: [{ type: String }],
    skills: [{ type: String }],
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'USD' },
    },
    applicationUrl: {
      type: String,
      trim: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search
jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ isActive: 1, createdAt: -1 });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
