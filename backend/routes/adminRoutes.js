const express = require('express');
const router = express.Router();
const {
    adminLogin,
    getCandidates,
    getCandidateDetails,
    exportCandidates,
    getDashboardStats,
    clearAllData,
    toggleExamStatus,
    getExamStatus
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const { validateAdminLogin, checkValidation } = require('../utils/validators');

// Public route
router.post(
    '/login',
    validateAdminLogin,
    checkValidation,
    adminLogin
);

// Get current exam status (Public - used by both students and admin)
router.get('/status', getExamStatus);

// Protected routes (require authentication)
router.get('/candidates', authMiddleware, getCandidates);
router.get('/candidate/:sessionId', authMiddleware, getCandidateDetails);
router.get('/export', authMiddleware, exportCandidates);
router.get('/stats', authMiddleware, getDashboardStats);
router.delete('/clear-all-data', authMiddleware, clearAllData);
router.post('/toggle-status', authMiddleware, toggleExamStatus);

module.exports = router;
