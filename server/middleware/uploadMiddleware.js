/**
 * middleware/uploadMiddleware.js — Multer File Upload Configuration
 *
 * Configures Multer for resume file uploads.
 * Accepts PDF and DOCX files up to 5MB.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Storage Configuration ────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Format: userId-timestamp-sanitizedOriginalName
    const userId = req.user ? req.user._id.toString() : 'unknown';
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${userId}-${timestamp}-${sanitized}`;
    cb(null, filename);
  },
});

// ─── File Filter ──────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only PDF and DOCX files are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// ─── Multer Instance ──────────────────────────────────────────────────────────

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
});

// Export single file upload middleware for resume
const uploadResume = upload.single('resume');

/**
 * Wrapper to handle multer errors and pass them to Express error handler
 */
const handleResumeUpload = (req, res, next) => {
  uploadResume(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          err.message = 'File size too large. Maximum allowed size is 5MB.';
        }
      }
      return next(err);
    }
    next();
  });
};

module.exports = { handleResumeUpload, upload, uploadResume };
