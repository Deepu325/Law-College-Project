# Exam Start Time Tracking Implementation

## Overview
This implementation adds exam start time tracking to the Online Law Entrance Exam system. The system now records when a candidate clicks the "Start Exam" button and displays this information in the admin dashboard.

## Changes Made

### 1. Database Model (Backend)
**File**: `backend/models/ExamSession.js`

Added new field:
```javascript
exam_started_at: {
    type: Date,
    default: null
}
```

This field stores the exact timestamp when the candidate clicks "Start Exam".

### 2. Exam Controller (Backend)
**File**: `backend/controllers/examController.js`

Updated `startExamActivity` function to:
- Set `exam_started_at = current timestamp` when status changes from 'not_started' to 'in_progress'
- Return `exam_started_at` in the response
- Preserve the start time on resume (does not reset if already set)

### 3. Admin Controller (Backend)
**File**: `backend/controllers/adminController.js`

Updated two functions:

#### getCandidates()
- Added `exam_started_at` to candidate data object
- Ensures start time is included in API response

#### exportCandidates()
- Added "Start Time" column to Excel export (position 9)
- Formats timestamp as: DD/MM/YYYY HH:MM AM/PM
- Shows "-" if exam not started

### 4. Frontend Utility
**File**: `frontend/src/utils/dateFormatter.js`

Created `formatExamTime()` function:
- Converts ISO date to readable format: DD/MM/YYYY HH:MM AM/PM
- Returns "-" for null/undefined dates
- Handles 12-hour time format with AM/PM

### 5. Admin Dashboard (Frontend)
**File**: `frontend/src/pages/AdminDashboard.jsx`

Updated table display:
- Added "Start Time" column header
- Added "Start Time" column data with formatted timestamp
- Updated "Submitted At" column to use formatExamTime utility
- Imported formatExamTime utility

## Data Flow

### When Candidate Starts Exam
1. Candidate clicks "Start Exam" button
2. Frontend calls `startExamAPI(sessionId)`
3. Backend `startExamActivity` sets:
   - `status = 'in_progress'`
   - `exam_started_at = current timestamp`
   - `startTime = current timestamp`
   - Recalculates `endTime` based on duration
4. Response includes `exam_started_at`

### When Candidate Resumes Exam
1. System checks if `exam_started_at` exists
2. If exists, does NOT reset it (preserves original start time)
3. Exam continues with original start time

### When Candidate Submits Exam
1. `submittedAt` is set to current timestamp
2. Both `exam_started_at` and `submittedAt` are recorded
3. Admin can see complete timing information

### Admin Dashboard Display
1. Fetches candidates with `exam_started_at` field
2. Formats both timestamps using `formatExamTime()`
3. Shows "-" for exams not started
4. Shows both times for submitted exams

## Edge Cases Handled

| Scenario | Start Time | Submitted Time |
|----------|-----------|----------------|
| Not started | - | - |
| In progress | Shows time | - |
| Submitted | Shows time | Shows time |
| Resumed | Original time | - (until submitted) |

## Excel Export Format

New column order:
1. S.No
2. Full Name
3. Email
4. Phone
5. Course Applied
6. State
7. City
8. Score
9. **Start Time** (NEW)
10. Submission Time

Example:
```
1 | Deepu KC | deepu6@gmail.com | 7474744544 | B.A LL.B | Karnataka | Bangalore | 30 | 11/03/2026 1:00 PM | 11/03/2026 1:42 PM
```

## Migration

For existing exam sessions, run the migration script:

```bash
node backend/scripts/migrateExamStartedAt.js
```

This script:
- Sets `exam_started_at = startTime` for all submitted exams
- Sets `exam_started_at = startTime` for all in-progress exams
- Leaves `exam_started_at = null` for not_started exams

## API Response Examples

### Start Exam Response
```json
{
  "success": true,
  "message": "Exam started",
  "data": {
    "status": "in_progress",
    "startTime": "2026-03-11T13:00:00.000Z",
    "endTime": "2026-03-11T14:00:00.000Z",
    "exam_started_at": "2026-03-11T13:00:00.000Z"
  }
}
```

### Get Candidates Response
```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "sessionId": "...",
        "fullName": "Deepu KC",
        "email": "deepu6@gmail.com",
        "phone": "7474744544",
        "qualification": "B.A LL.B",
        "state": "Karnataka",
        "city": "Bangalore",
        "score": 30,
        "status": "submitted",
        "exam_started_at": "2026-03-11T13:00:00.000Z",
        "submittedAt": "2026-03-11T13:42:00.000Z"
      }
    ]
  }
}
```

## Time Format Examples

- Input: `2026-03-11T13:05:00.000Z`
- Output: `11/03/2026 1:05 PM`

- Input: `null` or `undefined`
- Output: `-`

## Testing Checklist

- [ ] Start exam and verify `exam_started_at` is recorded
- [ ] Resume exam and verify start time is not reset
- [ ] Submit exam and verify both times are recorded
- [ ] Check admin dashboard displays formatted times
- [ ] Export to Excel and verify Start Time column
- [ ] Verify "-" displays for not started exams
- [ ] Run migration script on existing data
- [ ] Test with different timezones (IST format)

## Files Modified

1. `backend/models/ExamSession.js` - Added exam_started_at field
2. `backend/controllers/examController.js` - Updated startExamActivity
3. `backend/controllers/adminController.js` - Updated getCandidates and exportCandidates
4. `frontend/src/pages/AdminDashboard.jsx` - Added Start Time column
5. `frontend/src/utils/dateFormatter.js` - Created new utility (NEW)
6. `backend/scripts/migrateExamStartedAt.js` - Migration script (NEW)

## Backward Compatibility

- Existing exams without `exam_started_at` will show "-" in admin dashboard
- Migration script can populate historical data
- No breaking changes to existing APIs
