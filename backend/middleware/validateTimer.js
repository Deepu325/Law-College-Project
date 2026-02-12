const ExamSession = require('../models/ExamSession');
const mongoose = require('mongoose');

const validateTimer = async (req, res, next) => {
    try {
        const { sessionId } = req.body;

        // Validate sessionId format
        if (!sessionId || !mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid session ID'
            });
        }

        // Fetch session from database
        const session = await ExamSession.findById(sessionId);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Exam session not found'
            });
        }

        // Check if already submitted
        if (session.status === 'SUBMITTED') {
            return res.status(403).json({
                success: false,
                message: 'Exam already submitted. No further actions allowed.',
                alreadySubmitted: true
            });
        }

        // Server-authoritative time check
        const now = new Date();
        const timeExpired = now > session.endTime;

        if (timeExpired) {
            // Time has expired - force submit
            return res.status(403).json({
                success: false,
                message: 'Time expired. Exam will be auto-submitted.',
                timeExpired: true,
                sessionId: session._id
            });
        }

        // Calculate remaining time (server is source of truth)
        const remainingSeconds = session.getRemainingTime();

        // Attach session and remaining time to request
        req.examSession = session;
        req.remainingTime = remainingSeconds;

        next();
    } catch (error) {
        console.error('Timer validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Timer validation failed'
        });
    }
};

module.exports = validateTimer;
