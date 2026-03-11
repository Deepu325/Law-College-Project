require('dotenv').config();
const mongoose = require('mongoose');
const ExamSession = require('../models/ExamSession');
const Student = require('../models/Student');

const check = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const sessions = await ExamSession.find({ status: 'submitted' }).lean();
    console.log(`Submitted sessions found: ${sessions.length}`);

    for (const session of sessions) {
        const student = await Student.findById(session.studentId);
        if (!student) {
            console.log(`⚠️  Orphaned session ${session._id}: Student ${session.studentId} NOT FOUND`);
        } else {
            console.log(`✅ Session ${session._id} has student ${student.fullName}`);
        }
    }
    process.exit(0);
};

check();
