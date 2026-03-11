require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const check = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const admins = await Admin.find().lean();
    console.log('Admins found:', admins.map(a => a.email));
    process.exit(0);
};

check();
