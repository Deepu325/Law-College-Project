/**
 * recalculateScores.js
 * One-time admin script to re-evaluate all Response documents and
 * update session scores based on the current correctOption in the database.
 *
 * Run: node scripts/recalculateScores.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');
const Response = require('../models/Response');
const ExamSession = require('../models/ExamSession');

const recalculate = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all questions as a map: _id -> correctOption
    const questions = await Question.find().select('_id correctOption').lean();
    const correctMap = {};
    questions.forEach(q => {
        correctMap[q._id.toString()] = q.correctOption;
    });
    console.log(`📚 Loaded ${questions.length} questions from DB\n`);

    // Fetch all responses
    const responses = await Response.find().lean();
    console.log(`📝 Found ${responses.length} response(s) to re-evaluate\n`);

    let corrected = 0;
    let unchanged = 0;

    for (const resp of responses) {
        const correctOption = correctMap[resp.questionId.toString()];
        if (!correctOption) {
            console.warn(`  ⚠️  Question ${resp.questionId} not found in DB — skipping`);
            continue;
        }

        const isCorrect = resp.selectedOption
            ? resp.selectedOption.toUpperCase() === correctOption.toUpperCase()
            : false;

        if (isCorrect !== resp.isCorrect) {
            await Response.findByIdAndUpdate(resp._id, { isCorrect });
            corrected++;
            console.log(`  ✏️  Fixed response ${resp._id}: was ${resp.isCorrect} → now ${isCorrect}`);
        } else {
            unchanged++;
        }
    }

    console.log(`\n✅ Re-evaluation complete:`);
    console.log(`   - ${corrected} response(s) corrected`);
    console.log(`   - ${unchanged} response(s) unchanged\n`);

    // Now recalculate session scores
    const sessions = await ExamSession.find({ status: 'completed' }).lean();
    console.log(`🎓 Recalculating scores for ${sessions.length} completed session(s)...\n`);

    for (const session of sessions) {
        const sessionResponses = await Response.find({ sessionId: session._id }).lean();
        const correctCount = sessionResponses.filter(r => r.isCorrect).length;

        if (correctCount !== session.score) {
            await ExamSession.findByIdAndUpdate(session._id, { score: correctCount });
            console.log(`  📊 Session ${session._id}: score ${session.score} → ${correctCount}`);
        } else {
            console.log(`  ✔️  Session ${session._id}: score ${session.score} (no change)`);
        }
    }

    console.log('\n🏁 All done. Scores are now accurate.');
    process.exit(0);
};

recalculate().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
