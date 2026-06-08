const User = require('../models/User');
const Profile = require('../models/Profile');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const InterviewHistory = require('../models/InterviewHistory');
const AIReport = require('../models/AIReport');
const SavedJob = require('../models/SavedJob');
const LearningPlan = require('../models/LearningPlan');
const { paginate, getTotalPages } = require('../utils/helpers');

/**
 * @desc    Get paginated list of all users with search and role filter
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const { search, role, isActive, page = 1, limit = 20 } = req.query;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .select('-password'),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: pg,
      totalPages: getTotalPages(total, lim),
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user with profile and stats
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [profile, resumeCount, interviewCount, reportCount, savedJobCount] =
      await Promise.all([
        Profile.findOne({ userId: user._id }),
        Resume.countDocuments({ userId: user._id, isActive: true }),
        InterviewHistory.countDocuments({ userId: user._id }),
        AIReport.countDocuments({ userId: user._id }),
        SavedJob.countDocuments({ userId: user._id }),
      ]);

    res.status(200).json({
      success: true,
      user,
      profile,
      stats: {
        resumeCount,
        interviewCount,
        aiReportCount: reportCount,
        savedJobCount,
        aiUsageCount: user.aiUsageCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Activate or deactivate a user account
 * @route   PUT /api/admin/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isActive (boolean) is required',
      });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Hard delete a user and all related data
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account via admin panel',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Hard delete all related data in parallel
    await Promise.all([
      Profile.deleteOne({ userId: req.params.id }),
      Resume.deleteMany({ userId: req.params.id }),
      InterviewHistory.deleteMany({ userId: req.params.id }),
      AIReport.deleteMany({ userId: req.params.id }),
      SavedJob.deleteMany({ userId: req.params.id }),
      LearningPlan.deleteOne({ userId: req.params.id }),
      User.findByIdAndDelete(req.params.id),
    ]);

    res.status(200).json({
      success: true,
      message: `User "${user.email}" and all related data permanently deleted`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get platform-wide analytics
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
const getPlatformAnalytics = async (req, res, next) => {
  try {
    // Get 7-day window
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      activeUsers,
      newUsersThisWeek,
      totalResumes,
      totalJobs,
      totalInterviews,
      aiUsageAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Resume.countDocuments({ isActive: true }),
      Job.countDocuments({ isActive: true }),
      InterviewHistory.countDocuments(),
      User.aggregate([
        { $group: { _id: null, totalAIUsage: { $sum: '$aiUsageCount' } } },
      ]),
    ]);

    const aiUsageTotal =
      aiUsageAgg.length > 0 ? aiUsageAgg[0].totalAIUsage : 0;

    // User growth over last 7 days
    const userGrowthPipeline = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      userGrowthPipeline.push({ date, nextDate });
    }

    const userGrowth = await Promise.all(
      userGrowthPipeline.map(async ({ date, nextDate }) => ({
        date: date.toISOString().split('T')[0],
        newUsers: await User.countDocuments({
          createdAt: { $gte: date, $lt: nextDate },
        }),
      }))
    );

    // AI report type breakdown (popular features)
    const popularFeatures = await AIReport.aggregate([
      { $group: { _id: '$reportType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $project: { feature: '$_id', count: 1, _id: 0 } },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        newUsersThisWeek,
        totalResumes,
        totalJobs,
        totalInterviews,
        aiUsageTotal,
        userGrowth,
        popularFeatures,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get AI usage stats per user and by report type
 * @route   GET /api/admin/ai-usage
 * @access  Private/Admin
 */
const getAIUsageStats = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    const [topUsers, reportTypeBreakdown, total] = await Promise.all([
      User.find({ aiUsageCount: { $gt: 0 } })
        .sort({ aiUsageCount: -1 })
        .skip(skip)
        .limit(lim)
        .select('name email aiUsageCount role lastLogin'),

      AIReport.aggregate([
        { $group: { _id: '$reportType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { reportType: '$_id', count: 1, _id: 0 } },
      ]),

      User.countDocuments({ aiUsageCount: { $gt: 0 } }),
    ]);

    const totalAICallsAgg = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$aiUsageCount' } } },
    ]);

    res.status(200).json({
      success: true,
      totalAICalls:
        totalAICallsAgg.length > 0 ? totalAICallsAgg[0].total : 0,
      total,
      page: pg,
      totalPages: getTotalPages(total, lim),
      topUsers,
      reportTypeBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin create a new job listing
 * @route   POST /api/admin/jobs
 * @access  Private/Admin
 */
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      location,
      type,
      description,
      requirements,
      skills,
      salary,
      applicationUrl,
      expiresAt,
    } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({
        success: false,
        message: 'title, company, and description are required',
      });
    }

    const job = await Job.create({
      title,
      company,
      location,
      type,
      description,
      requirements: requirements || [],
      skills: skills || [],
      salary,
      applicationUrl,
      expiresAt,
      postedBy: req.user._id,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Job listing created successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin get all jobs (including inactive) with stats
 * @route   GET /api/admin/jobs
 * @access  Private/Admin
 */
const getAllJobs = async (req, res, next) => {
  try {
    const { search, type, isActive, page = 1, limit = 20 } = req.query;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    const query = {};
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .populate('postedBy', 'name email'),
      Job.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: pg,
      totalPages: getTotalPages(total, lim),
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin update a job listing
 * @route   PUT /api/admin/jobs/:id
 * @access  Private/Admin
 */
const updateJob = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'title', 'company', 'location', 'type', 'description',
      'requirements', 'skills', 'salary', 'applicationUrl',
      'isActive', 'expiresAt',
    ];

    const updateData = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin delete a job listing
 * @route   DELETE /api/admin/jobs/:id
 * @access  Private/Admin
 */
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Also remove all saved job entries for this job
    await SavedJob.deleteMany({ jobId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Job listing permanently deleted',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getPlatformAnalytics,
  getAIUsageStats,
  createJob,
  getAllJobs,
  updateJob,
  deleteJob,
};
