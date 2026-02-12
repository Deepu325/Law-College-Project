# 🚀 DEPLOYMENT GUIDE - S-CLAT System

## Prerequisites

Before deployment, ensure you have:
- [ ] GitHub account
- [ ] MongoDB Atlas account (free tier works)
- [ ] Render account (for backend)
- [ ] Vercel account (for frontend)
- [ ] Gmail account with App Password OR SendGrid account
- [ ] Domain name (optional, Vercel provides free subdomain)

---

## STEP 1: MongoDB Atlas Setup

### 1.1 Create Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up / Log in
3. Click "Build a Database"
4. Choose FREE tier (M0)
5. Select region closest to your users
6. Click "Create Cluster"

### 1.2 Create Database User
1. Go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `sclat_admin`
5. Password: Generate strong password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 1.3 Whitelist IP Addresses
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Confirm

### 1.4 Get Connection String
1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Copy connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `sclat`

Example:
```
mongodb+srv://sclat_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sclat?retryWrites=true&w=majority
```

---

## STEP 2: Email Configuration

### Option A: Gmail SMTP (Easier for Testing)

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Security → 2-Step Verification → Turn On

2. **Generate App Password**
   - Go to Google Account → Security
   - 2-Step Verification → App passwords
   - Select app: Mail
   - Select device: Other (Custom name) → "S-CLAT"
   - Click Generate
   - Copy the 16-character password

3. **SMTP Settings**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

### Option B: SendGrid (Recommended for Production)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify your sender email
3. Create API Key
4. SMTP Settings:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   ```

---

## STEP 3: Backend Deployment (Render)

### 3.1 Push Code to GitHub
```bash
cd "d:\LAW Clg project\website"
git init
git add .
git commit -m "Initial commit: S-CLAT system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sclat-system.git
git push -u origin main
```

### 3.2 Create Render Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `sclat-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 3.3 Add Environment Variables
Click "Advanced" → "Add Environment Variable"

```
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generate-strong-random-string-here>
JWT_EXPIRES_IN=24h
ADMIN_EMAIL=admin@yourcollege.edu
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your-email@gmail.com>
SMTP_PASS=<your-app-password>
FRONTEND_URL=https://sclat-frontend.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EXAM_DURATION_MINUTES=60
```

**Generate JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://sclat-backend.onrender.com`

### 3.5 Seed Database
1. Go to Render Dashboard → Your Service → "Shell"
2. Run:
```bash
npm run seed:questions
npm run create:admin
```
3. Enter admin email and password when prompted

### 3.6 Test Backend
```bash
curl https://sclat-backend.onrender.com/health
```

Should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "...",
  "environment": "production"
}
```

---

## STEP 4: Frontend Deployment (Vercel)

### 4.1 Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 4.2 Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4.3 Add Environment Variable
1. Go to "Environment Variables"
2. Add:
   ```
   VITE_API_URL=https://sclat-backend.onrender.com/api
   ```
3. Apply to: Production, Preview, Development

### 4.4 Deploy
1. Click "Deploy"
2. Wait for deployment (2-3 minutes)
3. Note your frontend URL: `https://sclat-frontend.vercel.app`

### 4.5 Update Backend CORS
1. Go back to Render → Your Backend Service
2. Update environment variable:
   ```
   FRONTEND_URL=https://sclat-frontend.vercel.app
   ```
3. Service will auto-redeploy

---

## STEP 5: Post-Deployment Testing

### 5.1 Test Registration Flow
1. Go to `https://sclat-frontend.vercel.app`
2. Click "Start Test"
3. Fill registration form
4. Verify exam page loads
5. Answer a few questions
6. Verify auto-save works (check "Saving..." indicator)

### 5.2 Test Duplicate Prevention
1. Try registering with same email → Should fail
2. Try registering with same phone → Should fail

### 5.3 Test Timer
1. Register and start exam
2. Verify timer counts down
3. Refresh page → Should resume with correct time
4. (Optional) Reduce `EXAM_DURATION_MINUTES` to 1 for quick test

### 5.4 Test Submit
1. Complete exam
2. Click "Submit Exam"
3. Confirm in modal
4. Verify redirect to thank you page
5. Check admin email for notification

### 5.5 Test Admin Panel
1. Go to `https://sclat-frontend.vercel.app/admin/login`
2. Login with admin credentials
3. Verify candidates appear in table
4. Test search functionality
5. Click "Export Excel" → Verify download

---

## STEP 6: Custom Domain (Optional)

### 6.1 Frontend Domain
1. In Vercel → Your Project → Settings → Domains
2. Add your domain (e.g., `exam.yourcollege.edu`)
3. Follow DNS configuration instructions
4. Update backend `FRONTEND_URL` to your custom domain

### 6.2 Backend Domain
1. In Render → Your Service → Settings → Custom Domain
2. Add your domain (e.g., `api.yourcollege.edu`)
3. Follow DNS configuration instructions
4. Update frontend `VITE_API_URL` to your custom domain

---

## STEP 7: Production Monitoring

### 7.1 Render Monitoring
- Go to Render Dashboard → Your Service → Metrics
- Monitor CPU, Memory, Response Time
- Check Logs for errors

### 7.2 Vercel Analytics
- Go to Vercel Dashboard → Your Project → Analytics
- Monitor page views, performance

### 7.3 MongoDB Monitoring
- Go to MongoDB Atlas → Metrics
- Monitor connections, operations, storage

---

## STEP 8: Backup & Recovery

### 8.1 Database Backup
1. MongoDB Atlas → Clusters → Backup
2. Enable Cloud Backup (paid feature)
OR
3. Export data manually:
```bash
mongodump --uri="<your-connection-string>"
```

### 8.2 Code Backup
- Code is backed up in GitHub
- Render and Vercel auto-deploy from GitHub

---

## 🎯 PRODUCTION READINESS CHECKLIST

### Security
- [ ] JWT_SECRET is strong random string (64+ characters)
- [ ] MONGODB_URI contains correct password
- [ ] SMTP credentials are valid
- [ ] CORS whitelist includes only your frontend domain
- [ ] HTTPS is enforced (automatic on Vercel/Render)
- [ ] Admin password is strong (min 8 chars, mixed case, numbers, symbols)

### Functionality
- [ ] Questions are seeded (30 questions)
- [ ] Admin account created
- [ ] Registration works
- [ ] Duplicate prevention works
- [ ] Timer counts down correctly
- [ ] Auto-save works
- [ ] Auto-submit on timeout works
- [ ] Manual submit works
- [ ] Email notification received
- [ ] Admin login works
- [ ] Candidates table displays correctly
- [ ] Excel export works
- [ ] Search works

### Performance
- [ ] Backend responds in < 500ms
- [ ] Frontend loads in < 2 seconds
- [ ] Auto-save latency < 200ms
- [ ] Tested with 5+ concurrent users

### Documentation
- [ ] README.md reviewed
- [ ] Environment variables documented
- [ ] Deployment steps documented
- [ ] Admin credentials stored securely

---

## 🚨 TROUBLESHOOTING

### Backend won't start
- Check Render logs for errors
- Verify all environment variables are set
- Verify MongoDB connection string is correct

### Frontend can't connect to backend
- Check browser console for CORS errors
- Verify `VITE_API_URL` is correct
- Verify backend `FRONTEND_URL` matches Vercel domain

### Email not sending
- Check Render logs for email errors
- Verify SMTP credentials
- Test with Gmail first, then switch to SendGrid

### Database connection failed
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string format
- Verify database user has correct permissions

### Timer not working
- Check browser console for errors
- Verify session data in localStorage
- Check backend logs for timer validation errors

---

## 📞 SUPPORT CONTACTS

- **MongoDB Issues**: https://www.mongodb.com/cloud/atlas/support
- **Render Issues**: https://render.com/docs
- **Vercel Issues**: https://vercel.com/support
- **SendGrid Issues**: https://sendgrid.com/support

---

## 🎉 DEPLOYMENT COMPLETE!

Your S-CLAT system is now live and ready for production use!

**Frontend URL**: `https://sclat-frontend.vercel.app`
**Backend URL**: `https://sclat-backend.onrender.com`
**Admin Panel**: `https://sclat-frontend.vercel.app/admin/login`

**Next Steps**:
1. Share exam link with candidates
2. Monitor submissions in admin panel
3. Export results after exam completion
4. Backup database regularly

---

**Deployed by**: Senior Full Stack Architect
**Date**: 2026-02-12
**Status**: ✅ PRODUCTION READY
