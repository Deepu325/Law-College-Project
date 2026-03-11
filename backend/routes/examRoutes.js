const express = require('express');
const router = express.Router();
const {
    registerStudent,
    startExamActivity,
    getQuestions,
    saveAnswer,
    submitExam,
    getSessionStatus
} = require('../controllers/examController');
const checkDuplicateAttempt = require('../middleware/checkDuplicateAttempt');
const validateTimer = require('../middleware/validateTimer');
const {
    validateRegistration,
    validateAnswer,
    validateSubmit,
    checkValidation
} = require('../utils/validators');

// Public routes
router.post(
    '/register',
    validateRegistration,
    checkValidation,
    registerStudent
);

router.post('/start-exam', startExamActivity);

router.get('/questions', getQuestions);

router.post(
    '/save-answer',
    validateAnswer,
    checkValidation,
    validateTimer,
    saveAnswer
);

router.post(
    '/submit',
    validateSubmit,
    checkValidation,
    submitExam
);

router.get('/session/:sessionId', getSessionStatus);

module.exports = router;
