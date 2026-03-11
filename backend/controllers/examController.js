const Student = require('../models/Student');
const ExamSession = require('../models/ExamSession');
const Question = require('../models/Question');
const Response = require('../models/Response');
const { sendSubmissionEmail } = require('../utils/email');
const { sendToGoogleSheets } = require('../utils/googleSheets');
const mongoose = require('mongoose');

// @desc    Register student and create exam session
// @route   POST /api/register
// @access  Public
// @desc    Register student and create/resume exam session
// @route   POST /api/register
// @access  Public
const registerStudent = async (req, res) => {
    try {
        const { fullName, email, phone, qualification, state, city, consent } = req.body;
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedPhone = phone.trim();

        // Check Global Exam Window Bounds
        const now = new Date();
        const globalStart = new Date(process.env.EXAM_START_TIME);
        const globalStop = new Date(process.env.EXAM_STOP_TIME);

        if (now < globalStart) {
            return res.status(403).json({
                success: false,
                message: `The exam has not started yet. Please come back at ${globalStart.toLocaleString()}`,
                notStarted: true,
                startTime: globalStart
            });
        }

        if (now > globalStop) {
            return res.status(403).json({
                success: false,
                message: 'The exam has ended.',
                isEnded: true
            });
        }

        // Case 2 & 3: Check for existing student
        let student = await Student.findOne({
            $or: [{ email: normalizedEmail }, { phone: normalizedPhone }]
        });

        if (student) {
            const session = await ExamSession.findOne({ studentId: student._id });

            if (session) {
                // Case 3 — exam_status = "completed"
                if (session.status === 'submitted') {
                    return res.status(409).json({
                        success: false,
                        message: 'You have already attempted this exam using this email or mobile number. Multiple attempts are not allowed.',
                        duplicateAttempt: true,
                        isCompleted: true
                    });
                }

                // Case 2 — exam_status = "in_progress" or "not_started"
                const totalQuestions = await Question.countDocuments();
                return res.status(200).json({
                    success: true,
                    message: 'Your exam is already in progress. You will now be redirected to resume the exam.',
                    isResume: true,
                    data: {
                        sessionId: session._id,
                        studentId: student._id,
                        fullName: student.fullName,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        status: session.status,
                        totalQuestions
                    }
                });
            }
        }

        // Case 1 — No record found: Create new
        student = await Student.create({
            fullName,
            email: normalizedEmail,
            phone: normalizedPhone,
            qualification,
            state,
            city,
            consent
        });

        // Calculate exam times with window restriction (Step 3 Requirement)
        const startTime = new Date();
        const examDurationMinutes = parseInt(process.env.EXAM_DURATION_MINUTES) || 60;
        
        // Potential end time based on duration
        let endTime = new Date(startTime.getTime() + examDurationMinutes * 60 * 1000);
        
        // Restricted end time based on global stop time
        if (endTime > globalStop) {
            endTime = globalStop;
        }

        const examSession = await ExamSession.create({
            studentId: student._id,
            startTime,
            endTime,
            status: 'not_started',
            ipAddress: req.ip || req.connection.remoteAddress
        });

        const totalQuestions = await Question.countDocuments();

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                sessionId: examSession._id,
                studentId: student._id,
                fullName: student.fullName,
                startTime: examSession.startTime,
                endTime: examSession.endTime,
                status: examSession.status,
                totalQuestions
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'You have already attempted this exam using this email or mobile number.',
                duplicateAttempt: true
            });
        }
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
};

// @desc    Start exam activity
// @route   POST /api/start-exam
// @access  Public
const startExamActivity = async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = await ExamSession.findById(sessionId);

        if (!session) {
            return res.status(404).json({ success: false, message: 'Session not found' });
        }

        if (session.status === 'not_started') {
            const now = new Date();
            const globalStop = new Date(process.env.EXAM_STOP_TIME);

            if (now > globalStop) {
                return res.status(403).json({ success: false, message: 'The exam has already ended.' });
            }

            session.status = 'in_progress';
            session.exam_started_at = now;
            session.startTime = now;
            
            // Re-calculate endTime to ensure it doesn't exceed global limits even if started late
            const durationMs = (parseInt(process.env.EXAM_DURATION_MINUTES) || 60) * 60 * 1000;
            let calculatedEnd = new Date(now.getTime() + durationMs);
            
            if (calculatedEnd > globalStop) {
                calculatedEnd = globalStop;
            }
            
            session.endTime = calculatedEnd;
            await session.save();
        }

        res.status(200).json({
            success: true,
            message: 'Exam started',
            data: {
                status: session.status,
                startTime: session.startTime,
                endTime: session.endTime,
                exam_started_at: session.exam_started_at
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to start exam' });
    }
};

// @desc    Get all questions (without correct answers)
// @route   GET /api/questions
// @access  Public
const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find()
            .select('-correctOption -__v') // Exclude correct answer
            .sort({ questionNumber: 1 })
            .lean();

        // Group questions by section for structured display if needed
        const groupedQuestions = {
            GK: questions.filter(q => q.section === 'GK'),
            LOGICAL: questions.filter(q => q.section === 'LOGICAL'),
            QUANT: questions.filter(q => q.section === 'QUANT'),
            LEGAL: questions.filter(q => q.section === 'LEGAL'),
            RC: questions.filter(q => q.section === 'RC')
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
        if (session.status === 'submitted') {
            return res.status(400).json({
                success: false,
                message: 'Exam already submitted',
                alreadySubmitted: true
            });
        }

        // Calculate score with robustness
        const responses = await Response.find({ sessionId }).lean();
        const questions = await Question.find({ 
            _id: { $in: responses.map(r => r.questionId) } 
        }).lean();

        let score = 0;
        responses.forEach(resp => {
            const question = questions.find(q => q._id.toString() === resp.questionId.toString());
            if (question && resp.selectedOption && 
                resp.selectedOption.toUpperCase() === question.correctOption.toUpperCase()) {
                score += (question.marks || 1);
            }
        });

        const totalQuestions = await Question.countDocuments();

        // Update session
        session.status = 'submitted';
        session.score = score;
        session.submittedAt = session.submittedAt || new Date(); // Use existing if auto-submitted
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

        // Sync to Google Sheets (non-blocking)
        sendToGoogleSheets({
            name: session.studentId.fullName,
            email: session.studentId.email,
            mobile: session.studentId.phone,
            city: session.studentId.city,
            course: session.studentId.qualification,
            score: score,
            startTime: session.startTime,
            endTime: session.endTime,
            submissionTime: session.submittedAt
        }).catch(err => console.error('[Google Sheets] Sync error on submit:', err));

        res.status(200).json({
            success: true,
            message: 'Exam submitted successfully',
            data: {
                submittedAt: session.submittedAt,
                score: score,
                totalQuestions: totalQuestions
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

        // Fail-safe: If time is up but still in progress, auto-submit on server
        if (session.status !== 'submitted' && new Date() > new Date(session.endTime)) {
            console.log(`Auto-closing session ${sessionId} due to expiration`);

            // Mark as submitted with robust scoring
            const responses = await Response.find({ sessionId }).lean();
            const questions = await Question.find({ 
                _id: { $in: responses.map(r => r.questionId) } 
            }).lean();

            let score = 0;
            responses.forEach(resp => {
                const question = questions.find(q => q._id.toString() === resp.questionId.toString());
                if (question && resp.selectedOption && 
                    resp.selectedOption.toUpperCase() === question.correctOption.toUpperCase()) {
                    score += (question.marks || 1);
                }
            });

            const updatedSession = await ExamSession.findByIdAndUpdate(sessionId, {
                status: 'submitted',
                score: score,
                submittedAt: session.endTime // Use end time as submission time
            }, { new: true }).populate('studentId', 'fullName email');

            return res.status(200).json({
                success: true,
                data: {
                    sessionId: updatedSession._id,
                    studentName: updatedSession.studentId.fullName,
                    status: updatedSession.status,
                    startTime: updatedSession.startTime,
                    endTime: updatedSession.endTime,
                    remainingTime: 0,
                    savedAnswers: responses.length,
                    isExpired: true,
                    autoSubmitted: true
                }
            });
        }

        // Get saved responses count
        const savedAnswersCount = await Response.countDocuments({ sessionId });

        // Calculate remaining time
        const now = new Date();
        const endTime = new Date(session.endTime);
        const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));

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

// @desc    Get user responses for a session (for resumption)
// @route   GET /api/responses/:sessionId
// @access  Public
const getUserResponses = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ success: false, message: 'Invalid session ID' });
        }

        const responses = await Response.find({ sessionId })
            .select('questionId selectedOption -_id')
            .lean();

        // Convert to a simple questionId -> selectedOption object
        const answersMap = {};
        responses.forEach(r => {
            answersMap[r.questionId] = r.selectedOption;
        });

        res.status(200).json({
            success: true,
            data: answersMap
        });
    } catch (error) {
        console.error('Get user responses error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch responses' });
    }
};

// @desc    Get global exam configuration
// @route   GET /api/config
// @access  Public
const getExamConfig = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                startTime: process.env.EXAM_START_TIME,
                stopTime: process.env.EXAM_STOP_TIME,
                duration: process.env.EXAM_DURATION_MINUTES,
                currentTime: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch config' });
    }
};

module.exports = {
    registerStudent,
    startExamActivity,
    getQuestions,
    saveAnswer,
    submitExam,
    getSessionStatus,
    getUserResponses,
    getExamConfig
};
