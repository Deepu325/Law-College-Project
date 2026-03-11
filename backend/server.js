require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const examRoutes = require('./routes/examRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Set security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// CORS - Strict whitelist
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // High limit for development
    message: {
        success: false,
        message: 'Too many registration attempts. Please try again later.'
    }
});

app.use('/api/', limiter);
app.use('/api/register', registrationLimiter);

// MongoDB injection prevention
app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized request from ${req.ip}: ${key}`);
    },
}));

// ============================================
// BODY PARSING & LOGGING
// ============================================

// Body parser
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// TEMPORARY DEBUG ROUTE - remove after fixing
app.get('/debug/sessions', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const ExamSession = require('./models/ExamSession');
        const db = mongoose.connection;

        // Raw MongoDB query (bypasses Mongoose schema)
        const rawSessions = await db.db.collection('examsessions').find({}).project({ status: 1 }).toArray();

        // Mongoose query
        const mongooseSessions = await ExamSession.find().select('status').lean();

        // Mongoose filtered query
        const submittedSessions = await ExamSession.countDocuments({ status: 'submitted' });

        res.json({
            dbName: db.name,
            rawCount: rawSessions.length,
            rawStatuses: rawSessions.map(s => s.status),
            mongooseCount: mongooseSessions.length,
            mongooseStatuses: mongooseSessions.map(s => s.status),
            submittedCount: submittedSessions,
            collectionName: ExamSession.collection.name
        });
    } catch (err) {
        res.json({ error: err.message, stack: err.stack });
    }
});

// API routes
app.use('/api/admin', adminRoutes);
app.use('/api', examRoutes);

// 404 handler
app.use('*', (req, res) => {
    console.warn(`[404] ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎓 SLET Backend Server Running                   ║
║                                                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}                              ║
║   Port: ${PORT}                                          ║
║   Time: ${new Date().toLocaleString()}      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('⚠️ Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('🔴 UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('🔴 UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

module.exports = app;
