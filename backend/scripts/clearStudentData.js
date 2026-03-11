/**
 * Clear all student/exam data for production reset
 * Run: node scripts/clearStudentData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sclat';

async function clearData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;

        // Clear Students
        const students = await db.collection('students').deleteMany({});
        console.log(`🗑️  Deleted ${students.deletedCount} students`);

        // Clear ExamSessions
        const sessions = await db.collection('examsessions').deleteMany({});
        console.log(`🗑️  Deleted ${sessions.deletedCount} exam sessions`);

        // Clear Responses
        const responses = await db.collection('responses').deleteMany({});
        console.log(`🗑️  Deleted ${responses.deletedCount} responses`);

        console.log('\n✅ All student data cleared. Ready for production!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

clearData();
