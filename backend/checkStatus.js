const mongoose = require('mongoose');

async function run() {
    await mongoose.connect('mongodb://localhost:27017/sclat');
    const Student = mongoose.model('Student', new mongoose.Schema({ email: String }, { strict: false }));
    const ExamSession = mongoose.model('ExamSession', new mongoose.Schema({ studentId: mongoose.Schema.Types.ObjectId, startTime: Date, endTime: Date, status: String, score: Number }, { strict: false }));

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

    console.log('Candidate email:', student.email);
    console.log('Session Status:', session.status);
    console.log('Session Score:', session.score);
    console.log('Exam start time:', session.startTime);
    console.log('Exam end time:', session.endTime);

    process.exit(0);
}
run().catch(console.error);
