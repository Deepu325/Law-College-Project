const mongoose = require('mongoose');
const ExamSession = require('./models/ExamSession');
require('dotenv').config();

const migrateExamStartedAt = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // For all exams with status in_progress or submitted, set exam_started_at to startTime if not already set
        const result = await ExamSession.updateMany(
            { exam_started_at: null, status: { $in: ['in_progress', 'submitted'] } },
            { $set: { exam_started_at: '$startTime' } }
        );

        console.log(`Updated ${result.modifiedCount} exam sessions`);
        console.log(`Matched ${result.matchedCount} exam sessions`);

        // Verify the update
        const sample = await ExamSession.findOne({ exam_started_at: { $ne: null } }).lean();
        if (sample) {
            console.log('Sample updated record:', {
                startTime: sample.startTime,
                exam_started_at: sample.exam_started_at,
                status: sample.status
            });
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrateExamStartedAt();
