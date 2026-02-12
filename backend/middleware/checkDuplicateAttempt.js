const Student = require('../models/Student');
const ExamSession = require('../models/ExamSession');

const checkDuplicateAttempt = async (req, res, next) => {
    try {
        const { email, phone } = req.body;

        if (!email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Email and phone are required'
            });
        }

        // Check for existing student with same email OR phone
        // This handles all duplicate scenarios:
        // - Same email, different phone
        // - Same phone, different email
        // - Same email and phone
        const existingStudent = await Student.findOne({
            $or: [
                { email: email.toLowerCase().trim() },
                { phone: phone.trim() }
            ]
        });

        if (existingStudent) {
            // Check if they have an exam session
            const existingSession = await ExamSession.findOne({
                studentId: existingStudent._id
            });

            if (existingSession) {
                // Determine which field matched
                let reason = 'This email or phone number has already been used.';

                if (existingStudent.email === email.toLowerCase().trim() &&
                    existingStudent.phone === phone.trim()) {
                    reason = 'You have already registered for this exam.';
                } else if (existingStudent.email === email.toLowerCase().trim()) {
                    reason = 'This email address has already been used for registration.';
                } else if (existingStudent.phone === phone.trim()) {
                    reason = 'This phone number has already been used for registration.';
                }

                return res.status(409).json({
                    success: false,
                    message: 'Test already taken.',
                    reason: reason,
                    duplicateAttempt: true
                });
            }
        }

        // No duplicate found, proceed
        next();
    } catch (error) {
        console.error('Duplicate check error:', error);

        // Handle MongoDB duplicate key errors (race condition safety)
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Test already taken.',
                reason: 'This email or phone number has already been used.',
                duplicateAttempt: true
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Registration validation failed'
        });
    }
};

module.exports = checkDuplicateAttempt;
