require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await Admin.countDocuments();
        const admins = await Admin.find({}, 'email');
        console.log(`TOTAL_ADMINS: ${count}`);
        if (count > 0) {
            console.log('ADMIN_EMAILS:', admins.map(a => a.email).join(', '));
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
