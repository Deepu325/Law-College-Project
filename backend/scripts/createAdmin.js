require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => {
    return new Promise(resolve => rl.question(query, resolve));
};

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get admin details
        console.log('=== Create Admin Account ===\n');

        const email = await question('Enter admin email: ');
        const password = await question('Enter admin password (min 6 characters): ');
        const confirmPassword = await question('Confirm password: ');

        // Validate inputs
        if (!email || !password) {
            console.error('❌ Email and password are required');
            process.exit(1);
        }

        if (password.length < 6) {
            console.error('❌ Password must be at least 6 characters');
            process.exit(1);
        }

        if (password !== confirmPassword) {
            console.error('❌ Passwords do not match');
            process.exit(1);
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
        if (existingAdmin) {
            console.error(`❌ Admin with email ${email} already exists`);
            process.exit(1);
        }

        // Create admin
        const admin = await Admin.create({
            email: email.toLowerCase().trim(),
            passwordHash: password, // Will be hashed by pre-save hook
            role: 'ADMIN'
        });

        console.log('\n✅ Admin account created successfully!');
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   ID: ${admin._id}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
};

createAdmin();
