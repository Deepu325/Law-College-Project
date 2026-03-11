require('dotenv').config();
const mongoose = require('mongoose');
const ExamSession = require('../models/ExamSession');

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Migrate 'completed' to 'submitted'
        const completedResult = await ExamSession.updateMany(
            { status: 'completed' },
            { $set: { status: 'submitted' } }
        );
        console.log(`✅ Migrated ${completedResult.modifiedCount} sessions from 'completed' to 'submitted'`);

        // Migrate 'IN_PROGRESS' to 'in_progress'
        const inProgressResult = await ExamSession.updateMany(
            { status: 'IN_PROGRESS' },
            { $set: { status: 'in_progress' } }
        );
        console.log(`✅ Migrated ${inProgressResult.modifiedCount} sessions from 'IN_PROGRESS' to 'in_progress'`);

        // Migrate 'SUBMITTED' to 'submitted'
        const submittedResult = await ExamSession.updateMany(
            { status: 'SUBMITTED' },
            { $set: { status: 'submitted' } }
        );
        console.log(`✅ Migrated ${submittedResult.modifiedCount} sessions from 'SUBMITTED' to 'submitted'`);

        console.log('🏁 Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrate();
