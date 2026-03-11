const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://localhost:27017/sclat');
    const Student = mongoose.model('Student', new mongoose.Schema({ email: String }, { strict: false }));
    const ExamSession = mongoose.model('ExamSession', new mongoose.Schema({ studentId: mongoose.Schema.Types.ObjectId, startTime: Date, endTime: Date, status: String }, { strict: false }));

    const student = await Student.findOne({ email: 'test.timeout2@example.com' });
    if (!student) {
        console.log('Student not found');
        return process.exit(0);
    }
    const session = await ExamSession.findOne({ studentId: student._id });
    if (!session) {
        console.log('Session not found');
        return process.exit(0);
    }

    console.log('Original session startTime:', session.startTime);
    console.log('Original session endTime:', session.endTime);

    const now = new Date();
    // Set start time to 75 minutes ago
    const newStartTime = new Date(now.getTime() - 75 * 60000);
    // Set end time to 15 minutes ago
    const newEndTime = new Date(now.getTime() - 15 * 60000);

    session.startTime = newStartTime;
    session.endTime = newEndTime;
    await session.save();

    console.log('Updated session startTime:', session.startTime);
    console.log('Updated session endTime:', session.endTime);
    process.exit(0);
}
run().catch(console.error);
