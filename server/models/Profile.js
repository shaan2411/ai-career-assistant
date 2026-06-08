const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, trim: true },
    degree: { type: String, trim: true },
    field: { type: String, trim: true },
    startYear: { type: Number },
    endYear: { type: Number },
    grade: { type: String, trim: true },
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, trim: true },
    title: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String, trim: true },
  },
  { _id: true }
);

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    portfolio: {
      type: String,
      trim: true,
    },
    education: [educationSchema],
    experience: [experienceSchema],
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    careerGoal: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware to calculate profile completion percentage
 */
profileSchema.pre('save', function (next) {
  this.completionPercentage = calculateCompletion(this);
  next();
});

/**
 * Calculate profile completion percentage
 */
function calculateCompletion(profile) {
  const fields = [
    { value: profile.bio, weight: 10 },
    { value: profile.phone, weight: 5 },
    { value: profile.location, weight: 5 },
    { value: profile.github, weight: 5 },
    { value: profile.linkedin, weight: 10 },
    { value: profile.portfolio, weight: 5 },
    { value: profile.education && profile.education.length > 0, weight: 20 },
    { value: profile.experience && profile.experience.length > 0, weight: 15 },
    { value: profile.skills && profile.skills.length > 0, weight: 15 },
    { value: profile.careerGoal, weight: 10 },
  ];

  let totalWeight = 0;
  let filledWeight = 0;

  fields.forEach(({ value, weight }) => {
    totalWeight += weight;
    if (value) {
      filledWeight += weight;
    }
  });

  return Math.round((filledWeight / totalWeight) * 100);
}

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
