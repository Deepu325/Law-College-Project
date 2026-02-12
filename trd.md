# TRD – TECHNICAL REQUIREMENTS DOCUMENT

**Stack:** MERN
**Frontend:** React + Tailwind
**Backend:** Node.js + Express
**Database:** MongoDB
**Deployment:** Vercel (frontend) + Render (backend)

---

## ARCHITECTURE OVERVIEW
Frontend (React) -> API Layer (Express) -> MongoDB Database -> Email Service (NodeMailer)
**Stateless REST API.**

---

## DATABASE SCHEMA DESIGN
### Students Collection
```json
{
  "_id": "ObjectId",
  "fullName": "String",
  "email": "String (unique)",
  "phone": "String (unique)",
  "qualification": "String",
  "city": "String",
  "consent": "Boolean",
  "createdAt": "Date"
}
```

### Questions Collection
```json
{
  "_id": "ObjectId",
  "section": "RC | LEGAL",
  "passageId": "ObjectId (optional)",
  "questionText": "String",
  "options": ["A", "B", "C", "D"],
  "correctOption": "String",
  "marks": "Number"
}
```

### ExamSessions Collection
```json
{
  "_id": "ObjectId",
  "studentId": "ObjectId",
  "startTime": "Date",
  "endTime": "Date",
  "status": "IN_PROGRESS | SUBMITTED",
  "score": "Number"
}
```

### Responses Collection
```json
{
  "_id": "ObjectId",
  "sessionId": "ObjectId",
  "questionId": "ObjectId",
  "selectedOption": "String",
  "isCorrect": "Boolean"
}
```

### Admin Collection
```json
{
  "_id": "ObjectId",
  "email": "String",
  "passwordHash": "String",
  "role": "ADMIN"
}
```

---

## BACKEND REQUIREMENTS (Node + Express)
**Essential APIs:**
• POST /register
• GET /questions
• POST /save-answer
• POST /submit
• POST /admin/login
• GET /admin/candidates
• GET /admin/export

**Middleware:**
• Auth middleware (JWT)
• Timer validation middleware
• Duplicate attempt middleware

**Security:**
• Helmet, CORS, Express-rate-limit, Bcrypt, JWT

---

## FRONTEND REQUIREMENTS (React + Tailwind)
**Pages:**
• LandingPage, RegistrationPage, ExamPage, ThankYouPage, AdminLogin, AdminDashboard

**State Management:**
• React Context or Redux Toolkit
• Timer state synced with backend
• Auto-save via debounce

**Important:** Timer must NOT rely only on frontend.

---

## DEPLOYMENT
• **Frontend:** Vercel (Env variables for API URL)
• **Backend:** Render + MongoDB Atlas (HTTPS enforced)

---

## STATE MANAGEMENT STRATEGY
**React Context:**
• AuthContext (admin)
• ExamContext (timer, answers)
• Global error handler

**Auto-save:**
• Debounced API calls (500ms)

---

## THIRD-PARTY SERVICES
• **Email:** NodeMailer (SMTP) or SendGrid
• **Excel Export:** json2csv or exceljs
• **Security:** bcrypt, jsonwebtoken

---

## PERFORMANCE REQUIREMENTS
• API response < 500ms
• DB indexed on email, phone, studentId, sessionId
• **Load target:** 50 concurrent users minimum.
