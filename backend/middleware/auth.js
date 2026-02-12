const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token format.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if admin exists
            const admin = await Admin.findById(decoded.id);

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Access denied. Admin not found.'
                });
            }

            // Attach admin to request
            req.admin = {
                id: admin._id,
                email: admin.email,
                role: admin.role
            };

            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please login again.'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

module.exports = authMiddleware;
