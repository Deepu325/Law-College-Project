# 📘 DESIGN REQUIREMENTS DOCUMENT (DRD)

**Project:** S-CLAT – Online Law Entrance Examination System
**Version:** Final – Locked
**Timeline:** 3 Days
**Deployment:** Single College

---

## 1️⃣ DESIGN PHILOSOPHY
The system must feel: Official, Serious, Secure, Time-bound, Authority-driven, Minimal, Distraction-free.
It is a **controlled examination interface**, not a quiz app or EdTech product.

---

## 2️⃣ VISUAL STYLE DIRECTION
**Style Type:** Minimal Institutional Flat Design
**No:** Glassmorphism, Neumorphism, Brutalist, Heavy gradients, or Decorative clutter.

---

## 3️⃣ COLOUR SYSTEM (STRICT LOCK)
• **Primary Brand Purple:** `#4B2E83`
• **Gold (CTA / Highlights):** `#F4B400`
• **Background (Exam Pages):** `#F9F9FB`
• **White (Cards):** `#FFFFFF`
• **Dark Text:** `#1C1C1C`
• **Body Text:** `#4A4A4A`
• **Error Red:** `#D32F2F`
• **Success Green (Admin only):** `#2E7D32`

---

## 4️⃣ TYPOGRAPHY SYSTEM
• **Heading Font:** Playfair Display (serif – authority)
• **Body Font:** Inter or Poppins
• **Heading Sizes:** H1: 36px, H2: 28px, H3: 22px
• **Question Text:** 18px (line-height: 1.6, max-width: 750px)
• **Options:** 16px

---

## 5️⃣ SPACING & BORDER RADIUS
• **8px Rule:** 8, 16, 24, 32, 48, 64, 96px
• **Cards/Blocks:** 8px radius
• **Buttons/Inputs:** 6px radius (No pill shapes)

---

## 6️⃣ SHADOW & ICON SYSTEM
• **Shadows:** Very subtle (Card: `0px 6px 18px rgba(0,0,0,0.06)`)
• **Icons:** Lucide Icons (1.5px stroke, 18px–22px size)

---

## 7️⃣ PAGE-WISE DESIGN STRUCTURE
### A. Landing Page
• Header (Minimal)
• Exam Overview Card
• Instructions (Bullet points)
• Important Notice (Highlighted)
• Primary CTA: Gold button centered (“Start Test”)

### B. Registration Page
• Centered Form Card (Max width: 500px)
• Fields: Full Name, Email, Phone, Qualification, City, Consent Checkbox
• Error State: Red border + “Test already taken” alert box

### C. Exam Interface (Critical)
• **Top Bar (Sticky):** Exam Title, Timer (Red when < 5m), Candidate Name
• **Main Area:** Left (Question Area), Right (Optional Nav Grid)
• **Question Card:** Section Title, Number, Text, 4 Radio Options
• **Timer:** Fixed top right, bold, pulses at 1 min.
• **Buttons:** Previous/Next (outlined purple), Final Submit (gold)
• **Modal:** Confirmation modal on submit.

### D. Admin Panel
• Left Sidebar (Dashboard, Candidates, Export, Logout)
• Data Table: Rows for candidate info, Score, Submission Time, Details.

---

## 8️⃣ UX CONTROL RULES
• Disable right click (optional)
• Warn on refresh / Back navigation
• Auto-save indicator (small “Saved” text)
• Responsive: Mobile optimized exam view.

---

## 9️⃣ VISUAL TONE SUMMARY
S-CLAT must feel like a controlled law entrance test. Serious. Official. Final.
