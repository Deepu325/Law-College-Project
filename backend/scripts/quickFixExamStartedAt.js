#!/usr/bin/env node

/**
 * Quick Fix: Populate exam_started_at field for existing exam sessions
 * Run this script once to backfill the exam_started_at field
 * 
 * Usage: node backend/scripts/quickFixExamStartedAt.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const ExamSession = require('../models/ExamSession');

async function quickFix() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Check current state
        console.log('📊 Checking current state...');
        const totalSessions = await ExamSession.countDocuments();
        const sessionsWithStartTime = await ExamSession.countDocuments({ exam_started_at: { $ne: null } });
        const sessionsWithoutStartTime = await ExamSession.countDocuments({ exam_started_at: null });

        console.log(`Total sessions: ${totalSessions}`);
        console.log(`Sessions with exam_started_at: ${sessionsWithStartTime}`);
        console.log(`Sessions without exam_started_at: ${sessionsWithoutStartTime}\n`);

        if (sessionsWithoutStartTime === 0) {
            console.log('✅ All sessions already have exam_started_at populated!');
            process.exit(0);
        }

        // Perform the update
        console.log('🔧 Updating sessions...');
        const result = await ExamSession.updateMany(
            { exam_started_at: null },
            [
                {
                    $set: {
                        exam_started_at: {
                            $cond: [
                                { $in: ['$status', ['in_progress', 'submitted']] },
                                '$startTime',
                                null
                            ]
                        }
                    }
                }
            ]
        );

        console.log(`✅ Updated ${result.modifiedCount} sessions\n`);

        // Verify the update
        console.log('🔍 Verifying update...');
        const updatedCount = await ExamSession.countDocuments({ exam_started_at: { $ne: null } });
        console.log(`Sessions with exam_started_at after update: ${updatedCount}\n`);

        // Show sample records
        console.log('📋 Sample records:');
        const samples = await ExamSession.find()
            .populate('studentId', 'fullName email')
            .limit(3)
            .lean();

        samples.forEach((session, idx) => {
            console.log(`\n${idx + 1}. ${session.studentId.fullName}`);
            console.log(`   Status: ${session.status}`);
            console.log(`   Start Time: ${session.startTime}`);
            console.log(`   Exam Started At: ${session.exam_started_at || 'null'}`);
            console.log(`   Submitted At: ${session.submittedAt || 'null'}`);
        });

        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

quickFix();
