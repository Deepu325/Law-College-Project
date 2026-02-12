# S-CLAT Backend - Production Ready

## 🎯 Overview
Secure, exam-grade backend for S-CLAT Online Law Entrance Examination System.

## 📁 Folder Structure
```
backend/
├── config/
│   └── database.js          # MongoDB connection with retry logic
├── controllers/
│   ├── examController.js    # Exam APIs (register, questions, save, submit)
│   └── adminController.js   # Admin APIs (login, candidates, export)
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── validateTimer.js     # Server-authoritative timer validation
│   ├── checkDuplicateAttempt.js  # Prevent duplicate registrations
│   └── errorHandler.js      # Centralized error handling
├── models/
│   ├── Student.js           # Student schema
│   ├── Question.js          # Question schema
│   ├── ExamSession.js       # Exam session with timer
│   ├── Response.js          # Student responses
│   └── Admin.js             # Admin with bcrypt hashing
├── routes/
│   ├── examRoutes.js        # Public exam routes
│   └── adminRoutes.js       # Protected admin routes
├── scripts/
│   ├── seedQuestions.js     # Seed 30 sample questions
│   └── createAdmin.js       # Create admin account
├── utils/
│   ├── email.js             # Email notifications
│   └── validators.js        # Input validation rules
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
└── server.js                # Main server file
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your values:
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Strong secret key
- `SMTP_*`: Email configuration
- `FRONTEND_URL`: Your Vercel frontend URL

### 3. Seed Questions
```bash
npm run seed:questions
```

### 4. Create Admin Account
```bash
npm run create:admin
```

### 5. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## 🔒 Security Features

✅ **Helmet** - Security headers
✅ **CORS** - Strict whitelist
✅ **Rate Limiting** - 100 req/15min, 5 registrations/hour
✅ **MongoDB Sanitization** - Injection prevention
✅ **Bcrypt** - Password hashing (12 rounds)
✅ **JWT** - Token-based admin auth
✅ **Input Validation** - express-validator
✅ **Timer Validation** - Server-authoritative
✅ **Duplicate Prevention** - Email + Phone uniqueness
✅ **Error Sanitization** - No internal errors exposed

## 📡 API Endpoints

### Public Routes

#### Register Student
```http
POST /api/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "qualification": "B.A. LL.B",
  "city": "Mumbai",
  "consent": true
}
```

#### Get Questions
```http
GET /api/questions
```

#### Save Answer
```http
POST /api/save-answer
Content-Type: application/json

{
  "sessionId": "507f1f77bcf86cd799439011",
  "questionId": "507f1f77bcf86cd799439012",
  "selectedOption": "A"
}
```

#### Submit Exam
```http
POST /api/submit
Content-Type: application/json

{
  "sessionId": "507f1f77bcf86cd799439011"
}
```

#### Get Session Status
```http
GET /api/session/:sessionId
```

### Admin Routes (Protected)

#### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@college.edu",
  "password": "your-password"
}
```

#### Get All Candidates
```http
GET /api/admin/candidates?search=john&status=SUBMITTED
Authorization: Bearer <token>
```

#### Get Candidate Details
```http
GET /api/admin/candidate/:sessionId
Authorization: Bearer <token>
```

#### Export to Excel
```http
GET /api/admin/export
Authorization: Bearer <token>
```

#### Get Dashboard Stats
```http
GET /api/admin/stats
Authorization: Bearer <token>
```

## 🛡️ Security Rules Enforced

1. **One Attempt Only**
   - Email uniqueness
   - Phone uniqueness
   - Session uniqueness per student
   - Race condition handling

2. **Timer Cannot Be Bypassed**
   - Server calculates endTime = startTime + 60 minutes
   - Every save-answer validates remaining time
   - Submit re-checks time
   - Auto-submit on expiry

3. **No Score Exposure**
   - Questions API excludes `correctOption`
   - Score calculated only on server
   - Score visible only to admin

4. **Duplicate Submit Prevention**
   - Status check before save-answer
   - Status check before submit
   - Atomic updates

## 📊 Database Indexes

```javascript
// Students
{ email: 1 } - unique
{ phone: 1 } - unique

// ExamSessions
{ studentId: 1 } - unique
{ studentId: 1, status: 1 } - compound

// Responses
{ sessionId: 1, questionId: 1 } - unique compound

// Questions
{ section: 1 }
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Test Registration
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "qualification": "B.A.",
    "city": "Delhi",
    "consent": true
  }'
```

## 🚀 Deployment (Render)

### 1. Create New Web Service
- Connect GitHub repository
- Select `backend` folder as root directory

### 2. Configure Build Settings
```
Build Command: npm install
Start Command: npm start
```

### 3. Environment Variables
Add all variables from `.env.example`

### 4. Advanced Settings
- Auto-Deploy: Yes
- Health Check Path: `/health`

## 📧 Email Configuration

### Using Gmail
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use in `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Using SendGrid (Recommended for Production)
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## ⚠️ Known Limitations

1. Email sending is non-blocking - submission succeeds even if email fails
2. No Redis session locking (optional enhancement)
3. No real-time proctoring
4. No video/audio recording

## 🔧 Troubleshooting

### MongoDB Connection Failed
- Check `MONGODB_URI` format
- Verify IP whitelist in MongoDB Atlas
- Check network connectivity

### Email Not Sending
- Verify SMTP credentials
- Check firewall/port blocking
- Review email logs in console

### Rate Limit Errors
- Adjust `RATE_LIMIT_MAX_REQUESTS` in `.env`
- Clear rate limit by restarting server

## 📈 Performance Optimizations

- Lean queries for read-only operations
- Indexed queries for fast lookups
- Projection to limit data transfer
- Connection pooling (Mongoose default)
- Debounced auto-save on frontend

## 🎯 Production Checklist

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Configure real SMTP credentials
- [ ] Set correct `FRONTEND_URL`
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Test all API endpoints
- [ ] Verify email delivery
- [ ] Test duplicate attempt blocking
- [ ] Test timer expiry
- [ ] Test Excel export
- [ ] Monitor error logs

## 📞 Support

For issues or questions, contact the development team.

---

**Built with security and reliability as top priorities.**
