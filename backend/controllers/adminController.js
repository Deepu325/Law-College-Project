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
const Settings = require('../models/Settings'); // Added Settings model
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');
const { sendToGoogleSheets } = require('../utils/googleSheets');

// Existing controllers...
// [Keeping existing adminLogin, getCandidates, etc. but updating clearAllData]

// @desc    Admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email: email.toLowerCase() })
            .select('+passwordHash');

        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isPasswordValid = await admin.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Update login tracking atomically
        const updatedAdmin = await Admin.findByIdAndUpdate(
            admin._id,
            { 
                $inc: { loginCount: 1 },
                $set: { lastLogin: new Date() }
            },
            { new: true }
        );

        const token = jwt.sign(
            { 
                id: updatedAdmin._id, 
                email: updatedAdmin.email, 
                role: updatedAdmin.role,
                loginCount: updatedAdmin.loginCount 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                admin: { 
                    id: updatedAdmin._id, 
                    email: updatedAdmin.email, 
                    role: updatedAdmin.role,
                    loginCount: updatedAdmin.loginCount,
                    lastLogin: updatedAdmin.lastLogin
                }
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};

// ... [getCandidates, getCandidateDetails, exportCandidates, getDashboardStats omitted for brevity but remain the same]

// @desc    Get all candidates with scores
const getCandidates = async (req, res) => {
    try {
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
            } catch (err) {
                console.error(`Failed to auto-submit session ${session._id}:`, err);
            }
        }

        const { search, status } = req.query;
        let query = {};
        if (status) query.status = status;

        let sessions = await ExamSession.find(query)
            .populate('studentId', 'fullName email phone qualification state city')
            .sort({ createdAt: -1 })
            .lean();

        if (search) {
            const searchLower = search.toLowerCase();
            sessions = sessions.filter(session => {
                const student = session.studentId;
                return (
                    student.fullName.toLowerCase().includes(searchLower) ||
                    student.email.toLowerCase().includes(searchLower) ||
                    student.phone.includes(searchLower)
                );
            });
        }

        const candidates = sessions.map(session => ({
            sessionId: session._id,
            fullName: session.studentId.fullName,
            email: session.studentId.email,
            phone: session.studentId.phone,
            qualification: session.studentId.qualification,
            state: session.studentId.state,
            city: session.studentId.city,
            score: session.score,
            status: session.status,
            exam_started_at: session.exam_started_at,
            submittedAt: session.submittedAt
        }));

        res.status(200).json({ success: true, data: { candidates, total: candidates.length } });
    } catch (error) {
        console.error('Get candidates error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch candidates' });
    }
};

const getCandidateDetails = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await ExamSession.findById(sessionId).populate('studentId').lean();
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const responses = await Response.find({ sessionId }).populate('questionId').sort({ 'questionId.questionNumber': 1 }).lean();

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
                student: session.studentId,
                session: { score: session.score, status: session.status },
                responses: formattedResponses
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch details' });
    }
};

const exportCandidates = async (req, res) => {
    try {
        const sessions = await ExamSession.find({ status: 'submitted' }).populate('studentId').sort({ submittedAt: -1 }).lean();
        if (sessions.length === 0) return res.status(404).json({ success: false, message: 'No submissions found' });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('SLET Results');
        worksheet.columns = [
            { header: 'S.No', key: 'sno', width: 8 },
            { header: 'Full Name', key: 'fullName', width: 25 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Course', key: 'qualification', width: 20 },
            { header: 'Score', key: 'score', width: 10 }
        ];

        sessions.forEach((session, index) => {
            worksheet.addRow({
                sno: index + 1,
                fullName: session.studentId.fullName,
                email: session.studentId.email,
                phone: session.studentId.phone,
                qualification: session.studentId.qualification,
                score: session.score
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=SCLAT_Results.xlsx');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Export failed' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const totalRegistrations = await Student.countDocuments();
        const totalSubmissions = await ExamSession.countDocuments({ status: 'submitted' });
        const inProgress = await ExamSession.countDocuments({ status: 'in_progress' });
        
        const submittedSessions = await ExamSession.find({ status: 'submitted' }).select('score').lean();
        const averageScore = submittedSessions.length > 0
            ? (submittedSessions.reduce((sum, s) => sum + s.score, 0) / submittedSessions.length).toFixed(2)
            : 0;

        let adminStats = null;
        if (req.user && req.user.role === 'SUPER_ADMIN') {
            const admins = await Admin.find({}).select('email role loginCount lastLogin');
            adminStats = admins.map(a => ({
                email: a.email,
                role: a.role,
                loginCount: a.loginCount || 0,
                lastLogin: a.lastLogin
            }));
        }

        res.status(200).json({
            success: true,
            data: { 
                totalRegistrations, 
                totalSubmissions, 
                inProgress, 
                averageScore: parseFloat(averageScore),
                adminStats
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, message: 'Stats failed' });
    }
};

// @desc    Clear all exam data (Students, Sessions, Responses)
// @route   DELETE /api/admin/clear-all-data
// @access  Private (Super Admin only)
const clearAllData = async (req, res) => {
    try {
        // Role Check
        if (req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only Super Admin can clear data.'
            });
        }

        log(`CRITICAL: Super Admin ${req.user.email} triggered CLEAR ALL DATA`);
        
        await Response.deleteMany({});
        await ExamSession.deleteMany({});
        await Student.deleteMany({});

        res.status(200).json({
            success: true,
            message: 'All exam data has been successfully cleared by Super Admin.'
        });
    } catch (error) {
        console.error('Clear all data error:', error);
        res.status(500).json({ success: false, message: 'Failed to clear data' });
    }
};

// @desc    Toggle exam pause/resume
// @route   POST /api/admin/toggle-exam-status
// @access  Private (Super Admin only)
const toggleExamStatus = async (req, res) => {
    try {
        if (req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        const { status } = req.body; // 'paused' or 'active'
        
        await Settings.findOneAndUpdate(
            { key: 'exam_status' },
            { value: status, updatedBy: req.user.id },
            { upsert: true, new: true }
        );

        log(`SYSTEM: Exam status changed to ${status} by ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: `Exam has been ${status === 'paused' ? 'PAUSED' : 'RESUMED'}.`,
            data: { status }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update status' });
    }
};

// @desc    Get current exam status
const getExamStatus = async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: 'exam_status' });
        res.status(200).json({
            success: true,
            status: setting ? setting.value : 'active'
        });
    } catch (error) {
        res.status(500).json({ success: false, status: 'active' });
    }
};

module.exports = {
    adminLogin,
    getCandidates,
    getCandidateDetails,
    exportCandidates,
    getDashboardStats,
    clearAllData,
    toggleExamStatus,
    getExamStatus
};
