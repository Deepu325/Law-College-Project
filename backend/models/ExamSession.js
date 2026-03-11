const mongoose = require('mongoose');

const examSessionSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['not_started', 'in_progress', 'submitted'],
        default: 'not_started'
    },
    score: {
        type: Number,
        default: 0,
        min: 0
    },
    submittedAt: {
        type: Date,
        default: null
    },
    ipAddress: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
examSessionSchema.index({ studentId: 1, status: 1 });

// Prevent multiple sessions per student
examSessionSchema.index({ studentId: 1 }, { unique: true });

// Method to check if exam is expired
examSessionSchema.methods.isExpired = function () {
    return new Date() > this.endTime;
};

// Method to get remaining time in seconds
examSessionSchema.methods.getRemainingTime = function () {
    const now = new Date();
    const remaining = Math.max(0, Math.floor((this.endTime - now) / 1000));
    return remaining;
};

module.exports = mongoose.model('ExamSession', examSessionSchema);
