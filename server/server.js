/**
 * server.js — AI Career Assistant Backend Entry Point
 *
 * Initializes Express app, middleware, routes, and starts the server.
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = require('./config/db');
connectDB();

// Initialize Express app
const app = express();

// ─── Core Middleware ─────────────────────────────────────────────────────────

// CORS — allow requests from client
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logger (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static file serving for uploaded resumes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Health Check ─────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Career Assistant API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    aiProvider: process.env.AI_PROVIDER || 'gemini',
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const aiRoutes = require('./routes/aiRoutes');
const jobRoutes = require('./routes/jobRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const learningRoutes = require('./routes/learningRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/admin', adminRoutes);

// ─── Error Handling Middleware ────────────────────────────────────────────────

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║    🚀 AI Career Assistant Server       ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`🌍  Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌  Port        : ${PORT}`);
  console.log(`🤖  AI Provider : ${process.env.AI_PROVIDER || 'gemini'}`);
  console.log(`📡  API URL     : http://localhost:${PORT}/api`);
  console.log('─────────────────────────────────────────\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = app;
