require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/AdminSchema');

const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123';
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Super Admin';

const run = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error('MONGO_URI is required to provision super admin');
    }

    await mongoose.connect(mongoUri);

    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
    const emails = [
        process.env.SUPER_ADMIN_EMAIL || 'superadmin@awaamassist.com',
        'superadmin@awamassist.com'
    ];

    for (const email of emails) {
        const admin = await Admin.findOneAndUpdate(
            { admin_email: email.toLowerCase().trim() },
            {
                $set: {
                    admin_name: SUPER_ADMIN_NAME,
                    password: hashedPassword,
                    role: 'super_admin',
                    is_super_admin: true,
                    isApproved: true,
                    status: 'active',
                },
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        );

        console.log('Super admin ensured:', {
            id: admin._id.toString(),
            email: admin.admin_email,
            role: admin.role,
            isApproved: admin.isApproved,
            status: admin.status,
        });
    }
};

run()
    .catch((error) => {
        console.error('Failed to ensure super admin:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });