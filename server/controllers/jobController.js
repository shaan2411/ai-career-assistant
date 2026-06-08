const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const Resume = require('../models/Resume');
const { paginate, getTotalPages } = require('../utils/helpers');

/**
 * @desc    Get all jobs with search, filter, and pagination
 * @route   GET /api/jobs
 * @access  Public
 */
const getJobs = async (req, res, next) => {
  try {
    const { search, type, location, page = 1, limit = 10 } = req.query;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    const query = { isActive: true };

    // Filter by job type
    if (type) {
      query.type = type;
    }

    // Filter by location (case-insensitive)
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Text search on title, company, description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Exclude expired jobs
    query.$and = [
      ...(query.$and || []),
      {
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gte: new Date() } },
        ],
      },
    ];

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .populate('postedBy', 'name'),
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
 * @desc    Get single job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, isActive: true }).populate(
      'postedBy',
      'name'
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get personalized job recommendations based on user's resume skills
 * @route   GET /api/jobs/recommendations
 * @access  Private
 */
const getJobRecommendations = async (req, res, next) => {
  try {
    // Get user's most recent resume skills
    const latestResume = await Resume.findOne({
      userId: req.user._id,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .select('extractedSkills analysis');

    const userSkills =
      latestResume?.extractedSkills?.length > 0
        ? latestResume.extractedSkills
        : latestResume?.analysis?.keywords || [];

    if (userSkills.length === 0) {
      // Return latest jobs if no skills found
      const jobs = await Job.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('postedBy', 'name');

      return res.status(200).json({
        success: true,
        message: 'No resume skills found. Showing latest jobs.',
        recommendations: jobs,
        matchScore: null,
      });
    }

    // Find jobs matching user skills
    const lowerSkills = userSkills.map((s) => s.toLowerCase());
    const allJobs = await Job.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('postedBy', 'name');

    // Score each job by number of skill matches
    const scoredJobs = allJobs.map((job) => {
      const jobSkills = (job.skills || []).map((s) => s.toLowerCase());
      const matchCount = jobSkills.filter((skill) =>
        lowerSkills.some(
          (userSkill) => skill.includes(userSkill) || userSkill.includes(skill)
        )
      ).length;
      const matchScore =
        jobSkills.length > 0
          ? Math.round((matchCount / jobSkills.length) * 100)
          : 0;

      return { job, matchScore };
    });

    // Sort by match score and return top 10
    const recommendations = scoredJobs
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10)
      .map(({ job, matchScore }) => ({ ...job.toObject(), matchScore }));

    res.status(200).json({
      success: true,
      userSkills,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save a job
 * @route   POST /api/jobs/save/:id
 * @access  Private
 */
const saveJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, isActive: true });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const savedJob = await SavedJob.create({
      userId: req.user._id,
      jobId: req.params.id,
      status: 'saved',
    });

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      savedJob,
    });
  } catch (error) {
    // Handle duplicate key (already saved)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already saved this job',
      });
    }
    next(error);
  }
};

/**
 * @desc    Get current user's saved jobs
 * @route   GET /api/jobs/saved
 * @access  Private
 */
const getSavedJobs = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const { skip, limit: lim, page: pg } = paginate(page, limit);

    const query = { userId: req.user._id };
    if (status) query.status = status;

    const [savedJobs, total] = await Promise.all([
      SavedJob.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .populate({
          path: 'jobId',
          select: 'title company location type salary skills isActive',
        }),
      SavedJob.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: savedJobs.length,
      total,
      page: pg,
      totalPages: getTotalPages(total, lim),
      savedJobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update saved job application status
 * @route   PUT /api/jobs/saved/:id/status
 * @access  Private
 */
const updateSavedJobStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const savedJob = await SavedJob.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!savedJob) {
      return res.status(404).json({ success: false, message: 'Saved job not found' });
    }

    if (status) savedJob.status = status;
    if (notes !== undefined) savedJob.notes = notes;
    if (status === 'applied' && !savedJob.appliedAt) {
      savedJob.appliedAt = new Date();
    }

    await savedJob.save();

    res.status(200).json({
      success: true,
      message: 'Job status updated successfully',
      savedJob,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a saved job
 * @route   DELETE /api/jobs/saved/:id
 * @access  Private
 */
const removeSavedJob = async (req, res, next) => {
  try {
    const savedJob = await SavedJob.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!savedJob) {
      return res.status(404).json({ success: false, message: 'Saved job not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Job removed from saved list',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Apply to a job (increments applicant count and updates status)
 * @route   POST /api/jobs/apply/:id
 * @access  Private
 */
const applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, isActive: true });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Increment applicant count
    job.applicantsCount += 1;
    await job.save();

    // Update or create saved job with applied status
    await SavedJob.findOneAndUpdate(
      { userId: req.user._id, jobId: req.params.id },
      {
        userId: req.user._id,
        jobId: req.params.id,
        status: 'applied',
        appliedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      applicationUrl: job.applicationUrl || null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  getJobRecommendations,
  saveJob,
  getSavedJobs,
  updateSavedJobStatus,
  removeSavedJob,
  applyToJob,
};
