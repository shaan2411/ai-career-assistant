const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    url: { type: String, trim: true },
    type: {
      type: String,
      enum: ['video', 'article', 'course', 'book', 'practice', 'other'],
      default: 'other',
    },
  },
  { _id: true }
);

const roadmapItemSchema = new mongoose.Schema(
  {
    week: { type: Number },
    topic: { type: String, trim: true },
    description: { type: String, trim: true },
    resources: [resourceSchema],
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const bookmarkedResourceSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    url: { type: String, trim: true },
    type: { type: String, trim: true },
    bookmarkedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const learningPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    targetRole: {
      type: String,
      trim: true,
    },
    currentSkills: [{ type: String }],
    skillGaps: [{ type: String }],
    roadmap: [roadmapItemSchema],
    bookmarkedResources: [bookmarkedResourceSchema],
    completedItems: [{ type: String }],
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

const LearningPlan = mongoose.model('LearningPlan', learningPlanSchema);

module.exports = LearningPlan;
