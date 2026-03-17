require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const connectDB = require('../config/database');

const seedProductionAdmins = async () => {
    try {
        // Connect to Database
        await connectDB();
        console.log('✅ Connected to MongoDB');

        // 1. Super Admin Data
        const admins = [
            {
                email: 'SA-sclat_admin@soundarya.edu',
                passwordHash: 'Soundarya@2026',
                role: 'SUPER_ADMIN'
            },
            {
                email: 'sclat_admin@soundarya.edu',
                passwordHash: 'Soundarya@2026',
                role: 'ADMIN'
            }
        ];

        console.log('\n--- Seeding Admins ---');

        for (const adminData of admins) {
            const emailLower = adminData.email.toLowerCase();
            const existingAdmin = await Admin.findOne({ email: emailLower });

            if (!existingAdmin) {
                await Admin.create({
                    email: emailLower,
                    passwordHash: adminData.passwordHash,
                    role: adminData.role
                });
                console.log(`✅ ${adminData.role} (${emailLower}) created successfully.`);
            } else {
                // Update role if it exists but role is different
                existingAdmin.role = adminData.role;
                // If you want to force reset password on seed, uncomment next line
                // existingAdmin.passwordHash = adminData.passwordHash;
                await existingAdmin.save();
                console.log(`ℹ️ ${adminData.role} (${emailLower}) already exists. Role verified/updated.`);
            }
        }

        console.log('\n✅ Seeding complete! You can now use these credentials in production.');
        console.log('\nSuper Admin Login: SA-sclat_admin@soundarya.edu');
        console.log('Normal Admin Login: sclat_admin@soundarya.edu');
        console.log('Password: (Password you provided)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        process.exit(1);
    }
};

seedProductionAdmins();
