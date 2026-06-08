const User = require('../models/User');
const Profile = require('../models/Profile');
const AIReport = require('../models/AIReport');
const InterviewHistory = require('../models/InterviewHistory');
const SavedJob = require('../models/SavedJob');
const Resume = require('../models/Resume');
const { calculateProfileCompletion } = require('../utils/helpers');
const path = require('path');

/**
 * @desc    Get current user's profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ userId: req.user._id }).populate(
      'userId',
      'name email avatar role createdAt lastLogin aiUsageCount'
    );

    if (!profile) {
      // Create one if it doesn't exist
      profile = await Profile.create({ userId: req.user._id });
      profile = await Profile.findById(profile._id).populate(
        'userId',
        'name email avatar role createdAt lastLogin aiUsageCount'
      );
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const {
      bio,
      phone,
      location,
      github,
      linkedin,
      portfolio,
      education,
      experience,
      skills,
      interests,
      careerGoal,
      name, // Allow updating name from profile endpoint
    } = req.body;

    // Update User name if provided
    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name }, { runValidators: true });
    }

    // Build update object
    const updateFields = {};
    if (bio !== undefined) updateFields.bio = bio;
    if (phone !== undefined) updateFields.phone = phone;
    if (location !== undefined) updateFields.location = location;
    if (github !== undefined) updateFields.github = github;
    if (linkedin !== undefined) updateFields.linkedin = linkedin;
    if (portfolio !== undefined) updateFields.portfolio = portfolio;
    if (education !== undefined) updateFields.education = education;
    if (experience !== undefined) updateFields.experience = experience;
    if (skills !== undefined) updateFields.skills = skills;
    if (interests !== undefined) updateFields.interests = interests;
    if (careerGoal !== undefined) updateFields.careerGoal = careerGoal;

    // Find and update profile (upsert: create if not exists)
    let profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    // Manually recalculate completion since pre-save doesn't fire on findOneAndUpdate
    const completion = calculateProfileCompletion(profile);
    profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { completionPercentage: completion } },
      { new: true }
    ).populate('userId', 'name email avatar role');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload/update user avatar
 * @route   POST /api/users/avatar
 * @access  Private
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Build the avatar URL path relative to server
    const avatarPath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarPath },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      avatar: user.avatar,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user activity history
 * @route   GET /api/users/activity
 * @access  Private
 */
const getActivityHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;

    // Fetch recent activity in parallel
    const [recentReports, recentInterviews, recentSavedJobs, recentResumes] =
      await Promise.all([
        AIReport.find({ userId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .select('reportType title createdAt'),

        InterviewHistory.find({ userId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .select('sessionTitle interviewType overallScore completedAt createdAt'),

        SavedJob.find({ userId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate('jobId', 'title company location type')
          .select('status appliedAt createdAt jobId'),

        Resume.find({ userId, isActive: true })
          .sort({ createdAt: -1 })
          .limit(limit)
          .select('fileName score createdAt'),
      ]);

    // Stats summary
    const [totalReports, totalInterviews, totalSavedJobs, totalResumes] =
      await Promise.all([
        AIReport.countDocuments({ userId }),
        InterviewHistory.countDocuments({ userId }),
        SavedJob.countDocuments({ userId }),
        Resume.countDocuments({ userId, isActive: true }),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalReports,
        totalInterviews,
        totalSavedJobs,
        totalResumes,
        aiUsageCount: req.user.aiUsageCount,
      },
      recent: {
        reports: recentReports,
        interviews: recentInterviews,
        savedJobs: recentSavedJobs,
        resumes: recentResumes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete (deactivate) user account
 * @route   DELETE /api/users/account
 * @access  Private
 */
const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message:
        'Account deactivated successfully. Contact support to reactivate.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getActivityHistory,
  deleteAccount,
};
