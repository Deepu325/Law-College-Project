require('dotenv').config();
const mongoose = require('mongoose');
const ExamSession = require('../models/ExamSession');

const check = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await ExamSession.countDocuments({ status: 'submitted' });
    const all = await ExamSession.find().select('status').lean();
    console.log(`Submitted count: ${count}`);
    console.log('All statuses:', all.map(s => s.status));
    process.exit(0);
};

check();
