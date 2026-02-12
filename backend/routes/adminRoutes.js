const express = require('express');
const router = express.Router();
const {
    adminLogin,
    getCandidates,
    getCandidateDetails,
    exportCandidates,
    getDashboardStats
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

// Protected routes (require authentication)
router.get('/candidates', authMiddleware, getCandidates);
router.get('/candidate/:sessionId', authMiddleware, getCandidateDetails);
router.get('/export', authMiddleware, exportCandidates);
router.get('/stats', authMiddleware, getDashboardStats);

module.exports = router;
