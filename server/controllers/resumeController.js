const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const { parseResume } = require('../utils/pdfParser');

/**
 * @desc    Upload a resume file
 * @route   POST /api/resumes/upload
 * @access  Private
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file (PDF or DOCX)',
      });
    }

    const { originalname, filename, path: filePath, size, mimetype } = req.file;

    // Parse the text from the uploaded file
    let parsedText = '';
    try {
      parsedText = await parseResume(filePath, mimetype);
    } catch (parseError) {
      console.error('Resume parse error (non-fatal):', parseError.message);
      parsedText = '';
    }

    // Save resume to DB
    const resume = await Resume.create({
      userId: req.user._id,
      fileName: originalname,
      filePath: `/uploads/${filename}`,
      fileSize: size,
      mimeType: mimetype,
      parsedText,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      resume: {
        _id: resume._id,
        fileName: resume.fileName,
        filePath: resume.filePath,
        fileSize: resume.fileSize,
        mimeType: resume.mimeType,
        hasText: !!parsedText,
        isActive: resume.isActive,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    // Clean up uploaded file if DB save fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
};

/**
 * @desc    Get all active resumes for current user
 * @route   GET /api/resumes/my
 * @access  Private
 */
const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({
      userId: req.user._id,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .select('-parsedText'); // Exclude large text field in list view

    res.status(200).json({
      success: true,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single resume by ID
 * @route   GET /api/resumes/:id
 * @access  Private
 */
const getResumeById = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete a resume
 * @route   DELETE /api/resumes/:id
 * @access  Private
 */
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    resume.isActive = false;
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set a resume as active/primary (mark others inactive)
 * @route   PUT /api/resumes/:id/activate
 * @access  Private
 */
const setActiveResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Mark all user resumes as inactive first
    await Resume.updateMany(
      { userId: req.user._id },
      { $set: { isActive: false } }
    );

    // Set selected one as active
    resume.isActive = true;
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume set as active successfully',
      resume,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getMyResumes,
  getResumeById,
  deleteResume,
  setActiveResume,
};
