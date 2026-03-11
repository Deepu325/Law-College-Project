/**
 * ============================================================
 * GOOGLE APPS SCRIPT — SLET Exam Google Sheets Webhook
 * ============================================================
 * 
 * INSTRUCTIONS:
 * 
 * 1. Open Google Sheets:
 *    - Create a new Google Sheet
 *    - Name the sheet tab "Submissions" (exactly)
 *    - Add headers in Row 1:
 *      A1: Name
 *      B1: Email
 *      C1: Mobile
 *      D1: City
 *      E1: Course
 *      F1: Score
 *      G1: Start Time
 *      H1: End Time
 *      I1: Submission Time
 *      J1: Received At
 * 
 * 2. Open Apps Script:
 *    - Go to Extensions > Apps Script
 *    - Delete any existing code
 *    - Paste this entire file content
 *    - Save (Ctrl+S)
 * 
 * 3. Deploy:
 *    - Click "Deploy" > "New Deployment"
 *    - Click the gear icon next to "Select type" > choose "Web app"
 *    - Set:
 *        Description: SLET Exam Webhook
 *        Execute as: Me
 *        Who has access: Anyone
 *    - Click "Deploy"
 *    - Authorize access when prompted
 *    - Copy the Web App URL
 * 
 * 4. Configure Backend:
 *    - Add the URL to your backend .env file:
 *      GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
 *    - Restart the backend server
 * 
 * ============================================================
 */

// Main handler for POST requests
function doPost(e) {
  try {
    // Only allow POST requests
    if (!e || !e.postData || !e.postData.contents) {
      return createResponse(400, 'error', 'No data received');
    }

    // Parse JSON payload
    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createResponse(400, 'error', 'Invalid JSON payload');
    }

    // Validate required fields
    if (!data.name || !data.email || !data.mobile) {
      return createResponse(400, 'error', 'Missing required fields: name, email, mobile');
    }

    // Sanitize inputs
    var name = sanitize(data.name);
    var email = sanitize(data.email);
    var mobile = sanitize(data.mobile);
    var city = sanitize(data.city || '');
    var course = sanitize(data.course || '');
    var score = typeof data.score === 'number' ? data.score : 0;
    var startTime = data.startTime || 'N/A';
    var endTime = data.endTime || 'N/A';
    var submissionTime = data.submissionTime || 'N/A';

    // Check for duplicate submission (same email within last 5 minutes)
    var sheet = getOrCreateSheet();
    var existingData = sheet.getDataRange().getValues();
    var now = new Date();

    for (var i = 1; i < existingData.length; i++) {
      var rowEmail = existingData[i][1]; // Column B = Email
      var rowTimestamp = existingData[i][9]; // Column J = Received At
      
      if (rowEmail === email && rowTimestamp) {
        var timeDiff = (now - new Date(rowTimestamp)) / 1000 / 60; // minutes
        if (timeDiff < 5) {
          return createResponse(409, 'duplicate', 'Duplicate submission detected within 5 minutes');
        }
      }
    }

    // Append row to sheet
    sheet.appendRow([
      name,
      email,
      mobile,
      city,
      course,
      score,
      startTime,
      endTime,
      submissionTime,
      now // Received At timestamp
    ]);

    // Auto-resize columns for readability  
    try {
      for (var col = 1; col <= 10; col++) {
        sheet.autoResizeColumn(col);
      }
    } catch (resizeErr) {
      // Non-critical, ignore
    }

    return createResponse(200, 'success', 'Data appended successfully');

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createResponse(500, 'error', 'Internal server error: ' + error.toString());
  }
}

// Handle GET requests (health check / test)
function doGet(e) {
  return createResponse(200, 'ok', 'SLET Google Sheets Webhook is active. Use POST to submit data.');
}

// Get or create the "Submissions" sheet
function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Submissions');

  if (!sheet) {
    sheet = ss.insertSheet('Submissions');
    // Add headers
    var headers = ['Name', 'Email', 'Mobile', 'City', 'Course', 'Score', 'Start Time', 'End Time', 'Submission Time', 'Received At'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Style headers
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4B2E83'); // Brand purple
    headerRange.setFontColor('#FFFFFF');
    headerRange.setHorizontalAlignment('center');

    // Freeze header row
    sheet.setFrozenRows(1);
  }

  return sheet;
}

// Sanitize string input
function sanitize(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/[<>]/g, '')
    .replace(/=/g, '') // Prevent formula injection
    .trim()
    .substring(0, 500);
}

// Create a JSON response
function createResponse(code, status, message) {
  var output = JSON.stringify({
    code: code,
    status: status,
    message: message,
    timestamp: new Date().toISOString()
  });

  return ContentService
    .createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}
