const Student = require('../models/Student');
const ExamSession = require('../models/ExamSession');
const Question = require('../models/Question');
const Response = require('../models/Response');
const { sendSubmissionEmail } = require('../utils/email');
const mongoose = require('mongoose');

// @desc    Register student and create exam session
// @route   POST /api/register
// @access  Public
const registerStudent = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { fullName, email, phone, qualification, city, consent } = req.body;

        // Create student (atomic operation with unique constraints)
        const student = await Student.create([{
            fullName,
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            qualification,
            city,
            consent
        }], { session });

        // Calculate exam times (server-authoritative)
        const startTime = new Date();
        const examDurationMinutes = parseInt(process.env.EXAM_DURATION_MINUTES) || 60;
        const endTime = new Date(startTime.getTime() + examDurationMinutes * 60 * 1000);

        // Create exam session
        const examSession = await ExamSession.create([{
            studentId: student[0]._id,
            startTime,
            endTime,
            status: 'IN_PROGRESS',
            ipAddress: req.ip || req.connection.remoteAddress
        }], { session });

        // Get total questions count
        const totalQuestions = await Question.countDocuments();

        await session.commitTransaction();

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                sessionId: examSession[0]._id,
                studentId: student[0]._id,
                fullName: student[0].fullName,
                startTime: examSession[0].startTime,
                endTime: examSession[0].endTime,
                totalQuestions
            }
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Registration error:', error);

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];
            return res.status(409).json({
                success: false,
                message: 'Test already taken.',
                reason: `This ${field} has already been used for registration.`,
                duplicateAttempt: true
            });
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    } finally {
        session.endSession();
    }
};

// @desc    Get all questions (without correct answers)
// @route   GET /api/questions
// @access  Public
const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find()
            .select('-correctOption -__v') // Exclude correct answer
            .sort({ section: 1, questionNumber: 1 })
            .lean();

        // Group questions by section
        const groupedQuestions = {
            RC: questions.filter(q => q.section === 'RC'),
            LEGAL: questions.filter(q => q.section === 'LEGAL')
        };

        res.status(200).json({
            success: true,
            data: {
                questions: questions,
                grouped: groupedQuestions,
                total: questions.length
            }
        });
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch questions'
        });
    }
};

// @desc    Save/update answer
// @route   POST /api/save-answer
// @access  Public (with timer validation)
const saveAnswer = async (req, res) => {
    try {
        const { sessionId, questionId, selectedOption } = req.body;
        const session = req.examSession; // Attached by validateTimer middleware
        const remainingTime = req.remainingTime;

        // Validate question exists
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Check if answer is correct
        const isCorrect = selectedOption ?
            selectedOption.toUpperCase() === question.correctOption : false;

        // Upsert response (update if exists, create if not)
        const response = await Response.findOneAndUpdate(
            { sessionId, questionId },
            {
                selectedOption: selectedOption ? selectedOption.toUpperCase() : null,
                isCorrect,
                answeredAt: new Date()
            },
            { upsert: true, new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Answer saved',
            data: {
                responseId: response._id,
                remainingTime
            }
        });
    } catch (error) {
        console.error('Save answer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save answer'
        });
    }
};

// @desc    Submit exam
// @route   POST /api/submit
// @access  Public
const submitExam = async (req, res) => {
    try {
        const { sessionId } = req.body;

        // Validate sessionId
        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid session ID'
            });
        }

        // Get session
        const session = await ExamSession.findById(sessionId).populate('studentId');

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Exam session not found'
            });
        }

        // Check if already submitted
        if (session.status === 'SUBMITTED') {
            return res.status(400).json({
                success: false,
                message: 'Exam already submitted',
                alreadySubmitted: true
            });
        }

        // Calculate score
        const responses = await Response.find({ sessionId }).lean();
        const correctAnswers = responses.filter(r => r.isCorrect).length;
        const totalQuestions = await Question.countDocuments();
        const score = correctAnswers;

        // Update session
        session.status = 'SUBMITTED';
        session.score = score;
        session.submittedAt = new Date();
        await session.save();

        // Send email to admin (non-blocking)
        sendSubmissionEmail({
            fullName: session.studentId.fullName,
            email: session.studentId.email,
            phone: session.studentId.phone,
            qualification: session.studentId.qualification,
            city: session.studentId.city,
            score: score,
            totalMarks: totalQuestions,
            submittedAt: session.submittedAt
        }).catch(err => console.error('Email send error:', err));

        res.status(200).json({
            success: true,
            message: 'Exam submitted successfully',
            data: {
                submittedAt: session.submittedAt
            }
        });
    } catch (error) {
        console.error('Submit exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit exam'
        });
    }
};

// @desc    Get exam session status
// @route   GET /api/session/:sessionId
// @access  Public
const getSessionStatus = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid session ID'
            });
        }

        const session = await ExamSession.findById(sessionId)
            .populate('studentId', 'fullName email')
            .lean();

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Get saved responses count
        const savedAnswersCount = await Response.countDocuments({ sessionId });

        // Calculate remaining time
        const now = new Date();
        const remainingSeconds = Math.max(0, Math.floor((new Date(session.endTime) - now) / 1000));

        res.status(200).json({
            success: true,
            data: {
                sessionId: session._id,
                studentName: session.studentId.fullName,
                status: session.status,
                startTime: session.startTime,
                endTime: session.endTime,
                remainingTime: remainingSeconds,
                savedAnswers: savedAnswersCount,
                isExpired: remainingSeconds === 0
            }
        });
    } catch (error) {
        console.error('Get session status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch session status'
        });
    }
};

module.exports = {
    registerStudent,
    getQuestions,
    saveAnswer,
    submitExam,
    getSessionStatus
};
