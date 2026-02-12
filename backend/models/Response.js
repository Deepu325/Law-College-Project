const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamSession',
        required: true,
        index: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true,
        index: true
    },
    selectedOption: {
        type: String,
        enum: ['A', 'B', 'C', 'D', null],
        default: null,
        uppercase: true
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    answeredAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate responses and enable fast lookups
responseSchema.index({ sessionId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model('Response', responseSchema);
