const Admin = require('../models/Admin');
const fs = require('fs');
const path = require('path');
const logFile = 'd:\\LAW Clg project\\website\\backend\\debug.log';

const log = (msg) => {
    fs.appendFileSync(logFile, `${new Date().toISOString()} - ${msg}\n`);
};
const Student = require('../models/Student');
const ExamSession = require('../models/ExamSession');
const Response = require('../models/Response');
const Question = require('../models/Question');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
const { sendToGoogleSheets } = require('../utils/googleSheets');

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin with password field
        const admin = await Admin.findOne({ email: email.toLowerCase() })
            .select('+passwordHash');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Compare password
        const isPasswordValid = await admin.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                admin: {
                    id: admin._id,
                    email: admin.email,
                    role: admin.role
                }
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

// @desc    Get all candidates with scores
// @route   GET /api/admin/candidates
// @access  Private (Admin only)
const getCandidates = async (req, res) => {
    try {
        // Auto-submit all expired in_progress/not_started sessions
        const now = new Date();
        const expiredSessions = await ExamSession.find({
            status: { $in: ['in_progress', 'not_started'] },
            endTime: { $lt: now }
        });

        for (const session of expiredSessions) {
            try {
                // Calculate score for this session
                const responses = await Response.find({ sessionId: session._id }).lean();
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

                session.status = 'submitted';
                session.score = score;
                session.submittedAt = session.endTime; // Use end time as submission time
                await session.save();
                console.log(`Auto-submitted expired session ${session._id} with score ${score}`);

                // Sync auto-submitted session to Google Sheets
                const student = await Student.findById(session.studentId).lean();
                if (student) {
                    sendToGoogleSheets({
                        name: student.fullName,
                        email: student.email,
                        mobile: student.phone,
                        city: student.city,
                        course: student.qualification,
                        score: score,
                        startTime: session.startTime,
                        endTime: session.endTime,
                        submissionTime: session.endTime
                    }).catch(err => console.error('[Google Sheets] Auto-submit sync error:', err));
                }
            } catch (err) {
                console.error(`Failed to auto-submit session ${session._id}:`, err);
            }
        }

        const { search, status } = req.query;

        // Build query
        let query = {};

        if (status) {
            query.status = status;
        }

        // Get all sessions with student details
        let sessions = await ExamSession.find(query)
            .populate('studentId', 'fullName email phone qualification state city')
            .sort({ createdAt: -1 })
            .lean();

        // Apply search filter if provided
        if (search) {
            const searchLower = search.toLowerCase();
            sessions = sessions.filter(session => {
                const student = session.studentId;
                return (
                    student.fullName.toLowerCase().includes(searchLower) ||
                    student.email.toLowerCase().includes(searchLower) ||
                    student.phone.includes(searchLower) ||
                    student.city.toLowerCase().includes(searchLower)
                );
            });
        }

        // Format response
        const candidates = sessions.map(session => ({
            sessionId: session._id,
            studentId: session.studentId._id,
            fullName: session.studentId.fullName,
            email: session.studentId.email,
            phone: session.studentId.phone,
            qualification: session.studentId.qualification,
            state: session.studentId.state,
            city: session.studentId.city,
            score: session.score,
            status: session.status,
            exam_started_at: session.exam_started_at,
            submittedAt: session.submittedAt,
            startTime: session.startTime,
            endTime: session.endTime
        }));

        res.status(200).json({
            success: true,
            data: {
                candidates,
                total: candidates.length
            }
        });
    } catch (error) {
        console.error('Get candidates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch candidates'
        });
    }
};

// @desc    Get candidate detailed responses
// @route   GET /api/admin/candidate/:sessionId
// @access  Private (Admin only)
const getCandidateDetails = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Get session with student details
        const session = await ExamSession.findById(sessionId)
            .populate('studentId')
            .lean();

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Get all responses with question details
        const responses = await Response.find({ sessionId })
            .populate('questionId')
            .sort({ 'questionId.questionNumber': 1 })
            .lean();

        // Format responses
        const formattedResponses = responses.map(response => ({
            questionNumber: response.questionId.questionNumber,
            section: response.questionId.section,
            questionText: response.questionId.questionText,
            options: response.questionId.options,
            selectedOption: response.selectedOption,
            correctOption: response.questionId.correctOption,
            isCorrect: response.isCorrect,
            marks: response.isCorrect ? response.questionId.marks : 0
        }));

        res.status(200).json({
            success: true,
            data: {
                student: {
                    fullName: session.studentId.fullName,
                    email: session.studentId.email,
                    phone: session.studentId.phone,
                    qualification: session.studentId.qualification,
                    state: session.studentId.state,
                    city: session.studentId.city
                },
                session: {
                    startTime: session.startTime,
                    endTime: session.endTime,
                    submittedAt: session.submittedAt,
                    status: session.status,
                    score: session.score
                },
                responses: formattedResponses,
                totalQuestions: formattedResponses.length,
                correctAnswers: formattedResponses.filter(r => r.isCorrect).length
            }
        });
    } catch (error) {
        console.error('Get candidate details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch candidate details'
        });
    }
};

// @desc    Export candidates to Excel
// @route   GET /api/admin/export
// @access  Private (Admin only)
const exportCandidates = async (req, res) => {
    try {
        // Get all submitted sessions
        log('DEBUG: Exporting sessions with status "submitted"');
        const sessions = await ExamSession.find({ status: 'submitted' })
            .populate('studentId')
            .sort({ submittedAt: -1 })
            .lean();

        log(`DEBUG: Found ${sessions.length} submitted sessions for export`);
        if (sessions.length > 0) {
            log(`DEBUG: First session status: ${sessions[0].status}`);
        }

        if (sessions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No submissions found to export'
            });
        }

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('SLET Results');

        // Define columns
        worksheet.columns = [
            { header: 'S.No', key: 'sno', width: 8 },
            { header: 'Full Name', key: 'fullName', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Course Applied', key: 'qualification', width: 20 },
            { header: 'State', key: 'state', width: 20 },
            { header: 'City', key: 'city', width: 20 },
            { header: 'Score', key: 'score', width: 10 },
            { header: 'Start Time', key: 'exam_started_at', width: 25 },
            { header: 'Submission Time', key: 'submittedAt', width: 25 }
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4B2E83' }
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

        // Add data rows
        sessions.forEach((session, index) => {
            worksheet.addRow({
                sno: index + 1,
                fullName: session.studentId.fullName,
                email: session.studentId.email,
                phone: session.studentId.phone,
                qualification: session.studentId.qualification,
                state: session.studentId.state,
                city: session.studentId.city,
                score: session.score,
                exam_started_at: session.exam_started_at ? new Date(session.exam_started_at).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata'
                }) : '-',
                submittedAt: new Date(session.submittedAt).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata'
                })
            });
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=SCLAT_Results_${new Date().toISOString().split('T')[0]}.xlsx`
        );

        res.send(buffer);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export data'
        });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
    try {
        // Auto-submit all expired in_progress/not_started sessions
        const now = new Date();
        const expiredSessions = await ExamSession.find({
            status: { $in: ['in_progress', 'not_started'] },
            endTime: { $lt: now }
        });

        for (const session of expiredSessions) {
            try {
                const responses = await Response.find({ sessionId: session._id }).lean();
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

                session.status = 'submitted';
                session.score = score;
                session.submittedAt = session.endTime;
                await session.save();
                console.log(`[Stats] Auto-submitted expired session ${session._id} with score ${score}`);
            } catch (err) {
                console.error(`[Stats] Failed to auto-submit session ${session._id}:`, err);
            }
        }

        const totalRegistrations = await Student.countDocuments();
        const totalSubmissions = await ExamSession.countDocuments({ status: 'submitted' });
        const inProgress = await ExamSession.countDocuments({ status: 'in_progress' });

        log(`DEBUG Stats: ${JSON.stringify({ totalRegistrations, totalSubmissions, inProgress })}`);
        const allSessions = await ExamSession.find().select('status').limit(5).lean();
        log(`DEBUG All Statuses (sample): ${JSON.stringify(allSessions.map(s => s.status))}`);

        // Get average score
        const submittedSessions = await ExamSession.find({ status: 'submitted' }).select('score').lean();
        const averageScore = submittedSessions.length > 0
            ? (submittedSessions.reduce((sum, s) => sum + s.score, 0) / submittedSessions.length).toFixed(2)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                totalRegistrations,
                totalSubmissions,
                inProgress,
                averageScore: parseFloat(averageScore)
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
};

module.exports = {
    adminLogin,
    getCandidates,
    getCandidateDetails,
    exportCandidates,
    getDashboardStats
};
