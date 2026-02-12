const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Send submission notification to admin
const sendSubmissionEmail = async (candidateData) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `S-CLAT Submission: ${candidateData.fullName}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4B2E83; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; margin-top: 20px; }
            .info-row { margin: 10px 0; padding: 10px; background: white; }
            .label { font-weight: bold; color: #4B2E83; }
            .score { font-size: 24px; color: #2E7D32; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>S-CLAT Exam Submission</h2>
            </div>
            <div class="content">
              <div class="info-row">
                <span class="label">Candidate Name:</span> ${candidateData.fullName}
              </div>
              <div class="info-row">
                <span class="label">Email:</span> ${candidateData.email}
              </div>
              <div class="info-row">
                <span class="label">Phone:</span> ${candidateData.phone}
              </div>
              <div class="info-row">
                <span class="label">Qualification:</span> ${candidateData.qualification}
              </div>
              <div class="info-row">
                <span class="label">City:</span> ${candidateData.city}
              </div>
              <div class="info-row">
                <span class="label">Score:</span> <span class="score">${candidateData.score} / ${candidateData.totalMarks}</span>
              </div>
              <div class="info-row">
                <span class="label">Submission Time:</span> ${new Date(candidateData.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </div>
            </div>
          </div>
        </body>
        </html>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        // Don't throw error - email failure shouldn't block submission
        return { success: false, error: error.message };
    }
};

module.exports = { sendSubmissionEmail };
