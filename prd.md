# PRD – PRODUCT REQUIREMENTS DOCUMENT

**Product Name:** S-CLAT – Online Law Entrance Examination System

## PRODUCT OVERVIEW
### What is this product?
S-CLAT is a short-term, single-college, online entrance examination system integrated into the college website. It allows students to register, attempt a 60-minute MCQ-based law entrance test, and securely submit responses. Results are visible only to admin.

### Who is this product for?
**Primary Users:**
• Law aspirants applying to the college
**Secondary Users:**
• College Admission/Admin Team
**Internal Stakeholders:**
• College IT Team
• Project Owner

## PRODUCT GOALS
**Primary Goal:**
Conduct a secure, one-attempt-only online law entrance test.
**Secondary Goals:**
• Capture candidate leads
• Automate evaluation
• Reduce manual paper evaluation
• Provide exportable candidate data

## FEATURE LIST (WITH PRIORITY)
### P0 – CRITICAL (Must have for launch)
1. Landing Page with exam details
2. Registration with unique email + phone validation
3. One attempt enforcement
4. 60-minute strict server-validated timer
5. Section A – 2 RC passages (20 MCQs)
6. Section B – 10 Legal Reasoning MCQs
7. Auto-save answers
8. Resume after refresh
9. Auto-submit on timeout
10. Score auto-calculation
11. Admin-only score visibility
12. Email notification to admin
13. Admin dashboard
14. Excel export

### 🟡 P1 – IMPORTANT (Still Phase 1)
1. Search/filter candidates
2. View detailed responses
3. Submission timestamp tracking

## COMPLETE USER FLOW (CLICK-BY-CLICK)
### USER FLOW – CANDIDATE SIDE
**Step 1: Website**
User clicks “S-CLAT” button.
↓
**Step 2: Landing Page**
User reads instructions.
Click: “Start Test”
↓
**Step 3: Registration Page**
User fills: Name, Email, Phone, Qualification, City, Consent
Click: “Register & Start”
System checks: Fields filled? Valid email? Email exists? Phone exists?
If duplicate: Show: “Test already taken.”
If valid: Create student record, Create exam session, Redirect to exam
↓
**Step 4: Exam Page**
On load: Fetch questions, Start timer (based on DB timestamp)
User: Selects answers, Navigates between questions
Every selection: Auto-save to database
Refresh: Check remaining time, Resume exam, If expired → auto-submit
↓
**Step 5: Submit**
User clicks “Submit”
System: Validate time, Lock responses, Calculate score, Update status, Send email to admin
User sees: “Your test has been submitted successfully.” NO SCORE DISPLAYED.

### ADMIN FLOW
**Step 1: Admin Login**
Email + Password
↓
**Step 2: Dashboard**
View table: Name, Email, Phone, Qualification, City, Score, Submission Time
↓
**Admin Actions:**
• Click candidate → View responses
• Export → Excel download
• Search → Filter list
Only admin can see marks.

## EDGE CASES & ERROR STATES
### Registration Edge Cases
• Same email, different phone → Block
• Same phone, different email → Block
• SQL injection attempt → Reject
• Invalid email format → Error
• Page reload during registration → No duplicate creation
### Exam Edge Cases
1. User closes browser → Resume allowed if time remains
2. Internet disconnect → Resume
3. Timer manipulation attempt → Server validation wins
4. User tries to open in another tab → Same session enforced
5. Submit twice → Second submit rejected
6. Time expires during answering → Force submit
7. Question not answered → Save as null
### Admin Edge Cases
• Unauthorized route access → Redirect to login
• Session expiry → Force re-login
• Export empty dataset → Return empty file

## AUTHENTICATION & ACCESS CONTROL RULES
**Candidate:**
• No login system
• Identified by session + DB record
• One attempt enforced by Unique email and Unique phone
**Admin:**
• Role-based authentication
• Password hashed (bcrypt)
• JWT or secure session cookie
• Protected routes middleware

| Feature | Candidate | Admin |
| :--- | :---: | :---: |
| Take Test | ✅ | ❌ |
| View Score | ❌ | ✅ |
| Export Excel | ❌ | ✅ |
| View Responses | ❌ | ✅ |

## SUCCESS METRICS
1. 100% duplicate attempts blocked
2. Timer cannot be bypassed
3. No answer loss on refresh
4. Admin receives email within 30 seconds of submission
5. Excel export contains correct marks
6. System handles 50 concurrent users
