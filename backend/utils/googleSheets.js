/**
 * Google Sheets Integration via Google Apps Script
 * 
 * This utility sends exam submission data to a Google Sheet
 * in real time via a deployed Google Apps Script Web App.
 * 
 * SETUP:
 *   1. Create a Google Sheet with these columns:
 *      Name | Email | Mobile | City | Course | Score | Start Time | End Time | Submission Time
 *   2. Go to Extensions > Apps Script
 *   3. Paste the Apps Script code (see google_apps_script.js in /scripts)
 *   4. Deploy as Web App (Execute as: Me, Access: Anyone)
 *   5. Copy the deployment URL and set it as GOOGLE_SHEETS_WEBHOOK_URL in .env
 */

const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL || '';

/**
 * Sanitize input to prevent injection
 */
const sanitize = (value) => {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/[<>]/g, '') // Strip HTML tags
        .trim()
        .substring(0, 500); // Limit length
};

/**
 * Format a Date to IST string
 */
const formatToIST = (date) => {
    if (!date) return 'N/A';
    try {
        return new Date(date).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    } catch {
        return 'N/A';
    }
};

/**
 * Send submission data to Google Sheets via Apps Script Web App
 * 
 * @param {Object} data - The submission data
 * @param {string} data.name - Candidate full name
 * @param {string} data.email - Candidate email
 * @param {string} data.mobile - Candidate phone number
 * @param {string} data.city - Candidate city
 * @param {string} data.course - Course applied for
 * @param {number} data.score - Exam score
 * @param {string|Date} data.startTime - Exam start time
 * @param {string|Date} data.endTime - Exam end time
 * @param {string|Date} data.submissionTime - Submission timestamp
 * @returns {Promise<Object>} - Response from Google Apps Script
 */
const sendToGoogleSheets = async (data) => {
    if (!GOOGLE_SHEETS_URL) {
        console.warn('[Google Sheets] GOOGLE_SHEETS_WEBHOOK_URL is not configured. Skipping sync.');
        return { success: false, reason: 'URL not configured' };
    }

    // Validate required fields
    if (!data.name || !data.email || !data.mobile) {
        console.warn('[Google Sheets] Missing required fields. Skipping sync.');
        return { success: false, reason: 'Missing required fields' };
    }

    // Sanitize all inputs
    const payload = {
        name: sanitize(data.name),
        email: sanitize(data.email),
        mobile: sanitize(data.mobile),
        city: sanitize(data.city),
        course: sanitize(data.course),
        score: typeof data.score === 'number' ? data.score : 0,
        startTime: formatToIST(data.startTime),
        endTime: formatToIST(data.endTime),
        submissionTime: formatToIST(data.submissionTime || new Date())
    };

    try {
        // Use dynamic import for fetch (Node 18+) or node-fetch
        const fetchFn = globalThis.fetch || (await import('node-fetch')).default;

        const response = await fetchFn(GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            // Follow redirects (Apps Script redirects on POST)
            redirect: 'follow',
            signal: AbortSignal.timeout(15000) // 15 second timeout
        });

        // Google Apps Script returns a redirect, so we handle both cases
        if (response.ok) {
            let result;
            try {
                result = await response.json();
            } catch {
                result = { status: 'ok', message: 'Data sent (non-JSON response)' };
            }
            console.log('[Google Sheets] ✅ Data synced successfully:', payload.name);
            return { success: true, data: result };
        } else {
            const errorText = await response.text();
            console.error('[Google Sheets] ❌ Sync failed:', response.status, errorText);
            return { success: false, reason: `HTTP ${response.status}: ${errorText}` };
        }
    } catch (error) {
        console.error('[Google Sheets] ❌ Network/API error:', error.message);
        return { success: false, reason: error.message };
    }
};

module.exports = { sendToGoogleSheets, formatToIST, sanitize };
