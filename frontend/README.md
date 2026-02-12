# S-CLAT Frontend - Production Ready

## 🎯 Overview
React + Tailwind CSS frontend for S-CLAT Online Law Entrance Examination System.

## 📁 Folder Structure
```
frontend/
├── src/
│   ├── api/
│   │   ├── apiClient.js      # Axios configuration
│   │   └── examApi.js         # API service functions
│   ├── context/
│   │   └── ExamContext.jsx    # Exam state management
│   ├── pages/
│   │   ├── LandingPage.jsx    # Exam instructions
│   │   ├── RegistrationPage.jsx
│   │   ├── ExamPage.jsx       # Main exam interface
│   │   ├── ThankYouPage.jsx
│   │   ├── AdminLogin.jsx
│   │   └── AdminDashboard.jsx
│   ├── App.jsx                # Main app with routing
│   ├── main.jsx               # Entry point
│   └── index.css              # Tailwind + custom styles
├── .env.example
├── tailwind.config.js
└── package.json
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

For production:
```
VITE_API_URL=https://your-backend.render.com/api
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## 🎨 Design System (DRD Compliant)

### Colors
- **Primary Purple**: `#4B2E83` (brand-purple)
- **Gold CTA**: `#F4B400` (brand-gold)
- **Background**: `#F9F9FB` (bg-exam)
- **Text Dark**: `#1C1C1C`
- **Text Body**: `#4A4A4A`
- **Error Red**: `#D32F2F`
- **Success Green**: `#2E7D32`

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter, Poppins (sans-serif)

### Components
- Buttons: 6px border radius, no pill shapes
- Cards: 8px border radius, subtle shadows
- Inputs: Focus ring with brand-purple
- Timer: Color transitions (normal → warning → critical)

## 🔒 Security Features

✅ **Client-side Validation** - All inputs validated before submission
✅ **Duplicate Prevention** - Email/phone uniqueness enforced
✅ **Session Persistence** - Resume exam after refresh
✅ **Protected Routes** - Admin routes require JWT
✅ **Refresh Warning** - Warns before accidental page close
✅ **Token Management** - Automatic token refresh and logout

## ⏱️ Timer Implementation

### Server-Authoritative Timer
- Timer calculated from server `endTime`
- Countdown runs on client
- Every save-answer validates remaining time on server
- Auto-submit when timer reaches 0
- Cannot be bypassed via browser DevTools

### Timer States
- **Normal** (> 5 min): Purple, normal size
- **Warning** (1-5 min): Yellow, pulsing
- **Critical** (< 1 min): Red, large, pulsing

## 💾 Auto-Save Implementation

### Debounced Save
- Answer saved immediately to local state
- API call triggered on selection
- Visual "Saving..." indicator
- Non-blocking (exam continues if save fails)

### Session Recovery
- Session stored in localStorage
- Automatic resume on page refresh
- Validates remaining time on resume
- Redirects to thank-you if already submitted

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Question navigator hidden on mobile
- Touch-friendly option buttons
- Optimized for tablets and phones

## 🧪 Testing

### Test Registration
1. Go to `http://localhost:5173`
2. Click "Start Test"
3. Fill registration form
4. Verify duplicate attempt blocking (try same email twice)

### Test Exam Flow
1. Complete registration
2. Answer some questions
3. Refresh page → should resume
4. Wait for timer to expire → auto-submit
5. Manual submit → confirmation modal

### Test Admin Panel
1. Go to `/admin/login`
2. Login with admin credentials
3. View candidates table
4. Export Excel
5. Search functionality

## 🚀 Deployment (Vercel)

### Method 1: Vercel CLI
```bash
npm install -g vercel
cd frontend
vercel
```

### Method 2: GitHub Integration
1. Push code to GitHub
2. Import repository in Vercel
3. Set root directory to `frontend`
4. Add environment variable:
   - `VITE_API_URL` = Your Render backend URL

### Build Settings
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## 📦 Dependencies

### Core
- `react` - UI library
- `react-dom` - React DOM rendering
- `react-router-dom` - Client-side routing

### Styling
- `tailwindcss` - Utility-first CSS
- `postcss` - CSS processing
- `autoprefixer` - CSS vendor prefixes

### API & State
- `axios` - HTTP client
- React Context API - State management

### Icons
- `lucide-react` - Icon library

## 🎯 Key Features

### Landing Page
- Exam overview
- Instructions
- Important notices
- Start button

### Registration Page
- Form validation
- Duplicate detection
- Error handling
- Consent checkbox

### Exam Page
- Question display with passage support
- 4-option MCQ interface
- Question navigator grid
- Timer with color transitions
- Auto-save indicator
- Previous/Next navigation
- Submit confirmation modal
- Refresh warning

### Thank You Page
- Success message
- Next steps information
- No score display

### Admin Dashboard
- Statistics cards
- Candidates table
- Search functionality
- Excel export
- Logout

## ⚠️ Important Notes

1. **No Score Display**: Candidates never see their score
2. **One Attempt**: Enforced by backend (email + phone uniqueness)
3. **Timer Cannot Be Bypassed**: Server validates all time checks
4. **Auto-Submit**: Happens automatically when time expires
5. **Session Recovery**: Works only if time remaining

## 🔧 Troubleshooting

### CORS Errors
- Ensure backend `FRONTEND_URL` includes your Vercel domain
- Check backend CORS configuration

### API Connection Failed
- Verify `VITE_API_URL` in `.env`
- Check backend is running
- Inspect network tab for errors

### Timer Not Working
- Check browser console for errors
- Verify session data in localStorage
- Ensure backend returns correct `endTime`

### Auto-Save Not Working
- Check network tab for save-answer requests
- Verify sessionId is valid
- Check backend logs

## 📈 Performance Optimizations

- Code splitting with React.lazy (can be added)
- Debounced auto-save (500ms)
- Memoized components (can be added)
- Optimized images (if any)
- Minified production build

## 🎯 Production Checklist

- [ ] Set correct `VITE_API_URL` in Vercel
- [ ] Test registration flow
- [ ] Test duplicate attempt blocking
- [ ] Test timer expiry and auto-submit
- [ ] Test manual submit
- [ ] Test session recovery
- [ ] Test admin login
- [ ] Test Excel export
- [ ] Verify mobile responsiveness
- [ ] Check all error states
- [ ] Test with slow network

## 📞 Support

For issues or questions, contact the development team.

---

**Built following DRD specifications with institutional design principles.**
