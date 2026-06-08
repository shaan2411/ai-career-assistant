/**
 * config/db.js — MongoDB Connection
 *
 * Connects to MongoDB using Mongoose with retry logic and event listeners.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_career_assistant';

  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  const connect = async () => {
    try {
      const conn = await mongoose.connect(MONGO_URI, options);
      console.log(`✅ MongoDB Connected: ${conn.connection.host} → ${conn.connection.name}`);
    } catch (error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      console.log('🔄 Retrying connection in 5 seconds...');
      setTimeout(connect, 5000);
    }
  };

  await connect();

  // MongoDB connection event listeners
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected successfully');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
  });

  // Graceful shutdown on SIGINT
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  });
};

module.exports = connectDB;
