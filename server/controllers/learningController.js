const LearningPlan = require('../models/LearningPlan');

/**
 * @desc    Get user's learning plan (create if doesn't exist)
 * @route   GET /api/learning/plan
 * @access  Private
 */
const getLearningPlan = async (req, res, next) => {
  try {
    let plan = await LearningPlan.findOne({ userId: req.user._id });

    if (!plan) {
      plan = await LearningPlan.create({
        userId: req.user._id,
        progressPercentage: 0,
      });
    }

    res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update or replace the learning plan roadmap
 * @route   PUT /api/learning/plan
 * @access  Private
 */
const updateLearningPlan = async (req, res, next) => {
  try {
    const { targetRole, currentSkills, skillGaps, roadmap } = req.body;

    const updateData = {};
    if (targetRole !== undefined) updateData.targetRole = targetRole;
    if (currentSkills !== undefined) updateData.currentSkills = currentSkills;
    if (skillGaps !== undefined) updateData.skillGaps = skillGaps;
    if (roadmap !== undefined) {
      // Normalize roadmap items to ensure completed defaults to false
      updateData.roadmap = roadmap.map((item) => ({
        ...item,
        completed: item.completed || false,
      }));

      // Recalculate progress
      const completedCount = updateData.roadmap.filter((i) => i.completed).length;
      const totalCount = updateData.roadmap.length;
      updateData.progressPercentage =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    }

    const plan = await LearningPlan.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Learning plan updated successfully',
      plan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a roadmap week item as completed
 * @route   POST /api/learning/plan/complete/:weekIndex
 * @access  Private
 */
const markItemComplete = async (req, res, next) => {
  try {
    const weekIndex = parseInt(req.params.weekIndex);

    if (isNaN(weekIndex) || weekIndex < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid weekIndex is required',
      });
    }

    const plan = await LearningPlan.findOne({ userId: req.user._id });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Learning plan not found. Please create one first.',
      });
    }

    if (weekIndex >= plan.roadmap.length) {
      return res.status(400).json({
        success: false,
        message: `Week index ${weekIndex} is out of range. Plan has ${plan.roadmap.length} weeks.`,
      });
    }

    // Toggle completed status
    const { completed } = req.body;
    plan.roadmap[weekIndex].completed =
      completed !== undefined ? completed : true;

    // Recalculate progress
    const completedCount = plan.roadmap.filter((item) => item.completed).length;
    plan.progressPercentage = Math.round(
      (completedCount / plan.roadmap.length) * 100
    );

    // Add to completedItems tracking
    const itemKey = `week-${weekIndex}`;
    if (plan.roadmap[weekIndex].completed) {
      if (!plan.completedItems.includes(itemKey)) {
        plan.completedItems.push(itemKey);
      }
    } else {
      plan.completedItems = plan.completedItems.filter((k) => k !== itemKey);
    }

    await plan.save();

    res.status(200).json({
      success: true,
      message: `Week ${weekIndex + 1} marked as ${plan.roadmap[weekIndex].completed ? 'complete' : 'incomplete'}`,
      weekIndex,
      completed: plan.roadmap[weekIndex].completed,
      progressPercentage: plan.progressPercentage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bookmark a learning resource
 * @route   POST /api/learning/bookmarks
 * @access  Private
 */
const bookmarkResource = async (req, res, next) => {
  try {
    const { title, url, type } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'title and url are required to bookmark a resource',
      });
    }

    const plan = await LearningPlan.findOneAndUpdate(
      { userId: req.user._id },
      {
        $push: {
          bookmarkedResources: {
            title,
            url,
            type: type || 'other',
            bookmarkedAt: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    const addedBookmark =
      plan.bookmarkedResources[plan.bookmarkedResources.length - 1];

    res.status(201).json({
      success: true,
      message: 'Resource bookmarked successfully',
      bookmark: addedBookmark,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a bookmarked resource
 * @route   DELETE /api/learning/bookmarks/:resourceId
 * @access  Private
 */
const removeBookmark = async (req, res, next) => {
  try {
    const plan = await LearningPlan.findOneAndUpdate(
      { userId: req.user._id },
      {
        $pull: {
          bookmarkedResources: { _id: req.params.resourceId },
        },
      },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Learning plan not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookmarked resources
 * @route   GET /api/learning/bookmarks
 * @access  Private
 */
const getBookmarks = async (req, res, next) => {
  try {
    const plan = await LearningPlan.findOne({ userId: req.user._id }).select(
      'bookmarkedResources'
    );

    const bookmarks = plan ? plan.bookmarkedResources : [];

    res.status(200).json({
      success: true,
      count: bookmarks.length,
      bookmarks: bookmarks.sort(
        (a, b) => new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt)
      ),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLearningPlan,
  updateLearningPlan,
  markItemComplete,
  bookmarkResource,
  removeBookmark,
  getBookmarks,
};
