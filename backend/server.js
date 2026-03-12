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

// Set trust proxy for Render/Vercel
app.set('trust proxy', 1);

// Connect to database
connectDB();

// ============================================
// CORS - Must be BEFORE other middleware
// ============================================

const allowedOrigins = [
    'https://law-college-project.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

// Add any extra origins from env (comma-separated)
if (process.env.FRONTEND_URL) {
    process.env.FRONTEND_URL.split(',').forEach(url => {
        const trimmed = url.trim();
        if (trimmed && !allowedOrigins.includes(trimmed)) {
            allowedOrigins.push(trimmed);
        }
    });
}

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, server-to-server)
        if (!origin) return callback(null, true);

        if (
            allowedOrigins.includes(origin) || 
            origin.endsWith('.vercel.app') || 
            origin.includes('vercel.app')
        ) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
};

// Apply CORS BEFORE anything else
app.use(cors(corsOptions));

// Explicitly handle OPTIONS preflight for ALL routes
app.options('*', cors(corsOptions));

// Helmet - Set security headers (AFTER cors)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, 
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased for stability
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// MongoDB injection prevention
app.use(mongoSanitize({
    replaceWith: '_',
}));

// Body parser
app.use(express.json({ limit: '10kb' }));
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

// Suppress favicon logs
app.get('/favicon.ico', (req, res) => res.status(204));

// Root-level routes for frontend compatibility
app.get('/config', (req, res) => {
    res.json({
        success: true,
        data: {
            duration: parseInt(process.env.EXAM_DURATION_MINUTES) || 60,
            startTime: process.env.EXAM_START_TIME,
            stopTime: process.env.EXAM_STOP_TIME,
            currentTime: new Date()
        }
    });
});

// Map root level /register to the exam router
app.use('/register', examRoutes);
app.use('/questions', examRoutes);
app.use('/responses', examRoutes);

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
