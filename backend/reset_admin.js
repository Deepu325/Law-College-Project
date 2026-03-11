require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function reset() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'admin@college.edu';
        const newPassword = 'admin12345';

        let admin = await Admin.findOne({ email });
        if (admin) {
            admin.passwordHash = newPassword;
            await admin.save();
            console.log(`✅ Password reset successfully for ${email}`);
            console.log(`Email: ${email}`);
            console.log(`Password: ${newPassword}`);
        } else {
            console.log(`❌ Admin ${email} not found.`);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
reset();
