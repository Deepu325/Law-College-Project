const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      
      // Create indexes after connection
      await createIndexes();
      
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB Connection Attempt ${i + 1}/${retries} Failed:`, error.message);
      
      if (i === retries - 1) {
        console.error('🔴 All MongoDB connection attempts failed. Exiting...');
        process.exit(1);
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, i), 10000);
      console.log(`⏳ Retrying in ${waitTime / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

const createIndexes = async () => {
  try {
    const Student = require('../models/Student');
    const ExamSession = require('../models/ExamSession');
    const Response = require('../models/Response');
    const Question = require('../models/Question');

    // Create unique indexes
    await Student.collection.createIndex({ email: 1 }, { unique: true });
    await Student.collection.createIndex({ phone: 1 }, { unique: true });
    
    // Create compound indexes for performance
    await ExamSession.collection.createIndex({ studentId: 1, status: 1 });
    await Response.collection.createIndex({ sessionId: 1, questionId: 1 });
    await Question.collection.createIndex({ section: 1 });
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('⚠️ Index creation warning:', error.message);
    // Don't exit on index errors - they might already exist
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log('📴 MongoDB connection closed gracefully');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = connectDB;
