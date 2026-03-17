require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Student = require('../models/Student');
const ExamSession = require('../models/ExamSession');
const Response = require('../models/Response');

const clearData = async () => {
    try {
        await connectDB();
        console.log('--- DATA CLEARANCE STARTED ---');

        const studentCount = await Student.countDocuments();
        const sessionCount = await ExamSession.countDocuments();
        const responseCount = await Response.countDocuments();

        console.log(`Current items: ${studentCount} Students, ${sessionCount} Sessions, ${responseCount} Responses`);

        // Perform deletion
        const res3 = await Response.deleteMany({});
        console.log(`✅ Deleted ${res3.deletedCount} Responses`);

        const res2 = await ExamSession.deleteMany({});
        console.log(`✅ Deleted ${res2.deletedCount} Exam Sessions`);

        const res1 = await Student.deleteMany({});
        console.log(`✅ Deleted ${res1.deletedCount} Students`);

        console.log('--- DATA CLEARANCE COMPLETED ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during data clearance:', error);
        process.exit(1);
    }
};

clearData();
